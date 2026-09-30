import React, { useState, useMemo } from 'react';
import {
  Target,
  Search,
  Filter,
  Plus,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Building2,
  Sparkles,
  Upload,
  Edit2,
  Save,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { KPIRecord } from '../../data/strategyModuleData.ts';

export interface KPITrackingViewProps {
  kpis: KPIRecord[];
  onUpdateKPI?: (updatedKPI: KPIRecord) => void;
  onAddKPI?: (newKPI: KPIRecord) => void;
}

export const KPITrackingView: React.FC<KPITrackingViewProps> = ({
  kpis,
  onUpdateKPI,
  onAddKPI,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  // Editing Actual Value in Modal / Drawer
  const [editingKPI, setEditingKPI] = useState<KPIRecord | null>(null);
  const [newActualInput, setNewActualInput] = useState<string>('');
  const [newEvidenceFile, setNewEvidenceFile] = useState<string>('');

  // Creating New KPI
  const [isCreating, setIsCreating] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUnit, setFormUnit] = useState('%');
  const [formBaseline, setFormBaseline] = useState('0');
  const [formTarget, setFormTarget] = useState('100');
  const [formActual, setFormActual] = useState('0');
  const [formOwner, setFormOwner] = useState('');
  const [formDept, setFormDept] = useState('กองวิชาการ');
  const [formFreq, setFormFreq] = useState<KPIRecord['frequency']>('รายไตรมาส');

  const filteredKPIs = useMemo(() => {
    return kpis.filter((k) => {
      const matchesSearch =
        k.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || k.status === statusFilter;
      const matchesFrequency =
        frequencyFilter === 'all' || k.frequency === frequencyFilter;

      return matchesSearch && matchesStatus && matchesFrequency;
    });
  }, [kpis, searchQuery, statusFilter, frequencyFilter]);

  // Open edit actual drawer
  const handleOpenEditActual = (kpi: KPIRecord) => {
    setEditingKPI(kpi);
    setNewActualInput(String(kpi.actual));
    setNewEvidenceFile(kpi.evidence?.name || '');
  };

  // Save updated actual
  const handleSaveActual = () => {
    if (!editingKPI) return;
    const actualNum = Number(newActualInput) || 0;
    const targetNum = editingKPI.target || 1;
    const achievement = Number(((actualNum / targetNum) * 100).toFixed(1));

    let newStatus: KPIRecord['status'] = 'lagging';
    if (achievement >= 100) newStatus = 'achieved';
    else if (achievement >= 80) newStatus = 'on_track';

    const updated: KPIRecord = {
      ...editingKPI,
      actual: actualNum,
      achievementPercentage: achievement,
      status: newStatus,
      evidence: newEvidenceFile
        ? {
            name: newEvidenceFile,
            submittedDate: new Date().toISOString().slice(0, 10),
            verified: true,
          }
        : editingKPI.evidence,
    };

    onUpdateKPI?.(updated);
    setEditingKPI(null);
    showToast({
      title: 'คำนวณผลสัมฤทธิ์ KPI สำเร็จ',
      message: `${updated.code}: Achievement ${achievement}% (${newStatus})`,
      type: 'success',
    });
  };

  // Create KPI
  const handleCreateKPISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาระบุชื่อตัวชี้วัด KPI',
        type: 'error',
      });
      return;
    }

    const baselineNum = Number(formBaseline) || 0;
    const targetNum = Number(formTarget) || 1;
    const actualNum = Number(formActual) || 0;
    const achievement = Number(((actualNum / targetNum) * 100).toFixed(1));

    let newStatus: KPIRecord['status'] = 'lagging';
    if (achievement >= 100) newStatus = 'achieved';
    else if (achievement >= 80) newStatus = 'on_track';

    const newRecord: KPIRecord = {
      id: `kpi-${Date.now()}`,
      code: formCode.trim() || `KPI-AC-0${kpis.length + 1}`,
      name: formName,
      description: formDesc || 'ตัวชี้วัดตามแผนยุทธศาสตร์กองวิชาการ',
      unit: formUnit,
      baseline: baselineNum,
      target: targetNum,
      actual: actualNum,
      owner: formOwner || 'ผอ.กองวิชาการ',
      department: formDept,
      frequency: formFreq,
      status: newStatus,
      achievementPercentage: achievement,
    };

    onAddKPI?.(newRecord);
    setIsCreating(false);
    setFormName('');
    setFormDesc('');
    showToast({
      title: 'สร้างตัวชี้วัด KPI สำเร็จ',
      message: `เพิ่ม ${newRecord.code} เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัส KPI, ชื่อตัวชี้วัด หรือผู้กำกับดูแล..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87]"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">สถานะผลสัมฤทธิ์ทั้งหมด</option>
              <option value="achieved">Achieved (บรรลุเป้าหมาย ≥100%)</option>
              <option value="on_track">On Track (ตามแผน 80-99%)</option>
              <option value="lagging">Lagging (ต่ำกว่าเป้าหมาย &lt;80%)</option>
            </select>

            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">ความถี่ทั้งหมด</option>
              <option value="รายเดือน">รายเดือน</option>
              <option value="รายไตรมาส">รายไตรมาส</option>
              <option value="รายภาคเรียน">รายภาคเรียน</option>
              <option value="รายปี">รายปี</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreating(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              สร้างตัวชี้วัด KPI
            </Button>
          </div>
        </div>
      </div>

      {/* Create KPI Modal / Form */}
      {isCreating && (
        <div className="bg-pink-50/40 border border-pink-200/90 rounded-xl p-4 sm:p-5 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#B83B6F]" />
              สร้างตัวชี้วัด KPI ใหม่
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ยกเลิก
            </button>
          </div>

          <form onSubmit={handleCreateKPISubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">รหัส KPI</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="เช่น KPI-AC-07"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1">
                  ชื่อตัวชี้วัด (KPI Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น ร้อยละความพึงพอใจของอาจารย์ต่อการสนับสนุนการวิจัย"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">หน่วยวัด (Unit)</label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="เช่น %, คน, หลักสูตร, เรื่อง"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ค่าฐานเดิม (Baseline)</label>
                <input
                  type="number"
                  value={formBaseline}
                  onChange={(e) => setFormBaseline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ค่าเป้าหมาย (Target)</label>
                <input
                  type="number"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ผลงานจริงปัจจุบัน (Actual)</label>
                <input
                  type="number"
                  value={formActual}
                  onChange={(e) => setFormActual(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ผู้กำกับดูแล (Owner)</label>
                <input
                  type="text"
                  value={formOwner}
                  onChange={(e) => setFormOwner(e.target.value)}
                  placeholder="ชื่อ-นามสกุล / ตำแหน่ง"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">หน่วยงานรับผิดชอบ</label>
                <input
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ความถี่ในการรายงาน</label>
                <select
                  value={formFreq}
                  onChange={(e) => setFormFreq(e.target.value as KPIRecord['frequency'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                >
                  <option value="รายเดือน">รายเดือน</option>
                  <option value="รายไตรมาส">รายไตรมาส</option>
                  <option value="รายภาคเรียน">รายภาคเรียน</option>
                  <option value="รายปี">รายปี</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-200/60">
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
                บันทึกตัวชี้วัด
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Actual Modal / Box */}
      {editingKPI && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-1.5 py-0.5 rounded">
                {editingKPI.code}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                บันทึกผลการดำเนินงานจริง (Update Actual & Evidence): {editingKPI.name}
              </h4>
            </div>
            <button
              onClick={() => setEditingKPI(null)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ปิด
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Target (เป้าหมาย)
              </label>
              <div className="font-mono font-bold text-slate-700 p-2 bg-white rounded border border-slate-200">
                {editingKPI.target} {editingKPI.unit}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Actual ใหม่ (ผลงานจริง) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={newActualInput}
                onChange={(e) => setNewActualInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                คำนวณ Achievement % อัตโนมัติ:
              </label>
              <div className="font-mono font-extrabold text-blue-800 p-2 bg-white rounded border border-blue-200 text-sm">
                {editingKPI.target > 0
                  ? `${(((Number(newActualInput) || 0) / editingKPI.target) * 100).toFixed(1)}%`
                  : '0%'}
              </div>
            </div>
          </div>

          <div className="text-xs space-y-1">
            <label className="font-semibold text-slate-700 block">
              ชื่อไฟล์หลักฐานยืนยันผลการดำเนินงาน (Evidence)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newEvidenceFile}
                onChange={(e) => setNewEvidenceFile(e.target.value)}
                placeholder="เช่น รายงานสรุปผลรอบไตรมาส3.pdf"
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveActual}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                บันทึกผลงาน
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards / Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKPIs.map((kpi) => {
          return (
            <div
              key={kpi.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 text-xs"
            >
              <div>
                {/* Code & Frequency */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {kpi.code}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      รอบการรายงาน: {kpi.frequency}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      kpi.status === 'achieved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : kpi.status === 'on_track'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {kpi.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {kpi.name}
                </h4>

                <p className="text-[11px] text-slate-500 mt-1">
                  {kpi.description}
                </p>

                {/* Target vs Actual vs Achievement Matrix */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAFAFC] rounded-lg border border-slate-200 mt-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Baseline</span>
                    <span className="font-mono font-bold text-slate-700">
                      {kpi.baseline} {kpi.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target</span>
                    <span className="font-mono font-bold text-slate-900">
                      {kpi.target} {kpi.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Actual</span>
                    <span className="font-mono font-extrabold text-emerald-700">
                      {kpi.actual} {kpi.unit}
                    </span>
                  </div>
                </div>

                {/* Auto-Calculated Achievement Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-semibold">อัตราความสำเร็จ (Achievement %):</span>
                    <span className="font-mono font-black text-slate-900 text-xs">
                      {kpi.achievementPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        kpi.achievementPercentage >= 100
                          ? 'bg-emerald-500'
                          : kpi.achievementPercentage >= 80
                          ? 'bg-blue-600'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(kpi.achievementPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quarterly Breakdown if exists */}
                {kpi.quarterlyActuals && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Q1: {kpi.quarterlyActuals.q1 ?? '-'}</span>
                    <span>Q2: {kpi.quarterlyActuals.q2 ?? '-'}</span>
                    <span>Q3: {kpi.quarterlyActuals.q3 ?? '-'}</span>
                    <span>Q4: {kpi.quarterlyActuals.q4 ?? '-'}</span>
                  </div>
                )}
              </div>

              {/* Owner, Evidence & Update Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 block truncate">
                    {kpi.department}
                  </span>
                  <span className="font-semibold text-slate-800 text-[11px] truncate block">
                    {kpi.owner}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {kpi.evidence && (
                    <span
                      className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1"
                      title={kpi.evidence.name}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      มีหลักฐาน
                    </span>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditActual(kpi)}
                    leftIcon={<Edit2 className="w-3 h-3" />}
                  >
                    บันทึกผลงาน
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
