import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  TableProperties,
  FileCheck2,
  Mail,
  ListOrdered,
  FileText,
  Award,
  CheckCircle2,
  Plus,
  ArrowLeft,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import type { AppRoute, UserProfile } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import { apiClient } from '../services/apiClient.ts';

// Meeting Sub-Components
import { MeetingNotificationBanner } from '../components/meetings/MeetingNotificationBanner.tsx';
import { MeetingCalendarView } from '../components/meetings/MeetingCalendarView.tsx';
import { MeetingListView } from '../components/meetings/MeetingListView.tsx';
import { MeetingDetailSidePanel } from '../components/meetings/MeetingDetailSidePanel.tsx';
import { CreateMeetingForm } from '../components/meetings/CreateMeetingForm.tsx';
import { AgendaBuilder } from '../components/meetings/AgendaBuilder.tsx';
import { MeetingMinutesView } from '../components/meetings/MeetingMinutesView.tsx';
import { ResolutionRegisterView } from '../components/meetings/ResolutionRegisterView.tsx';
import { TaskTrackingBoard } from '../components/meetings/TaskTrackingBoard.tsx';
import { MeetingOrdersView } from '../components/meetings/MeetingOrdersView.tsx';
import { MeetingInvitationsView } from '../components/meetings/MeetingInvitationsView.tsx';

// Data Store
import {
  INITIAL_MEETINGS,
  INITIAL_RESOLUTIONS,
  INITIAL_TASKS,
  INITIAL_ORDERS,
  INITIAL_INVITATIONS,
  INITIAL_NOTIFICATIONS,
  type MeetingRecord,
  type ResolutionRecord,
  type MeetingTask,
  type MeetingAgendaItem,
} from '../data/meetingModuleData.ts';

export type MeetingSubTab =
  | 'calendar'
  | 'meetings'
  | 'orders'
  | 'invitations'
  | 'agendas'
  | 'minutes'
  | 'resolutions'
  | 'tasks';

export interface MeetingModuleViewProps {
  onNavigate: (route: AppRoute) => void;
  initialTab?: MeetingSubTab;
  currentUser?: UserProfile;
}

