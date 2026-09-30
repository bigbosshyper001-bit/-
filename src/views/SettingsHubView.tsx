import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Bell,
  Database,
  Layers,
  Activity,
  ArrowRight,
  Save,
  CheckCircle2,
  Calendar,
  Building2,
  Lock,
  Mail,
  HardDrive,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Sliders,
  FileCheck2,
} from 'lucide-react';
import type { AppRoute, UserProfile } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import { rbacService } from '../services/rbacService.ts';

export interface SettingsHubViewProps {
  currentUser?: UserProfile | null;
  onNavigate: (route: AppRoute) => void;
}

export const SettingsHubView: React.FC<SettingsHubViewProps> = ({
  currentUser,
  onNavigate,
}) => {
  const { showToast } = useToast();

  // Academic Configuration Parameters
  const [academicYear, setAcademicYear] = useState('2569');
  const [currentSemester, setCurrentSemester] = useState('1');
  const [fiscalYear, setFiscalYear] = useState('2569');
  const [orgName, setOrgName] = useState('กองวิชาการ สำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย');
  const [contactEmail, setContactEmail] = useState('academic.affairs@mcu.ac.th');
  const [contactPhone, setContactPhone] = useState('035-248-055');
  
  // System Policies
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('daily_0200');
  const [enforcePasswordExpiry, setEnforcePasswordExpiry] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [inAppAlertsEnabled, setInAppAlertsEnabled] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(
        'success',
        'บันทึกการตั้งค่าสำเร็จ',
        'พารามิเตอร์ระบบวิชาการและนโยบายความปลอดภัยถูกปรับปรุงเรียบร้อย'
      );
    }, 400);
  };

  const settingsCards = [
    {
      id: 'users',
      title: 'จัดการผู้ใช้งานระบบ',
      subtitle: 'จัดการบัญชีผู้ใช้งาน เพิ่ม แก้ไข ระงับสิทธิ์ และรีเซ็ตรหัสผ่าน',
      icon: Users,
      route: '/users' as AppRoute,
      badge: 'ผู้ใช้งาน',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      allowed: rbacService.can(currentUser, 'users.view'),
    },
    {
      id: 'roles',
      title: 'บทบาทและสิทธิ์ (RBAC Matrix)',
      subtitle: 'กำหนดสิทธิ์ 8 บทบาทองค์กร สิทธิ์ดู/สร้าง/แก้ไข/ลบ/อนุมัติ/ส่งออก',
      icon: Shield,
      route: '/settings/roles' as AppRoute,
      badge: 'RBAC 8 บทบาท',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      allowed: rbacService.can(currentUser, 'roles.view'),
    },
    {
      id: 'notifications',
      title: 'การแจ้งเตือนและเตือนความจำ',
      subtitle: 'ตั้งค่ากฎ Proactive Deadlines เตือนล่วงหน้า 30/15/7 วัน และช่องทางรับข่าว',
      icon: Bell,
      route: '/settings/notifications' as AppRoute,
      badge: 'การแจ้งเตือน',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      allowed: true,
    },
    {
      id: 'master-data',
      title: 'ศูนย์ข้อมูลกลางและรหัสมาตรฐาน',
      subtitle: '12 หมวดหมู่ข้อมูลหลัก: บุคลากร, คณะ, วิทยาเขต, หลักสูตร, ปีการศึกษา',
      icon: Layers,
      route: '/master-data' as AppRoute,
      badge: '12 หมวดหมู่',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      allowed: true,
    },
    {
      id: 'data-management',
      title: 'จัดการฐานข้อมูลและถังขยะ (Recycle Bin)',
      subtitle: 'ตรวจสอบจำนวนเรคคอร์ด กู้คืนข้อมูลที่ถูกลบ (Soft-delete) และสำรองฐานข้อมูล',
      icon: Database,
      route: '/data-management' as AppRoute,
      badge: 'SQLite & Backup',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      allowed: rbacService.can(currentUser, 'data.manage'),
    },
    {
      id: 'system-health',
      title: 'สถานะระบบและการตรวจสอบความพร้อม',
      subtitle: 'Preflight Production Check 15 มิติ, Integrity Checks และ Audit Logs',
      icon: Activity,
      route: '/admin/system-health' as AppRoute,
      badge: 'System Health',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      allowed: rbacService.can(currentUser, 'system.health'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B83B6F]">
            <Settings className="w-4 h-4 text-[#D94F87]" />
            <span>ระบบบริหารจัดการส่วนกลาง (Central Administration Hub)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            ตั้งค่าระบบบริหารงานวิชาการ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ศูนย์กลางการบริหารจัดการสิทธิ์ผู้ใช้งาน พารามิเตอร์วิชาการ ฐานข้อมูล และความปลอดภัยระบบ มจร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/admin/system-health')}
            leftIcon={<Activity className="w-4 h-4 text-emerald-600" />}
          >
            ตรวจสอบสถานะระบบ
          </Button>
        </div>
      </div>

      {/* Navigation Grid to Configuration Modules */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#D94F87]" />
          <span>โมดูลการตั้งค่าและการจัดการ (Configuration Modules)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => card.allowed && onNavigate(card.route)}
                className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                  card.allowed
                    ? 'cursor-pointer hover:border-[#D94F87]/60 group'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#D94F87]" />
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#B83B6F] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#B83B6F]">
                  <span>{card.allowed ? 'เข้าสู่การตั้งค่า' : 'ไม่มีสิทธิ์เข้าถึง'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Institutional Academic Parameters Form */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-[#FAFAFC] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#D94F87]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                พารามิเตอร์วิชาการและองค์กร (University Academic Parameters)
              </h2>
              <p className="text-[11px] text-slate-500">
                กำหนดปีการศึกษา ภาคการศึกษา และข้อมูลส่วนงานที่ใช้แสดงผลในแบบฟอร์ม มคอ. และรายงานมติ
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ระบบทำงานปกติ (Active)
          </span>
        </div>

        <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ปีการศึกษาปัจจุบัน (Academic Year)
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/30 focus:border-[#D94F87]"
                placeholder="2569"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">ใช้เป็นฐานอ้างอิงการจัดทำหลักสูตรและการลงทะเบียน</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ภาคการศึกษาปัจจุบัน (Semester)
              </label>
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/30 focus:border-[#D94F87] bg-white"
              >
                <option value="1">ภาคการศึกษาที่ 1</option>
                <option value="2">ภาคการศึกษาที่ 2</option>
                <option value="summer">ภาคฤดูร้อน</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">ภาคการศึกษาที่กำลังเปิดรับผลการเรียนรู้และเทียบโอน</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ปีงบประมาณปัจจุบัน (Fiscal Year)
              </label>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/30 focus:border-[#D94F87]"
                placeholder="2569"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">ใช้ในการกำกับแผนยุทธศาสตร์และเบิกจ่ายงบประมาณ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อหน่วยงานเจ้าของระบบ
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/30 focus:border-[#D94F87]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  อีเมลติดต่อส่วนกลาง
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/30 focus:border-[#D94F87]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เบอร์โทรศัพท์ภายใน
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/30 focus:border-[#D94F87]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#D94F87]" />
              <span>นโยบายความปลอดภัยและการสำรองข้อมูลอัตโนมัติ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#FAFAFC] rounded-lg border border-slate-200/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoBackup"
                  checked={autoBackupEnabled}
                  onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                  className="mt-0.5 rounded text-[#D94F87] focus:ring-[#D94F87]"
                />
                <div>
                  <label htmlFor="autoBackup" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    สำรองข้อมูลอัตโนมัติ (Daily Snapshot)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    จัดทำ Snapshot ฐานข้อมูล SQLite ทุกวันเวลา 02:00 น.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FAFAFC] rounded-lg border border-slate-200/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="enforceExpiry"
                  checked={enforcePasswordExpiry}
                  onChange={(e) => setEnforcePasswordExpiry(e.target.checked)}
                  className="mt-0.5 rounded text-[#D94F87] focus:ring-[#D94F87]"
                />
                <div>
                  <label htmlFor="enforceExpiry" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    บังคับเปลี่ยนรหัสผ่านทุก 90 วัน
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    เพื่อความปลอดภัยของบัญชีผู้ดูแลระบบและผู้บริหาร
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FAFAFC] rounded-lg border border-slate-200/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="emailAlerts"
                  checked={emailAlertsEnabled}
                  onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                  className="mt-0.5 rounded text-[#D94F87] focus:ring-[#D94F87]"
                />
                <div>
                  <label htmlFor="emailAlerts" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    แจ้งเตือนมติและเดดไลน์ทางอีเมล
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ส่งอีเมลสรุปวาระการประชุมสภาวิชาการล่วงหน้า 7 วัน
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าพารามิเตอร์'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
