import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  BookOpen,
  Target,
  FileText,
  UserCheck,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Upload,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  FileCheck,
  FileSpreadsheet,
  Image as ImageIcon,
  Check,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Bookmark,
  GraduationCap,
} from 'lucide-react';
import {
  INITIAL_FACULTY_LIST,
  INITIAL_COMPETENCIES,
  INITIAL_PSF_DIMENSIONS,
  INITIAL_IDP_STEPS,
  INITIAL_IDP_GOALS,
  INITIAL_PORTFOLIO_ITEMS,
  INITIAL_MENTOR_REVIEWS,
  type FacultyProfile,
  type CompetencyScore,
  type ThailandPsfDimension,
  type IdpWorkflowStep,
  type IdpGoalItem,
  type PortfolioItem,
  type MentorReviewRecord,
} from '../../data/facultyModuleData.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { useToast } from '../ui/Toast.tsx';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { centralDb } from '../../services/centralDatabase.ts';

const DEFAULT_FACULTY: FacultyProfile = {
  id: 'FAC-MCU-003',
  name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
  monkTitle: 'พระมหาเปรียญ / ผู้ช่วยศาสตราจารย์ ดร.',
  academicPosition: 'ผศ.ดร.',
  faculty: 'กองวิชาการ',
  department: 'สำนักงานอธิการบดี',
  email: 'vorachet.sum@mcu.ac.th',
  phone: '035-248-000 ต่อ 8100',
  expertise: ['การบริหารการศึกษาเชิงพุทธ', 'การประกันคุณภาพการศึกษา', 'หลักสูตรและการสอน'],
  psfLevel: 3,
  psfCertifiedDate: '2025-01-10',
  mentorName: 'พระธรรมวัชรบัณฑิต, ศ.ดร.',
  idpStatus: 'in_progress',
  totalPublications: 18,
  activeResearchCount: 2,
};

