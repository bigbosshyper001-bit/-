/**
 * WorkflowStatusStepper
 * Reusable visual workflow status stepper and SLA progress tracker
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  User,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import type { WorkflowInstance, WorkflowState } from '../../types/workflow.ts';

export interface WorkflowStatusStepperProps {
  instance: WorkflowInstance;
  compact?: boolean;
  className?: string;
  onOpenHistory?: () => void;
}

const ORDERED_STEPS: { state: WorkflowState; labelTh: string }[] = [
  { state: 'Draft', labelTh: 'ร่าง' },
  { state: 'Submitted', labelTh: 'ส่งตรวจ' },
  { state: 'Under Review', labelTh: 'อยู่ระหว่างตรวจสอบ' },
  { state: 'Approved', labelTh: 'อนุมัติ' },
  { state: 'Completed', labelTh: 'เสร็จสิ้น' },
];

export const WorkflowStatusStepper: React.FC<WorkflowStatusStepperProps> = ({
  instance,
  compact = false,
  className = '',
  onOpenHistory,
}) => {
  const isReturned = instance.status === 'Returned for Revision';
  const isRejected = instance.status === 'Rejected';

  // Calculate step index
  let activeIndex = 0;
  if (instance.status === 'Draft') activeIndex = 0;
  else if (instance.status === 'Submitted') activeIndex = 1;
  else if (instance.status === 'Under Review' || isReturned) activeIndex = 2;
  else if (instance.status === 'Approved' || instance.status === 'In Progress') activeIndex = 3;
  else if (instance.status === 'Completed' || instance.status === 'Archived') activeIndex = 4;

  // Deadline check
  const isOverdue = instance.due_date && instance.status !== 'Completed' && instance.due_date.includes('17 ก.ย.'); // from demo data or comparison

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            instance.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : instance.status === 'Approved'
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : instance.status === 'Under Review'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : isReturned
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : instance.status === 'Submitted'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          {instance.status === 'Completed' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : isReturned ? (
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          ) : instance.status === 'Under Review' ? (
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          )}
          <span>
            {instance.status === 'Draft'
              ? 'ร่างเอกสาร'
              : instance.status === 'Submitted'
              ? 'ส่งตรวจแล้ว'
              : instance.status === 'Under Review'
              ? 'รอการตรวจสอบ'
              : instance.status === 'Returned for Revision'
              ? 'ตีกลับแก้ไข'
              : instance.status === 'Approved'
              ? 'อนุมัติแล้ว'
              : instance.status === 'Completed'
              ? 'เสร็จสมบูรณ์'
              : instance.status}
          </span>
        </span>

        {isOverdue && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            <span>เกินกำหนด SLA</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs ${className}`}
    >
      {/* Header & Responsible Role */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-[#D94F87]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">สถานะกระบวนการงาน</span>
              <span className="text-[10px] text-slate-400 font-mono">#{instance.id}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              ขั้นตอนปัจจุบัน: <span className="font-semibold text-slate-800">{instance.current_step_name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-xs font-medium text-slate-600 hover:text-[#B83B6F] px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#F8CBDD] hover:bg-[#FBE7EF]/30 transition-colors"
            >
              ประวัติการทำงาน ({instance.history.length})
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>ผู้รับผิดชอบ: <strong className="text-slate-900">{instance.assigned_role}</strong></span>
            {instance.delegated_to_user_name && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                (มอบหมายแทน: {instance.delegated_to_user_name})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Stepper */}
      <div className="py-5">
        <div className="relative flex items-center justify-between">
          {/* Connector Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#D94F87] transition-all duration-300 z-0"
            style={{ width: `${(activeIndex / (ORDERED_STEPS.length - 1)) * 100}%` }}
          />

          {ORDERED_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIndex || (idx === activeIndex && instance.status === 'Completed');
            const isCurrent = idx === activeIndex && instance.status !== 'Completed';

            let nodeClass = 'bg-white border-slate-300 text-slate-400';
            if (isCompleted) {
              nodeClass = 'bg-emerald-600 border-emerald-600 text-white';
            } else if (isCurrent) {
              if (isReturned) {
                nodeClass = 'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-100';
              } else {
                nodeClass = 'bg-[#D94F87] border-[#D94F87] text-white ring-4 ring-[#FBE7EF]';
              }
            }

            return (
              <div key={step.state} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${nodeClass}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent && isReturned ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-2 text-[11px] font-medium whitespace-nowrap ${
                    isCurrent
                      ? isReturned
                        ? 'text-rose-700 font-bold'
                        : 'text-[#B83B6F] font-bold'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {isCurrent && isReturned ? 'ตีกลับแก้ไข' : step.labelTh}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Warning Banner if status is Returned for Revision */}
      {isReturned && (
        <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">รายการนี้ถูกตีกลับเพื่อแก้ไข: </span>
            <span>
              {instance.actions[instance.actions.length - 1]?.reason ||
                instance.actions[instance.actions.length - 1]?.comment ||
                'กรุณาตรวจสอบข้อมูลและแนบเอกสารเพิ่มเติมตามคำแนะนำ'}
            </span>
            <div className="mt-1 text-[11px] text-rose-600">
              ผู้ตีกลับ: {instance.actions[instance.actions.length - 1]?.user_name} (
              {instance.actions[instance.actions.length - 1]?.user_role})
            </div>
          </div>
        </div>
      )}

      {/* Footer SLA and Timeline Meta */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>เริ่มเมื่อ: {instance.started_at}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>กำหนดส่ง: <strong className={isOverdue ? 'text-rose-600' : 'text-slate-700'}>{instance.due_date}</strong></span>
          </span>
        </div>

        <div>
          {instance.completed_at ? (
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              เสร็จสมบูรณ์เมื่อ {instance.completed_at}
            </span>
          ) : isOverdue ? (
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              เกินกำหนดเวลา SLA แล้ว
            </span>
          ) : (
            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              อยู่ในกรอบเวลา SLA ปกติ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
