import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Clock,
  CheckCircle2,
  Shield,
  Sliders,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  AlertTriangle,
  FileText,
  Handshake,
  Target,
  Cpu,
} from 'lucide-react';
import type { AppRoute } from '../types.ts';
import type {
  UserNotificationPreferences,
  NotificationCategory,
  ReminderRule,
} from '../types/notificationSystem.ts';
import { centralProactiveService } from '../services/centralProactiveService.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../components/ui/Toast.tsx';

export interface NotificationSettingsViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({
  onNavigate,
}) => {
  const { showToast } = useToast();

  const [prefs, setPrefs] = useState<UserNotificationPreferences>(() =>
    centralProactiveService.getPreferences()
  );

  const [reminderRules, setReminderRules] = useState<ReminderRule[]>(() =>
    centralProactiveService.getReminderRules()
  );

  // New Custom Rule Modal / Form State
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);
  const [customRuleName, setCustomRuleName] = useState('');
  const [customOffsetDays, setCustomOffsetDays] = useState(5);
  const [customPriority, setCustomPriority] = useState<'Important' | 'Urgent' | 'Normal' | 'Info'>('Important');

  const handleToggleCategory = (cat: NotificationCategory) => {
    setPrefs((prev) => ({
      ...prev,
      enabledCategories: {
        ...prev.enabledCategories,
        [cat]: !prev.enabledCategories[cat],
      },
    }));
  };

  const handleToggleReminderRule = (ruleId: string, currentEnabled: boolean) => {
    centralProactiveService.toggleReminderRule(ruleId, !currentEnabled);
    setReminderRules(centralProactiveService.getReminderRules());
  };

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRuleName.trim()) return;

    centralProactiveService.addCustomReminderRule({
      name: customRuleName,
      description: `การแจ้งเตือนกำหนดเอง ${customOffsetDays} วันก่อนครบกำหนด`,
      offsetDays: Number(customOffsetDays),
      type: 'custom',
      enabled: true,
      notificationPriority: customPriority,
    });

    setReminderRules(centralProactiveService.getReminderRules());
    setIsNewRuleOpen(false);
    setCustomRuleName('');
    showToast('success', 'เพิ่มกฎการแจ้งเตือน', `บันทึกกฎ "${customRuleName}" เรียบร้อยแล้ว`);
  };

  const handleSavePreferences = () => {
    centralProactiveService.updatePreferences(prefs);
    showToast(
      'success',
      'บันทึกการตั้งค่าสำเร็จ',
      'ปรับปรุงรูปแบบการแจ้งเตือนและการจัดส่งข้อความเรียบร้อย'
    );
  };

  const handleResetDefaults = () => {
    centralProactiveService.resetToDefault();
    setPrefs(centralProactiveService.getPreferences());
    setReminderRules(centralProactiveService.getReminderRules());
    showToast('info', 'คืนค่าเริ่มต้น', 'รีเซ็ตการตั้งค่าการแจ้งเตือนสู่ค่ามาตรฐานกองวิชาการ');
  };

  const categories: { key: NotificationCategory; label: string; desc: string; icon: any }[] = [
    {
      key: 'Approval',
      label: 'การอนุมัติ (Approval)',
      desc: 'คำขอเทียบโอน, ร่างหลักสูตร, เสนอวาระ และคำร้องที่ต้องลงนามพิจารณา',
      icon: CheckCircle2,
    },
    {
      key: 'Task',
      label: 'งานมอบหมาย (Task)',
      desc: 'งานที่ได้รับมอบหมายตามมติที่ประชุมสภาวิชาการ และภารกิจฝ่าย',
      icon: Clock,
    },
    {
      key: 'Deadline',
      label: 'เดดไลน์และงานค้าง (Deadline & Overdue)',
      desc: 'กำหนดเวลาส่งเล่ม มคอ., รายงานผลการดำเนินงาน และงานใกล้ครบกำหนด',
      icon: AlertTriangle,
    },
    {
      key: 'Meeting',
      label: 'การประชุมและมติ (Meeting)',
      desc: 'หนังสือนัดประชุม, วาระการประชุม และการประกาศมติที่ประชุมสภา',
      icon: Calendar,
    },
    {
      key: 'Document',
      label: 'เอกสารและคำสั่ง (Document)',
      desc: 'เอกสารกลาง, คำสั่งมหาวิทยาลัย และการแจ้งเตือนเอกสารใกล้หมดอายุ',
      icon: FileText,
    },
    {
      key: 'KPI',
      label: 'ตัวชี้วัดและแผนงาน (KPI & Strategy)',
      desc: 'รอบการประเมิน KPI ไตรมาส, ความคืบหน้าโครงการ และแผนปฏิบัติราชการ',
      icon: Target,
    },
    {
      key: 'MOU',
      label: 'บันทึกข้อตกลง (MOU & Collaboration)',
      desc: 'สัญญาความร่วมมือทางวิชาการ สถาบันคู่สัญญา และการหมดอายุ MOU',
      icon: Handshake,
    },
    {
      key: 'System',
      label: 'ระบบและความปลอดภัย (System)',
      desc: 'การสำรองข้อมูล, ตรวจสอบสิทธิ์ RBAC, ซิงค์ข้อมูล และ Audit Logs',
      icon: Cpu,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]">
              การกำหนดค่าผู้ใช้
            </span>
            <span className="text-xs text-slate-400">/settings/notifications</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            ตั้งค่าการแจ้งเตือนและการเตือนความจำ (Notification Preferences)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดช่องทางการรับแจ้งเตือน กฎเตือนล่วงหน้า (Reminder Rules) และการควบคุมการแจ้งเตือนซ้ำ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} leftIcon={<RotateCcw className="w-4 h-4" />}>
            คืนค่าเริ่มต้น
          </Button>
          <Button variant="primary" size="sm" onClick={handleSavePreferences} leftIcon={<Save className="w-4 h-4" />}>
            บันทึกการตั้งค่า
          </Button>
        </div>
      </div>

      {/* 1. In-App & Email Delivery Channels */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#B83B6F]" />
          1. ช่องทางการจัดส่งการแจ้งเตือน (Delivery Channels)
        </h2>

        <div className="space-y-3 pt-1">
          {/* In-app */}
          <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                การแจ้งเตือนภายในแอปพลิเคชัน (In-App Notifications)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                แสดงผลที่กระดิ่งมุมขวาบน (Notification Bell) และหน้าต่างแจ้งเตือนแบบ Drawer
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.inAppEnabled}
                onChange={(e) => setPrefs({ ...prefs, inAppEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B83B6F]" />
            </label>
          </div>

          {/* Email */}
          <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800">
                  การแจ้งเตือนทางอีเมล (Email Notifications)
                </h3>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                  Email-Ready Architecture
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                รองรับการเชื่อมต่อกับ SMTP หรือ Google Workspace Relay ในอนาคต
              </p>

              {prefs.emailEnabled && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-600">อีเมลปลายทาง:</span>
                  <input
                    type="email"
                    value={prefs.emailDestination || ''}
                    onChange={(e) => setPrefs({ ...prefs, emailDestination: e.target.value })}
                    className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                  />
                </div>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.emailEnabled}
                onChange={(e) => setPrefs({ ...prefs, emailEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B83B6F]" />
            </label>
          </div>

          {/* Duplicate Control & Quiet Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.groupDuplicates}
                  onChange={(e) => setPrefs({ ...prefs, groupDuplicates: e.target.checked })}
                  className="rounded border-slate-300 text-[#B83B6F] focus:ring-[#B83B6F] mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    การรวมการแจ้งเตือนที่ซ้ำซ้อน (Quiet / Duplicate Control)
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    ป้องกัน Notification Spam โดยรวมรายการที่เกิดซ้ำเข้าด้วยกัน
                  </span>
                </div>
              </label>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.quietHoursEnabled}
                  onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })}
                  className="rounded border-slate-300 text-[#B83B6F] focus:ring-[#B83B6F] mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    ช่วงเวลาเงียบสงบ (Quiet Hours)
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    พักการแจ้งเตือนที่ไม่เร่งด่วนระหว่างเวลา 21:00 - 06:00 น.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Configurable Reminder Rules */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B83B6F]" />
              2. กฎการเตือนความจำก่อนครบกำหนด (Configurable Reminder Rules)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              กำหนดให้ระบบแจ้งเตือนอัตโนมัติตามระยะเวลาที่กำหนด รองรับการสร้างกฎกำหนดเอง (Custom Rules)
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewRuleOpen(true)}
          >
            + เพิ่มกฎกำหนดเอง
          </Button>
        </div>

        <div className="space-y-2 pt-1">
          {reminderRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      rule.notificationPriority === 'Urgent'
                        ? 'bg-red-500 text-white'
                        : rule.notificationPriority === 'Important'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {rule.notificationPriority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => handleToggleReminderRule(rule.id, rule.enabled)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#B83B6F]" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Notification Categories (8 categories) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#B83B6F]" />
            3. หมวดหมู่การแจ้งเตือน (Notification Categories)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เลือกรับเฉพาะหมวดหมู่ที่เกี่ยวข้องกับภารกิจหน้าที่ของท่าน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isEnabled = prefs.enabledCategories[cat.key];

            return (
              <div
                key={cat.key}
                onClick={() => handleToggleCategory(cat.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'bg-[#FCFDFE] border-slate-200 hover:border-[#D94F87]/50'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Icon className="w-4 h-4 text-[#B83B6F]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{cat.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => {}}
                  className="rounded border-slate-300 text-[#B83B6F] focus:ring-[#B83B6F] mt-1 shrink-0"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Reminder Rule Modal */}
      {isNewRuleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCustomRule}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                เพิ่มกฎเตือนความจำกำหนดเอง (Custom Reminder Rule)
              </h3>
              <button
                type="button"
                onClick={() => setIsNewRuleOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อกฎการแจ้งเตือน *
                </label>
                <input
                  type="text"
                  required
                  value={customRuleName}
                  onChange={(e) => setCustomRuleName(e.target.value)}
                  placeholder="เช่น 5 วันก่อนครบกำหนดตรวจรับหลักสูตร"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ระยะเวลาแจ้งเตือนล่วงหน้า (วัน) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="365"
                  value={customOffsetDays}
                  onChange={(e) => setCustomOffsetDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ระดับความสำคัญที่แสดง (Priority Level)
                </label>
                <select
                  value={customPriority}
                  onChange={(e) => setCustomPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                >
                  <option value="Urgent">ด่วนที่สุด (Urgent)</option>
                  <option value="Important">สำคัญ (Important)</option>
                  <option value="Normal">ปกติ (Normal)</option>
                  <option value="Info">แจ้งทราบ (Info)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewRuleOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" variant="primary" size="sm">
                บันทึกกฎใหม่
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotificationSettingsView;
