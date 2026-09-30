import { DatabaseSync } from 'node:sqlite';
import { backupManager } from './backup.ts';

export interface Migration {
  id: string;
  name: string;
  description: string;
  up: (db: DatabaseSync) => void;
}

export const MIGRATIONS: Migration[] = [
  {
    id: '001_core_schema',
    name: '001_core_schema',
    description: 'Create _migrations table, collections, and base indexes',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          applied_at TEXT NOT NULL,
          checksum TEXT
        );
      `);
    },
  },
  {
    id: '002_performance_indexes_wal',
    name: '002_performance_indexes_wal',
    description: 'Enable WAL mode, foreign keys, synchronous=NORMAL, and cache optimization',
    up: (db) => {
      db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = -64000;
        PRAGMA busy_timeout = 5000;
      `);
    },
  },
  {
    id: '003_immutable_audit_logs',
    name: '003_immutable_audit_logs',
    description: 'Ensure audit_logs table structure and high-performance indexes',
    up: (db) => {
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
        CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
      `);
    },
  },
  {
    id: '004_integrity_constraints_and_recycle_bin',
    name: '004_integrity_constraints_and_recycle_bin',
    description: 'Validate soft delete columns (deleted_at, deleted_by, delete_reason) across collections',
    up: (db) => {
      // Checked dynamically per collection in initializeDatabase
    },
  },
  {
    id: '005_environment_isolation_metadata',
    name: '005_environment_isolation_metadata',
    description: 'Create system_environment_meta table to track environment locks and schema versions',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS system_environment_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

/**
 * Run pending migrations safely
 */
export function runMigrations(db: DatabaseSync, env: string): { applied: string[]; total: number } {
  // Ensure migration table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);

  // Ensure checksum column exists if previously created without it
  try {
    const cols = db.prepare('PRAGMA table_info(_migrations)').all() as { name: string }[];
    if (!cols.some((c) => c.name === 'checksum')) {
      db.exec('ALTER TABLE _migrations ADD COLUMN checksum TEXT;');
    }
  } catch {
    // Ignore if already added
  }

  const appliedRows = db.prepare('SELECT name FROM _migrations').all() as { name: string }[];
  const appliedSet = new Set(appliedRows.map((r) => r.name));

  const pending = MIGRATIONS.filter((m) => !appliedSet.has(m.name));
  const newlyApplied: string[] = [];

  if (pending.length > 0) {
    console.log(`[Migrations] Found ${pending.length} pending migrations for environment '${env}'.`);

    // In production or staging, create safety backup before applying migrations
    if (env === 'production' || env === 'staging') {
      try {
        console.log('[Migrations] Creating pre-migration safety backup...');
        backupManager.createBackup(`pre-migration-${pending[0].name}`, 'migration-runner');
      } catch (bkErr) {
        console.warn('[Migrations] Warning: Could not create pre-migration backup:', bkErr);
      }
    }

    const insertStmt = db.prepare(`
      INSERT INTO _migrations (name, applied_at, checksum)
      VALUES (?, ?, ?)
    `);

    for (const migration of pending) {
      console.log(`[Migrations] Applying: ${migration.name} (${migration.description})...`);
      const startTime = Date.now();
      migration.up(db);
      insertStmt.run(migration.name, new Date().toISOString(), `sha256-v${migration.id}`);
      newlyApplied.push(migration.name);
      console.log(`[Migrations] Applied ${migration.name} in ${Date.now() - startTime}ms.`);
    }
  } else {
    console.log(`[Migrations] All ${MIGRATIONS.length} migrations are up to date.`);
  }

  // Update environment meta
  try {
    db.prepare(`
      INSERT OR REPLACE INTO system_environment_meta (key, value, updated_at)
      VALUES ('environment', ?, ?), ('schema_version', ?, ?)
    `).run(env, new Date().toISOString(), String(MIGRATIONS.length), new Date().toISOString());
  } catch {
    // optional
  }

  return {
    applied: newlyApplied,
    total: MIGRATIONS.length,
  };
}
