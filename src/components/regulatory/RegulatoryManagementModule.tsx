import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  User,
  Building2,
  ArrowRight,
  Download,
  Eye,
  CheckSquare,
  HelpCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  INITIAL_REGULATORY_RECORDS,
  type RegulatoryRecord,
  type RegulatoryType,
  type RegulatoryStatus,
} from '../../data/regulatoryModuleData.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { useToast } from '../ui/Toast.tsx';
import { StatusBadge } from '../ui/StatusBadge.tsx';

export const RegulatoryManagementModule: React.FC = () => {
  const { showToast } = useToast();

  const [records, setRecords] = useState<RegulatoryRecord[]>(INITIAL_REGULATORY_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Active question filter tab (5 Core Questions)
  const [activeQuestionView, setActiveQuestionView] = useState<
    'all' | 'who' | 'what' | 'responsible' | 'deadline' | 'status'
  >('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<RegulatoryRecord | null>(null);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.regulationTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requiredAction.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'all' || r.type === selectedType;
      const matchUnit = selectedUnit === 'all' || r.relatedUnits.some((u) => u.includes(selectedUnit));
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;

      return matchSearch && matchType && matchUnit && matchStatus;
    });
  }, [records, searchQuery, selectedType, selectedUnit, selectedStatus]);

  // Unique units for filter dropdown
  const allUnits = useMemo(() => {
    const units = new Set<string>();
    records.forEach((r) => r.relatedUnits.forEach((u) => units.add(u)));
    return Array.from(units);
  }, [records]);

  // Metric summaries
  const totalCount = records.length;
  const compliantCount = records.filter((r) => r.status === 'compliant').length;
  const inProgressCount = records.filter((r) => r.status === 'in_progress').length;
  const warningCount = records.filter((r) => r.status === 'warning').length;

  // New Record Form State
  const [newRecordData, setNewRecordData] = useState({
    code: '',
    regulationTitle: '',
    type: 'ประกาศ' as RegulatoryType,
    issuingAuthority: 'สภามหาวิทยาลัย มจร',
    effectiveDate: new Date().toISOString().substring(0, 10),
    relatedUnitsStr: 'กองวิชาการ, ทุกคณะ',
    responsiblePerson: '',
    responsibleRole: 'หัวหน้างานมาตรฐานวิชาการ',
    requiredAction: '',
    deadline: '2026-06-30',
    status: 'in_progress' as RegulatoryStatus,
    documentFile: 'REGULATION_OFFICIAL.pdf',
  });

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordData.regulationTitle || !newRecordData.responsiblePerson) {
      showToast('กรุณากรอกชื่อระเบียบ/ข้อบังคับ และผู้รับผิดชอบ', 'error');
      return;
    }
    const newRec: RegulatoryRecord = {
      id: `REG-${Date.now().toString().slice(-4)}`,
      code: newRecordData.code || `REG-${Date.now().toString().slice(-3)}`,
      regulationTitle: newRecordData.regulationTitle,
      type: newRecordData.type,
      issuingAuthority: newRecordData.issuingAuthority,
      effectiveDate: newRecordData.effectiveDate,
      relatedUnits: newRecordData.relatedUnitsStr.split(',').map((u) => u.trim()),
      responsiblePerson: newRecordData.responsiblePerson,
      responsibleRole: newRecordData.responsibleRole,
      requiredAction: newRecordData.requiredAction || 'จัดทำรายงานและปฏิบัติตามมาตรฐาน',
      actionChecklist: [
        { id: 'c1', title: 'แต่งตั้งคณะทำงานขับเคลื่อน', done: true },
        { id: 'c2', title: 'ดำเนินการตามมาตรการและข้อบังคับ', done: false },
      ],
      deadline: newRecordData.deadline,
      daysRemaining: 60,
      status: newRecordData.status,
      impactLevel: 'medium',
      documentFile: newRecordData.documentFile,
      complianceNotes: 'บันทึกระเบียบใหม่เข้าสู่ Regulatory Matrix',
      lastUpdated: new Date().toISOString().substring(0, 10),
    };

    setRecords((prev) => [newRec, ...prev]);
    setIsAddModalOpen(false);
    showToast('เพิ่มระเบียบ/ข้อบังคับใหม่เรียบร้อยแล้ว', 'success');
  };

  // Toggle Action checklist item
  const handleToggleChecklist = (recId: string, checkId: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recId) {
          const updatedCheck = r.actionChecklist.map((c) =>
            c.id === checkId ? { ...c, done: !c.done } : c
          );
          const allDone = updatedCheck.every((c) => c.done);
          return {
            ...r,
            actionChecklist: updatedCheck,
            status: allDone ? 'compliant' : 'in_progress',
          };
        }
        return r;
      })
    );
    if (selectedRecordForDetail && selectedRecordForDetail.id === recId) {
      setSelectedRecordForDetail((prev) => {
        if (!prev) return null;
        const updatedCheck = prev.actionChecklist.map((c) =>
          c.id === checkId ? { ...c, done: !c.done } : c
        );
        return {
          ...prev,
          actionChecklist: updatedCheck,
          status: updatedCheck.every((c) => c.done) ? 'compliant' : 'in_progress',
        };
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & 5 Core Questions Focus */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#B83B6F] to-[#942854] flex items-center justify-center text-white shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  ระบบบริหารกฎหมายและระเบียบข้อบังคับวิชาการ (Regulatory Management)
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBE7EF] text-[#B83B6F] border border-[#F5C2D6]">
                  Regulatory Matrix
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                กำกับติดตามการปฏิบัติตามกฎหมาย กฎกระทรวง ประกาศ อว. หลักเกณฑ์ ก.พ.อ. คำสั่งมหาวิทยาลัย และบันทึกข้อตกลงความร่วมมือ (MOU)
              </p>
            </div>
          </div>

          <Button
            id="btn-add-regulatory-record"
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            เพิ่มระเบียบ/ข้อบังคับใหม่
          </Button>
        </div>

        {/* 5 Core Questions Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#B83B6F]" />
              ศูนย์รวมคำตอบ 5 มิติ (5 Core Questions Matrix)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <button
              id="qbtn-who"
              onClick={() => setActiveQuestionView(activeQuestionView === 'who' ? 'all' : 'who')}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeQuestionView === 'who'
                  ? 'bg-[#FBE7EF] border-[#B83B6F] text-[#B83B6F] font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <p className="text-[11px] text-slate-500 font-medium">คำถามที่ 1</p>
              <p className="text-xs font-bold mt-0.5">เกี่ยวข้องกับใคร?</p>
              <span className="text-[10px] text-slate-500 block mt-1">Related Units</span>
            </button>

            <button
              id="qbtn-what"
              onClick={() => setActiveQuestionView(activeQuestionView === 'what' ? 'all' : 'what')}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeQuestionView === 'what'
                  ? 'bg-[#FBE7EF] border-[#B83B6F] text-[#B83B6F] font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <p className="text-[11px] text-slate-500 font-medium">คำถามที่ 2</p>
              <p className="text-xs font-bold mt-0.5">ต้องทำอะไร?</p>
              <span className="text-[10px] text-slate-500 block mt-1">Required Action</span>
            </button>

            <button
              id="qbtn-responsible"
              onClick={() => setActiveQuestionView(activeQuestionView === 'responsible' ? 'all' : 'responsible')}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeQuestionView === 'responsible'
                  ? 'bg-[#FBE7EF] border-[#B83B6F] text-[#B83B6F] font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <p className="text-[11px] text-slate-500 font-medium">คำถามที่ 3</p>
              <p className="text-xs font-bold mt-0.5">ใครรับผิดชอบ?</p>
              <span className="text-[10px] text-slate-500 block mt-1">Responsible Person</span>
            </button>

            <button
              id="qbtn-deadline"
              onClick={() => setActiveQuestionView(activeQuestionView === 'deadline' ? 'all' : 'deadline')}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeQuestionView === 'deadline'
                  ? 'bg-[#FBE7EF] border-[#B83B6F] text-[#B83B6F] font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <p className="text-[11px] text-slate-500 font-medium">คำถามที่ 4</p>
              <p className="text-xs font-bold mt-0.5">Deadline กำหนดเวลา?</p>
              <span className="text-[10px] text-slate-500 block mt-1">Target Dates</span>
            </button>

            <button
              id="qbtn-status"
              onClick={() => setActiveQuestionView(activeQuestionView === 'status' ? 'all' : 'status')}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeQuestionView === 'status'
                  ? 'bg-[#FBE7EF] border-[#B83B6F] text-[#B83B6F] font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <p className="text-[11px] text-slate-500 font-medium">คำถามที่ 5</p>
              <p className="text-xs font-bold mt-0.5">สถานะการปฏิบัติ?</p>
              <span className="text-[10px] text-slate-500 block mt-1">Compliance Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">กฎหมาย/ระเบียบทั้งหมด</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">ปฏิบัติครบถ้วนแล้ว (Compliant)</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{compliantCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">อยู่ระหว่างดำเนินการ</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">ใกล้ครบกำหนด / เฝ้าระวัง</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{warningCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="regulatory-search-input"
              type="text"
              placeholder="ค้นหาชื่อระเบียบ, เลขที่, ผู้รับผิดชอบ, หน่วยงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Type */}
            <select
              id="regulatory-filter-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700"
            >
              <option value="all">ทุกประเภทกฎหมาย</option>
              <option value="กฎหมาย">กฎหมาย</option>
              <option value="กฎกระทรวง">กฎกระทรวง</option>
              <option value="ประกาศ">ประกาศ</option>
              <option value="หลักเกณฑ์">หลักเกณฑ์</option>
              <option value="คำสั่ง">คำสั่ง</option>
              <option value="MOU">MOU</option>
            </select>

            {/* Filter by Unit */}
            <select
              id="regulatory-filter-unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700"
            >
              <option value="all">ทุกหน่วยงานที่เกี่ยวข้อง</option>
              {allUnits.map((u, i) => (
                <option key={i} value={u}>
                  {u}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              id="regulatory-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="compliant">ปฏิบัติครบถ้วนแล้ว</option>
              <option value="in_progress">อยู่ระหว่างดำเนินการ</option>
              <option value="warning">ใกล้ครบกำหนด/เฝ้าระวัง</option>
            </select>
          </div>
        </div>
      </div>

      {/* REGULATORY MATRIX DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            ตารางกำกับกฎหมายและระเบียบข้อบังคับ (Regulatory Matrix)
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            แสดง {filteredRecords.length} จาก {totalCount} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3 w-28">ประเภท</th>
                <th className="py-3 px-3">ชื่อกฎหมาย / ระเบียบข้อบังคับ (Regulation)</th>
                <th className="py-3 px-3 w-40">ผู้ออกกฎหมาย (Authority)</th>
                <th className="py-3 px-3 w-44">เกี่ยวข้องกับใคร? (Related Unit)</th>
                <th className="py-3 px-3 w-40">ใครรับผิดชอบ? (Responsible)</th>
                <th className="py-3 px-3 w-28">Deadline</th>
                <th className="py-3 px-3 w-28 text-center">สถานะ</th>
                <th className="py-3 px-3 w-24 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const typeBadgeColors: Record<string, string> = {
                  กฎหมาย: 'bg-purple-50 text-purple-700 border-purple-200',
                  กฎกระทรวง: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  ประกาศ: 'bg-blue-50 text-blue-700 border-blue-200',
                  หลักเกณฑ์: 'bg-teal-50 text-teal-700 border-teal-200',
                  คำสั่ง: 'bg-amber-50 text-amber-700 border-amber-200',
                  MOU: 'bg-rose-50 text-rose-700 border-rose-200',
                };

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Type */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          typeBadgeColors[r.type] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.type}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{r.code}</p>
                    </td>

                    {/* Regulation Title & Required Action */}
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 leading-snug">{r.regulationTitle}</p>
                      <div className="mt-1 bg-slate-50 p-2 rounded-md border border-slate-100 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-800">ต้องทำอะไร: </span>
                        {r.requiredAction}
                      </div>
                    </td>

                    {/* Authority & Effective Date */}
                    <td className="py-3 px-3 text-slate-600">
                      <p className="font-medium text-slate-800">{r.issuingAuthority}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">มีผล: {r.effectiveDate}</p>
                    </td>

                    {/* Related Unit */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {r.relatedUnits.map((u, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Responsible Person */}
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{r.responsiblePerson}</p>
                      <p className="text-[11px] text-slate-500">{r.responsibleRole}</p>
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-3 font-mono">
                      <span className="text-slate-800 font-medium">{r.deadline}</span>
                      {r.daysRemaining !== undefined && (
                        <p
                          className={`text-[10px] font-semibold mt-0.5 ${
                            r.daysRemaining <= 15
                              ? 'text-red-600'
                              : r.daysRemaining <= 60
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {r.daysRemaining > 0 ? `อีก ${r.daysRemaining} วัน` : 'ครบกำหนดแล้ว'}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      {r.status === 'compliant' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ครบถ้วน
                        </span>
                      ) : r.status === 'warning' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> เฝ้าระวัง
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> กำลังปฏิบัติ
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedRecordForDetail(r)}
                        className="px-2.5 py-1 text-xs font-medium text-[#B83B6F] hover:bg-[#FBE7EF] rounded-md transition-colors"
                      >
                        ตรวจสอบ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & ACTION CHECKLIST MODAL */}
      {selectedRecordForDetail && (
        <Modal
          isOpen={Boolean(selectedRecordForDetail)}
          onClose={() => setSelectedRecordForDetail(null)}
          title={`รายละเอียดการปฏิบัติตามกฎหมาย: ${selectedRecordForDetail.code}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#B83B6F] text-white">
                {selectedRecordForDetail.type}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {selectedRecordForDetail.regulationTitle}
              </h3>
              <p className="text-slate-600">
                <span className="font-semibold text-slate-700">หน่วยงานผู้ออก: </span>
                {selectedRecordForDetail.issuingAuthority} (วันที่มีผลบังคับใช้: {selectedRecordForDetail.effectiveDate})
              </p>
            </div>

            {/* 5 Questions Answer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="font-bold text-[#B83B6F] flex items-center gap-1.5 mb-1">
                  <Building2 className="w-4 h-4" /> 1. เกี่ยวข้องกับใคร? (Related Units)
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedRecordForDetail.relatedUnits.map((u, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="font-bold text-[#B83B6F] flex items-center gap-1.5 mb-1">
                  <User className="w-4 h-4" /> 3. ใครรับผิดชอบ? (Responsible Person)
                </p>
                <p className="font-semibold text-slate-900">{selectedRecordForDetail.responsiblePerson}</p>
                <p className="text-slate-500">{selectedRecordForDetail.responsibleRole}</p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 sm:col-span-2">
                <p className="font-bold text-[#B83B6F] flex items-center gap-1.5 mb-1">
                  <CheckSquare className="w-4 h-4" /> 2. ต้องทำอะไร? (Required Action Checklist)
                </p>
                <p className="text-slate-700 mb-2">{selectedRecordForDetail.requiredAction}</p>

                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-600">รายการงานที่ต้องปฏิบัติ (Checklist):</p>
                  {selectedRecordForDetail.actionChecklist.map((act) => (
                    <label
                      key={act.id}
                      className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={act.done}
                        onChange={() => handleToggleChecklist(selectedRecordForDetail.id, act.id)}
                        className="rounded border-slate-300 text-[#B83B6F] focus:ring-[#B83B6F]"
                      />
                      <span className={act.done ? 'line-through text-slate-400' : 'font-medium'}>
                        {act.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="font-bold text-[#B83B6F] flex items-center gap-1.5 mb-1">
                  <Calendar className="w-4 h-4" /> 4. Deadline กำหนดเวลา?
                </p>
                <p className="font-mono font-bold text-slate-900">{selectedRecordForDetail.deadline}</p>
                <p className="text-slate-500 text-[11px]">
                  {selectedRecordForDetail.daysRemaining} วันคงเหลือ
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="font-bold text-[#B83B6F] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4" /> 5. สถานะการปฏิบัติตาม
                </p>
                <p className="font-semibold text-slate-900">
                  {selectedRecordForDetail.status === 'compliant'
                    ? 'ปฏิบัติครบถ้วนแล้ว (Compliant)'
                    : selectedRecordForDetail.status === 'warning'
                    ? 'เฝ้าระวัง / ใกล้ครบกำหนด'
                    : 'อยู่ระหว่างดำเนินการ (In Progress)'}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {selectedRecordForDetail.complianceNotes}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> ไฟล์อ้างอิง: {selectedRecordForDetail.documentFile}
              </span>
              <Button variant="outline" size="sm" onClick={() => setSelectedRecordForDetail(null)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD REGULATORY MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มรายการกฎหมาย/ระเบียบข้อบังคับใหม่"
        size="md"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="รหัสอ้างอิง / เลขที่กฎหมาย *"
              value={newRecordData.code}
              onChange={(e) => setNewRecordData({ ...newRecordData, code: e.target.value })}
              placeholder="เช่น พ.ร.บ. อว. 2562 หรือ คำสั่ง 12/2569"
              required
            />
            <Select
              label="ประเภท *"
              value={newRecordData.type}
              onChange={(e) => setNewRecordData({ ...newRecordData, type: e.target.value as any })}
              options={[
                { value: 'กฎหมาย', label: 'กฎหมาย (Act)' },
                { value: 'กฎกระทรวง', label: 'กฎกระทรวง (Ministerial Regulation)' },
                { value: 'ประกาศ', label: 'ประกาศ (Notification)' },
                { value: 'หลักเกณฑ์', label: 'หลักเกณฑ์ (Criteria)' },
                { value: 'คำสั่ง', label: 'คำสั่ง (Order)' },
                { value: 'MOU', label: 'บันทึกข้อตกลง (MOU/MOA)' },
              ]}
            />
          </div>

          <Input
            label="ชื่อกฎหมาย / ระเบียบข้อบังคับ *"
            value={newRecordData.regulationTitle}
            onChange={(e) => setNewRecordData({ ...newRecordData, regulationTitle: e.target.value })}
            placeholder="เช่น ข้อบังคับมหาวิทยาลัยว่าด้วยคลังหน่วยกิตและการเทียบโอน..."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="หน่วยงานผู้ออกกฎหมาย *"
              value={newRecordData.issuingAuthority}
              onChange={(e) => setNewRecordData({ ...newRecordData, issuingAuthority: e.target.value })}
              placeholder="กระทรวง อว. หรือ สภามหาวิทยาลัย มจร"
              required
            />
            <Input
              label="วันที่มีผลบังคับใช้"
              type="date"
              value={newRecordData.effectiveDate}
              onChange={(e) => setNewRecordData({ ...newRecordData, effectiveDate: e.target.value })}
            />
          </div>

          <Input
            label="เกี่ยวข้องกับใคร? (คั่นด้วยจุลภาค) *"
            value={newRecordData.relatedUnitsStr}
            onChange={(e) => setNewRecordData({ ...newRecordData, relatedUnitsStr: e.target.value })}
            placeholder="กองวิชาการ, คณะพุทธศาสตร์, สำนักทะเบียน"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="ใครรับผิดชอบ? (ชื่อผู้รับผิดชอบ) *"
              value={newRecordData.responsiblePerson}
              onChange={(e) => setNewRecordData({ ...newRecordData, responsiblePerson: e.target.value })}
              placeholder="รศ.ดร. พระมหาสุทธิพงษ์"
              required
            />
            <Input
              label="ตำแหน่ง/บทบาทผู้รับผิดชอบ"
              value={newRecordData.responsibleRole}
              onChange={(e) => setNewRecordData({ ...newRecordData, responsibleRole: e.target.value })}
              placeholder="รองอธิการบดีฝ่ายวิชาการ"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ต้องทำอะไร? (Required Action) *
            </label>
            <textarea
              value={newRecordData.requiredAction}
              onChange={(e) => setNewRecordData({ ...newRecordData, requiredAction: e.target.value })}
              rows={2}
              placeholder="ระบุสิ่งที่มหาวิทยาลัยหรือคณะต้องปฏิบัติตามกฎหมายฉบับนี้..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Deadline (กำหนดเวลา)"
              type="date"
              value={newRecordData.deadline}
              onChange={(e) => setNewRecordData({ ...newRecordData, deadline: e.target.value })}
            />
            <Select
              label="สถานะเริ่มต้น"
              value={newRecordData.status}
              onChange={(e) => setNewRecordData({ ...newRecordData, status: e.target.value as any })}
              options={[
                { value: 'in_progress', label: 'อยู่ระหว่างดำเนินการ' },
                { value: 'compliant', label: 'ปฏิบัติครบถ้วนแล้ว' },
                { value: 'warning', label: 'เฝ้าระวัง/ใกล้ครบกำหนด' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit">
              บันทึกระเบียบใน Matrix
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
