import React, { useState } from 'react';
import {
  ListOrdered,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Paperclip,
  Clock,
  User,
  Building2,
  FileText,
  Save,
  Check,
  ChevronDown,
  Upload,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { MeetingRecord, MeetingAgendaItem } from '../../data/meetingModuleData.ts';

export interface AgendaBuilderProps {
  meetings: MeetingRecord[];
  selectedMeetingId?: string;
  onUpdateAgendas: (meetingId: string, updatedAgendas: MeetingAgendaItem[]) => void;
}

export const AgendaBuilder: React.FC<AgendaBuilderProps> = ({
  meetings,
  selectedMeetingId,
  onUpdateAgendas,
}) => {
  const { showToast } = useToast();

  const [activeMeetingId, setActiveMeetingId] = useState<string>(
    selectedMeetingId || meetings[0]?.id || ''
  );

  const currentMeeting = meetings.find((m) => m.id === activeMeetingId) || meetings[0];
  const [agendas, setAgendas] = useState<MeetingAgendaItem[]>(
    currentMeeting?.agendas || []
  );

  // Sync when meeting changes
  const handleMeetingChange = (newMeetingId: string) => {
    setActiveMeetingId(newMeetingId);
    const target = meetings.find((m) => m.id === newMeetingId);
    setAgendas(target?.agendas || []);
  };

  // State for Add Agenda Modal / Panel
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newItemNumber, setNewItemNumber] = useState('');
  const [newCategory, setNewCategory] = useState<MeetingAgendaItem['category']>('เสนอเพื่อพิจารณา');
  const [newPresenter, setNewPresenter] = useState('');
  const [newPresenterRole, setNewPresenterRole] = useState('');
  const [newDepartment, setNewDepartment] = useState('กองวิชาการ');
  const [newDuration, setNewDuration] = useState('30');
  const [newDescription, setNewDescription] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Move Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...agendas];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    // update order
    newItems.forEach((item, idx) => (item.order = idx + 1));
    setAgendas(newItems);
  };

  // Move Down
  const handleMoveDown = (index: number) => {
    if (index === agendas.length - 1) return;
    const newItems = [...agendas];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    newItems.forEach((item, idx) => (item.order = idx + 1));
    setAgendas(newItems);
  };

  // Delete Agenda
  const handleDeleteAgenda = (id: string) => {
    const newItems = agendas.filter((ag) => ag.id !== id);
    newItems.forEach((item, idx) => (item.order = idx + 1));
    setAgendas(newItems);
    showToast({
      title: 'ลบวาระการประชุม',
      message: 'ลบวาระเรียบร้อยแล้ว',
      type: 'info',
    });
  };

  // Save All Changes
  const handleSaveAll = () => {
    if (currentMeeting) {
      onUpdateAgendas(currentMeeting.id, agendas);
      showToast({
        title: 'บันทึกระเบียบวาระสำเร็จ',
        message: `จัดเก็บระเบียบวาระ ${agendas.length} วาระ สำหรับ ${currentMeeting.code} เรียบร้อยแล้ว`,
        type: 'success',
      });
    }
  };

  // Submit New Agenda
  const handleAddAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาระบุชื่อเรื่องของวาระการประชุม',
        type: 'error',
      });
      return;
    }

    const orderNum = agendas.length + 1;
    const itemNum = newItemNumber.trim() || `วาระที่ ${orderNum}`;

    const newAgenda: MeetingAgendaItem = {
      id: `ag-${Date.now()}`,
      order: orderNum,
      itemNumber: itemNum,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      presenter: newPresenter || 'ผู้นำเสนอตามวาระ',
      presenterRole: newPresenterRole || 'ผู้แทนส่วนงาน',
      department: newDepartment,
      durationMinutes: Number(newDuration) || 20,
      documents: newAttachmentName
        ? [{ name: newAttachmentName, size: '2.4 MB', type: 'application/pdf' }]
        : [],
    };

    const updated = [...agendas, newAgenda];
    setAgendas(updated);
    setIsAdding(false);
    setNewTitle('');
    setNewItemNumber('');
    setNewDescription('');
    setNewAttachmentName('');
    showToast({
      title: 'เพิ่มวาระสำเร็จ',
      message: `เพิ่ม "${newAgenda.title}" เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  // Calculate Total Duration
  const totalMinutes = agendas.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className="space-y-5">
      {/* Top Meeting Selection & Action Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B83B6F] flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4" />
              เครื่องมือสร้างและจัดระเบียบวาระ (Agenda Builder)
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs font-semibold text-slate-700">เลือกการประชุม:</label>
              <select
                value={activeMeetingId}
                onChange={(e) => handleMeetingChange(e.target.value)}
                className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-[#D94F87]"
              >
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.title} ({m.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Total Duration Chip */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>
                รวมเวลา: {hours > 0 ? `${hours} ชม. ` : ''}{mins} นาที
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              เพิ่มวาระ
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAll}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              บันทึกระเบียบวาระ
            </Button>
          </div>
        </div>
      </div>

      {/* Add New Agenda Form (Collapsible/Drawer) */}
      {isAdding && (
        <div className="bg-pink-50/40 border border-pink-200/80 rounded-xl p-4 sm:p-5 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#B83B6F]" />
              เพิ่มวาระการประชุมใหม่
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ยกเลิก
            </button>
          </div>

          <form onSubmit={handleAddAgendaSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ลำดับ / หมายเลขวาระ
                </label>
                <input
                  type="text"
                  value={newItemNumber}
                  onChange={(e) => setNewItemNumber(e.target.value)}
                  placeholder="เช่น วาระที่ 4.3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  หมวดหมู่วาระ
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MeetingAgendaItem['category'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                >
                  <option value="แจ้งเพื่อทราบ">แจ้งเพื่อทราบ</option>
                  <option value="รับรองรายงาน">รับรองรายงาน</option>
                  <option value="เรื่องสืบเนื่อง">เรื่องสืบเนื่อง</option>
                  <option value="เสนอเพื่อพิจารณา">เสนอเพื่อพิจารณา</option>
                  <option value="เรื่องอื่นๆ">เรื่องอื่นๆ</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  ชื่อเรื่องของวาระ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ระบุชื่อเรื่องที่ต้องการนำเสนอในที่ประชุม"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ผู้นำเสนอ (Presenter)
                </label>
                <input
                  type="text"
                  value={newPresenter}
                  onChange={(e) => setNewPresenter(e.target.value)}
                  placeholder="เช่น คณบดีคณะพุทธศาสตร์"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  หน่วยงานต้นสังกัด
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="เช่น กองวิชาการ / คณะ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  เวลาที่ใช้ (นาที)
                </label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                รายละเอียดและสาระสำคัญ
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="ระบุข้อเท็จจริง และวัตถุประสงค์ในการนำเสนอ"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                แนบชื่อไฟล์เอกสารประกอบวาระ
              </label>
              <div className="relative">
                <Paperclip className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="เช่น เอกสารประกอบวาระ_เล่มหลักสูตร.pdf"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-200/60">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsAdding(false)}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                เพิ่มวาระลงในรายการ
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Agendas List (With Reorder Controls) */}
      <div className="space-y-3">
        {agendas.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            <p>ยังไม่มีวาระการประชุมในรายการ</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="mt-3"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              เพิ่มวาระแรก
            </Button>
          </div>
        ) : (
          agendas.map((ag, index) => (
            <div
              key={ag.id}
              className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Order Indicator & Move Buttons */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-25 disabled:cursor-not-allowed rounded hover:bg-slate-100 transition-colors"
                    title="เลื่อนขึ้น"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === agendas.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-25 disabled:cursor-not-allowed rounded hover:bg-slate-100 transition-colors"
                    title="เลื่อนลง"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {ag.order}
                </div>

                {/* Agenda Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {ag.itemNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        ag.category === 'เสนอเพื่อพิจารณา'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : ag.category === 'เรื่องสืบเนื่อง'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {ag.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {ag.title}
                  </h4>
                  {ag.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {ag.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Presenter, Duration, Attachments & Delete */}
              <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0 md:border-l md:border-slate-100 md:pl-4">
                {/* Presenter */}
                <div className="hidden sm:block">
                  <span className="text-[10px] text-slate-400 block">ผู้นำเสนอ</span>
                  <span className="font-semibold text-slate-800 block truncate max-w-[140px]">
                    {ag.presenter}
                  </span>
                </div>

                {/* Duration */}
                <div>
                  <span className="text-[10px] text-slate-400 block">เวลา</span>
                  <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {ag.durationMinutes} น.
                  </span>
                </div>

                {/* Documents Attached */}
                <div>
                  <span className="text-[10px] text-slate-400 block">เอกสารแนบ</span>
                  <span className="font-mono font-medium text-slate-700 flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    {ag.documents.length} ไฟล์
                  </span>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteAgenda(ag.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors ml-1"
                  title="ลบวาระนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
