import React, { useState } from 'react';
import { FileSignature, Building2, User, Calendar, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { PendingApprovalItem } from '../../data/executiveDashboardData.ts';
import type { AppRoute } from '../../types.ts';

export interface ApprovalDetailModalProps {
  item: PendingApprovalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
  onApproved?: (id: string) => void;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onNavigate,
  onApproved,
}) => {
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!item) return null;

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      showToast({
        title: 'อนุมัติ / ลงนามคำขอสำเร็จ',
        message: `ลงนามรับรอง "${item.title}" เรียบร้อยแล้ว`,
        type: 'success',
      });
      onApproved?.(item.id);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="พิจารณาลงนามและอนุมัติเอกสาร"
      description={`รหัสอ้างอิง: ${item.id} • หมวดหมู่: ${item.type}`}
      size="md"
    >
      <div className="space-y-4 py-2">
        {/* Document Title Card */}
        <div className="bg-[#FAFAFC] border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {item.type}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                item.daysRemaining <= 2
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              เหลือเวลา {item.daysRemaining} วัน
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {item.title}
          </h4>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">ผู้ยื่นคำขอ:</span>
            <span>{item.submitter}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">หน่วยงานต้นสังกัด:</span>
            <span>{item.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">วันที่เสนอเอกสาร:</span>
            <span>{item.submittedDate}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">
            เอกสารแนบและการตรวจสอบสิทธิ์:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-500">
            <li>ผ่านการตรวจสอบความถูกต้องโดยฝ่ายเลขานุการกองวิชาการแล้ว</li>
            <li>พร้อมสำหรับการลงนามรับรองตามขั้นตอนอำนาจบริหาร</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onNavigate(item.targetRoute as AppRoute);
            }}
          >
            เปิดดูเอกสารฉบับเต็ม
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              icon={<Check className="w-3.5 h-3.5" />}
              onClick={handleApprove}
            >
              อนุมัติ / ลงนาม
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
