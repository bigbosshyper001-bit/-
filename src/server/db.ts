import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { appConfig } from './config.ts';
import { runMigrations } from './migrations.ts';
import {
  INITIAL_MEETINGS,
  INITIAL_RESOLUTIONS,
  INITIAL_TASKS,
  INITIAL_ORDERS,
  INITIAL_INVITATIONS,
} from '../data/meetingModuleData.ts';
import {
  INITIAL_STRATEGY_PILLARS,
  INITIAL_ACTION_PLANS,
  INITIAL_KPIS,
  INITIAL_RISKS,
  INITIAL_BUDGET_DATA,
} from '../data/strategyModuleData.ts';
import {
  INITIAL_FORM_DEFINITIONS,
  INITIAL_FORM_SUBMISSIONS,
} from '../data/formsModuleData.ts';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = appConfig.databasePath;
console.log(`[Database] Initializing persistent SQLite database for environment '${appConfig.env}' at: ${DB_PATH}`);

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode, foreign keys, synchronous=NORMAL, cache optimization
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -64000;
  PRAGMA busy_timeout = 5000;
`);

// Supported entity collections
export const SUPPORTED_COLLECTIONS = [
  'meetings',
  'resolutions',
  'tasks',
  'orders',
  'invitations',
  'strategy_pillars',
  'action_plans',
  'kpis',
  'risks',
  'budgets',
  'programs',
  'crosswalks',
  'short_courses',
  'partners',
  'pre_degree_students',
  'credit_wallets',
  'credit_transactions',
  'credit_transfers',
  'faculty_profiles',
  'competencies',
  'idp_steps',
  'portfolios',
  'mentor_reviews',
  'regulations',
  'documents',
  'forms',
  'form_submissions',
  'user_accounts',
  'notifications',
] as const;

export type SupportedCollection = typeof SUPPORTED_COLLECTIONS[number];

/**
 * Initialize all database tables and indexes
 */
export function initializeDatabase() {
  // Execute versioned schema migrations
  const migrationResult = runMigrations(db, appConfig.env);
  console.log(`[Database] Migration status: ${migrationResult.applied.length} applied, total ${migrationResult.total} active`);

  // Create audit_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT,
      timestamp TEXT NOT NULL,
      ip TEXT,
      details TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
  `);

  // Create tables for all collections
  for (const col of SUPPORTED_COLLECTIONS) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${col} (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        code TEXT,
        title TEXT,
        status TEXT,
        category TEXT,
        deleted_at TEXT,
        deleted_by TEXT,
        delete_reason TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_${col}_deleted ON ${col}(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_${col}_status ON ${col}(status);
      CREATE INDEX IF NOT EXISTS idx_${col}_code ON ${col}(code);
    `);
  }

  // Seed default user accounts if empty (so login & RBAC works)
  seedDefaultUserAccountsIfEmpty();

  // Operational data starts completely empty for production usage (no mock/demo records)

  console.log('[Database] Persistent schema verified and ready for production.');
}

/**
 * Default administrative accounts for authenticating users
 */
function seedDefaultUserAccountsIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM user_accounts').get() as { count: number };
  if (countRow.count > 0) return;

  const defaultUsers = [
    {
      id: 'usr-super',
      name: 'นายอดิศร มงคลสุข',
      username: 'superadmin',
      role: 'Super Admin',
      position: 'หัวหน้างานพัฒนาระบบเทคโนโลยีสารสนเทศ',
      department: 'สำนักเทคโนโลยีสารสนเทศ มจร',
      email: 'superadmin@mcu.ac.th',
      phone: '035-248-001',
      initials: 'SA',
      status: 'active',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-exec',
      name: 'พระพรหมบัณฑิต, ศ.ดร.',
      username: 'executive.council',
      role: 'ผู้บริหาร',
      position: 'ประธานคณะกรรมการสภาวิชาการ / กรรมการสภามหาวิทยาลัย',
      department: 'สำนักงานสภามหาวิทยาลัย มจร',
      email: 'executive.council@mcu.ac.th',
      phone: '035-248-010',
      initials: 'พบ',
      status: 'active',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-1',
      name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
      username: 'academic.director',
      role: 'หัวหน้ากอง',
      position: 'ผู้อำนวยการกองวิชาการ สำนักงานอธิการบดี',
      department: 'กองวิชาการ สำนักงานอธิการบดี',
      email: 'academic.director@mcu.ac.th',
      phone: '035-248-055',
      initials: 'ผอ',
      status: 'active',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-staff',
      name: 'นางสาวกานดา วิมลสิริ',
      username: 'kanda.w',
      role: 'เจ้าหน้าที่',
      position: 'นักวิชาการศึกษาชำนาญการ',
      department: 'กลุ่มงานมาตรฐานและพัฒนาหลักสูตร กองวิชาการ',
      email: 'kanda.w@mcu.ac.th',
      phone: '035-248-062',
      initials: 'กว',
      status: 'active',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-auditor',
      name: 'รศ.ดร. สุรพล สุยะพรหม',
      username: 'auditor.surapol',
      role: 'ผู้ตรวจสอบ',
      position: 'ผู้ทรงคุณวุฒิตรวจสอบวิชาการ / ผู้ประเมินคุณภาพภายใน',
      department: 'คณะกรรมการตรวจสอบและประเมินผล มจร',
      email: 'auditor.surapol@mcu.ac.th',
      phone: '035-248-088',
      initials: 'มท',
      status: 'active',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-general',
      name: 'นายอานนท์ ภักดี',
      username: 'arnon.p',
      role: 'ผู้ใช้งานทั่วไป',
      position: 'นิสิต/ผู้เรียนโครงการเรียนรู้ตลอดชีวิต',
      department: 'บุคคลภายนอก / ผู้เรียนสะสมหน่วยกิต',
      email: 'arnon.learner@gmail.com',
      phone: '081-987-6543',
      initials: 'อน',
      status: 'active',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
  ];

  const now = new Date().toISOString();
  const insertStmt = db.prepare(`
    INSERT INTO user_accounts (id, data, code, title, status, category, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of defaultUsers) {
    insertStmt.run(
      user.id,
      JSON.stringify(user),
      user.username,
      user.name,
      user.status,
      user.role,
      now,
      now
    );
  }
  console.log(`[Database] Seeded ${defaultUsers.length} initial administrative users.`);
}

/**
 * Seed operational records if collections are empty (meetings, kpis, action plans, etc.)
 */
function seedDefaultOperationalDataIfEmpty() {
  const now = new Date().toISOString();

  // Helper to insert into a generic collection table
  const insertItem = (table: string, id: string, data: any, code = '', title = '', status = '', category = '') => {
    try {
      const stmt = db.prepare(`
        INSERT INTO ${table} (id, data, code, title, status, category, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, JSON.stringify(data), code, title, status, category, now, now);
    } catch (err) {
      console.error(`[Database] Failed to seed into ${table}:`, err);
    }
  };

  // 1. Meetings
  const mtgCount = (db.prepare('SELECT COUNT(*) as count FROM meetings').get() as { count: number }).count;
  if (mtgCount === 0) {
    for (const mtg of INITIAL_MEETINGS) {
      insertItem('meetings', mtg.id, mtg, mtg.code, mtg.title, mtg.status, mtg.department);
    }
    console.log(`[Database] Seeded ${INITIAL_MEETINGS.length} meetings.`);
  }

  // 2. Resolutions
  const resCount = (db.prepare('SELECT COUNT(*) as count FROM resolutions').get() as { count: number }).count;
  if (resCount === 0) {
    for (const res of INITIAL_RESOLUTIONS) {
      insertItem('resolutions', res.id, res, res.agendaItemNumber, res.title, res.status, res.department);
    }
    console.log(`[Database] Seeded ${INITIAL_RESOLUTIONS.length} resolutions.`);
  }

  // 3. Tasks
  const taskCount = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count;
  if (taskCount === 0) {
    for (const task of INITIAL_TASKS) {
      insertItem('tasks', task.id, task, task.resolutionId, task.title, task.status, task.department);
    }
    console.log(`[Database] Seeded ${INITIAL_TASKS.length} tasks.`);
  }

  // 4. Orders
  const ordCount = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }).count;
  if (ordCount === 0) {
    for (const ord of INITIAL_ORDERS) {
      insertItem('orders', ord.id, ord, ord.orderNumber, ord.title, ord.status, ord.committeeType);
    }
    console.log(`[Database] Seeded ${INITIAL_ORDERS.length} orders.`);
  }

  // 5. Invitations
  const invCount = (db.prepare('SELECT COUNT(*) as count FROM invitations').get() as { count: number }).count;
  if (invCount === 0) {
    for (const inv of INITIAL_INVITATIONS) {
      insertItem('invitations', inv.id, inv, inv.letterNumber, inv.subject, inv.status, inv.meetingTitle);
    }
    console.log(`[Database] Seeded ${INITIAL_INVITATIONS.length} invitations.`);
  }

  // 6. Strategy Pillars
  const pillarCount = (db.prepare('SELECT COUNT(*) as count FROM strategy_pillars').get() as { count: number }).count;
  if (pillarCount === 0) {
    for (const pillar of INITIAL_STRATEGY_PILLARS) {
      insertItem('strategy_pillars', pillar.id, pillar, pillar.code, pillar.name, 'active', pillar.leader);
    }
    console.log(`[Database] Seeded ${INITIAL_STRATEGY_PILLARS.length} strategy pillars.`);
  }

  // 7. Action Plans
  const apCount = (db.prepare('SELECT COUNT(*) as count FROM action_plans').get() as { count: number }).count;
  if (apCount === 0) {
    for (const ap of INITIAL_ACTION_PLANS) {
      insertItem('action_plans', ap.id, ap, ap.code, ap.title, ap.status, ap.department);
    }
    console.log(`[Database] Seeded ${INITIAL_ACTION_PLANS.length} action plans.`);
  }

  // 8. KPIs
  const kpiCount = (db.prepare('SELECT COUNT(*) as count FROM kpis').get() as { count: number }).count;
  if (kpiCount === 0) {
    for (const kpi of INITIAL_KPIS) {
      insertItem('kpis', kpi.id, kpi, kpi.code, kpi.name, kpi.status, kpi.department);
    }
    console.log(`[Database] Seeded ${INITIAL_KPIS.length} KPIs.`);
  }

  // 9. Risks
  const riskCount = (db.prepare('SELECT COUNT(*) as count FROM risks').get() as { count: number }).count;
  if (riskCount === 0) {
    for (const rsk of INITIAL_RISKS) {
      insertItem('risks', rsk.id, rsk, rsk.id, rsk.name, rsk.status, rsk.department);
    }
    console.log(`[Database] Seeded ${INITIAL_RISKS.length} risks.`);
  }

  // 10. Budgets
  const bgCount = (db.prepare('SELECT COUNT(*) as count FROM budgets').get() as { count: number }).count;
  if (bgCount === 0) {
    insertItem('budgets', 'budget-2569', INITIAL_BUDGET_DATA, 'BG-2569', 'งบประมาณวิชาการประจำปี 2569', 'active', 'มหาวิทยาลัย');
    console.log('[Database] Seeded initial budget overview.');
  }

  // 11. Forms
  const formsCount = (db.prepare('SELECT COUNT(*) as count FROM forms').get() as { count: number }).count;
  if (formsCount === 0) {
    for (const f of INITIAL_FORM_DEFINITIONS) {
      insertItem('forms', f.id, f, f.code, f.title, f.status, f.category);
    }
    console.log(`[Database] Seeded ${INITIAL_FORM_DEFINITIONS.length} online forms.`);
  }

  // 12. Form Submissions
  const subsCount = (db.prepare('SELECT COUNT(*) as count FROM form_submissions').get() as { count: number }).count;
  if (subsCount === 0) {
    for (const s of INITIAL_FORM_SUBMISSIONS) {
      insertItem('form_submissions', s.id, s, s.submissionNo, s.formTitle, s.status, s.submitterRole);
    }
    console.log(`[Database] Seeded ${INITIAL_FORM_SUBMISSIONS.length} form submissions.`);
  }
}
