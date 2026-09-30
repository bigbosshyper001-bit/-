import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  Download,
  Database,
  History,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  Check,
  Trash2,
  Undo2,
  Eye,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  dataImportService,
  DATASET_SCHEMAS,
  type TargetDatasetType,
  type SupportedImportFormat,
  type DatasetSchema,
  type ValidationResult,
  type ImportHistoryRecord,
} from '../../services/dataImportService.ts';
import type { UserProfile } from '../../types.ts';

interface DataImportWizardProps {
  currentUser?: UserProfile | null;
  onImportComplete?: (datasetType: TargetDatasetType, count: number) => void;
}

export const DataImportWizard: React.FC<DataImportWizardProps> = ({
  currentUser,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'wizard' | 'history'>('wizard');

  // Wizard Step State (1: Upload, 2: Mapping, 3: Validation & Preview, 4: Complete)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Upload state
  const [selectedDataset, setSelectedDataset] = useState<TargetDatasetType>('faculty');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<SupportedImportFormat>('xlsx');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Mapping state
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Step 3: Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'overwrite'>('skip');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'error' | 'duplicate' | 'valid'>('all');
  const [previewSearch, setPreviewSearch] = useState('');

  // Step 4: Import execution
  const [isImporting, setIsImporting] = useState(false);
  const [lastImportHistory, setLastImportHistory] = useState<ImportHistoryRecord | null>(null);

  // History state
  const [historyList, setHistoryList] = useState<ImportHistoryRecord[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState<ImportHistoryRecord | null>(null);
  const [rollbackSuccessMsg, setRollbackSuccessMsg] = useState<string | null>(null);

  // Active Schema
  const activeSchema: DatasetSchema = useMemo(() => {
    return DATASET_SCHEMAS[selectedDataset];
  }, [selectedDataset]);

  // Load history on mount or tab change
  useEffect(() => {
    setHistoryList(dataImportService.getHistory());
  }, [activeTab]);

  // Handle File Selection & Parse
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setUploadedFile(file);
    setIsParsing(true);
    setParseError(null);

    try {
      const parsed = await dataImportService.parseFile(file);
      setRawHeaders(parsed.headers);
      setRawRows(parsed.rows);
      setDetectedFormat(parsed.format);

      // Auto-suggest column mapping
      const suggested = dataImportService.autoSuggestMapping(parsed.headers, activeSchema);
      setColumnMapping(suggested);

      // Advance to Step 2
      setCurrentStep(2);
    } catch (err: any) {
      setParseError(err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
      setUploadedFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  // Re-run auto mapping when dataset or schema changes
  useEffect(() => {
    if (rawHeaders.length > 0) {
      const suggested = dataImportService.autoSuggestMapping(rawHeaders, activeSchema);
      setColumnMapping(suggested);
    }
  }, [selectedDataset, activeSchema, rawHeaders]);

  // Check if mapping satisfies required columns
  const unmappedRequiredFields = useMemo(() => {
    return activeSchema.fields.filter((f) => f.required && !columnMapping[f.key]);
  }, [activeSchema, columnMapping]);

  // Advance from Step 2 to Step 3: Run Validation
  const handleProceedToValidation = () => {
    if (unmappedRequiredFields.length > 0) {
      alert(`กรุณาจับคู่คอลัมน์จำเป็นให้ครบถ้วน: ${unmappedRequiredFields.map((f) => f.labelTh).join(', ')}`);
      return;
    }

    setIsValidating(true);
    try {
      const result = dataImportService.validateRows(rawRows, activeSchema, columnMapping);
      setValidationResult(result);
      setCurrentStep(3);
    } finally {
      setIsValidating(false);
    }
  };

  // Step 3 -> Step 4: Execute Batch Commit
  const handleExecuteImport = () => {
    if (!validationResult || !uploadedFile) return;

    setIsImporting(true);

    // Filter valid rows (or rows without fatal errors)
    const validRowsToCommit = validationResult.processedRows
      .filter((r) => r.status === 'valid' || r.status === 'warning')
      .map((r) => r.normalized);

    const operator = currentUser?.name || 'เจ้าหน้าที่วิชาการ มจร';

    try {
      const record = dataImportService.commitImport(
        selectedDataset,
        validRowsToCommit,
        duplicateAction,
        operator,
        uploadedFile.name,
        uploadedFile.size,
        detectedFormat
      );

      setLastImportHistory(record);
      setHistoryList(dataImportService.getHistory());
      setCurrentStep(4);

      if (onImportComplete) {
        onImportComplete(selectedDataset, record.successCount);
      }
    } catch (err: any) {
      alert(`การนำเข้าข้อมูลล้มเหลว: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Reset Wizard
  const handleResetWizard = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setRawHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setValidationResult(null);
    setLastImportHistory(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Rollback
  const handleRollback = (recordId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิก (Rollback) การนำเข้าชุดข้อมูลนี้? ข้อมูลที่ถูกสร้างในชุดนี้จะถูกลบออกจากระบบ')) {
      return;
    }

    const operator = currentUser?.name || 'เจ้าหน้าที่วิชาการ';
    const success = dataImportService.rollbackImport(recordId, operator);
    if (success) {
      setHistoryList(dataImportService.getHistory());
      setRollbackSuccessMsg('ทำการยกเลิก (Rollback) การนำเข้าข้อมูลเดิมเรียบร้อยแล้ว');
      setTimeout(() => setRollbackSuccessMsg(null), 4000);
    }
  };

  // Filtered rows in Step 3 Preview
  const filteredPreviewRows = useMemo(() => {
    if (!validationResult) return [];
    return validationResult.processedRows.filter((r) => {
      if (previewFilter === 'error' && r.status !== 'error') return false;
      if (previewFilter === 'duplicate' && !r.isDuplicate) return false;
      if (previewFilter === 'valid' && r.status === 'error') return false;

      if (!previewSearch) return true;
      const q = previewSearch.toLowerCase();
      return Object.values(r.raw).some((val) =>
        String(val).toLowerCase().includes(q)
      );
    });
  }, [validationResult, previewFilter, previewSearch]);

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Legacy Data Onboarding & Batch Ingestion System</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              ระบบนำเข้าข้อมูลเดิมเข้าสู่ระบบ (Data Import Wizard)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              รองรับไฟล์ <strong>Excel (.xlsx, .xls)</strong>, <strong>CSV</strong> และ <strong>JSON</strong> พร้อมระบบตรวจจับและป้องกันข้อผิดพลาดอัตโนมัติ: ป้องกันข้อมูลซ้ำ, คอลัมน์ผิด, รูปแบบวันที่ผิด (พ.ศ./ค.ศ.), และข้อมูลไม่ครบ พร้อมระบบบันทึกประวัติและ Rollback
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('wizard')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs ${
                activeTab === 'wizard'
                  ? 'bg-[#D94F87] text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ตัวช่วยนำเข้าข้อมูล (Wizard)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs ${
                activeTab === 'history'
                  ? 'bg-[#D94F87] text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>ประวัติการนำเข้า (Import History)</span>
            </button>
          </div>
        </div>

        {/* Wizard Step Breadcrumb (Only visible in Wizard Tab) */}
        {activeTab === 'wizard' && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  currentStep === 1
                    ? 'border-[#D94F87] bg-[#FBE7EF]/30 text-[#B83B6F] font-bold'
                    : currentStep > 1
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep > 1 ? 'bg-emerald-600 text-white' : currentStep === 1 ? 'bg-[#D94F87] text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <div className="text-xs">
                  <div className="font-semibold">ขั้นตอนที่ 1</div>
                  <div className="text-[11px] opacity-80">อัปโหลดไฟล์ข้อมูล</div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  currentStep === 2
                    ? 'border-[#D94F87] bg-[#FBE7EF]/30 text-[#B83B6F] font-bold'
                    : currentStep > 2
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep > 2 ? 'bg-emerald-600 text-white' : currentStep === 2 ? 'bg-[#D94F87] text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <div className="text-xs">
                  <div className="font-semibold">ขั้นตอนที่ 2</div>
                  <div className="text-[11px] opacity-80">จับคู่คอลัมน์ (Mapping)</div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  currentStep === 3
                    ? 'border-[#D94F87] bg-[#FBE7EF]/30 text-[#B83B6F] font-bold'
                    : currentStep > 3
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep > 3 ? 'bg-emerald-600 text-white' : currentStep === 3 ? 'bg-[#D94F87] text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
                </div>
                <div className="text-xs">
                  <div className="font-semibold">ขั้นตอนที่ 3</div>
                  <div className="text-[11px] opacity-80">ตรวจข้อมูล & แจ้ง Error</div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  currentStep === 4
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  4
                </div>
                <div className="text-xs">
                  <div className="font-semibold">ขั้นตอนที่ 4</div>
                  <div className="text-[11px] opacity-80">ยืนยันและนำเข้าสำเร็จ</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Rollback Message */}
      {rollbackSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{rollbackSuccessMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: WIZARD FLOW */}
      {/* ============================================================== */}
      {activeTab === 'wizard' && (
        <div className="space-y-6">
          {/* ------------------------------------------------------------ */}
          {/* STEP 1: SELECT DATASET & UPLOAD FILE */}
          {/* ------------------------------------------------------------ */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              {/* Select Target Dataset */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  1. เลือกกลุ่มข้อมูลปลายทางที่ต้องการนำเข้า (Target Dataset)
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(DATASET_SCHEMAS) as TargetDatasetType[]).map((type) => {
                    const schema = DATASET_SCHEMAS[type];
                    const isSelected = selectedDataset === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedDataset(type)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#D94F87] bg-[#FBE7EF]/30 text-[#B83B6F] shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold leading-snug">{schema.titleTh}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{schema.titleEn}</div>
                        <div className="mt-2 text-[10px] inline-flex items-center gap-1 font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          <span>คีย์หลัก:</span>
                          <span className="font-semibold text-slate-700">{schema.primaryKey}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Download Sample Templates Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-[#D94F87]" />
                    <span>ดาวน์โหลดแม่แบบไฟล์เปล่าสำหรับกรอกข้อมูล (Sample Template)</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    หัวตารางตรงตามมาตรฐานระบบ พร้อมตัวอย่างข้อมูลประกอบ ช่วยให้การจับคู่คอลัมน์ถูกต้อง 100%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => dataImportService.downloadSampleTemplate(selectedDataset, 'xlsx')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => dataImportService.downloadSampleTemplate(selectedDataset, 'csv')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>CSV (.csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => dataImportService.downloadSampleTemplate(selectedDataset, 'json')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 shadow-2xs"
                  >
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>JSON (.json)</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  2. เลือกหรือลากวางไฟล์ที่ต้องการนำเข้า (รองรับ Excel, CSV, JSON)
                </label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#D94F87] rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-[#FBE7EF]/10 transition-all cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FBE7EF] text-[#D94F87] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                    <Upload className="w-6 h-6" />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-800">
                    คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์มาวางที่นี่
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    รองรับไฟล์ Microsoft Excel (.xlsx, .xls), Comma-Separated Values (.csv), และ JSON (.json)
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">.xlsx</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">.xls</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">.csv</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">.json</span>
                  </div>
                </div>

                {parseError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 2: COLUMN MAPPING */}
          {/* ------------------------------------------------------------ */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {detectedFormat.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ไฟล์: {uploadedFile?.name} ({rawRows.length} แถวข้อมูล)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    กำหนดการจับคู่คอลัมน์ (Column Mapping) สู่ {activeSchema.titleTh}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ระบบวิเคราะห์และจับคู่คอลัมน์อัตโนมัติให้แล้ว หากมีคอลัมน์ใดไม่ถูกต้อง สามารถปรับเปลี่ยนได้ด้านล่าง
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>เลือกไฟล์ใหม่</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToValidation}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#D94F87] hover:bg-[#B83B6F] rounded-xl transition-colors shadow-2xs"
                  >
                    <span>ตรวจสอบข้อมูล (Next)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {unmappedRequiredFields.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    มีคอลัมน์จำเป็นที่ยังไม่ได้จับคู่: {unmappedRequiredFields.map((f) => f.labelTh).join(', ')} กรุณาเลือกคอลัมน์ในไฟล์ที่ตรงกัน
                  </span>
                </div>
              )}

              {/* Mapping Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFC] border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-48">ฟิลด์ระบบ (Target Field)</th>
                      <th className="py-2.5 px-3 w-28">ประเภทข้อมูล</th>
                      <th className="py-2.5 px-3 w-24 text-center">ความจำเป็น</th>
                      <th className="py-2.5 px-3">คอลัมน์ในไฟล์ของคุณ (Source Column)</th>
                      <th className="py-2.5 px-3 w-48">ตัวอย่างข้อมูลจริง</th>
                      <th className="py-2.5 px-3 w-28 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeSchema.fields.map((field) => {
                      const selectedSource = columnMapping[field.key] || '';
                      const sampleVal = selectedSource && rawRows[0] ? rawRows[0][selectedSource] : '-';
                      const isMapped = Boolean(selectedSource);

                      return (
                        <tr key={field.key} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{field.labelTh}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{field.key}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {field.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {field.required ? (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                จำเป็น *
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">ตัวเลือก</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={selectedSource}
                              onChange={(e) =>
                                setColumnMapping((prev) => ({
                                  ...prev,
                                  [field.key]: e.target.value,
                                }))
                              }
                              className={`w-full text-xs py-1.5 px-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D94F87] ${
                                isMapped
                                  ? 'border-emerald-300 bg-emerald-50/30 text-emerald-950 font-medium'
                                  : field.required
                                  ? 'border-amber-300 bg-amber-50/30 text-amber-950'
                                  : 'border-slate-200 bg-slate-50 text-slate-600'
                              }`}
                            >
                              <option value="">-- ไม่ระบุ / ข้ามฟิลด์นี้ --</option>
                              {rawHeaders.map((hdr) => (
                                <option key={hdr} value={hdr}>
                                  {hdr}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] truncate max-w-[200px]">
                            {sampleVal !== undefined && sampleVal !== null ? String(sampleVal) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isMapped ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                <span>จับคู่แล้ว</span>
                              </span>
                            ) : field.required ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                <span>ยังไม่จับคู่</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 3: PREVIEW & ERROR VALIDATION REPORT */}
          {/* ------------------------------------------------------------ */}
          {currentStep === 3 && validationResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              {/* Header & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ผลการตรวจสอบความถูกต้องและระบบป้องกันข้อผิดพลาด</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ตรวจสอบความซ้ำซ้อนของข้อมูล, ความครบถ้วนของคอลัมน์, และความถูกต้องของรูปแบบวันที่และตัวเลข
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>กลับไปแก้ไข Mapping</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={validationResult.validRowsCount === 0 || isImporting}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-2xs"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังนำเข้า...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ยืนยันการนำเข้า ({validationResult.validRowsCount} แถว)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Validation Statistics Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">แถวทั้งหมดในไฟล์</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {validationResult.totalRows}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ข้อมูลถูกต้อง (พร้อมนำเข้า)</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-800 mt-1">
                    {validationResult.validRowsCount}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-xs text-amber-700 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>ข้อมูลซ้ำ (Duplicates)</span>
                  </div>
                  <div className="text-xl font-bold text-amber-800 mt-1">
                    {validationResult.duplicateCount}
                  </div>
                </div>

                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <div className="text-xs text-red-700 font-medium flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>แถวที่มี Error ร้ายแรง</span>
                  </div>
                  <div className="text-xl font-bold text-red-800 mt-1">
                    {validationResult.errorRowsCount}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>ปรับรูปแบบอัตโนมัติ</span>
                  </div>
                  <div className="text-xl font-bold text-blue-800 mt-1">
                    {validationResult.warningRowsCount}
                  </div>
                </div>
              </div>

              {/* Duplicate Handling Policy Config */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">
                    นโยบายจัดการกรณีพบข้อมูลซ้ำ (Duplicate Handling Policy)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    เมื่อพบว่ารหัส (Primary Key) ตรงกับรายการที่มีอยู่ในฐานข้อมูล
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white cursor-pointer text-xs font-medium">
                    <input
                      type="radio"
                      name="dupAction"
                      checked={duplicateAction === 'skip'}
                      onChange={() => setDuplicateAction('skip')}
                      className="text-[#D94F87]"
                    />
                    <span>ข้ามข้อมูลซ้ำ (Skip Duplicates)</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white cursor-pointer text-xs font-medium">
                    <input
                      type="radio"
                      name="dupAction"
                      checked={duplicateAction === 'overwrite'}
                      onChange={() => setDuplicateAction('overwrite')}
                      className="text-[#D94F87]"
                    />
                    <span>อัปเดตทับข้อมูลเดิม (Update / Overwrite)</span>
                  </label>
                </div>
              </div>

              {/* Preview Filter & Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      previewFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ทั้งหมด ({validationResult.totalRows})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('valid')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      previewFilter === 'valid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    ถูกต้อง ({validationResult.validRowsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('duplicate')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      previewFilter === 'duplicate'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    ข้อมูลซ้ำ ({validationResult.duplicateCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('error')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      previewFilter === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    มีข้อผิดพลาด ({validationResult.errorRowsCount})
                  </button>
                </div>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาข้อมูลในตาราง..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D94F87]"
                  />
                </div>
              </div>

              {/* Data Preview Grid with Error Tooltips */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFC] border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 w-16 text-center">แถวที่</th>
                      <th className="py-2 px-3 w-28 text-center">สถานะ</th>
                      {activeSchema.fields.map((f) => (
                        <th key={f.key} className="py-2 px-3 whitespace-nowrap">
                          {f.labelTh}
                        </th>
                      ))}
                      <th className="py-2 px-3 min-w-[200px]">ข้อความแจ้งเตือน / Error Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPreviewRows.map((row) => {
                      const hasErr = row.status === 'error';
                      const hasWarn = row.status === 'warning';
                      const isDup = row.isDuplicate;

                      return (
                        <tr
                          key={row.rowIndex}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            hasErr ? 'bg-red-50/30' : isDup ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500 font-bold">
                            {row.rowIndex}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {hasErr ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" />
                                <span>ไม่ผ่าน</span>
                              </span>
                            ) : isDup ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                <span>ข้อมูลซ้ำ</span>
                              </span>
                            ) : hasWarn ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3" />
                                <span>ปรับแก้แล้ว</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>สมบูรณ์</span>
                              </span>
                            )}
                          </td>

                          {activeSchema.fields.map((f) => {
                            const val = row.normalized[f.key];
                            const fieldError = row.errors.find((e) => e.fieldKey === f.key);
                            return (
                              <td
                                key={f.key}
                                className={`py-2 px-3 whitespace-nowrap text-slate-800 ${
                                  fieldError ? 'bg-red-100/50 font-semibold text-red-900' : ''
                                }`}
                              >
                                {val !== undefined && val !== null && String(val).trim() !== ''
                                  ? String(val)
                                  : '-'}
                              </td>
                            );
                          })}

                          <td className="py-2 px-3">
                            {row.errors.length > 0 ? (
                              <div className="space-y-1">
                                {row.errors.map((err, eIdx) => (
                                  <div
                                    key={eIdx}
                                    className={`text-[11px] leading-tight ${
                                      err.severity === 'error'
                                        ? 'text-red-700 font-semibold'
                                        : 'text-amber-700'
                                    }`}
                                  >
                                    • {err.message}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-600">ผ่านการตรวจสอบ 100%</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 4: IMPORT COMPLETED */}
          {/* ------------------------------------------------------------ */}
          {currentStep === 4 && lastImportHistory && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900">
                  นำเข้าข้อมูลเดิมเข้าสู่ระบบสำเร็จเรียบร้อย!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                  ชุดข้อมูลจากไฟล์ <strong>{lastImportHistory.fileName}</strong> ถูกบันทึกเข้าสู่ฐานข้อมูลกลาง <strong>{lastImportHistory.datasetName}</strong> พร้อมจัดเก็บประวัติและ Audit Trail ครบถ้วน
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500">รหัสการนำเข้า (ID)</div>
                  <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                    {lastImportHistory.id}
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-[11px] text-emerald-700">นำเข้าสำเร็จ</div>
                  <div className="font-bold text-sm text-emerald-800 mt-0.5">
                    {lastImportHistory.successCount} แถว
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-[11px] text-amber-700">ข้ามข้อมูลซ้ำ</div>
                  <div className="font-bold text-sm text-amber-800 mt-0.5">
                    {lastImportHistory.skippedCount} แถว
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500">ผู้นำเข้า</div>
                  <div className="font-bold text-xs text-slate-800 mt-0.5 truncate">
                    {lastImportHistory.importedBy}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleResetWizard}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#D94F87] hover:bg-[#B83B6F] rounded-xl transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>นำเข้าไฟล์อื่นเพิ่มเติม</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>ดูบันทึกประวัติการนำเข้า</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: IMPORT HISTORY & AUDIT TRAIL */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-[#D94F87]" />
                <span>ประวัติการนำเข้าข้อมูลเดิมและสถิติ (Import History & Rollback)</span>
              </h3>
              <p className="text-xs text-slate-500">
                บันทึกการนำเข้าไฟล์ย้อนหลัง ผู้ปฏิบัติงาน จำนวนรายการ และสามารถยกเลิก (Rollback) ข้อมูลในกรณีที่พบข้อผิดพลาด
              </p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อไฟล์, รหัส, ผู้นำเข้า..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D94F87]"
              />
            </div>
          </div>

          {/* History Data Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFC] border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">รหัสการนำเข้า</th>
                  <th className="py-2.5 px-3">วันและเวลา</th>
                  <th className="py-2.5 px-3">ชื่อไฟล์และฟอร์แมต</th>
                  <th className="py-2.5 px-3">กลุ่มข้อมูล (Dataset)</th>
                  <th className="py-2.5 px-3">ผู้นำเข้า</th>
                  <th className="py-2.5 px-3 text-center">สำเร็จ</th>
                  <th className="py-2.5 px-3 text-center">ข้าม/ซ้ำ</th>
                  <th className="py-2.5 px-3 text-center">สถานะ</th>
                  <th className="py-2.5 px-3 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyList
                  .filter((h) => {
                    if (!historySearch) return true;
                    const q = historySearch.toLowerCase();
                    return (
                      h.fileName.toLowerCase().includes(q) ||
                      h.datasetName.toLowerCase().includes(q) ||
                      h.importedBy.toLowerCase().includes(q) ||
                      h.id.toLowerCase().includes(q)
                    );
                  })
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {rec.id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {rec.importedAt}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{rec.fileName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                          <span className="font-mono uppercase bg-slate-100 px-1 rounded text-slate-600">
                            {rec.format}
                          </span>
                          <span>{(rec.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {rec.datasetName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {rec.importedBy}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                        {rec.successCount}
                      </td>
                      <td className="py-2.5 px-3 text-center text-amber-700">
                        {rec.skippedCount}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {rec.status === 'completed' ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            สมบูรณ์
                          </span>
                        ) : rec.status === 'partial' ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            บางส่วน
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                            ยกเลิกแล้ว (Reverted)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryDetail(rec)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {rec.status !== 'reverted' && (
                            <button
                              type="button"
                              onClick={() => handleRollback(rec.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md transition-colors"
                              title="ยกเลิกการนำเข้าและลบข้อมูลชุดนี้"
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>Rollback</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* History Detail Modal */}
          {selectedHistoryDetail && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {selectedHistoryDetail.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      รายละเอียดบันทึกการนำเข้าข้อมูล
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryDetail(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">ไฟล์ต้นฉบับ:</span>
                    <span className="font-semibold">{selectedHistoryDetail.fileName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">กลุ่มข้อมูล:</span>
                    <span className="font-semibold">{selectedHistoryDetail.datasetName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">วันเวลาที่นำเข้า:</span>
                    <span>{selectedHistoryDetail.importedAt}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">ผู้นำเข้า:</span>
                    <span>{selectedHistoryDetail.importedBy}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">จำนวนแถวนำเข้าสำเร็จ:</span>
                    <span className="font-bold text-emerald-700">{selectedHistoryDetail.successCount} รายการ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">จำนวนรายการที่ข้าม (ซ้ำ):</span>
                    <span className="font-bold text-amber-700">{selectedHistoryDetail.skippedCount} รายการ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">สถานะปัจจุบัน:</span>
                    <span className="font-bold">{selectedHistoryDetail.status}</span>
                  </div>
                </div>

                {selectedHistoryDetail.importedItemIds.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-700 block">
                      รหัสรายการที่นำเข้า (Primary Keys):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                      {selectedHistoryDetail.importedItemIds.map((id) => (
                        <span key={id} className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryDetail(null)}
                    className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
