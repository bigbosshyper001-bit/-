import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Users,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { MeetingOrderRecord } from '../../data/meetingModuleData.ts';

export interface MeetingOrdersViewProps {
  orders: MeetingOrderRecord[];
}

export const MeetingOrdersView: React.FC<MeetingOrdersViewProps> = ({ orders }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.signedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadOrder = (order: MeetingOrderRecord) => {
    showToast({
      title: 'ดาวน์โหลดคำสั่งสำเร็จ',
      message: `ดาวน์โหลดสำเนา ${order.orderNumber} เรียบร้อยแล้ว`,
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
            placeholder="ค้นหาเลขที่คำสั่ง หรือชื่อคณะกรรมการ..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87]"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            showToast({
              title: 'สร้างคำสั่งใหม่',
              message: 'เปิดแบบฟอร์มยกร่างคำสั่งแต่งตั้งคณะกรรมการ',
              type: 'info',
            })
          }
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          ยกร่างคำสั่งใหม่
        </Button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((ord) => (
          <div
            key={ord.id}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 text-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                  {ord.orderNumber}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  มีผลบังคับใช้
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {ord.title}
              </h4>

              <div className="space-y-1 text-slate-600 text-[11px] pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>ลงวันที่: {ord.issuedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>จำนวนกรรมการ: {ord.membersCount} รูป/คน</span>
                </div>
                <p className="text-slate-500 pt-0.5">
                  ลงนามโดย: <strong className="text-slate-700">{ord.signedBy}</strong>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#B83B6F] uppercase tracking-wider">
                {ord.committeeType}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadOrder(ord)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                ดาวน์โหลดคำสั่ง
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
