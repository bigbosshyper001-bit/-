import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit3,
  FileSpreadsheet,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileDown,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { ResponsiveTable } from '../ui/ResponsiveTable.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { MeetingRecord } from '../../data/meetingModuleData.ts';

export interface MeetingListViewProps {
  meetings: MeetingRecord[];
  selectedMeetingId: string | null;
  onSelectMeeting: (meeting: MeetingRecord) => void;
  onCreateMeeting: () => void;
  onEditMeeting: (meeting: MeetingRecord) => void;
  onDeleteMeeting?: (meeting: MeetingRecord) => void;
  onNavigateToAgendas: (meetingId: string) => void;
  onNavigateToResolutions: (meetingId: string) => void;
  onNavigateToTasks: (meetingId: string) => void;
}

export const MeetingListView: React.FC<MeetingListViewProps> = ({
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onCreateMeeting,
  onEditMeeting,
  onDeleteMeeting,
  onNavigateToAgendas,
  onNavigateToResolutions,
  onNavigateToTasks,
}) => {
  const { showToast } = useToast();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'session' | 'code'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter and Sort Meetings
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        const matchesSearch =
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.chairperson.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.secretary.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' || m.status === statusFilter;
        const matchesYear =
          yearFilter === 'all' || m.fiscalYear === yearFilter;

        return matchesSearch && matchesStatus && matchesYear;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortOrder === 'desc'
            ? new Date(b.date).getTime() - new Date(a.date).getTime()
            : new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortField === 'session') {
          return sortOrder === 'desc'
            ? b.sessionNumber - a.sessionNumber
            : a.sessionNumber - b.sessionNumber;
        }
        return sortOrder === 'desc'
          ? b.code.localeCompare(a.code)
          : a.code.localeCompare(b.code);
      });
  }, [meetings, searchQuery, statusFilter, yearFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / pageSize));
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMeetings.slice(start, start + pageSize);
  }, [filteredMeetings, currentPage, pageSize]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      'เลขที่,ชื่อการประชุม,วันที่,เวลา,สถานที่,ประธาน,เลขานุการ,วาระ,มติ,สถานะ',
    ];
    const rows = filteredMeetings.map((m) =>
      `"${m.code}","${m.title}","${m.date}","${m.timeStart}-${m.timeEnd}","${m.venue}","${m.chairperson}","${m.secretary}",${m.agendas.length},${m.totalResolutions},"${m.status}"`
    );
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `รายงานตารางการประชุมสภาวิชาการ_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'ส่งออกข้อมูลสำเร็จ',
      message: `ส่งออกข้อมูลการประชุมจำนวน ${filteredMeetings.length} รายการเป็นไฟล์ CSV เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  // Handle Generate Invitation/Notice Document
  const handleGenerateNotice = (m: MeetingRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast({
      title: 'สร้างหนังสือนัดประชุมสำเร็จ',
      message: `สร้างเอกสารหนังสือเชิญประชุม ${m.code} และระเบียบวาระ (PDF) เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters, Export, New Meeting Button */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาเลขที่, ชื่อการประชุม, สถานที่, หรือประธาน..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="scheduled">ตามกำหนดการ (Scheduled)</option>
              <option value="completed">เสร็จสิ้นแล้ว (Completed)</option>
              <option value="in_progress">กำลังประชุม (In Progress)</option>
              <option value="draft">ร่างวาระ (Draft)</option>
            </select>

            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">ปีงบประมาณทั้งหมด</option>
              <option value="2569">ปีงบประมาณ 2569</option>
              <option value="2568">ปีงบประมาณ 2568</option>
            </select>

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              ส่งออก CSV
            </Button>

            {/* Create Meeting */}
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateMeeting}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              สร้างการประชุม
            </Button>
          </div>
        </div>
      </div>

      {/* Main Meetings Data Table - Responsive Card layout on mobile, dense grid on desktop */}
      <ResponsiveTable
        columns={[
          {
            key: 'code',
            title: 'เลขที่',
            render: (m) => (
              <span className="font-mono font-bold text-slate-700 whitespace-nowrap">
                {m.code}
              </span>
            ),
          },
          {
            key: 'title',
            title: 'ชื่อการประชุม',
            render: (m) => (
              <div>
                <p className="font-bold text-slate-900 leading-snug">{m.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ประธาน: {m.chairperson}</p>
              </div>
            ),
          },
          {
            key: 'date',
            title: 'วันที่และเวลา',
            render: (m) => (
              <div className="whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.date}</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-5">
                  {m.timeStart} - {m.timeEnd} น.
                </div>
              </div>
            ),
          },
          {
            key: 'venue',
            title: 'สถานที่',
            render: (m) => (
              <div className="flex items-start gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{m.venue}</span>
              </div>
            ),
          },
          {
            key: 'secretary',
            title: 'ผู้รับผิดชอบ',
            render: (m) => (
              <div className="text-slate-600">
                <p className="font-medium text-slate-800 leading-tight">{m.secretary}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{m.department}</p>
              </div>
            ),
          },
          {
            key: 'agendas',
            title: 'วาระ',
            align: 'center',
            render: (m) => (
              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {m.agendas.length}
              </span>
            ),
          },
          {
            key: 'totalResolutions',
            title: 'มติ',
            align: 'center',
            render: (m) => (
              <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded text-[11px]">
                {m.totalResolutions}
              </span>
            ),
          },
          {
            key: 'status',
            title: 'สถานะ',
            align: 'center',
            render: (m) => (
              <StatusBadge
                status={
                  m.status === 'completed'
                    ? 'completed'
                    : m.status === 'scheduled'
                    ? 'scheduled'
                    : m.status === 'in_progress'
                    ? 'in-progress'
                    : 'pending'
                }
              />
            ),
          },
          {
            key: 'actions',
            title: 'จัดการ',
            align: 'right',
            render: (m) => (
              <div
                className="inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onSelectMeeting(m)}
                  className="p-1.5 text-slate-500 hover:text-[#B83B6F] hover:bg-pink-50 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="ดูรายละเอียด (Side Panel)"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEditMeeting(m)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="แก้ไขข้อมูลการประชุม"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleGenerateNotice(m, e)}
                  className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="สร้างหนังสือนัดประชุม / ระเบียบวาระ (PDF)"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToResolutions(m.id)}
                  className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="เปิดทะเบียนมติของการประชุมนี้"
                >
                  <Award className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToTasks(m.id)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="ติดตามงานที่ได้รับมอบหมาย"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                {onDeleteMeeting && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMeeting(m);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="ย้ายไปยังถังขยะ (Soft Delete)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={paginatedMeetings}
        keyExtractor={(m) => m.id}
        emptyText="ไม่พบข้อมูลการประชุมตามเงื่อนไขที่ค้นหา"
        onRowClick={(m) => onSelectMeeting(m)}
        renderCard={(m) => ({
          key: m.id,
          rawItem: m,
          title: m.title,
          subtitle: `${m.code} • ประธาน: ${m.chairperson}`,
          badge: (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              ปีงบฯ {m.fiscalYear} • ครั้งที่ {m.sessionNumber}
            </span>
          ),
          statusBadge: (
            <StatusBadge
              status={
                m.status === 'completed'
                  ? 'completed'
                  : m.status === 'scheduled'
                  ? 'scheduled'
                  : m.status === 'in_progress'
                  ? 'in-progress'
                  : 'pending'
              }
            />
          ),
          fields: [
            {
              label: 'วัน-เวลาประชุม',
              value: `${m.date} (${m.timeStart} น.)`,
              icon: <Calendar className="w-3.5 h-3.5" />,
            },
            {
              label: 'สถานที่',
              value: m.venue,
              icon: <MapPin className="w-3.5 h-3.5" />,
            },
            {
              label: 'จำนวนวาระ / มติ',
              value: `${m.agendas.length} วาระ / ${m.totalResolutions} มติ`,
              icon: <Award className="w-3.5 h-3.5" />,
            },
            {
              label: 'ฝ่ายเลขานุการ',
              value: m.secretary,
              icon: <User className="w-3.5 h-3.5" />,
            },
          ],
          actions: (
            <div className="flex flex-wrap items-center gap-1.5 w-full justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMeeting(m);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 min-h-[38px] flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  ดูรายละเอียด
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMeeting(m);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 min-h-[38px] flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  แก้ไข
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToResolutions(m.id);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 min-h-[38px] flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  มติ
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToTasks(m.id);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 min-h-[38px] flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ติดตามงาน
                </button>
                {onDeleteMeeting && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMeeting(m);
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 min-h-[38px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ลบ
                  </button>
                )}
              </div>
            </div>
          ),
        })}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredMeetings.length,
          pageSize,
          onPageChange: (p) => setCurrentPage(p),
        }}
      />
    </div>
  );
};
