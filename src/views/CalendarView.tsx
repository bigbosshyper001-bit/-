import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Clock,
  MapPin,
  User,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import type { CalendarEventItem, CalendarItemType } from '../types/notificationSystem.ts';
import type { AppRoute } from '../types.ts';
import { centralProactiveService } from '../services/centralProactiveService.ts';
import { Button } from '../components/ui/Button.tsx';

export interface CalendarViewProps {
  onNavigate: (route: AppRoute) => void;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarView: React.FC<CalendarViewProps> = ({ onNavigate }) => {
  // Operational reference date: 2026-09-19
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-09-19T00:00:00'));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);

  // Subscribe to central events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(() =>
    centralProactiveService.getCalendarItems()
  );

  React.useEffect(() => {
    return centralProactiveService.subscribe(() => {
      setCalendarEvents(centralProactiveService.getCalendarItems());
    });
  }, []);

  // Event Type Colors & Badges
  const getTypeMeta = (type: CalendarItemType) => {
    switch (type) {
      case 'Meeting':
        return {
          label: 'การประชุม',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-600',
        };
      case 'Deadline':
        return {
          label: 'เดดไลน์',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-600',
        };
      case 'Approval':
        return {
          label: 'การอนุมัติ',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-600',
        };
      case 'KPI milestone':
        return {
          label: 'KPI Milestone',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-600',
        };
      case 'MOU expiration':
        return {
          label: 'MOU หมดอายุ',
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          dot: 'bg-teal-600',
        };
      case 'Document expiration':
        return {
          label: 'เอกสารหมดอายุ',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-600',
        };
      case 'Task':
        return {
          label: 'งานมอบหมาย',
          bg: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]',
          dot: 'bg-[#B83B6F]',
        };
      case 'Course milestone':
        return {
          label: 'หมุดหมายหลักสูตร',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-600',
        };
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((ev) => {
      if (selectedType !== 'all' && ev.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = ev.title.toLowerCase().includes(q);
        const inDesc = (ev.description || '').toLowerCase().includes(q);
        const inCode = (ev.recordCode || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inCode) return false;
      }
      return true;
    });
  }, [calendarEvents, selectedType, searchQuery]);

  // Navigate dates
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else if (viewMode === 'day') next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else if (viewMode === 'day') next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-09-19T00:00:00'));
  };

  const monthNamesTh = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const currentYearBE = currentDate.getFullYear() + 543;
  const currentMonthName = monthNamesTh[currentDate.getMonth()];

  // Month Grid Calculation
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthTotal = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotal - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: prevDate.toISOString().substring(0, 10),
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dayDate = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to reach 35 or 42 cells
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const monthGridDays = useMemo(() => getMonthDays(), [currentDate]);

  // Types list
  const typesFilter: { key: string; label: string }[] = [
    { key: 'all', label: 'ทุกประเภท' },
    { key: 'Meeting', label: 'การประชุม' },
    { key: 'Deadline', label: 'เดดไลน์' },
    { key: 'Approval', label: 'การอนุมัติ' },
    { key: 'KPI milestone', label: 'KPI' },
    { key: 'MOU expiration', label: 'MOU' },
    { key: 'Document expiration', label: 'เอกสาร' },
    { key: 'Task', label: 'งานมอบหมาย' },
    { key: 'Course milestone', label: 'หลักสูตร' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]">
              ปฏิทินงานรวมกองวิชาการ
            </span>
            <span className="text-xs text-slate-400">Single Source of Truth</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            ปฏิทินงานวิชาการและกำหนดเวลา (Academic Calendar & Deadlines)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            รวบรวมวาระการประชุม เดดไลน์มติสภา การอนุมัติ KPI และวันหมดอายุ MOU/เอกสาร
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Modes */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'month' && 'เดือน'}
                {mode === 'week' && 'สัปดาห์'}
                {mode === 'day' && 'วัน'}
                {mode === 'agenda' && 'กำหนดการ (Agenda)'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/my-work')}
            leftIcon={<Layers className="w-4 h-4 text-[#B83B6F]" />}
          >
            ดูงานของฉัน
          </Button>
        </div>
      </div>

      {/* Date Navigator & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              onClick={handlePrev}
              aria-label="ช่วงเวลาก่อนหน้า"
              className="p-1.5 rounded hover:bg-white text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-white rounded transition-colors cursor-pointer"
            >
              วันนี้ (Today)
            </button>
            <button
              onClick={handleNext}
              aria-label="ช่วงเวลาถัดไป"
              className="p-1.5 rounded hover:bg-white text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-base font-bold text-slate-900">
            {currentMonthName} พ.ศ. {currentYearBE}
          </span>
        </div>

        {/* Filter Pills and Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อรายการ หรือรหัส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-48 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#B83B6F]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {typesFilter.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedType(f.key)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  selectedType === f.key
                    ? 'bg-[#B83B6F] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW: MONTH */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-600">
            <div>อาทิตย์</div>
            <div>จันทร์</div>
            <div>อังคาร</div>
            <div>พุธ</div>
            <div>พฤหัสบดี</div>
            <div>ศุกร์</div>
            <div>เสาร์</div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {monthGridDays.map((d, index) => {
              const dayEvents = filteredEvents.filter((e) => e.date === d.dateStr);
              const isToday = d.dateStr === '2026-09-19';

              return (
                <div
                  key={index}
                  className={`min-h-[115px] p-2 flex flex-col justify-between transition-colors ${
                    !d.isCurrentMonth ? 'bg-slate-50/50 opacity-40' : 'bg-white hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-[#B83B6F] text-white flex items-center justify-center'
                          : 'text-slate-700'
                      }`}
                    >
                      {d.dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dayEvents.length} รายการ
                      </span>
                    )}
                  </div>

                  {/* Events preview pills */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((item) => {
                      const meta = getTypeMeta(item.type);
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedEvent(item)}
                          className={`text-[11px] p-1 rounded border leading-tight truncate cursor-pointer hover:shadow-xs transition-shadow ${meta.bg}`}
                          title={`${item.title} (${meta.label})`}
                        >
                          <span className="font-semibold">{item.timeStart ? `${item.timeStart} ` : ''}</span>
                          {item.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-slate-500 font-medium pl-1">
                        + อีก {dayEvents.length - 3} รายการ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: AGENDA / LIST */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              กำหนดการเรียงตามลำดับเวลา (Agenda Timeline)
            </h3>
            <span className="text-xs text-slate-500">
              พบ {filteredEvents.length} รายการ
            </span>
          </div>

          <div className="space-y-3">
            {filteredEvents
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((item) => {
                const meta = getTypeMeta(item.type);
                const isToday = item.date === '2026-09-19';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvent(item)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#D94F87]/50 bg-white hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                          isToday ? 'bg-[#FBE7EF] border-[#F8CBDD] text-[#B83B6F]' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold">
                          {item.date.split('-')[1]}
                        </span>
                        <span className="text-sm font-bold leading-none">
                          {item.date.split('-')[2]}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${meta.bg}`}
                          >
                            {meta.label}
                          </span>
                          {item.recordCode && (
                            <span className="text-xs text-slate-500 font-mono">
                              {item.recordCode}
                            </span>
                          )}
                          {isToday && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 animate-pulse">
                              วันนี้ (Today)
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>

                        {item.description && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {item.timeStart && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {item.timeStart} {item.timeEnd ? `- ${item.timeEnd}` : 'น.'}
                            </span>
                          )}
                          {item.locationOrVenue && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {item.locationOrVenue}
                            </span>
                          )}
                          {item.responsiblePerson && (
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {item.responsiblePerson}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(item.actionLink as AppRoute);
                        }}
                        rightIcon={<ExternalLink className="w-3.5 h-3.5 text-[#B83B6F]" />}
                      >
                        เปิดระเบียน
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* VIEW: WEEK / DAY (Compact fallback rendering) */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              กำหนดการมุมมอง {viewMode === 'week' ? 'สัปดาห์ (Week View)' : 'รายวัน (Day View)'}
            </h3>
            <span className="text-xs text-slate-500">
              อ้างอิงวันที่ {currentDate.toISOString().substring(0, 10)}
            </span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((item) => {
              const meta = getTypeMeta(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEvent(item)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-[#D94F87]/50 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {item.date} {item.timeStart ? `เวลา ${item.timeStart} น.` : ''} | {item.responsiblePerson}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${meta.bg}`}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                    getTypeMeta(selectedEvent.type).bg
                  }`}
                >
                  {getTypeMeta(selectedEvent.type).label}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {selectedEvent.description && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedEvent.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">วันที่</span>
                <span className="font-semibold text-slate-800">{selectedEvent.date}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">เวลา</span>
                <span className="font-semibold text-slate-800">
                  {selectedEvent.timeStart || 'ทั้งวัน (All Day)'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">ผู้รับผิดชอบ</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {selectedEvent.responsiblePerson || 'กองวิชาการ'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block">สถานที่ / ช่องทาง</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {selectedEvent.locationOrVenue || 'ระบบสารสนเทศกองวิชาการ'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                ปิดหน้าต่าง
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const link = selectedEvent.actionLink as AppRoute;
                  setSelectedEvent(null);
                  onNavigate(link);
                }}
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                เปิดระเบียนต้นทาง ({selectedEvent.module})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
