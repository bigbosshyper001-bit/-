import React, { useState } from 'react';
import {
  CalendarPlus,
  Target,
  Layers,
  ShieldAlert,
  GraduationCap,
  Handshake,
  FileSpreadsheet,
  UploadCloud,
  X,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { useToast } from '../ui/Toast.tsx';

export type QuickActionType =
  | 'meeting'
  | 'kpi'
  | 'action_plan'
  | 'risk'
  | 'curriculum'
  | 'mou'
  | 'form'
  | 'document';

export interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCreated?: (type: QuickActionType, title: string) => void;
}

interface ActionOption {
  type: QuickActionType;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  colorClass: string;
}

const ACTION_OPTIONS: ActionOption[] = [
  {
    type: 'meeting',
    title: 'สร้างการประชุม',
    description: 'กำหนดวาระการประชุมสภาวิชาการ หรือคณะกรรมการกลั่นกรอง',
    icon: <CalendarPlus className="w-5 h-5" />,
    badge: 'สภาวิชาการ',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
  },
  {
    type: 'kpi',
    title: 'สร้าง KPI',
    description: 'กำหนดตัวชี้วัดความสำเร็จและเป้าหมายยุทธศาสตร์วิชาการ',
    icon: <Target className="w-5 h-5" />,
    badge: 'ยุทธศาสตร์',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300',
  },
  {
    type: 'action_plan',
    title: 'สร้าง Action Plan',
    description: 'เพิ่มโครงการและแผนปฏิบัติการพร้อมกรอบงบประมาณ',
    icon: <Layers className="w-5 h-5" />,
    badge: 'แผนปฏิบัติการ',
    colorClass: 'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-300',
  },
  {
    type: 'risk',
    title: 'สร้าง Risk',
    description: 'ระบุความเสี่ยงวิชาการพร้อมกำหนดมาตรการควบคุม (Mitigation)',
    icon: <ShieldAlert className="w-5 h-5" />,
    badge: 'ความเสี่ยง',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300',
  },
  {
    type: 'curriculum',
    title: 'สร้างหลักสูตร',
    description: 'ยื่นเสนอเปิดหลักสูตรใหม่หรือหลักสูตรปรับปรุงตามเกณฑ์ อว.',
    icon: <GraduationCap className="w-5 h-5" />,
    badge: 'หลักสูตร',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300',
  },
  {
    type: 'mou',
    title: 'สร้าง MOU',
    description: 'บันทึกข้อตกลงความร่วมมือทางวิชาการสถาบันในและต่างประเทศ',
    icon: <Handshake className="w-5 h-5" />,
    badge: 'ความร่วมมือ',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300',
  },
  {
    type: 'form',
    title: 'สร้างแบบฟอร์ม',
    description: 'สร้างแบบฟอร์มคำร้องและบริการอิเล็กทรอนิกส์ (E-Form)',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    badge: 'บริการ E-Form',
    colorClass: 'bg-sky-50 text-sky-700 border-sky-200 hover:border-sky-300',
  },
  {
    type: 'document',
    title: 'อัปโหลดเอกสาร',
    description: 'นำเข้าเอกสาร มติ ระเบียบ หรือรายงานวิชาการเข้าสู่คลังระบบ',
    icon: <UploadCloud className="w-5 h-5" />,
    badge: 'Document Center',
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300',
  },
];

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSuccessCreated,
}) => {
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<QuickActionType | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('กองวิชาการ ส่วนกลาง');
  const [extraField, setExtraField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedType(null);
    setTitle('');
    setDepartment('กองวิชาการ ส่วนกลาง');
    setExtraField('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedType) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const selectedOption = ACTION_OPTIONS.find((opt) => opt.type === selectedType);
      showToast({
        title: `สร้าง${selectedOption?.title || 'รายการ'}สำเร็จ`,
        message: `บันทึก "${title}" เข้าสู่ระบบสารสนเทศกองวิชาการเรียบร้อยแล้ว`,
        type: 'success',
      });

      onSuccessCreated?.(selectedType, title);
      handleClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        selectedType
          ? `${ACTION_OPTIONS.find((o) => o.type === selectedType)?.title}`
          : 'สร้างรายการใหม่ (Quick Action)'
      }
      description={
        selectedType
          ? 'กรอกข้อมูลรายละเอียดเพื่อบันทึกเข้าสู่ระบบสารสนเทศกองวิชาการ'
          : 'เลือกประเภทรายการที่ต้องการสร้างเพื่อเข้าสู่แบบฟอร์มบันทึกข้อมูล'
      }
      size="lg"
    >
      {!selectedType ? (
        // Step 1: Grid Selection of 8 Options
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          {ACTION_OPTIONS.map((option) => (
            <div
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${option.colorClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs">
                    {option.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                    {option.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {option.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {option.description}
                </p>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                คลิกเพื่อเริ่มต้น &rarr;
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Step 2: Dynamic Form for Chosen Type
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <button
            type="button"
            onClick={() => setSelectedType(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            ย้อนกลับไปเลือกประเภทอื่น
          </button>

          <Input
            label={
              selectedType === 'meeting'
                ? 'ชื่อการประชุม / คณะกรรมการ'
                : selectedType === 'kpi'
                ? 'ชื่อตัวชี้วัด (KPI Title)'
                : selectedType === 'action_plan'
                ? 'ชื่อโครงการ / แผนปฏิบัติการ'
                : selectedType === 'risk'
                ? 'ชื่อความเสี่ยงวิชาการ'
                : selectedType === 'curriculum'
                ? 'ชื่อหลักสูตร (ไทย/อังกฤษ)'
                : selectedType === 'mou'
                ? 'ชื่อสถาบันภาคีข้อตกลงความร่วมมือ'
                : selectedType === 'form'
                ? 'ชื่อแบบฟอร์มคำร้อง'
                : 'ชื่อเอกสาร / ระเบียบวิชาการ'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ระบุข้อความ..."
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หน่วยงานที่รับผิดชอบ
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#FAFAFC] border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium outline-none focus:border-[#D94F87]"
            >
              <option value="กองวิชาการ ส่วนกลาง">กองวิชาการ สำนักงานอธิการบดี</option>
              <option value="ฝ่ายเลขานุการสภาวิชาการ">ฝ่ายเลขานุการสภาวิชาการ</option>
              <option value="ศูนย์ Credit Bank มจร">ศูนย์ Credit Bank มจร</option>
              <option value="คณะพุทธศาสตร์">คณะพุทธศาสตร์</option>
              <option value="คณะครุศาสตร์">คณะครุศาสตร์</option>
              <option value="คณะมนุษยศาสตร์">คณะมนุษยศาสตร์</option>
              <option value="คณะสังคมศาสตร์">คณะสังคมศาสตร์</option>
              <option value="บัณฑิตวิทยาลัย">บัณฑิตวิทยาลัย</option>
              <option value="วิทยาลัยพระธรรมทูต">วิทยาลัยพระธรรมทูต</option>
            </select>
          </div>

          {/* Contextual Extra Field */}
          {selectedType === 'kpi' && (
            <Input
              label="ค่าเป้าหมายและหน่วยนับ (เช่น 85 % หรือ 20 หลักสูตร)"
              value={extraField}
              onChange={(e) => setExtraField(e.target.value)}
              placeholder="เช่น 90 %"
            />
          )}

          {selectedType === 'risk' && (
            <Input
              label="มาตรการควบคุมความเสี่ยงเบื้องต้น (Mitigation)"
              value={extraField}
              onChange={(e) => setExtraField(e.target.value)}
              placeholder="ระบุแนวทางป้องกัน..."
            />
          )}

          {selectedType === 'action_plan' && (
            <Input
              label="กรอบงบประมาณโครงการ (บาท)"
              value={extraField}
              onChange={(e) => setExtraField(e.target.value)}
              placeholder="เช่น 1,500,000"
            />
          )}

          {selectedType === 'mou' && (
            <Input
              label="ประเทศ / วัตถุประสงค์ความร่วมมือ"
              value={extraField}
              onChange={(e) => setExtraField(e.target.value)}
              placeholder="เช่น ประเทศอินเดีย (แลกเปลี่ยนคณาจารย์และนิสิต)"
            />
          )}

          <div className="p-3 bg-[#FAFAFC] border border-slate-100 rounded-lg text-[11px] text-slate-500">
            ระบบจะสร้างเลขรหัสกำกับอัตโนมัติ และบันทึกลงในทะเบียนข้อมูลกลางของกองวิชาการ
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              icon={<Check className="w-3.5 h-3.5" />}
            >
              บันทึกสร้างรายการ
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
