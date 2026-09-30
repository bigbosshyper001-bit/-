/**
 * WorkflowApprovalPanel
 * Reusable Approval Panel supporting:
 * - Current status, responsible role, reviewer, approver, deadline
 * - Contextual action buttons: [ส่งตรวจ], [อนุมัติ], [ตีกลับ], [ขอแก้ไข], [มอบหมายผู้อนุมัติแทน], [เสร็จสิ้น]
 * - Mandatory reason & comment on return/revision
 * - Delegation modal with audit trail
 * - Historical revision timeline
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  UserCheck,
  Clock,
  FileText,
  AlertTriangle,
  Paperclip,
  MessageSquare,
  Shield,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { UserProfile } from '../../types.ts';
import type {
  WorkflowInstance,
  ApprovalActionType,
  WorkflowHistoryEntry,
} from '../../types/workflow.ts';
import { workflowEngine } from '../../services/workflowEngine.ts';
import { centralDatabase } from '../../services/centralDatabase.ts';
import { Modal } from '../ui/Modal.tsx';
import { useToast } from '../ui/Toast.tsx';

export interface WorkflowApprovalPanelProps {
  instance: WorkflowInstance;
  currentUser: UserProfile;
  onActionComplete?: (updatedInstance: WorkflowInstance) => void;
  className?: string;
}

export const WorkflowApprovalPanel: React.FC<WorkflowApprovalPanelProps> = ({
  instance,
  currentUser,
  onActionComplete,
  className = '',
}) => {
  const { showToast } = useToast();

  // Modals state
  const [activeModal, setActiveModal] = useState<'return' | 'approve' | 'complete' | 'delegate' | 'reject' | null>(null);

  // Form states
  const [actionComment, setActionComment] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [selectedDelegateUserId, setSelectedDelegateUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available users for delegation from central database
  const userAccounts = centralDatabase.getUserAccounts?.() || [];
  const eligibleDelegates = userAccounts.filter(
    (u) => u.id !== currentUser.id && (u.status === 'active' || (u.status as string) === 'Active')
  );

  // Action Permissions check
  const canSubmit = workflowEngine.canExecuteAction(instance, 'Submit', currentUser).allowed;
  const canReview = workflowEngine.canExecuteAction(instance, 'Review', currentUser).allowed;
  const canApprove = workflowEngine.canExecuteAction(instance, 'Approve', currentUser).allowed;
  const canReturn = workflowEngine.canExecuteAction(instance, 'Return', currentUser).allowed;
  const canDelegate = workflowEngine.canExecuteAction(instance, 'Delegate', currentUser).allowed;
  const canComplete = workflowEngine.canExecuteAction(instance, 'Complete', currentUser).allowed;

  const handleExecute = (
    action: ApprovalActionType,
    payload?: {
      comment?: string;
      reason?: string;
      attachmentName?: string;
      delegatedToUser?: UserProfile;
    }
  ) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = workflowEngine.executeAction(instance.id, action, currentUser, payload);
      setIsSubmitting(false);
      setActiveModal(null);
      setActionComment('');
      setActionReason('');
      setAttachmentName('');
      setSelectedDelegateUserId('');

      if (res.success) {
        showToast('success', 'บันทึกการทำงานสำเร็จ', res.message);
        if (res.instance && onActionComplete) {
          onActionComplete(res.instance);
        }
      } else {
        showToast('error', 'ไม่สามารถดำเนินการได้', res.message);
      }
    }, 300);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionReason.trim()) {
      showToast('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณาระบุเหตุผลในการตีกลับแก้ไข');
      return;
    }
    if (!actionComment.trim()) {
      showToast('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณาระบุรายละเอียดข้อความที่ต้องปรับปรุงแก้ไข');
      return;
    }
    handleExecute('Return', {
      reason: actionReason,
      comment: actionComment,
      attachmentName: attachmentName.trim() || undefined,
    });
  };

  const handleDelegateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const delegateUser = eligibleDelegates.find((u) => u.id === selectedDelegateUserId);
    if (!delegateUser) {
      showToast('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกผู้รับมอบหมายอำนาจ');
      return;
    }

    const delegateProfile: UserProfile = {
      id: delegateUser.id,
      name: delegateUser.name,
      role: delegateUser.role,
      position: delegateUser.position,
      department: delegateUser.department,
      email: delegateUser.email,
      initials: delegateUser.name.slice(0, 2),
    };

    handleExecute('Delegate', {
      comment: actionComment || 'มอบหมายอำนาจการพิจารณาแทนตามคำสั่งปฏิบัติราชการ',
      delegatedToUser: delegateProfile,
    });
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 ${className}`}>
      {/* Panel Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-[#FAFAFC] rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#D94F87]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              ศูนย์การอนุมัติและสั่งการ (Approval Panel)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบตรวจสอบสิทธิ์และควบคุมกระบวนการแบบหลายระดับตามมาตรฐาน มจร
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">บทบาทปัจจุบัน:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]">
            <User className="w-3 h-3" />
            <span>{currentUser.role}</span>
          </span>
        </div>
      </div>

      {/* Meta Grid: Status, Assignee, Reviewer, Approver, Deadline */}
      <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 block font-medium">สถานะปัจจุบัน</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-xs ${
              instance.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : instance.status === 'Approved'
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : instance.status === 'Under Review'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : instance.status === 'Returned for Revision'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : instance.status === 'Submitted'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {instance.status}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 block font-medium">ผู้รับผิดชอบขั้นตอน</span>
          <p className="font-bold text-slate-800 truncate">
            {instance.assigned_role}
          </p>
          {instance.delegated_to_user_name && (
            <span className="inline-block text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              ผู้ปฏิบัติแทน: {instance.delegated_to_user_name}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 block font-medium">ผู้ยื่นเสนอ / ร่าง</span>
          <p className="font-semibold text-slate-800 truncate">
            {instance.creator_name}
          </p>
          <span className="text-[10px] text-slate-400">{instance.creator_role}</span>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 block font-medium">กำหนดส่ง (SLA Deadline)</span>
          <p className="font-bold text-slate-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{instance.due_date}</span>
          </p>
          {instance.due_date.includes('17 ก.ย.') && instance.status !== 'Completed' && (
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded inline-block">
              เกินกำหนด SLA
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-[#FAFAFC]/60">
        <div className="text-xs text-slate-500">
          {canApprove || canReview || canSubmit ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>คุณมีสิทธิ์ดำเนินการในขั้นตอนนี้</span>
            </span>
          ) : (
            <span className="text-slate-400">
              ต้องใช้สิทธิ์ <strong className="text-slate-600">{instance.assigned_role}</strong> หรือสลับบทบาทเพื่อดำเนินการ
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action: Submit / Re-submit */}
          {canSubmit && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                handleExecute('Submit', {
                  comment:
                    instance.status === 'Returned for Revision'
                      ? 'ส่งข้อมูลที่ปรับปรุงแก้ไขใหม่แล้ว'
                      : 'ส่งตรวจเอกสารเข้าสู่ระบบ',
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#D94F87] hover:bg-[#C23B73] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {instance.status === 'Returned for Revision' ? 'ส่งตรวจใหม่อีกครั้ง' : 'ส่งตรวจ (Submit)'}
              </span>
            </button>
          )}

          {/* Action: Review (Under review) */}
          {canReview && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleExecute('Review', { comment: 'รับเรื่องและอยู่ระหว่างกลั่นกรอง' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>รับเรื่องตรวจ (Review)</span>
            </button>
          )}

          {/* Action: Approve */}
          {canApprove && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setActiveModal('approve')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>อนุมัติ (Approve)</span>
            </button>
          )}

          {/* Action: Return for revision */}
          {canReturn && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setActiveModal('return')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>ตีกลับเพื่อแก้ไข (Return)</span>
            </button>
          )}

          {/* Action: Delegate */}
          {canDelegate && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setActiveModal('delegate')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>มอบหมายผู้อนุมัติแทน (Delegate)</span>
            </button>
          )}

          {/* Action: Complete */}
          {canComplete && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setActiveModal('complete')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>เสร็จสิ้นกระบวนการ (Complete)</span>
            </button>
          )}
        </div>
      </div>

      {/* Revision & Action History Timeline */}
      <div className="p-4 sm:p-5">
        <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#D94F87]" />
          <span>ประวัติการสั่งการและตีกลับ (Revision History & Audit Trail)</span>
        </h5>

        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {instance.history.length === 0 ? (
            <p className="text-xs text-slate-400 pl-7">ยังไม่มีบันทึกประวัติ</p>
          ) : (
            instance.history.map((h, i) => (
              <div key={h.id || i} className="relative pl-7 text-xs">
                {/* Node icon */}
                <span
                  className={`absolute left-1.5 top-1 -translate-x-1/2 w-4.5 h-4.5 rounded-full border-2 bg-white flex items-center justify-center ${
                    h.action === 'Approve' || h.action === 'Complete'
                      ? 'border-emerald-500 text-emerald-500'
                      : h.action === 'Return' || h.action === 'Request Revision'
                      ? 'border-rose-500 text-rose-500'
                      : h.is_delegation
                      ? 'border-amber-500 text-amber-500'
                      : 'border-[#D94F87] text-[#D94F87]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                </span>

                <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-3 rounded-lg transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{h.user_name}</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600 font-medium">
                        {h.user_role}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          h.action === 'Approve'
                            ? 'bg-emerald-50 text-emerald-700'
                            : h.action === 'Return'
                            ? 'bg-rose-50 text-rose-700'
                            : h.action === 'Complete'
                            ? 'bg-slate-900 text-white'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {h.action === 'Return'
                          ? 'ตีกลับเพื่อแก้ไข'
                          : h.action === 'Approve'
                          ? 'อนุมัติ'
                          : h.action === 'Complete'
                          ? 'เสร็จสิ้น'
                          : h.action === 'Submit'
                          ? 'ส่งตรวจ'
                          : h.action}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{h.timestamp}</span>
                  </div>

                  {h.reason && (
                    <div className="text-xs font-semibold text-rose-800 bg-rose-50/80 px-2 py-1 rounded mt-1.5 border border-rose-100">
                      เหตุผล: {h.reason}
                    </div>
                  )}

                  {h.comment && (
                    <p className="text-xs text-slate-600 mt-1 italic leading-relaxed">
                      “{h.comment}”
                    </p>
                  )}

                  {h.attachment_name && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 inline-flex">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      <span className="font-medium text-slate-700">{h.attachment_name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL 1: RETURN FOR REVISION */}
      {/* ========================================== */}
      {activeModal === 'return' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="ตีกลับเพื่อแก้ไข (Return for Revision)"
          size="md"
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                การตีกลับจะส่งรายการนี้ย้อนกลับไปยังผู้จัดทำ (<strong>{instance.creator_name}</strong>)
                และบันทึกลงในประวัติ Audit Trail อย่างถาวร
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เหตุผลหลักในการตีกลับ <span className="text-rose-500">*</span>
              </label>
              <select
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              >
                <option value="">-- เลือกเหตุผลในการตีกลับ --</option>
                <option value="เอกสารหลักฐานหรือ มคอ. ไม่ครบถ้วน">เอกสารหลักฐานหรือ มคอ. ไม่ครบถ้วน</option>
                <option value="ค่าเป้าหมาย KPI หรือแผนงบประมาณไม่สอดคล้อง">ค่าเป้าหมาย KPI หรือแผนงบประมาณไม่สอดคล้อง</option>
                <option value="ไม่ผ่านเกณฑ์มาตรฐานหลักสูตร อว./มจร">ไม่ผ่านเกณฑ์มาตรฐานหลักสูตร อว./มจร</option>
                <option value="ข้อความในร่างมติคลาดเคลื่อนจากผลการประชุม">ข้อความในร่างมติคลาดเคลื่อนจากผลการประชุม</option>
                <option value="ต้องปรับแก้ตามข้อเสนอแนะคณะกรรมการกลั่นกรอง">ต้องปรับแก้ตามข้อเสนอแนะคณะกรรมการกลั่นกรอง</option>
                <option value="อื่นๆ (โปรดระบุในคำอธิบาย)">อื่นๆ (โปรดระบุในคำอธิบาย)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำสั่งการและรายละเอียดที่ต้องแก้ไข <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={3}
                required
                placeholder="เช่น กรุณาแก้ไขค่าเป้าหมาย KPI จาก 45% เป็น 50% และแนบรายงานการประชุมสภาวิชาการฉบับรับรอง..."
                className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                แนบไฟล์ข้อเสนอแนะเพิ่มเติม (ถ้ามี)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="เช่น เอกสารข้อทักท้วง_วาระ_4.2.pdf"
                  className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
                />
                <button
                  type="button"
                  onClick={() => setAttachmentName('บันทึกทักท้วง_กองวิชาการ.pdf')}
                  className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
                >
                  ตัวอย่างไฟล์
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs cursor-pointer"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการตีกลับ (Confirm Return)'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* MODAL 2: APPROVE CONFIRMATION */}
      {/* ========================================== */}
      {activeModal === 'approve' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="ยืนยันการอนุมัติ (Approve Confirmation)"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm mb-1">ยืนยันการลงนามอนุมัติเอกสาร</span>
                <span>
                  ท่านกำลังจะอนุมัติ &quot;<strong>{instance.record_title}</strong>&quot; ในฐานะ <strong>{currentUser.name}</strong> ({currentUser.role})
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมายเหตุหรือคำสั่งการประกอบการอนุมัติ (ไม่บังคับ)
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={2}
                placeholder="เช่น อนุมัติตามเสนอ ให้กองวิชาการประสานงานส่วนงานที่เกี่ยวข้องต่อไป..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  handleExecute('Approve', {
                    comment: actionComment || 'อนุมัติตามเสนออย่างเป็นทางการ',
                  })
                }
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer"
              >
                {isSubmitting ? 'กำลังอนุมัติ...' : 'อนุมัติทันที (Approve)'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================== */}
      {/* MODAL 3: DELEGATE TASK */}
      {/* ========================================== */}
      {activeModal === 'delegate' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="มอบหมายผู้อนุมัติแทน (Delegate Task)"
          size="md"
        >
          <form onSubmit={handleDelegateSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                เมื่อมอบหมายแล้ว ผู้ได้รับมอบหมายจะมีอำนาจพิจารณาและอนุมัติงานนี้แทนท่าน
                พร้อมการบันทึก Audit Log เพื่อความโปร่งใส
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลือกผู้ปฏิบัติหน้าที่แทน <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedDelegateUserId}
                onChange={(e) => setSelectedDelegateUserId(e.target.value)}
                required
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              >
                <option value="">-- เลือกบุคลากรในกองวิชาการ --</option>
                {eligibleDelegates.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role} - {u.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เหตุผลและคำสั่งการมอบหมาย
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={2}
                placeholder="เช่น ติดภารกิจราชการต่างประเทศ มอบหมายรองผู้อำนวยการปฏิบัติหน้าที่แทนระหว่างวันที่ 18-22 ก.ย. 2569..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการมอบหมาย (Confirm Delegation)'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* MODAL 4: COMPLETE CONFIRMATION */}
      {/* ========================================== */}
      {activeModal === 'complete' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="เสร็จสิ้นกระบวนการ (Complete Workflow)"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              เมื่อเสร็จสิ้นกระบวนการ ระบบจะบันทึกสถานะ <strong>Completed</strong> ออกเลขรับและจัดเก็บเข้าสู่คลังเอกสารวิชาการ
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                บันทึกการจัดเก็บ (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="เช่น ออกคำสั่งเลขที่ มจร ๐๒/๒๕๖๙ เรียบร้อย..."
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  handleExecute('Complete', {
                    comment: actionComment || 'เสร็จสิ้นกระบวนการทำงานและบันทึกข้อมูลถาวร',
                  })
                }
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันเสร็จสิ้น (Confirm)'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
