import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Eye,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import type { MeetingRecord } from '../../data/meetingModuleData.ts';

export interface MeetingCalendarViewProps {
  meetings: MeetingRecord[];
  onSelectMeeting: (meeting: MeetingRecord) => void;
  onCreateMeeting: () => void;
}

export const MeetingCalendarView: React.FC<MeetingCalendarViewProps> = ({
  meetings,
  onSelectMeeting,
  onCreateMeeting,
}) => {
  // Current calendar month: September 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 = September

  const monthNames = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];

  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  // Days in month calculation for September 2026
  const daysInMonth = 30;
  const startDayOfWeek = 2; // Tuesday is 2 (0=Sun, 1=Mon, 2=Tue)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Find meetings for a given day in the selected month
  const getMeetingsForDay = (day: number) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const targetDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    return meetings.filter((m) => m.date === targetDateStr);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 font-sans">
            {monthNames[currentMonth]} พ.ศ. {currentYear + 543}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B83B6F]" />
            <span>สภาวิชาการ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 ml-2" />
            <span>กลั่นกรองหลักสูตร</span>
          </div>
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

      {/* Calendar Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar Matrix (Span 8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
          <div className="min-w-[520px] sm:min-w-0">
            {/* Day Names Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-[#FAFAFC] text-center text-xs font-bold text-slate-600 py-2.5">
              {daysOfWeek.map((day, idx) => (
                <div
                  key={day}
                  className={idx === 0 || idx === 6 ? 'text-rose-500' : ''}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[460px]">
              {/* Empty slots before first day */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-50/50 p-2 min-h-[90px]" />
              ))}

              {/* Days in Month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayMeetings = getMeetingsForDay(day);
                const isToday = day === 16 && currentMonth === 8 && currentYear === 2026;

                return (
                  <div
                    key={`day-${day}`}
                    className={`p-1.5 sm:p-2 min-h-[90px] flex flex-col justify-between transition-colors hover:bg-slate-50/80 ${
                      isToday ? 'bg-pink-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-[#B83B6F] text-white'
                            : 'text-slate-700'
                        }`}
                      >
                        {day}
                      </span>
                      {dayMeetings.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B83B6F]" />
                      )}
                    </div>

                    {/* Meetings Badges */}
                    <div className="space-y-1 mt-1">
                      {dayMeetings.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => onSelectMeeting(m)}
                          className={`text-[10px] font-semibold p-1 rounded leading-tight truncate cursor-pointer transition-all border ${
                            m.code.includes('สว')
                              ? 'bg-pink-50 text-[#B83B6F] border-pink-200 hover:bg-pink-100'
                              : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                          }`}
                          title={`${m.code}: ${m.title}`}
                        >
                          <span className="font-mono">{m.timeStart}</span> {m.code}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Upcoming Meetings in Month (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#B83B6F]" />
              กำหนดการประชุมในเดือนนี้
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {meetings.length} รายการ
            </span>
          </div>

          <div className="space-y-3">
            {meetings.map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectMeeting(m)}
                className="p-3 rounded-xl border border-slate-200 bg-[#FAFAFC] hover:border-slate-300 hover:bg-white transition-all cursor-pointer space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                    {m.code}
                  </span>
                  <span className="text-[11px] font-mono text-[#B83B6F] font-semibold">
                    {m.date}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 leading-snug">
                  {m.title}
                </h4>

                <div className="space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{m.timeStart} - {m.timeEnd} น.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{m.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
