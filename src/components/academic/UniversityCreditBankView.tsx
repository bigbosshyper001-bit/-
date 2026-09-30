import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle2,
  FileCheck2,
  History,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
  User,
  GraduationCap,
  Building2,
  FileText,
  Sliders,
  Scale,
} from 'lucide-react';
import type {
  CreditBankWallet,
  CreditBankTransaction,
  CreditTransferApplication,
} from '../../data/academicModuleData.ts';
import { Button } from '../ui/Button.tsx';
import { ResponsiveTable } from '../ui/ResponsiveTable.tsx';
import { Modal } from '../ui/Modal.tsx';
import { useToast } from '../ui/Toast.tsx';

export interface UniversityCreditBankViewProps {
  wallets: CreditBankWallet[];
  transactions: CreditBankTransaction[];
  applications: CreditTransferApplication[];
  onUpdateApplication: (updated: CreditTransferApplication) => void;
  onAddTransaction: (newTx: CreditBankTransaction) => void;
}

export const UniversityCreditBankView: React.FC<UniversityCreditBankViewProps> = ({
  wallets,
  transactions,
  applications,
  onUpdateApplication,
  onAddTransaction,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'wallets' | 'timeline' | 'workflow'>('wallets');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Evaluation Modal
  const [selectedApp, setSelectedApp] = useState<CreditTransferApplication | null>(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [rubricScoreInput, setRubricScoreInput] = useState(90);
  const [approvedCreditsInput, setApprovedCreditsInput] = useState(12);
  const [committeeNotesInput, setCommitteeNotesInput] = useState('');

  // Certificate / Transcript Modal
  const [selectedWallet, setSelectedWallet] = useState<CreditBankWallet | null>(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

  // New Credit Ingestion Modal
  const [isAddCreditOpen, setIsAddCreditOpen] = useState(false);
  const [newCreditStudent, setNewCreditStudent] = useState('');
  const [newCreditSource, setNewCreditSource] = useState('short_course');
  const [newCreditTitle, setNewCreditTitle] = useState('');
  const [newCreditCourseCode, setNewCreditCourseCode] = useState('000 101');
  const [newCreditCourseName, setNewCreditCourseName] = useState('มนุษย์กับสังคมและจริยธรรมร่วมสมัย');
  const [newCreditAmount, setNewCreditAmount] = useState(3);

  // Filtered Wallets
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      const matchSearch =
        w.walletId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        w.studentId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        w.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        w.facultyAffiliation.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchType = filterType === 'all' || w.studentType === filterType;

      return matchSearch && matchType;
    });
  }, [wallets, searchKeyword, filterType]);

  // Status Badge for Applications
  const renderAppStatus = (status: CreditTransferApplication['status']) => {
    switch (status) {
      case 'pending_screening':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            1. รอคัดกรองเอกสาร
          </span>
        );
      case 'committee_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            2. รอคณะกรรมการพิจารณา
          </span>
        );
      case 'senate_approval':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            3. เสนอสภาวิชาการรับรอง
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            4. อนุมัติเทียบโอนสำเร็จ
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            ไม่อนุมัติ (ไม่ผ่านเกณฑ์)
          </span>
        );
    }
  };

  const handleOpenEvaluation = (app: CreditTransferApplication) => {
    setSelectedApp(app);
    setRubricScoreInput(app.rubricScore || 85);
    setApprovedCreditsInput(app.approvedCredits || app.requestedCredits);
    setCommitteeNotesInput(app.notes || '');
    setIsEvaluationModalOpen(true);
  };

  const handleSaveEvaluation = () => {
    if (!selectedApp) return;

    const nextStatus: CreditTransferApplication['status'] =
      selectedApp.status === 'pending_screening'
        ? 'committee_review'
        : selectedApp.status === 'committee_review'
        ? 'senate_approval'
        : 'completed';

    const updated: CreditTransferApplication = {
      ...selectedApp,
      rubricScore: rubricScoreInput,
      approvedCredits: approvedCreditsInput,
      notes: committeeNotesInput,
      status: nextStatus,
      committeeDecisionDate: new Date().toISOString().substring(0, 10),
    };

    onUpdateApplication(updated);
    setIsEvaluationModalOpen(false);
    showToast(`บันทึกผลการประเมินคำร้องเทียบโอน ${selectedApp.applicationNo} สำเร็จแล้ว`, 'success');
  };

  const handleSaveNewCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreditStudent || !newCreditTitle) {
      showToast('กรุณากรอกชื่อผู้เรียนและชื่อแหล่งที่มาของหน่วยกิต', 'warning');
      return;
    }

    const newTx: CreditBankTransaction = {
      id: `TX-CB-2569-0${transactions.length + 1}`,
      walletId: 'CBW-69001-0021',
      studentName: newCreditStudent,
      date: new Date().toISOString().substring(0, 10),
      sourceType: newCreditSource as any,
      sourceTitle: newCreditTitle,
      courseEquivalenceCode: newCreditCourseCode,
      courseEquivalenceName: newCreditCourseName,
      credits: Number(newCreditAmount) || 3,
      gradeOrResult: 'Pass (อนุมัติสะสมในระบบ)',
      assessor: 'คณะกรรมการบริหารระบบธนาคารหน่วยกิต มจร',
      status: 'approved',
      documentEvidence: 'CREDIT_BANK_DEPOSIT_OFFICIAL.pdf',
    };

    onAddTransaction(newTx);
    setIsAddCreditOpen(false);
    showToast(`บันทึกสะสมหน่วยกิตเข้า Wallet ของ ${newCreditStudent} สำเร็จแล้ว`, 'success');

    // Reset
    setNewCreditStudent('');
    setNewCreditTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Scope Disclaimer Banner */}
      <div className="border border-teal-200 bg-teal-50/50 rounded-xl p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-100 text-teal-700 shrink-0 mt-0.5">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                ระบบธนาคารหน่วยกิตระดับมหาวิทยาลัย (MCU University Credit Bank)
              </h3>
              <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-white text-teal-800 border border-teal-300">
                University-Level Management Platform
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              แพลตฟอร์มบริหารจัดการกระเป๋าหน่วยกิต (Credit Wallet) สำหรับพระภิกษุสามเณร นักศึกษา และผู้เรียนตลอดชีวิต
              รองรับการสะสมและเทียบโอนผลการเรียนรู้จากการศึกษาระบบ Short Course, การประเมินประสบการณ์ทำงาน (RPL),
              โครงการเรียนล่วงหน้า (Pre-degree) และการเทียบโอนระหว่างสถาบันพันธมิตร
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddCreditOpen(true)}
          className="text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          บันทึกสะสมหน่วยกิตเข้าคลัง
        </Button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex overflow-x-auto scrollbar-none p-1 bg-slate-100 rounded-lg border border-slate-200/80 gap-1 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('wallets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'wallets'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>กระเป๋าหน่วยกิตผู้เรียน (Credit Wallet)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-pink-100 text-[#B83B6F]">
              {wallets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'timeline'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ไทม์ไลน์ประวัติการสะสม (Transaction Ledger)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {transactions.length}
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
            <FileCheck2 className="w-4 h-4" />
            <span>กระบวนการขอเทียบโอน (Transfer Workflow)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-700">
              {applications.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          ระเบียบมหาวิทยาลัย: <strong className="text-slate-800">ธนาคารหน่วยกิต มจร พ.ศ. 2566</strong>
        </div>
      </div>

      {/* VIEW 1: CREDIT WALLETS */}
      {activeTab === 'wallets' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่กระเป๋า (Wallet ID), รหัสนิสิต, ชื่อ-ฉายา หรือคณะ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="w-full md:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="all">ทุกประเภทผู้เรียน (All Learner Types)</option>
                <option value="monk">พระภิกษุสามเณร (Monastic)</option>
                <option value="external_learner">ผู้เรียนตลอดชีวิต (Lifelong Learner)</option>
                <option value="pre_degree">นักเรียน Pre-degree</option>
                <option value="student">นิสิตปกติ</option>
              </select>
            </div>
          </div>

          {/* Wallets Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWallets.map((wallet) => {
              const progressPercent = Math.round(
                (wallet.totalCreditsAccumulated / wallet.totalCreditsRequired) * 100
              );
              return (
                <div
                  key={wallet.walletId}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {wallet.walletId}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">รหัส: {wallet.studentId}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {wallet.status === 'active' ? 'กำลังสะสม (Active)' : wallet.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{wallet.fullName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {wallet.facultyAffiliation} • {wallet.degreeTargetTh}
                      </p>
                    </div>

                    {/* Progress to Degree */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">ความก้าวหน้าสู่ปริญญาบัตร:</span>
                        <span className="font-bold text-teal-800 font-mono">
                          {wallet.totalCreditsAccumulated} / {wallet.totalCreditsRequired} หน่วยกิต (
                          {progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full transition-all"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                      <div>
                        <span>อายุการสะสม (Validity): </span>
                        <strong className="text-slate-800">{wallet.validUntil}</strong>
                      </div>
                      <div className="text-right">
                        <span>เคลื่อนไหวล่าสุด: </span>
                        <strong className="text-slate-800">{wallet.lastActivity}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">สำนักทะเบียนและวัดผล มจร</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setIsTranscriptModalOpen(true);
                      }}
                      className="text-xs text-[#B83B6F] hover:bg-pink-50 px-2.5 py-1"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      ดูใบรับรองสะสมหน่วยกิต (Transcript)
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: TRANSACTION LEDGER & TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                สมุดบันทึกรายการฝากหน่วยกิต (Credit Bank Transaction Ledger)
              </h3>
              <p className="text-xs text-slate-500">
                ประวัติการบันทึกหน่วยกิตจากทุกแหล่งข้อมูล ตรวจสอบย้อนหลังได้ตามมาตรฐาน อว.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[11px]">{tx.id}</span>
                    <span className="font-bold text-slate-900">{tx.studentName}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {tx.sourceType === 'short_course'
                        ? 'Short Course'
                        : tx.sourceType === 'prior_learning_rpl'
                        ? 'เทียบประสบการณ์ (RPL)'
                        : tx.sourceType === 'pre_degree'
                        ? 'Pre-degree'
                        : 'โอนจากภายนอก'}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium">{tx.sourceTitle}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      เทียบเท่ารายวิชา:{' '}
                      <strong className="text-slate-700">
                        {tx.courseEquivalenceCode} {tx.courseEquivalenceName}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>ผลการประเมิน: {tx.gradeOrResult}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-sm font-bold text-teal-800 block">+{tx.credits} หน่วยกิต</span>
                    <span className="text-[11px] text-slate-400">{tx.date}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    รับรองแล้ว
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: TRANSFER WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                คำร้องขอเทียบโอนผลการเรียนรู้เข้าสู่หลักสูตรปริญญา (Credit Transfer Applications)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                กระบวนการกลั่นกรองโดยคณะกรรมการเทียบโอนประจำคณะ และเสนอสภาวิชาการอนุมัติ
              </p>
            </div>

            <ResponsiveTable
              data={applications}
              keyExtractor={(app) => app.id}
              emptyMessage="ไม่พบคำร้องขอเทียบโอนผลการเรียนรู้"
              columns={[
                {
                  key: 'appNo',
                  title: 'เลขที่คำร้อง',
                  render: (app) => (
                    <span className="font-mono font-bold text-slate-900 text-xs">{app.applicationNo}</span>
                  ),
                },
                {
                  key: 'applicant',
                  title: 'ผู้ยื่นคำร้อง / ประเภท',
                  render: (app) => (
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{app.applicantName}</div>
                      <div className="text-[11px] text-slate-500">{app.applicantType}</div>
                    </div>
                  ),
                },
                {
                  key: 'program',
                  title: 'หลักสูตรเป้าหมายใน มจร',
                  render: (app) => (
                    <div className="text-slate-800 max-w-[240px] line-clamp-1 text-xs">{app.targetProgram}</div>
                  ),
                },
                {
                  key: 'requested',
                  title: 'ขอเทียบโอน',
                  align: 'center',
                  render: (app) => (
                    <span className="font-bold text-slate-900 text-xs">{app.requestedCredits} นก.</span>
                  ),
                },
                {
                  key: 'approved',
                  title: 'อนุมัติแล้ว',
                  align: 'center',
                  render: (app) => (
                    <span className="font-bold text-teal-800 text-xs">{app.approvedCredits} นก.</span>
                  ),
                },
                {
                  key: 'score',
                  title: 'คะแนนรูบริก',
                  align: 'center',
                  render: (app) => (
                    <span className="font-mono text-xs">
                      {app.rubricScore > 0 ? (
                        <span className="font-bold text-slate-900">{app.rubricScore}%</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  title: 'สถานะคำร้อง',
                  align: 'center',
                  render: (app) => renderAppStatus(app.status),
                },
                {
                  key: 'action',
                  title: 'การจัดการ',
                  align: 'right',
                  render: (app) => (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenEvaluation(app)}
                      className="text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white px-2.5 py-1 whitespace-nowrap"
                    >
                      พิจารณา / ประเมิน
                    </Button>
                  ),
                },
              ]}
              renderCard={(app) => ({
                id: app.id,
                title: app.applicantName,
                subtitle: `${app.applicationNo} • ${app.applicantType}`,
                statusBadge: renderAppStatus(app.status),
                fields: [
                  {
                    label: 'หลักสูตรเป้าหมาย',
                    value: app.targetProgram,
                    fullWidth: true,
                  },
                  {
                    label: 'หน่วยกิตขอเทียบโอน',
                    value: `${app.requestedCredits} หน่วยกิต`,
                  },
                  {
                    label: 'หน่วยกิตที่อนุมัติ',
                    value: (
                      <span className="font-bold text-teal-800">
                        {app.approvedCredits} หน่วยกิต
                      </span>
                    ),
                  },
                  {
                    label: 'คะแนนประเมินรูบริก',
                    value: (
                      <span className="font-mono font-semibold">
                        {app.rubricScore > 0 ? `${app.rubricScore}%` : 'ยังไม่ได้ประเมิน'}
                      </span>
                    ),
                  },
                ],
                primaryAction: (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white"
                    onClick={() => handleOpenEvaluation(app)}
                  >
                    เปิดฟอร์มพิจารณา / ประเมินเกณฑ์
                  </Button>
                ),
              })}
            />
          </div>
        </div>
      )}

      {/* MODAL: Committee Rubric Evaluation */}
      {selectedApp && (
        <Modal
          isOpen={isEvaluationModalOpen}
          onClose={() => setIsEvaluationModalOpen(false)}
          title={`พิจารณาคำร้องเทียบโอน: ${selectedApp.applicationNo}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">ผู้ยื่นคำร้อง</span>
                <span className="font-bold text-slate-900 text-sm">{selectedApp.applicantName}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{selectedApp.applicantType}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">หลักสูตรเป้าหมาย</span>
                <span className="font-bold text-slate-900 block">{selectedApp.targetProgram}</span>
                <span className="text-[11px] text-teal-700 font-semibold block mt-0.5">
                  ขอเทียบโอน: {selectedApp.requestedCredits} หน่วยกิต
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  คะแนนประเมินเกณฑ์รูบริก (Rubric Assessment: {rubricScoreInput}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={rubricScoreInput}
                  onChange={(e) => setRubricScoreInput(parseInt(e.target.value))}
                  className="w-full accent-[#B83B6F]"
                />
                <span className="text-[11px] text-slate-500">เกณฑ์ผ่านการรับรอง: ไม่ต่ำกว่า 80%</span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  จำนวนหน่วยกิตที่คณะกรรมการเห็นชอบอนุมัติ (หน่วยกิต)
                </label>
                <input
                  type="number"
                  value={approvedCreditsInput}
                  onChange={(e) => setApprovedCreditsInput(parseInt(e.target.value) || 0)}
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                มติคณะกรรมการเทียบโอนและข้อเสนอแนะต่อสภาวิชาการ
              </label>
              <textarea
                rows={3}
                value={committeeNotesInput}
                onChange={(e) => setCommitteeNotesInput(e.target.value)}
                placeholder="ระบุข้อความมติ เช่น เห็นชอบเทียบโอนรายวิชาหมวดศึกษาทั่วไป 12 หน่วยกิต และเสนอสภาวิชาการรับรอง..."
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
                บันทึกมติและเลื่อนสถานะ
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Credit Wallet Transcript */}
      {selectedWallet && (
        <Modal
          isOpen={isTranscriptModalOpen}
          onClose={() => setIsTranscriptModalOpen(false)}
          title={`ใบรายงานผลการสะสมหน่วยกิต (Credit Bank Transcript)`}
          size="lg"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="text-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
              </h3>
              <p className="text-xs text-slate-600">สำนักทะเบียนและวัดผล กองวิชาการ</p>
              <p className="font-bold text-[#B83B6F] text-xs mt-1">
                ใบรายงานผลการสะสมหน่วยกิตในระบบธนาคารหน่วยกิต (Credit Bank Transcript)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
              <div>
                <p>
                  <strong>ชื่อผู้เรียน:</strong> {selectedWallet.fullName}
                </p>
                <p className="mt-1">
                  <strong>รหัสบัญชีคลัง:</strong> {selectedWallet.walletId}
                </p>
              </div>
              <div className="text-right">
                <p>
                  <strong>สังกัดคณะ:</strong> {selectedWallet.facultyAffiliation}
                </p>
                <p className="mt-1">
                  <strong>หน่วยกิตสะสมรวม:</strong>{' '}
                  <span className="font-bold text-teal-800 text-sm">
                    {selectedWallet.totalCreditsAccumulated} หน่วยกิต
                  </span>
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 space-y-2">
              <h4 className="font-bold text-slate-800">รายการรับรองการสะสม</h4>
              <ul className="divide-y divide-slate-100 text-slate-700">
                <li className="py-1.5 flex justify-between">
                  <span>000 115 ภาษาบาลีเบื้องต้น 1 (Short Course / RPL)</span>
                  <span className="font-bold">3 หน่วยกิต (Grade A)</span>
                </li>
                <li className="py-1.5 flex justify-between">
                  <span>000 101 มนุษย์กับสังคมและจริยธรรม (Pre-degree)</span>
                  <span className="font-bold">3 หน่วยกิต (Grade A)</span>
                </li>
                <li className="py-1.5 flex justify-between">
                  <span>SC-MCU-2569-01 การบริหารความขัดแย้งและสันติวิธี</span>
                  <span className="font-bold">3 หน่วยกิต (Pass)</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setIsTranscriptModalOpen(false)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: New Credit Ingestion */}
      <Modal
        isOpen={isAddCreditOpen}
        onClose={() => setIsAddCreditOpen(false)}
        title="บันทึกสะสมหน่วยกิตเข้าคลัง (Deposit Credits into Bank)"
        size="md"
      >
        <form onSubmit={handleSaveNewCredit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">ชื่อ-ฉายาผู้เรียน (Learner Full Name) *</label>
            <input
              type="text"
              value={newCreditStudent}
              onChange={(e) => setNewCreditStudent(e.target.value)}
              placeholder="เช่น พระมหาอภิสิทธิ์ ธมฺมธโร"
              required
              className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">แหล่งที่มาของหน่วยกิต (Source Type) *</label>
            <select
              value={newCreditSource}
              onChange={(e) => setNewCreditSource(e.target.value)}
              className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
            >
              <option value="short_course">หลักสูตรระยะสั้น (Short Course Certificate)</option>
              <option value="prior_learning_rpl">การประเมินความรู้/ประสบการณ์เดิม (RPL)</option>
              <option value="pre_degree">โครงการเรียนล่วงหน้า (Pre-degree)</option>
              <option value="external_university">เทียบโอนจากสถาบันพันธมิตร (MOU Crosswalk)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">ชื่อหลักสูตร / ประสบการณ์ที่นำมาสะสม *</label>
            <input
              type="text"
              value={newCreditTitle}
              onChange={(e) => setNewCreditTitle(e.target.value)}
              placeholder="เช่น SC-MCU-2569-03 ภาษาบาลีเพื่อการใช้งานจริง"
              required
              className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">เทียบเคียงรหัสวิชา มจร</label>
              <input
                type="text"
                value={newCreditCourseCode}
                onChange={(e) => setNewCreditCourseCode(e.target.value)}
                className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">จำนวนหน่วยกิตสะสม</label>
              <input
                type="number"
                value={newCreditAmount}
                onChange={(e) => setNewCreditAmount(parseInt(e.target.value) || 0)}
                className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddCreditOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#B83B6F] hover:bg-[#A02F5E] text-white">
              บันทึกเข้ากระเป๋าเครดิต
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
