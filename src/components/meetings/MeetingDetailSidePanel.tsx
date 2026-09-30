import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Building2,
  FileText,
  CheckCircle2,
  ListOrdered,
  Award,
  ExternalLink,
  Edit3,
  Download,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import type { MeetingRecord } from '../../data/meetingModuleData.ts';

export interface MeetingDetailSidePanelProps {
  meeting: MeetingRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAgendas?: (meetingId: string) => void;
  onNavigateToMinutes?: (meetingId: string) => void;
  onNavigateToResolutions?: (meetingId: string) => void;
  onNavigateToTasks?: (meetingId: string) => void;
  onEditMeeting?: (meeting: MeetingRecord) => void;
}

export const MeetingDetailSidePanel: React.FC<MeetingDetailSidePanelProps> = ({
  meeting,
  isOpen,
  onClose,
  onNavigateToAgendas,
  onNavigateToMinutes,
  onNavigateToResolutions,
  onNavigateToTasks,
  onEditMeeting,
}) => {
  if (!isOpen || !meeting) return null;

  const attendedCount = meeting.attendees.filter((a) => a.status === 'attended').length;

  return (
    <aside
      className="w-full lg:w-[440px] xl:w-[480px] bg-white border-l border-slate-200 shadow-xl flex flex-col h-full shrink-0 animate-in slide-in-from-right duration-200 z-20"
      aria-label="แผงรายละเอียดการประชุม"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-start justify-between gap-3 bg-[#FAFAFC]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
              {meeting.code}
            </span>
            <StatusBadge
              status={
                meeting.status === 'completed'
                  ? 'completed'
                  : meeting.status === 'scheduled'
                  ? 'scheduled'
                  : meeting.status === 'in_progress'
                  ? 'in-progress'
                  : 'pending'
              }
            />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {meeting.title}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors shrink-0"
          title="ปิดแผงรายละเอียด (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-4 border-b border-slate-200 text-[11px] font-semibold bg-white">
        <button
          onClick={() => onNavigateToAgendas?.(meeting.id)}
          className="p-2.5 text-slate-600 hover:text-[#B83B6F] hover:bg-pink-50/50 flex flex-col items-center gap-1 border-r border-slate-100 transition-colors"
        >
          <ListOrdered className="w-4 h-4 text-blue-600" />
          <span>วาระ ({meeting.agendas.length})</span>
        </button>
        <button
          onClick={() => onNavigateToMinutes?.(meeting.id)}
          className="p-2.5 text-slate-600 hover:text-[#B83B6F] hover:bg-pink-50/50 flex flex-col items-center gap-1 border-r border-slate-100 transition-colors"
        >
          <FileText className="w-4 h-4 text-teal-600" />
          <span>รายงานการประชุม</span>
        </button>
        <button
          onClick={() => onNavigateToResolutions?.(meeting.id)}
          className="p-2.5 text-slate-600 hover:text-[#B83B6F] hover:bg-pink-50/50 flex flex-col items-center gap-1 border-r border-slate-100 transition-colors"
        >
          <Award className="w-4 h-4 text-purple-600" />
          <span>มติ ({meeting.totalResolutions})</span>
        </button>
        <button
          onClick={() => onNavigateToTasks?.(meeting.id)}
          className="p-2.5 text-slate-600 hover:text-[#B83B6F] hover:bg-pink-50/50 flex flex-col items-center gap-1 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>ติดตามงาน</span>
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs text-slate-700 divide-y divide-slate-100">
        {/* Core Logistics Card */}
        <div className="space-y-2.5 pt-0">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">วันและเวลา:</span>
              <span className="text-slate-600">
                {meeting.date} • {meeting.timeStart} - {meeting.timeEnd} น.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">สถานที่ / รูปแบบ:</span>
              <span className="text-slate-600">{meeting.venue}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">ประธานในที่ประชุม:</span>
              <span className="text-slate-800 font-medium">{meeting.chairperson}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">เลขานุการ:</span>
              <span className="text-slate-800 font-medium">{meeting.secretary}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">หน่วยงานรับผิดชอบ:</span>
              <span className="text-slate-600">{meeting.department}</span>
            </div>
          </div>
        </div>

        {/* Meeting Notes */}
        {meeting.notes && (
          <div className="pt-4">
            <h3 className="font-semibold text-slate-900 mb-1">หมายเหตุ / แนวปฏิบัติ:</h3>
            <p className="text-slate-600 leading-relaxed bg-[#FAFAFC] p-3 rounded-lg border border-slate-200">
              {meeting.notes}
            </p>
          </div>
        )}

        {/* Agendas Preview */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-[#B83B6F]" />
              ระเบียบวาระการประชุม ({meeting.agendas.length} วาระ)
            </h3>
            <button
              onClick={() => onNavigateToAgendas?.(meeting.id)}
              className="text-[11px] font-semibold text-[#B83B6F] hover:underline"
            >
              จัดการวาระทั้งหมด →
            </button>
          </div>

          {meeting.agendas.length === 0 ? (
            <p className="text-slate-400 italic py-2">ยังไม่ได้กำหนดระเบียบวาระ</p>
          ) : (
            <div className="space-y-2">
              {meeting.agendas.map((ag) => (
                <div
                  key={ag.id}
                  className="p-2.5 rounded-lg border border-slate-200/90 bg-[#FAFAFC] hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {ag.itemNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-[#B83B6F] bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
                      {ag.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 leading-snug">
                    {ag.title}
                  </h4>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>ผู้นำเสนอ: {ag.presenter}</span>
                    <span>{ag.durationMinutes} นาที</span>
                  </div>
                  {ag.resolutionDecision && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded">
                      <span className="font-bold">มติ:</span> {ag.resolutionDecision}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendees Summary */}
        {meeting.attendees.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                ผู้เข้าร่วมประชุม ({attendedCount} / {meeting.attendees.length} รูป/ท่าน)
              </h3>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {meeting.attendees.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-[11px]"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{att.name}</p>
                    <p className="text-slate-400">{att.role}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      att.status === 'attended'
                        ? 'bg-emerald-100 text-emerald-800'
                        : att.status === 'assigned_substitute'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {att.status === 'attended'
                      ? 'เข้าร่วม'
                      : att.status === 'assigned_substitute'
                      ? 'มอบหมายแทน'
                      : 'ลาประชุม'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Bottom Actions */}
      <div className="p-4 border-t border-slate-200 bg-[#FAFAFC] flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditMeeting?.(meeting)}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          แก้ไขข้อมูล
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToMinutes?.(meeting.id)}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            พิมพ์รายงาน
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateToResolutions?.(meeting.id)}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            เปิดทะเบียนมติ
          </Button>
        </div>
      </div>
    </aside>
  );
};