export const FacultyManagementModule: React.FC = () => {
  const { showToast } = useToast();

  // Active Sub-Menu Tab
  const [activeTab, setActiveTab] = useState<
    'profiles' | 'competency' | 'thailand_psf' | 'idp' | 'portfolio' | 'mentor'
  >('profiles');

  // Master State
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>(() => {
    try {
      const fromDb = centralDb.getFacultyMembers();
      if (Array.isArray(fromDb) && fromDb.length > 0) return fromDb;
    } catch {
      // fallback
    }
    return INITIAL_FACULTY_LIST.length > 0 ? INITIAL_FACULTY_LIST : [DEFAULT_FACULTY];
  });
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('FAC-MCU-003');
  const [competencies, setCompetencies] = useState<CompetencyScore[]>(INITIAL_COMPETENCIES);
  const [psfDimensions, setPsfDimensions] = useState<ThailandPsfDimension[]>(INITIAL_PSF_DIMENSIONS);
  const [idpSteps, setIdpSteps] = useState<IdpWorkflowStep[]>(INITIAL_IDP_STEPS);
  const [idpGoals, setIdpGoals] = useState<IdpGoalItem[]>(INITIAL_IDP_GOALS);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO_ITEMS);
  const [mentorReviews, setMentorReviews] = useState<MentorReviewRecord[]>(INITIAL_MENTOR_REVIEWS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('all');

  // Modals
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isUploadPortfolioModalOpen, setIsUploadPortfolioModalOpen] = useState(false);
  const [isMentorReviewModalOpen, setIsMentorReviewModalOpen] = useState(false);

  // Current active faculty with full null-safety
  const currentFaculty: FacultyProfile = useMemo(() => {
    return (
      facultyList.find((f) => f.id === selectedFacultyId) ||
      facultyList[0] ||
      DEFAULT_FACULTY
    );
  }, [facultyList, selectedFacultyId]);

  // Filtered Faculty
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.monkTitle && f.monkTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.expertise.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchFaculty = facultyFilter === 'all' || f.faculty === facultyFilter;
      return matchSearch && matchFaculty;
    });
  }, [facultyList, searchQuery, facultyFilter]);

  // Filtered Portfolio
  const filteredPortfolio = useMemo(() => {
    return portfolioItems.filter((item) => {
      if (portfolioCategoryFilter === 'all') return true;
      return item.category === portfolioCategoryFilter;
    });
  }, [portfolioItems, portfolioCategoryFilter]);

  // Handlers for Modals
  const [newFacultyData, setNewFacultyData] = useState({
    name: '',
    monkTitle: '',
    academicPosition: 'อาจารย์',
    faculty: 'คณะพุทธศาสตร์',
    department: 'สาขาวิชาพระพุทธศาสนา',
    email: '',
    phone: '',
    expertiseStr: '',
    psfLevel: '1',
  });

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyData.name || !newFacultyData.email) {
      showToast('กรุณากรอกชื่อและอีเมลอาจารย์', 'error');
      return;
    }
    const newFac: FacultyProfile = {
      id: `FAC-MCU-${Date.now().toString().slice(-4)}`,
      name: newFacultyData.name,
      monkTitle: newFacultyData.monkTitle || undefined,
      academicPosition: newFacultyData.academicPosition,
      faculty: newFacultyData.faculty,
      department: newFacultyData.department,
      email: newFacultyData.email,
      phone: newFacultyData.phone || '02-623-5555',
      expertise: newFacultyData.expertiseStr
        ? newFacultyData.expertiseStr.split(',').map((s) => s.trim())
        : ['วิชาการพระพุทธศาสนา'],
      psfLevel: parseInt(newFacultyData.psfLevel, 10) as any,
      idpStatus: 'draft',
      totalPublications: 0,
      activeResearchCount: 0,
    };
    setFacultyList((prev) => [newFac, ...prev]);
    setSelectedFacultyId(newFac.id);
    setIsAddFacultyModalOpen(false);
    showToast('เพิ่มข้อมูลอาจารย์เรียบร้อยแล้ว', 'success');
  };

  // Add Goal Handler
  const [newGoalData, setNewGoalData] = useState({
    competencyDomain: 'research',
    goalTitle: '',
    actionPlan: '',
    targetDate: '2026-08-31',
    budgetRequested: 20000,
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalData.goalTitle) {
      showToast('กรุณากรอกเป้าหมายการพัฒนา', 'error');
      return;
    }
    const newG: IdpGoalItem = {
      id: `GOAL-${Date.now().toString().slice(-4)}`,
      competencyDomain: newGoalData.competencyDomain as any,
      goalTitle: newGoalData.goalTitle,
      actionPlan: newGoalData.actionPlan || 'ดำเนินการตามแผนยุทธศาสตร์คณะ',
      targetDate: newGoalData.targetDate,
      budgetRequested: Number(newGoalData.budgetRequested) || 0,
      status: 'planning',
    };
    setIdpGoals((prev) => [newG, ...prev]);
    setIsAddGoalModalOpen(false);
    showToast('เพิ่มเป้าหมายแผน IDP เรียบร้อยแล้ว', 'success');
  };

  // Upload Portfolio Item Handler
  const [newPortfolioData, setNewPortfolioData] = useState({
    title: '',
    category: 'academic_work',
    categoryLabelTh: 'ผลงานวิชาการ',
    year: '2569',
    description: '',
    fileType: 'pdf',
    fileName: 'DOCUMENT_EVIDENCE.pdf',
    relatedPsf: 'มิติที่ 1',
  });

  const handleUploadPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioData.title) {
      showToast('กรุณากรอกชื่อผลงาน/หลักฐาน', 'error');
      return;
    }
    const catMap: Record<string, string> = {
      academic_work: 'ผลงานวิชาการ',
      research: 'งานวิจัย',
      teaching: 'การสอน',
      service: 'บริการวิชาการ',
      certificate: 'Certificate',
      training: 'Training',
      evidence: 'หลักฐานการสอน',
    };
    const newItem: PortfolioItem = {
      id: `PORT-${Date.now().toString().slice(-4)}`,
      facultyId: currentFaculty?.id || 'FAC-MCU-003',
      title: newPortfolioData.title,
      category: newPortfolioData.category as any,
      categoryLabelTh: catMap[newPortfolioData.category] || 'ผลงานวิชาการ',
      year: newPortfolioData.year,
      description: newPortfolioData.description || 'เอกสารแนบประกอบแฟ้มสะสมงาน',
      fileUrl: newPortfolioData.fileName,
      fileType: newPortfolioData.fileType as any,
      fileSize: '2.5 MB',
      uploadDate: new Date().toISOString().substring(0, 10),
      verifiedByMentor: false,
      relatedPsfDimension: newPortfolioData.relatedPsf,
    };
    setPortfolioItems((prev) => [newItem, ...prev]);
    setIsUploadPortfolioModalOpen(false);
    showToast('อัปโหลดแฟ้มสะสมงานสำเร็จ', 'success');
  };

  // Mentor Review Handler
  const [mentorComment, setMentorComment] = useState('');
  const handleSaveMentorReview = () => {
    if (!mentorComment.trim()) {
      showToast('กรุณากรอกข้อเสนอแนะและข้อคิดเห็น', 'error');
      return;
    }
    const newRev: MentorReviewRecord = {
      id: `REV-${Date.now().toString().slice(-4)}`,
      facultyId: currentFaculty?.id || 'FAC-MCU-003',
      facultyName: currentFaculty?.name || 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
      mentorName: currentFaculty?.mentorName || 'พระธรรมวัชรบัณฑิต, ศ.ดร.',
      mentorPosition: 'Mentor ประจำคณะ / ผู้ทรงคุณวุฒิ',
      reviewDate: new Date().toISOString().substring(0, 10),
      overallRating: 'good',
      comments: mentorComment,
      recommendedActions: [
        'ดำเนินการตามแผน IDP ระยะที่ 2',
        'ส่งเสริมการจัดทำผลงานเพื่อรับรอง Thailand-PSF',
      ],
      status: 'approved',
    };
    setMentorReviews((prev) => [newRev, ...prev]);
    setIsMentorReviewModalOpen(false);
    setMentorComment('');
    showToast('บันทึกผลการตรวจสอบของ Mentor เรียบร้อยแล้ว', 'success');
  };

  // Step Toggle Helper
  const handleToggleStep = (index: number) => {
    setIdpSteps((prev) =>
      prev.map((step, idx) => {
        if (idx === index) {
          const nextStatus =
            step.status === 'completed'
              ? 'in_progress'
              : step.status === 'in_progress'
              ? 'pending'
              : 'completed';
          return {
            ...step,
            status: nextStatus,
            completedDate: nextStatus === 'completed' ? new Date().toISOString().substring(0, 10) : undefined,
          };
        }
        return step;
      })
    );
    showToast('อัปเดตสถานะขั้นตอน IDP แล้ว', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Faculty Switcher Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#B83B6F] to-[#942854] flex items-center justify-center text-white shadow-xs shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  ระบบบริหารสมรรถนะและการพัฒนาคณาจารย์ (Faculty Competency & IDP)
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBE7EF] text-[#B83B6F] border border-[#F5C2D6]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Thailand-PSF Standard
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                กรอบสมรรถนะอาจารย์ 4 ด้าน, เกณฑ์ Thailand-PSF 8 มิติ, แผนพัฒนาตนเองรายบุคคล (IDP 8 ขั้นตอน), แฟ้มสะสมงาน และระบบอาจารย์พี่เลี้ยง (Mentor)
              </p>
            </div>
          </div>

          {/* Current Faculty Indicator & Select */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-[#B83B6F]/10 text-[#B83B6F] font-semibold flex items-center justify-center text-xs">
              {currentFaculty?.monkTitle ? 'พระ' : 'อ.'}
            </div>
            <div className="text-left pr-2">
              <p className="text-xs text-slate-500">อาจารย์ที่กำลังดูข้อมูล</p>
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[160px]">
                {currentFaculty?.academicPosition} {currentFaculty?.name}
              </p>
            </div>
            {facultyList.length > 0 && (
              <select
                id="faculty-selector-top"
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
              >
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.academicPosition} {f.name} ({f.faculty})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            id="tab-btn-profiles"
            onClick={() => setActiveTab('profiles')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'profiles'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            อาจารย์ ({facultyList.length})
          </button>

          <button
            id="tab-btn-competency"
            onClick={() => setActiveTab('competency')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'competency'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Target className="w-4 h-4" />
            Competency 4 ด้าน
          </button>

          <button
            id="tab-btn-thailand-psf"
            onClick={() => setActiveTab('thailand_psf')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'thailand_psf'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Thailand-PSF 8 มิติ
          </button>

          <button
            id="tab-btn-idp"
            onClick={() => setActiveTab('idp')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'idp'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            IDP Workflow (8 ขั้นตอน)
          </button>

          <button
            id="tab-btn-portfolio"
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Portfolio & หลักฐาน ({portfolioItems.length})
          </button>

          <button
            id="tab-btn-mentor"
            onClick={() => setActiveTab('mentor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'mentor'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Mentor Review
          </button>
        </div>
      </div>

      {/* TAB 1: FACULTY PROFILES */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2.5 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="faculty-search-input"
                  type="text"
                  placeholder="ค้นหาชื่ออาจารย์, สาขา, ความเชี่ยวชาญ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                id="faculty-dept-filter"
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700"
              >
                <option value="all">ทุกคณะ/วิทยาลัย</option>
                <option value="คณะพุทธศาสตร์">คณะพุทธศาสตร์</option>
                <option value="คณะครุศาสตร์">คณะครุศาสตร์</option>
                <option value="คณะสังคมศาสตร์">คณะสังคมศาสตร์</option>
                <option value="วิทยาลัยพระธรรมทูต">วิทยาลัยพระธรรมทูต</option>
              </select>

              <Button
                id="btn-add-faculty"
                variant="primary"
                size="sm"
                onClick={() => setIsAddFacultyModalOpen(true)}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มข้อมูลอาจารย์
              </Button>
            </div>
          </div>

          {/* Faculty Profile Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.map((f) => {
              const isSelected = f.id === selectedFacultyId;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFacultyId(f.id)}
                  className={`bg-white rounded-xl border p-5 transition-all cursor-pointer hover:shadow-md ${
                    isSelected
                      ? 'border-[#B83B6F] ring-2 ring-[#B83B6F]/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#FBE7EF] to-[#F5C2D6] text-[#B83B6F] font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {f.monkTitle ? 'ภ.' : f.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {f.academicPosition}
                          </span>
                          {f.monkTitle && (
                            <span className="text-[11px] text-amber-700 font-medium truncate max-w-[120px]">
                              {f.monkTitle}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">
                          {f.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {f.department}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {f.faculty}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FBE7EF] text-[#B83B6F] border border-[#F5C2D6]">
                      PSF ระดับ {f.psfLevel}
                    </span>
                  </div>

                  {/* Expertise Tags */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-medium text-slate-500 mb-1.5">ความเชี่ยวชาญ (Expertise):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {f.expertise.map((exp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-600"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact & Meta */}
                  <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {f.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {f.totalPublications} ผลงาน
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPETENCY 4 DOMAINS */}
      {activeTab === 'competency' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  การประเมินสมรรถนะคณาจารย์ 4 ด้าน (Faculty Competency Domains)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ประเมินระดับความสามารถปัจจุบัน (Current Level) เทียบกับเป้าหมายตามสายวิชาการ (Target Level 1-5)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-md font-medium">
                  {currentFaculty?.academicPosition} {currentFaculty?.name}
                </span>
              </div>
            </div>

            {/* 4 Competency Domain Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {competencies.map((comp) => {
                const currentPercent = (comp.currentLevel / 5) * 100;
                const targetPercent = (comp.targetLevel / 5) * 100;
                return (
                  <div key={comp.domain} className="bg-slate-50/60 rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {comp.domainNameTh}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {comp.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-[#B83B6F]">
                          {comp.currentLevel}
                        </span>
                        <span className="text-xs text-slate-400"> / 5.0</span>
                        <p className="text-[11px] text-emerald-600 font-medium">
                          เป้าหมาย: {comp.targetLevel}.0
                        </p>
                      </div>
                    </div>

                    {/* Visual Level Bars */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>ระดับปัจจุบัน</span>
                        <span>{currentPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-linear-to-r from-[#B83B6F] to-[#942854] rounded-full transition-all duration-500"
                          style={{ width: `${currentPercent}%` }}
                        />
                        {/* Target marker */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-emerald-500"
                          style={{ left: `${targetPercent}%` }}
                          title={`เป้าหมาย: ${comp.targetLevel}`}
                        />
                      </div>
                    </div>

                    {/* Key Strengths & Growth Areas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <p className="font-semibold text-emerald-800 flex items-center gap-1 text-[11px] mb-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          จุดเด่น (Key Strengths)
                        </p>
                        <ul className="text-slate-600 space-y-0.5 text-[11px] list-disc list-inside">
                          {comp.keyStrengths.map((str, i) => (
                            <li key={i}>{str}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-amber-800 flex items-center gap-1 text-[11px] mb-1">
                          <TrendingUp className="w-3 h-3 text-amber-600" />
                          ประเด็นพัฒนา (Growth)
                        </p>
                        <ul className="text-slate-600 space-y-0.5 text-[11px] list-disc list-inside">
                          {comp.areasForGrowth.map((gro, i) => (
                            <li key={i}>{gro}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THAILAND-PSF 8 DIMENSIONS */}
      {activeTab === 'thailand_psf' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  กรอบมาตรฐานวิชาชีพอาจารย์ Thailand-PSF (Professional Standards Framework)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ประกอบด้วย 3 องค์ประกอบ 8 มิติ ประเมินเพื่อยกระดับสู่อาจารย์มืออาชีพระดับ 1 ถึง 4 ตามประกาศ กพอ. และ อว.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-[#FBE7EF] text-[#B83B6F] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#F5C2D6]">
                  ปัจจุบัน: ระดับ {currentFaculty?.psfLevel ?? 3} (ชำนาญการ)
                </div>
              </div>
            </div>

            {/* 8 Dimensions Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-3 w-16 text-center">มิติที่</th>
                    <th className="py-3 px-3">องค์ประกอบและชื่อมิติ</th>
                    <th className="py-3 px-3">คำอธิบายสมรรถนะ</th>
                    <th className="py-3 px-3 w-28 text-center">คะแนน (เต็ม 4)</th>
                    <th className="py-3 px-3 w-24 text-center">เกณฑ์ระดับ 3</th>
                    <th className="py-3 px-3 w-28 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {psfDimensions.map((dim) => (
                    <tr key={dim.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {dim.dimensionNo}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{dim.dimensionNameTh}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{dim.dimensionNameEn}</p>
                        <span className="inline-block mt-0.5 text-[10px] text-[#B83B6F] bg-[#FBE7EF] px-1.5 py-0.2 rounded font-medium">
                          {dim.domainNameTh}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 leading-relaxed max-w-sm">
                        {dim.description}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-900 text-sm">
                          {dim.facultyScore}
                        </span>
                        <span className="text-slate-400"> / 4</span>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-600">
                        ≥ {dim.requiredLevelForPsf}.0
                      </td>
                      <td className="py-3 px-3 text-center">
                        {dim.status === 'passed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> ผ่านเกณฑ์
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3" /> ควรพัฒนา
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IDP WORKFLOW (8 STEPS & GOALS) */}
      {activeTab === 'idp' && (
        <div className="space-y-6">
          {/* 8-Step Visual Process Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  กระบวนการจัดทำแผนพัฒนาตนเองรายบุคคล (IDP 8-Step Workflow)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  วงจรพัฒนาตนเองต่อเนื่อง: Self Assessment → Gap Analysis → Goal Setting → IDP → Mentor Review → Development → Evidence → Evaluation
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                สถานะรวม: อยู่ระหว่างดำเนินการตามแผน (Active)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {idpSteps.map((step, idx) => {
                const isDone = step.status === 'completed';
                const isInProg = step.status === 'in_progress';
                return (
                  <div
                    key={step.stepKey}
                    onClick={() => handleToggleStep(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : isInProg
                        ? 'bg-[#FBE7EF]/40 border-[#F5C2D6] ring-1 ring-[#B83B6F]/30'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {step.titleTh}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isInProg ? (
                        <Clock className="w-4 h-4 text-[#B83B6F] animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {step.notes}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{step.assignee}</span>
                      {step.completedDate && (
                        <span className="font-mono text-emerald-700">{step.completedDate}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IDP Development Goals Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  รายการเป้าหมายการพัฒนา (Development Goals & Action Plans)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เป้าหมาย กิจกรรม กรอบเวลา และงบประมาณสนับสนุนตามแผน IDP
                </p>
              </div>
              <Button
                id="btn-add-idp-goal"
                variant="primary"
                size="sm"
                onClick={() => setIsAddGoalModalOpen(true)}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มเป้าหมาย IDP
              </Button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">เป้าหมายและแผนการปฏิบัติ (Action Plan)</th>
                    <th className="py-2.5 px-3 w-32">ด้านสมรรถนะ</th>
                    <th className="py-2.5 px-3 w-28 text-right">งบประมาณ</th>
                    <th className="py-2.5 px-3 w-28">กำหนดเสร็จ</th>
                    <th className="py-2.5 px-3 w-28 text-center">สถานะ</th>
                    <th className="py-2.5 px-3">ความเห็นของ Mentor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {idpGoals.map((goal) => (
                    <tr key={goal.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{goal.goalTitle}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{goal.actionPlan}</p>
                        {goal.evidenceAttached && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#B83B6F] font-mono mt-1">
                            <FileText className="w-3 h-3" /> {goal.evidenceAttached}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                          {goal.competencyDomain}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800">
                        ฿{goal.budgetRequested.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {goal.targetDate}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {goal.status === 'verified' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            รับรองแล้ว
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            กำลังปฏิบัติ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 italic text-[11px]">
                        {goal.mentorFeedback || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PORTFOLIO & EVIDENCE (PDF, DOCX, XLSX, JPG, PNG) */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                แฟ้มสะสมงานและหลักฐานวิชาการ (Academic Portfolio & Evidence)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                รองรับผลงานวิชาการ, งานวิจัย, การสอน, บริการวิชาการ, Certificate, Training และหลักฐานการประเมิน
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                id="portfolio-filter-category"
                value={portfolioCategoryFilter}
                onChange={(e) => setPortfolioCategoryFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700"
              >
                <option value="all">ทุกหมวดผลงาน</option>
                <option value="academic_work">ผลงานวิชาการ</option>
                <option value="research">งานวิจัย</option>
                <option value="teaching">การสอน</option>
                <option value="service">บริการวิชาการ</option>
                <option value="certificate">Certificate</option>
                <option value="training">Training</option>
                <option value="evidence">หลักฐานการสอน</option>
              </select>

              <Button
                id="btn-upload-portfolio-modal"
                variant="primary"
                size="sm"
                onClick={() => setIsUploadPortfolioModalOpen(true)}
                className="gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                อัปโหลดผลงานใหม่
              </Button>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPortfolio.map((item) => {
              const fileIcon =
                item.fileType === 'pdf' ? (
                  <FileText className="w-5 h-5 text-red-500" />
                ) : item.fileType === 'docx' ? (
                  <FileCheck className="w-5 h-5 text-blue-500" />
                ) : item.fileType === 'xlsx' ? (
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                );

              return (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-100">
                        {fileIcon}
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                          {item.fileType}
                        </span>
                        <span className="ml-1.5 text-[11px] text-slate-400">
                          {item.fileSize}
                        </span>
                      </div>
                    </div>

                    {item.verifiedByMentor ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> ตรวจแล้ว
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        รอตรวจ
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="bg-[#FBE7EF] text-[#B83B6F] px-2 py-0.5 rounded font-medium">
                      {item.categoryLabelTh}
                    </span>
                    <span>{item.uploadDate}</span>
                  </div>

                  {item.relatedPsfDimension && (
                    <p className="text-[10px] text-slate-400">
                      สอดคล้องกับ: <span className="text-slate-700 font-medium">{item.relatedPsfDimension}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: MENTOR REVIEW */}
      {activeTab === 'mentor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ระบบอาจารย์พี่เลี้ยง (Mentor Guidance & Review)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  การให้คำปรึกษา ตรวจสอบแผน IDP ประเมิน Portfolio และรับรองสมรรถนะคณาจารย์
                </p>
              </div>

              <Button
                id="btn-mentor-review-open"
                variant="primary"
                size="sm"
                onClick={() => setIsMentorReviewModalOpen(true)}
                className="gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                บันทึกการประเมินของ Mentor
              </Button>
            </div>

            {/* Mentor Details & Reviews History */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#B83B6F]/10 text-[#B83B6F] flex items-center justify-center font-bold text-sm">
                    พี่เลี้ยง
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">อาจารย์พี่เลี้ยงประจำตัว</p>
                    <h3 className="text-sm font-bold text-slate-900">
                      {currentFaculty?.mentorName || 'พระธรรมวัชรบัณฑิต, ศ.ดร.'}
                    </h3>
                    <p className="text-[11px] text-slate-500">ผู้อำนวยการสถาบันวิจัยพุทธศาสตร์</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 space-y-1.5">
                  <p className="flex justify-between">
                    <span>สถานะ IDP:</span>
                    <span className="font-semibold text-emerald-700">ผ่านการเห็นชอบ (Approved)</span>
                  </p>
                  <p className="flex justify-between">
                    <span>รอบประเมินถัดไป:</span>
                    <span className="font-semibold text-slate-800">มิถุนายน 2569</span>
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ประวัติการให้ข้อเสนอแนะและผลการพิจารณา
                </h3>

                {mentorReviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rev.mentorName}</span>
                        <span className="text-slate-400">({rev.mentorPosition})</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{rev.reviewDate}</span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg leading-relaxed">
                      "{rev.comments}"
                    </p>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-600 mb-1">
                        ข้อแนะนำที่ต้องปฏิบัติ (Recommended Actions):
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {rev.recommendedActions.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD FACULTY */}
      <Modal
        isOpen={isAddFacultyModalOpen}
        onClose={() => setIsAddFacultyModalOpen(false)}
        title="เพิ่มข้อมูลอาจารย์ในระบบ"
        size="md"
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          <Input
            label="ชื่อ-นามสกุลอาจารย์ *"
            value={newFacultyData.name}
            onChange={(e) => setNewFacultyData({ ...newFacultyData, name: e.target.value })}
            placeholder="เช่น ดร.ประเสริฐ สุขใจ หรือ พระมหาธีรเดช"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="สมณศักดิ์ / ฉายา (ถ้ามี)"
              value={newFacultyData.monkTitle}
              onChange={(e) => setNewFacultyData({ ...newFacultyData, monkTitle: e.target.value })}
              placeholder="เช่น พระครูปลัด... หรือ ชยญาโณ"
            />
            <Select
              label="ตำแหน่งทางวิชาการ"
              value={newFacultyData.academicPosition}
              onChange={(e) => setNewFacultyData({ ...newFacultyData, academicPosition: e.target.value })}
              options={[
                { value: 'อาจารย์', label: 'อาจารย์' },
                { value: 'ผู้ช่วยศาสตราจารย์', label: 'ผู้ช่วยศาสตราจารย์ (ผศ.)' },
                { value: 'รองศาสตราจารย์', label: 'รองศาสตราจารย์ (รศ.)' },
                { value: 'ศาสตราจารย์', label: 'ศาสตราจารย์ (ศ.)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="คณะต้นสังกัด"
              value={newFacultyData.faculty}
              onChange={(e) => setNewFacultyData({ ...newFacultyData, faculty: e.target.value })}
              options={[
                { value: 'คณะพุทธศาสตร์', label: 'คณะพุทธศาสตร์' },
                { value: 'คณะครุศาสตร์', label: 'คณะครุศาสตร์' },
                { value: 'คณะมนุษยศาสตร์', label: 'คณะมนุษยศาสตร์' },
                { value: 'คณะสังคมศาสตร์', label: 'คณะสังคมศาสตร์' },
                { value: 'วิทยาลัยพระธรรมทูต', label: 'วิทยาลัยพระธรรมทูต' },
                { value: 'บัณฑิตวิทยาลัย', label: 'บัณฑิตวิทยาลัย' },
              ]}
            />
            <Input
              label="สาขาวิชา / ภาควิชา"
              value={newFacultyData.department}
              onChange={(e) => setNewFacultyData({ ...newFacultyData, department: e.target.value })}
              placeholder="สาขาวิชาพระพุทธศาสนา"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="อีเมลสถาบัน *"
              type="email"
              value={newFacultyData.email}
              onChange={(e) => setNewFacultyData({ ...newFacultyData, email: e.target.value })}
              placeholder="faculty@mcu.ac.th"
              required
            />
            <Select
              label="ระดับ Thailand-PSF"
              value={newFacultyData.psfLevel}
              onChange={(e) => setNewFacultyData({ ...newFacultyData, psfLevel: e.target.value })}
              options={[
                { value: '1', label: 'ระดับ 1: ผู้เริ่มต้น (Fellow)' },
                { value: '2', label: 'ระดับ 2: ชำนาญการ (Professional)' },
                { value: '3', label: 'ระดับ 3: เชี่ยวชาญ (Senior Fellow)' },
                { value: '4', label: 'ระดับ 4: เชี่ยวชาญพิเศษ (Principal)' },
              ]}
            />
          </div>

          <Input
            label="ความเชี่ยวชาญ (คั่นด้วยจุลภาค)"
            value={newFacultyData.expertiseStr}
            onChange={(e) => setNewFacultyData({ ...newFacultyData, expertiseStr: e.target.value })}
            placeholder="เช่น พระพุทธศาสนา, จริยธรรม, การเจริญสติ"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsAddFacultyModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit">
              บันทึกข้อมูลอาจารย์
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD IDP GOAL */}
      <Modal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        title="เพิ่มเป้าหมายแผนพัฒนาตนเอง (IDP Goal)"
        size="md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Select
            label="ด้านสมรรถนะ"
            value={newGoalData.competencyDomain}
            onChange={(e) => setNewGoalData({ ...newGoalData, competencyDomain: e.target.value })}
            options={[
              { value: 'teaching', label: 'ด้านการจัดการเรียนการสอน (Teaching)' },
              { value: 'research', label: 'ด้านการวิจัยและนวัตกรรม (Research)' },
              { value: 'academic_service', label: 'ด้านการบริการวิชาการ (Academic Service)' },
              { value: 'professional_dev', label: 'ด้านการพัฒนาวิชาชีพ (Professional Development)' },
            ]}
          />

          <Input
            label="เป้าหมายการพัฒนา (Development Goal) *"
            value={newGoalData.goalTitle}
            onChange={(e) => setNewGoalData({ ...newGoalData, goalTitle: e.target.value })}
            placeholder="เช่น ตีพิมพ์ผลงานวิจัยในวารสารระดับ TCI 1 หรือ Scopus"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              แผนการปฏิบัติและกิจกรรม (Action Plan)
            </label>
            <textarea
              value={newGoalData.actionPlan}
              onChange={(e) => setNewGoalData({ ...newGoalData, actionPlan: e.target.value })}
              rows={3}
              placeholder="ระบุกิจกรรมที่จะดำเนินการ เครื่องมือที่ใช้ และผลสัมฤทธิ์ที่คาดว่าจะได้รับ..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="งบประมาณที่ขอสนับสนุน (บาท)"
              type="number"
              value={newGoalData.budgetRequested}
              onChange={(e) => setNewGoalData({ ...newGoalData, budgetRequested: Number(e.target.value) })}
            />
            <Input
              label="กำหนดเสร็จสิ้น (Target Date)"
              type="date"
              value={newGoalData.targetDate}
              onChange={(e) => setNewGoalData({ ...newGoalData, targetDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsAddGoalModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit">
              บันทึกเป้าหมาย IDP
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: UPLOAD PORTFOLIO ITEM (PDF, DOCX, XLSX, JPG, PNG) */}
      <Modal
        isOpen={isUploadPortfolioModalOpen}
        onClose={() => setIsUploadPortfolioModalOpen(false)}
        title="อัปโหลดหลักฐานและผลงาน (Portfolio Upload)"
        size="md"
      >
        <form onSubmit={handleUploadPortfolio} className="space-y-4">
          <Input
            label="ชื่อผลงาน / ชื่อเอกสารหลักฐาน *"
            value={newPortfolioData.title}
            onChange={(e) => setNewPortfolioData({ ...newPortfolioData, title: e.target.value })}
            placeholder="เช่น วิจัยชั้นเรียน SoTL หรือ ประมวลรายวิชา มคอ.3"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="หมวดหมู่ผลงาน"
              value={newPortfolioData.category}
              onChange={(e) => setNewPortfolioData({ ...newPortfolioData, category: e.target.value })}
              options={[
                { value: 'academic_work', label: 'ผลงานวิชาการ' },
                { value: 'research', label: 'งานวิจัย' },
                { value: 'teaching', label: 'การสอน' },
                { value: 'service', label: 'บริการวิชาการ' },
                { value: 'certificate', label: 'Certificate' },
                { value: 'training', label: 'Training' },
                { value: 'evidence', label: 'หลักฐานการสอน' },
              ]}
            />
            <Select
              label="ประเภทไฟล์ที่รองรับ"
              value={newPortfolioData.fileType}
              onChange={(e) => setNewPortfolioData({ ...newPortfolioData, fileType: e.target.value })}
              options={[
                { value: 'pdf', label: 'PDF Document (.pdf)' },
                { value: 'docx', label: 'Word Document (.docx)' },
                { value: 'xlsx', label: 'Excel Spreadsheet (.xlsx)' },
                { value: 'jpg', label: 'JPEG Image (.jpg)' },
                { value: 'png', label: 'PNG Image (.png)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="ปี พ.ศ. ของผลงาน"
              value={newPortfolioData.year}
              onChange={(e) => setNewPortfolioData({ ...newPortfolioData, year: e.target.value })}
              placeholder="2569"
            />
            <Input
              label="สอดคล้องกับ Thailand-PSF มิติที่"
              value={newPortfolioData.relatedPsf}
              onChange={(e) => setNewPortfolioData({ ...newPortfolioData, relatedPsf: e.target.value })}
              placeholder="เช่น มิติที่ 1 และ 6"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำอธิบายรายละเอียด
            </label>
            <textarea
              value={newPortfolioData.description}
              onChange={(e) => setNewPortfolioData({ ...newPortfolioData, description: e.target.value })}
              rows={2}
              placeholder="ระบุบริบทของผลงาน แหล่งเผยแพร่ หรือการนำไปใช้ประโยชน์..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-700">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
            <p className="text-[11px] text-slate-400 mt-0.5">รองรับไฟล์: PDF, DOCX, XLSX, JPG, PNG (ขนาดไม่เกิน 25 MB)</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsUploadPortfolioModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit">
              อัปโหลดแฟ้มสะสมงาน
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: MENTOR REVIEW FORM */}
      <Modal
        isOpen={isMentorReviewModalOpen}
        onClose={() => setIsMentorReviewModalOpen(false)}
        title="บันทึกข้อเสนอแนะของ Mentor"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-[#FBE7EF]/50 p-3 rounded-lg border border-[#F5C2D6] text-xs">
            <p className="font-bold text-[#B83B6F]">อาจารย์ผู้รับการประเมิน:</p>
            <p className="text-slate-800 mt-0.5">
              {currentFaculty?.academicPosition} {currentFaculty?.name} ({currentFaculty?.faculty})
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ข้อเสนอแนะและข้อคิดเห็นเชิงพัฒนา (Mentor Feedback) *
            </label>
            <textarea
              value={mentorComment}
              onChange={(e) => setMentorComment(e.target.value)}
              rows={4}
              placeholder="ระบุข้อคิดเห็นเชิงบวก คำแนะนำในการทำวิจัย SoTL หรือการพัฒนาการเรียนการสอน..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsMentorReviewModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" onClick={handleSaveMentorReview}>
              บันทึกผลการประเมิน
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
