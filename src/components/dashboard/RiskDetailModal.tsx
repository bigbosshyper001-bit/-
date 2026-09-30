import React from 'react';
import { ShieldAlert, AlertTriangle, Building2, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import type { RiskItem } from '../../data/executiveDashboardData.ts';
import type { AppRoute } from '../../types.ts';

export interface RiskDetailModalProps {
  risk: RiskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const RiskDetailModal: React.FC<RiskDetailModalProps> = ({
  risk,
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!risk) return null;

  const isCritical = risk.level === 'critical';
  const isHigh = risk.level === 'high';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ทะเบียนความเสี่ยง: ${risk.code}`}
      description={risk.title}
      size="md"
    >
      <div className="space-y-4 py-2">
        {/* Severity Banner */}
        <div
          className={`p-4 rounded-xl border ${
            isCritical
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : isHigh
              ? 'bg-orange-50 border-orange-200 text-orange-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wide">
                ระดับความเสี่ยง: {risk.level}
              </span>
            </div>
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-white/80 border border-slate-200">
              คะแนนความเสี่ยง {risk.score} / 25
            </span>
          </div>
          <p className="text-xs mt-1">
            หมวดหมู่: <span className="font-semibold">{risk.category}</span>
          </p>
        </div>

        {/* Mitigation Plan */}
        <div className="bg-[#FAFAFC] border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            มาตรการควบคุมและลดความเสี่ยง (Mitigation Plan)
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
            {risk.mitigationPlan}
          </p>
        </div>

        {/* Responsible Metadata */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">หน่วยงาน:</span>
            <span>{risk.department}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">ผู้รับผิดชอบกำกับ:</span>
            <span>{risk.owner}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-medium">สถานะมาตรการ:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {risk.status === 'active'
                ? 'กำลังเฝ้าระวัง'
                : risk.status === 'mitigating'
                ? 'อยู่ระหว่างดำเนินมาตรการ'
                : 'จัดการแล้ว'}
            </span>
          </div>
        </div>

        {/* Footer actions */}
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
            เปิดทะเบียนความเสี่ยงเต็ม (Risk Register)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
