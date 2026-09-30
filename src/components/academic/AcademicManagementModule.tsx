import React, { useState } from 'react';
import {
  GraduationCap,
  Globe2,
  ArrowLeftRight,
  BookOpen,
  School,
  Wallet,
  Database,
  Layers,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import {
  INITIAL_PARTNERS,
  INITIAL_DEGREE_PROGRAMS,
  INITIAL_CROSSWALK,
  INITIAL_SHORT_COURSES,
  INITIAL_DEMAND_SURVEYS,
  INITIAL_PRE_DEGREE_COHORTS,
  INITIAL_PRE_DEGREE_STUDENTS,
  INITIAL_CREDIT_WALLETS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFER_APPLICATIONS,
  type PartnerRecord,
  type DegreeProgramRecord,
  type CurriculumCrosswalkRecord,
  type ShortCourseRecord,
  type DemandSurveyRecord,
  type PreDegreeCohortRecord,
  type PreDegreeStudentRecord,
  type CreditBankWallet,
  type CreditBankTransaction,
  type CreditTransferApplication,
} from '../../data/academicModuleData.ts';

import { PartnerMOUView } from './PartnerMOUView.tsx';
import { CurriculumCrosswalkView } from './CurriculumCrosswalkView.tsx';
import { ShortCourseNonDegreeView } from './ShortCourseNonDegreeView.tsx';
import { PreDegreeView } from './PreDegreeView.tsx';
import { UniversityCreditBankView } from './UniversityCreditBankView.tsx';
import { IntegrationAdapterModal } from './IntegrationAdapterModal.tsx';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';

export interface AcademicManagementModuleProps {
  initialSubTab?: string;
}

export const AcademicManagementModule: React.FC<AcademicManagementModuleProps> = ({
  initialSubTab = 'partners',
}) => {
  const { showToast } = useToast();

  // Active Main Academic Sub-Module
  const [activeTab, setActiveTab] = useState<
    'partners' | 'crosswalk' | 'short_course' | 'pre_degree' | 'credit_bank'
  >((initialSubTab as any) || 'partners');

  // Synchronize active tab whenever route/initialSubTab changes
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab as any);
    }
  }, [initialSubTab]);

  // Master State
  const [partners, setPartners] = useState<PartnerRecord[]>(INITIAL_PARTNERS);
  const [degreePrograms, setDegreePrograms] = useState<DegreeProgramRecord[]>(INITIAL_DEGREE_PROGRAMS);
  const [crosswalkList, setCrosswalkList] = useState<CurriculumCrosswalkRecord[]>(INITIAL_CROSSWALK);
  const [shortCourses, setShortCourses] = useState<ShortCourseRecord[]>(INITIAL_SHORT_COURSES);
  const [surveys, setSurveys] = useState<DemandSurveyRecord[]>(INITIAL_DEMAND_SURVEYS);
  const [cohorts, setCohorts] = useState<PreDegreeCohortRecord[]>(INITIAL_PRE_DEGREE_COHORTS);
  const [preDegreeStudents, setPreDegreeStudents] = useState<PreDegreeStudentRecord[]>(INITIAL_PRE_DEGREE_STUDENTS);
  const [wallets, setWallets] = useState<CreditBankWallet[]>(INITIAL_CREDIT_WALLETS);
  const [transactions, setTransactions] = useState<CreditBankTransaction[]>(INITIAL_TRANSACTIONS);
  const [applications, setApplications] = useState<CreditTransferApplication[]>(INITIAL_TRANSFER_APPLICATIONS);

  // Integration Adapter Modal
  const [isAdapterOpen, setIsAdapterOpen] = useState(false);

  // Crosswalk Callbacks
  const handleUpdateCrosswalk = (updated: CurriculumCrosswalkRecord) => {
    setCrosswalkList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleAddCrosswalk = (newItem: CurriculumCrosswalkRecord) => {
    setCrosswalkList((prev) => [newItem, ...prev]);
  };

  // Short Course Callbacks
  const handleAddCourse = (newCourse: ShortCourseRecord) => {
    setShortCourses((prev) => [newCourse, ...prev]);
  };

  const handleUpdateCourse = (updated: ShortCourseRecord) => {
    setShortCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Pre-degree Bridging to University
  const handleBridgeStudentToUniversity = (studentId: string) => {
    setPreDegreeStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          return {
            ...s,
            readyToTransfer: false,
            courses: s.courses.map((c) => ({ ...c, creditBankTransferred: true })),
          };
        }
        return s;
      })
    );

    // Create a new Credit Bank Transaction
    const targetStudent = preDegreeStudents.find((s) => s.studentId === studentId);
    if (targetStudent) {
      const newTx: CreditBankTransaction = {
        id: `TX-CB-2569-BR${Date.now().toString().slice(-4)}`,
        walletId: `CBW-${studentId}`,
        studentName: targetStudent.fullName,
        date: new Date().toISOString().substring(0, 10),
        sourceType: 'pre_degree',
        sourceTitle: `Pre-degree Bridging - ${targetStudent.schoolName}`,
        courseEquivalenceCode: 'MCU-PRE-TRANSFER',
        courseEquivalenceName: `เทียบโอนหลักสูตรสะสมล่วงหน้า (${targetStudent.pathwayIntended})`,
        credits: targetStudent.totalCredits,
        gradeOrResult: `GPA ${targetStudent.gpa.toFixed(2)} (Direct Transfer)`,
        assessor: 'สำนักทะเบียนและวัดผล มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        status: 'approved',
        documentEvidence: 'BRIDGING_TRANSCRIPT_APPROVED.pdf',
      };
      setTransactions((prev) => [newTx, ...prev]);

      // Check if wallet exists, or create/update
      setWallets((prev) => {
        const found = prev.find((w) => w.studentId === studentId);
        if (found) {
          return prev.map((w) =>
            w.studentId === studentId
              ? {
                  ...w,
                  totalCreditsAccumulated: w.totalCreditsAccumulated + targetStudent.totalCredits,
                  lastActivity: new Date().toISOString().substring(0, 10),
                }
              : w
          );
        } else {
          const newWallet: CreditBankWallet = {
            walletId: `CBW-${Date.now().toString().slice(-6)}`,
            studentId: studentId,
            fullName: targetStudent.fullName,
            studentType: 'pre_degree',
            facultyAffiliation: 'สำนักทะเบียนและวัดผล / คณะพุทธศาสตร์',
            degreeTargetTh: targetStudent.pathwayIntended,
            totalCreditsAccumulated: targetStudent.totalCredits,
            totalCreditsRequired: 135,
            validUntil: '31 พ.ค. 2577 (10 ปี)',
            lastActivity: new Date().toISOString().substring(0, 10),
            status: 'active',
          };
          return [newWallet, ...prev];
        }
      });
    }
  };

  // Credit Bank Callbacks
  const handleUpdateApplication = (updated: CreditTransferApplication) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAddTransaction = (newTx: CreditBankTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Integration Ingested Callback
  const handleDataIngested = (entityType: string, records: any[]) => {
    if (entityType === 'partner_mou') {
      const newPartners: PartnerRecord[] = records.map((r, idx) => ({
        id: `pt-ingest-${Date.now()}-${idx}`,
        university: r.university || 'Unknown Partner',
        country: r.country || 'International',
        countryCode: r.countryCode || 'INT',
        contact: r.contact || 'Registrar',
        email: r.email || 'info@partner.ac',
        phone: r.phone || '+66 2 123 4567',
        mouNumber: r.mouNumber || `MOU-${Date.now()}`,
        startDate: r.startDate || '2026-06-01',
        endDate: r.endDate || '2031-05-31',
        status: r.status || 'active',
        collaborationType: ['dual_degree'],
        programs: ['Academic Exchange'],
        scope: 'Academic and Research Collaboration',
        signedDocument: 'MOU_INGESTED.pdf',
        activeStudents: 0,
      }));
      setPartners((prev) => [...newPartners, ...prev]);
    } else if (entityType === 'short_course') {
      const newCourses: ShortCourseRecord[] = records.map((r, idx) => ({
        id: `sc-ingest-${Date.now()}-${idx}`,
        code: r.code || `SC-ING-${idx}`,
        titleTh: r.titleTh || 'หลักสูตรอบรมใหม่',
        titleEn: r.titleEn || 'New Short Course',
        category: r.category || 'พุทธนวัตกรรม',
        deliveryMode: r.deliveryMode || 'hybrid',
        hours: Number(r.hours) || 30,
        creditBankEquiv: Number(r.creditBankEquiv) || 2,
        fee: Number(r.fee) || 0,
        capacity: Number(r.capacity) || 50,
        enrolled: Number(r.enrolled) || 0,
        targetAudience: r.targetAudience || 'ผู้สนใจทั่วไป',
        competencyOutcome: r.competencyOutcome || 'ได้รับสมรรถนะตามมาตรฐาน',
        facultyOwner: r.facultyOwner || 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        workflowStatus: r.workflowStatus || 'active_enrollment',
        instructors: ['คณาจารย์ประจำหลักสูตร'],
        startDate: '2026-06-01',
        endDate: '2026-08-31',
      }));
      setShortCourses((prev) => [...newCourses, ...prev]);
    } else if (entityType === 'credit_bank') {
      const newTxs: CreditBankTransaction[] = records.map((r, idx) => ({
        id: r.id || `TX-ING-${Date.now()}-${idx}`,
        walletId: r.walletId || 'CBW-69001-0021',
        studentName: r.studentName || 'ผู้เรียน มจร',
        date: r.date || new Date().toISOString().substring(0, 10),
        sourceType: r.sourceType || 'short_course',
        sourceTitle: r.sourceTitle || 'External Credit Transfer',
        courseEquivalenceCode: r.courseEquivalenceCode || '000 101',
        courseEquivalenceName: r.courseEquivalenceName || 'มนุษย์กับสังคมและจริยธรรมร่วมสมัย',
        credits: Number(r.credits) || 3,
        gradeOrResult: r.gradeOrResult || 'Pass',
        assessor: r.assessor || 'Integration Adapter Engine',
        status: r.status || 'approved',
        documentEvidence: r.documentEvidence || 'VERIFIED_IMPORT_DOC.pdf',
      }));
      setTransactions((prev) => [...newTxs, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-pink-100/80 text-[#B83B6F] flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-[#B83B6F]">
                  Academic Management Platform
                </span>
                <span className="text-xs text-slate-500 font-medium">University-Level System</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                การบริหารจัดการวิชาการและนวัตกรรมการศึกษา (Academic Hub)
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                ศูนย์กลางบริหารคู่ความร่วมมือ, หลักสูตรสองสถาบัน (Dual/Joint), Curriculum Crosswalk, Short Course,
                Pre-degree และ University Credit Bank
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdapterOpen(true)}
              className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Database className="w-4 h-4 mr-1.5 text-[#B83B6F]" />
              Integration Adapter (เชื่อมต่อภายนอก)
            </Button>
          </div>
        </div>

        {/* Global Academic Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 mt-5 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('partners')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'partners'
                ? 'bg-[#B83B6F] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>1. คู่ความร่วมมือ & MOU</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'partners' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {partners.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crosswalk')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'crosswalk'
                ? 'bg-[#B83B6F] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>2. Curriculum Crosswalk</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'crosswalk' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {crosswalkList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('short_course')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'short_course'
                ? 'bg-[#B83B6F] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Short Course / Non-degree</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'short_course' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {shortCourses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pre_degree')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'pre_degree'
                ? 'bg-[#B83B6F] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>4. Pre-degree</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'pre_degree' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {preDegreeStudents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credit_bank')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'credit_bank'
                ? 'bg-[#B83B6F] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>5. University Credit Bank</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'credit_bank' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {wallets.length}
            </span>
          </button>
        </div>
      </div>

      {/* SUB-MODULE VIEWS */}
      <div>
        {activeTab === 'partners' && (
          <PartnerMOUView
            partners={partners}
            degreePrograms={degreePrograms}
            onAddPartner={(newP) => setPartners((prev) => [newP, ...prev])}
            onUpdatePartner={(updated) =>
              setPartners((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
            }
          />
        )}

        {activeTab === 'crosswalk' && (
          <CurriculumCrosswalkView
            crosswalkList={crosswalkList}
            onUpdateCrosswalk={handleUpdateCrosswalk}
            onAddCrosswalk={handleAddCrosswalk}
          />
        )}

        {activeTab === 'short_course' && (
          <ShortCourseNonDegreeView
            courses={shortCourses}
            surveys={surveys}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
          />
        )}

        {activeTab === 'pre_degree' && (
          <PreDegreeView
            cohorts={cohorts}
            students={preDegreeStudents}
            onBridgeStudentToUniversity={handleBridgeStudentToUniversity}
          />
        )}

        {activeTab === 'credit_bank' && (
          <UniversityCreditBankView
            wallets={wallets}
            transactions={transactions}
            applications={applications}
            onUpdateApplication={handleUpdateApplication}
            onAddTransaction={handleAddTransaction}
          />
        )}
      </div>

      {/* Integration Adapter Modal */}
      <IntegrationAdapterModal
        isOpen={isAdapterOpen}
        onClose={() => setIsAdapterOpen(false)}
        onDataIngested={handleDataIngested}
      />
    </div>
  );
};
