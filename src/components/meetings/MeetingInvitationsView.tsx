import React, { useState } from 'react';
import {
  Mail,
  Search,
  Download,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { MeetingInvitationRecord } from '../../data/meetingModuleData.ts';

export interface MeetingInvitationsViewProps {
  invitations: MeetingInvitationRecord[];
}

export const MeetingInvitationsView: React.FC<MeetingInvitationsViewProps> = ({
  invitations,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvitations = invitations.filter(
    (inv) =>
      inv.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendNotice = (inv: MeetingInvitationRecord) => {
    showToast({
      title: 'ส่งหนังสือเชิญประชุมเรียบร้อย',
      message: `จัดส่งหนังสือเชิญ ${inv.letterNumber} ไปยังกรรมการและผู้เกี่ยวข้องทางอีเมลและระบบสารบรรณแล้ว`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเลขที่หนังสือ หรือเรื่อง..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87]"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            showToast({
              title: 'สร้างหนังสือเชิญประชุม',
              message: 'เปิดแบบร่างหนังสือนัดประชุมฉบับใหม่',
              type: 'info',
            })
          }
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          สร้างหนังสือเชิญใหม่
        </Button>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAFAFC] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">เลขที่หนังสือ</th>
                <th className="py-3 px-3 min-w-[260px]">เรื่อง / การประชุม</th>
                <th className="py-3 px-3">วันและเวลานัดประชุม</th>
                <th className="py-3 px-3">วันที่ส่งหนังสือ</th>
                <th className="py-3 px-3 text-center">ตอบรับการเข้าร่วม</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                    {inv.letterNumber}
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900 leading-snug">{inv.subject}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{inv.meetingTitle}</p>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                    {inv.meetingDate}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {inv.sentDate}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded text-[11px]">
                      {inv.confirmedCount} / {inv.recipientsCount} ท่าน
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inv.status === 'read'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.status === 'sent'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.status === 'read'
                        ? 'รับทราบแล้ว'
                        : inv.status === 'sent'
                        ? 'จัดส่งแล้ว'
                        : 'ร่างหนังสือ'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendNotice(inv)}
                      leftIcon={<Send className="w-3 h-3" />}
                    >
                      ส่งหนังสือซ้ำ
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
