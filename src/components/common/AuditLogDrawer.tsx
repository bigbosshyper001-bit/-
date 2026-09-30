import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Search,
  Filter,
  ArrowRight,
  Shield,
  User,
  Clock,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { auditLogService } from '../../services/auditLogService.ts';
import type { AuditLogEntry } from '../../types/architecture.ts';

export interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  useEffect(() => {
    if (isOpen) {
      const unsub = auditLogService.subscribe((updatedLogs) => {
        setLogs(updatedLogs);
      });
      return unsub;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (selectedModule !== 'all' && log.module.toLowerCase() !== selectedModule.toLowerCase()) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.recordTitle.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.recordId.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">UPDATE</span>;
      case 'APPROVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">APPROVE</span>;
      case 'TRANSITION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">TRANSITION</span>;
      case 'EXPORT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">EXPORT</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">DELETE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-[#FAFAFC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#D94F87]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">บันทึกประวัติการแก้ไขระบบ (System Audit Trail)</h2>
                <p className="text-xs text-slate-500">
                  ตรวจสอบการเปลี่ยนแปลงข้อมูล ละเอียดถึงระดับ Old Value → New Value ทุก Module
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-100 bg-white space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อผู้ใช้, รายการ, Action, รหัสบันทึก..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 shrink-0 text-[11px]">Module:</span>
              {['all', 'Strategy', 'Meeting', 'Credit', 'Faculty', 'Regulatory', 'Security', 'Integration'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedModule(m)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                    selectedModule === m
                      ? 'bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m === 'all' ? 'ทุกโมดูล' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/50">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                ไม่พบบันทึก Audit Log ตามเงื่อนไขที่กำหนด
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action)}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.module}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {log.recordId}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {log.recordTitle}
                    </h4>
                    {log.details && (
                      <p className="text-xs text-slate-600 mt-1">
                        {log.details}
                      </p>
                    )}
                  </div>

                  {/* Diff Box if old vs new values exist */}
                  {(log.oldValue !== undefined && log.oldValue !== null) || (log.newValue !== undefined && log.newValue !== null) ? (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-[11px] font-mono space-y-1">
                      {log.oldValue !== undefined && log.oldValue !== null && (
                        <div className="flex items-start gap-1.5 text-red-600">
                          <span className="font-bold shrink-0">- OLD:</span>
                          <span className="truncate">{typeof log.oldValue === 'object' ? JSON.stringify(log.oldValue) : String(log.oldValue)}</span>
                        </div>
                      )}
                      {log.newValue !== undefined && log.newValue !== null && (
                        <div className="flex items-start gap-1.5 text-emerald-700">
                          <span className="font-bold shrink-0">+ NEW:</span>
                          <span className="truncate">{typeof log.newValue === 'object' ? JSON.stringify(log.newValue) : String(log.newValue)}</span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* User stamp */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{log.userName}</span>
                      <span className="text-slate-400">({log.userRole})</span>
                    </div>
                    {log.ipAddress && (
                      <span className="font-mono text-[10px] text-slate-400">IP: {log.ipAddress}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-[#FAFAFC] flex items-center justify-between text-xs text-slate-500">
            <span>แสดง {filteredLogs.length} รายการ</span>
            <button
              type="button"
              onClick={() => auditLogService.resetToDemo()}
              className="text-[11px] text-[#B83B6F] hover:underline font-medium"
            >
              รีเซ็ตบันทึกเริ่มต้น (Reset Logs)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
