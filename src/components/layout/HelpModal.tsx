import React from 'react';
import { HelpCircle, Keyboard, BookOpen, Phone, Mail, Building } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ศูนย์ช่วยเหลือและแนะนำการใช้งาน"
      subtitle="ระบบบริหารจัดการกองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
      size="lg"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          เข้าใจแล้ว
        </Button>
      }
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Keyboard shortcuts */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-2.5">
            <Keyboard className="w-4 h-4 text-[#D94F87]" />
            <span>คีย์ลัดสำหรับระบบ (Keyboard Shortcuts)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FAFAFC] p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between p-1.5">
              <span className="text-slate-600">เปิด Command Palette / ค้นหาด่วน</span>
              <kbd className="font-mono text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs font-semibold">
                Ctrl + K / ⌘K
              </kbd>
            </div>
            <div className="flex items-center justify-between p-1.5">
              <span className="text-slate-600">ปิดหน้าต่าง / Modal / Drawer</span>
              <kbd className="font-mono text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs font-semibold">
                ESC
              </kbd>
            </div>
            <div className="flex items-center justify-between p-1.5">
              <span className="text-slate-600">สลับการเลือกในตาราง</span>
              <kbd className="font-mono text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs font-semibold">
                Space
              </kbd>
            </div>
            <div className="flex items-center justify-between p-1.5">
              <span className="text-slate-600">ยืนยันรายการ / Submit</span>
              <kbd className="font-mono text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs font-semibold">
                Enter
              </kbd>
            </div>
          </div>
        </div>

        {/* System architecture note */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-2">
            <BookOpen className="w-4 h-4 text-[#3977C8]" />
            <span>โครงสร้างและหลักเกณฑ์วิชาการ</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            ระบบบริหารจัดการกองวิชาการ ถูกออกแบบเพื่อรวบรวมภารกิจขับเคลื่อนงานวิชาการมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ทั้งการติดตามมติสภาวิชาการ, การประเมิน KPI ประจำปี, การบริหารจัดการหลักสูตรและ Credit Bank, การกำกับมาตรฐานวิชาการ (Regulatory), และการบริการแบบฟอร์มเอกสารกลาง
          </p>
        </div>

        {/* Contact info */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-2">
            <Building className="w-4 h-4 text-[#168C8C]" />
            <span>ติดต่อสนับสนุนงานระบบ</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>โทรศัพท์ภายใน: 1120, 1122 (กองวิชาการ)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>อีเมล: academic@mcu.ac.th</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
