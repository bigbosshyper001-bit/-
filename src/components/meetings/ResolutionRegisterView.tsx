import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  History,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { useToast } from '../ui/Toast.tsx';
import type { ResolutionRecord } from '../../data/meetingModuleData.ts';
import type { UserProfile } from '../../types.ts';
import type { WorkflowInstance } from '../../types/workflow.ts';
import { workflowEngine } from '../../services/workflowEngine.ts';
import { WorkflowStatusStepper } from '../workflow/WorkflowStatusStepper.tsx';
import { WorkflowApprovalPanel } from '../workflow/WorkflowApprovalPanel.tsx';
import { WorkflowTimelineModal } from '../workflow/WorkflowTimelineModal.tsx';
import { centralDocumentService } from '../../services/centralDocumentService.ts';
import type { CentralManagedDocument } from '../../types/documentManagement.ts';

export interface ResolutionRegisterViewProps {
  resolutions: ResolutionRecord[];
  currentUser?: UserProfile;
  onUpdateResolution?: (updated: ResolutionRecord) => void;
  onAddNewResolution?: (res: ResolutionRecord) => void;
}

export const ResolutionRegisterView: React.FC<ResolutionRegisterViewProps> = ({
  resolutions,
  currentUser,
  onUpdateResolution,
  onAddNewResolution,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedResolution, setSelectedResolution] = useState<ResolutionRecord | null>(
    resolutions[0] || null
  );

  // Workflow integration state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [workflowTick, setWorkflowTick] = useState(0);

  const activeUser: UserProfile = useMemo(() => {
    return (
      currentUser || {
        id: 'usr-1',
        name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
        role: 'หัวหน้ากอง',
        position: 'ผู้อำนวยการกองวิชาการ',
        department: 'กองวิชาการ สำนักงานอธิการบดี',
        email: 'academic.director@mcu.ac.th',
        initials: 'วร',
      }
    );
  }, [currentUser]);

  const activeWorkflowInstance = useMemo(() => {
    if (!selectedResolution) return null;
    return (
      workflowEngine.getInstanceByRecord(selectedResolution.id) ||
      workflowEngine.getOrCreateInstance(
        selectedResolution.id,
        'meeting_resolutions',
        selectedResolution.title,
        selectedResolution.id,
        'meeting',
        '/meetings',
        activeUser
      )
    );
  }, [selectedResolution, workflowTick, activeUser]);

  // Filtered Resolutions
  const filteredResolutions = useMemo(() => {
    return resolutions.filter((res) => {
      const matchesSearch =
        res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || res.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'all' || res.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [resolutions, searchQuery, statusFilter, priorityFilter]);

  // Evidence Upload simulation & automatic registration to Central DMS
  const handleUploadEvidence = (res: ResolutionRecord) => {
    const evidenceTitle = `หลักฐานการปฏิบัติตามมติ_${res.id}`;
    const evidenceDocNo = `มติ-${res.id}/หลักฐาน`;

    // 1. Create entry in Central DMS
    centralDocumentService.createDocument(
      {
        title: `${evidenceTitle} (${res.title})`,
        documentNo: evidenceDocNo,
        docType: 'resolution_register',
        department: res.department,
        fileFormat: 'pdf',
        fileSize: '3.4 MB',
        fileName: `evidence_${res.id}.pdf`,
        description: `หลักฐานยืนยันผลการปฏิบัติตามมติสภาวิชาการ ${res.id}: ${res.title}`,
        tags: ['มติสภาวิชาการ', 'หลักฐาน', 'การดำเนินงาน'],
        initialVersion: 'v1.0',
        initialChangeDescription: `อัปโหลดหลักฐานการดำเนินงานสำหรับมติ ${res.id}`,
        initialRelations: [
          {
            targetModule: 'resolution',
            targetRecordId: res.id,
            targetRecordCode: res.id,
            targetRecordTitle: res.title,
            targetPath: '/meetings',
            relationshipType: 'approved_basis',
          },
        ],
      },
      activeUser as any
    );

    // 2. Update local resolution record
    const updated: ResolutionRecord = {
      ...res,
      status: 'completed',
      evidence: {
        title: `${evidenceTitle}.pdf`,
        submittedDate: new Date().toISOString().slice(0, 10),
        fileUrl: `docs/evidence_${res.id}.pdf`,
        verifiedBy: 'ผอ.กองวิชาการ',
      },
    };
    onUpdateResolution?.(updated);
    setSelectedResolution(updated);
    showToast({
      title: 'แนบหลักฐานและบันทึกสู่ระบบคลังกลาง DMS แล้ว',
      message: `บันทึกหลักฐานสำหรับ ${res.id} และผูกความสัมพันธ์ Single Source of Truth เรียบร้อยแล้ว`,
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
              placeholder="ค้นหารหัสมติ, เรื่อง, หน่วยงาน หรือผู้รับผิดชอบ..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="completed">เสร็จสิ้น (Completed)</option>
              <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="overdue">เกินกำหนด (Overdue)</option>
              <option value="draft">ร่างมติ (Draft)</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">ความสำคัญทั้งหมด</option>
              <option value="critical">วิกฤต (Critical)</option>
              <option value="high">สูง (High)</option>
              <option value="medium">ปานกลาง (Medium)</option>
              <option value="low">ปกติ (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Master-Detail Split Grid (Preserving Context!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Resolutions List (Span 7) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredResolutions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              ไม่พบรายการมติตามเงื่อนไขการค้นหา
            </div>
          ) : (
            filteredResolutions.map((res) => {
              const isSelected = selectedResolution?.id === res.id;
              const isOverdue = res.status === 'overdue';
              const isCompleted = res.status === 'completed';

              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResolution(res)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#B83B6F] shadow-sm ring-1 ring-[#B83B6F]/20'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {res.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {res.meetingTitle} (วาระ {res.agendaItemNumber})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          res.priority === 'critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : res.priority === 'high'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {res.priority}
                      </span>
                      <StatusBadge
                        status={
                          isCompleted
                            ? 'completed'
                            : isOverdue
                            ? 'overdue'
                            : res.status === 'in_progress'
                            ? 'in-progress'
                            : 'pending'
                        }
                      />
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {res.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {res.details}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>{res.department}</span>
                      <span>•</span>
                      <span>{res.responsiblePerson}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{res.deadline}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed Context Side Panel (Span 5) */}
        <div className="lg:col-span-5">
          {selectedResolution ? (
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs sticky top-20 space-y-5 text-xs text-slate-700">
              <div className="pb-3 border-b border-slate-200 flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {selectedResolution.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                    {selectedResolution.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    อ้างอิง: {selectedResolution.meetingTitle} (วาระ {selectedResolution.agendaItemNumber})
                  </p>
                </div>
              </div>

              {/* Resolution Details */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-900 block">
                  รายละเอียดมติที่ประชุมสภาวิชาการ:
                </span>
                <p className="text-slate-700 leading-relaxed bg-[#FAFAFC] p-3 rounded-lg border border-slate-200">
                  {selectedResolution.details}
                </p>
              </div>

              {/* Responsible Personnel & Deadline */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-900">ผู้รับผิดชอบ:</span>
                  <span>{selectedResolution.responsiblePerson}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-900">หน่วยงาน:</span>
                  <span>{selectedResolution.department}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-900">กำหนดเส้นตาย (Deadline):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedResolution.deadline}
                  </span>
                </div>
              </div>

              {/* Evidence Section (Required by prompt) */}
              <div className="pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900 block mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  หลักฐานและเอกสารในคลังกลาง (DMS Single Source of Truth)
                </span>

                {/* Linked Central DMS Documents for this Resolution */}
                {(() => {
                  const linkedDocs = centralDocumentService.getDocumentsByModuleRecord('resolution', selectedResolution.id);
                  return (
                    <div className="space-y-2 mb-3">
                      {linkedDocs.map((ld) => (
                        <div
                          key={ld.id}
                          className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                              [{ld.fileFormat}]
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-blue-950 truncate">{ld.title}</p>
                              <span className="text-[10px] text-slate-500 font-mono">
                                เลขที่ {ld.documentNo} • {ld.currentVersion} • {ld.fileSize}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded shrink-0">
                            เชื่อมกับมตินี้
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {selectedResolution.evidence ? (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900">
                        {selectedResolution.evidence.title}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-emerald-800 flex items-center justify-between">
                      <span>ยื่นเมื่อ: {selectedResolution.evidence.submittedDate}</span>
                      <span>ผู้ตรวจ: {selectedResolution.evidence.verifiedBy || 'ผอ.กองวิชาการ'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center space-y-2">
                    <p className="text-slate-400 text-[11px]">
                      ยังไม่มีการส่งไฟล์หลักฐานการดำเนินงาน
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUploadEvidence(selectedResolution)}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      แนบหลักฐานการดำเนินงาน (เชื่อมสู่ DMS อัตโนมัติ)
                    </Button>
                  </div>
                )}
              </div>

              {/* Workflow Stepper & Approval Action Panel */}
              {activeWorkflowInstance && (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#D94F87]" />
                      กระบวนการพิจารณาและอนุมัติ (Workflow)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTimelineModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>ประวัติ</span>
                    </button>
                  </div>

                  <WorkflowStatusStepper
                    instance={activeWorkflowInstance}
                    onOpenHistory={() => setIsTimelineModalOpen(true)}
                  />

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsApprovalModalOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-[#D94F87] hover:bg-[#C23B73] text-white shadow-2xs cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>จัดการสถานะ / ส่งตรวจ / อนุมัติมตินี้</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              เลือกมติจากรายการด้านซ้ายเพื่อดูรายละเอียด
            </div>
          )}
        </div>
      </div>

      {/* Workflow Action Modal */}
      {isApprovalModalOpen && activeWorkflowInstance && (
        <Modal
          isOpen={true}
          onClose={() => setIsApprovalModalOpen(false)}
          title={`พิจารณาอนุมัติมติ: ${selectedResolution?.title}`}
          size="lg"
        >
          <div className="space-y-4">
            <WorkflowStatusStepper instance={activeWorkflowInstance} />
            <WorkflowApprovalPanel
              instance={activeWorkflowInstance}
              currentUser={activeUser}
              onActionComplete={(updated) => {
                setWorkflowTick((t) => t + 1);
                if (onUpdateResolution && selectedResolution) {
                  const mappedStatus =
                    updated.status === 'Approved'
                      ? 'completed'
                      : updated.status === 'Returned for Revision'
                      ? 'in_progress'
                      : 'in_progress';
                  onUpdateResolution({
                    ...selectedResolution,
                    status: mappedStatus as any,
                  });
                }
              }}
            />
          </div>
        </Modal>
      )}

      {/* Workflow Timeline Modal */}
      {activeWorkflowInstance && (
        <WorkflowTimelineModal
          isOpen={isTimelineModalOpen}
          onClose={() => setIsTimelineModalOpen(false)}
          instance={activeWorkflowInstance}
        />
      )}
    </div>
  );
};
