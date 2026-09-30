import React from 'react';
import { Calendar, Filter, Plus, Clock, Building2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button.tsx';

export interface ExecutiveHeaderProps {
  fiscalYear: string;
  onFiscalYearChange: (year: string) => void;
  department: string;
  onDepartmentChange: (dept: string) => void;
  period: string;
  onPeriodChange: (period: string) => void;
  onOpenQuickAction: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  fiscalYear,
  onFiscalYearChange,
  department,
  onDepartmentChange,
  period,
  onPeriodChange,
  onOpenQuickAction,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. WELCOME HERO BANNER (Directly matching the uploaded screenshot) */}
      <div className="bg-gradient-to-r from-[#FFF0F5] via-[#FFF5F8] to-[#FFE4EE] border border-[#FFD0E2] rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 border border-[#FFD0E2] text-[#E11463] mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E11463]" />
              <span>กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU Academic Affairs)</span>
            </div>

            {/* Main Greeting */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              ยินดีต้อนรับสู่ <span className="text-[#E11463]">กองวิชาการ MCU</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              ระบบศูนย์กลางการบริหารงานวิชาการ ขับเคลื่อนยุทธศาสตร์ มติการประชุม และการติดตาม KPI มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </p>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 bg-white/70 px-2.5 py-1 rounded-lg border border-[#FFDCE8]">
                <Calendar className="w-3.5 h-3.5 text-[#E11463]" />
                ปีงบประมาณ {fiscalYear} (ไตรมาส {period === 'q3' ? '3' : period === 'q4' ? '4' : 'ทั้งหมด'})
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-600 bg-white/70 px-2.5 py-1 rounded-lg border border-[#FFDCE8]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                อัปเดตข้อมูลล่าสุด 16 ก.ย. 2569 (14:30 น.)
              </span>
            </div>
          </div>

          {/* Right Column: Official Badge Card & Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3.5 shrink-0">
            {/* Action Button */}
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenQuickAction}
              className="w-full sm:w-auto shadow-sm min-h-[44px] px-6 text-sm font-semibold rounded-xl bg-[#E11463] hover:bg-[#C80C54] cursor-pointer"
            >
              + เพิ่ม / สร้างรายการใหม่
            </Button>

            {/* Official Badge Card (as seen on the right in screenshot) */}
            <div className="hidden sm:flex items-center gap-3.5 bg-white/95 backdrop-blur-xs border border-[#FFD0E2] rounded-2xl p-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-full bg-[#E11463] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs shrink-0">
                MCU
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-[#E11463] tracking-wider block">
                  OFFICIAL PLATFORM
                </span>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  MCU ACADEMIC AFFAIRS
                </span>
                <span className="text-[10px] text-slate-500 block">
                  กองวิชาการ มจร
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER & METADATA BAR */}
      <div className="bg-white border border-[#FFDCE8] rounded-2xl px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px] sm:text-xs">
            <Filter className="w-3.5 h-3.5 text-[#E11463] shrink-0" />
            <span>ตัวกรองข้อมูล:</span>
          </div>

          {/* Fiscal Year Filter */}
          <div className="flex items-center gap-1 bg-[#FFF5F8] border border-[#FFDCE8] rounded-xl px-2.5 py-1.5 min-h-[38px]">
            <Calendar className="w-3.5 h-3.5 text-[#E11463] shrink-0" />
            <span className="text-slate-500 mr-1 text-[11px] sm:text-xs">ปีงบฯ:</span>
            <select
              value={fiscalYear}
              onChange={(e) => onFiscalYearChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs"
              aria-label="เลือกปีงบประมาณ"
            >
              <option value="2569">2569 (ปัจจุบัน)</option>
              <option value="2568">2568</option>
              <option value="2567">2567</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1 bg-[#FFF5F8] border border-[#FFDCE8] rounded-xl px-2.5 py-1.5 min-h-[38px] max-w-full sm:max-w-none">
            <Building2 className="w-3.5 h-3.5 text-[#E11463] shrink-0" />
            <span className="text-slate-500 mr-1 text-[11px] sm:text-xs">ส่วนงาน:</span>
            <select
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs max-w-[150px] sm:max-w-[180px] truncate"
              aria-label="เลือกหน่วยงาน"
            >
              <option value="all">ทุกส่วนงานวิชาการ</option>
              <option value="พุทธศาสตร์">คณะพุทธศาสตร์</option>
              <option value="ครุศาสตร์">คณะครุศาสตร์</option>
              <option value="มนุษยศาสตร์">คณะมนุษยศาสตร์</option>
              <option value="สังคมศาสตร์">คณะสังคมศาสตร์</option>
              <option value="บัณฑิตวิทยาลัย">บัณฑิตวิทยาลัย</option>
              <option value="วิทยาลัยพระธรรมทูต">วิทยาลัยพระธรรมทูต</option>
              <option value="ศูนย์ Credit Bank">ศูนย์ Credit Bank</option>
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-[#FFF5F8] border border-[#FFDCE8] rounded-xl px-2.5 py-1.5 min-h-[38px]">
            <Clock className="w-3.5 h-3.5 text-[#E11463] shrink-0" />
            <span className="text-slate-500 mr-1 text-[11px] sm:text-xs">ช่วง:</span>
            <select
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs"
              aria-label="เลือกช่วงเวลา"
            >
              <option value="q3">ไตรมาส 3 (เม.ย.-มิ.ย.)</option>
              <option value="q4">ไตรมาส 4 (ก.ค.-ก.ย.)</option>
              <option value="all-year">ตลอดปีงบฯ 2569</option>
            </select>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-slate-500 text-[11px] self-end md:self-auto bg-[#FFF5F8] border border-[#FFDCE8] px-2.5 py-1 rounded-full">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-700">ออนไลน์ • ซิงค์สด</span>
        </div>
      </div>
    </div>
  );
};
