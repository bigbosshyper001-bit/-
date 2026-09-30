import React, { useState, useMemo } from 'react';
import {
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Filter,
  CheckCheck,
  Sparkles,
  UserCheck,
  FileCheck,
  Bookmark,
  Plus,
} from 'lucide-react';
import type { AppRoute, UserProfile } from '../types.ts';
import type { DeadlineRecord, DeadlineCalculation } from '../types/notificationSystem.ts';
import { centralProactiveService } from '../services/centralProactiveService.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../components/ui/Toast.tsx';

export interface MyWorkViewProps {
  currentUser: UserProfile | null;
  onNavigate: (route: AppRoute) => void;
}

type MyWorkTab = 'today' | 'due_soon_7' | 'overdue' | 'approvals' | 'tracked';

export const MyWorkView: React.FC<MyWorkViewProps> = ({ currentUser, onNavigate }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<MyWorkTab>('today');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // New task form state for test scenario
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-09-22');
  const [newAssignee, setNewAssignee] = useState(currentUser?.name || 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.');
  const [newDepartment, setNewDepartment] = useState('กองวิชาการ สำนักงานอธิการบดี');

  // Trigger reactive re-renders
  const [tick, setTick] = useState(0);

  React.useEffect(() => {
    return centralProactiveService.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const referenceDate = useMemo(() => new Date('2026-09-19T00:00:00'), []);

  // Compute My Work segments
  const myWorkData = useMemo(() => {
    return centralProactiveService.getMyWorkData(currentUser, referenceDate);
  }, [currentUser, referenceDate, tick]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const taskId = `TASK-DL-${Date.now().toString().slice(-4)}`;

    centralProactiveService.onTaskAssigned({
      id: taskId,
      title: newTitle,
      assigneeName: newAssignee,
      deadline: newDueDate,
      department: newDepartment,
      module: 'meetings',
      actionLink: '/meetings',
    });

    showToast(
      'success',
      'มอบหมายงานสำเร็จ',
      `งาน "${newTitle}" ถูกมอบหมายให้ ${newAssignee} เรียบร้อยแล้ว (ระบบส่งการแจ้งเตือนทันที)`
    );

    setNewTitle('');
    setIsNewTaskModalOpen(false);
  };

  const handleMarkTaskComplete = (item: DeadlineRecord) => {
    centralProactiveService.createOrUpdateDeadline({
      ...item,
      status: 'completed',
    });

    showToast(
      'success',
      'บันทึกผลสำเร็จ',
      `งาน "${item.title}" ปรับปรุงสถานะเป็นดำเนินการเสร็จสิ้นเรียบร้อย`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]">
              ศูนย์รวมภารกิจบุคคล
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ผู้ปฏิบัติงาน: {currentUser?.name || 'กองวิชาการ'} ({currentUser?.role || 'เจ้าหน้าที่'})
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            งานของฉัน (My Work & Assigned Tasks)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามงานที่ต้องทำวันนี้ งานใกล้ครบกำหนดใน 7 วัน งานค้างเกินกำหนด และรายการรอการอนุมัติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/calendar')}
            leftIcon={<Calendar className="w-4 h-4 text-slate-600" />}
            className="min-h-[40px]"
          >
            ปฏิทินงาน
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewTaskModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="min-h-[40px]"
          >
            สร้าง/มอบหมายงานใหม่
          </Button>
        </div>
      </div>

      {/* 5 Structural Navigation Tabs - horizontal scroll on small mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {/* 1. Today */}
        <button
          onClick={() => setActiveTab('today')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'today'
              ? 'bg-[#B83B6F] text-white border-[#B83B6F] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                activeTab === 'today' ? 'text-white/90' : 'text-slate-500'
              }`}
            >
              วันนี้
            </span>
            <Clock
              className={`w-4 h-4 ${
                activeTab === 'today' ? 'text-white' : 'text-[#B83B6F]'
              }`}
            />
          </div>
          <div className="text-2xl font-bold mt-1">
            {myWorkData.todayItems.length}
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              activeTab === 'today' ? 'text-white/80' : 'text-slate-400'
            }`}
          >
            งานที่ต้องทำวันนี้
          </p>
        </button>

        {/* 2. Due Soon 7 Days */}
        <button
          onClick={() => setActiveTab('due_soon_7')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'due_soon_7'
              ? 'bg-[#B83B6F] text-white border-[#B83B6F] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                activeTab === 'due_soon_7' ? 'text-white/90' : 'text-slate-500'
              }`}
            >
              ใกล้ครบกำหนด
            </span>
            <Calendar
              className={`w-4 h-4 ${
                activeTab === 'due_soon_7' ? 'text-white' : 'text-amber-600'
              }`}
            />
          </div>
          <div className="text-2xl font-bold mt-1">
            {myWorkData.dueSoon7Days.length}
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              activeTab === 'due_soon_7' ? 'text-white/80' : 'text-slate-400'
            }`}
          >
            ภายใน 7 วัน
          </p>
        </button>

        {/* 3. Overdue */}
        <button
          onClick={() => setActiveTab('overdue')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-[#B83B6F] text-white border-[#B83B6F] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                activeTab === 'overdue' ? 'text-white/90' : 'text-slate-500'
              }`}
            >
              เกินกำหนด
            </span>
            <AlertCircle
              className={`w-4 h-4 ${
                activeTab === 'overdue' ? 'text-white' : 'text-rose-600'
              }`}
            />
          </div>
          <div className="text-2xl font-bold mt-1 text-rose-600">
            <span className={activeTab === 'overdue' ? 'text-white' : ''}>
              {myWorkData.overdueItems.length}
            </span>
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              activeTab === 'overdue' ? 'text-white/80' : 'text-rose-600 font-medium'
            }`}
          >
            งานค้างส่ง
          </p>
        </button>

        {/* 4. Approvals */}
        <button
          onClick={() => setActiveTab('approvals')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-[#B83B6F] text-white border-[#B83B6F] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                activeTab === 'approvals' ? 'text-white/90' : 'text-slate-500'
              }`}
            >
              รอการอนุมัติ
            </span>
            <FileCheck
              className={`w-4 h-4 ${
                activeTab === 'approvals' ? 'text-white' : 'text-emerald-600'
              }`}
            />
          </div>
          <div className="text-2xl font-bold mt-1">
            {myWorkData.pendingApprovalItems.length}
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              activeTab === 'approvals' ? 'text-white/80' : 'text-slate-400'
            }`}
          >
            Approval tasks
          </p>
        </button>

        {/* 5. Tracked items */}
        <button
          onClick={() => setActiveTab('tracked')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'tracked'
              ? 'bg-[#B83B6F] text-white border-[#B83B6F] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                activeTab === 'tracked' ? 'text-white/90' : 'text-slate-500'
              }`}
            >
              ติดตาม
            </span>
            <Bookmark
              className={`w-4 h-4 ${
                activeTab === 'tracked' ? 'text-white' : 'text-indigo-600'
              }`}
            />
          </div>
          <div className="text-2xl font-bold mt-1">
            {myWorkData.trackedItems.length}
          </div>
          <p
            className={`text-[11px] mt-0.5 ${
              activeTab === 'tracked' ? 'text-white/80' : 'text-slate-400'
            }`}
          >
            Assigned items
          </p>
        </button>
      </div>

      {/* Task List Panel */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            {activeTab === 'today' && 'งานที่ต้องทำวันนี้ (Due Today)'}
            {activeTab === 'due_soon_7' && 'งานใกล้ครบกำหนดส่งใน 7 วัน (Due in 7 Days)'}
            {activeTab === 'overdue' && 'งานค้างและรายการที่เกินกำหนด (Overdue Tasks)'}
            {activeTab === 'approvals' && 'รายการรอการพิจารณาและลงนามอนุมัติ (Approval Tasks)'}
            {activeTab === 'tracked' && 'งานที่ได้รับมอบหมายทั้งหมด (All Assigned Items)'}
          </h2>
          <span className="text-xs text-slate-500">
            ระบบคำนวณวันคงเหลือแบบอัตโนมัติ Real-time
          </span>
        </div>

        {/* List Content */}
        {(() => {
          let currentList: { record: DeadlineRecord; calc: DeadlineCalculation }[] = [];
          if (activeTab === 'today') currentList = myWorkData.todayItems;
          else if (activeTab === 'due_soon_7') currentList = myWorkData.dueSoon7Days;
          else if (activeTab === 'overdue') currentList = myWorkData.overdueItems;
          else if (activeTab === 'approvals') currentList = myWorkData.pendingApprovalItems;
          else if (activeTab === 'tracked') currentList = myWorkData.trackedItems;

          if (currentList.length === 0) {
            return (
              <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ไม่มีรายการในหมวดหมู่นี้ในขณะนี้
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {currentList.map(({ record, calc }) => (
                <div
                  key={record.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#D94F87]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-[#B83B6F]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${calc.badgeClass}`}>
                          {calc.badgeLabel}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {record.recordCode || record.id}
                        </span>
                        <span className="text-xs text-slate-400">
                          โมดูล: {record.module}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {record.title}
                      </h3>

                      {record.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          {record.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                        <span>กำหนดส่ง: <strong className="text-slate-700">{record.dueDate}</strong></span>
                        <span>ผู้รับผิดชอบ: <strong className="text-slate-700">{record.responsiblePerson}</strong></span>
                        <span>สังกัด: {record.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-stretch md:self-center justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {record.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkTaskComplete(record)}
                        leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
                        className="min-h-[38px]"
                      >
                        เสร็จสิ้น
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigate(record.actionLink as AppRoute)}
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      className="min-h-[38px]"
                    >
                      เปิดดูระเบียน
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* New Task Assignment Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                มอบหมายงานใหม่ (Assign Task)
              </h3>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่องาน / ภารกิจมอบหมาย *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น ตรวจสอบร่างหลักสูตร หรือจัดทำสรุปรายงานมติ"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  กำหนดส่ง (Due Date) *
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ผู้รับผิดชอบ (Assignee)
                </label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                >
                  <option value="พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.">พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร. (หัวหน้ากองวิชาการ)</option>
                  <option value="นายธีรศักดิ์ รัตนพันธ์">นายธีรศักดิ์ รัตนพันธ์ (เจ้าหน้าที่วิเทศสัมพันธ์)</option>
                  <option value="นายกิตติคุณ สรรพกิจ">นายกิตติคุณ สรรพกิจ (เจ้าหน้าที่คลังหน่วยกิต)</option>
                  <option value="พระศรีปริยัติมุนี, ผศ.ดร.">พระศรีปริยัติมุนี, ผศ.ดร. (คณบดี)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หน่วยงาน / สังกัด
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewTaskModalOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" variant="primary" size="sm">
                บันทึกและส่งการแจ้งเตือน
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyWorkView;
