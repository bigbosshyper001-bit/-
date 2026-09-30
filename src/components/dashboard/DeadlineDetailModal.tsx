import React from 'react';
import { Clock, Calendar, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import type { UpcomingDeadlineItem } from '../../data/executiveDashboardData.ts';
import type { AppRoute } from '../../types.ts';

export interface DeadlineDetailModalProps {
  item: UpcomingDeadlineItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const DeadlineDetailModal: React.FC<DeadlineDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="รายละเอียดกำหนดส่งงาน (Task Deadline)"
      description={`รหัสอ้างอิง: ${item.id} • หมวดหมู่: ${item.category}`}
      size="md"
    >
      <div className="space-y-4 py-2">
        <div
          className={`p-4 rounded-xl border ${
            item.urgencyLevel === 'red'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : item.urgencyLevel === 'orange'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">
              {item.urgencyLevel === 'red'
                ? 'ครบกำหนดในระยะวิกฤต'
                : item.urgencyLevel === 'orange'
                ? 'ใกล้ถึงกำหนดส่ง'
                : 'ตามกำหนดเวลาปกติ'}
            </span>
            <span className="text-sm font-black font-mono">
              เหลืออีก {item.daysLeft} วัน
            </span>
          </div>
          <h4 className="text-sm font-bold leading-snug">{item.title}</h4>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">กำหนดเส้นตาย (Deadline):</span>
            <span className="font-semibold text-slate-900">{item.deadlineDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">หน่วยงานผู้รับผิดชอบ:</span>
            <span>{item.department}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">ข้อแนะนำเชิงปฏิบัติการ:</p>
          <p className="text-[11px] text-slate-500">
            โปรดประสานงานเจ้าหน้าที่ผู้รับผิดชอบโดยตรง เพื่อให้จัดส่งเอกสารหรือเล่มหลักสูตรให้ทันตามกรอบเวลา
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิด
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              onNavigate(item.targetRoute as AppRoute);
            }}
          >
            เปิดดูรายละเอียดในโมดูลงาน
          </Button>
        </div>
      </div>
    </Modal>
  );
};
