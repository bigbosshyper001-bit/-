import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  Coins,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  BarChart3,
  Lightbulb,
  FileCheck,
  Building2,
  Sliders,
  PlayCircle,
  Eye,
} from 'lucide-react';
import type { ShortCourseRecord, DemandSurveyRecord } from '../../data/academicModuleData.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { useToast } from '../ui/Toast.tsx';

export interface ShortCourseNonDegreeViewProps {
  courses: ShortCourseRecord[];
  surveys: DemandSurveyRecord[];
  onAddCourse: (newCourse: ShortCourseRecord) => void;
  onUpdateCourse: (updated: ShortCourseRecord) => void;
}

export const ShortCourseNonDegreeView: React.FC<ShortCourseNonDegreeViewProps> = ({
  courses,
  surveys,
  onAddCourse,
  onUpdateCourse,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'builder' | 'analytics' | 'workflow'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Course Details Modal
  const [selectedCourse, setSelectedCourse] = useState<ShortCourseRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Course Builder Form State
  const [builderForm, setBuilderForm] = useState({
    titleTh: '',
    titleEn: '',
    category: 'พุทธนวัตกรรม' as ShortCourseRecord['category'],
    deliveryMode: 'hybrid' as ShortCourseRecord['deliveryMode'],
    hours: 30,
    creditBankEquiv: 2,
    fee: 2500,
    capacity: 60,
    targetAudience: '',
    competencyOutcome: '',
    facultyOwner: 'คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    instructors: '',
    startDate: '2026-06-01',
    endDate: '2026-07-15',
  });

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchMode = selectedMode === 'all' || c.deliveryMode === selectedMode;
      const matchSearch =
        c.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.titleTh.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.titleEn.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.facultyOwner.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchCat && matchMode && matchSearch;
    });
  }, [courses, selectedCategory, selectedMode, searchKeyword]);

  // Categories list
  const categories: ShortCourseRecord['category'][] = [
    'พุทธนวัตกรรม',
    'สันติวิธีและไกล่เกลี่ย',
    'สมาธิและสุขภาพ',
    'ทักษะดิจิทัล',
    'ภาษาบาลี-สันสกฤต',
    'การศึกษาทั่วไป',
  ];

  // Helper for Workflow Status
  const getWorkflowBadge = (status: ShortCourseRecord['workflowStatus']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
            1. ร่างหลักสูตร (Draft)
          </span>
        );
      case 'department_endorsed':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
            2. คณะเห็นชอบแล้ว
          </span>
        );
      case 'academic_affairs_screened':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-200">
            3. กองวิชาการกลั่นกรอง
          </span>
        );
      case 'senate_approved':
        return (
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[11px] font-medium border border-purple-200">
            4. สภาวิชาการอนุมัติแล้ว
          </span>
        );
      case 'active_enrollment':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
            5. เปิดรับสมัคร (Active)
          </span>
        );
    }
  };

  const handleAdvanceWorkflow = (course: ShortCourseRecord) => {
    let nextStatus: ShortCourseRecord['workflowStatus'] = course.workflowStatus;
    if (course.workflowStatus === 'draft') nextStatus = 'department_endorsed';
    else if (course.workflowStatus === 'department_endorsed') nextStatus = 'academic_affairs_screened';
    else if (course.workflowStatus === 'academic_affairs_screened') nextStatus = 'senate_approved';
    else if (course.workflowStatus === 'senate_approved') nextStatus = 'active_enrollment';

    if (nextStatus !== course.workflowStatus) {
      onUpdateCourse({ ...course, workflowStatus: nextStatus });
      showToast(`เลื่อนสถานะหลักสูตร ${course.code} ไปยังขั้นถัดไปเรียบร้อยแล้ว`, 'success');
    }
  };

  const handleSaveCourseBuilder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderForm.titleTh || !builderForm.competencyOutcome) {
      showToast('กรุณากรอกชื่อหลักสูตรและสมรรถนะที่ผู้เรียนจะได้รับ', 'warning');
      return;
    }

    const newCourse: ShortCourseRecord = {
      id: `sc-${Date.now()}`,
      code: `SC-MCU-2569-0${courses.length + 1}`,
      titleTh: builderForm.titleTh,
      titleEn: builderForm.titleEn || builderForm.titleTh,
      category: builderForm.category,
      deliveryMode: builderForm.deliveryMode,
      hours: Number(builderForm.hours) || 30,
      creditBankEquiv: Number(builderForm.creditBankEquiv) || 2,
      fee: Number(builderForm.fee) || 0,
      capacity: Number(builderForm.capacity) || 50,
      enrolled: 0,
      targetAudience: builderForm.targetAudience || 'ผู้สนใจทั่วไปและผู้เรียนตลอดชีวิต',
      competencyOutcome: builderForm.competencyOutcome,
      facultyOwner: builderForm.facultyOwner,
      workflowStatus: 'department_endorsed',
      instructors: builderForm.instructors ? builderForm.instructors.split(',').map((s) => s.trim()) : ['คณาจารย์ประจำหลักสูตร'],
      startDate: builderForm.startDate,
      endDate: builderForm.endDate,
    };

    onAddCourse(newCourse);
    setActiveTab('catalog');
    showToast(`สร้างร่างหลักสูตร ${newCourse.code} เรียบร้อยแล้ว`, 'success');

    // Reset Form
    setBuilderForm({
      titleTh: '',
      titleEn: '',
      category: 'พุทธนวัตกรรม',
      deliveryMode: 'hybrid',
      hours: 30,
      creditBankEquiv: 2,
      fee: 2500,
      capacity: 60,
      targetAudience: '',
      competencyOutcome: '',
      facultyOwner: 'คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
      instructors: '',
      startDate: '2026-06-01',
      endDate: '2026-07-15',
    });
  };

  const handleConvertSurveyToCourse = (survey: DemandSurveyRecord) => {
    setBuilderForm({
      ...builderForm,
      titleTh: survey.topic,
      titleEn: `Special Topic on ${survey.topic}`,
      category: (categories.includes(survey.category as any) ? survey.category : 'พุทธนวัตกรรม') as any,
      deliveryMode: survey.preferredMode,
      fee: survey.averageWillingnessToPay,
      targetAudience: survey.targetGroup,
      competencyOutcome: `ผู้เรียนมีความรู้ความเข้าใจและสามารถปฏิบัติการในหัวข้อ ${survey.topic} ได้อย่างมีประสิทธิภาพ`,
    });
    setActiveTab('builder');
    showToast(`ดึงหัวข้อจากผลสำรวจเข้าสู่ Course Builder เรียบร้อยแล้ว`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex overflow-x-auto scrollbar-none p-1 bg-slate-100 rounded-lg border border-slate-200/80 gap-1 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คลังหลักสูตร (Catalog)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-pink-100 text-[#B83B6F]">
              {courses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'builder'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>สร้างหลักสูตร (Course Builder)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>วิเคราะห์ความต้องการ (Demand Survey)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-700">
              {surveys.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'workflow'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>ขั้นตอนการอนุมัติ (Workflow Tracker)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">มาตรฐานเทียบโอน:</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            University Credit Bank Compatible
          </span>
        </div>
      </div>

      {/* VIEW 1: COURSE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหลักสูตรอบรม, รหัสวิชา, หรือหน่วยงานเจ้าของ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="all">ทุกหมวดหมู่หลักสูตร</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="all">ทุกรูปแบบการเรียน (Mode)</option>
                <option value="online">Online (ออนไลน์ 100%)</option>
                <option value="onsite">Onsite (ที่ห้องเรียน/ศูนย์ฝึก)</option>
                <option value="hybrid">Hybrid (ผสมผสาน)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const enrollPercent = Math.round((course.enrolled / course.capacity) * 100);
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm hover:border-[#D94F87]/40 transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#B83B6F] bg-pink-50 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        สะสมได้ {course.creditBankEquiv} หน่วยกิต
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                        {course.titleTh}
                      </h3>
                      <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">{course.titleEn}</p>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      <span className="font-medium text-slate-700 block mb-0.5">สมรรถนะเป้าหมาย:</span>
                      <p className="text-[11px] leading-relaxed line-clamp-2 text-slate-600">
                        {course.competencyOutcome}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div>
                        <span className="text-slate-400 block">ระยะเวลาอบรม</span>
                        <span className="font-semibold text-slate-800">{course.hours} ชั่วโมง</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">รูปแบบการเรียน</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {course.deliveryMode === 'online'
                            ? 'Online 100%'
                            : course.deliveryMode === 'hybrid'
                            ? 'Hybrid ผสมผสาน'
                            : 'Onsite ณ สถาบัน'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">ค่าธรรมเนียม</span>
                        <span className="font-semibold text-slate-800">
                          {course.fee === 0 ? 'ฟรี (ทุนอุดหนุน)' : `${course.fee.toLocaleString()} บาท`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">กลุ่มเป้าหมาย</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {course.targetAudience}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">ยอดผู้สมัครเรียน:</span>
                      <span className="font-semibold text-slate-900">
                        {course.enrolled} / {course.capacity} คน ({enrollPercent}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          enrollPercent >= 90 ? 'bg-emerald-500' : 'bg-[#D94F87]'
                        }`}
                        style={{ width: `${Math.min(enrollPercent, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>{getWorkflowBadge(course.workflowStatus)}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-xs text-[#B83B6F] hover:bg-pink-50 px-2.5 py-1"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        รายละเอียด
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: COURSE BUILDER */}
      {activeTab === 'builder' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-pink-50 text-[#B83B6F] flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">เครื่องมือสร้างและเสนอหลักสูตรระยะสั้น (Course Builder)</h2>
              <p className="text-xs text-slate-500">
                กำหนดโครงสร้างหลักสูตร สมรรถนะผู้เรียน และการเชื่อมโยงกับระบบคลังหน่วยกิต (Credit Bank Mapping)
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCourseBuilder} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">ชื่อหลักสูตรภาษาไทย (Course Title TH) *</label>
                <Input
                  value={builderForm.titleTh}
                  onChange={(e) => setBuilderForm({ ...builderForm, titleTh: e.target.value })}
                  placeholder="เช่น การประยุกต์ใช้จิตวิทยาพุทธในการให้คำปรึกษา"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ชื่อหลักสูตรภาษาอังกฤษ (Course Title EN)</label>
                <Input
                  value={builderForm.titleEn}
                  onChange={(e) => setBuilderForm({ ...builderForm, titleEn: e.target.value })}
                  placeholder="e.g. Applied Buddhist Psychology in Clinical Counseling"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">หมวดหมู่หลักสูตร *</label>
                <select
                  value={builderForm.category}
                  onChange={(e) => setBuilderForm({ ...builderForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#D94F87]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">รูปแบบการจัดการเรียนรู้ *</label>
                <select
                  value={builderForm.deliveryMode}
                  onChange={(e) => setBuilderForm({ ...builderForm, deliveryMode: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#D94F87]"
                >
                  <option value="online">Online (การเรียนรู้ออนไลน์ 100%)</option>
                  <option value="hybrid">Hybrid (ผสมผสาน Online + Workshop)</option>
                  <option value="onsite">Onsite (ปฏิบัติการ ณ มหาวิทยาลัย)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">เทียบสะสมคลังหน่วยกิต (Credit Bank) *</label>
                <select
                  value={builderForm.creditBankEquiv}
                  onChange={(e) => setBuilderForm({ ...builderForm, creditBankEquiv: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#D94F87]"
                >
                  <option value={1}>1 หน่วยกิต (เทียบเท่า 15-20 ชม.)</option>
                  <option value={2}>2 หน่วยกิต (เทียบเท่า 30-40 ชม.)</option>
                  <option value={3}>3 หน่วยกิต (เทียบเท่า 45-60 ชม.)</option>
                  <option value={4}>4 หน่วยกิต (รายวิชาโครงงาน/ปฏิบัติ)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">จำนวนชั่วโมงเรียนรวม (Hours)</label>
                <Input
                  type="number"
                  value={builderForm.hours}
                  onChange={(e) => setBuilderForm({ ...builderForm, hours: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ค่าธรรมเนียมการเรียน (บาท)</label>
                <Input
                  type="number"
                  value={builderForm.fee}
                  onChange={(e) => setBuilderForm({ ...builderForm, fee: parseInt(e.target.value) || 0 })}
                  placeholder="0 หากเป็นหลักสูตรบริการวิชาการฟรี"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">จำนวนรับสมัครสูงสุด (คน)</label>
                <Input
                  type="number"
                  value={builderForm.capacity}
                  onChange={(e) => setBuilderForm({ ...builderForm, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                สมรรถนะเป้าหมายและผลลัพธ์การเรียนรู้ (Competency Framework & Outcomes) *
              </label>
              <textarea
                rows={3}
                value={builderForm.competencyOutcome}
                onChange={(e) => setBuilderForm({ ...builderForm, competencyOutcome: e.target.value })}
                placeholder="ระบุสิ่งที่ผู้เรียนสามารถทำได้จริงหลังผ่านการประเมิน เช่น สามารถใช้เครื่องมือไกล่เกลี่ยข้อพิพาทเบื้องต้นตาม พ.ร.บ. ไกล่เกลี่ยฯ..."
                required
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">กลุ่มเป้าหมายผู้เรียน (Target Audience)</label>
                <Input
                  value={builderForm.targetAudience}
                  onChange={(e) => setBuilderForm({ ...builderForm, targetAudience: e.target.value })}
                  placeholder="เช่น พระสังฆาธิการ, ครูอาจารย์, นักจิตวิทยา, ประชาชนทั่วไป"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">อาจารย์ผู้รับผิดชอบ / ผู้สอน (คั่นด้วยจุลภาค)</label>
                <Input
                  value={builderForm.instructors}
                  onChange={(e) => setBuilderForm({ ...builderForm, instructors: e.target.value })}
                  placeholder="รศ.ดร.พระมหาสุทธิพงษ์, ดร.สมเกียรติ"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab('catalog')}>
                ยกเลิก
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-[#B83B6F] hover:bg-[#A02F5E] text-white">
                บันทึกและส่งเข้าสู่กระบวนการอนุมัติ
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: DEMAND SURVEY & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">หัวข้อยอดนิยมอันดับ 1</span>
              <p className="text-base font-bold text-slate-900 mt-1">
                สมาธิบำบัด & ป้องกันภาวะ Burnout
              </p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
                ผู้แสดงความสนใจ 840 คน (คะแนนเทรนด์ 96%)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">อัตราค่าธรรมเนียมที่ยินดีจ่ายเฉลี่ย</span>
              <p className="text-xl font-bold text-slate-900 mt-1">1,850 บาท / คอร์ส</p>
              <span className="text-xs text-slate-500 mt-1 inline-block">
                (ไม่รวมหลักสูตรพระภิกษุสงฆ์ที่รับทุนอุดหนุน)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">กลุ่มผู้เรียนที่มีความต้องการสูงสุด</span>
              <p className="text-base font-bold text-slate-900 mt-1">บุคลากรภาครัฐ / องค์กรเอกชน (42%)</p>
              <span className="text-xs text-purple-700 font-semibold mt-1 inline-block">
                ต้องการสะสม Credit Bank เพื่อต่อยอด ป.โท
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  ผลสำรวจความต้องการหลักสูตรระยะสั้น (Market Demand Survey Insights)
                </h3>
                <p className="text-xs text-slate-500">
                  ข้อมูลจากการสำรวจกลุ่มเป้าหมายเพื่อนำมาพัฒนาหลักสูตรตอบโจทย์ Lifelong Learning
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-[#D94F87]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-100 text-[#B83B6F]">
                        {survey.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                        {survey.targetGroup}
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">โหมด: {survey.preferredMode}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{survey.topic}</h4>

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>
                        ผู้สนใจ: <strong className="text-slate-900">{survey.interestedCount} คน</strong>
                      </span>
                      <span>
                        ยินดีจ่ายเฉลี่ย:{' '}
                        <strong className="text-slate-900">
                          {survey.averageWillingnessToPay === 0
                            ? 'ฟรี'
                            : `${survey.averageWillingnessToPay.toLocaleString()} บาท`}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">Demand Trend Score</div>
                      <div className="text-lg font-bold text-[#B83B6F] font-mono">{survey.trendScore}%</div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConvertSurveyToCourse(survey)}
                      className="text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      เปิด Course Builder จากหัวข้อนี้
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: APPROVAL WORKFLOW TRACKER */}
      {activeTab === 'workflow' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              สถานะการขับเคลื่อนและการอนุมัติหลักสูตร (Approval Workflow Tracker)
            </h3>
            <p className="text-xs text-slate-500">
              ระบบตรวจสอบลำดับขั้นการอนุมัติตามระเบียบมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ว่าด้วยการจัดการศึกษาตลอดชีวิต
            </p>
          </div>

          <div className="space-y-4">
            {courses.map((c) => {
              const stages = [
                { id: 'draft', label: '1. ร่างหลักสูตร' },
                { id: 'department_endorsed', label: '2. คณะเห็นชอบ' },
                { id: 'academic_affairs_screened', label: '3. กองวิชาการกลั่นกรอง' },
                { id: 'senate_approved', label: '4. สภาวิชาการอนุมัติ' },
                { id: 'active_enrollment', label: '5. เปิดรับสมัครและลงทะเบียน' },
              ];

              const stageIndexMap: Record<ShortCourseRecord['workflowStatus'], number> = {
                draft: 0,
                department_endorsed: 1,
                academic_affairs_screened: 2,
                senate_approved: 3,
                active_enrollment: 4,
              };

              const currentStageIdx = stageIndexMap[c.workflowStatus];

              return (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#B83B6F] text-xs">{c.code}</span>
                        <span className="text-slate-500 font-medium">| {c.category}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{c.titleTh}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentStageIdx < 4 ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAdvanceWorkflow(c)}
                          className="text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white"
                        >
                          อนุมัติเลื่อนสู่ขั้นถัดไป
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          กระบวนการเสร็จสมบูรณ์
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {stages.map((st, idx) => {
                      const isDone = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      return (
                        <div key={st.id} className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isDone ? 'bg-[#D94F87]' : 'bg-slate-200'
                            } ${isCurrent ? 'ring-2 ring-[#D94F87]/30' : ''}`}
                          />
                          <p
                            className={`text-[11px] truncate ${
                              isDone ? 'font-semibold text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {st.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedCourse && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`รายละเอียดหลักสูตร: ${selectedCourse.code}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-mono text-xs font-bold text-[#B83B6F]">{selectedCourse.code}</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedCourse.titleTh}</h3>
              <p className="text-xs text-slate-500 italic mt-0.5">{selectedCourse.titleEn}</p>
              <p className="text-slate-600 text-xs mt-1.5">หน่วยงานเจ้าของ: {selectedCourse.facultyOwner}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block">ระยะเวลาอบรม</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedCourse.hours} ชั่วโมง</span>
                <span className="text-[11px] text-slate-400">โหมด: {selectedCourse.deliveryMode}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block">เทียบโอนคลังหน่วยกิต</span>
                <span className="font-bold text-teal-700 text-sm mt-0.5 block">
                  {selectedCourse.creditBankEquiv} หน่วยกิต
                </span>
                <span className="text-[11px] text-slate-400">Credit Bank Compatible</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block">ค่าธรรมเนียม</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {selectedCourse.fee === 0 ? 'ฟรี (ทุนอุดหนุน)' : `${selectedCourse.fee.toLocaleString()} บาท`}
                </span>
                <span className="text-[11px] text-slate-400">รับสมัคร {selectedCourse.capacity} คน</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <h4 className="font-semibold text-slate-800">สมรรถนะที่ผู้เรียนจะได้รับ (Competency Outcomes):</h4>
              <p className="text-slate-700 leading-relaxed">{selectedCourse.competencyOutcome}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
