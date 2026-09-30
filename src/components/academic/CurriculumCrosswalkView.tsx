import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronRight,
  FileCheck2,
  Building2,
  Layers,
  Scale,
} from 'lucide-react';
import type { CurriculumCrosswalkRecord, CrosswalkMappingStatus } from '../../data/academicModuleData.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { useToast } from '../ui/Toast.tsx';

export interface CurriculumCrosswalkViewProps {
  crosswalkList: CurriculumCrosswalkRecord[];
  onUpdateCrosswalk: (updated: CurriculumCrosswalkRecord) => void;
  onAddCrosswalk: (newItem: CurriculumCrosswalkRecord) => void;
}

export const CurriculumCrosswalkView: React.FC<CurriculumCrosswalkViewProps> = ({
  crosswalkList,
  onUpdateCrosswalk,
  onAddCrosswalk,
}) => {
  const { showToast } = useToast();

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Selected item for detail inspection & evaluation
  const [selectedItem, setSelectedItem] = useState<CurriculumCrosswalkRecord | null>(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form for Evaluation editing
  const [evalStatus, setEvalStatus] = useState<CrosswalkMappingStatus>('matched');
  const [evalNotes, setEvalNotes] = useState('');
  const [evalEquivalenceType, setEvalEquivalenceType] = useState<CurriculumCrosswalkRecord['equivalenceType']>('direct_credit');

  // Form for New Crosswalk
  const [newMcuCode, setNewMcuCode] = useState('');
  const [newMcuTitle, setNewMcuTitle] = useState('');
  const [newMcuCredits, setNewMcuCredits] = useState('3(3-0-6)');
  const [newPartnerUni, setNewPartnerUni] = useState('University of Kelaniya');
  const [newPartnerCode, setNewPartnerCode] = useState('');
  const [newPartnerTitle, setNewPartnerTitle] = useState('');
  const [newPartnerCredits, setNewPartnerCredits] = useState('3 Credits (6 ECTS)');
  const [newScore, setNewScore] = useState(85);

  const partnersList = useMemo(() => {
    const map = new Map<string, string>();
    crosswalkList.forEach((c) => {
      map.set(c.partnerId, c.partnerUniversity);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [crosswalkList]);

  const filteredCrosswalk = useMemo(() => {
    return crosswalkList.filter((item) => {
      const matchPartner = selectedPartnerId === 'all' || item.partnerId === selectedPartnerId;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSearch =
        item.mcuCourse.courseCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.mcuCourse.titleTh.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.partnerCourse.courseCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.partnerCourse.titleEn.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.partnerUniversity.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchPartner && matchStatus && matchSearch;
    });
  }, [crosswalkList, selectedPartnerId, statusFilter, searchKeyword]);

  // Status Badge Helper
  const renderStatusBadge = (status: CrosswalkMappingStatus) => {
    switch (status) {
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            เทียบเท่าสมบูรณ์ (Matched 100%)
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            เทียบเท่าบางส่วน (Partial Match)
          </span>
        );
      case 'not_matched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            ไม่เทียบเท่า (Not Matched)
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            รอพิจารณา (Pending Review)
          </span>
        );
    }
  };

  const handleOpenEvaluation = (item: CurriculumCrosswalkRecord) => {
    setSelectedItem(item);
    setEvalStatus(item.status);
    setEvalNotes(item.supplementaryNote || '');
    setEvalEquivalenceType(item.equivalenceType);
    setIsEvaluationModalOpen(true);
  };

  const handleSaveEvaluation = () => {
    if (!selectedItem) return;

    const updated: CurriculumCrosswalkRecord = {
      ...selectedItem,
      status: evalStatus,
      supplementaryNote: evalNotes,
      equivalenceType: evalEquivalenceType,
      approvalStatus: evalStatus === 'not_matched' ? 'rejected' : 'approved',
      evaluatedDate: new Date().toISOString().substring(0, 10),
      evaluatedBy: 'สภาวิชาการ / คณะกรรมการเทียบโอนหลักสูตร',
    };

    onUpdateCrosswalk(updated);
    setIsEvaluationModalOpen(false);
    showToast('บันทึกผลการประเมินเทียบเคียงหลักสูตรเรียบร้อยแล้ว', 'success');
  };

  const handleSaveNewCrosswalk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMcuCode || !newMcuTitle || !newPartnerCode || !newPartnerTitle) {
      showToast('กรุณากรอกข้อมูลรายวิชาทั้งสองฝั่งให้ครบถ้วน', 'warning');
      return;
    }

    const newItem: CurriculumCrosswalkRecord = {
      id: `cw-${Date.now()}`,
      partnerId: 'pt-1',
      partnerUniversity: newPartnerUni,
      mcuCourse: {
        id: `mcu-c-${Date.now()}`,
        courseCode: newMcuCode,
        titleTh: newMcuTitle,
        titleEn: newMcuTitle,
        credits: newMcuCredits,
        creditNum: parseInt(newMcuCredits) || 3,
        faculty: 'คณะพุทธศาสตร์',
        department: 'ภาควิชาพระพุทธศาสนา',
        level: 'undergraduate',
        clos: ['เข้าใจหลักการและเนื้อหารายวิชาตามมาตรฐานหลักสูตร'],
        descriptionTh: 'คำอธิบายรายวิชาตามที่กำหนดใน มคอ.2',
      },
      partnerCourse: {
        id: `pt-c-${Date.now()}`,
        partnerId: 'pt-1',
        university: newPartnerUni,
        courseCode: newPartnerCode,
        titleEn: newPartnerTitle,
        credits: newPartnerCredits,
        creditNum: 3,
        syllabus: 'Course syllabus outline as verified with partner institution.',
        learningOutcomes: ['Demonstrate mastery of comparative concepts.'],
      },
      status: newScore >= 85 ? 'matched' : newScore >= 60 ? 'partial' : 'not_matched',
      similarityScore: newScore,
      equivalenceType: newScore >= 85 ? 'direct_credit' : 'supplementary_required',
      evaluatedBy: 'คณะกรรมการพิจารณาเทียบโอนหลักสูตร',
      evaluatedDate: new Date().toISOString().substring(0, 10),
      approvalStatus: 'approved',
    };

    onAddCrosswalk(newItem);
    setIsAddModalOpen(false);
    showToast('เพิ่มรายการเทียบเคียงหลักสูตรใหม่สำเร็จแล้ว', 'success');

    // Reset Form
    setNewMcuCode('');
    setNewMcuTitle('');
    setNewPartnerCode('');
    setNewPartnerTitle('');
  };

  const handleExportReport = () => {
    const csvContent =
      'MCU Course Code,MCU Course Title,MCU Credits,Partner University,Partner Code,Partner Title,Partner Credits,Similarity,Status,Note\n' +
      filteredCrosswalk
        .map(
          (c) =>
            `"${c.mcuCourse.courseCode}","${c.mcuCourse.titleTh}","${c.mcuCourse.credits}","${c.partnerUniversity}","${c.partnerCourse.courseCode}","${c.partnerCourse.titleEn}","${c.partnerCourse.credits}",${c.similarityScore}%,"${c.status}","${c.supplementaryNote || ''}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Curriculum_Crosswalk_MCU_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    showToast('ดาวน์โหลดรายงานตารางเทียบเคียงหลักสูตรเรียบร้อยแล้ว', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Overview & Comparison Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-[#B83B6F]">
                Curriculum Crosswalk Engine
              </span>
              <span className="text-xs text-slate-500">ระบบเทียบเคียงหลักสูตรสองสถาบัน (Split View)</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              ตารางเทียบเคียงและเทียบโอนรายวิชา (Curriculum Equivalence Matrix)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportReport} className="text-xs border-slate-300">
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              ส่งออกตารางเทียบเคียง
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              เพิ่มคู่เทียบเคียงรายวิชา
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารหัสวิชา, ชื่อวิชา มจร หรือสถาบันคู่สัญญา..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
            />
          </div>

          <div>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">ทุกสถาบันคู่สัญญา (All Partners)</option>
              {partnersList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">ทุกสถานะการเทียบเคียง (All Status)</option>
              <option value="matched">เทียบเท่าสมบูรณ์ (Matched 100%)</option>
              <option value="partial">เทียบเท่าบางส่วน (Partial Match)</option>
              <option value="not_matched">ไม่เทียบเท่า (Not Matched)</option>
              <option value="pending_review">รอพิจารณา (Pending Review)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SPLIT VIEW COMPARISON CARDS */}
      <div className="space-y-4">
        {filteredCrosswalk.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            ไม่พบคู่เทียบเคียงรายวิชาที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          filteredCrosswalk.map((crosswalk) => (
            <div
              key={crosswalk.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden hover:border-[#D94F87]/50 transition-all"
            >
              {/* Card Header with Status & Similarity Gauge */}
              <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">คู่สัญญา:</span>
                  <span className="font-bold text-slate-900">{crosswalk.partnerUniversity}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">ความสอดคล้อง:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 sm:w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            crosswalk.similarityScore >= 85
                              ? 'bg-emerald-500'
                              : crosswalk.similarityScore >= 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${crosswalk.similarityScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 font-mono text-[11px]">
                        {crosswalk.similarityScore}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(crosswalk.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEvaluation(crosswalk)}
                      className="text-xs text-[#B83B6F] hover:bg-pink-50"
                    >
                      ประเมิน / แก้ไข
                    </Button>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Split Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* LEFT SIDE: MCU Curriculum Course */}
                <div className="p-5 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-pink-50 text-[#B83B6F] font-bold text-xs">
                        มจร (MCU)
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {crosswalk.mcuCourse.courseCode}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {crosswalk.mcuCourse.credits}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{crosswalk.mcuCourse.titleTh}</h4>
                    <p className="text-xs text-slate-500 italic mt-0.5">{crosswalk.mcuCourse.titleEn}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {crosswalk.mcuCourse.faculty} • {crosswalk.mcuCourse.department}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">คำอธิบายรายวิชา (Course Description):</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                      {crosswalk.mcuCourse.descriptionTh}
                    </p>
                  </div>

                  <div className="text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">
                      ผลลัพธ์การเรียนรู้ระดับรายวิชา (CLO):
                    </span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {crosswalk.mcuCourse.clos.map((clo, idx) => (
                        <li key={idx} className="line-clamp-1">
                          {clo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* RIGHT SIDE: Partner University Course */}
                <div className="p-5 bg-slate-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-xs">
                        สถาบันคู่สัญญา (Partner)
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {crosswalk.partnerCourse.courseCode}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {crosswalk.partnerCourse.credits}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{crosswalk.partnerCourse.titleEn}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{crosswalk.partnerUniversity}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">สาระการเรียนรู้ (Syllabus Outline):</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                      {crosswalk.partnerCourse.syllabus}
                    </p>
                  </div>

                  <div className="text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">Expected Learning Outcomes:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {crosswalk.partnerCourse.learningOutcomes.map((lo, idx) => (
                        <li key={idx} className="line-clamp-1">
                          {lo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer: Committee Evaluation & Supplementary Note */}
              {(crosswalk.supplementaryNote || crosswalk.evaluatedBy) && (
                <div className="bg-amber-50/50 border-t border-amber-100 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-700">
                    <span className="font-semibold text-amber-900">เงื่อนไขเพิ่มเติม / มติกรรมการ: </span>
                    <span className="text-slate-600 text-[11px]">
                      {crosswalk.supplementaryNote || 'ผ่านเกณฑ์เทียบโอนตามมาตรฐาน อว. โดยสมบูรณ์'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 whitespace-nowrap">
                    ประเมินโดย: {crosswalk.evaluatedBy} ({crosswalk.evaluatedDate})
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: Evaluation & Status Review */}
      {selectedItem && (
        <Modal
          isOpen={isEvaluationModalOpen}
          onClose={() => setIsEvaluationModalOpen(false)}
          title={`ประเมินการเทียบเคียง: ${selectedItem.mcuCourse.courseCode} ↔ ${selectedItem.partnerCourse.courseCode}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">รายวิชา มจร</span>
                <span className="font-bold text-slate-900">
                  {selectedItem.mcuCourse.courseCode} {selectedItem.mcuCourse.titleTh}
                </span>
                <span className="text-[11px] text-slate-500 block">{selectedItem.mcuCourse.credits}</span>
              </div>
              <div>
                <span className="text-slate-500 block">รายวิชาสถาบันคู่สัญญา</span>
                <span className="font-bold text-slate-900">
                  {selectedItem.partnerCourse.courseCode} {selectedItem.partnerCourse.titleEn}
                </span>
                <span className="text-[11px] text-slate-500 block">{selectedItem.partnerCourse.credits}</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">ผลการพิจารณาเทียบเคียง (Mapping Status) *</label>
              <select
                value={evalStatus}
                onChange={(e) => setEvalStatus(e.target.value as CrosswalkMappingStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#D94F87]"
              >
                <option value="matched">เทียบเท่าสมบูรณ์ (Matched 100% - ให้ผลการเรียนตามเกณฑ์)</option>
                <option value="partial">เทียบเท่าบางส่วน (Partial Match - ต้องมอบหมายงานเสริม)</option>
                <option value="not_matched">ไม่สามารถเทียบเคียงได้ (Not Matched - CLO ไม่ครอบคลุม)</option>
                <option value="pending_review">รอคณะอนุกรรมการพิจารณาเพิ่มเติม (Pending Review)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">รูปแบบการนับหน่วยกิต (Equivalence Scheme)</label>
              <select
                value={evalEquivalenceType}
                onChange={(e) => setEvalEquivalenceType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#D94F87]"
              >
                <option value="direct_credit">เทียบโอนเป็นรายวิชาบังคับตรง (Direct Credit)</option>
                <option value="elective_credit">เทียบโอนเป็นหมวดวิชาเลือกเสรี (Elective Credit)</option>
                <option value="supplementary_required">เทียบโอนโดยมีเงื่อนไขการเรียนเสริม (Bridge Course Required)</option>
                <option value="rejected">ปฏิเสธการเทียบเคียง</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                บันทึกความเห็นคณะกรรมการ / เงื่อนไขเพิ่มเติม (Committee Remarks)
              </label>
              <textarea
                rows={3}
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                placeholder="ระบุข้อแนะนำ เช่น ต้องทำรายงานวิชาการเสริม 1 ฉบับ หรือผ่านการสอบวัดผลสัมฤทธิ์..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsEvaluationModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEvaluation}
                className="bg-[#B83B6F] hover:bg-[#A02F5E] text-white"
              >
                บันทึกมติการเทียบเคียง
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Add New Crosswalk Mapping */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มคู่เทียบเคียงรายวิชาใหม่ (New Crosswalk Mapping)"
        size="lg"
      >
        <form onSubmit={handleSaveNewCrosswalk} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Mcu Inputs */}
            <div className="p-3 bg-pink-50/40 rounded-xl border border-pink-200 space-y-2.5">
              <h4 className="font-bold text-[#B83B6F] text-xs">ข้อมูลรายวิชา มจร</h4>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">รหัสวิชา มจร *</label>
                <input
                  type="text"
                  value={newMcuCode}
                  onChange={(e) => setNewMcuCode(e.target.value)}
                  placeholder="เช่น 000 115"
                  required
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">ชื่อรายวิชา (ไทย) *</label>
                <input
                  type="text"
                  value={newMcuTitle}
                  onChange={(e) => setNewMcuTitle(e.target.value)}
                  placeholder="เช่น ภาษาบาลีเบื้องต้น 1"
                  required
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">หน่วยกิต มจร</label>
                <input
                  type="text"
                  value={newMcuCredits}
                  onChange={(e) => setNewMcuCredits(e.target.value)}
                  placeholder="3(3-0-6)"
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
            </div>

            {/* Right Partner Inputs */}
            <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-200 space-y-2.5">
              <h4 className="font-bold text-purple-800 text-xs">ข้อมูลรายวิชาสถาบันคู่สัญญา</h4>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">สถาบันคู่สัญญา *</label>
                <select
                  value={newPartnerUni}
                  onChange={(e) => setNewPartnerUni(e.target.value)}
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                >
                  <option value="University of Kelaniya">University of Kelaniya (ศรีลังกา)</option>
                  <option value="Nalanda University">Nalanda University (อินเดีย)</option>
                  <option value="วิทยาลัยศาสนศึกษา มหาวิทยาลัยมหิดล">วิทยาลัยศาสนศึกษา มหาวิทยาลัยมหิดล</option>
                  <option value="International Buddhist College (IBC)">International Buddhist College (มาเลเซีย)</option>
                  <option value="Dongguk University">Dongguk University (เกาหลีใต้)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">รหัสวิชาสถาบันคู่สัญญา *</label>
                <input
                  type="text"
                  value={newPartnerCode}
                  onChange={(e) => setNewPartnerCode(e.target.value)}
                  placeholder="เช่น PALI 11013"
                  required
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">ชื่อวิชาภาษาอังกฤษ *</label>
                <input
                  type="text"
                  value={newPartnerTitle}
                  onChange={(e) => setNewPartnerTitle(e.target.value)}
                  placeholder="e.g. Basic Pali Grammar"
                  required
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">หน่วยกิตคู่สัญญา</label>
                <input
                  type="text"
                  value={newPartnerCredits}
                  onChange={(e) => setNewPartnerCredits(e.target.value)}
                  placeholder="3 Credits (6 ECTS)"
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              คะแนนความสอดคล้องของผลลัพธ์การเรียนรู้ (Similarity Score: {newScore}%)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={newScore}
              onChange={(e) => setNewScore(parseInt(e.target.value))}
              className="w-full accent-[#B83B6F]"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>0% (ไม่เข้าข่าย)</span>
              <span>60% (เกณฑ์ขั้นต่ำ Partial)</span>
              <span>85%+ (เทียบเท่าสมบูรณ์)</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#B83B6F] hover:bg-[#A02F5E] text-white">
              บันทึกคู่เทียบเคียง
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