export const MeetingModuleView: React.FC<MeetingModuleViewProps> = ({
  onNavigate,
  initialTab = 'meetings',
  currentUser,
}) => {
  const { showToast } = useToast();

  // Active Sub-Menu Tab
  const [activeTab, setActiveTab] = useState<MeetingSubTab>(initialTab);

  // Data States
  const [meetings, setMeetings] = useState<MeetingRecord[]>(INITIAL_MEETINGS);
  const [resolutions, setResolutions] = useState<ResolutionRecord[]>(INITIAL_RESOLUTIONS);
  const [tasks, setTasks] = useState<MeetingTask[]>(INITIAL_TASKS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [invitations, setInvitations] = useState(INITIAL_INVITATIONS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(false);

  // Load persistent records from SQLite API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchMeetingModuleData = async () => {
      setIsLoading(true);
      try {
        const [mtgRes, resRes, taskRes, ordRes, invRes] = await Promise.all([
          apiClient.getCollection<MeetingRecord>('meetings'),
          apiClient.getCollection<ResolutionRecord>('resolutions'),
          apiClient.getCollection<MeetingTask>('tasks'),
          apiClient.getCollection<any>('orders'),
          apiClient.getCollection<any>('invitations'),
        ]);

        if (!isMounted) return;

        if (mtgRes.success && Array.isArray(mtgRes.data)) {
          setMeetings(mtgRes.data);
          if (mtgRes.data.length > 0 && !selectedMeetingId) {
            setSelectedMeetingId(mtgRes.data[0].id);
          }
        }
        if (resRes.success && Array.isArray(resRes.data)) {
          setResolutions(resRes.data);
        }
        if (taskRes.success && Array.isArray(taskRes.data)) {
          setTasks(taskRes.data);
        }
        if (ordRes.success && Array.isArray(ordRes.data)) {
          setOrders(ordRes.data);
        }
        if (invRes.success && Array.isArray(invRes.data)) {
          setInvitations(invRes.data);
        }
      } catch (err) {
        console.error('Failed to load meeting data from persistent API:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMeetingModuleData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Selected Meeting for Master-Detail & Side Panel
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    meetings[0]?.id || null
  );
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Create / Edit Meeting Mode
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingRecord | null>(null);

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || null;

  // Sub-Navigation Tabs definition (Strictly matching prompt menu hierarchy)
  const tabs = [
    { id: 'calendar' as MeetingSubTab, label: 'ปฏิทินการประชุม', icon: CalendarIcon },
    { id: 'meetings' as MeetingSubTab, label: 'การประชุม', icon: TableProperties, count: meetings.length },
    { id: 'orders' as MeetingSubTab, label: 'คำสั่ง', icon: FileCheck2, count: orders.length },
    { id: 'invitations' as MeetingSubTab, label: 'หนังสือเชิญ', icon: Mail, count: invitations.length },
    { id: 'agendas' as MeetingSubTab, label: 'ระเบียบวาระ', icon: ListOrdered },
    { id: 'minutes' as MeetingSubTab, label: 'รายงานการประชุม', icon: FileText },
    { id: 'resolutions' as MeetingSubTab, label: 'ทะเบียนมติ', icon: Award, count: resolutions.length },
    { id: 'tasks' as MeetingSubTab, label: 'งานที่ได้รับมอบหมาย', icon: CheckCircle2, count: tasks.filter(t => t.status !== 'completed').length },
  ];

  // Actions
  const handleSelectMeeting = (meeting: MeetingRecord) => {
    setSelectedMeetingId(meeting.id);
    setIsSidePanelOpen(true);
  };

  const handleCreateNewMeeting = () => {
    setEditingMeeting(null);
    setIsCreatingMeeting(true);
  };

  const handleEditMeeting = (meeting: MeetingRecord) => {
    setEditingMeeting(meeting);
    setIsCreatingMeeting(true);
  };

  const handleMeetingFormSuccess = async (meetingRecord: MeetingRecord) => {
    try {
      if (editingMeeting) {
        setMeetings((prev) =>
          prev.map((m) => (m.id === meetingRecord.id ? meetingRecord : m))
        );
        await apiClient.updateRecord('meetings', meetingRecord.id, meetingRecord, currentUser);
        showToast({
          title: 'แก้ไขการประชุมสำเร็จ',
          message: 'บันทึกการเปลี่ยนแปลงลงฐานข้อมูลถาวรแล้ว',
          type: 'success',
        });
      } else {
        const recordToSave = {
          ...meetingRecord,
          id: meetingRecord.id || `mtg-${Date.now()}`,
          createdDate: new Date().toISOString(),
          status: meetingRecord.status || 'scheduled',
          agendas: meetingRecord.agendas || [],
          totalResolutions: meetingRecord.totalResolutions || 0,
        };
        setMeetings((prev) => [recordToSave, ...prev]);
        setSelectedMeetingId(recordToSave.id);
        await apiClient.createRecord('meetings', recordToSave, currentUser);
        showToast({
          title: 'สร้างการประชุมสำเร็จ',
          message: 'บันทึกข้อมูลการประชุมลงฐานข้อมูลถาวรแล้ว',
          type: 'success',
        });
      }
    } catch (err: any) {
      showToast({
        title: 'เกิดข้อผิดพลาดในการบันทึก',
        message: err.message,
        type: 'error',
      });
    }
    setIsCreatingMeeting(false);
    setEditingMeeting(null);
  };

  const handleDeleteMeeting = async (meeting: MeetingRecord) => {
    if (!confirm(`คุณต้องการย้ายการประชุม "${meeting.title || meeting.id}" ไปยังถังขยะใช่หรือไม่?`)) {
      return;
    }
    try {
      const res = await apiClient.deleteRecord(
        'meetings',
        meeting.id,
        'ลบจากหน้ารายการการประชุม',
        currentUser
      );
      if (res.success) {
        setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
        if (selectedMeetingId === meeting.id) {
          setSelectedMeetingId(null);
          setIsSidePanelOpen(false);
        }
        showToast({
          title: 'ย้ายไปที่ถังขยะเรียบร้อยแล้ว',
          message: 'สามารถกู้คืนข้อมูลได้ที่เมนู "จัดการข้อมูลและถังขยะ"',
          type: 'success',
        });
      } else {
        showToast({
          title: 'ไม่สามารถลบได้',
          message: res.error || 'เกิดข้อผิดพลาด',
          type: 'error',
        });
      }
    } catch (err: any) {
      showToast({ title: 'เกิดข้อผิดพลาด', message: err.message, type: 'error' });
    }
  };

  const handleUpdateAgendas = (
    meetingId: string,
    updatedAgendas: MeetingAgendaItem[]
  ) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          const updated = { ...m, agendas: updatedAgendas };
          apiClient.updateRecord('meetings', meetingId, updated, currentUser).catch(console.error);
          return updated;
        }
        return m;
      })
    );
  };

  const handleUpdateResolution = (updated: ResolutionRecord) => {
    setResolutions((prev) =>
      prev.map((r) => {
        if (r.id === updated.id) {
          apiClient.updateRecord('resolutions', updated.id, updated, currentUser).catch(console.error);
          return updated;
        }
        return r;
      })
    );
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: MeetingTask['status']
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            status: newStatus,
            progress: newStatus === 'completed' ? 100 : t.progress,
          };
          apiClient.updateRecord('tasks', taskId, updated, currentUser).catch(console.error);
          return updated;
        }
        return t;
      })
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col">
      {/* 1. Header & Navigation Context */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B83B6F]">
              <span
                onClick={() => onNavigate('/dashboard')}
                className="cursor-pointer hover:underline"
              >
                หน้าแรก
              </span>
              <span>/</span>
              <span className="text-slate-700">การประชุมและมติ</span>
              <span>/</span>
              <span className="text-slate-400 font-normal">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              ระบบการประชุมและมติสภาวิชาการ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic Council Meetings & Resolutions Management System • มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/documents')}
              className="gap-1.5 text-xs text-[#B83B6F] border-[#F5C2D6] hover:bg-[#FBE7EF] min-h-[38px]"
            >
              <FileText className="w-3.5 h-3.5" />
              คลังเอกสาร (DMS)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/dashboard')}
              className="min-h-[38px] hidden sm:inline-flex"
            >
              แดชบอร์ด
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateNewMeeting}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="min-h-[38px]"
            >
              สร้างการประชุม
            </Button>
          </div>
        </div>

        {/* Notification Banner (Close to deadline, Overdue, New tasks) */}
        <div className="mt-4">
          <MeetingNotificationBanner
            notifications={notifications}
            onSelectNotification={(notif) => {
              if (notif.type === 'new_task' || notif.type === 'deadline_soon' || notif.type === 'overdue') {
                setActiveTab('tasks');
              } else if (notif.type === 'status_changed') {
                setActiveTab('resolutions');
              }
            }}
          />
        </div>

        {/* 2. Sub-Navigation Tabs (Menu 8 รายการตามระเบียบงานสภาวิชาการ) */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'meetings') {
                    setIsSidePanelOpen(false);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#B83B6F] text-[#B83B6F] bg-pink-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#B83B6F]' : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-[#B83B6F] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace / Tab Content Body */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-12 flex">
        {isCreatingMeeting ? (
          <div className="w-full py-4">
            <CreateMeetingForm
              initialData={editingMeeting}
              onCancel={() => {
                setIsCreatingMeeting(false);
                setEditingMeeting(null);
              }}
              onSubmitSuccess={handleMeetingFormSuccess}
            />
          </div>
        ) : (
          <div className="flex-1 flex gap-6 min-w-0">
            {/* Sub-view Area */}
            <div className="flex-1 min-w-0 py-2">
              {/* 1. Calendar */}
              {activeTab === 'calendar' && (
                <MeetingCalendarView
                  meetings={meetings}
                  onSelectMeeting={(m) => {
                    setSelectedMeetingId(m.id);
                    setActiveTab('meetings');
                    setIsSidePanelOpen(true);
                  }}
                  onCreateMeeting={handleCreateNewMeeting}
                />
              )}

              {/* 2. Meetings List (Master-Detail with Side Panel) */}
              {activeTab === 'meetings' && (
                <MeetingListView
                  meetings={meetings}
                  selectedMeetingId={isSidePanelOpen ? selectedMeetingId : null}
                  onSelectMeeting={handleSelectMeeting}
                  onCreateMeeting={handleCreateNewMeeting}
                  onEditMeeting={handleEditMeeting}
                  onDeleteMeeting={handleDeleteMeeting}
                  onNavigateToAgendas={(id) => {
                    setSelectedMeetingId(id);
                    setActiveTab('agendas');
                  }}
                  onNavigateToResolutions={(id) => {
                    setSelectedMeetingId(id);
                    setActiveTab('resolutions');
                  }}
                  onNavigateToTasks={(id) => {
                    setSelectedMeetingId(id);
                    setActiveTab('tasks');
                  }}
                />
              )}

              {/* 3. Orders */}
              {activeTab === 'orders' && <MeetingOrdersView orders={orders} />}

              {/* 4. Invitations */}
              {activeTab === 'invitations' && (
                <MeetingInvitationsView invitations={invitations} />
              )}

              {/* 5. Agendas Builder */}
              {activeTab === 'agendas' && (
                <AgendaBuilder
                  meetings={meetings}
                  selectedMeetingId={selectedMeetingId || undefined}
                  onUpdateAgendas={handleUpdateAgendas}
                />
              )}

              {/* 6. Minutes */}
              {activeTab === 'minutes' && (
                <MeetingMinutesView
                  meetings={meetings}
                  selectedMeetingId={selectedMeetingId || undefined}
                />
              )}

              {/* 7. Resolutions Register */}
              {activeTab === 'resolutions' && (
                <ResolutionRegisterView
                  resolutions={resolutions}
                  currentUser={currentUser}
                  onUpdateResolution={handleUpdateResolution}
                />
              )}

              {/* 8. Task Tracking Board */}
              {activeTab === 'tasks' && (
                <TaskTrackingBoard
                  tasks={tasks}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                />
              )}
            </div>

            {/* UX DETAIL REQUIREMENT: Side Panel for Meeting Detail preserving master list context */}
            {activeTab === 'meetings' && (
              <MeetingDetailSidePanel
                meeting={selectedMeeting}
                isOpen={isSidePanelOpen}
                onClose={() => setIsSidePanelOpen(false)}
                onNavigateToAgendas={(id) => {
                  setSelectedMeetingId(id);
                  setActiveTab('agendas');
                }}
                onNavigateToMinutes={(id) => {
                  setSelectedMeetingId(id);
                  setActiveTab('minutes');
                }}
                onNavigateToResolutions={(id) => {
                  setSelectedMeetingId(id);
                  setActiveTab('resolutions');
                }}
                onNavigateToTasks={(id) => {
                  setSelectedMeetingId(id);
                  setActiveTab('tasks');
                }}
                onEditMeeting={handleEditMeeting}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
