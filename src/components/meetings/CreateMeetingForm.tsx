import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Building2,
  FileText,
  Save,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { MeetingRecord } from '../../data/meetingModuleData.ts';

export interface CreateMeetingFormProps {
  onCancel: () => void;
  onSubmitSuccess: (newMeeting: MeetingRecord) => void;
  initialData?: MeetingRecord | null;
}

export const CreateMeetingForm: React.FC<CreateMeetingFormProps> = ({
  onCancel,
  onSubmitSuccess,
  initialData,
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialData?.title || '');
  const [sessionNumber, setSessionNumber] = useState(
    initialData?.sessionNumber ? String(initialData.sessionNumber) : '1'
  );
  const [fiscalYear, setFiscalYear] = useState(initialData?.fiscalYear || '2569');
  const [date, setDate] = useState(initialData?.date || '');
  const [timeStart, setTimeStart] = useState(initialData?.timeStart || '09:00');
  const [timeEnd, setTimeEnd] = useState(initialData?.timeEnd || '12:00');
  const [venue, setVenue] = useState(initialData?.venue || '');
  const [chairperson, setChairperson] = useState(initialData?.chairperson || '');
  const [secretary, setSecretary] = useState(initialData?.secretary || '');
  const [department, setDepartment] = useState(
    initialData?.department || 'กองวิชาการ สำนักงานอธิการบดี'
  );
  const [attendeesText, setAttendeesText] = useState(
    initialData?.attendees ? initialData.attendees.map((a, i) => `${i + 1}. ${a.name}`).join('\n') : ''
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'กรุณาระบุชื่อการประชุม';
    if (!sessionNumber.trim()) newErrors.sessionNumber = 'กรุณาระบุครั้งที่ประชุม';
    if (!date.trim()) newErrors.date = 'กรุณาเลือกวันที่ประชุม';
    if (!venue.trim()) newErrors.venue = 'กรุณาระบุสถานที่ประชุม';
    if (!chairperson.trim()) newErrors.chairperson = 'กรุณาระบุประธานในที่ประชุม';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast({
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        message: 'มีบางช่องข้อมูลที่ยังไม่ได้ระบุ',
        type: 'error',
      });
      return;
    }

    const attendeeList = attendeesText
      .split('\n')
      .filter((line) => line.trim())
      .map((line, idx) => ({
        id: `att-gen-${Date.now()}-${idx}`,
        name: line.replace(/^\d+\.\s*/, '').trim(),
        role: 'กรรมการสภาวิชาการ',
        department: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        status: 'attended' as const,
      }));

    const newRecord: MeetingRecord = {
      id: initialData ? initialData.id : `mtg-gen-${Date.now()}`,
      code: `สว.${fiscalYear}/${sessionNumber.padStart(2, '0')}`,
      title,
      sessionNumber: Number(sessionNumber) || 1,
      fiscalYear,
      date,
      timeStart,
      timeEnd,
      venue,
      chairperson,
      secretary,
      department,
      notes,
      status: initialData ? initialData.status : 'scheduled',
      agendas: initialData ? initialData.agendas : [],
      attendees: attendeeList,
      totalResolutions: initialData ? initialData.totalResolutions : 0,
      completedResolutions: initialData ? initialData.completedResolutions : 0,
    };

    onSubmitSuccess(newRecord);
    showToast({
      title: initialData ? 'แก้ไขการประชุมสำเร็จ' : 'สร้างการประชุมใหม่สำเร็จ',
      message: `บันทึก "${newRecord.title}" ในระบบเรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-[#FAFAFC] flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ย้อนกลับไปตารางการประชุม
          </button>
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'แก้ไขข้อมูลการประชุม' : 'สร้างกำหนดการประชุมใหม่'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบบริหารจัดการวาระการประชุมและมติสภาวิชาการ มจร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            {initialData ? 'บันทึกการแก้ไข' : 'บันทึกและสร้างการประชุม'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#B83B6F]" />
            ข้อมูลพื้นฐานการประชุม
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อการประชุม <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              placeholder="ระบุชื่อการประชุม เช่น การประชุมสภาวิชาการ ครั้งที่ 10/2569"
            />
            {errors.title && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ครั้งที่ <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={sessionNumber}
                onChange={(e) => setSessionNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
                placeholder="เช่น 10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ปีงบประมาณ / ปี พ.ศ.
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87] bg-white"
              >
                <option value="2569">2569</option>
                <option value="2568">2568</option>
                <option value="2567">2567</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                หน่วยงานหลักที่รับผิดชอบ
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>
          </div>
        </div>

        {/* Date, Time & Venue */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            กำหนดวัน เวลา และสถานที่
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                วันที่จัดประชุม <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เวลาเริ่ม
              </label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เวลาสิ้นสุด (โดยประมาณ)
              </label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              สถานที่จัดการประชุม / ลิงก์ออนไลน์ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
                placeholder="เช่น ห้องประชุม 401 อาคารสำนักงานอธิการบดี มจร วังน้อย หรือระบบ Zoom"
              />
            </div>
          </div>
        </div>

        {/* Officers & Key Roles */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            คณะกรรมการและผู้รับผิดชอบ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ประธานในที่ประชุม <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={chairperson}
                  onChange={(e) => setChairperson(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
                  placeholder="เช่น พระธรรมวัชรบัณฑิต, ศ.ดร. (อธิการบดี)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เลขานุการการประชุม <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={secretary}
                  onChange={(e) => setSecretary(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
                  placeholder="เช่น พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร. (ผอ.กองวิชาการ)"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              รายชื่อกรรมการและผู้เข้าร่วมประชุม (บรรทัดละ 1 ท่าน)
            </label>
            <textarea
              rows={4}
              value={attendeesText}
              onChange={(e) => setAttendeesText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87] font-mono leading-relaxed"
              placeholder="ระบุรายนามผู้เข้าร่วมประชุม"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            หมายเหตุ / บันทึกเพิ่มเติมสำหรับการจัดประชุม
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
            placeholder="เช่น ข้อควรระวังในการบันทึกเทป หรือข้อกำหนดการแต่งกาย"
          />
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            {initialData ? 'บันทึกการแก้ไข' : 'บันทึกและสร้างการประชุม'}
          </Button>
        </div>
      </form>
    </div>
  );
};
