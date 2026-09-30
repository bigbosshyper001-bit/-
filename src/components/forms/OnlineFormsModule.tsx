import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  Layers,
  Sparkles,
  FileText,
  Calendar,
  Hash,
  List,
  CheckSquare,
  UploadCloud,
  PenTool,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  ChevronRight,
  X,
  Copy,
} from 'lucide-react';
import {
  INITIAL_FORM_DEFINITIONS,
  INITIAL_FORM_SUBMISSIONS,
  type FormDefinition,
  type FormFieldDefinition,
  type FormFieldType,
  type ApprovalStep,
  type FormSubmissionRecord,
} from '../../data/formsModuleData.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { useToast } from '../ui/Toast.tsx';

export const OnlineFormsModule: React.FC = () => {
  const { showToast } = useToast();

  const [forms, setForms] = useState<FormDefinition[]>(INITIAL_FORM_DEFINITIONS);
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>(INITIAL_FORM_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<'catalog' | 'builder' | 'submissions'>('catalog');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');

  // Currently editing form in Builder
  const [editingForm, setEditingForm] = useState<FormDefinition | null>(() => forms[0] || null);

  // Keep editingForm in sync if forms list changes and editingForm is not found
  React.useEffect(() => {
    if (!editingForm && forms.length > 0) {
      setEditingForm(forms[0]);
    }
  }, [forms, editingForm]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [testFormData, setTestFormData] = useState<Record<string, any>>({});

  // Field Editor Modal State
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldDefinition | null>(null);
  const [newFieldData, setNewFieldData] = useState<{
    label: string;
    type: FormFieldType;
    placeholder: string;
    helpText: string;
    optionsStr: string;
    required: boolean;
    min?: number;
    max?: number;
  }>({
    label: '',
    type: 'text',
    placeholder: '',
    helpText: '',
    optionsStr: '',
    required: true,
  });

  // Filtered forms in catalog
  const filteredForms = useMemo(() => {
    return forms.filter((f) => {
      const matchSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [forms, searchQuery, statusFilter]);

  // Create new blank form
  const handleCreateNewForm = () => {
    const newF: FormDefinition = {
      id: `FORM-MCU-${Date.now().toString().slice(-4)}`,
      code: `FM-NEW-${Date.now().toString().slice(-3)}`,
      title: 'แบบฟอร์มวิชาการใหม่ (ร่าง)',
      description: 'กรุณากรอกรายละเอียดวัตถุประสงค์และข้อกำหนดของแบบฟอร์ม',
      category: 'academic_affairs',
      categoryLabelTh: 'งานวิชาการ',
      status: 'draft',
      allowedRoles: ['อาจารย์ประจำ', 'เจ้าหน้าที่'],
      fields: [
        {
          id: `f-${Date.now()}-1`,
          label: 'ชื่อ-นามสกุล ผู้ยื่นคำร้อง',
          type: 'text',
          placeholder: 'ระบุชื่อ-นามสกุล',
          validation: { required: true },
          order: 1,
        },
        {
          id: `f-${Date.now()}-2`,
          label: 'คณะ / หน่วยงาน',
          type: 'dropdown',
          options: ['คณะพุทธศาสตร์', 'คณะครุศาสตร์', 'คณะมนุษยศาสตร์', 'คณะสังคมศาสตร์'],
          validation: { required: true },
          order: 2,
        },
      ],
      approvalWorkflow: [
        { stepNo: 1, approverRole: 'หัวหน้าภาควิชา', approverUnit: 'ภาควิชาต้นสังกัด', autoNotifyEmail: true, requiredSignature: true },
        { stepNo: 2, approverRole: 'คณบดี', approverUnit: 'สำนักงานคณบดี', autoNotifyEmail: true, requiredSignature: true },
      ],
      submissionCount: 0,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    setForms((prev) => [newF, ...prev]);
    setEditingForm(newF);
    setActiveTab('builder');
    showToast('สร้างแบบฟอร์มใหม่เรียบร้อยแล้ว เข้าสู่หน้าจอ Form Builder', 'success');
  };

  // Reorder Field Handler (Up/Down)
  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    if (!editingForm) return;
    const fields = [...editingForm.fields];
    const index = fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = fields[index];
      fields[index] = fields[index - 1];
      fields[index - 1] = temp;
    } else if (direction === 'down' && index < fields.length - 1) {
      const temp = fields[index];
      fields[index] = fields[index + 1];
      fields[index + 1] = temp;
    }

    // re-index order
    const updated = fields.map((f, i) => ({ ...f, order: i + 1 }));
    const updatedForm = { ...editingForm, fields: updated, updatedAt: new Date().toISOString().substring(0, 10) };
    setEditingForm(updatedForm);
    setForms((prev) => prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)));
  };

  // Delete Field
  const handleDeleteField = (fieldId: string) => {
    if (!editingForm) return;
    const updated = editingForm.fields.filter((f) => f.id !== fieldId).map((f, i) => ({ ...f, order: i + 1 }));
    const updatedForm = { ...editingForm, fields: updated };
    setEditingForm(updatedForm);
    setForms((prev) => prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)));
    showToast('ลบฟิลด์ออกจากแบบฟอร์มแล้ว', 'info');
  };

  // Open Field Modal (Add or Edit)
  const handleOpenAddField = () => {
    setEditingField(null);
    setNewFieldData({
      label: '',
      type: 'text',
      placeholder: '',
      helpText: '',
      optionsStr: '',
      required: true,
    });
    setIsFieldModalOpen(true);
  };

  const handleOpenEditField = (field: FormFieldDefinition) => {
    setEditingField(field);
    setNewFieldData({
      label: field.label,
      type: field.type,
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      optionsStr: field.options ? field.options.join('\n') : '',
      required: field.validation.required,
      min: field.validation.min,
      max: field.validation.max,
    });
    setIsFieldModalOpen(true);
  };

  // Save Field
  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;
    if (!newFieldData.label.trim()) {
      showToast('กรุณากรอกชื่อฟิลด์ (Label)', 'error');
      return;
    }

    const options = newFieldData.optionsStr
      ? newFieldData.optionsStr.split('\n').map((o) => o.trim()).filter(Boolean)
      : undefined;

    if (editingField) {
      // Edit existing
      const updatedFields = editingForm.fields.map((f) =>
        f.id === editingField.id
          ? {
              ...f,
              label: newFieldData.label,
              type: newFieldData.type,
              placeholder: newFieldData.placeholder || undefined,
              helpText: newFieldData.helpText || undefined,
              options,
              validation: {
                ...f.validation,
                required: newFieldData.required,
                min: newFieldData.min,
                max: newFieldData.max,
              },
            }
          : f
      );
      const updatedForm = { ...editingForm, fields: updatedFields };
      setEditingForm(updatedForm);
      setForms((prev) => prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)));
      showToast('แก้ไขฟิลด์เรียบร้อย', 'success');
    } else {
      // Add new
      const newField: FormFieldDefinition = {
        id: `f-${Date.now()}`,
        label: newFieldData.label,
        type: newFieldData.type,
        placeholder: newFieldData.placeholder || undefined,
        helpText: newFieldData.helpText || undefined,
        options,
        validation: {
          required: newFieldData.required,
          min: newFieldData.min,
          max: newFieldData.max,
        },
        order: editingForm.fields.length + 1,
      };
      const updatedForm = {
        ...editingForm,
        fields: [...editingForm.fields, newField],
      };
      setEditingForm(updatedForm);
      setForms((prev) => prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)));
      showToast('เพิ่มฟิลด์ลงในแบบฟอร์มแล้ว', 'success');
    }

    setIsFieldModalOpen(false);
  };

  // Publish / Close Form Toggle
  const handleToggleFormStatus = (newStatus: 'published' | 'closed' | 'draft') => {
    if (!editingForm) return;
    const updatedForm = {
      ...editingForm,
      status: newStatus,
      publishedDate: newStatus === 'published' ? new Date().toISOString().substring(0, 10) : editingForm.publishedDate,
    };
    setEditingForm(updatedForm);
    setForms((prev) => prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)));
    showToast(`เปลี่ยนสถานะแบบฟอร์มเป็น: ${newStatus === 'published' ? 'เผยแพร่แล้ว (Published)' : newStatus === 'closed' ? 'ปิดรับคำร้อง (Closed)' : 'ฉบับร่าง (Draft)'}`, 'success');
  };

  // Test Submit in Preview
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;
    const newSub: FormSubmissionRecord = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      formId: editingForm.id,
      formTitle: editingForm.title,
      submissionNo: `REQ-2569-${Math.floor(1000 + Math.random() * 9000)}`,
      submitterName: 'ผู้ทดสอบระบบ (User Test)',
      submitterRole: 'อาจารย์ประจำ',
      submitterEmail: 'tester@mcu.ac.th',
      submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      data: testFormData,
      currentStepIndex: 1,
      status: 'in_workflow',
      reviewNotes: 'ยื่นคำร้องผ่านระบบออนไลน์เรียบร้อย รอหัวหน้าภาควิชาพิจารณา',
    };
    setSubmissions((prev) => [newSub, ...prev]);
    setIsPreviewOpen(false);
    setTestFormData({});
    showToast('ทดลองยื่นแบบฟอร์มสำเร็จ ข้อมูลถูกส่งเข้าสู่ระบบคำร้อง Submissions', 'success');
  };

  // Add Approval Step
  const handleAddApprovalStep = () => {
    if (!editingForm) return;
    const nextStepNo = editingForm.approvalWorkflow.length + 1;
    const newStep: ApprovalStep = {
      stepNo: nextStepNo,
      approverRole: `ผู้มีอำนาจอนุมัติ ขั้นที่ ${nextStepNo}`,
      approverUnit: 'หน่วยงานพิจารณา',
      autoNotifyEmail: true,
      requiredSignature: true,
    };
    const updatedForm = {
      ...editingForm,
      approvalWorkflow: [...editingForm.approvalWorkflow, newStep],
    };
    setEditingForm(updatedForm);
    setForms((prev) => prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)));
    showToast('เพิ่มขั้นตอนสายการอนุมัติแล้ว', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#B83B6F] to-[#942854] flex items-center justify-center text-white shadow-xs shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  ระบบบริหารและออกแบบแบบฟอร์มออนไลน์กลาง (Online Form Engine)
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBE7EF] text-[#B83B6F] border border-[#F5C2D6]">
                  Form Builder & Approval Workflow
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                สร้างแบบฟอร์มกลาง กำหนดลำดับฟิลด์ (Reorder) การตรวจสอบความถูกต้อง (Validation) กำหนดสิทธิ์ (Permission) และสายการอนุมัติ (Approval Workflow)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="btn-create-new-form"
              variant="primary"
              size="sm"
              onClick={handleCreateNewForm}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              สร้างแบบฟอร์มใหม่
            </Button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            id="tab-form-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            รายการแบบฟอร์มกลาง ({forms.length})
          </button>

          <button
            id="tab-form-builder"
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'builder'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            Form Builder Visual Editor
          </button>

          <button
            id="tab-form-submissions"
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'bg-[#B83B6F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            รายการคำร้องที่ยื่นเข้ามา ({submissions.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: FORM CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="form-search-input"
                type="text"
                placeholder="ค้นหาชื่อแบบฟอร์ม, รหัส, วัตถุประสงค์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                id="form-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700"
              >
                <option value="all">ทุกสถานะแบบฟอร์ม</option>
                <option value="published">เผยแพร่แล้ว (Published)</option>
                <option value="draft">ฉบับร่าง (Draft)</option>
                <option value="closed">ปิดรับคำร้อง (Closed)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredForms.map((form) => {
              const isPublished = form.status === 'published';
              const isClosed = form.status === 'closed';

              return (
                <div
                  key={form.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#B83B6F] bg-[#FBE7EF] px-2 py-0.5 rounded">
                          {form.code}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {form.categoryLabelTh}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                        {form.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {form.description}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isClosed
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isPublished ? 'เปิดใช้งาน' : isClosed ? 'ปิดรับ' : 'ฉบับร่าง'}
                    </span>
                  </div>

                  {/* Form Meta details */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[11px]">จำนวนฟิลด์: </span>
                      <span className="font-semibold text-slate-800">{form.fields.length} ฟิลด์</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">สายการอนุมัติ: </span>
                      <span className="font-semibold text-slate-800">{form.approvalWorkflow.length} ลำดับขั้น</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">คำร้องที่ยื่นแล้ว: </span>
                      <span className="font-semibold text-[#B83B6F]">{form.submissionCount} ฉบับ</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">สิทธิ์การกรอก: </span>
                      <span className="font-semibold text-slate-800 truncate block">{form.allowedRoles.join(', ')}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingForm(form);
                        setIsPreviewOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <Eye className="w-3.5 h-3.5" /> ทดลองกรอกฟอร์ม
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingForm(form);
                        setActiveTab('builder');
                      }}
                      className="gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#B83B6F]" />
                      แก้ไขใน Form Builder
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: FORM BUILDER VISUAL EDITOR */}
      {activeTab === 'builder' && (
        !editingForm ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">ยังไม่ได้เลือกแบบฟอร์มที่ต้องการแก้ไข</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              กรุณาเลือกแบบฟอร์มจากแท็บ &quot;คลังแบบฟอร์ม&quot; หรือคลิกสร้างแบบฟอร์มใหม่เพื่อออกแบบ
            </p>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={handleCreateNewForm}>
                สร้างแบบฟอร์มใหม่
              </Button>
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Top Form Header Editor */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#B83B6F] bg-[#FBE7EF] px-2 py-1 rounded">
                  {editingForm.code}
                </span>
                <input
                  type="text"
                  value={editingForm.title}
                  onChange={(e) => {
                    const u = { ...editingForm, title: e.target.value };
                    setEditingForm(u);
                    setForms((prev) => prev.map((f) => (f.id === u.id ? u : f)));
                  }}
                  className="font-bold text-slate-900 text-base border-b border-dashed border-slate-300 focus:border-[#B83B6F] focus:outline-hidden px-1"
                />
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> Live Preview
                </Button>

                {editingForm.status === 'published' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFormStatus('closed')}
                    className="gap-1.5 text-xs text-amber-700 hover:bg-amber-50 border-amber-300"
                  >
                    ปิดรับคำร้อง (Close)
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleToggleFormStatus('published')}
                    className="gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> เผยแพร่ฟอร์ม (Publish)
                  </Button>
                )}
              </div>
            </div>

            {/* Form Description & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบายและวัตถุประสงค์ของแบบฟอร์ม</label>
                <textarea
                  value={editingForm.description}
                  onChange={(e) => {
                    const u = { ...editingForm, description: e.target.value };
                    setEditingForm(u);
                    setForms((prev) => prev.map((f) => (f.id === u.id ? u : f)));
                  }}
                  rows={2}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">สิทธิ์ผู้ใช้งานที่อนุญาตให้กรอก (Permission)</label>
                <div className="space-y-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                  {['อาจารย์ประจำ', 'อาจารย์พิเศษ', 'หัวหน้าภาควิชา', 'นักวิชาการศึกษา', 'เจ้าหน้าที่'].map((role) => (
                    <label key={role} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingForm.allowedRoles.includes(role)}
                        onChange={(e) => {
                          const updatedRoles = e.target.checked
                            ? [...editingForm.allowedRoles, role]
                            : editingForm.allowedRoles.filter((r) => r !== role);
                          const u = { ...editingForm, allowedRoles: updatedRoles };
                          setEditingForm(u);
                          setForms((prev) => prev.map((f) => (f.id === u.id ? u : f)));
                        }}
                        className="rounded border-slate-300 text-[#B83B6F] focus:ring-[#B83B6F]"
                      />
                      <span className="text-slate-700 text-[11px]">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Canvas (Reorder, Required, Validation, Edit, Delete) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  โครงสร้างฟิลด์ในแบบฟอร์ม (Form Fields Canvas)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  จัดลำดับฟิลด์ (Reorder) กำหนดเงื่อนไขบังคับ (Required) และประเภทการตรวจสอบข้อมูล (Validation)
                </p>
              </div>

              <Button
                id="btn-add-field-modal"
                variant="primary"
                size="sm"
                onClick={handleOpenAddField}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มฟิลด์ใหม่
              </Button>
            </div>

            {/* Fields List */}
            <div className="space-y-2.5">
              {editingForm.fields.map((field, idx) => {
                const typeIcon =
                  field.type === 'text' ? (
                    <FileText className="w-4 h-4 text-blue-500" />
                  ) : field.type === 'textarea' ? (
                    <FileText className="w-4 h-4 text-indigo-500" />
                  ) : field.type === 'number' ? (
                    <Hash className="w-4 h-4 text-emerald-500" />
                  ) : field.type === 'date' ? (
                    <Calendar className="w-4 h-4 text-orange-500" />
                  ) : field.type === 'dropdown' ? (
                    <List className="w-4 h-4 text-purple-500" />
                  ) : field.type === 'file_upload' ? (
                    <UploadCloud className="w-4 h-4 text-rose-500" />
                  ) : field.type === 'signature_placeholder' ? (
                    <PenTool className="w-4 h-4 text-teal-600" />
                  ) : (
                    <CheckSquare className="w-4 h-4 text-amber-500" />
                  );

                return (
                  <div
                    key={field.id}
                    className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-[#B83B6F]/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1 text-slate-400">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveField(field.id, 'up')}
                          className="hover:text-slate-800 disabled:opacity-20 p-0.5"
                          title="ย้ายขึ้น"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === editingForm.fields.length - 1}
                          onClick={() => handleMoveField(field.id, 'down')}
                          className="hover:text-slate-800 disabled:opacity-20 p-0.5"
                          title="ย้ายลง"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono text-xs flex items-center justify-center font-bold">
                        {field.order}
                      </span>

                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        {typeIcon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {field.label}
                          </h4>
                          {field.validation.required && (
                            <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.2 rounded">
                              Required *
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ประเภท: <span className="font-mono text-slate-700 font-semibold">{field.type}</span>
                          {field.placeholder && ` • Placeholder: "${field.placeholder}"`}
                          {field.options && ` • (${field.options.length} ตัวเลือก)`}
                        </p>
                      </div>
                    </div>

                    {/* Field Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditField(field)}
                        className="p-1.5 text-slate-500 hover:text-[#B83B6F] hover:bg-[#FBE7EF] rounded-md transition-colors"
                        title="แก้ไขฟิลด์"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="ลบฟิลด์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Approval Workflow Builder */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  สายการอนุมัติแบบฟอร์ม (Approval Workflow)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  กำหนดลำดับผู้มีอำนาจพิจารณาอนุมัติคำร้องตามระเบียบมหาวิทยาลัย
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddApprovalStep}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มขั้นตอนอนุมัติ
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {editingForm.approvalWorkflow.map((step, idx) => (
                <React.Fragment key={step.stepNo}>
                  <div className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#B83B6F] bg-[#FBE7EF] px-2 py-0.5 rounded">
                        ขั้นที่ {step.stepNo}
                      </span>
                      {step.requiredSignature && (
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-medium">
                          ต้องลงนามดิจิทัล
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-xs mt-1">{step.approverRole}</p>
                    <p className="text-[11px] text-slate-500">{step.approverUnit}</p>
                  </div>

                  {idx < editingForm.approvalWorkflow.length - 1 && (
                    <div className="hidden sm:flex items-center justify-center text-slate-300">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        )
      )}

      {/* VIEW 3: SUBMISSIONS TRACKER */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              รายการคำร้องและสถานะการพิจารณาอนุมัติ (Form Submissions Ledger)
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              คำร้องทั้งหมด {submissions.length} ฉบับ
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-3 w-36">เลขที่คำร้อง</th>
                    <th className="py-3 px-3">ชื่อแบบฟอร์ม / เรื่องที่ยื่น</th>
                    <th className="py-3 px-3 w-48">ผู้ยื่นคำร้อง</th>
                    <th className="py-3 px-3 w-32">วันที่ยื่น</th>
                    <th className="py-3 px-3 w-36 text-center">ขั้นตอนอนุมัติ</th>
                    <th className="py-3 px-3 w-32 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {sub.submissionNo}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{sub.formTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">{sub.reviewNotes}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{sub.submitterName}</p>
                        <p className="text-[11px] text-slate-500">{sub.submitterRole}</p>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {sub.submissionDate}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          ลำดับที่ {sub.currentStepIndex}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sub.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> อนุมัติแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> อยู่ในสายอนุมัติ
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

      {/* MODAL: ADD / EDIT FIELD DEFINITION */}
      <Modal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        title={editingField ? 'แก้ไขฟิลด์ในแบบฟอร์ม' : 'เพิ่มฟิลด์ใหม่ (Add Form Field)'}
        size="md"
      >
        <form onSubmit={handleSaveField} className="space-y-4">
          <Input
            label="ชื่อฟิลด์ / คำถาม (Field Label) *"
            value={newFieldData.label}
            onChange={(e) => setNewFieldData({ ...newFieldData, label: e.target.value })}
            placeholder="เช่น รหัสรายวิชา หรือ เหตุผลความจำเป็น"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="ประเภทข้อมูล (Field Type) *"
              value={newFieldData.type}
              onChange={(e) => setNewFieldData({ ...newFieldData, type: e.target.value as FormFieldType })}
              options={[
                { value: 'text', label: 'ข้อความสั้น (Text)' },
                { value: 'textarea', label: 'ข้อความยาว (Textarea)' },
                { value: 'number', label: 'ตัวเลข (Number)' },
                { value: 'date', label: 'วันที่ (Date)' },
                { value: 'dropdown', label: 'รายการตัวเลือกเดี่ยว (Dropdown)' },
                { value: 'radio', label: 'ปุ่มเลือกเดี่ยว (Radio)' },
                { value: 'checkbox', label: 'เลือกได้หลายข้อ (Checkbox)' },
                { value: 'file_upload', label: 'อัปโหลดไฟล์ (File Upload)' },
                { value: 'signature_placeholder', label: 'จุดลงลายมือชื่อ (Signature)' },
              ]}
            />

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFieldData.required}
                  onChange={(e) => setNewFieldData({ ...newFieldData, required: e.target.checked })}
                  className="rounded border-slate-300 text-[#B83B6F] focus:ring-[#B83B6F]"
                />
                บังคับกรอก (Required *)
              </label>
            </div>
          </div>

          <Input
            label="ข้อความตัวอย่าง (Placeholder)"
            value={newFieldData.placeholder}
            onChange={(e) => setNewFieldData({ ...newFieldData, placeholder: e.target.value })}
            placeholder="เช่น 000 101 พระพุทธศาสนากับสังคม..."
          />

          <Input
            label="ข้อความช่วยเหลือ / คำแนะนำ (Help Text)"
            value={newFieldData.helpText}
            onChange={(e) => setNewFieldData({ ...newFieldData, helpText: e.target.value })}
            placeholder="เช่น อัปโหลดไฟล์ PDF ขนาดไม่เกิน 15 MB"
          />

          {/* Options for dropdown, radio, checkbox */}
          {['dropdown', 'radio', 'checkbox'].includes(newFieldData.type) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตัวเลือก (1 ตัวเลือกต่อ 1 บรรทัด)
              </label>
              <textarea
                value={newFieldData.optionsStr}
                onChange={(e) => setNewFieldData({ ...newFieldData, optionsStr: e.target.value })}
                rows={3}
                placeholder="ตัวเลือกที่ 1&#10;ตัวเลือกที่ 2&#10;ตัวเลือกที่ 3"
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20 font-mono"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsFieldModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit">
              บันทึกฟิลด์
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: LIVE PREVIEW & TEST SUBMIT */}
      <Modal
        isOpen={isPreviewOpen && !!editingForm}
        onClose={() => setIsPreviewOpen(false)}
        title={`ทดลองกรอกแบบฟอร์ม: ${editingForm?.title || ''}`}
        size="lg"
      >
        {editingForm && (
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="bg-[#FBE7EF]/40 p-3 rounded-lg border border-[#F5C2D6] text-xs">
              <span className="font-mono text-[10px] font-bold text-[#B83B6F] bg-white px-2 py-0.5 rounded border border-[#F5C2D6]">
                {editingForm.code}
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{editingForm.title}</h3>
              <p className="text-slate-600 mt-0.5">{editingForm.description}</p>
            </div>

          <div className="space-y-3.5">
            {editingForm.fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="block text-xs font-semibold text-slate-800">
                  {field.label} {field.validation.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    required={field.validation.required}
                    placeholder={field.placeholder}
                    value={testFormData[field.id] || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    rows={3}
                    required={field.validation.required}
                    placeholder={field.placeholder}
                    value={testFormData[field.id] || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    required={field.validation.required}
                    placeholder={field.placeholder}
                    value={testFormData[field.id] || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
                  />
                )}

                {field.type === 'date' && (
                  <input
                    type="date"
                    required={field.validation.required}
                    value={testFormData[field.id] || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
                  />
                )}

                {field.type === 'dropdown' && (
                  <select
                    required={field.validation.required}
                    value={testFormData[field.id] || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20 bg-white"
                  >
                    <option value="">-- กรุณาเลือก --</option>
                    {field.options?.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && (
                  <div className="space-y-1.5 pt-1">
                    {field.options?.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          checked={testFormData[field.id] === opt}
                          onChange={(e) => setTestFormData({ ...testFormData, [field.id]: e.target.value })}
                          className="text-[#B83B6F] focus:ring-[#B83B6F]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'checkbox' && (
                  <div className="space-y-1.5 pt-1">
                    {field.options?.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          value={opt}
                          onChange={(e) => {
                            const current = testFormData[field.id] || [];
                            const updated = e.target.checked
                              ? [...current, opt]
                              : current.filter((x: string) => x !== opt);
                            setTestFormData({ ...testFormData, [field.id]: updated });
                          }}
                          className="rounded text-[#B83B6F] focus:ring-[#B83B6F]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'file_upload' && (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
                    <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs text-slate-600 font-medium">คลิกเพื่อจำลองแนบไฟล์</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">รองรับ PDF, DOCX, XLSX, รูปภาพ</p>
                  </div>
                )}

                {field.type === 'signature_placeholder' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <PenTool className="w-4 h-4 text-teal-600" />
                      <span>จุดลงลายมือชื่อดิจิทัลรับรอง (Digital Signature)</span>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      รับรองอัตลักษณ์พร้อมวันเวลา
                    </span>
                  </div>
                )}

                {field.helpText && (
                  <p className="text-[11px] text-slate-400 italic">{field.helpText}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsPreviewOpen(false)}>
              ปิดหน้าต่างทดสอบ
            </Button>
            <Button variant="primary" type="submit" className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> ทดลองส่งคำร้อง
            </Button>
          </div>
        </form>
        )}
      </Modal>
    </div>
  );
};
