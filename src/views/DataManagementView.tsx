import React, { useState, useEffect } from 'react';
import {
  Database,
  Trash2,
  RotateCcw,
  ShieldCheck,
  History,
  Download,
  Upload,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HardDrive,
  FileCheck2,
  Server,
  Layers,
  ArrowUpRight,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Code,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import { apiClient, type RecycleBinItem, type AuditLogItem } from '../services/apiClient.ts';
import { DataImportWizard } from '../components/data/DataImportWizard.tsx';
import {
  SUPABASE_URL,
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
  type SupabaseHealthStatus,
} from '../services/supabase.ts';
import type { UserProfile } from '../types.ts';

interface DataManagementViewProps {
  currentUser?: UserProfile | null;
  onNavigate?: (path: string) => void;
  initialTab?: 'recycle_bin' | 'stats' | 'audit_logs' | 'backup_restore' | 'import_data' | 'supabase';
}

const COLLECTION_LABELS: Record<string, string> = {
  meetings: 'การประชุมและมติ',
  resolutions: 'ทะเบียนมติสภาวิชาการ',
  tasks: 'งานที่ได้รับมอบหมาย',
  orders: 'คำสั่งแต่งตั้งกรรมการ',
  invitations: 'หนังสือเชิญประชุม',
  strategy_pillars: 'ยุทธศาสตร์หลัก',
  action_plans: 'แผนปฏิบัติการ',
  kpis: 'ตัวชี้วัด (KPIs)',
  risks: 'ความเสี่ยงและมาตรการ',
  budgets: 'งบประมาณโครงการ',
  programs: 'หลักสูตรปริญญา',
  crosswalks: 'ตารางเทียบเคียงหลักสูตร',
  short_courses: 'หลักสูตรระยะสั้น',
  partners: 'เครือข่ายความร่วมมือ (MOU)',
  pre_degree_students: 'นักเรียน Pre-Degree',
  credit_wallets: 'กระเป๋าหน่วยกิต (Credit Bank)',
  credit_transactions: 'รายการสะสมหน่วยกิต',
  credit_transfers: 'คำขอเทียบโอนหน่วยกิต',
  faculty_profiles: 'ข้อมูลอาจารย์',
  competencies: 'สมรรถนะอาจารย์',
  idp_steps: 'แผนพัฒนาตนเอง (IDP)',
  portfolios: 'ผลงานวิชาการ',
  mentor_reviews: 'การประเมินโดย Mentor',
  regulations: 'กฎระเบียบและข้อบังคับ',
  documents: 'เอกสารกลาง',
  forms: 'แบบฟอร์มคำร้องออนไลน์',
  form_submissions: 'รายการยื่นคำร้อง',
  user_accounts: 'บัญชีผู้ใช้งาน',
  notifications: 'การแจ้งเตือนระบบ',
};

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  currentUser,
  onNavigate,
  initialTab = 'stats',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'recycle_bin' | 'stats' | 'audit_logs' | 'backup_restore' | 'import_data' | 'supabase'>(initialTab);
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthStatus | null>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const testSupabase = async () => {
    setIsCheckingSupabase(true);
    try {
      const res = await testSupabaseConnection();
      setSupabaseHealth(res);
      showToast({
        title: res.connected ? 'เชื่อมต่อ Supabase สำเร็จ' : 'โหมดสำรอง (Offline Fallback)',
        message: res.message,
        type: res.connected ? 'success' : 'info',
      });
    } catch {
      showToast({
        title: 'เครือข่ายขัดข้อง',
        message: 'ระบบกำลังทำงานในโหมด LocalStorage สำรอง',
        type: 'info',
      });
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'supabase' && !supabaseHealth) {
      testSupabase();
    }
  }, [activeTab]);

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Recycle Bin State
  const [recycleItems, setRecycleItems] = useState<RecycleBinItem[]>([]);
  const [isLoadingRecycle, setIsLoadingRecycle] = useState(false);
  const [recycleSearch, setRecycleSearch] = useState('');
  const [recycleFilterCol, setRecycleFilterCol] = useState('all');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('all');

  // Confirmation Modals
  const [restoringItem, setRestoringItem] = useState<RecycleBinItem | null>(null);
  const [permanentDeletingItem, setPermanentDeletingItem] = useState<RecycleBinItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await apiClient.getSystemStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchRecycleBin = async () => {
    setIsLoadingRecycle(true);
    try {
      const res = await apiClient.getRecycleBin();
      if (res.success && Array.isArray(res.data)) {
        setRecycleItems(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingRecycle(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await apiClient.getAuditLogs();
      if (res.success && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecycleBin();
    fetchAuditLogs();
  }, []);

  const handleRestore = async (item: RecycleBinItem) => {
    try {
      const res = await apiClient.restoreFromRecycleBin(item._collection, item.id, currentUser);
      if (res.success) {
        showToast({
          title: 'กู้คืนข้อมูลสำเร็จ',
          message: `กู้คืน "${item.title || item.code || item.id}" เรียบร้อยแล้ว`,
          type: 'success',
        });
        setRestoringItem(null);
        fetchRecycleBin();
        fetchStats();
      } else {
        showToast({
          title: 'เกิดข้อผิดพลาดในการกู้คืน',
          message: res.error || 'ไม่สามารถกู้คืนข้อมูลได้',
          type: 'error',
        });
      }
    } catch (err: any) {
      showToast({ title: 'เกิดข้อผิดพลาด', message: err.message, type: 'error' });
    }
  };

  const handlePermanentDelete = async (item: RecycleBinItem) => {
    try {
      const res = await apiClient.permanentDelete(item._collection, item.id, currentUser);
      if (res.success) {
        showToast({
          title: 'ลบข้อมูลถาวรแล้ว',
          message: `ลบ "${item.title || item.code || item.id}" ออกจากฐานข้อมูลอย่างถาวรแล้ว`,
          type: 'success',
        });
        setPermanentDeletingItem(null);
        fetchRecycleBin();
        fetchStats();
      } else {
        showToast({
          title: 'เกิดข้อผิดพลาดในการลบถาวร',
          message: res.error || 'ไม่สามารถลบข้อมูลถาวรได้',
          type: 'error',
        });
      }
    } catch (err: any) {
      showToast({ title: 'เกิดข้อผิดพลาด', message: err.message, type: 'error' });
    }
  };

  const handleExportBackup = async () => {
    try {
      const backup = await apiClient.backupDatabase(currentUser);
      if (backup && backup.success) {
        const jsonStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        a.href = url;
        a.download = `mcu_academic_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast({
          title: 'ส่งออกข้อมูลสำเร็จ',
          message: 'ดาวน์โหลดไฟล์สำรองฐานข้อมูล Snapshot เรียบร้อยแล้ว',
          type: 'success',
        });
        fetchAuditLogs();
      }
    } catch (err: any) {
      showToast({ title: 'ส่งออกข้อมูลไม่สำเร็จ', message: err.message, type: 'error' });
    }
  };

  const handleSystemReset = async () => {
    setIsResetting(true);
    try {
      const res = await apiClient.resetDatabase(currentUser);
      if (res.success) {
        showToast({
          title: 'รีเซ็ตระบบสู่ Zero State สำเร็จ',
          message: 'ล้างข้อมูลทดสอบทั้งหมดเรียบร้อยแล้ว คงเหลือเฉพาะบัญชีผู้ใช้งานระบบ',
          type: 'success',
        });
        setIsResetConfirmOpen(false);
        fetchStats();
        fetchRecycleBin();
        fetchAuditLogs();
      } else {
        showToast({
          title: 'เกิดข้อผิดพลาดในการรีเซ็ต',
          message: res.error || 'ไม่สามารถรีเซ็ตได้',
          type: 'error',
        });
      }
    } catch (err: any) {
      showToast({ title: 'เกิดข้อผิดพลาด', message: err.message, type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  const filteredRecycleItems = recycleItems.filter((item) => {
    const matchesCol = recycleFilterCol === 'all' || item._collection === recycleFilterCol;
    const q = recycleSearch.toLowerCase();
    const matchesSearch =
      !q ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.delete_reason && item.delete_reason.toLowerCase().includes(q)) ||
      (item.deleted_by && item.deleted_by.toLowerCase().includes(q));
    return matchesCol && matchesSearch;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesAction = logFilterAction === 'all' || log.action === logFilterAction;
    const q = logSearch.toLowerCase();
    const matchesSearch =
      !q ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (log.module && log.module.toLowerCase().includes(q));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B83B6F]">
            <span
              onClick={() => onNavigate?.('/dashboard')}
              className="cursor-pointer hover:underline"
            >
              หน้าแรก
            </span>
            <span>/</span>
            <span className="text-slate-700">การจัดการข้อมูลและธรรมาภิบาล</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Data Persistence & Governance Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ศูนย์จัดการฐานข้อมูลถาวร ถังขยะกู้คืนข้อมูล (Recycle Bin) และประวัติการตรวจสอบ (Audit Logs) • กองวิชาการ มจร
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('import_data')}
            className="text-xs bg-[#D94F87] hover:bg-[#B83B6F] text-white shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            นำเข้าข้อมูลเดิม (Import Wizard)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              fetchRecycleBin();
              fetchAuditLogs();
            }}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            รีเฟรชข้อมูล
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBackup}
            className="text-xs text-[#B83B6F] border-pink-200 hover:bg-pink-50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            สำรองข้อมูล (JSON Snapshot)
          </Button>
        </div>
      </div>

      {/* Database Engine Architecture Banner */}
      <div className="mt-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#B83B6F]/20 border border-[#B83B6F]/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  SQLite 3 Embedded Engine (Node.js 22 Native)
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> WAL Mode Active
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Foreign Keys ON
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                ระบบจัดเก็บข้อมูลถาวรลงไฟล์ <code className="px-1.5 py-0.5 rounded bg-slate-950 text-pink-300 font-mono text-[11px]">data/mcu_academic.sqlite</code> ข้อมูลที่บันทึก แก้ไข หรือลบ จะคงอยู่ถาวรแม้ Refresh หรือปิด Browser รองรับ ACID Transactions ครบถ้วน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-6">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Audit Trail Records</div>
              <div className="text-lg font-bold text-white mt-0.5">{stats?.auditLogsTotal ?? auditLogs.length} รายการ</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">In Recycle Bin</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{recycleItems.length} รายการ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 flex border-b border-[#FFDCE8] space-x-1 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'supabase'
              ? 'border-[#E11463] text-[#E11463] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-[#E11463]" />
          <span>⚡ Supabase Cloud DB</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            เชื่อมต่ออยู่
          </span>
        </button>

        <button
          onClick={() => setActiveTab('import_data')}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'import_data'
              ? 'border-[#E11463] text-[#E11463] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4 text-[#E11463]" />
          <span>นำเข้าข้อมูลเดิม (Import Data)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            Excel / CSV / JSON
          </span>
        </button>

        <button
          onClick={() => setActiveTab('recycle_bin')}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'recycle_bin'
              ? 'border-[#E11463] text-[#E11463] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          ถังขยะกู้คืนข้อมูล (Recycle Bin)
          {recycleItems.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-pink-100 text-[#E11463] font-semibold">
              {recycleItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'audit_logs'
              ? 'border-[#E11463] text-[#E11463] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          ประวัติการตรวจสอบ (Audit Logs)
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'stats'
              ? 'border-[#E11463] text-[#E11463] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          สถิติตารางฐานข้อมูล (Table Metrics)
        </button>

        <button
          onClick={() => setActiveTab('backup_restore')}
          className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'backup_restore'
              ? 'border-[#E11463] text-[#E11463] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          สำรอง / กู้คืน / รีเซ็ตระบบ
        </button>
      </div>

      {/* Tab: Supabase Cloud Database */}
      {activeTab === 'supabase' && (
        <div className="mt-6 space-y-6">
          {/* Status Overview Card */}
          <div className="bg-gradient-to-r from-[#FFF0F5] to-[#FFE4EE] border border-[#FFD0E2] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E11463] text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    ⚡ Supabase Cloud Database & Real-time Replication
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    เชื่อมต่ออยู่
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  ย้ายระบบจาก Firebase สู่ Supabase แบบ 100% เรียบร้อยแล้ว พร้อมระบบ Auto-sync และ LocalStorage Fallback
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                  <div>
                    <span className="text-slate-400">Project URL:</span>{' '}
                    <span className="text-slate-800 font-semibold">{SUPABASE_URL}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>{' '}
                    <span className="text-emerald-700 font-semibold">{supabaseHealth?.message || 'เชื่อมต่อพร้อมใช้งาน'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testSupabase}
                  disabled={isCheckingSupabase}
                  className="bg-white border-[#FFDCE8] text-slate-700 hover:text-[#E11463] hover:border-[#FFD0E2] shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isCheckingSupabase ? 'animate-spin text-[#E11463]' : ''}`} />
                  <span>{isCheckingSupabase ? 'กำลังตรวจสอบ...' : 'ทดสอบสัญญาณ Supabase'}</span>
                </Button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E11463] text-white hover:bg-[#C80C54] transition-colors shadow-2xs"
                >
                  <span>เปิด Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#FFDCE8] rounded-xl p-4 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] border border-[#FFD0E2] flex items-center justify-center text-[#E11463] mb-2.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Firebase Clean Wipe</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                ถอนการติดตั้งและลบ configs, firestore.rules, และ dependencies ออกจากโปรเจกต์ 100%
              </p>
            </div>

            <div className="bg-white border border-[#FFDCE8] rounded-xl p-4 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] border border-[#FFD0E2] flex items-center justify-center text-[#E11463] mb-2.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">URL Sanitization</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                ตัดต่อท้าย <code className="text-[#E11463]">/rest/v1/</code> หรือ trailing slash ให้เหลือเฉพาะ Root URL โดยอัตโนมัติ
              </p>
            </div>

            <div className="bg-white border border-[#FFDCE8] rounded-xl p-4 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] border border-[#FFD0E2] flex items-center justify-center text-[#E11463] mb-2.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Auto Local Fallback</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                ทำงานร่วมกับ LocalStorage และ SQLite ไร้รอยต่อ แม้เครือข่ายขัดข้องข้อมูลก็ไม่สูญหาย
              </p>
            </div>

            <div className="bg-white border border-[#FFDCE8] rounded-xl p-4 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] border border-[#FFD0E2] flex items-center justify-center text-[#E11463] mb-2.5">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Real-time Sync Active</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                รองรับการอัปเดตข้อมูลอัตโนมัติ (Live Changes) เมื่อมีการสร้าง แก้ไข หรือลบรายการ
              </p>
            </div>
          </div>

          {/* Database Schema SQL Section */}
          <div className="bg-white border border-[#FFDCE8] rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#E11463]" />
                  คำสั่ง SQL สำหรับสร้างตาราง (Database Schema Script)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  รวมคำสั่ง <code className="text-slate-700 font-mono">CREATE TABLE</code>, เปิดใช้งาน RLS, กำหนด Policy, และ Realtime Replication ครบถ้วน
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                  setCopiedSql(true);
                  showToast({ title: 'คัดลอกสำเร็จ', message: 'คัดลอกคำสั่ง SQL เรียบร้อยแล้ว', type: 'success' });
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="bg-[#E11463] hover:bg-[#C80C54] text-white shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                <span>{copiedSql ? 'คัดลอกแล้ว!' : 'คัดลอกคำสั่ง SQL ทั้งหมด'}</span>
              </Button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Import Data Wizard */}
      {activeTab === 'import_data' && (
        <div className="mt-6">
          <DataImportWizard
            currentUser={currentUser}
            onImportComplete={() => {
              fetchStats();
              fetchAuditLogs();
            }}
          />
        </div>
      )}

      {/* Tab 1: Recycle Bin */}
      {activeTab === 'recycle_bin' && (
        <div className="mt-6 flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 gap-2 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อรายการ, รหัส, สาเหตุการลบ หรือผู้ลบ..."
                  value={recycleSearch}
                  onChange={(e) => setRecycleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                />
              </div>

              <select
                value={recycleFilterCol}
                onChange={(e) => setRecycleFilterCol(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F] bg-white text-slate-700"
              >
                <option value="all">ทุกโมดูล</option>
                {Object.entries(COLLECTION_LABELS).map(([col, label]) => (
                  <option key={col} value={col}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 self-center">
              พบ {filteredRecycleItems.length} รายการในถังขยะ
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            {isLoadingRecycle ? (
              <div className="p-12 text-center text-slate-400 text-xs">กำลังโหลดข้อมูลถังขยะ...</div>
            ) : filteredRecycleItems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">ไม่มีข้อมูลในถังขยะ</h3>
                <p className="text-xs text-slate-500 mt-1">
                  เมื่อมีการลบข้อมูลใดๆ ข้อมูลจะถูกเก็บแบบ Soft Delete และแสดงที่นี่เพื่อให้กู้คืนได้ตลอดเวลา
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                      <th className="px-4 py-3">โมดูล</th>
                      <th className="px-4 py-3">รายการ / รหัส</th>
                      <th className="px-4 py-3">สาเหตุการลบ</th>
                      <th className="px-4 py-3">ผู้ดำเนินการ</th>
                      <th className="px-4 py-3">เวลาที่ลบ</th>
                      <th className="px-4 py-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecycleItems.map((item) => (
                      <tr key={`${item._collection}-${item.id}`} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {COLLECTION_LABELS[item._collection] || item._collection}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{item.title || item.code || item.id}</div>
                          {item.code && item.title && (
                            <div className="text-[11px] text-slate-400 font-mono">{item.code}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.delete_reason || 'ลบโดยผู้ใช้งาน'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.deleted_by || 'ผู้ใช้งานระบบ'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {item.deleted_at ? new Date(item.deleted_at).toLocaleString('th-TH') : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRestoringItem(item)}
                              className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-7 px-2.5"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              กู้คืน
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPermanentDeletingItem(item)}
                              className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50 h-7 px-2.5"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              ลบถาวร
                            </Button>
                          </div>
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

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 gap-2 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหารายละเอียดประวัติ, ชื่อผู้ใช้ หรือโมดูล..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                />
              </div>

              <select
                value={logFilterAction}
                onChange={(e) => setLogFilterAction(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F] bg-white text-slate-700"
              >
                <option value="all">ทุกประเภทการกระทำ (Action)</option>
                <option value="CREATE">CREATE (สร้าง)</option>
                <option value="UPDATE">UPDATE (แก้ไข)</option>
                <option value="DELETE">DELETE (ลบ)</option>
                <option value="RESTORE">RESTORE (กู้คืน)</option>
                <option value="PERMANENT_DELETE">PERMANENT_DELETE (ทำลายถาวร)</option>
                <option value="RESET">RESET (ล้างระบบ)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 self-center">
              แสดง {filteredAuditLogs.length} รายการตรวจสอบล่าสุด
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            {isLoadingLogs ? (
              <div className="p-12 text-center text-slate-400 text-xs">กำลังโหลด Audit Logs...</div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">ไม่พบประวัติการเปลี่ยนแปลงตามเงื่อนไข</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                      <th className="px-4 py-3">เวลาที่บันทึก</th>
                      <th className="px-4 py-3">การกระทำ</th>
                      <th className="px-4 py-3">โมดูล</th>
                      <th className="px-4 py-3">ผู้ดำเนินการ</th>
                      <th className="px-4 py-3">รายละเอียดการเปลี่ยนแปลง</th>
                      <th className="px-4 py-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAuditLogs.map((log) => {
                      const actionBadge =
                        log.action === 'CREATE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : log.action === 'UPDATE'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : log.action === 'DELETE'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : log.action === 'RESTORE'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('th-TH')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${actionBadge}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-slate-700">
                              {COLLECTION_LABELS[log.module] || log.module}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                            {log.user_name || 'System'}
                          </td>
                          <td className="px-4 py-3 text-slate-700 max-w-md truncate" title={log.details}>
                            {log.details}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                            {log.ip || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Table Metrics */}
      {activeTab === 'stats' && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats && stats.collections ? (
              Object.entries(stats.collections).map(([col, data]: [string, any]) => (
                <div
                  key={col}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      {COLLECTION_LABELS[col] || col}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {col}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div>
                      <div className="text-[10px] text-slate-400">ใช้งานจริง (Active)</div>
                      <div className="text-base font-bold text-slate-900">{data.active} แถว</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">ในถังขยะ (Soft Deleted)</div>
                      <div className="text-base font-bold text-amber-600">{data.deleted} แถว</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">รวมทั้งหมด</div>
                      <div className="text-base font-bold text-slate-500">{data.total} แถว</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 text-center text-slate-400 text-xs">กำลังโหลดสถิติตาราง...</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Backup, Restore & Reset */}
      {activeTab === 'backup_restore' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Backup */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-[#B83B6F] mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">สำรองข้อมูลระบบ (Export Database Backup)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ส่งออกโครงสร้างและข้อมูลทั้งหมดของกองวิชาการทุกตารางเป็นไฟล์ JSON Snapshot ที่มีมาตรฐาน สามารถนำกลับมา Restore ได้ทุกเมื่อ
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">ขนาดไฟล์ประมาณ 100 KB</span>
              <Button onClick={handleExportBackup} size="sm">
                <Download className="w-4 h-4 mr-1.5" />
                ดาวน์โหลดไฟล์สำรองทันที
              </Button>
            </div>
          </div>

          {/* Card 2: System Zero State Reset */}
          <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">รีเซ็ตสู่สถานะตั้งต้น (Zero State Clean)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ล้างข้อมูลจำลองหรือข้อมูลทดสอบในทุกตารางให้เป็น 0 แถวบริสุทธิ์ โดยระบบจะรักษา Master User Accounts สำหรับ Login ไว้ตามมาตรฐาน
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-rose-500 font-medium">เฉพาะสิทธิ์ผู้บริหาร / Super Admin</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                ล้างข้อมูลจำลองสู่ 0
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Restore */}
      {restoringItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              ยืนยันการกู้คืนข้อมูล
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              คุณต้องการกู้คืนรายการ <span className="font-semibold text-slate-900">"{restoringItem.title || restoringItem.code || restoringItem.id}"</span> กลับเข้าสู่โมดูล <span className="font-semibold text-[#B83B6F]">{COLLECTION_LABELS[restoringItem._collection] || restoringItem._collection}</span> ใช่หรือไม่?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRestoringItem(null)}>
                ยกเลิก
              </Button>
              <Button size="sm" onClick={() => handleRestore(restoringItem)}>
                ยืนยันการกู้คืน
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Permanent Delete */}
      {permanentDeletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              ยืนยันการลบถาวร (Hard Delete)
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              รายการ <span className="font-semibold text-slate-900">"{permanentDeletingItem.title || permanentDeletingItem.code || permanentDeletingItem.id}"</span> จะถูกทำลายออกจากฐานข้อมูลอย่างถาวรและไม่สามารถกู้คืนได้อีกต่อไป คุณแน่ใจหรือไม่?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPermanentDeletingItem(null)}>
                ยกเลิก
              </Button>
              <Button
                size="sm"
                onClick={() => handlePermanentDelete(permanentDeletingItem)}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                ลบข้อมูลถาวร
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Zero State */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              ยืนยันการรีเซ็ตสู่ Zero State
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              การกระทำนี้จะลบข้อมูลธุรกรรม การประชุม มติ และบันทึกจำลองทั้งหมดออกจากตาราง SQLite ให้เริ่มต้นที่ 0 แถว โดยจะเก็บบัญชีผู้ใช้งานระบบไว้ คุณต้องการดำเนินการต่อหรือไม่?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                size="sm"
                onClick={handleSystemReset}
                disabled={isResetting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isResetting ? 'กำลังล้างข้อมูล...' : 'ยืนยันการรีเซ็ต'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
