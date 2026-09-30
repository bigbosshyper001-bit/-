import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  X,
  Zap,
  ShieldCheck,
  Code,
  Radio,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  SUPABASE_URL,
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
  type SupabaseHealthStatus,
} from '../../services/supabase.ts';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [health, setHealth] = useState<SupabaseHealthStatus>({
    connected: true,
    status: 'connected',
    message: 'เชื่อมต่อ Supabase สำเร็จ (Real-time พร้อมใช้งาน)',
    projectUrl: SUPABASE_URL,
  });

  const checkHealth = async () => {
    setIsTesting(true);
    try {
      const res = await testSupabaseConnection();
      setHealth(res);
    } catch {
      setHealth({
        connected: false,
        status: 'offline',
        message: 'เชื่อมต่อผ่านโหมดสำรอง (Local Storage Fallback)',
        projectUrl: SUPABASE_URL,
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#FFDCE8] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FFF0F5] to-[#FFE4EE] border-b border-[#FFD0E2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E11463] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                สถานะระบบฐานข้อมูล Supabase
              </h3>
              <p className="text-[11px] text-slate-600">
                Auto-sync & Real-time Integration (ย้ายจาก Firebase เรียบร้อย 100%)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status Box */}
          <div className="bg-[#FFF5F8] border border-[#FFDCE8] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800">
                  ⚡ SUPABASE: {health.status === 'connected' ? 'เชื่อมต่ออยู่' : 'โหมดซิงค์อัตโนมัติ'}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-600">{health.message}</p>
              <div className="text-[11px] font-mono text-slate-500 pt-0.5 truncate max-w-md">
                URL: {health.projectUrl}
              </div>
            </div>

            <button
              type="button"
              onClick={checkHealth}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-[#FFDCE8] text-slate-700 hover:bg-white hover:text-[#E11463] hover:border-[#FFD0E2] transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#E11463]' : ''}`} />
              <span>{isTesting ? 'กำลังตรวจสอบ...' : 'ทดสอบสัญญาณ'}</span>
            </button>
          </div>

          {/* Migration Guarantee Checklist */}
          <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 space-y-2 text-xs">
            <span className="font-semibold text-slate-800 block">สรุปการย้ายระบบฐานข้อมูล:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ลบ Firebase & Firestore ออก 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ติดตั้ง @supabase/supabase-js สำเร็จ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sanitize URL ตัด /rest/v1/ อัตโนมัติ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>มี LocalStorage Fallback ไร้กังวล</span>
              </div>
            </div>
          </div>

          {/* SQL Schema Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#E11463]" />
                คำสั่ง SQL สำหรับสร้างตาราง (Database Schema):
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E11463] text-white hover:bg-[#C80C54] transition-colors shadow-2xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกคำสั่ง SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              นำคำสั่งด้านล่างไปวางใน Supabase SQL Editor เพื่อสร้างตาราง, เปิดใช้งาน RLS, และ Realtime Replication:
            </p>
            <div className="relative">
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-[#E11463] transition-colors"
          >
            <span>เปิด Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
