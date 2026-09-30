import React, { useState, useEffect } from 'react';
import {
  Network,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Code2,
  FileSpreadsheet,
  FileJson,
  Webhook,
  Database,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Activity,
  Send,
  Download,
  HelpCircle,
  Cpu,
  Layers,
  FileUp,
  Inbox,
  HardDrive,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  FileText,
  Mail,
  Key,
  Building2,
  Check,
  Info,
  Sliders,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';
import { centralDb } from '../services/centralDatabase.ts';
import { exportService } from '../services/exportService.ts';
import {
  integrationAdapterEngine,
  CORE_INTEGRATION_ADAPTERS,
} from '../services/integrationAdapterEngine.ts';
import type {
  IntegrationAdapterDefinition,
  IntegrationMode,
  OutboxQueueItem,
  BatchIngestionJob,
  SystemCategory,
} from '../types/integrationArchitecture.ts';
import type { SystemIntegrationLog } from '../types/architecture.ts';

type ActiveTabType = 'adapters' | 'architecture' | 'ingestion' | 'outbox' | 'simulator' | 'logs';

export const IntegrationsView: React.FC = () => {
  const [adapters, setAdapters] = useState<IntegrationAdapterDefinition[]>([]);
  const [selectedAdapter, setSelectedAdapter] = useState<IntegrationAdapterDefinition | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('adapters');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [apiFilter, setApiFilter] = useState<'all' | 'has_api' | 'no_api'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Feedback & Sync
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<{ id: string; message: string; success: boolean } | null>(null);

  // Outbox state
  const [outboxItems, setOutboxItems] = useState<OutboxQueueItem[]>([]);

  // Batch Ingestion state
  const [selectedIngestionAdapterId, setSelectedIngestionAdapterId] = useState<string>('adapter-hr-personnel');
  const [batchRawInput, setBatchRawInput] = useState<string>('');
  const [currentBatchJob, setCurrentBatchJob] = useState<BatchIngestionJob | null>(null);
  const [ingestionFileType, setIngestionFileType] = useState<'csv' | 'json'>('csv');

  // Simulator state
  const [simAdapterId, setSimAdapterId] = useState<string>('adapter-curriculum');
  const [simPayload, setSimPayload] = useState<string>('');
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Logs state
  const [logs, setLogs] = useState<SystemIntegrationLog[]>([]);
  const [logFilter, setLogFilter] = useState<string>('all');

  // Load initial data
  useEffect(() => {
    const list = integrationAdapterEngine.getAdapters();
    setAdapters(list);
    setOutboxItems(integrationAdapterEngine.getOutboxItems());

    // Preload simulator payload
    const curr = list.find((a) => a.id === 'adapter-curriculum');
    if (curr) {
      setSimPayload(curr.dataContract.sampleRequestPayload);
    }

    // Subscribe to centralDb logs
    const unsub = centralDb.subscribe((state) => {
      setLogs(state.integrationLogs);
    });
    return unsub;
  }, []);

  // Update simulator payload when adapter changes
  const handleSimAdapterChange = (id: string) => {
    setSimAdapterId(id);
    const target = adapters.find((a) => a.id === id);
    if (target) {
      setSimPayload(target.dataContract.sampleRequestPayload);
      setSimResult(null);
    }
  };

  // Switch adapter mode
  const handleModeChange = (adapterId: string, newMode: IntegrationMode) => {
    const success = integrationAdapterEngine.updateAdapterMode(adapterId, newMode);
    if (success) {
      const updatedList = integrationAdapterEngine.getAdapters();
      setAdapters(updatedList);
      if (selectedAdapter && selectedAdapter.id === adapterId) {
        setSelectedAdapter(updatedList.find((a) => a.id === adapterId) || null);
      }
      setSyncFeedback({
        id: adapterId,
        message: `เปลี่ยนโหมดการทำงานของ Adapter เป็น "${newMode}" สำเร็จ`,
        success: true,
      });
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  // Trigger manual sync / mock ping
  const handleTriggerSync = (adapter: IntegrationAdapterDefinition) => {
    setIsSyncing(adapter.id);
    setSyncFeedback(null);

    setTimeout(() => {
      const resultLog = centralDb.triggerIntegrationSync(adapter.id, 'REST API');
      setIsSyncing(null);
      setSyncFeedback({
        id: adapter.id,
        message: `ซิงก์ข้อมูล ${adapter.name} ผ่านโหมด ${adapter.currentMode} สำเร็จ`,
        success: true,
      });
      // Refresh outbox
      setOutboxItems(integrationAdapterEngine.getOutboxItems());
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 700);
  };

  // Ingestion: Load Template Sample
  const handleLoadSampleTemplate = () => {
    const target = adapters.find((a) => a.id === selectedIngestionAdapterId);
    if (!target) return;

    if (ingestionFileType === 'csv') {
      setBatchRawInput(target.stagingTemplate.sampleCsv);
    } else {
      setBatchRawInput(target.dataContract.sampleRequestPayload);
    }
    setCurrentBatchJob(null);
  };

  // Ingestion: Run Dry-Run
  const handleRunDryRun = () => {
    if (!batchRawInput.trim()) {
      alert('กรุณากรอกหรือวางข้อมูลก่อนทำการตรวจสอบ');
      return;
    }
    try {
      const job = integrationAdapterEngine.processBatchIngestion(
        selectedIngestionAdapterId,
        `upload_${Date.now()}.${ingestionFileType}`,
        batchRawInput,
        ingestionFileType
      );
      setCurrentBatchJob(job);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  // Ingestion: Commit Batch
  const handleCommitBatch = () => {
    if (!currentBatchJob) return;
    const res = integrationAdapterEngine.commitBatchJob(currentBatchJob.id);
    if (res.success) {
      setAdapters(integrationAdapterEngine.getAdapters());
      setSyncFeedback({
        id: selectedIngestionAdapterId,
        message: res.message,
        success: true,
      });
      setCurrentBatchJob(null);
      setBatchRawInput('');
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Outbox: Flush single item
  const handleFlushOutboxItem = (itemId: string) => {
    const res = integrationAdapterEngine.flushOutboxItem(itemId);
    if (res.success) {
      setOutboxItems(integrationAdapterEngine.getOutboxItems());
      setSyncFeedback({
        id: itemId,
        message: res.message,
        success: true,
      });
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  // Outbox: Flush all
  const handleFlushAllOutbox = () => {
    const count = integrationAdapterEngine.flushAllOutbox();
    setOutboxItems(integrationAdapterEngine.getOutboxItems());
    setSyncFeedback({
      id: 'outbox-all',
      message: `ประมวลผลส่งข้อมูลจาก Outbox Queue ทั้งหมด ${count} รายการเรียบร้อยแล้ว`,
      success: true,
    });
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Simulator: Run test call
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      const res = integrationAdapterEngine.simulateApiContractCall(simAdapterId, simPayload);
      setSimResult(res);
      setIsSimulating(false);
    }, 450);
  };

  // Export logs to Excel
  const handleExportLogs = () => {
    exportService.exportData('excel', {
      filename: `MCU-Integration-Audit-Logs-${new Date().toISOString().split('T')[0]}`,
      title: 'บันทึกประวัติการเชื่อมต่อและบูรณาการข้อมูลวิชาการ (Integration Audit Logs)',
      subject: 'Academic Affairs Integration Gateway',
      columns: [
        { key: 'timestamp', title: 'วัน-เวลา' },
        { key: 'systemName', title: 'ระบบภายนอก' },
        { key: 'protocol', title: 'โปรโตคอล' },
        { key: 'action', title: 'คำสั่ง/การทำงาน' },
        { key: 'recordsCount', title: 'จำนวนระเบียน' },
        { key: 'status', title: 'สถานะ' },
        { key: 'durationMs', title: 'ระยะเวลา (ms)' },
        { key: 'details', title: 'รายละเอียด' },
      ],
      data: logs,
    });
  };

  // Filtered adapters
  const filteredAdapters = adapters.filter((a) => {
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (apiFilter === 'has_api' && !a.hasLiveApi) return false;
    if (apiFilter === 'no_api' && a.hasLiveApi) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.nameEn.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.targetSystem.toLowerCase().includes(q) ||
      a.externalAgency.toLowerCase().includes(q)
    );
  });

  // Derived Stats
  const totalSystemsCount = adapters.length;
  const liveApiCount = adapters.filter((a) => a.hasLiveApi).length;
  const noApiAdapterCount = adapters.filter((a) => !a.hasLiveApi).length;
  const pendingOutboxCount = outboxItems.filter((o) => o.status === 'queued').length;
  const totalProcessedRecords = adapters.reduce((acc, a) => acc + a.syncStats.totalRecordsProcessed, 0);

  // Helper: Icon by Category
  const getCategoryIcon = (cat: SystemCategory) => {
    switch (cat) {
      case 'hr_personnel':
        return <Users className="w-4 h-4 text-sky-600" />;
      case 'curriculum':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'registrar_sis':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'credit_bank':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'qa_accreditation':
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case 'edocument_saraban':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'email_gateway':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'sso_identity':
        return <Key className="w-4 h-4 text-teal-600" />;
      case 'external_university_gov':
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  // Helper: Mode Badge
  const getModeBadge = (mode: IntegrationMode) => {
    switch (mode) {
      case 'LIVE_API':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live REST API
          </span>
        );
      case 'API_READY_CONTRACT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Code2 className="w-3 h-3 text-indigo-500" />
            API-Ready Contract
          </span>
        );
      case 'STAGING_DB_VIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Database className="w-3 h-3 text-amber-500" />
            Staging DB View
          </span>
        );
      case 'BATCH_FILE_EXCEL_CSV':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <FileSpreadsheet className="w-3 h-3 text-sky-500" />
            Batch Excel/CSV
          </span>
        );
      case 'SSO_FEDERATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Key className="w-3 h-3 text-teal-500" />
            SSO Federated (SAML/OIDC)
          </span>
        );
      case 'QUEUE_BUFFER_OUTBOX':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Inbox className="w-3 h-3 text-purple-500" />
            Outbox Buffer Queue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Standby Adapter
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Architectural Principle */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#FBE7EF] text-[#B83B6F] text-xs font-semibold">
              <Network className="w-4 h-4 text-[#D94F87]" />
              <span>External Integration & API-Ready Adapter Architecture</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ศูนย์เชื่อมโยงระบบภายนอกและสถาปัตยกรรม Integration Adapter
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              ออกแบบสถาปัตยกรรมเชื่อมโยงระบบสำคัญ 9 ระบบ (บุคลากร, หลักสูตร, ทะเบียน, Credit Bank, QA, สารบรรณ, Email, SSO, มหาวิทยาลัย/อว.) 
              <strong>โดยไม่สมมติว่าภายนอกมี API พร้อมใช้</strong> — รองรับการทำงานจริงทันทีผ่าน Batch File (Excel/CSV), Staging DB View, Outbox Queue 
              และเตรียม Data Contract ไว้พร้อมสลับเป็น Live REST/Webhook เมื่อภายนอกเปิด API
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportLogs}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>ส่งออกบันทึก (Excel)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ingestion')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 transition-colors shadow-2xs"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>นำเข้า Batch File (CSV/Excel)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#D94F87] rounded-xl hover:bg-[#B83B6F] transition-colors shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>API Contract Sandbox</span>
            </button>
          </div>
        </div>

        {/* Global Architecture Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">ระบบเป้าหมายทั้งหมด</span>
              <Building2 className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{totalSystemsCount}</span>
              <span className="text-xs text-slate-400">ระบบหลัก</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">มี Live REST API แล้ว</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-700">{liveApiCount}</span>
              <span className="text-xs text-slate-400">ระบบ (NCB, Email)</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">ยังไม่มี API (ใช้ Adapter)</span>
              <Sliders className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-amber-700">{noApiAdapterCount}</span>
              <span className="text-xs text-slate-400">ระบบ (Batch/Staging/Outbox)</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">คิว Outbox รอส่งออก</span>
              <Inbox className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-purple-700">{pendingOutboxCount}</span>
              <span className="text-xs text-slate-400">รายการ</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">ระเบียนข้อมูลบูรณาการ</span>
              <Activity className="w-4 h-4 text-[#D94F87]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{totalProcessedRecords.toLocaleString()}</span>
              <span className="text-xs text-slate-400">รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Toast Feedback */}
      {syncFeedback && (
        <div
          className={`px-4 py-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
            syncFeedback.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('adapters')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'adapters'
              ? 'bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>ระบบเชื่อมต่อ & Adapters ({adapters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>สถาปัตยกรรม & Data Contracts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ingestion')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'ingestion'
              ? 'bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileUp className="w-3.5 h-3.5" />
          <span>นำเข้า Batch (CSV/Excel Ingestion)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outbox')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'outbox'
              ? 'bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>คิวส่งออก Outbox Buffer ({pendingOutboxCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>เครื่องมือจำลอง API (Sandbox)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>บันทึก Integration Logs ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: Adapters Grid */}
      {activeTab === 'adapters' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาระบบ, หน่วยงาน, รหัส..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D94F87]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">ทุกหมวดหมู่ระบบ (9 ระบบ)</option>
                <option value="hr_personnel">ระบบบุคลากร (HR)</option>
                <option value="curriculum">ระบบหลักสูตร (Curriculum)</option>
                <option value="registrar_sis">ระบบทะเบียน (REG SIS)</option>
                <option value="credit_bank">Credit Bank (ธนาคารหน่วยกิต)</option>
                <option value="qa_accreditation">ระบบประกันคุณภาพ (QA)</option>
                <option value="edocument_saraban">ระบบเอกสาร/สารบรรณ</option>
                <option value="email_gateway">ระบบอีเมล (Email)</option>
                <option value="sso_identity">ระบบ SSO (MCU-Pass)</option>
                <option value="external_university_gov">ระบบส่วนกลาง/หน่วยงานภายนอก</option>
              </select>

              {/* API Readiness Filter */}
              <select
                value={apiFilter}
                onChange={(e) => setApiFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">สถานะ API ทุกประเภท</option>
                <option value="has_api">มี REST API เชื่อมต่อแล้ว (Live)</option>
                <option value="no_api">ยังไม่มี API (ผ่าน Integration Adapter)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              แสดง {filteredAdapters.length} จาก {adapters.length} ระบบ
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAdapters.map((adapter) => {
              const isSyncingThis = isSyncing === adapter.id;

              return (
                <div
                  key={adapter.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-[#D94F87]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Category Icon & API Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          {getCategoryIcon(adapter.category)}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {adapter.code}
                          </span>
                        </div>
                      </div>

                      {adapter.hasLiveApi ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          มี REST API
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Sliders className="w-3 h-3 text-amber-600" />
                          ยังไม่มี API → Adapter
                        </span>
                      )}
                    </div>

                    {/* System Name */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {adapter.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {adapter.nameEn}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{adapter.externalAgency}</span>
                      </p>
                    </div>

                    {/* Current Mode Badge & Explanation */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">โหมดการทำงานปัจจุบัน:</span>
                        {getModeBadge(adapter.currentMode)}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {adapter.whyNoApiReason}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div className="bg-slate-50/70 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">ระเบียนข้อมูล</span>
                        <span className="font-semibold text-slate-800">
                          {adapter.syncStats.totalRecordsProcessed.toLocaleString()} รายการ
                        </span>
                      </div>
                      <div className="bg-slate-50/70 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">ซิงก์ล่าสุด</span>
                        <span className="font-mono text-[11px] text-slate-700">
                          {adapter.syncStats.lastSyncAt.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAdapter(adapter)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#B83B6F] hover:text-[#912652]"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>ดูรายละเอียด & สลับโหมด</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIngestionAdapterId(adapter.id);
                          setActiveTab('ingestion');
                        }}
                        title="นำเข้าข้อมูลผ่านไฟล์ Batch"
                        className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors border border-slate-200"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerSync(adapter)}
                        disabled={isSyncingThis}
                        title="ทดสอบซิงก์ข้อมูล"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncingThis ? 'animate-spin text-[#D94F87]' : ''}`} />
                        <span>{isSyncingThis ? 'กำลังซิงก์...' : 'ซิงก์'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Architecture & Contracts Deep Dive */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Architectural Diagram Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D94F87]" />
              <span>ผังสถาปัตยกรรม Integration Adapter Layer (ไม่ต้องรอให้มี API)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
              สถาปัตยกรรมถูกออกแบบให้อยู่ในรูปแบบ <strong>Progressive Adaptation Pattern</strong> โดยมีชั้น 
              <span className="font-semibold text-slate-800"> MCU Integration Adapter Layer </span> 
              ทำหน้าที่เป็นตัวกลางในการแปลงสกีมาข้อมูล (Schema & Data Transformation), จัดการคิวส่งออก (Outbox Buffer), 
              และรองรับกลไกสำรอง (Fallback) หลากหลายระดับ ทำให้ระบบวิชาการไม่หยุดชะงักแม้ระบบภายนอกยังไม่มี API
            </p>

            {/* Visual Architecture Schematic */}
            <div className="bg-[#FAFAFC] rounded-xl border border-slate-200 p-4 sm:p-6 overflow-x-auto">
              <div className="min-w-[700px] flex items-stretch justify-between gap-4 text-center">
                {/* Layer 1: Core System */}
                <div className="w-1/3 bg-white rounded-xl border border-blue-200 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold">
                      Academic Core Layer
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">ระบบบริหารงานสภาวิชาการ</h4>
                    <p className="text-[11px] text-slate-500">
                      ศูนย์ข้อมูลกลาง (Central DB), วาระและมติสภา, หลักสูตร, อาจารย์, และตัวชี้วัดยุทธศาสตร์
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                    Internal Domain Model (TypeScript / PostgreSQL)
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center justify-center text-[#D94F87] font-semibold text-xs shrink-0">
                  <ArrowRight className="w-6 h-6" />
                  <span>Adapter Bus</span>
                </div>

                {/* Layer 2: Integration Adapter Layer */}
                <div className="w-1/3 bg-white rounded-xl border-2 border-[#D94F87]/60 p-4 shadow-2xs flex flex-col justify-between relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D94F87] text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-2xs">
                    INTEGRATION ADAPTER LAYER
                  </div>
                  <div className="space-y-2.5 mt-2">
                    <h4 className="text-sm font-bold text-[#B83B6F]">กลไก Adapter & คิวพักข้อมูล</h4>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-left">
                      <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
                        📁 Batch File Parser (CSV/Excel)
                      </div>
                      <div className="p-1.5 rounded bg-sky-50 border border-sky-200 text-sky-800">
                        🗄️ Staging DB View Poller
                      </div>
                      <div className="p-1.5 rounded bg-purple-50 border border-purple-200 text-purple-800">
                        📬 Outbox Buffer (Store-and-Forward)
                      </div>
                      <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                        ⚡ API-Ready REST Stub
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                    Schema Mapping • Deduplication • Conflict Resolver
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center justify-center text-slate-400 font-semibold text-xs shrink-0">
                  <ArrowRight className="w-6 h-6" />
                  <span>Protocols</span>
                </div>

                {/* Layer 3: External Reality */}
                <div className="w-1/3 bg-white rounded-xl border border-slate-300 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                      External Reality (9 Systems)
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">ระบบภายนอกมหาวิทยาลัย & กระทรวง</h4>
                    <p className="text-[11px] text-slate-500">
                      ระบบ HRIS ปิด, CHECO Web Portal, ทะเบียน Legacy, สารบรรณ On-Premise, National Credit Bank, SSO
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                    SFTP, Web Upload, Staging Tables, REST
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Contract Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>ตรวจสอบ Data Contract & สกีมาการแปลงฟิลด์ (Field Mapping Matrix)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เลือกระบบเพื่อดูโครงสร้างข้อมูล (DTO), ข้อกำหนด Endpoint และตารางแม็ปฟิลด์ต้นทาง-ปลายทาง
                </p>
              </div>

              <select
                value={selectedAdapter?.id || adapters[0]?.id}
                onChange={(e) => {
                  const found = adapters.find((a) => a.id === e.target.value);
                  if (found) setSelectedAdapter(found);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                {adapters.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Contract Viewer */}
            {(() => {
              const current = selectedAdapter || adapters[0];
              if (!current) return null;

              return (
                <div className="space-y-4 pt-2">
                  {/* Contract Header Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Endpoint Stub (API-Ready)</span>
                      <span className="font-mono font-bold text-slate-800 break-all">
                        {current.dataContract.httpMethod} {current.dataContract.endpointStub}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">วิธีการยืนยันสิทธิ์ (Authentication)</span>
                      <span className="font-semibold text-slate-800">
                        {current.dataContract.authMethod}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Contract Version</span>
                      <span className="font-mono font-bold text-indigo-700">
                        {current.dataContract.contractVersion}
                      </span>
                    </div>
                  </div>

                  {/* Transition Roadmap 3 Phases */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-amber-700" />
                      <span>แผนการเปลี่ยนผ่าน 3 ระยะ (Progressive Transition Roadmap)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-800 block mb-1">ระยะสั้น (ปัจจุบัน)</span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {current.transitionRoadmap.shortTerm}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-800 block mb-1">ระยะกลาง</span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {current.transitionRoadmap.midTerm}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-800 block mb-1">ระยะยาว (Live API)</span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {current.transitionRoadmap.longTerm}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Field Mapping Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">
                      ตารางจับคู่ฟิลด์ข้อมูล (Field Mapping Matrix & Validation Rules)
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">ฟิลด์ภายนอก (Source)</th>
                            <th className="py-2.5 px-3">ฟิลด์ในระบบ มจร (Target)</th>
                            <th className="py-2.5 px-3">ชนิดข้อมูล</th>
                            <th className="py-2.5 px-3">จำเป็น?</th>
                            <th className="py-2.5 px-3">กฎการแปลง (Transform)</th>
                            <th className="py-2.5 px-3">คำอธิบาย</th>
                            <th className="py-2.5 px-3">ตัวอย่างข้อมูล</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {current.dataContract.fieldMappings.map((rule, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-semibold text-slate-800">{rule.sourceField}</td>
                              <td className="py-2 px-3 text-indigo-600 font-semibold">{rule.targetField}</td>
                              <td className="py-2 px-3 text-slate-500">{rule.dataType}</td>
                              <td className="py-2 px-3">
                                {rule.required ? (
                                  <span className="text-red-600 font-bold">บังคับ</span>
                                ) : (
                                  <span className="text-slate-400">ไม่บังคับ</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-600 font-sans">{rule.transformRule || 'none'}</td>
                              <td className="py-2 px-3 font-sans text-slate-700">{rule.description}</td>
                              <td className="py-2 px-3 text-slate-500">{rule.exampleValue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Fallback Strategy Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-800 block">กลยุทธ์เมื่อระบบภายนอกออฟไลน์ (Offline Fallback)</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {current.fallbackStrategy.offlineBehavior}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-800 block">การกู้คืนและประมวลผลย้อนหลัง (Sync Recovery)</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {current.fallbackStrategy.syncRecovery}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 3: Batch Ingestion Gateway (CSV / Excel) */}
      {activeTab === 'ingestion' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-sky-600" />
                  <span>เกตเวย์นำเข้าข้อมูลแบบกลุ่ม (Batch File Ingestion Gateway)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  สำหรับการเชื่อมต่อกับระบบที่ยังไม่มี API: ดาวน์โหลดเทมเพลตมาตรฐาน, วางหรืออัปโหลดข้อมูล, และตรวจสอบความถูกต้อง (Dry-Run) ก่อนบันทึก
                </p>
              </div>

              {/* Ingestion Target Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedIngestionAdapterId}
                  onChange={(e) => {
                    setSelectedIngestionAdapterId(e.target.value);
                    setCurrentBatchJob(null);
                    setBatchRawInput('');
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  {adapters.map((a) => (
                    <option key={a.id} value={a.id}>
                      นำเข้า: {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Bar: Download Template & Load Sample */}
            {(() => {
              const activeAdapter = adapters.find((a) => a.id === selectedIngestionAdapterId);
              if (!activeAdapter) return null;

              return (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{activeAdapter.name}</span>
                      <span className="text-slate-400">|</span>
                      <span>เทมเพลต: <code className="text-slate-800">{activeAdapter.stagingTemplate.filename}</code></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleLoadSampleTemplate}
                        className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
                      >
                        โหลดข้อมูลตัวอย่างทดสอบ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([activeAdapter.stagingTemplate.sampleCsv], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', activeAdapter.stagingTemplate.filename);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>ดาวน์โหลด Template (CSV)</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">ระบุเนื้อหาข้อมูล (CSV / JSON Raw Payload)</span>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded">
                          <button
                            type="button"
                            onClick={() => setIngestionFileType('csv')}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                              ingestionFileType === 'csv' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500'
                            }`}
                          >
                            CSV File
                          </button>
                          <button
                            type="button"
                            onClick={() => setIngestionFileType('json')}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                              ingestionFileType === 'json' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500'
                            }`}
                          >
                            JSON Payload
                          </button>
                        </div>
                      </div>
                      {batchRawInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setBatchRawInput('');
                            setCurrentBatchJob(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ล้างเนื้อหา
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={7}
                      value={batchRawInput}
                      onChange={(e) => setBatchRawInput(e.target.value)}
                      placeholder={
                        ingestionFileType === 'csv'
                          ? `วางข้อมูล CSV (มีแถวหัวตาราง Header):\n${activeAdapter.stagingTemplate.columns.map((c) => c.key).join(',')}`
                          : `วาง JSON Array:\n[\n  { ... }\n]`
                      }
                      className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>

                  {/* Dry Run Button */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleRunDryRun}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-xl hover:bg-sky-700 transition-colors shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ตรวจสอบข้อมูล (Run Dry-Run Validation)</span>
                    </button>
                  </div>

                  {/* Dry Run Results Preview */}
                  {currentBatchJob && (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-slate-800">ผลการตรวจสอบ Dry-Run</h4>
                          <p className="text-xs text-slate-500">
                            ตรวจพบทั้งหมด {currentBatchJob.totalRows} แถว | ผ่านเกณฑ์: {currentBatchJob.validRows} แถว | 
                            ข้อผิดพลาด: <span className={currentBatchJob.errorRows > 0 ? 'text-red-600 font-bold' : 'text-slate-600'}>
                              {currentBatchJob.errorRows} แถว
                            </span>
                          </p>
                        </div>

                        {currentBatchJob.validRows > 0 && currentBatchJob.status === 'validated' && (
                          <button
                            type="button"
                            onClick={handleCommitBatch}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ยืนยันนำเข้าข้อมูลจริงเข้าสู่ระบบ ({currentBatchJob.validRows} รายการ)</span>
                          </button>
                        )}
                      </div>

                      {/* Summary Notes */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                        {currentBatchJob.dryRunSummary.map((sum, sIdx) => (
                          <div key={sIdx} className="text-slate-700 font-mono text-[11px]">
                            • {sum}
                          </div>
                        ))}
                      </div>

                      {/* Rows Table */}
                      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                            <tr>
                              <th className="py-2 px-3 w-16">แถวที่</th>
                              <th className="py-2 px-3 w-28">สถานะ</th>
                              <th className="py-2 px-3">ข้อมูลที่อ่านได้ (Raw Data)</th>
                              <th className="py-2 px-3">ผลการตรวจสอบ / ข้อผิดพลาด</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                            {currentBatchJob.rows.map((row) => (
                              <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                                <td className="py-2 px-3 font-semibold text-slate-500">#{row.rowNumber}</td>
                                <td className="py-2 px-3">
                                  {row.isValid ? (
                                    <span className="text-emerald-600 font-bold font-sans">✓ ผ่านเกณฑ์</span>
                                  ) : (
                                    <span className="text-red-600 font-bold font-sans">✗ พบข้อผิดพลาด</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-slate-800 truncate max-w-xs">
                                  {JSON.stringify(row.rawData)}
                                </td>
                                <td className="py-2 px-3 font-sans">
                                  {row.errors.length > 0 ? (
                                    <span className="text-red-600 font-medium">{row.errors.join(', ')}</span>
                                  ) : (
                                    <span className="text-slate-400">แม็ปฟิลด์เรียบร้อย</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: Outbox Buffer Queue */}
      {activeTab === 'outbox' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-purple-600" />
                  <span>คิวพักส่งออกข้อมูล Outbox Queue Buffer (Store-and-Forward Architecture)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  กลไก Outbox สำหรับพักข้อมูลที่ต้องส่งไปยังระบบภายนอกที่ยังไม่มี API แบบเรียลไทม์ หรือกรณีระบบภายนอกออฟไลน์ชั่วคราว
                </p>
              </div>

              {pendingOutboxCount > 0 && (
                <button
                  type="button"
                  onClick={handleFlushAllOutbox}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ประมวลผลส่งออกข้อมูลทั้งหมด ({pendingOutboxCount} รายการ)</span>
                </button>
              )}
            </div>

            {/* Outbox Items Table */}
            {outboxItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">ไม่มีรายการค้างใน Outbox Buffer</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">รหัสคิว (ID)</th>
                      <th className="py-2.5 px-3">ระบบเป้าหมาย (Target)</th>
                      <th className="py-2.5 px-3">คำสั่ง/Action</th>
                      <th className="py-2.5 px-3">วัน-เวลาที่สร้าง</th>
                      <th className="py-2.5 px-3">สถานะ</th>
                      <th className="py-2.5 px-3">Payload ย่อ</th>
                      <th className="py-2.5 px-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {outboxItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                          {item.id}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {item.targetSystem}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-purple-700">
                          {item.action}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {item.createdAt}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.status === 'queued' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              รอนำส่ง (Queued)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              ส่งสำเร็จ (Dispatched)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                          {JSON.stringify(item.payload)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.status === 'queued' && (
                            <button
                              type="button"
                              onClick={() => handleFlushOutboxItem(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                            >
                              <Send className="w-3 h-3" />
                              <span>ส่งข้อมูล</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: API Simulator / Sandbox */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#D94F87]" />
                <span>API-Ready Contract Simulator & Sandbox</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                เครื่องมือทดสอบส่งข้อมูลจำลองผ่าน Data Contract เพื่อทดสอบความถูกต้องของโครงสร้าง DTO ล่วงหน้า ก่อนที่ระบบภายนอกจะเปิด API จริง
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left Column: Config & Request Payload */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">เลือกระบบ Adapter ที่ต้องการจำลอง</label>
                  <select
                    value={simAdapterId}
                    onChange={(e) => handleSimAdapterChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  >
                    {adapters.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.hasLiveApi ? 'Live API' : 'API-Ready Contract'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Endpoint Display */}
                {(() => {
                  const target = adapters.find((a) => a.id === simAdapterId);
                  if (!target) return null;

                  return (
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {target.dataContract.httpMethod}
                        </span>
                        <span className="truncate text-slate-300">{target.dataContract.endpointStub}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {target.dataContract.authMethod}
                      </span>
                    </div>
                  );
                })()}

                {/* JSON Request Payload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Request Body (JSON Schema)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const target = adapters.find((a) => a.id === simAdapterId);
                        if (target) setSimPayload(target.dataContract.sampleRequestPayload);
                      }}
                      className="text-[#D94F87] hover:underline text-[11px]"
                    >
                      รีเซ็ตเป็นตัวอย่างสัญญา (Sample Contract)
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={simPayload}
                    onChange={(e) => setSimPayload(e.target.value)}
                    className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D94F87]"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#D94F87] rounded-xl hover:bg-[#B83B6F] transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : ''}`} />
                    <span>{isSimulating ? 'กำลังส่งคำขอจำลอง...' : 'ส่งคำขอจำลอง (Send Test Request)'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Response Output */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Response Result (ผลการตอบกลับจาก Simulator)</span>
                {simResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          simResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {simResult.success ? '200 OK - CONTRACT PASSED' : 'VALIDATION ERROR'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Latency: {simResult.latencyMs} ms
                      </span>
                    </div>

                    <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-800">
                      {JSON.stringify(simResult.response || simResult.error, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="h-[380px] rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-6">
                    <Cpu className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">
                      กดปุ่ม "ส่งคำขอจำลอง" เพื่อทดสอบและตรวจสอบการตอบสนองของระบบ
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      ระบบจะตรวจสอบ Field Mapping และ Schema Constraints ตาม Data Contract อัตโนมัติ
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Integration Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#D94F87]" />
                  <span>บันทึกประวัติการเชื่อมต่อและบูรณาการข้อมูล (Integration Logs)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตรวจสอบความเคลื่อนไหวของการซิงก์ข้อมูล การนำเข้า Batch และการส่งออกข้อมูลย้อนหลัง
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="success">สำเร็จ (Success)</option>
                  <option value="warning">แจ้งเตือน (Warning)</option>
                  <option value="error">ผิดพลาด (Error)</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportLogs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>ส่งออก Excel</span>
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">วัน-เวลา</th>
                    <th className="py-2.5 px-3">ระบบภายนอก</th>
                    <th className="py-2.5 px-3">โปรโตคอล</th>
                    <th className="py-2.5 px-3">คำสั่ง/Action</th>
                    <th className="py-2.5 px-3">จำนวนระเบียน</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3">เวลา (ms)</th>
                    <th className="py-2.5 px-3">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs
                    .filter((l) => logFilter === 'all' || l.status === logFilter)
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">{log.systemName}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                            {log.protocol}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-indigo-700">{log.action}</td>
                        <td className="py-2 px-3 font-semibold text-slate-700">
                          {log.recordsCount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          {log.status === 'success' ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                              สำเร็จ ({log.statusCode || 200})
                            </span>
                          ) : log.status === 'warning' ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                              เตือน
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                              ข้อผิดพลาด
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{log.durationMs}</td>
                        <td className="py-2 px-3 text-slate-600 max-w-sm truncate">{log.details}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Selected Adapter Modal Drawer */}
      {selectedAdapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {selectedAdapter.code}
                  </span>
                  {getModeBadge(selectedAdapter.currentMode)}
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedAdapter.name}</h3>
                <p className="text-xs text-slate-500">{selectedAdapter.targetSystem}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdapter(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Why No API Reality Check */}
              <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  สภาพความเป็นจริงและเหตุผลที่ยังไม่มี API (Real-World Constraint)
                </span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {selectedAdapter.whyNoApiReason}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">
                  สลับโหมดการทำงานของ Adapter (Adapter Mode Switcher)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAdapter.supportedModes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeChange(selectedAdapter.id, mode)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedAdapter.currentMode === mode
                          ? 'border-[#D94F87] bg-[#FBE7EF]/30 text-[#B83B6F] font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{mode}</span>
                        {selectedAdapter.currentMode === mode && <Check className="w-3.5 h-3.5 text-[#D94F87]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Roadmap */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">แผนการเปลี่ยนผ่าน (Roadmap)</span>
                <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p>• {selectedAdapter.transitionRoadmap.shortTerm}</p>
                  <p>• {selectedAdapter.transitionRoadmap.midTerm}</p>
                  <p>• {selectedAdapter.transitionRoadmap.longTerm}</p>
                </div>
              </div>

              {/* Data Contract Summary */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">ข้อกำหนด Data Contract ที่เตรียมไว้</span>
                <div className="font-mono text-[11px] bg-slate-900 text-slate-100 p-3 rounded-xl space-y-1">
                  <div>Stub: {selectedAdapter.dataContract.httpMethod} {selectedAdapter.dataContract.endpointStub}</div>
                  <div>Auth: {selectedAdapter.dataContract.authMethod}</div>
                  <div>Version: {selectedAdapter.dataContract.contractVersion}</div>
                  <div>Mappings: {selectedAdapter.dataContract.fieldMappings.length} ฟิลด์ข้อมูล</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedIngestionAdapterId(selectedAdapter.id);
                  setSelectedAdapter(null);
                  setActiveTab('ingestion');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100"
              >
                เปิดหน้านำเข้า Batch ไฟล์
              </button>

              <button
                type="button"
                onClick={() => setSelectedAdapter(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
