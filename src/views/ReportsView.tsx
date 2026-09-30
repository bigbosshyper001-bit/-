import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Award,
  Users,
  Target,
  DollarSign,
  AlertTriangle,
  ClipboardList,
  Building2,
  Edit3,
  Eye,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { reportDataService } from '../services/reportDataService.ts';
import { exportService } from '../services/exportService.ts';
import { documentTemplateRenderer } from '../services/documentTemplateRenderer.ts';
import {
  OFFICIAL_GOV_TEMPLATES,
  type ReportDefinition,
} from '../data/reportTemplatesData.ts';
import type { OfficialDocTemplate, ExportFormat } from '../types/architecture.ts';

interface ReportsViewProps {
  currentUser?: { id: string; name: string; role: string };
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentUser }) => {
  const [activeMainTab, setActiveMainTab] = useState<'system_reports' | 'gov_templates' | 'export_history'>('system_reports');

  // Reports state
  const reportDefinitions = useMemo(() => reportDataService.getReportDefinitions(), []);
  const [selectedReportId, setSelectedReportId] = useState<string>('rep-meetings');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('all');
  const [reportSearchQuery, setReportSearchQuery] = useState<string>('');
  const [reportData, setReportData] = useState<Record<string, any>[]>([]);

  // Templates state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('gov-tmpl-01');
  const [templateFormValues, setTemplateFormValues] = useState<Record<string, string>>({});
  const [templatePreviewMode, setTemplatePreviewMode] = useState<'split' | 'preview' | 'edit'>('split');
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; success: boolean } | null>(null);

  // Active Report
  const currentReport = useMemo(() => {
    return reportDefinitions.find((r) => r.id === selectedReportId) || reportDefinitions[0];
  }, [reportDefinitions, selectedReportId]);

  // Active Template
  const currentTemplate = useMemo(() => {
    return OFFICIAL_GOV_TEMPLATES.find((t) => t.id === selectedTemplateId) || OFFICIAL_GOV_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Refresh report data when selected report changes
  useEffect(() => {
    if (currentReport) {
      setReportData(currentReport.fetchData());
    }
  }, [currentReport]);

  // Initialize template form values when template changes
  useEffect(() => {
    if (currentTemplate) {
      const initial: Record<string, string> = {};
      currentTemplate.fields.forEach((f) => {
        initial[f.key] = f.defaultValue;
      });
      setTemplateFormValues(initial);
    }
  }, [currentTemplate]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reportDefinitions.filter((rep) => {
      if (reportCategoryFilter !== 'all' && rep.category !== reportCategoryFilter) return false;
      if (!reportSearchQuery) return true;
      const q = reportSearchQuery.toLowerCase();
      return (
        rep.name.toLowerCase().includes(q) ||
        rep.nameEn.toLowerCase().includes(q) ||
        rep.code.toLowerCase().includes(q) ||
        rep.description.toLowerCase().includes(q)
      );
    });
  }, [reportDefinitions, reportCategoryFilter, reportSearchQuery]);

  // Handle Export Report (PDF / Excel / Word)
  const handleExportReport = (format: ExportFormat) => {
    if (!currentReport) return;

    exportService.exportData(
      format,
      {
        filename: `${currentReport.defaultFilename}`,
        title: currentReport.name,
        subject: currentReport.category.toUpperCase(),
        department: currentReport.department,
        columns: currentReport.columns,
        data: reportData,
      },
      currentUser
    );

    setFeedbackToast({
      message: `ส่งออก ${currentReport.name} ในรูปแบบ ${format.toUpperCase()} สำเร็จแล้ว`,
      success: true,
    });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Handle Export Template to Word (.doc)
  const handleExportTemplateWord = () => {
    if (!currentTemplate) return;
    const html = documentTemplateRenderer.renderHtml(currentTemplate, templateFormValues);
    const filename = `${currentTemplate.code}-${new Date().toISOString().split('T')[0]}`;
    exportService.exportDocumentWord(currentTemplate.name, html, filename);

    setFeedbackToast({
      message: `ส่งออกเอกสาร ${currentTemplate.name} ในรูปแบบไฟล์ Word (.doc) พร้อมใช้งานเรียบร้อย`,
      success: true,
    });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Handle Export Template to PDF
  const handleExportTemplatePdf = () => {
    if (!currentTemplate) return;
    const html = documentTemplateRenderer.renderHtml(currentTemplate, templateFormValues);
    exportService.exportDocumentPdf(currentTemplate.name, html);

    setFeedbackToast({
      message: `เปิดหน้าต่างพิมพ์ / บันทึก PDF ของ ${currentTemplate.name} เรียบร้อย`,
      success: true,
    });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Reset Template Form
  const handleResetTemplate = () => {
    if (!currentTemplate) return;
    const initial: Record<string, string> = {};
    currentTemplate.fields.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    setTemplateFormValues(initial);
    setFeedbackToast({
      message: 'รีเซ็ตข้อมูลเอกสารกลับสู่ค่ามาตรฐานเรียบร้อย',
      success: true,
    });
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Helper for report icon
  const getReportCategoryIcon = (category: string) => {
    switch (category) {
      case 'council':
        return <ClipboardList className="w-4 h-4 text-rose-600" />;
      case 'strategy':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'academic':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case 'credit_bank':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'faculty':
        return <Users className="w-4 h-4 text-sky-600" />;
      case 'collaboration':
      default:
        return <Building2 className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#FBE7EF] text-[#B83B6F] text-xs font-semibold">
              <FileText className="w-4 h-4 text-[#D94F87]" />
              <span>Official Academic Reporting & Document Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ศูนย์รายงานสารสนเทศวิชาการและเทมเพลตเอกสารราชการ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              สร้างรายงานมาตรฐานมหาวิทยาลัย 11 หมวดหมู่ (การประชุม, ทะเบียนมติ, KPI, Action Plan, งบประมาณ, ความเสี่ยง, หลักสูตร, Credit Bank, บุคลากร, MOU, สถานะงาน) 
              พร้อมส่งออกเป็น <strong>PDF / Excel / Word</strong> และ <strong>เทมเพลตเอกสารราชการมาตรฐานตามระเบียบงานสารบรรณที่แก้ไขได้</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMainTab('system_reports')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-2xs ${
                activeMainTab === 'system_reports'
                  ? 'bg-[#D94F87] text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>รายงานระบบวิชาการ (11 รายงาน)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('gov_templates')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-2xs ${
                activeMainTab === 'gov_templates'
                  ? 'bg-[#D94F87] text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>เทมเพลตเอกสารราชการแก้ไขได้ (6 แบบ)</span>
            </button>
          </div>
        </div>

        {/* Global Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">รายงานสารสนเทศ</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">11</span>
              <span className="text-xs text-slate-400">ระบบงานหลัก</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">ฟอร์มเอกสารราชการ</span>
              <FileText className="w-4 h-4 text-[#D94F87]" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#B83B6F]">6</span>
              <span className="text-xs text-slate-400">เทมเพลต (ตราครุฑ)</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">รูปแบบการส่งออก</span>
              <Download className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-700">PDF / Excel / Word</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAFAFC] rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">มาตรฐานงานสารบรรณ</span>
              <ShieldCheck className="w-4 h-4 text-sky-500" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-800">TH Sarabun New</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Toast */}
      {feedbackToast && (
        <div
          className={`px-4 py-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
            feedbackToast.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN TAB 1: SYSTEM REPORTS (11 REPORTS) */}
      {activeMainTab === 'system_reports' && (
        <div className="space-y-6">
          {/* Filter & Select Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อรายงาน, รหัส..."
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D94F87]"
                />
              </div>

              <select
                value={reportCategoryFilter}
                onChange={(e) => setReportCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">ทุกหมวดหมู่รายงาน (11 รายงาน)</option>
                <option value="council">สภาวิชาการ & มติ & ภารกิจ</option>
                <option value="strategy">ยุทธศาสตร์ & แผนงาน & KPI & งบประมาณ</option>
                <option value="academic">หลักสูตร & CHECO</option>
                <option value="credit_bank">ธนาคารหน่วยกิต (Credit Bank)</option>
                <option value="faculty">อาจารย์ & บุคลากร (Thailand PSF)</option>
                <option value="collaboration">ความร่วมมือ & MOU</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              แสดง {filteredReports.length} จาก 11 รายงาน
            </div>
          </div>

          {/* Report Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
            {filteredReports.map((rep) => {
              const isSelected = rep.id === selectedReportId;
              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FBE7EF]/40 border-[#D94F87] shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rep.code}
                      </span>
                      {getReportCategoryIcon(rep.category)}
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                      {rep.name.split('(')[0]}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {rep.nameEn.slice(0, 20)}...
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Report Viewer & Action Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            {/* Report Header & Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {currentReport.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentReport.department}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{currentReport.name}</h2>
                <p className="text-xs text-slate-500 max-w-2xl">{currentReport.description}</p>
              </div>

              {/* 3 Export Buttons: PDF / Excel / Word */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExportReport('word')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export Word (.doc)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportReport('excel')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Excel (.xls)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportReport('pdf')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#D94F87] hover:bg-[#B83B6F] rounded-xl transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ / Export PDF</span>
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>ตารางแสดงผลข้อมูลรายงาน ({reportData.length} รายการ)</span>
                <span>วันที่ออกรายงาน: {new Date().toLocaleDateString('th-TH')}</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFC] border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">ลำดับ</th>
                      {currentReport.columns.map((col) => (
                        <th key={col.key} className="py-2.5 px-3">
                          {col.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        {currentReport.columns.map((col) => (
                          <td key={col.key} className="py-2.5 px-3 text-slate-700">
                            {row[col.key] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TAB 2: EDITABLE OFFICIAL GOVERNMENT TEMPLATES (6 TEMPLATES) */}
      {activeMainTab === 'gov_templates' && (
        <div className="space-y-6">
          {/* Template Selector Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#D94F87]" />
                  <span>เลือกแบบฟอร์มเอกสารราชการที่ต้องการแก้ไขและจัดทำ</span>
                </h3>
                <p className="text-xs text-slate-500">
                  เทมเพลตมาตรฐานตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พร้อมตราครุฑและโครงสร้างถูกต้องตามกฎหมาย
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTemplatePreviewMode('split')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    templatePreviewMode === 'split' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  แก้ไข & ดูตัวอย่าง (Split)
                </button>
                <button
                  type="button"
                  onClick={() => setTemplatePreviewMode('preview')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    templatePreviewMode === 'preview' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  ดูตัวอย่างเอกสาร (Preview)
                </button>
                <button
                  type="button"
                  onClick={() => setTemplatePreviewMode('edit')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    templatePreviewMode === 'edit' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  เฉพาะแบบฟอร์มแก้ไข (Edit)
                </button>
              </div>
            </div>

            {/* Template Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
              {OFFICIAL_GOV_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#D94F87] bg-[#FBE7EF]/40 text-[#B83B6F] font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono block text-slate-400">{tmpl.code}</span>
                    <span className="text-xs line-clamp-1 mt-0.5">{tmpl.name.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Editor & Preview Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Form (if split or edit mode) */}
            {(templatePreviewMode === 'split' || templatePreviewMode === 'edit') && (
              <div
                className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 ${
                  templatePreviewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-slate-500">{currentTemplate.code}</span>
                    <h3 className="text-sm font-bold text-slate-900">{currentTemplate.name}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>รีเซ็ตค่า</span>
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
                  {currentTemplate.fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={templateFormValues[field.key] || ''}
                          onChange={(e) =>
                            setTemplateFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D94F87]"
                        />
                      ) : (
                        <input
                          type="text"
                          value={templateFormValues[field.key] || ''}
                          onChange={(e) =>
                            setTemplateFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D94F87]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Right: Live Official Document Preview (if split or preview mode) */}
            {(templatePreviewMode === 'split' || templatePreviewMode === 'preview') && (
              <div
                className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 ${
                  templatePreviewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'
                }`}
              >
                {/* Preview Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-800">
                      ตัวอย่างเอกสารราชการจริง (Live Preview)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportTemplateWord}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>ดาวน์โหลด Word (.doc)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportTemplatePdf}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#D94F87] hover:bg-[#B83B6F] rounded-lg transition-colors shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์ / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Printable Document Paper Simulation */}
                <div className="bg-slate-100/70 p-4 sm:p-6 rounded-xl overflow-x-auto">
                  <div
                    className="bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-slate-200 max-w-[800px] mx-auto min-h-[750px]"
                    dangerouslySetInnerHTML={{
                      __html: documentTemplateRenderer.renderHtml(currentTemplate, templateFormValues),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
