import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Award,
  CheckCircle2,
  Edit3,
  Save,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { MeetingRecord, MeetingAgendaItem } from '../../data/meetingModuleData.ts';

export interface MeetingMinutesViewProps {
  meetings: MeetingRecord[];
  selectedMeetingId?: string;
  onSaveMinutes?: (meetingId: string, updatedMeeting: MeetingRecord) => void;
}

export const MeetingMinutesView: React.FC<MeetingMinutesViewProps> = ({
  meetings,
  selectedMeetingId,
  onSaveMinutes,
}) => {
  const { showToast } = useToast();

  const [activeMeetingId, setActiveMeetingId] = useState<string>(
    selectedMeetingId || meetings[0]?.id || ''
  );

  const currentMeeting =
    meetings.find((m) => m.id === activeMeetingId) || meetings[0];

  const [isEditing, setIsEditing] = useState(false);

  // Print/Export Action
  const handlePrint = () => {
    window.print();
  };

  const handleExportDoc = () => {
    showToast({
      title: 'ส่งออกรายงานการประชุม',
      message: `ดาวน์โหลดรายงานการประชุม ${currentMeeting.code} ในรูปแบบเอกสารราชการ (PDF/DOCX) เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  if (!currentMeeting) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        ไม่พบข้อมูลการประชุม
      </div>
    );
  }

  const attended = currentMeeting.attendees.filter((a) => a.status === 'attended');
  const substitutes = currentMeeting.attendees.filter(
    (a) => a.status === 'assigned_substitute'
  );
  const absent = currentMeeting.attendees.filter((a) => a.status === 'absent');

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Control Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700">เลือกการประชุม:</span>
          <select
            value={activeMeetingId}
            onChange={(e) => setActiveMeetingId(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-[#D94F87]"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDoc}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            ส่งออก DOCX/PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            พิมพ์รายงานการประชุม
          </Button>
        </div>
      </div>

      {/* Official Minutes Paper Canvas */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-10 font-sans text-slate-800 space-y-6 leading-relaxed print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="text-center space-y-2 pb-6 border-b border-slate-200">
          <div className="w-12 h-12 rounded-full bg-pink-100 text-[#B83B6F] flex items-center justify-center mx-auto font-black text-xs font-mono">
            MCU
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">
            รายงานการประชุม
          </h1>
          <h2 className="text-sm font-semibold text-slate-800">
            {currentMeeting.title}
          </h2>
          <p className="text-xs text-slate-600">
            วันที่ {currentMeeting.date} เวลา {currentMeeting.timeStart} - {currentMeeting.timeEnd} น.
          </p>
          <p className="text-xs text-slate-600">
            ณ {currentMeeting.venue}
          </p>
        </div>

        {/* Section 1: Attendees */}
        <div className="space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">
            ผู้มาประชุม ({attended.length} รูป/ท่าน)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
            {attended.map((att, idx) => (
              <div key={att.id} className="flex items-baseline gap-2">
                <span className="font-mono text-slate-400 text-[11px] shrink-0">
                  {idx + 1}.
                </span>
                <div>
                  <span className="font-bold text-slate-800">{att.name}</span>
                  <span className="text-slate-500 text-[11px] block">{att.role}</span>
                </div>
              </div>
            ))}
          </div>

          {substitutes.length > 0 && (
            <div className="pt-2">
              <h4 className="font-bold text-slate-800 mb-2">
                ผู้แทนมาประชุม ({substitutes.length} รูป/ท่าน)
              </h4>
              <div className="space-y-1 pl-4">
                {substitutes.map((sub, idx) => (
                  <div key={sub.id} className="text-slate-700">
                    {idx + 1}. {sub.substituteName} (แทน {sub.name})
                  </div>
                ))}
              </div>
            </div>
          )}

          {absent.length > 0 && (
            <div className="pt-2">
              <h4 className="font-bold text-slate-800 mb-2">
                ผู้ไม่มาประชุมเนื่องจากติดภารกิจ ({absent.length} รูป/ท่าน)
              </h4>
              <div className="space-y-1 pl-4">
                {absent.map((ab, idx) => (
                  <div key={ab.id} className="text-slate-500">
                    {idx + 1}. {ab.name} ({ab.role})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Agendas, Discussions & Resolutions */}
        <div className="space-y-6 pt-4 border-t border-slate-200 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-1">
            ระเบียบวาระการประชุม ข้อปรึกษาหารือ และมติที่ประชุม
          </h3>

          {currentMeeting.agendas.length === 0 ? (
            <p className="text-slate-400 italic">ยังไม่มีข้อมูลวาระการประชุม</p>
          ) : (
            currentMeeting.agendas.map((ag) => (
              <div
                key={ag.id}
                className="space-y-3 p-4 rounded-xl border border-slate-200 bg-[#FAFAFC]"
              >
                {/* Agenda Title */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                      {ag.itemNumber}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {ag.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-[#B83B6F] bg-pink-50 border border-pink-100 px-2 py-0.5 rounded">
                    {ag.category}
                  </span>
                </div>

                {/* Description / Discussion */}
                <div className="space-y-2 text-slate-700 pl-2">
                  <div>
                    <span className="font-bold text-slate-900">สาระสำคัญ / ข้อเท็จจริง: </span>
                    <span>{ag.description || 'นำเสนอตามเอกสารประกอบวาระ'}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>ผู้นำเสนอ: <strong className="text-slate-700">{ag.presenter}</strong></span>
                    <span>ส่วนงาน: <strong className="text-slate-700">{ag.department}</strong></span>
                  </div>

                  {ag.resolutionProposal && (
                    <div className="p-2.5 rounded bg-blue-50/70 border border-blue-100 text-blue-950">
                      <span className="font-bold">ข้อเสนอต่อที่ประชุม: </span>
                      <span>{ag.resolutionProposal}</span>
                    </div>
                  )}
                </div>

                {/* Resolution Decision Block */}
                <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                      <Award className="w-4 h-4 text-emerald-600" />
                      มติที่ประชุม
                    </span>
                    {ag.resolutionId && (
                      <span className="font-mono text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                        {ag.resolutionId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">
                    {ag.resolutionDecision || 'ที่ประชุมมีมติเห็นชอบตามที่เสนอ'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Signature Section */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-8">
            <p className="text-slate-500">ผู้จดรายงานการประชุม</p>
            <div>
              <p className="font-bold text-slate-800">({currentMeeting.secretary})</p>
              <p className="text-slate-500 text-[11px]">เลขานุการสภาวิชาการ</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-slate-500">ผู้ตรวจรายงานการประชุม</p>
            <div>
              <p className="font-bold text-slate-800">({currentMeeting.chairperson})</p>
              <p className="text-slate-500 text-[11px]">ประธานสภาวิชาการ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
