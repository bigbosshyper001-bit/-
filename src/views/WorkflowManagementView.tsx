/**
 * WorkflowManagementView
 * Central Workflow & Approval Engine Dashboard for:
 * "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 * 
 * Features:
 * 1. Workflow Inbox (My Pending Approvals & Tasks)
 * 2. University-wide Workflow Tracker (18 Modules)
 * 3. Modular Workflow Step Configuration (Admin)
 * 4. Interactive Simulation Sandbox (The 8-step simulation test)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  UserCheck,
  Search,
  Filter,
  Layers,
  Settings,
  PlayCircle,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  User,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Inbox,
  Eye,
  RefreshCw,
} from 'lucide-react';
import type { UserProfile, AppRoute } from '../types.ts';
import type {
  Workflow,
  WorkflowInstance,
  WorkflowStep,
  WorkflowState,
  SupportedWorkflowModule,
} from '../types/workflow.ts';
import {
  workflowEngine,
  WORKFLOW_MODULES,
} from '../services/workflowEngine.ts';
import { rbacService } from '../services/rbacService.ts';
import { WorkflowStatusStepper } from '../components/workflow/WorkflowStatusStepper.tsx';
import { WorkflowApprovalPanel } from '../components/workflow/WorkflowApprovalPanel.tsx';
import { WorkflowTimelineModal } from '../components/workflow/WorkflowTimelineModal.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { ResponsiveTable } from '../components/ui/ResponsiveTable.tsx';
import { useToast } from '../components/ui/Toast.tsx';

export interface WorkflowManagementViewProps {
  currentUser: UserProfile;
  onNavigate?: (route: AppRoute) => void;
  onSwitchPersona?: (roleName: string) => void;
}

export const WorkflowManagementView: React.FC<WorkflowManagementViewProps> = ({
  currentUser,
  onNavigate,
  onSwitchPersona,
}) => {
  const { showToast } = useToast();

  // Active Tab: inbox | tracker | config | sandbox
  const [activeTab, setActiveTab] = useState<'inbox' | 'tracker' | 'config' | 'sandbox'>('inbox');

  // Reactive Workflow state
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [selectedInstanceForAction, setSelectedInstanceForAction] = useState<WorkflowInstance | null>(null);
  const [selectedInstanceForTimeline, setSelectedInstanceForTimeline] = useState<WorkflowInstance | null>(null);

  // Configuration Tab State
  const [configModuleKey, setConfigModuleKey] = useState<SupportedWorkflowModule>('meeting_resolutions');
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Sandbox State
  const [sandboxStep, setSandboxStep] = useState<number>(0);
  const [sandboxInstance, setSandboxInstance] = useState<WorkflowInstance | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Subscribe to Workflow Engine
  useEffect(() => {
    const unsub = workflowEngine.subscribe((updatedInstances) => {
      setInstances([...updatedInstances]);
      setWorkflows(workflowEngine.getWorkflows());
    });
    return unsub;
  }, []);

  // Sync editing workflow when config module changes
  useEffect(() => {
    const wf = workflowEngine.getWorkflowByModule(configModuleKey);
    if (wf) {
      setEditingWorkflow(JSON.parse(JSON.stringify(wf)));
    }
  }, [configModuleKey, workflows]);

  // Derived Counts
  const stats = useMemo(() => {
    const total = instances.length;
    const pendingReview = instances.filter((i) => i.status === 'Under Review' || i.status === 'Submitted').length;
    const returned = instances.filter((i) => i.status === 'Returned for Revision').length;
    const approved = instances.filter((i) => i.status === 'Approved').length;
    const completed = instances.filter((i) => i.status === 'Completed').length;
    const overdue = instances.filter(
      (i) => i.due_date && i.due_date.includes('17 ก.ย.') && i.status !== 'Completed'
    ).length;

    // My pending inbox items (either role match or delegated to me)
    const myPending = instances.filter((i) => {
      if (currentUser.role === 'Super Admin') return i.status !== 'Completed';
      const roleMatch = i.assigned_role === currentUser.role;
      const delegated = i.delegated_to_user_id === currentUser.id;
      return (roleMatch || delegated) && i.status !== 'Completed';
    }).length;

    return { total, pendingReview, returned, approved, completed, overdue, myPending };
  }, [instances, currentUser]);

  // Filtered Instances for Tracker
  const filteredTrackerInstances = useMemo(() => {
    return workflowEngine.getInstances({
      module: selectedModule as any,
      status: selectedStatus as any,
      search: searchQuery,
    });
  }, [instances, selectedModule, selectedStatus, searchQuery]);

  // Filtered Instances for Inbox (Only those needing current user's attention)
  const inboxInstances = useMemo(() => {
    return instances.filter((i) => {
      if (currentUser.role === 'Super Admin') return true;
      const roleMatch = i.assigned_role === currentUser.role;
      const delegated = i.delegated_to_user_id === currentUser.id;
      const isCreatorReturned = i.status === 'Returned for Revision' && i.creator_id === currentUser.id;
      return roleMatch || delegated || isCreatorReturned;
    });
  }, [instances, currentUser]);

  // ==========================================
  // CONFIGURATION HANDLERS
  // ==========================================
  const handleSaveWorkflowConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkflow) return;

    const ok = workflowEngine.updateWorkflow(editingWorkflow, currentUser);
    if (ok) {
      showToast('success', 'บันทึกสำเร็จ', `อัปเดตผังกระบวนการสำหรับ "${editingWorkflow.moduleLabel}" เรียบร้อยแล้ว`);
    } else {
      showToast('error', 'บันทึกไม่สำเร็จ', 'ไม่สามารถบันทึกการตั้งค่าได้');
    }
  };

  const handleStepRoleChange = (stepIndex: number, newRole: string) => {
    if (!editingWorkflow) return;
    const updated = { ...editingWorkflow };
    updated.steps[stepIndex].required_role = newRole;
    setEditingWorkflow(updated);
  };

  const handleStepSlaChange = (stepIndex: number, days: number) => {
    if (!editingWorkflow) return;
    const updated = { ...editingWorkflow };
    updated.steps[stepIndex].sla_days = days;
    setEditingWorkflow(updated);
  };

  const handleStepCanReturnToggle = (stepIndex: number) => {
    if (!editingWorkflow) return;
    const updated = { ...editingWorkflow };
    updated.steps[stepIndex].can_return = !updated.steps[stepIndex].can_return;
    setEditingWorkflow(updated);
  };

  // ==========================================
  // SIMULATION SANDBOX (THE 8-STEP LIFECYCLE)
  // ==========================================
  const startSimulation = () => {
    // Create new sandbox record
    const staffUser: UserProfile = {
      id: 'usr-3',
      name: 'นายคเชนทร์ วงศ์คำ',
      role: 'เจ้าหน้าที่',
      position: 'เจ้าหน้าที่บริหารงานวิชาการ',
      department: 'กองวิชาการ',
      email: 'staff.academic@mcu.ac.th',
      initials: 'คช',
    };

    const inst = workflowEngine.getOrCreateInstance(
      `sim-${Date.now()}`,
      'meeting_resolutions',
      'ข้อเสนอการจัดตั้งศูนย์วิจัยพระไตรปิฎกศึกษาดิจิทัล (Digital Tipitaka Center)',
      'วาระ 4.1/2569-SIM',
      'meeting',
      '/meetings',
      staffUser
    );

    setSandboxInstance(inst);
    setSandboxStep(1);
    showToast('info', 'เริ่มจำลองขั้นตอนที่ 1', 'เจ้าหน้าที่สร้างเอกสารร่างในระบบเรียบร้อยแล้ว');
  };

  const executeSandboxNextStep = () => {
    if (!sandboxInstance) return;

    const staffUser: UserProfile = {
      id: 'usr-3',
      name: 'นายคเชนทร์ วงศ์คำ',
      role: 'เจ้าหน้าที่',
      position: 'เจ้าหน้าที่บริหารงานวิชาการ',
      department: 'กองวิชาการ',
      email: 'staff.academic@mcu.ac.th',
      initials: 'คช',
    };

    const headUser: UserProfile = {
      id: 'usr-1',
      name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
      role: 'หัวหน้ากอง',
      position: 'ผู้อำนวยการกองวิชาการ',
      department: 'กองวิชาการ สำนักงานอธิการบดี',
      email: 'academic.director@mcu.ac.th',
      initials: 'วร',
    };

    const execUser: UserProfile = {
      id: 'usr-exec',
      name: 'พระพรหมบัณฑิต, ศ.ดร.',
      role: 'ผู้บริหาร',
      position: 'ประธานคณะกรรมการสภาวิชาการ',
      department: 'สำนักงานสภามหาวิทยาลัย',
      email: 'executive.council@mcu.ac.th',
      initials: 'พบ',
    };

    if (sandboxStep === 1) {
      // Step 2: เจ้าหน้าที่ส่งตรวจ
      const res = workflowEngine.executeAction(sandboxInstance.id, 'Submit', staffUser, {
        comment: 'จัดทำรายละเอียดโครงการพร้อมแผนงบประมาณและส่งตรวจเข้าสู่ระบบ',
      });
      if (res.instance) setSandboxInstance(res.instance);
      setSandboxStep(2);
      showToast('success', 'ขั้นตอนที่ 2: ส่งตรวจสำเร็จ', 'ส่งเรื่องเข้าสู่คิวการตรวจสอบของหัวหน้ากองวิชาการ');
    } else if (sandboxStep === 2) {
      // Step 3: หัวหน้ากองตรวจ
      const res = workflowEngine.executeAction(sandboxInstance.id, 'Review', headUser, {
        comment: 'รับเรื่องและอยู่ระหว่างตรวจทานความถูกต้องของระเบียบและงบประมาณ',
      });
      if (res.instance) setSandboxInstance(res.instance);
      setSandboxStep(3);
      showToast('info', 'ขั้นตอนที่ 3: รับเรื่องตรวจ', 'หัวหน้ากองตรวจทานความสอดคล้องกับระเบียบมหาวิทยาลัย');
    } else if (sandboxStep === 3) {
      // Step 4: หัวหน้ากองตีกลับเพื่อแก้ไข
      const res = workflowEngine.executeAction(sandboxInstance.id, 'Return', headUser, {
        reason: 'ค่าเป้าหมาย KPI และกรอบงบประมาณยังไม่สอดคล้องกับแผนยุทธศาสตร์',
        comment: 'กรุณาปรับลดงบประมาณจัดซื้อเซิร์ฟเวอร์ลง 15% และระบุความร่วมมือกับสำนักหอสมุดเพิ่มเติม',
        attachmentName: 'ข้อทักท้วง_วาระ4.1_งบประมาณ.pdf',
      });
      if (res.instance) setSandboxInstance(res.instance);
      setSandboxStep(4);
      showToast('warning', 'ขั้นตอนที่ 4: ตีกลับเพื่อแก้ไข', 'หัวหน้ากองส่งคืนเอกสารให้เจ้าหน้าที่แก้ไขพร้อมระบุเหตุผล');
    } else if (sandboxStep === 4) {
      // Step 5: เจ้าหน้าที่แก้ไข
      setSandboxStep(5);
      showToast('info', 'ขั้นตอนที่ 5: เจ้าหน้าที่ปรับปรุงข้อมูล', 'เจ้าหน้าที่ปรับแก้สัดส่วนงบประมาณและแนบเอกสารรับรองแล้ว');
    } else if (sandboxStep === 5) {
      // Step 6: เจ้าหน้าที่ส่งใหม่
      const res = workflowEngine.executeAction(sandboxInstance.id, 'Submit', staffUser, {
        comment: 'ปรับปรุงตามข้อทักท้วง: ลดงบประมาณ 15% และเพิ่มบันทึกข้อตกลงกับสำนักหอสมุดแล้ว',
      });
      if (res.instance) setSandboxInstance(res.instance);
      setSandboxStep(6);
      showToast('success', 'ขั้นตอนที่ 6: ส่งตรวจใหม่อีกครั้ง', 'ส่งเอกสารฉบับปรับปรุงเข้าสู่การพิจารณาของหัวหน้ากอง');
    } else if (sandboxStep === 6) {
      // Step 7: ผู้มีอำนาจอนุมัติ (หัวหน้ากองผ่านเรื่อง -> ผู้บริหารอนุมัติ)
      const resReview = workflowEngine.executeAction(sandboxInstance.id, 'Review', headUser, {
        comment: 'ตรวจสอบฉบับปรับปรุงแล้ว ผ่านเกณฑ์มาตรฐานทุกประการ เสนอผู้บริหารลงนาม',
      });
      const resApprove = workflowEngine.executeAction(sandboxInstance.id, 'Approve', execUser, {
        comment: 'อนุมัติตามเสนอ ให้กองวิชาการประสานดำเนินการจัดตั้งตามมติสภาวิชาการ',
      });
      if (resApprove.instance) setSandboxInstance(resApprove.instance);
      setSandboxStep(7);
      showToast('success', 'ขั้นตอนที่ 7: ผู้มีอำนาจอนุมัติ', 'พระพรหมบัณฑิต, ศ.ดร. ลงนามอนุมัติอย่างเป็นทางการ');
    } else if (sandboxStep === 7) {
      // Step 8: เสร็จสิ้น
      const res = workflowEngine.executeAction(sandboxInstance.id, 'Complete', staffUser, {
        comment: 'ออกเลขคำสั่งสภาวิชาการที่ ๑๔/๒๕๖๙ และบันทึกประวัติเสร็จสมบูรณ์',
      });
      if (res.instance) setSandboxInstance(res.instance);
      setSandboxStep(8);
      showToast('success', 'ขั้นตอนที่ 8: เสร็จสิ้นกระบวนการ', 'บันทึกเข้าสู่คลังเอกสารถาวรและแจ้งเตือนผู้เกี่ยวข้องเรียบร้อย');
    }
  };

  const handleRunAutoSandbox = () => {
    setIsAutoPlaying(true);
    startSimulation();

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= 8) {
        executeSandboxNextStep();
      } else {
        clearInterval(interval);
        setIsAutoPlaying(false);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6 text-[#D94F87]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  ระบบกระบวนการทำงานและการอนุมัติ (Workflow & Approval Engine)
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]">
                  18 โมดูลงานวิชาการ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                ขับเคลื่อนการบริหารจัดการองค์กรของกองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
                ผ่านกลไกควบคุมสถานะงาน การกลั่นกรอง ตรวจสอบ ตีกลับแก้ไข และลงนามอนุมัติตามระเบียบ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                workflowEngine.resetToDemo();
                showToast('info', 'รีเซ็ตข้อมูลเวิร์กโฟลว์', 'คืนค่าข้อมูลเริ่มต้นเรียบร้อยแล้ว');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเซ็ตตัวอย่าง</span>
            </button>

            {onSwitchPersona && (
              <button
                type="button"
                onClick={() => onSwitchPersona('หัวหน้ากอง')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#D94F87] hover:bg-[#C23B73] text-white shadow-2xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>สลับทดสอบเป็นหัวหน้ากอง</span>
              </button>
            )}
          </div>
        </div>

        {/* Metric Badges Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">กล่องงานของฉัน</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-[#B83B6F]">{stats.myPending}</span>
              <span className="text-[11px] text-slate-400">รายการ</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">รอการกลั่นกรอง</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-amber-600">{stats.pendingReview}</span>
              <span className="text-[11px] text-slate-400">รายการ</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">ตีกลับแก้ไข</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-rose-600">{stats.returned}</span>
              <span className="text-[11px] text-slate-400">รายการ</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">อนุมัติแล้ว</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-teal-600">{stats.approved}</span>
              <span className="text-[11px] text-slate-400">รายการ</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">เสร็จสมบูรณ์</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-emerald-600">{stats.completed}</span>
              <span className="text-[11px] text-slate-400">รายการ</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">เกินกำหนด SLA</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-rose-700">{stats.overdue}</span>
              <span className="text-[11px] text-rose-500 font-medium">เฝ้าระวัง</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'inbox'
                ? 'border-[#D94F87] text-[#B83B6F]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>กล่องงานรออนุมัติ (My Inbox)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FBE7EF] text-[#B83B6F] font-bold">
              {stats.myPending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'tracker'
                ? 'border-[#D94F87] text-[#B83B6F]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>ติดตามงานทั้งหมด (All Tracker)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
              {instances.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'border-[#D94F87] text-[#B83B6F]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งค่ากระบวนการ (Configuration)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sandbox'
                ? 'border-[#D94F87] text-[#B83B6F]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>จำลองการทำงานจริง (Simulation Sandbox)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              8 ขั้นตอน
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORKFLOW INBOX                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                รายการที่ต้องดำเนินการในบทบาท {currentUser.role}
              </h2>
              <p className="text-xs text-slate-500">
                แสดงงานที่มอบหมายให้ท่านหรือบทบาทของท่านเพื่อพิจารณา ตรวจทาน หรือสั่งการ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">ผู้ใช้งานปัจจุบัน:</span>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                {currentUser.name} ({currentUser.role})
              </span>
            </div>
          </div>

          {inboxInstances.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">ไม่มีงานค้างรอการดำเนินการ</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                ยอดเยี่ยม! ท่านได้ดำเนินการทุกขั้นตอนของงานในกล่องเข้าเรียบร้อยแล้ว
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {inboxInstances.map((inst) => (
                <div
                  key={inst.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 hover:border-[#F8CBDD] transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {inst.record_code || inst.id}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {inst.record_type}
                        </span>
                        {inst.priority === 'Critical' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                            ด่วนที่สุด
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {inst.record_title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        ผู้เสนอเรื่อง: <strong className="text-slate-700">{inst.creator_name}</strong> ({inst.creator_role})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInstanceForTimeline(inst)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ประวัติการสั่งการ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedInstanceForAction(inst)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#D94F87] hover:bg-[#C23B73] text-white shadow-2xs cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>เปิดแผงพิจารณา / อนุมัติ</span>
                      </button>
                    </div>
                  </div>

                  {/* Stepper overview */}
                  <WorkflowStatusStepper
                    instance={inst}
                    onOpenHistory={() => setSelectedInstanceForTimeline(inst)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UNIVERSITY-WIDE WORKFLOW TRACKER                                   */}
      {/* ========================================================================= */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          {/* Filters Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[240px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อเรื่อง รหัสเอกสาร หรือชื่อผู้เสนอ..."
                  className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
                />
              </div>

              {/* Module Filter */}
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              >
                <option value="all">ทุกโมดูลงานวิชาการ (18 โมดูล)</option>
                {WORKFLOW_MODULES.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.labelTh}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              >
                <option value="all">ทุกสถานะ (All States)</option>
                <option value="Draft">ร่างเอกสาร (Draft)</option>
                <option value="Submitted">ส่งตรวจ (Submitted)</option>
                <option value="Under Review">รอการตรวจสอบ (Under Review)</option>
                <option value="Returned for Revision">ตีกลับเพื่อแก้ไข (Returned)</option>
                <option value="Approved">อนุมัติแล้ว (Approved)</option>
                <option value="Completed">เสร็จสมบูรณ์ (Completed)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              พบ <strong>{filteredTrackerInstances.length}</strong> รายการ
            </div>
          </div>

          {/* Records Responsive Table */}
          <ResponsiveTable
            columns={[
              {
                key: 'record_title',
                title: 'รหัส / เรื่อง',
                render: (inst) => (
                  <div>
                    <div className="font-bold text-slate-900 line-clamp-1">
                      {inst.record_title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {inst.record_code || inst.id} &bull; เสนอโดย: {inst.creator_name}
                    </div>
                  </div>
                ),
              },
              {
                key: 'record_type',
                title: 'โมดูล',
                render: (inst) => (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium whitespace-nowrap">
                    {WORKFLOW_MODULES.find((m) => m.key === inst.record_type)?.labelTh || inst.record_type}
                  </span>
                ),
              },
              {
                key: 'current_step',
                title: 'สถานะกระบวนการ',
                render: (inst) => <WorkflowStatusStepper instance={inst} compact={true} />,
              },
              {
                key: 'assigned_role',
                title: 'ผู้รับผิดชอบปัจจุบัน',
                render: (inst) => (
                  <div>
                    <div className="font-semibold text-slate-800">{inst.assigned_role}</div>
                    {inst.delegated_to_user_name && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded">
                        แทน: {inst.delegated_to_user_name}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: 'due_date',
                title: 'กำหนดส่ง (SLA)',
                render: (inst) => (
                  <div>
                    <div className="text-slate-700 font-medium">{inst.due_date}</div>
                    {inst.completed_at && (
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        เสร็จสิ้นแล้ว
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: 'actions',
                title: 'การจัดการ',
                align: 'right',
                render: (inst) => (
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedInstanceForTimeline(inst)}
                      title="ดูประวัติไทม์ไลน์"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedInstanceForAction(inst)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#D94F87] text-white hover:bg-[#C23B73] cursor-pointer min-h-[36px]"
                    >
                      จัดการ
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredTrackerInstances}
            keyExtractor={(inst) => inst.id}
            emptyText="ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา"
            renderCard={(inst) => ({
              key: inst.id,
              rawItem: inst,
              title: inst.record_title,
              subtitle: `${inst.record_code || inst.id} • เสนอโดย ${inst.creator_name}`,
              badge: (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {WORKFLOW_MODULES.find((m) => m.key === inst.record_type)?.labelTh || inst.record_type}
                </span>
              ),
              statusBadge: (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  inst.status === 'Approved' || inst.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : inst.status === 'Returned for Revision' || inst.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {inst.current_step_name || inst.status}
                </span>
              ),
              fields: [
                {
                  label: 'ผู้รับผิดชอบปัจจุบัน',
                  value: inst.assigned_role,
                  icon: <UserCheck className="w-3.5 h-3.5" />,
                },
                {
                  label: 'กำหนดส่ง (SLA)',
                  value: inst.due_date,
                  icon: <Clock className="w-3.5 h-3.5" />,
                },
              ],
              actions: (
                <div className="flex items-center gap-2 w-full justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedInstanceForTimeline(inst)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 min-h-[38px] flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    ไทม์ไลน์
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInstanceForAction(inst)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#D94F87] text-white min-h-[38px] flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    จัดการ
                  </button>
                </div>
              ),
            })}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WORKFLOW CONFIGURATION (ADMIN)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'config' && editingWorkflow && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  กำหนดค่าขั้นตอนกระบวนการรายโมดูล (Configurable Workflow per Module)
                </h3>
                <p className="text-xs text-slate-500">
                  ผู้ดูแลระบบสามารถปรับบทบาทผู้มีอำนาจตรวจสอบ จำนวนวันกำหนดส่ง SLA และเงื่อนไขการตีกลับของแต่ละโมดูล
                </p>
              </div>

              {/* Module Chooser */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">เลือกโมดูล:</span>
                <select
                  value={configModuleKey}
                  onChange={(e) => setConfigModuleKey(e.target.value as SupportedWorkflowModule)}
                  className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white font-bold text-slate-800"
                >
                  {WORKFLOW_MODULES.map((m) => (
                    <option key={m.key} value={m.key}>
                      [{m.category}] {m.labelTh}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Workflow Config Form */}
            <form onSubmit={handleSaveWorkflowConfig} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อกระบวนการ</label>
                  <input
                    type="text"
                    value={editingWorkflow.name}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    กำหนดเวลาดำเนินการเริ่มต้น (วัน)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={editingWorkflow.defaultDeadlineDays}
                    onChange={(e) =>
                      setEditingWorkflow({
                        ...editingWorkflow,
                        defaultDeadlineDays: parseInt(e.target.value, 10) || 7,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Steps Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  ลำดับขั้นตอนการพิจารณา (Workflow Steps & Required Roles)
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5 w-12 text-center">ลำดับ</th>
                        <th className="px-4 py-2.5">ชื่อขั้นตอน</th>
                        <th className="px-4 py-2.5">สถานะงาน (State)</th>
                        <th className="px-4 py-2.5">บทบาทที่ต้องดำเนินการ (Required Role)</th>
                        <th className="px-4 py-2.5 text-center">SLA (วัน)</th>
                        <th className="px-4 py-2.5 text-center">อนุญาตให้ตีกลับ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editingWorkflow.steps.map((step, idx) => (
                        <tr key={step.id} className="hover:bg-slate-50/60">
                          <td className="px-3 py-3 text-center font-bold text-slate-400">
                            {step.order}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={step.name}
                              onChange={(e) => {
                                const copy = { ...editingWorkflow };
                                copy.steps[idx].name = e.target.value;
                                setEditingWorkflow(copy);
                              }}
                              className="w-full text-xs rounded border border-slate-200 px-2 py-1 font-medium"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              {step.state}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={step.required_role}
                              onChange={(e) => handleStepRoleChange(idx, e.target.value)}
                              className="text-xs rounded border border-slate-300 px-2.5 py-1 bg-white"
                            >
                              <option value="เจ้าหน้าที่">เจ้าหน้าที่ (Staff)</option>
                              <option value="หัวหน้ากอง">หัวหน้ากอง (Head of Division)</option>
                              <option value="ผู้บริหาร">ผู้บริหาร (Executive)</option>
                              <option value="ผู้ตรวจสอบ">ผู้ตรวจสอบ (Auditor)</option>
                              <option value="Super Admin">Super Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={step.sla_days}
                              onChange={(e) =>
                                handleStepSlaChange(idx, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-14 text-xs text-center rounded border border-slate-300 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={step.can_return}
                              onChange={() => handleStepCanReturnToggle(idx)}
                              className="rounded text-[#D94F87] focus:ring-[#D94F87]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const wf = workflowEngine.getWorkflowByModule(configModuleKey);
                    if (wf) setEditingWorkflow(JSON.parse(JSON.stringify(wf)));
                    showToast('info', 'ยกเลิกการเปลี่ยนแปลง', 'คืนค่าเดิมของโมดูลนี้แล้ว');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  รีเซ็ตค่า
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#D94F87] hover:bg-[#C23B73] text-white shadow-2xs cursor-pointer"
                >
                  บันทึกการตั้งค่าผังกระบวนการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTERACTIVE 8-STEP SIMULATION SANDBOX                               */}
      {/* ========================================================================= */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          {/* Sandbox Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900">
                    เครื่องมือจำลองขั้นตอนการอนุมัติเสมือนจริง (Interactive Simulation Sandbox)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  ทดสอบและตรวจสอบการทำงานของ Workflow Engine ครบทั้ง 8 สเต็ป:
                  เจ้าหน้าที่สร้าง &rarr; ส่งตรวจ &rarr; หัวหน้ากองตรวจ &rarr; ตีกลับ &rarr; เจ้าหน้าที่แก้ไข &rarr; ส่งใหม่ &rarr; ผู้มีอำนาจอนุมัติ &rarr; เสร็จสิ้น
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startSimulation}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>เริ่มการจำลองใหม่</span>
                </button>

                <button
                  type="button"
                  disabled={isAutoPlaying}
                  onClick={handleRunAutoSandbox}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAutoPlaying ? 'กำลังรันอัตโนมัติ...' : 'รันอัตโนมัติ 8 สเต็ป'}</span>
                </button>
              </div>
            </div>

            {/* 8-Step Visual Path */}
            <div className="py-4 border-y border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {[
                  { step: 1, title: 'เจ้าหน้าที่สร้าง', role: 'เจ้าหน้าที่' },
                  { step: 2, title: 'ส่งตรวจ', role: 'เจ้าหน้าที่' },
                  { step: 3, title: 'หัวหน้ากองตรวจ', role: 'หัวหน้ากอง' },
                  { step: 4, title: 'ตีกลับแก้ไข', role: 'หัวหน้ากอง' },
                  { step: 5, title: 'เจ้าหน้าที่แก้ไข', role: 'เจ้าหน้าที่' },
                  { step: 6, title: 'ส่งตรวจใหม่', role: 'เจ้าหน้าที่' },
                  { step: 7, title: 'ผู้บริหารอนุมัติ', role: 'ผู้บริหาร' },
                  { step: 8, title: 'เสร็จสิ้น', role: 'ระบบ/เจ้าหน้าที่' },
                ].map((s) => {
                  const isDone = sandboxStep > s.step;
                  const isCurrent = sandboxStep === s.step;
                  return (
                    <div
                      key={s.step}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? s.step === 4
                            ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200 font-bold'
                            : 'bg-[#FBE7EF] border-[#F8CBDD] text-[#B83B6F] ring-2 ring-[#F8CBDD] font-bold'
                          : isDone
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono">สเต็ป {s.step}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isCurrent && s.step === 4 ? (
                          <RotateCcw className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                        ) : null}
                      </div>
                      <div className="font-semibold truncate">{s.title}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{s.role}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulation Controller Action Button */}
            {sandboxInstance && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-600">
                  สเต็ปปัจจุบัน: <strong>ขั้นตอนที่ {sandboxStep} จาก 8</strong> &bull; สถานะ: &quot;{sandboxInstance.status}&quot;
                </div>

                {sandboxStep < 8 && (
                  <button
                    type="button"
                    onClick={executeSandboxNextStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#D94F87] hover:bg-[#C23B73] text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>ดำเนินการขั้นถัดไป (สเต็ป {sandboxStep + 1})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sandbox Live Record Display */}
          {sandboxInstance ? (
            <div className="space-y-4">
              <WorkflowStatusStepper
                instance={sandboxInstance}
                onOpenHistory={() => setSelectedInstanceForTimeline(sandboxInstance)}
              />

              <WorkflowApprovalPanel
                instance={sandboxInstance}
                currentUser={currentUser}
                onActionComplete={(updated) => setSandboxInstance(updated)}
              />
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <PlayCircle className="w-12 h-12 text-[#D94F87] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">พร้อมเริ่มจำลองขั้นตอนการอนุมัติ</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                กดปุ่ม &quot;เริ่มการจำลองใหม่&quot; หรือ &quot;รันอัตโนมัติ 8 สเต็ป&quot; เพื่อทดสอบระบบ
              </p>
              <button
                type="button"
                onClick={startSimulation}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#D94F87] hover:bg-[#C23B73] text-white shadow-2xs cursor-pointer"
              >
                เริ่มการทดสอบตอนนี้
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INTERACTIVE APPROVAL PANEL DIALOG                                  */}
      {/* ========================================================================= */}
      {selectedInstanceForAction && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInstanceForAction(null)}
          title={`พิจารณากระบวนการ: ${selectedInstanceForAction.record_title}`}
          size="lg"
        >
          <div className="space-y-4">
            <WorkflowStatusStepper instance={selectedInstanceForAction} />
            <WorkflowApprovalPanel
              instance={selectedInstanceForAction}
              currentUser={currentUser}
              onActionComplete={(updated) => {
                setSelectedInstanceForAction(updated);
                setInstances(workflowEngine.getInstances());
              }}
            />
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL TIMELINE & AUDIT HISTORY DIALOG                               */}
      {/* ========================================================================= */}
      <WorkflowTimelineModal
        isOpen={Boolean(selectedInstanceForTimeline)}
        onClose={() => setSelectedInstanceForTimeline(null)}
        instance={selectedInstanceForTimeline}
      />
    </div>
  );
};
