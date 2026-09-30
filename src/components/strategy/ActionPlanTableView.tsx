import React, { useState, useMemo } from 'react';
import {
  ListTodo,
  Search,
  Filter,
  Plus,
  Calendar,
  Building2,
  User,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { ResponsiveTable } from '../ui/ResponsiveTable.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { ActionPlanRecord } from '../../data/strategyModuleData.ts';

export interface ActionPlanTableViewProps {
  actionPlans: ActionPlanRecord[];
  onUpdateActionPlan?: (updated: ActionPlanRecord) => void;
  onAddActionPlan?: (newAct: ActionPlanRecord) => void;
}

export const ActionPlanTableView: React.FC<ActionPlanTableViewProps> = ({
  actionPlans,
  onUpdateActionPlan,
  onAddActionPlan,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [strategyFilter, setStrategyFilter] = useState('all');

  // Form State for creating action plan
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStrategy, setFormStrategy] = useState('ยุทธศาสตร์ที่ 1: การจัดการศึกษาและพัฒนาหลักสูตรพระพุทธศาสนาสู่สากล');
  const [formDepartment, setFormDepartment] = useState('กองวิชาการ');
  const [formOwner, setFormOwner] = useState('');
  const [formStart, setFormStart] = useState('2026-09-01');
  const [formEnd, setFormEnd] = useState('2026-12-31');
  const [formBudget, setFormBudget] = useState('350000');
  const [formStatus, setFormStatus] = useState<ActionPlanRecord['status']>('not_started');

  const filteredPlans = useMemo(() => {
    return actionPlans.filter((p) => {
      const matchesSearch =
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || p.status === statusFilter;
      const matchesStrategy =
        strategyFilter === 'all' || p.strategyName.includes(strategyFilter);

      return matchesSearch && matchesStatus && matchesStrategy;
    });
  }, [actionPlans, searchQuery, statusFilter, strategyFilter]);

  const handleStatusChange = (
    plan: ActionPlanRecord,
    newStatus: ActionPlanRecord['status']
  ) => {
    const updated: ActionPlanRecord = {
      ...plan,
      status: newStatus,
      progress: newStatus === 'completed' ? 100 : plan.progress,
    };
    onUpdateActionPlan?.(updated);
    showToast({
      title: 'ปรับปรุงสถานะแผนงาน',
      message: `ปรับปรุงสถานะของ ${plan.code} เป็น "${newStatus}" เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาระบุชื่อโครงการ / Action Plan',
        type: 'error',
      });
      return;
    }

    const newRecord: ActionPlanRecord = {
      id: `act-${Date.now()}`,
      code: `ACT-69-0${actionPlans.length + 1}`,
      title: formTitle,
      description: formDesc || 'แผนงานตามนโยบายกองวิชาการ',
      strategyId: formStrategy.includes('1') ? 'str-01' : formStrategy.includes('2') ? 'str-02' : 'str-03',
      strategyName: formStrategy,
      projectId: 'prj-01',
      projectName: 'โครงการประจำปี 2569',
      department: formDepartment,
      responsiblePerson: formOwner || 'หัวหน้าฝ่ายแผนงาน',
      startDate: formStart,
      endDate: formEnd,
      budget: Number(formBudget) || 100000,
      spentBudget: 0,
      kpiIds: ['kpi-01'],
      status: formStatus,
      progress: formStatus === 'completed' ? 100 : 0,
    };

    onAddActionPlan?.(newRecord);
    setIsCreating(false);
    setFormTitle('');
    setFormDesc('');
    showToast({
      title: 'สร้าง Action Plan สำเร็จ',
      message: `เพิ่ม "${newRecord.title}" ลงในระบบเรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'รหัสแผนงาน',
      'ชื่อโครงการ',
      'ยุทธศาสตร์',
      'หน่วยงาน',
      'ผู้รับผิดชอบ',
      'วันเริ่มต้น',
      'วันสิ้นสุด',
      'งบประมาณ',
      'ความคืบหน้า%',
      'สถานะ',
    ];
    const rows = filteredPlans.map((p) => [
      p.code,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.strategyName}"`,
      `"${p.department}"`,
      `"${p.responsiblePerson}"`,
      p.startDate,
      p.endDate,
      p.budget,
      `${p.progress}%`,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mcu_academic_action_plans_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'ส่งออก CSV สำเร็จ',
      message: `ส่งออกข้อมูลแผนปฏิบัติการ ${filteredPlans.length} รายการ`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา Action Plan, ผู้รับผิดชอบ หรือหน่วยงาน..."
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
              <option value="all">สถานะทั้งหมด</option>
              <option value="not_started">Not Started (ยังไม่เริ่ม)</option>
              <option value="in_progress">In Progress (กำลังดำเนินการ)</option>
              <option value="completed">Completed (เสร็จสิ้น)</option>
              <option value="delayed">Delayed (ล่าช้า)</option>
              <option value="cancelled">Cancelled (ยกเลิก)</option>
            </select>

            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">ยุทธศาสตร์ทั้งหมด</option>
              <option value="ยุทธศาสตร์ที่ 1">ยุทธศาสตร์ที่ 1 (หลักสูตรสากล)</option>
              <option value="ยุทธศาสตร์ที่ 2">ยุทธศาสตร์ที่ 2 (เรียนรู้ตลอดชีวิต)</option>
              <option value="ยุทธศาสตร์ที่ 3">ยุทธศาสตร์ที่ 3 (องค์กรดิจิทัล)</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              CSV
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreating(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              สร้าง Action Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Create Action Plan Drawer/Form */}
      {isCreating && (
        <div className="bg-pink-50/40 border border-pink-200/90 rounded-xl p-4 sm:p-5 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#B83B6F]" />
              สร้างแผนปฏิบัติการ (Action Plan) ใหม่
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ยกเลิก
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  ชื่อโครงการ / Action Plan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น โครงการจัดทำแผนยกระดับมาตรฐานหลักสูตร"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ยุทธศาสตร์ที่ตอบสนอง
                </label>
                <select
                  value={formStrategy}
                  onChange={(e) => setFormStrategy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                >
                  <option value="ยุทธศาสตร์ที่ 1: การจัดการศึกษาและพัฒนาหลักสูตรพระพุทธศาสนาสู่สากล">
                    ยุทธศาสตร์ที่ 1 (หลักสูตรสากล)
                  </option>
                  <option value="ยุทธศาสตร์ที่ 2: นวัตกรรมการเรียนรู้ตลอดชีวิตและการบริการวิชาการ">
                    ยุทธศาสตร์ที่ 2 (เรียนรู้ตลอดชีวิต)
                  </option>
                  <option value="ยุทธศาสตร์ที่ 3: การพัฒนาระบบบริหารจัดการวิชาการสู่ความเป็นเลิศดิจิทัล">
                    ยุทธศาสตร์ที่ 3 (องค์กรดิจิทัล)
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">หน่วยงาน</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ผู้รับผิดชอบ</label>
                <input
                  type="text"
                  value={formOwner}
                  onChange={(e) => setFormOwner(e.target.value)}
                  placeholder="เช่น ดร.สมชาย"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">วันเริ่มต้น</label>
                <input
                  type="date"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">วันสิ้นสุด</label>
                <input
                  type="date"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">งบประมาณดำเนินการ (บาท)</label>
                <input
                  type="number"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">สถานะเริ่มต้น</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as ActionPlanRecord['status'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
                >
                  <option value="not_started">Not Started (ยังไม่เริ่ม)</option>
                  <option value="in_progress">In Progress (กำลังดำเนินการ)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">รายละเอียดและผลผลิต (Deliverables)</label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="ระบุกิจกรรมหลักและผลสัมฤทธิ์ที่คาดว่าจะได้รับ"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D94F87] bg-white"
              />
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
                บันทึกแผนงาน
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Action Plans Responsive Table */}
      <ResponsiveTable
        columns={[
          {
            key: 'title',
            title: 'รหัส / ชื่อโครงการ (Action Plan)',
            render: (plan) => (
              <div className="min-w-[240px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono font-bold text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                    {plan.code}
                  </span>
                </div>
                <p className="font-bold text-slate-900 leading-snug">{plan.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {plan.description}
                </p>
              </div>
            ),
          },
          {
            key: 'strategy',
            title: 'ยุทธศาสตร์ / หน่วยงาน',
            render: (plan) => (
              <div className="min-w-[160px]">
                <p className="font-semibold text-slate-800 text-[11px] line-clamp-1">
                  {plan.strategyName}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {plan.department}
                </span>
              </div>
            ),
          },
          {
            key: 'responsiblePerson',
            title: 'ผู้รับผิดชอบ',
            render: (plan) => (
              <span className="font-semibold text-slate-800 whitespace-nowrap">
                {plan.responsiblePerson}
              </span>
            ),
          },
          {
            key: 'timeline',
            title: 'ระยะเวลา (Start - End)',
            render: (plan) => (
              <div className="font-mono text-[11px] whitespace-nowrap text-slate-600">
                <div>{plan.startDate}</div>
                <div className="text-slate-400">ถึง {plan.endDate}</div>
              </div>
            ),
          },
          {
            key: 'budget',
            title: 'งบประมาณ',
            align: 'right',
            render: (plan) => (
              <div className="font-mono whitespace-nowrap">
                <span className="font-bold text-slate-900">
                  {plan.budget.toLocaleString()} ฿
                </span>
                <span className="text-[10px] text-slate-400 block">
                  เบิกจ่าย {(plan.spentBudget / 1000).toFixed(0)}k ฿
                </span>
              </div>
            ),
          },
          {
            key: 'progress',
            title: 'ความคืบหน้า',
            align: 'center',
            render: (plan) => (
              <div className="flex items-center justify-center gap-2 min-w-[100px]">
                <div className="w-14 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      plan.progress === 100
                        ? 'bg-emerald-500'
                        : plan.status === 'delayed'
                        ? 'bg-rose-500'
                        : 'bg-purple-600'
                    }`}
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-slate-700 text-[11px]">
                  {plan.progress}%
                </span>
              </div>
            ),
          },
          {
            key: 'status',
            title: 'สถานะ',
            align: 'center',
            render: (plan) => (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap ${
                  plan.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : plan.status === 'delayed'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : plan.status === 'in_progress'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : plan.status === 'cancelled'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {plan.status.replace('_', ' ')}
              </span>
            ),
          },
          {
            key: 'action',
            title: 'ปรับสถานะ',
            align: 'right',
            render: (plan) => (
              <select
                value={plan.status}
                onChange={(e) =>
                  handleStatusChange(plan, e.target.value as ActionPlanRecord['status'])
                }
                className="text-[11px] font-semibold border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            ),
          },
        ]}
        data={filteredPlans}
        keyExtractor={(plan) => plan.id}
        emptyText="ไม่พบแผนปฏิบัติการตามเงื่อนไขที่ค้นหา"
        renderCard={(plan) => ({
          key: plan.id,
          rawItem: plan,
          title: plan.title,
          subtitle: `${plan.code} • ${plan.department}`,
          badge: (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              ความคืบหน้า {plan.progress}%
            </span>
          ),
          statusBadge: (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                plan.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : plan.status === 'delayed'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : plan.status === 'in_progress'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : plan.status === 'cancelled'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {plan.status.replace('_', ' ')}
            </span>
          ),
          fields: [
            {
              label: 'ผู้รับผิดชอบ',
              value: plan.responsiblePerson,
              icon: <User className="w-3.5 h-3.5" />,
            },
            {
              label: 'งบประมาณ',
              value: `${plan.budget.toLocaleString()} ฿ (เบิกจ่าย ${(plan.spentBudget / 1000).toFixed(0)}k ฿)`,
              icon: <Coins className="w-3.5 h-3.5" />,
            },
            {
              label: 'ระยะเวลา',
              value: `${plan.startDate} ถึง ${plan.endDate}`,
              icon: <Calendar className="w-3.5 h-3.5" />,
            },
            {
              label: 'ยุทธศาสตร์',
              value: plan.strategyName,
              icon: <Building2 className="w-3.5 h-3.5" />,
            },
          ],
          actions: (
            <div className="flex items-center justify-between gap-2 w-full pt-1">
              <span className="text-xs text-slate-500 font-medium">ปรับสถานะ:</span>
              <select
                value={plan.status}
                onChange={(e) =>
                  handleStatusChange(plan, e.target.value as ActionPlanRecord['status'])
                }
                className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87] min-h-[38px]"
              >
                <option value="not_started">Not Started (ยังไม่เริ่ม)</option>
                <option value="in_progress">In Progress (กำลังดำเนิน)</option>
                <option value="completed">Completed (เสร็จสิ้น)</option>
                <option value="delayed">Delayed (ล่าช้า)</option>
                <option value="cancelled">Cancelled (ยกเลิก)</option>
              </select>
            </div>
          ),
        })}
      />
    </div>
  );
};
