import React, { useState, useMemo } from 'react';
import {
  Kanban,
  ListFilter,
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Search,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { ResponsiveTable } from '../ui/ResponsiveTable.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { MeetingTask } from '../../data/meetingModuleData.ts';

export interface TaskTrackingBoardProps {
  tasks: MeetingTask[];
  onUpdateTaskStatus?: (taskId: string, newStatus: MeetingTask['status']) => void;
  onAddTask?: () => void;
}

type ViewMode = 'kanban' | 'list' | 'timeline';

export const TaskTrackingBoard: React.FC<TaskTrackingBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
  onAddTask,
}) => {
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.meetingReference.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === 'all' || t.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  // Kanban Columns Definition
  const kanbanColumns: {
    id: MeetingTask['status'];
    label: string;
    badgeColor: string;
    columnBg: string;
  }[] = [
    {
      id: 'pending',
      label: 'รอดำเนินการ',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      columnBg: 'bg-slate-50/70 border-slate-200/80',
    },
    {
      id: 'in_progress',
      label: 'กำลังดำเนินการ',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      columnBg: 'bg-blue-50/20 border-blue-100',
    },
    {
      id: 'in_review',
      label: 'รอตรวจ',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      columnBg: 'bg-amber-50/20 border-amber-100',
    },
    {
      id: 'completed',
      label: 'เสร็จสิ้น',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      columnBg: 'bg-emerald-50/20 border-emerald-100',
    },
    {
      id: 'overdue',
      label: 'ล่าช้า',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      columnBg: 'bg-rose-50/30 border-rose-100',
    },
  ];

  const handleMoveStatus = (taskId: string, currentStatus: MeetingTask['status']) => {
    const sequence: MeetingTask['status'][] = [
      'pending',
      'in_progress',
      'in_review',
      'completed',
    ];
    const currentIndex = sequence.indexOf(currentStatus);
    const nextStatus =
      currentIndex !== -1 && currentIndex < sequence.length - 1
        ? sequence[currentIndex + 1]
        : 'completed';

    onUpdateTaskStatus?.(taskId, nextStatus);
    showToast({
      title: 'ปรับปรุงสถานะงานสำเร็จ',
      message: `ย้ายสถานะไปยัง "${
        kanbanColumns.find((c) => c.id === nextStatus)?.label
      }" แล้ว`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & View Switcher */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-blue-600" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-teal-600" />
              <span>ตาราง (List)</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>ไทม์ไลน์ (Timeline)</span>
            </button>
          </div>

          {/* Search & Priority Filter */}
          <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหางาน, ผู้รับผิดชอบ..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87]"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">ทุกระดับ</option>
              <option value="critical">วิกฤต</option>
              <option value="high">สูง</option>
              <option value="medium">ปานกลาง</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. KANBAN VIEW (5 Columns: รอดำเนินการ, กำลังดำเนินการ, รอตรวจ, เสร็จสิ้น, ล่าช้า) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`rounded-xl border p-3 flex flex-col min-w-[250px] ${col.columnBg}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/70">
                  <span className="font-bold text-xs text-slate-900">
                    {col.label}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full border ${col.badgeColor}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      ไม่มีงานในสถานะนี้
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs hover:border-slate-300 transition-all space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              task.priority === 'critical'
                                ? 'bg-rose-50 text-rose-700'
                                : task.priority === 'high'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {task.meetingReference.slice(0, 16)}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.deadline}
                            </span>
                            <span className="font-bold text-slate-700">
                              {task.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              task.status === 'completed'
                                ? 'bg-emerald-500'
                                : task.status === 'overdue'
                                ? 'bg-rose-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>

                        {/* Fast forward status action */}
                        {task.status !== 'completed' && (
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => handleMoveStatus(task.id, task.status)}
                              className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                            >
                              <span>เลื่อนสถานะถัดไป</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
          <ResponsiveTable
            data={filteredTasks}
            keyExtractor={(t) => t.id}
            emptyMessage="ไม่พบรายการงานที่มอบหมายตามเงื่อนไขที่เลือก"
            columns={[
              {
                key: 'title',
                title: 'ชื่องานที่ได้รับมอบหมาย',
                render: (t) => (
                  <div>
                    <p className="font-bold text-slate-900 leading-snug">{t.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      อัปเดตเมื่อ: {t.updatedAt}
                    </span>
                  </div>
                ),
              },
              {
                key: 'assignee',
                title: 'ผู้รับผิดชอบ / หน่วยงาน',
                render: (t) => (
                  <div>
                    <p className="font-semibold text-slate-800">{t.assignee}</p>
                    <p className="text-[11px] text-slate-400">{t.department}</p>
                  </div>
                ),
              },
              {
                key: 'meetingRef',
                title: 'อ้างอิงมติ',
                render: (t) => (
                  <span className="font-mono text-[11px] text-slate-500">{t.meetingReference}</span>
                ),
              },
              {
                key: 'deadline',
                title: 'กำหนดส่ง',
                render: (t) => (
                  <span className="font-mono font-medium text-slate-800">{t.deadline}</span>
                ),
              },
              {
                key: 'progress',
                title: 'ความคืบหน้า',
                align: 'center',
                render: (t) => (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold">{t.progress}%</span>
                  </div>
                ),
              },
              {
                key: 'status',
                title: 'สถานะ',
                align: 'center',
                render: (t) => (
                  <StatusBadge
                    status={
                      t.status === 'completed'
                        ? 'completed'
                        : t.status === 'overdue'
                        ? 'overdue'
                        : t.status === 'in_progress'
                        ? 'in-progress'
                        : 'pending'
                    }
                  />
                ),
              },
            ]}
            renderCard={(t) => ({
              id: t.id,
              title: t.title,
              subtitle: `${t.assignee} • ${t.department}`,
              statusBadge: (
                <StatusBadge
                  status={
                    t.status === 'completed'
                      ? 'completed'
                      : t.status === 'overdue'
                      ? 'overdue'
                      : t.status === 'in_progress'
                      ? 'in-progress'
                      : 'pending'
                  }
                />
              ),
              fields: [
                {
                  label: 'อ้างอิงมติ',
                  value: <span className="font-mono text-[11px]">{t.meetingReference}</span>,
                },
                {
                  label: 'กำหนดส่ง',
                  value: <span className="font-mono font-semibold text-slate-800">{t.deadline}</span>,
                },
                {
                  label: 'ความคืบหน้า',
                  value: (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 bg-slate-150 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs">{t.progress}%</span>
                    </div>
                  ),
                  fullWidth: true,
                },
              ],
              primaryAction: t.status !== 'completed' ? (
                <button
                  type="button"
                  onClick={() => handleMoveStatus(t.id, t.status)}
                  className="w-full text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg transition-colors"
                >
                  <span>เลื่อนสถานะถัดไป</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : undefined,
            })}
          />
        </div>
      )}

      {/* 3. TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              ลำดับเวลาและกำหนดส่งงาน (Task Timeline)
            </h3>
            <span className="text-xs text-slate-500">เรียงตามกำหนดส่งใกล้ที่สุด</span>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-5">
            {filteredTasks
              .sort(
                (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
              )
              .map((t) => {
                const isOverdue = t.status === 'overdue';
                const isCompleted = t.status === 'completed';

                return (
                  <div key={t.id} className="relative group">
                    <span
                      className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isOverdue
                          ? 'bg-rose-500 ring-4 ring-rose-100'
                          : 'bg-blue-600'
                      }`}
                    />
                    <div className="bg-[#FAFAFC] border border-slate-200/80 rounded-xl p-3.5 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {t.deadline}
                        </span>
                        <StatusBadge
                          status={
                            isCompleted
                              ? 'completed'
                              : isOverdue
                              ? 'overdue'
                              : t.status === 'in_progress'
                              ? 'in-progress'
                              : 'pending'
                          }
                        />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {t.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ผู้รับผิดชอบ: {t.assignee} ({t.department}) • อ้างอิง: {t.meetingReference}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
