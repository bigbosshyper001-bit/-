import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Calendar,
  Building2,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import { ResponsiveTable } from '../ui/ResponsiveTable.tsx';
import type { TableColumn } from '../../types.ts';
import type { RiskRecord } from '../../data/strategyModuleData.ts';

export interface RiskRegisterAndMatrixViewProps {
  risks: RiskRecord[];
  onUpdateRisk?: (updated: RiskRecord) => void;
  onAddRisk?: (newRisk: RiskRecord) => void;
}

export const RiskRegisterAndMatrixView: React.FC<RiskRegisterAndMatrixViewProps> = ({
  risks,
  onUpdateRisk,
  onAddRisk,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Matrix Cell Selection: e.g. { likelihood: 4, impact: 4 } or null
  const [selectedCell, setSelectedCell] = useState<{
    likelihood: number;
    impact: number;
  } | null>(null);

  // Add Risk Form
  const [isCreating, setIsCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCause, setFormCause] = useState('');
  const [formImpact, setFormImpact] = useState(3);
  const [formLikelihood, setFormLikelihood] = useState(3);
  const [formOwner, setFormOwner] = useState('');
  const [formDept, setFormDept] = useState('กองวิชาการ');
  const [formMitigation, setFormMitigation] = useState('');
  const [formDueDate, setFormDueDate] = useState('2026-10-31');
  const [formStatus, setFormStatus] = useState<RiskRecord['status']>('active');

  // Filtered Risks
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.mitigation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel =
        levelFilter === 'all' || r.level === levelFilter;
      const matchesStatus =
        statusFilter === 'all' || r.status === statusFilter;

      const matchesCell =
        !selectedCell ||
        (r.likelihood === selectedCell.likelihood && r.impact === selectedCell.impact);

      return matchesSearch && matchesLevel && matchesStatus && matchesCell;
    });
  }, [risks, searchQuery, levelFilter, statusFilter, selectedCell]);

  // Matrix Cell Helper
  const getCellColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 12) return 'bg-rose-500 text-white hover:bg-rose-600';
    if (score >= 8) return 'bg-amber-400 text-slate-900 hover:bg-amber-500';
    if (score >= 5) return 'bg-yellow-300 text-slate-900 hover:bg-yellow-400';
    return 'bg-emerald-400 text-slate-900 hover:bg-emerald-500';
  };

  const getCellCount = (likelihood: number, impact: number) => {
    return risks.filter((r) => r.likelihood === likelihood && r.impact === impact).length;
  };

  // Add Risk Submit
  const handleCreateRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาระบุชื่อความเสี่ยง',
        type: 'error',
      });
      return;
    }

    const score = formImpact * formLikelihood;
    let level: RiskRecord['level'] = 'low';
    if (score >= 12) level = 'critical';
    else if (score >= 8) level = 'high';
    else if (score >= 5) level = 'medium';

    const newRisk: RiskRecord = {
      id: `RSK-0${risks.length + 1}`,
      name: formName,
      description: formDesc || 'ความเสี่ยงด้านวิชาการและการจัดการ',
      cause: formCause || 'ปัจจัยภายในและภายนอกองค์กร',
      impact: formImpact,
      likelihood: formLikelihood,
      score,
      level,
      owner: formOwner || 'ผอ.กองวิชาการ',
      department: formDept,
      mitigation: formMitigation || 'กำหนดมาตรการควบคุมภายใน',
      dueDate: formDueDate,
      status: formStatus,
    };

    onAddRisk?.(newRisk);
    setIsCreating(false);
    setFormName('');
    setFormDesc('');
    setFormCause('');
    setFormMitigation('');
    showToast({
      title: 'บันทึกความเสี่ยงสำเร็จ',
      message: `ลงทะเบียน ${newRisk.id} ระดับ ${level.toUpperCase()} เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  const handleUpdateStatus = (
    risk: RiskRecord,
    newStatus: RiskRecord['status']
  ) => {
    const updated: RiskRecord = { ...risk, status: newStatus };
    onUpdateRisk?.(updated);
    showToast({
      title: 'ปรับปรุงสถานะความเสี่ยง',
      message: `${risk.id}: สถานะ "${newStatus}"`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. 5x5 RISK MATRIX SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B83B6F] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              เมทริกซ์ความเสี่ยง (5x5 Risk Matrix: Likelihood × Impact)
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกที่ช่องใน Matrix เพื่อกรองดูรายการความเสี่ยงในพิกัดนั้น
            </p>
          </div>

          {selectedCell && (
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              ล้างการเลือกพิกัด ({selectedCell.likelihood} × {selectedCell.impact})
            </button>
          )}
        </div>

        {/* Matrix Visualization Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 py-2">
          {/* Matrix Grid Container */}
          <div className="flex items-center gap-3">
            {/* Y-Axis Label (Likelihood) */}
            <div className="writing-vertical-lr rotate-180 text-xs font-bold text-slate-700 tracking-wider text-center uppercase">
              โอกาสเกิด (Likelihood 1-5)
            </div>

            {/* 5x5 Grid */}
            <div className="space-y-1.5">
              {/* Likelihood Rows from 5 down to 1 */}
              {[5, 4, 3, 2, 1].map((likelihood) => (
                <div key={`l-${likelihood}`} className="flex items-center gap-1.5">
                  <span className="w-5 text-xs font-mono font-bold text-slate-500 text-right">
                    {likelihood}
                  </span>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const count = getCellCount(likelihood, impact);
                    const colorClasses = getCellColor(likelihood, impact);
                    const isSelected =
                      selectedCell?.likelihood === likelihood &&
                      selectedCell?.impact === impact;

                    return (
                      <button
                        key={`cell-${likelihood}-${impact}`}
                        onClick={() =>
                          setSelectedCell(
                            isSelected ? null : { likelihood, impact }
                          )
                        }
                        className={`w-11 h-11 sm:w-13 sm:h-13 rounded-lg font-mono font-bold text-xs flex flex-col items-center justify-center transition-all ${colorClasses} ${
                          isSelected
                            ? 'ring-3 ring-slate-900 shadow-md scale-105 z-10'
                            : ''
                        }`}
                        title={`L${likelihood} × I${impact} = ${
                          likelihood * impact
                        } (${count} รายการ)`}
                      >
                        <span className="text-sm">{count > 0 ? count : ''}</span>
                        <span className="text-[9px] opacity-75 font-normal">
                          {likelihood * impact}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* X-Axis Numbers & Label (Impact) */}
              <div className="flex items-center gap-1.5 pl-6 pt-1">
                {[1, 2, 3, 4, 5].map((impact) => (
                  <div
                    key={`i-${impact}`}
                    className="w-11 sm:w-13 text-center text-xs font-mono font-bold text-slate-500"
                  >
                    {impact}
                  </div>
                ))}
              </div>
              <div className="text-center text-xs font-bold text-slate-700 tracking-wider pl-6 pt-1 uppercase">
                ผลกระทบ (Impact 1-5)
              </div>
            </div>
          </div>

          {/* Matrix Color Legend & Distribution Breakdown */}
          <div className="bg-[#FAFAFC] border border-slate-200 rounded-xl p-4 text-xs space-y-3 max-w-xs w-full">
            <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              เกณฑ์ระดับความเสี่ยง (Risk Levels)
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-rose-500" />
                  <span className="font-semibold text-slate-800">สูงมาก/วิกฤต (Critical: 12-25)</span>
                </div>
                <span className="font-mono font-bold text-rose-700">
                  {risks.filter((r) => r.score >= 12).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-400" />
                  <span className="font-semibold text-slate-800">สูง (High: 8-11)</span>
                </div>
                <span className="font-mono font-bold text-amber-700">
                  {risks.filter((r) => r.score >= 8 && r.score < 12).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-yellow-300" />
                  <span className="font-semibold text-slate-800">ปานกลาง (Medium: 5-7)</span>
                </div>
                <span className="font-mono font-bold text-yellow-800">
                  {risks.filter((r) => r.score >= 5 && r.score < 8).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-400" />
                  <span className="font-semibold text-slate-800">ต่ำ (Low: 1-4)</span>
                </div>
                <span className="font-mono font-bold text-emerald-800">
                  {risks.filter((r) => r.score < 5).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RISK REGISTER DATA TABLE */}
      <div className="space-y-4">
        {/* Control Bar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัสความเสี่ยง, สาเหตุ หรือมาตรการควบคุม..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="all">ทุกระดับความเสี่ยง</option>
                <option value="critical">Critical / วิกฤต</option>
                <option value="high">High / สูง</option>
                <option value="medium">Medium / ปานกลาง</option>
                <option value="low">Low / ต่ำ</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="active">Active (เกิดความเสี่ยง)</option>
                <option value="mitigating">Mitigating (กำลังควบคุม)</option>
                <option value="resolved">Resolved (แก้ไขแล้ว)</option>
                <option value="monitored">Monitored (เฝ้าระวัง)</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreating(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                ลงทะเบียนความเสี่ยงใหม่
              </Button>
            </div>
          </div>
        </div>

        {/* Create Risk Form */}
        {isCreating && (
          <div className="bg-rose-50/40 border border-rose-200/90 rounded-xl p-4 sm:p-5 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-rose-600" />
                ลงทะเบียนความเสี่ยงใหม่ (New Risk Entry)
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ยกเลิก
              </button>
            </div>

            <form onSubmit={handleCreateRiskSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ชื่อเหตุการณ์ความเสี่ยง (Risk Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น หลักสูตรไม่ผ่านการรับรองมาตรฐานตามกำหนดเวลา"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    สาเหตุของความเสี่ยง (Cause)
                  </label>
                  <input
                    type="text"
                    value={formCause}
                    onChange={(e) => setFormCause(e.target.value)}
                    placeholder="ระบุสาเหตุและปัจจัยชักนำ"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    มาตรการควบคุม / ลดความเสี่ยง (Mitigation Plan)
                  </label>
                  <input
                    type="text"
                    value={formMitigation}
                    onChange={(e) => setFormMitigation(e.target.value)}
                    placeholder="ระบุแนวทางแก้ไขและควบคุม"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    โอกาสเกิด (Likelihood 1-5)
                  </label>
                  <select
                    value={formLikelihood}
                    onChange={(e) => setFormLikelihood(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option value={1}>1 - น้อยมาก (Very Low)</option>
                    <option value={2}>2 - น้อย (Low)</option>
                    <option value={3}>3 - ปานกลาง (Medium)</option>
                    <option value={4}>4 - สูง (High)</option>
                    <option value={5}>5 - สูงมาก (Very High)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ผลกระทบ (Impact 1-5)
                  </label>
                  <select
                    value={formImpact}
                    onChange={(e) => setFormImpact(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option value={1}>1 - เล็กน้อย (Insignificant)</option>
                    <option value={2}>2 - ปานกลาง (Moderate)</option>
                    <option value={3}>3 - รุนแรง (Major)</option>
                    <option value={4}>4 - วิกฤต (Critical)</option>
                    <option value={5}>5 - หายนะ (Catastrophic)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ผู้รับผิดชอบกำกับความเสี่ยง (Owner)
                  </label>
                  <input
                    type="text"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    placeholder="เช่น ดร.สมชาย"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    กำหนดเสร็จสิ้น (Due Date)
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200/60">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreating(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  บันทึกทะเบียนความเสี่ยง
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Risk Register Data Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3 sm:p-4">
          <ResponsiveTable
            data={filteredRisks}
            keyExtractor={(risk) => risk.id}
            columns={[
              {
                key: 'name',
                title: 'รหัส / ชื่อความเสี่ยง (Risk Event)',
                render: (risk) => (
                  <div>
                    <span className="font-mono font-bold text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {risk.id}
                    </span>
                    <p className="font-bold text-slate-900 leading-snug mt-1">
                      {risk.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {risk.description}
                    </p>
                  </div>
                ),
              },
              {
                key: 'cause',
                title: 'สาเหตุ (Cause)',
                render: (risk) => (
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 max-w-[200px]">
                    {risk.cause}
                  </p>
                ),
              },
              {
                key: 'matrix',
                title: 'Likelihood × Impact',
                align: 'center',
                render: (risk) => (
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    L{risk.likelihood} × I{risk.impact}
                  </span>
                ),
              },
              {
                key: 'score',
                title: 'คะแนน (Score)',
                align: 'center',
                render: (risk) => (
                  <span
                    className={`font-mono font-black text-xs px-2.5 py-1 rounded-full ${
                      risk.level === 'critical'
                        ? 'bg-rose-500 text-white'
                        : risk.level === 'high'
                        ? 'bg-amber-400 text-slate-900'
                        : risk.level === 'medium'
                        ? 'bg-yellow-300 text-slate-900'
                        : 'bg-emerald-400 text-slate-900'
                    }`}
                  >
                    {risk.score} ({risk.level.toUpperCase()})
                  </span>
                ),
              },
              {
                key: 'mitigation',
                title: 'มาตรการควบคุม (Mitigation)',
                render: (risk) => (
                  <p className="text-[11px] text-slate-800 leading-relaxed line-clamp-2 max-w-[220px]">
                    {risk.mitigation}
                  </p>
                ),
              },
              {
                key: 'owner',
                title: 'ผู้รับผิดชอบ / กำหนด',
                render: (risk) => (
                  <div className="text-[11px]">
                    <p className="font-semibold text-slate-800">{risk.owner}</p>
                    <p className="font-mono text-slate-400">{risk.dueDate}</p>
                  </div>
                ),
              },
              {
                key: 'status',
                title: 'สถานะ',
                align: 'center',
                render: (risk) => (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      risk.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : risk.status === 'mitigating'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : risk.status === 'monitored'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {risk.status}
                  </span>
                ),
              },
              {
                key: 'actions',
                title: 'ปรับสถานะ',
                align: 'right',
                render: (risk) => (
                  <select
                    value={risk.status}
                    onChange={(e) =>
                      handleUpdateStatus(risk, e.target.value as RiskRecord['status'])
                    }
                    className="text-[11px] font-semibold border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
                  >
                    <option value="active">Active</option>
                    <option value="mitigating">Mitigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="monitored">Monitored</option>
                  </select>
                ),
              },
            ]}
            renderCard={(risk) => ({
              id: risk.id,
              title: risk.name,
              subtitle: `${risk.id} • L${risk.likelihood} × I${risk.impact} (คะแนน ${risk.score})`,
              statusBadge: (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    risk.level === 'critical'
                      ? 'bg-rose-500 text-white'
                      : risk.level === 'high'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : risk.level === 'medium'
                      ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {risk.level.toUpperCase()}
                </span>
              ),
              fields: [
                { label: 'สาเหตุ', value: risk.cause, fullWidth: true },
                { label: 'มาตรการ', value: risk.mitigation, fullWidth: true },
                { label: 'ผู้รับผิดชอบ', value: risk.owner },
                { label: 'กำหนดเสร็จ', value: risk.dueDate },
              ],
              primaryAction: (
                <div className="flex items-center justify-between w-full pt-1">
                  <span className="text-xs text-slate-500 font-semibold">ปรับสถานะ:</span>
                  <select
                    value={risk.status}
                    onChange={(e) =>
                      handleUpdateStatus(risk, e.target.value as RiskRecord['status'])
                    }
                    className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
                  >
                    <option value="active">Active (คงอยู่)</option>
                    <option value="mitigating">Mitigating (กำลังลด)</option>
                    <option value="resolved">Resolved (แก้ไขแล้ว)</option>
                    <option value="monitored">Monitored (เฝ้าระวัง)</option>
                  </select>
                </div>
              ),
            })}
          />
        </div>
      </div>
      </div>
    </div>
  );
};
