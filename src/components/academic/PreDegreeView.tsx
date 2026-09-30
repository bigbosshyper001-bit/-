import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  School,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Download,
  Plus,
  Compass,
  FileCheck2,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type {
  PreDegreeCohortRecord,
  PreDegreeStudentRecord,
} from '../../data/academicModuleData.ts';
import { Button } from '../ui/Button.tsx';
import { ResponsiveTable } from '../ui/ResponsiveTable.tsx';
import { Modal } from '../ui/Modal.tsx';
import { useToast } from '../ui/Toast.tsx';

export interface PreDegreeViewProps {
  cohorts: PreDegreeCohortRecord[];
  students: PreDegreeStudentRecord[];
  onBridgeStudentToUniversity: (studentId: string) => void;
  onAddCohort?: (cohort: PreDegreeCohortRecord) => void;
}

export const PreDegreeView: React.FC<PreDegreeViewProps> = ({
  cohorts,
  students,
  onBridgeStudentToUniversity,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'pathways' | 'cohorts' | 'students'>('pathways');
  const [selectedCohortFilter, setSelectedCohortFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Student Transcript Modal
  const [selectedStudent, setSelectedStudent] = useState<PreDegreeStudentRecord | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchCohort = selectedCohortFilter === 'all' || s.cohortId === selectedCohortFilter;
      const matchSearch =
        s.studentId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        s.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        s.schoolName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        s.pathwayIntended.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchCohort && matchSearch;
    });
  }, [students, selectedCohortFilter, searchKeyword]);

  const pathways = [
    {
      faculty: 'คณะพุทธศาสตร์',
      degree: 'หลักสูตรพุทธศาสตรบัณฑิต (พธ.บ.)',
      description: 'เส้นทางการเรียนรู้ล่วงหน้าสำหรับนักเรียนผู้มุ่งมั่นศึกษาพระไตรปิฎก บาลี และพุทธปรัชญา',
      preCourses: ['000 115 ภาษาบาลีเบื้องต้น 1', '000 116 ภาษาบาลีเบื้องต้น 2', '000 139 พุทธปรัชญาเบื้องต้น'],
      totalCreditsAvailable: 15,
      estimatedFastTrackBenefit: 'ประหยัดเวลาเรียนในระดับปริญญาตรีได้ 1 ภาคการศึกษา (จบได้ใน 3.5 ปี)',
      accent: 'border-pink-200 bg-pink-50/40 text-[#B83B6F]',
    },
    {
      faculty: 'คณะมนุษยศาสตร์',
      degree: 'หลักสูตรศิลปศาสตรบัณฑิต (ศศ.บ. ภาษาบาลีและสันสกฤต / ภาษาอังกฤษ)',
      description: 'เน้นทักษะภาษาโบราณและภาษาสากลเพื่อการเผยแผ่และการสื่อสารข้ามวัฒนธรรม',
      preCourses: ['000 108 ภาษาไทยเพื่อการสื่อสาร', '000 115 ภาษาบาลีเบื้องต้น 1', '000 120 ภาษาอังกฤษพื้นฐาน 1'],
      totalCreditsAvailable: 12,
      estimatedFastTrackBenefit: 'เทียบโอนหมวดศึกษาทั่วไปได้ครบถ้วน ก้าวสู่รายวิชาเอกได้ตั้งแต่ปี 1',
      accent: 'border-purple-200 bg-purple-50/40 text-purple-700',
    },
    {
      faculty: 'คณะครุศาสตร์',
      degree: 'หลักสูตรครุศาสตรบัณฑิต (ค.บ. การสอนพระพุทธศาสนาและสังคมศึกษา)',
      description: 'เตรียมความพร้อมสู่การเป็นครูสอนศีลธรรมและวิชาการศาสนาในสถานศึกษา',
      preCourses: ['000 101 มนุษย์กับสังคมและจริยธรรม', '000 108 ภาษาไทยเพื่อการสื่อสาร', 'จิตวิทยาการเรียนรู้เบื้องต้น'],
      totalCreditsAvailable: 12,
      estimatedFastTrackBenefit: 'สะสมหน่วยกิตล่วงหน้าและฝึกทักษะการสอนในโรงเรียนเครือข่าย',
      accent: 'border-blue-200 bg-blue-50/40 text-blue-700',
    },
    {
      faculty: 'คณะสังคมศาสตร์',
      degree: 'หลักสูตรศิลปศาสตรบัณฑิต / รัฐประศาสนศาสตรบัณฑิต',
      description: 'การบริหารงานชุมชน สันติวิธี และการพัฒนาสังคมเชิงบูรณาการ',
      preCourses: ['000 101 มนุษย์กับสังคมและจริยธรรม', 'การเมืองการปกครองร่วมสมัย', 'การคิดเชิงวิพากษ์'],
      totalCreditsAvailable: 9,
      estimatedFastTrackBenefit: 'เชื่อมต่อเครือข่ายเยาวชนและเตรียมศึกษาต่อระดับปริญญาตรีทันที',
      accent: 'border-teal-200 bg-teal-50/40 text-teal-700',
    },
  ];

  const handleBridgeAction = (student: PreDegreeStudentRecord) => {
    onBridgeStudentToUniversity(student.studentId);
    showToast(`เชื่อมโยงผลการเรียน Pre-degree ของ ${student.fullName} เข้าสู่ระบบทะเบียนปริญญาตรี มจร เรียบร้อยแล้ว`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-50 text-[#B83B6F] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">นักเรียนสะสมหน่วยกิตล่วงหน้า</p>
            <p className="text-xl font-bold text-slate-900">305 คน</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">โรงเรียนเครือข่ายความร่วมมือ</p>
            <p className="text-xl font-bold text-slate-900">18 แห่ง</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">หน่วยกิตสะสมเฉลี่ย/คน</p>
            <p className="text-xl font-bold text-slate-900">14.2 หน่วยกิต</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">เข้าศึกษาต่อ มจร แล้ว</p>
            <p className="text-xl font-bold text-slate-900">95 คน (รุ่นที่ 3)</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex overflow-x-auto scrollbar-none p-1 bg-slate-100 rounded-lg border border-slate-200/80 gap-1 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pathways')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'pathways'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>เส้นทางการเรียนรู้ (Learning Pathways)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cohorts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'cohorts'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>เครือข่ายโรงเรียนและรุ่น (Cohorts)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700">
              {cohorts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'students'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>รายชื่อนักเรียนและหน่วยกิตสะสม</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-pink-100 text-[#B83B6F]">
              {students.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          ระบบเชื่อมต่ออัตโนมัติกับ: <span className="font-semibold text-slate-800">University Credit Bank</span>
        </div>
      </div>

      {/* VIEW 1: LEARNING PATHWAYS */}
      {activeTab === 'pathways' && (
        <div className="space-y-4">
          <div className="border border-pink-200 bg-pink-50/40 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-pink-100 text-[#B83B6F] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                โครงการสะสมหน่วยกิตล่วงหน้าสำหรับนักเรียนมัธยมศึกษาตอนปลายและโรงเรียนพระปริยัติธรรม (MCU Pre-degree)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                เปิดโอกาสให้นักเรียนระดับ ม.4 - ม.6 ลงทะเบียนเรียนรายวิชาศึกษาทั่วไปและวิชาเฉพาะพื้นฐานของ มจร
                ผ่านรูปแบบออนไลน์และห้องเรียนสาธิต สะสมหน่วยกิตลงใน University Credit Bank
                และสามารถเทียบโอนเข้าสู่ระดับปริญญาตรีได้ทันทีเมื่อสำเร็จการศึกษาระดับมัธยม
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathways.map((pw, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-[#D94F87]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                      {pw.faculty}
                    </span>
                    <span className="text-xs font-bold text-[#B83B6F] bg-pink-50 px-2 py-0.5 rounded">
                      สะสมได้สูงสุด {pw.totalCreditsAvailable} หน่วยกิต
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{pw.degree}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pw.description}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">รายวิชาเรียนล่วงหน้าตัวอย่าง:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {pw.preCourses.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-medium text-[11px]">{pw.estimatedFastTrackBenefit}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: COHORTS & SCHOOLS */}
      {activeTab === 'cohorts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {cohorts.map((cohort) => (
              <div
                key={cohort.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded">
                        {cohort.cohortCode}
                      </span>
                      <span className="text-xs text-slate-500">ปีการศึกษา {cohort.academicYear}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{cohort.name}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      {cohort.partnerSchool} • <span className="text-slate-400">{cohort.schoolType}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">จำนวนนักเรียน</p>
                      <p className="text-base font-bold text-slate-900">{cohort.studentsCount} คน</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">หน่วยกิตสะสมเฉลี่ย</p>
                      <p className="text-base font-bold text-[#B83B6F]">{cohort.avgCreditsAccumulated} หน่วยกิต</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600">
                    คณะเป้าหมายหลัก: <strong className="text-slate-900">{cohort.targetFaculty}</strong>
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      cohort.status === 'active'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : cohort.status === 'graduating'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {cohort.status === 'active'
                      ? 'กำลังศึกษา (Active Cohort)'
                      : cohort.status === 'graduating'
                      ? 'กำลังจะจบ ม.6 (เตรียมเทียบโอน)'
                      : 'เทียบโอนเข้า มจร ครบถ้วนแล้ว'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: STUDENTS ROSTER */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหารหัสนักเรียน, ชื่อ-ฉายา, โรงเรียน หรือคณะเป้าหมาย..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedCohortFilter}
                onChange={(e) => setSelectedCohortFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="all">ทุกรุ่นการศึกษา (All Cohorts)</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cohortCode} - {c.partnerSchool}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden p-3 sm:p-4">
            <ResponsiveTable
              data={filteredStudents}
              keyExtractor={(std) => std.id}
              emptyMessage="ไม่พบข้อมูลนักเรียน Pre-degree ตามเงื่อนไขที่ระบุ"
              columns={[
                {
                  key: 'name',
                  title: 'รหัสนักเรียน / ชื่อ-ฉายา',
                  render: (std) => (
                    <div>
                      <div className="font-semibold text-slate-900">{std.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{std.studentId}</div>
                    </div>
                  ),
                },
                {
                  key: 'school',
                  title: 'โรงเรียนต้นสังกัด',
                  render: (std) => <div className="text-slate-800 text-xs">{std.schoolName}</div>,
                },
                {
                  key: 'level',
                  title: 'ระดับชั้น',
                  render: (std) => (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {std.level}
                    </span>
                  ),
                },
                {
                  key: 'credits',
                  title: 'หน่วยกิตสะสม',
                  align: 'center',
                  render: (std) => (
                    <span className="font-bold text-[#B83B6F] font-mono text-xs">
                      {std.totalCredits} หน่วยกิต
                    </span>
                  ),
                },
                {
                  key: 'gpa',
                  title: 'เกรดเฉลี่ย (GPA)',
                  align: 'center',
                  render: (std) => (
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {std.gpa.toFixed(2)}
                    </span>
                  ),
                },
                {
                  key: 'pathway',
                  title: 'คณะเป้าหมายใน มจร',
                  render: (std) => (
                    <div className="text-slate-700 line-clamp-1 max-w-[200px] text-xs">{std.pathwayIntended}</div>
                  ),
                },
                {
                  key: 'status',
                  title: 'สถานะเทียบโอน',
                  align: 'center',
                  render: (std) => (
                    <div className="whitespace-nowrap">
                      {std.readyToTransfer ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          พร้อมเทียบโอน มจร
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          อยู่ระหว่างสะสม
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  title: 'การจัดการ',
                  align: 'right',
                  render: (std) => (
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(std);
                          setIsStudentModalOpen(true);
                        }}
                        className="text-xs text-[#B83B6F] hover:bg-pink-50 px-2 py-1"
                      >
                        ดูใบแสดงผล
                      </Button>

                      {std.readyToTransfer && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleBridgeAction(std)}
                          className="text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white px-2 py-1"
                        >
                          เทียบโอนเข้า มจร
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
              renderCard={(std) => ({
                id: std.id,
                title: std.fullName,
                subtitle: `${std.studentId} • ${std.schoolName} (${std.level})`,
                statusBadge: std.readyToTransfer ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    พร้อมเทียบโอน
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                    อยู่ระหว่างสะสม
                  </span>
                ),
                fields: [
                  {
                    label: 'หน่วยกิตสะสม',
                    value: (
                      <span className="font-bold text-[#B83B6F] font-mono">
                        {std.totalCredits} หน่วยกิต
                      </span>
                    ),
                  },
                  {
                    label: 'เกรดเฉลี่ยสะสม (GPA)',
                    value: <span className="font-bold font-mono">{std.gpa.toFixed(2)}</span>,
                  },
                  {
                    label: 'คณะเป้าหมายใน มจร',
                    value: std.pathwayIntended,
                    fullWidth: true,
                  },
                ],
                primaryAction: (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs text-[#B83B6F] border-pink-200 hover:bg-pink-50"
                      onClick={() => {
                        setSelectedStudent(std);
                        setIsStudentModalOpen(true);
                      }}
                    >
                      ดูใบแสดงผลการเรียน
                    </Button>
                    {std.readyToTransfer && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white"
                        onClick={() => handleBridgeAction(std)}
                      >
                        เทียบโอนเข้า มจร ทันที
                      </Button>
                    )}
                  </div>
                ),
              })}
            />
          </div>
        </div>
      )}

      {/* MODAL: Student Pre-degree Transcript */}
      {selectedStudent && (
        <Modal
          isOpen={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          title={`ใบแสดงผลการเรียนรู้ล่วงหน้า (Pre-degree Record): ${selectedStudent.fullName}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 font-medium">ชื่อ-ฉายาผู้เรียน</p>
                <p className="text-base font-bold text-slate-900">{selectedStudent.fullName}</p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                  รหัส: {selectedStudent.studentId} • บัตร ปชช: {selectedStudent.nationalIdMasked}
                </p>
              </div>

              <div className="text-right">
                <p className="text-slate-500 font-medium">โรงเรียน / ระดับชั้น</p>
                <p className="font-semibold text-slate-900">{selectedStudent.schoolName}</p>
                <p className="text-slate-600 font-mono text-xs mt-0.5">
                  ระดับชั้น: {selectedStudent.level} • GPA รวม: {selectedStudent.gpa.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700">
                รายวิชาที่สำเร็จการศึกษาและสะสมหน่วยกิตล่วงหน้า
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">รหัสวิชา</th>
                    <th className="py-2.5 px-3">ชื่อรายวิชา</th>
                    <th className="py-2.5 px-2 text-center">หน่วยกิต</th>
                    <th className="py-2.5 px-2 text-center">เกรด</th>
                    <th className="py-2.5 px-3 text-center">ภาคเรียน</th>
                    <th className="py-2.5 px-3 text-center">สถานะ Credit Bank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedStudent.courses.map((c, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{c.courseCode}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{c.courseName}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{c.credits}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-700 font-mono">{c.grade}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{c.semester}</td>
                      <td className="py-2.5 px-3 text-center">
                        {c.creditBankTransferred ? (
                          <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                            เข้ากระเป๋าแล้ว
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            รอภาคการศึกษา
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-pink-50/50 rounded-lg border border-pink-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">หน่วยกิตสะสมรวมพร้อมเทียบโอน:</span>
                <span className="font-bold text-base text-[#B83B6F]">{selectedStudent.totalCredits} หน่วยกิต</span>
              </div>

              {selectedStudent.readyToTransfer && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleBridgeAction(selectedStudent);
                    setIsStudentModalOpen(false);
                  }}
                  className="bg-[#B83B6F] hover:bg-[#A02F5E] text-white text-xs"
                >
                  ดำเนินการเทียบโอนเข้าปริญญาตรี มจร
                </Button>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => setIsStudentModalOpen(false)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
