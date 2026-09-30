import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  History,
  Code2,
  Copy,
  Layers,
  ArrowRight,
  Database,
  RefreshCw,
  FileText,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { useToast } from '../ui/Toast.tsx';
import {
  integrationAdapterService,
  type IngestionResult,
  type ExternalAdapterSyncLog,
} from '../../services/integrationAdapterService.ts';

export interface IntegrationAdapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataIngested: (entityType: string, records: any[]) => void;
}

export const IntegrationAdapterModal: React.FC<IntegrationAdapterModalProps> = ({
  isOpen,
  onClose,
  onDataIngested,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'import' | 'history'>('import');
  const [targetEntity, setTargetEntity] = useState<'partner_mou' | 'short_course' | 'pre_degree' | 'credit_bank'>('partner_mou');
  const [inputFormat, setInputFormat] = useState<'csv' | 'json'>('csv');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('manual_input.csv');

  // Ingestion Results
  const [lastResult, setLastResult] = useState<IngestionResult<any> | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<ExternalAdapterSyncLog[]>(integrationAdapterService.getSyncLogs());

  // Sample CSV Templates
  const samplePartnerCSV = `university,country,contact,email,mouNumber,startDate,endDate,status
Chulalongkorn University,Thailand,Office of Registrar,registrar@chula.ac.th,MOU-MCU-2569-CU,2026-06-01,2031-05-31,active
University of Oxford,United Kingdom,Prof. Richard Gombrich,buddhist.studies@ox.ac.uk,MOU-MCU-2569-OXF,2026-09-01,2031-08-31,under_review`;

  const sampleShortCourseCSV = `code,titleTh,titleEn,category,deliveryMode,hours,creditBankEquiv,fee,capacity,enrolled,targetAudience,competencyOutcome,facultyOwner,workflowStatus
SC-MCU-2569-09,พุทธเศรษฐศาสตร์และการจัดการวิสาหกิจชุมชน,Buddhist Economics and Community Enterprise,พุทธนวัตกรรม,hybrid,30,2,1500,40,15,ผู้นำชุมชนและประชาชนทั่วไป,ประยุกต์ใช้หลักสัมมาอาชีวะในการบริหารธุรกิจ,คณะสังคมศาสตร์,active_enrollment`;

  const sampleCreditBankCSV = `id,walletId,studentName,date,sourceType,sourceTitle,courseEquivalenceCode,courseEquivalenceName,credits,gradeOrResult,assessor,status
TX-EXT-9901,CBW-69001-0012,พระมหาสมบูรณ์ ชุตินฺธโร,2026-05-12,short_course,การฝึกปฏิบัติวิปัสสนากรรมฐานเข้มข้น,000 139,พุทธปรัชญาและสมาธิ,3,Pass,กองวิชาการ,approved`;

  const handleLoadSample = () => {
    if (targetEntity === 'partner_mou') setRawText(samplePartnerCSV);
    else if (targetEntity === 'short_course') setRawText(sampleShortCourseCSV);
    else setRawText(sampleCreditBankCSV);
    setInputFormat('csv');
    setFileName('template_data.csv');
    showToast('โหลดข้อมูลแม่แบบเรียบร้อยแล้ว', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isJson = file.name.endsWith('.json');
    setInputFormat(isJson ? 'json' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      showToast(`โหลดไฟล์ ${file.name} เรียบร้อยแล้ว`, 'info');
    };
    reader.readAsText(file);
  };

  const handleParseAndValidate = () => {
    if (!rawText.trim()) {
      showToast('กรุณาระบุข้อมูล CSV หรือ JSON เพื่อตรวจสอบ', 'warning');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      let res: IngestionResult<any>;
      if (inputFormat === 'csv') {
        res = integrationAdapterService.parseCSV(rawText, targetEntity, fileName);
      } else {
        res = integrationAdapterService.parseJSON(rawText, targetEntity, fileName);
      }

      setLastResult(res);
      setSyncLogs(integrationAdapterService.getSyncLogs());
      setIsProcessing(false);

      if (res.validCount > 0) {
        showToast(`ตรวจสอบข้อมูลสำเร็จ: พบข้อมูลสมบูรณ์ ${res.validCount} รายการ`, 'success');
      } else {
        showToast('ไม่พบข้อมูลที่ตรงตามรูปแบบที่กำหนด', 'error');
      }
    }, 400);
  };

  const handleConfirmImport = () => {
    if (!lastResult || lastResult.validCount === 0) return;

    onDataIngested(targetEntity, lastResult.validRecords);
    showToast(`นำเข้าข้อมูล ${lastResult.validCount} รายการเข้าสู่ระบบมหาวิทยาลัยสำเร็จแล้ว`, 'success');
    setLastResult(null);
    setRawText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Integration Adapter Layer (ตัวแปลงและเชื่อมต่อข้อมูลภายนอก)"
      size="xl"
    >
      <div className="space-y-4 text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'import'
                  ? 'bg-pink-50 text-[#B83B6F] font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              นำเข้าข้อมูล (Adapter Ingestion)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-pink-50 text-[#B83B6F] font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ประวัติการ Sync (Audit Logs) ({syncLogs.length})
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Format: CSV / JSON / Excel Export</span>
          </div>
        </div>

        {activeTab === 'import' && (
          <div className="space-y-4">
            {/* Target Entity & Source Format Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  1. เลือกโมดูลปลายทาง (Target Entity) *
                </label>
                <select
                  value={targetEntity}
                  onChange={(e) => {
                    setTargetEntity(e.target.value as any);
                    setLastResult(null);
                  }}
                  className="w-full p-2 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:border-[#D94F87]"
                >
                  <option value="partner_mou">คู่ความร่วมมือและข้อตกลง (Partners & MOU)</option>
                  <option value="short_course">หลักสูตรระยะสั้น (Short Course / Non-degree)</option>
                  <option value="pre_degree">นักเรียนโครงการเรียนล่วงหน้า (Pre-degree)</option>
                  <option value="credit_bank">รายการสะสมคลังหน่วยกิต (Credit Bank Transactions)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  2. รูปแบบไฟล์และรูปแบบการนำเข้า (Format)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={inputFormat}
                    onChange={(e) => setInputFormat(e.target.value as any)}
                    className="p-2 text-xs rounded border border-slate-200 bg-white"
                  >
                    <option value="csv">CSV (Comma-Separated)</option>
                    <option value="json">JSON (Array of Objects)</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSample}
                    className="text-xs border-slate-300 whitespace-nowrap"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    โหลดข้อมูลแม่แบบ
                  </Button>
                </div>
              </div>
            </div>

            {/* File Drag-Drop or Paste Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-700">
                  3. วางข้อมูลข้อความ หรือ อัปโหลดไฟล์ ({fileName})
                </label>
                <label className="cursor-pointer text-[#B83B6F] hover:underline font-semibold flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>เลือกไฟล์จากเครื่อง...</span>
                  <input
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="วางเนื้อหาไฟล์ CSV หรือ JSON ที่นี่ หรือคลิกปุ่มโหลดข้อมูลแม่แบบด้านบน..."
                className="w-full p-3 font-mono text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            {/* Validate Action */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                * ระบบจะทำการตรวจสอบ Type, Required Fields และแปลงเข้าสู่ University Schema
              </span>

              <Button
                variant="primary"
                size="sm"
                onClick={handleParseAndValidate}
                disabled={isProcessing || !rawText.trim()}
                className="bg-[#B83B6F] hover:bg-[#A02F5E] text-white"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-3.5 h-3.5 mr-1.5" />
                    ตรวจสอบและแปลงโครงสร้าง (Validate)
                  </>
                )}
              </Button>
            </div>

            {/* INGESTION PREVIEW & VALIDATION SUMMARY */}
            {lastResult && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">ผลการแปลงและตรวจสอบ:</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      สมบูรณ์ {lastResult.validCount} รายการ
                    </span>
                    {lastResult.errorCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                        พบข้อผิดพลาด {lastResult.errorCount} รายการ
                      </span>
                    )}
                  </div>

                  {lastResult.validCount > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleConfirmImport}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      ยืนยันนำเข้าข้อมูล {lastResult.validCount} รายการ
                    </Button>
                  )}
                </div>

                {/* Validation Errors If Any */}
                {lastResult.errors.length > 0 && (
                  <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-[11px] text-rose-800 space-y-1">
                    <span className="font-bold block">รายละเอียดข้อผิดพลาด:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {lastResult.errors.map((err, i) => (
                        <li key={i}>
                          แถวที่ {err.row}: {err.field} - {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preview Table for Valid Records */}
                {lastResult.validCount > 0 && (
                  <div className="bg-white rounded-lg border border-slate-200 p-2 overflow-x-auto max-h-48 text-[11px]">
                    <div className="font-semibold text-slate-700 mb-1 px-1">ตัวอย่างข้อมูลที่พร้อมนำเข้า:</div>
                    <pre className="p-2 bg-slate-50 rounded text-slate-800 font-mono text-[10px] overflow-auto">
                      {JSON.stringify(lastResult.validRecords.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {syncLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">ยังไม่มีประวัติการซิงก์ข้อมูล</div>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{log.id}</span>
                        <span className="px-2 py-0.2 rounded text-[10px] bg-slate-100 font-semibold text-slate-700 uppercase">
                          {log.sourceType}
                        </span>
                        <span className="font-medium text-slate-900">{log.recordType}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        แหล่งข้อมูล: {log.sourceName} • รายละเอียด: {log.details || log.status}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.successCount} นำเข้าสำเร็จ
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">{log.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
        </div>
      </div>
    </Modal>
  );
};
