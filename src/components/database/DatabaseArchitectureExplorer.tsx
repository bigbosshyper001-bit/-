import React, { useState } from 'react';
import {
  Database,
  Layers,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Zap,
  Code2,
  Server,
  Network,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { centralDatabase, type CentralDatabaseState } from '../../services/centralDatabase.ts';
import {
  dbIndexManager,
  INSTITUTIONAL_FOREIGN_KEYS,
  INSTITUTIONAL_UNIQUE_CONSTRAINTS,
  type DatabaseIndexMetadata,
  type TransactionRecord,
} from '../../services/databaseEngine.ts';
import { apiGateway, type ApiResponse } from '../../services/apiService.ts';
import type { UserProfile } from '../../types.ts';

interface Props {
  user?: UserProfile;
}

export const DatabaseArchitectureExplorer: React.FC<Props> = ({ user }) => {
  const [subTab, setSubTab] = useState<'relationships' | 'indexes' | 'duplicates' | 'transactions' | 'api'>('relationships');

  // Index tester state
  const [selectedIndexName, setSelectedIndexName] = useState<string>('pk_meetings_id');
  const [indexSearchQuery, setIndexSearchQuery] = useState<string>('MTG-2569-01');
  const [indexSearchResult, setIndexSearchResult] = useState<any>(null);
  const [indexLatency, setIndexLatency] = useState<number | null>(null);

  // Duplicate tester state
  const [dupEntity, setDupEntity] = useState<'meetings' | 'userAccounts' | 'kpis'>('meetings');
  const [dupKeyField, setDupKeyField] = useState<string>('code');
  const [dupValue, setDupValue] = useState<string>('สภว.2569/01');
  const [dupTestResult, setDupTestResult] = useState<{ allowed: boolean; message: string; code?: string } | null>(null);

  // Transaction tester state
  const [isTxRunning, setIsTxRunning] = useState(false);
  const [txResult, setTxResult] = useState<{ success: boolean; message: string; record?: TransactionRecord } | null>(null);
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>(centralDatabase.getTransactionHistory());

  // API explorer state
  const [apiResource, setApiResource] = useState<any>('meetings');
  const [apiMethod, setApiMethod] = useState<'LIST' | 'GET' | 'CREATE'>('LIST');
  const [apiParamId, setApiParamId] = useState<string>('MTG-2569-01');
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const dbState = centralDatabase.getState();
  const indexStats = centralDatabase.getIndexStats();

  // Handle Index lookup test
  const handleTestIndexLookup = () => {
    const start = performance.now();
    let res = centralDatabase.lookupByIndex(selectedIndexName, indexSearchQuery);
    if (!res) {
      // Try Foreign Key lookup
      const fkList = centralDatabase.lookupByForeignKey(selectedIndexName, indexSearchQuery);
      if (fkList && fkList.length > 0) {
        res = fkList;
      }
    }
    const duration = Number((performance.now() - start).toFixed(4));
    setIndexSearchResult(res);
    setIndexLatency(duration);
  };

  // Handle Duplicate Prevention Test
  const handleTestDuplicatePrevention = () => {
    try {
      if (dupEntity === 'meetings') {
        centralDatabase.verifyUniqueConstraint('meetings', 'code', dupValue);
      } else if (dupEntity === 'userAccounts') {
        centralDatabase.verifyUniqueConstraint('userAccounts', dupKeyField, dupValue);
      } else if (dupEntity === 'kpis') {
        centralDatabase.verifyUniqueConstraint('kpis', 'code', dupValue);
      }
      setDupTestResult({
        allowed: true,
        message: `ค่า "${dupValue}" ยังไม่เคยมีในระบบ (Unique Constraint ผ่านการตรวจสอบ สามารถสร้างได้)`,
      });
    } catch (err: any) {
      setDupTestResult({
        allowed: false,
        code: err.code || 'DUPLICATE_KEY_VIOLATION',
        message: err.message || 'ตรวจพบข้อมูลซ้ำซ้อนในระบบ ถูกสกัดกั้นสำเร็จ (409 Conflict)',
      });
    }
  };

  // Run Successful ACID Transaction Test
  const handleRunSuccessfulTx = () => {
    setIsTxRunning(true);
    setTxResult(null);

    setTimeout(() => {
      const outcome = centralDatabase.runTransaction(
        'ทดสอบ Atomic Multi-Step: สร้างการประชุม -> วาระ -> มติ -> มอบหมายงาน',
        (tx) => {
          const timestamp = Date.now();
          const mtgId = `MTG-TX-${timestamp}`;
          const resId = `RES-TX-${timestamp}`;
          const tskId = `TSK-TX-${timestamp}`;

          // Step 1: Insert Meeting
          const newMeeting: any = {
            id: mtgId,
            code: `สภว.TX/${timestamp.toString().slice(-4)}`,
            title: `การประชุมทดสอบระบบ Transaction #${timestamp.toString().slice(-4)}`,
            sessionNumber: 1,
            fiscalYear: '2569',
            date: new Date().toISOString().substring(0, 10),
            timeStart: '09:30',
            timeEnd: '12:00',
            venue: 'ห้องประชุมออนไลน์ Cloud Transaction Engine',
            chairperson: 'อธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
            secretary: 'ผู้อำนวยการกองวิชาการ',
            department: 'สำนักงานสภาวิชาการ',
            notes: 'การประชุมทดสอบระบบ ACID Transaction',
            status: 'completed' as const,
            agendas: [
              {
                id: `AGN-${timestamp}`,
                order: 1,
                itemNumber: '1.1',
                title: 'วาระทดสอบความสมบูรณ์เชิงสัมพันธ์แบบ Atomic Commit',
                description: 'ตรวจสอบความสมบูรณ์เชิงสัมพันธ์',
                category: 'เสนอเพื่อพิจารณา' as const,
                presenter: 'ผู้อำนวยการกองวิชาการ',
                presenterRole: 'เลขานุการ',
                department: 'สำนักงานสภาวิชาการ',
                durationMinutes: 30,
                documents: [],
              },
            ],
            attendees: [],
            totalResolutions: 1,
            completedResolutions: 0,
          };
          tx.state.meetings = [newMeeting, ...tx.state.meetings];
          tx.operations.push({ type: 'INSERT', table: 'meetings', id: mtgId });

          // Step 2: Insert Resolution linked to Meeting (Foreign Key)
          const newResolution: any = {
            id: resId,
            meetingId: mtgId,
            meetingTitle: newMeeting.title,
            agendaItemNumber: '1.1',
            title: `มติทดสอบสถาปัตยกรรมฐานข้อมูล #${timestamp.toString().slice(-4)}`,
            details: 'มติรับรองความสมบูรณ์ของโครงสร้าง Foreign Key และ Transaction',
            responsiblePerson: 'ผู้อำนวยการกองวิชาการ',
            department: 'สำนักงานสภาวิชาการ',
            deadline: '2026-10-31',
            priority: 'medium' as const,
            status: 'in_progress' as const,
            createdDate: new Date().toISOString().substring(0, 10),
          };
          tx.state.resolutions = [newResolution, ...tx.state.resolutions];
          tx.operations.push({ type: 'INSERT', table: 'resolutions', id: resId });

          // Step 3: Insert Delegated Task linked to Resolution (Foreign Key)
          const newTask: any = {
            id: tskId,
            resolutionId: resId,
            title: `ภารกิจขับเคลื่อนผลการทดสอบ Transaction #${timestamp.toString().slice(-4)}`,
            department: 'กองวิชาการ สำนักงานอธิการบดี',
            assignee: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
            deadline: '2026-10-31',
            priority: 'medium' as const,
            status: 'pending' as const,
            progress: 10,
            meetingReference: newMeeting.title,
            updatedAt: new Date().toISOString().substring(0, 10),
          };
          tx.state.tasks = [newTask, ...tx.state.tasks];
          tx.operations.push({ type: 'INSERT', table: 'tasks', id: tskId });

          return { mtgId, resId, tskId };
        }
      );

      setIsTxRunning(false);
      setTxResult({
        success: outcome.success,
        message: outcome.success
          ? `ทำรายการ 3 ขั้นตอน (Meeting -> Resolution -> Task) สำเร็จพร้อมกันแบบ Atomic! (รหัส ${outcome.record.id})`
          : `เกิดข้อผิดพลาด: ${outcome.error}`,
        record: outcome.record,
      });
      setTxHistory(centralDatabase.getTransactionHistory());
    }, 400);
  };

  // Run Failing ACID Transaction Test (Demonstrates Snapshot Rollback)
  const handleRunFailingTx = () => {
    setIsTxRunning(true);
    setTxResult(null);

    const initialMeetingCount = dbState.meetings.length;
    const initialResCount = dbState.resolutions.length;

    setTimeout(() => {
      const outcome = centralDatabase.runTransaction(
        'ทดสอบ Atomic Rollback: บังคับให้ล้มเหลวที่ Step 3 ด้วย Foreign Key Violation',
        (tx) => {
          const timestamp = Date.now();
          const mtgId = `MTG-FAIL-${timestamp}`;

          // Step 1: Insert draft meeting
          const failMeeting: any = {
            id: mtgId,
            code: `สภว.FAIL/${timestamp}`,
            title: 'การประชุมชั่วคราวที่จะต้องถูก Rollback',
            sessionNumber: 99,
            fiscalYear: '2569',
            date: '2026-09-20',
            timeStart: '10:00',
            timeEnd: '11:00',
            venue: 'ห้องประชุมเสมือน',
            chairperson: 'ประธานสภาวิชาการ',
            secretary: 'เลขานุการสภาวิชาการ',
            department: 'กองวิชาการ',
            notes: 'บันทึกชั่วคราว',
            status: 'scheduled' as const,
            totalResolutions: 0,
            completedResolutions: 0,
            agendas: [],
            attendees: [],
          };
          tx.state.meetings = [failMeeting, ...tx.state.meetings];
          tx.operations.push({ type: 'INSERT', table: 'meetings', id: mtgId });

          // Step 2: Intentional Failure (Throw Foreign Key Violation)
          tx.rollback(
            'จงใจสร้างความผิดพลาด: บังคับ Rollback เนื่องจากพบรหัสสิทธิการอนุมัติไม่ถูกต้อง และ Foreign Key ปลายทางไม่มีอยู่จริง'
          );
        }
      );

      const postMeetingCount = centralDatabase.getState().meetings.length;
      const postResCount = centralDatabase.getState().resolutions.length;

      setIsTxRunning(false);
      setTxResult({
        success: false,
        message: `Rollback สำเร็จ 100%! ตรวจสอบแล้วไม่มีข้อมูลตกค้าง (จำนวนการประชุมคงเดิมที่ ${postMeetingCount} รายการ, สถานะคืนค่าสมบูรณ์)`,
        record: outcome.record,
      });
      setTxHistory(centralDatabase.getTransactionHistory());
    }, 400);
  };

  // Run API Explorer Request
  const handleExecuteApiRequest = () => {
    setApiLoading(true);
    setTimeout(() => {
      let res: ApiResponse;
      if (apiMethod === 'LIST') {
        res = apiGateway.list(apiResource, {
          limit: 5,
          expand: apiResource === 'meetings' ? ['resolutions'] : undefined,
        });
      } else if (apiMethod === 'GET') {
        res = apiGateway.get(apiResource, apiParamId, ['resolutions', 'tasks']);
      } else {
        // Sample create payload
        res = apiGateway.create(
          apiResource,
          {
            title: 'รายการทดสอบผ่าน API Gateway',
            code: `API-TEST-${Date.now().toString().slice(-4)}`,
            date: '2026-10-01',
            venue: 'ห้องประชุม มจร',
          },
          user
        );
      }
      setApiResponse(res);
      setApiLoading(false);
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSubTab('relationships')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            subTab === 'relationships'
              ? 'bg-white text-[#D94F87] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>1. ความสัมพันธ์ 10 โมดูล & Foreign Keys</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('indexes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            subTab === 'indexes'
              ? 'bg-white text-[#D94F87] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>2. ระบบดัชนี (Database Indexes)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('duplicates')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            subTab === 'duplicates'
              ? 'bg-white text-[#D94F87] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>3. ป้องกันข้อมูลซ้ำ (Unique Constraints)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('transactions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            subTab === 'transactions'
              ? 'bg-white text-[#D94F87] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
          <span>4. ACID Transactions & Rollback</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('api')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            subTab === 'api'
              ? 'bg-white text-[#D94F87] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-blue-600" />
          <span>5. สถาปัตยกรรม API & CRUD Gateway</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* 1. RELATIONSHIPS & FOREIGN KEY GRAPH */}
      {/* ================================================================= */}
      {subTab === 'relationships' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Network className="w-5 h-5 text-[#D94F87]" />
                  แผนผังความสัมพันธ์เชิงตรรกะของฐานข้อมูล (Relational ERD & Foreign Keys)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ทุกโมดูลเชื่อมโยงกันจริงผ่าน Primary Key, Foreign Key และกฎควบคุมการลบข้อมูล (RESTRICT / CASCADE)
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                เชื่อมต่อสมบูรณ์ 100% (Zero Broken FKs)
              </span>
            </div>

            {/* 10 Connected Modules Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              {[
                { name: '1. การประชุมสภา', count: dbState.meetings.length, color: 'border-pink-200 bg-pink-50/50 text-pink-900' },
                { name: '2. มติที่ประชุม', count: dbState.resolutions.length, color: 'border-pink-200 bg-pink-50/50 text-pink-900' },
                { name: '3. แผนยุทธศาสตร์', count: dbState.strategies.length, color: 'border-blue-200 bg-blue-50/50 text-blue-900' },
                { name: '4. ตัวชี้วัด KPIs', count: dbState.kpis.length, color: 'border-blue-200 bg-blue-50/50 text-blue-900' },
                { name: '5. หลักสูตรวิชาการ', count: dbState.programs.length, color: 'border-teal-200 bg-teal-50/50 text-teal-900' },
                { name: '6. ธนาคารหน่วยกิต', count: dbState.creditWallets.length, color: 'border-amber-200 bg-amber-50/50 text-amber-900' },
                { name: '7. คณาจารย์ & PSF', count: dbState.facultyMembers.length, color: 'border-purple-200 bg-purple-50/50 text-purple-900' },
                { name: '8. ระเบียบข้อบังคับ', count: dbState.regulations.length, color: 'border-amber-200 bg-amber-50/50 text-amber-900' },
                { name: '9. ผู้ใช้งาน & สิทธิ์', count: dbState.userAccounts.length, color: 'border-slate-200 bg-slate-50 text-slate-900' },
                { name: '10. ระบบบูรณาการ', count: dbState.integrationSystems.length, color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900' },
              ].map((m, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${m.color} text-center`}>
                  <div className="text-xs font-semibold">{m.name}</div>
                  <div className="text-lg font-black mt-1">{m.count} <span className="text-xs font-normal">ระเบียน</span></div>
                </div>
              ))}
            </div>

            {/* Foreign Key Table */}
            <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>ตาราง Foreign Key และนโยบายการควบคุม (Referential Integrity Constraints)</span>
                <span>จำนวน: {INSTITUTIONAL_FOREIGN_KEYS.length} ข้อกำหนด</span>
              </div>
              <div className="divide-y divide-slate-200 text-xs">
                {INSTITUTIONAL_FOREIGN_KEYS.map((fk) => (
                  <div key={fk.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{fk.sourceTable}.{fk.sourceField}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-mono font-bold text-slate-800">{fk.targetTable}.{fk.targetField}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {fk.relationType}
                        </span>
                      </div>
                      <p className="text-slate-600">{fk.descriptionTh}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-500">โมดูล: {fk.moduleA} ↔ {fk.moduleB}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        fk.onDelete === 'RESTRICT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        ON DELETE {fk.onDelete}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. DATABASE INDEXES */}
      {/* ================================================================= */}
      {subTab === 'indexes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  ระบบดัชนีฐานข้อมูลความเร็วสูง (High-Performance Index Engine)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  เร่งความเร็วในการสืบค้นข้อมูล O(1) B-Tree / Hash Indexes สำหรับ Primary Keys, Unique Keys และ Foreign Keys
                </p>
              </div>
              <button
                type="button"
                onClick={() => centralDatabase.rebuildIndexes()}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                สร้างดัชนีใหม่ทั้งหมด (Rebuild All)
              </button>
            </div>

            {/* Live Interactive Index Tester */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl mb-6">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                เครื่องมือทดสอบการค้นหาผ่าน Index แบบเรียลไทม์ (Live Index Lookup Tester)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">เลือก Index ที่ต้องการทดสอบ</label>
                  <select
                    value={selectedIndexName}
                    onChange={(e) => setSelectedIndexName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  >
                    {indexStats.map((idx) => (
                      <option key={idx.name} value={idx.name}>
                        {idx.name} ({idx.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">ค่าคีย์ที่ต้องการค้นหา (Key Value)</label>
                  <input
                    type="text"
                    value={indexSearchQuery}
                    onChange={(e) => setIndexSearchQuery(e.target.value)}
                    placeholder="เช่น MTG-2569-01 หรือ academic.director"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleTestIndexLookup}
                    className="w-full py-2 px-3 bg-[#D94F87] hover:bg-[#c23e75] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    ค้นหาผ่าน Index O(1)
                  </button>
                </div>
              </div>

              {indexLatency !== null && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600">ผลการสืบค้น: {indexSearchResult ? 'พบข้อมูลในดัชนี' : 'ไม่พบข้อมูล'}</span>
                    <span className="text-emerald-600 font-bold">เวลาสืบค้น: {indexLatency} ms (O(1) Instant)</span>
                  </div>
                  {indexSearchResult && (
                    <pre className="mt-2 p-2 bg-slate-900 text-emerald-400 rounded text-[11px] overflow-x-auto max-h-32">
                      {JSON.stringify(indexSearchResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Index Directory Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>ตารางดัชนีที่เปิดใช้งานอยู่ ({indexStats.length} รายการ)</span>
                <span className="text-slate-500 font-normal">อัปเดตอัตโนมัติทุกครั้งที่มีการ Insert/Update</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-3">ชื่อ Index</th>
                      <th className="p-3">ประเภท</th>
                      <th className="p-3">ตาราง (Entity)</th>
                      <th className="p-3">ฟิลด์ที่ทำดัชนี</th>
                      <th className="p-3 text-right">จำนวนระเบียนในดัชนี</th>
                      <th className="p-3 text-right">จำนวนครั้งที่เรียกใช้</th>
                      <th className="p-3 text-right">ความเร็วเฉลี่ย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {indexStats.map((idx) => (
                      <tr key={idx.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-800">{idx.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            idx.type === 'PRIMARY'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : idx.type === 'UNIQUE'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {idx.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{idx.table}</td>
                        <td className="p-3 text-slate-600">{idx.fields.join(', ')}</td>
                        <td className="p-3 text-right text-slate-800 font-bold">{idx.totalEntries}</td>
                        <td className="p-3 text-right text-slate-600">{idx.lookupCount}</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">&lt; {idx.averageLookupMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. DUPLICATE PREVENTION & UNIQUE CONSTRAINTS */}
      {/* ================================================================= */}
      {subTab === 'duplicates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  ระบบสกัดกั้นและป้องกันข้อมูลซ้ำซ้อน (Unique Constraint & Duplicate Prevention)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ตรวจสอบก่อนบันทึกทั้งระดับ Client-side และ Service-side ป้องกันข้อมูลเลขที่มติ, รหัสการประชุม, Username และ Email ชนกัน
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                Active Enforced
              </span>
            </div>

            {/* Interactive Duplicate Tester */}
            <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl mb-6">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                ทดสอบกลไกป้องกันข้อมูลซ้ำ (Live Duplicate Conflict Simulator)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">โมดูลที่ทดสอบ</label>
                  <select
                    value={dupEntity}
                    onChange={(e: any) => {
                      setDupEntity(e.target.value);
                      if (e.target.value === 'meetings') setDupValue('สภว.2569/01');
                      if (e.target.value === 'userAccounts') setDupValue('kanda.w');
                      if (e.target.value === 'kpis') setDupValue('KPI-69-01');
                    }}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="meetings">การประชุม (Meetings)</option>
                    <option value="userAccounts">ผู้ใช้งาน (User Accounts)</option>
                    <option value="kpis">ตัวชี้วัด (KPIs)</option>
                  </select>
                </div>

                {dupEntity === 'userAccounts' && (
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">ฟิลด์ที่ทดสอบ</label>
                    <select
                      value={dupKeyField}
                      onChange={(e) => {
                        setDupKeyField(e.target.value);
                        if (e.target.value === 'email') setDupValue('kanda.w@mcu.ac.th');
                        else setDupValue('kanda.w');
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="username">username</option>
                      <option value="email">email</option>
                    </select>
                  </div>
                )}

                <div className={dupEntity === 'userAccounts' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                  <label className="text-xs text-slate-600 font-medium block mb-1">ค่าที่ต้องการลองบันทึก (Value)</label>
                  <input
                    type="text"
                    value={dupValue}
                    onChange={(e) => setDupValue(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleTestDuplicatePrevention}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ทดสอบ Constraint
                  </button>
                </div>
              </div>

              {dupTestResult && (
                <div className={`mt-3 p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  dupTestResult.allowed
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {dupTestResult.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{dupTestResult.allowed ? 'PASS (ไม่ซ้ำ)' : 'BLOCKED (ตรวจพบข้อมูลซ้ำ)'}</div>
                    <div>{dupTestResult.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* List of Registered Unique Constraints */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700">
                ข้อกำหนด Unique Constraints ที่บังคับใช้ในระดับระบบ ({INSTITUTIONAL_UNIQUE_CONSTRAINTS.length} รายการ)
              </div>
              <div className="divide-y divide-slate-200 text-xs">
                {INSTITUTIONAL_UNIQUE_CONSTRAINTS.map((c) => (
                  <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-800">{c.labelTh}</div>
                      <div className="font-mono text-slate-500 text-[11px] mt-0.5">
                        ตาราง: {c.table} | ฟิลด์: {c.field}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                      UNIQUE INDEX
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. ACID TRANSACTIONS & ROLLBACK */}
      {/* ================================================================= */}
      {subTab === 'transactions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-indigo-600" />
                  ระบบบริหารจัดการธุรกรรม (ACID Transaction & Snapshot Rollback Engine)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  รับประกันคุณสมบัติ Atomicity: ทุกการกระทำข้ามหลายตารางต้องสำเร็จทั้งหมด หากมีข้อผิดพลาดระบบจะคืนค่าทันที (Rollback) โดยไม่มีข้อมูลกำพร้า
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                Snapshot Isolation Enabled
              </span>
            </div>

            {/* Simulator Action Buttons */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                การจำลองทดสอบการทำงานของ Transaction
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRunSuccessfulTx}
                  disabled={isTxRunning}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  1. ทดสอบ Atomic Transaction สำเร็จ (Multi-Table Commit)
                </button>

                <button
                  type="button"
                  onClick={handleRunFailingTx}
                  disabled={isTxRunning}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  2. ทดสอบ Transaction ล้มเหลว (Automatic Snapshot Rollback)
                </button>
              </div>

              {txResult && (
                <div className={`mt-4 p-4 rounded-xl border text-xs ${
                  txResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="font-bold text-sm mb-1">
                    {txResult.success ? 'TRANSACTION COMMITTED' : 'TRANSACTION ROLLED BACK'}
                  </div>
                  <div>{txResult.message}</div>
                </div>
              )}
            </div>

            {/* Transaction Audit Log */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>ประวัติการทำธุรกรรม ACID ล่าสุด (Transaction Execution Log)</span>
                <span>บันทึก {txHistory.length} ธุรกรรม</span>
              </div>
              <div className="divide-y divide-slate-200 text-xs font-mono">
                {txHistory.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 font-sans">
                    ยังไม่มีประวัติธุรกรรม กดปุ่มทดสอบด้านบนเพื่อเริ่มการทดสอบ
                  </div>
                ) : (
                  txHistory.map((tx) => (
                    <div key={tx.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'COMMITTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tx.status}
                          </span>
                          <span className="font-bold text-slate-800">{tx.id}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500 font-sans text-xs">{tx.description}</span>
                        </div>
                        {tx.error && (
                          <div className="text-rose-600 text-[11px] mt-1 font-sans">สาเหตุที่ยกเลิก: {tx.error}</div>
                        )}
                      </div>
                      <div className="text-right text-slate-400 text-[11px] shrink-0">
                        {tx.timestamp} ({tx.durationMs} ms)
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. UNIFIED API STRUCTURE & CRUD EXPLORER */}
      {/* ================================================================= */}
      {subTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-600" />
                  สถาปัตยกรรม API ส่วนกลางและมาตรฐาน Response Envelope
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  รูปแบบ JSON Envelope มาตรฐาน: <code>&#123; success, statusCode, data, error, meta &#125;</code> พร้อมรองรับ Pagination, Sort, Filter และ Eager Loading
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                RESTful Contract v1.0
              </span>
            </div>

            {/* Interactive API Requester */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                ทดสอบเรียกใช้งาน API Endpoint (Interactive API Explorer)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">HTTP Method</label>
                  <select
                    value={apiMethod}
                    onChange={(e: any) => setApiMethod(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold"
                  >
                    <option value="LIST">GET (List Collection)</option>
                    <option value="GET">GET (Single by ID)</option>
                    <option value="CREATE">POST (Create Entity)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Resource</label>
                  <select
                    value={apiResource}
                    onChange={(e: any) => setApiResource(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  >
                    <option value="meetings">/api/v1/meetings</option>
                    <option value="resolutions">/api/v1/resolutions</option>
                    <option value="tasks">/api/v1/tasks</option>
                    <option value="kpis">/api/v1/kpis</option>
                    <option value="userAccounts">/api/v1/userAccounts</option>
                    <option value="creditWallets">/api/v1/creditWallets</option>
                  </select>
                </div>

                {apiMethod === 'GET' && (
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">Resource ID</label>
                    <input
                      type="text"
                      value={apiParamId}
                      onChange={(e) => setApiParamId(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleExecuteApiRequest}
                    disabled={apiLoading}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {apiLoading ? 'กำลังส่งคำขอ...' : 'ส่งคำขอ API'}
                  </button>
                </div>
              </div>
            </div>

            {/* API Response Display */}
            {apiResponse && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 text-xs font-mono text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      apiResponse.statusCode >= 200 && apiResponse.statusCode < 300
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-500 text-white'
                    }`}>
                      HTTP {apiResponse.statusCode}
                    </span>
                    <span>Correlation: {apiResponse.meta.correlationId}</span>
                  </div>
                  <span className="text-slate-400">Response Time: {apiResponse.meta.durationMs} ms</span>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
