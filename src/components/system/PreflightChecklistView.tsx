import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Lock,
  Terminal,
  Activity,
  ArrowRight,
  RefreshCw,
  Download,
  RotateCcw,
  Zap,
  Globe,
  Key,
  Layers,
  FileCheck2,
  Gauge,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { UserProfile } from '../../types.ts';

interface PreflightChecklistViewProps {
  currentUser?: UserProfile;
}

export const PreflightChecklistView: React.FC<PreflightChecklistViewProps> = ({ currentUser }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'PASSED' | 'READY' | 'WARNING'>('all');
  const [rollbackTarget, setRollbackTarget] = useState<any | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const fetchPreflightData = async () => {
    setLoading(true);
    try {
      const [preflightRes, backupsRes] = await Promise.all([
        fetch('/api/v1/system/preflight').then((r) => r.json()),
        fetch('/api/v1/system/backups').then((r) => r.json()),
      ]);

      if (preflightRes.success) {
        setData(preflightRes);
      }
      if (backupsRes.success) {
        setBackups(backupsRes.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load preflight checks:', err);
      showToast({
        title: 'ไม่สามารถดึงข้อมูลตรวจสอบความพร้อมได้',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreflightData();
  }, []);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const res = await fetch('/api/v1/system/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: 'pre-flight-inspection-snapshot',
          operator: currentUser?.name || 'Administrator',
          userId: currentUser?.id || 'admin',
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({
          title: 'สร้างไฟล์สำรองข้อมูล (Snapshot) สำเร็จ',
          message: `บันทึกไฟล์ ${result.data.filename} (${(result.data.sizeBytes / 1024).toFixed(1)} KB)`,
          type: 'success',
        });
        fetchPreflightData();
      } else {
        throw new Error(result.error || 'Failed to create backup');
      }
    } catch (err: any) {
      showToast({
        title: 'สร้างไฟล์สำรองข้อมูลไม่สำเร็จ',
        message: err.message,
        type: 'error',
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleExecuteRollback = async () => {
    if (!rollbackTarget) return;
    setIsRollingBack(true);
    try {
      const res = await fetch('/api/v1/system/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: rollbackTarget.filename,
          operator: currentUser?.name || 'Administrator',
          userId: currentUser?.id || 'admin',
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({
          title: 'ย้อนคืนฐานข้อมูล (Rollback) สำเร็จ',
          message: `คืนสภาพฐานข้อมูลจากไฟล์ ${rollbackTarget.filename} เรียบร้อย (สร้าง Pre-restore Snapshot สำรองไว้แล้ว)`,
          type: 'success',
        });
        setRollbackTarget(null);
        fetchPreflightData();
      } else {
        throw new Error(result.error || 'Rollback failed');
      }
    } catch (err: any) {
      showToast({
        title: 'การย้อนคืนฐานข้อมูลล้มเหลว',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  const getCheckIcon = (id: string) => {
    switch (id) {
      case 'production_environment':
        return Server;
      case 'environment_separation':
        return Layers;
      case 'environment_variables':
        return Terminal;
      case 'secret_management':
        return Key;
      case 'database_migration':
        return Database;
      case 'build':
        return Zap;
      case 'deployment':
        return ArrowRight;
      case 'domain':
        return Globe;
      case 'https':
        return Lock;
      case 'error_monitoring':
        return Activity;
      case 'logging':
        return FileCheck2;
      case 'performance':
        return Gauge;
      case 'security_headers':
        return ShieldCheck;
      case 'backup':
        return Download;
      case 'rollback':
        return RotateCcw;
      case 'versioning':
      default:
        return Info;
    }
  };

  const filteredChecks = data?.checks?.filter((c: any) => {
    if (selectedFilter === 'all') return true;
    return c.status === selectedFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Go-Live Pre-Flight Audit</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              การตรวจสอบความพร้อมก่อนนำระบบขึ้นใช้งานจริง (Production Verification)
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
              ตรวจสอบ 15 เสาหลักตามข้อกำหนดวิศวกรรมความปลอดภัย และบังคับใช้การแยกสภาพแวดล้อม
              <strong className="text-amber-300 ml-1">Development → Staging → Production</strong> อย่างเด็ดขาด
              ป้องกันไม่ให้ระบบระหว่างพัฒนาเข้าถึงหรือกระทบต่อฐานข้อมูลจริง
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPreflightData}
              disabled={loading}
              className="w-full sm:w-auto bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              ตรวจสอบใหม่
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="w-full sm:w-auto bg-[#D94F87] hover:bg-[#B83B6F] text-white border-0 shadow-lg"
            >
              <Download className={`w-4 h-4 mr-2 ${creatingBackup ? 'animate-bounce' : ''}`} />
              {creatingBackup ? 'กำลังบันทึก...' : 'สร้าง Snapshot ฐานข้อมูล'}
            </Button>
          </div>
        </div>

        {/* Readiness Metric Ribbon */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 block">คะแนนความพร้อมรวม</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{data.overallScore}%</span>
                <span className="text-xs text-emerald-300 font-medium">พร้อมใช้งาน</span>
              </div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 block">สภาพแวดล้อมปัจจุบัน</span>
              <div className="text-base sm:text-lg font-bold text-amber-300 mt-1 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                {data.environmentInfo.activeEnv}
              </div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 block">เวอร์ชันระบบ (SemVer)</span>
              <div className="text-base sm:text-lg font-bold text-blue-300 mt-1">
                v{data.environmentInfo.version}
              </div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 block">ไฟล์สำรอง Snapshot</span>
              <div className="text-base sm:text-lg font-bold text-slate-200 mt-1">
                {backups.length} ไฟล์
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Environment Separation Architecture Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>สถาปัตยกรรมการแยกสภาพแวดล้อม 3 ระดับ (3-Tier Environment Isolation)</span>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          โครงสร้างป้องกันข้อผิดพลาดระดับสูงสุด: แยกพื้นที่จัดเก็บข้อมูล Schema และตัวแปรระบบตามลำดับขั้น
          พร้อมกลไก Guardrail ล็อคห้ามกระทำการใดๆ ข้ามสภาพแวดล้อม
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tier 1: Development */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
              Dev Mode
            </div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                DEV
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Development</h4>
                <p className="text-xs text-slate-500">สำหรับพัฒนาฟังก์ชันใหม่</p>
              </div>
            </div>
            <ul className="text-xs space-y-1.5 text-slate-700 mt-3 pt-3 border-t border-blue-200/60">
              <li>• <strong>DB:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-900">mcu_academic_dev.sqlite</code></li>
              <li>• <strong>Vite:</strong> Hot Module Replacement (HMR)</li>
              <li>• <strong>Logs:</strong> Debug / Verbose Console</li>
              <li>• <strong>Security Guard:</strong> ห้ามชี้ไปที่ไฟล์ DB Production</li>
            </ul>
          </div>

          {/* Tier 2: Staging */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
              Pre-Release
            </div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                STG
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Staging (UAT)</h4>
                <p className="text-xs text-slate-500">ทดสอบร่วมกับผู้ใช้งานจริง</p>
              </div>
            </div>
            <ul className="text-xs space-y-1.5 text-slate-700 mt-3 pt-3 border-t border-purple-200/60">
              <li>• <strong>DB:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-purple-200 text-purple-900">mcu_academic_staging.sqlite</code></li>
              <li>• <strong>Build:</strong> Minified Production Bundle</li>
              <li>• <strong>Snapshot:</strong> สำรองข้อมูลทุกครั้งก่อนรัน Migration</li>
              <li>• <strong>Security:</strong> ทดสอบ Security Headers & RBAC</li>
            </ul>
          </div>

          {/* Tier 3: Production */}
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/40 p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
              LIVE SYSTEM
            </div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                PROD
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Production</h4>
                <p className="text-xs text-slate-500">ระบบจริง กองวิชาการ มจร</p>
              </div>
            </div>
            <ul className="text-xs space-y-1.5 text-slate-700 mt-3 pt-3 border-t border-emerald-200">
              <li>• <strong>DB:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-900">mcu_academic_prod.sqlite</code></li>
              <li>• <strong>Security:</strong> HSTS, CSP, X-Frame, HTTPS Only</li>
              <li>• <strong>Performance:</strong> WAL Mode, Cache-Control 1y</li>
              <li>• <strong>Recovery:</strong> Instant Rollback with Pre-Restore Snapshot</li>
            </ul>
          </div>
        </div>

        {/* Warning / Callout */}
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold">กฎเหล็กความปลอดภัย (Security Guardrail Activated):</strong>{' '}
            ระบบมีคำสั่งป้องกัน (Runtime Guard) ตรวจสอบค่าคอนฟิก หากพบว่าระบบกำลังทำงานในสภาพแวดล้อม Development
            แต่พยายามชี้เป้าหมายไฟล์ฐานข้อมูลที่มีคำว่า <code className="font-bold text-amber-950 bg-amber-100 px-1 rounded">prod</code> หรือ{' '}
            <code className="font-bold text-amber-950 bg-amber-100 px-1 rounded">production</code> ระบบจะยกเลิกการทำงานทันที (Fatal Guard Block)
            เพื่อปกป้องข้อมูลจริงของกองวิชาการ มจร ไม่ให้ถูกแก้ไขหรือกระทบโดยไม่เจตนา
          </div>
        </div>
      </div>

      {/* 15 Inspection Checkpoints */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              ผลการตรวจ 15 เสาหลักก่อนขึ้น Production (Inspection Results)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              ตรวจพบสถานะความสมบูรณ์ {data?.metrics?.passed || 0}/{data?.checks?.length || 15} รายการ
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({data?.checks?.length || 0})
            </button>
            <button
              onClick={() => setSelectedFilter('PASSED')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedFilter === 'PASSED' ? 'bg-emerald-600 text-white shadow-2xs font-semibold' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              ผ่าน ({data?.metrics?.passed || 0})
            </button>
            <button
              onClick={() => setSelectedFilter('READY')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedFilter === 'READY' ? 'bg-blue-600 text-white shadow-2xs font-semibold' : 'text-blue-700 hover:text-blue-900'
              }`}
            >
              พร้อม ({data?.metrics?.ready || 0})
            </button>
            {data?.metrics?.warning > 0 && (
              <button
                onClick={() => setSelectedFilter('WARNING')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedFilter === 'WARNING' ? 'bg-amber-600 text-white shadow-2xs font-semibold' : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                คำเตือน ({data?.metrics?.warning})
              </button>
            )}
          </div>
        </div>

        {/* Check Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChecks.map((check: any, idx: number) => {
            const Icon = getCheckIcon(check.id);
            const isPassed = check.status === 'PASSED';
            const isReady = check.status === 'READY';
            const isWarning = check.status === 'WARNING';

            return (
              <div
                key={check.id}
                className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isPassed
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : isReady
                    ? 'border-blue-200/80 bg-blue-50/20'
                    : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-700'
                            : isReady
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isReady
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{check.name}</h4>
                  <div className="text-xs font-medium text-slate-500 mb-2">{check.nameTh}</div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{check.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  {check.id === 'database_migration' && (
                    <span>Migrations: {check.details.appliedCount} applied</span>
                  )}
                  {check.id === 'environment_separation' && (
                    <span className="truncate block">Target: {check.details.activeDatabaseFile.split('/').pop()}</span>
                  )}
                  {check.id === 'security_headers' && (
                    <span>CSP + HSTS + X-Frame + XSS</span>
                  )}
                  {check.id === 'performance' && (
                    <span>{check.details.journalMode.toUpperCase()} + {check.details.assetCaching.split(',')[0]}</span>
                  )}
                  {check.id === 'backup' && (
                    <span>Backups: {check.details.availableBackupsCount} available</span>
                  )}
                  {check.id === 'versioning' && (
                    <span>Version: v{check.details.version}</span>
                  )}
                  {check.id === 'error_monitoring' && (
                    <span>Tracing: {check.details.tracingHeader}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Snapshot Backups & Rollback Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[#D94F87]" />
              <h3 className="text-lg font-bold text-slate-900">
                ไฟล์สำรองข้อมูล Snapshot & จุดย้อนคืนระบบ (Point-in-Time Backups)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ระบบสำรองข้อมูล SQLite ระดับ Transactional พร้อม SHA256 Checksum และฟังก์ชัน Rollback คืนสถานะได้ทันที
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateBackup}
            disabled={creatingBackup}
            className="text-xs border-[#D94F87] text-[#D94F87] hover:bg-[#FBE7EF]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            สำรองข้อมูลตอนนี้
          </Button>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Download className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">ยังไม่มีไฟล์ Snapshot ในสารบบ</p>
            <p className="text-xs text-slate-400 mt-1">กดปุ่ม "สำรองข้อมูลตอนนี้" เพื่อสร้าง Snapshot แรกก่อนขึ้น Production</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">ชื่อไฟล์สำรอง</th>
                  <th className="py-2.5 px-3">สภาพแวดล้อม</th>
                  <th className="py-2.5 px-3">ขนาดไฟล์</th>
                  <th className="py-2.5 px-3">วันที่และเวลาสร้าง</th>
                  <th className="py-2.5 px-3">SHA256 Checksum</th>
                  <th className="py-2.5 px-3 text-right">การกู้คืน (Rollback)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.map((b: any) => (
                  <tr key={b.id || b.filename} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900 flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.filename}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {b.environment || 'production'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {((b.sizeBytes || 0) / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(b.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={b.sha256}>
                      {b.sha256 ? b.sha256.substring(0, 16) + '...' : '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRollbackTarget(b)}
                        className="text-[11px] h-7 px-2.5 border-rose-300 text-rose-700 hover:bg-rose-50"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Rollback สู่จุดนี้
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Rollback */}
      {rollbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              ยืนยันการย้อนคืนฐานข้อมูล (Rollback Database)
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              คุณกำลังจะกู้คืนฐานข้อมูลกลับสู่ไฟล์สำรอง:
              <br />
              <strong className="font-mono text-slate-900 bg-slate-100 p-1 rounded mt-1 inline-block">
                {rollbackTarget.filename}
              </strong>
            </p>
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>ระบบป้องกันความปลอดภัยสองชั้น (Pre-restore Safety):</strong> ก่อนที่จะกู้คืน
                ระบบจะสร้าง Snapshot สำรองข้อมูลปัจจุบันให้อัตโนมัติทันที เพื่อให้สามารถกู้คืนกลับมาได้เสมอ
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRollbackTarget(null)}
                disabled={isRollingBack}
              >
                ยกเลิก
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleExecuteRollback}
                disabled={isRollingBack}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isRollingBack ? 'กำลังย้อนคืน...' : 'ยืนยันการ Rollback'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
