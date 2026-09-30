import React from 'react';
import { Target, ExternalLink, Building2, User, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import type { DashboardKPI } from '../../data/executiveDashboardData.ts';
import type { AppRoute } from '../../types.ts';

export interface KPIDetailModalProps {
  kpi: DashboardKPI | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const KPIDetailModal: React.FC<KPIDetailModalProps> = ({
  kpi,
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!kpi) return null;

  const isAchieved = kpi.status === 'achieved';
  const isLagging = kpi.status === 'lagging';

  const badgeColor = isAchieved
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isLagging
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';

  const badgeText = isAchieved
    ? 'บรรลุเป้าหมาย'
    : isLagging
    ? 'ต่ำกว่าเป้าหมาย'
    : 'กำลังดำเนินตามแผน';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`รายละเอียดตัวชี้วัด: ${kpi.code}`}
      description={kpi.title}
      size="md"
    >
      <div className="space-y-4 py-2">
        {/* Metric Summary Card */}
        <div className="bg-[#FAFAFC] border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded border ${badgeColor}`}
            >
              {badgeText}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              {kpi.period}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">
                เป้าหมายที่กำหนด (Target)
              </span>
              <span className="text-xl font-bold text-slate-700 font-mono">
                {kpi.targetValue} {kpi.unit}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">
                ผลงานที่ทำได้จริง (Actual)
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {kpi.actualValue} {kpi.unit}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>ความก้าวหน้า</span>
              <span className="font-bold text-slate-900">{kpi.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAchieved ? 'bg-emerald-500' : isLagging ? 'bg-rose-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(kpi.progress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Responsible Metadata */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">หน่วยงาน:</span>
            <span>{kpi.department}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">ผู้รับผิดชอบ:</span>
            <span>{kpi.owner}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">แนวโน้มเปรียบเทียบ:</span>
            <span className="text-emerald-700 font-semibold">{kpi.changeTrend}</span>
          </div>
        </div>

        {/* Action Button to Strategic Hub */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิด
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              onNavigate('/strategy');
            }}
          >
            เปิดดูในระบบแผนยุทธศาสตร์ (Strategy Hub)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
