/**
 * WorkflowTimelineModal
 * Full-detail modal presenting the entire workflow path, step requirements,
 * complete revision audit history, and timeline.
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  FileText,
  Paperclip,
  User,
  Shield,
  Calendar,
} from 'lucide-react';
import type { WorkflowInstance } from '../../types/workflow.ts';
import { WorkflowStatusStepper } from './WorkflowStatusStepper.tsx';
import { Modal } from '../ui/Modal.tsx';

export interface WorkflowTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: WorkflowInstance | null;
}

export const WorkflowTimelineModal: React.FC<WorkflowTimelineModalProps> = ({
  isOpen,
  onClose,
  instance,
}) => {
  if (!isOpen || !instance) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ประวัติกระบวนการและการอนุมัติ: ${instance.record_title}`}
      size="lg"
    >
      <div className="space-y-5 text-xs">
        {/* Stepper overview */}
        <WorkflowStatusStepper instance={instance} />

        {/* Detailed Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
            <span className="text-slate-400 block mb-1">รหัสเอกสาร / อ้างอิง</span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              {instance.record_code || instance.record_id}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">โมดูล: {instance.record_type}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
            <span className="text-slate-400 block mb-1">ผู้สร้างคำขอ</span>
            <div className="font-bold text-slate-800 text-sm">{instance.creator_name}</div>
            <p className="text-[11px] text-slate-500 mt-1">บทบาท: {instance.creator_role}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
            <span className="text-slate-400 block mb-1">ความเร่งด่วน / SLA</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  instance.priority === 'Critical'
                    ? 'bg-rose-500'
                    : instance.priority === 'High'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span>{instance.priority}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">ครบกำหนด: {instance.due_date}</p>
          </div>
        </div>

        {/* Chronological Audit Timeline */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#D94F87]" />
            <span>เส้นทางและบันทึกประวัติทุกขั้นตอน (Complete Audit Trail)</span>
          </h4>

          <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {instance.actions.map((act, index) => (
              <div key={act.id || index} className="relative pl-8">
                <span
                  className={`absolute left-2 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    act.action === 'Approve' || act.action === 'Complete'
                      ? 'border-emerald-500 text-emerald-600'
                      : act.action === 'Return' || act.action === 'Request Revision'
                      ? 'border-rose-500 text-rose-600'
                      : 'border-blue-500 text-blue-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                </span>

                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{act.user_name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {act.user_role}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          act.action === 'Approve'
                            ? 'bg-emerald-50 text-emerald-700'
                            : act.action === 'Return'
                            ? 'bg-rose-50 text-rose-700'
                            : act.action === 'Complete'
                            ? 'bg-slate-900 text-white'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {act.action === 'Return'
                          ? 'ตีกลับเพื่อแก้ไข'
                          : act.action === 'Approve'
                          ? 'อนุมัติ'
                          : act.action === 'Complete'
                          ? 'เสร็จสิ้น'
                          : act.action}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 mb-1">
                    การเปลี่ยนสถานะ: <span className="font-medium text-slate-700">{act.from_status}</span> &rarr;{' '}
                    <span className="font-bold text-slate-900">{act.to_status}</span>
                  </div>

                  {act.reason && (
                    <div className="text-xs font-semibold text-rose-800 bg-rose-50 p-2 rounded border border-rose-100 my-1.5">
                      เหตุผลที่ระบุ: {act.reason}
                    </div>
                  )}

                  {act.comment && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded my-1 italic">
                      “{act.comment}”
                    </p>
                  )}

                  {act.attachment_name && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded inline-flex">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{act.attachment_name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </Modal>
  );
};
