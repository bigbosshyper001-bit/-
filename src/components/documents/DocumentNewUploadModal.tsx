import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  X,
  FileText,
  Calendar,
  Layers,
  Link2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import type {
  DocumentClassificationType,
  DmsFileFormat,
} from '../../types/documentManagement.ts';
import { DOCUMENT_CLASSIFICATIONS } from '../../data/dmsClassificationData.ts';

interface DocumentNewUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    documentNo: string;
    docType: DocumentClassificationType;
    department: string;
    fileFormat: DmsFileFormat;
    fileSize: string;
    fileName: string;
    description: string;
    tags: string[];
    effectiveDate?: string;
    expirationDate?: string;
    initialVersion: string;
    initialChangeDescription: string;
  }) => void;
}

export const DocumentNewUploadModal: React.FC<DocumentNewUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [documentNo, setDocumentNo] = useState('');
  const [docType, setDocType] = useState<DocumentClassificationType>('official_letter');
  const [department, setDepartment] = useState('กองวิชาการ สำนักงานอธิการบดี');
  const [fileFormat, setFileFormat] = useState<DmsFileFormat>('pdf');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().substring(0, 10));
  const [expirationDate, setExpirationDate] = useState('');
  const [initialVersion, setInitialVersion] = useState('v1.0');
  const [initialChangeDescription, setInitialChangeDescription] = useState('อัปโหลดเอกสารต้นฉบับเข้าสู่คลังเอกสารกลาง');

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    format: DmsFileFormat;
  } | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'png'];

    if (!ext || !allowed.includes(ext)) {
      setErrorMsg('นามสกุลไฟล์ไม่ถูกต้อง รองรับเฉพาะ PDF, DOCX, XLSX, PPTX, JPG, PNG');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('ขนาดไฟล์เกินกำหนด (สูงสุด 50 MB)');
      return;
    }

    setErrorMsg(null);
    const fmt = (ext === 'doc' ? 'docx' : ext === 'xls' ? 'xlsx' : ext === 'ppt' ? 'pptx' : ext) as DmsFileFormat;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

    setSelectedFile({
      name: file.name,
      size: `${sizeMb} MB`,
      format: fmt,
    });
    setFileFormat(fmt);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('กรุณากรอกชื่อเอกสาร');
      return;
    }

    setUploadProgress(30);
    setTimeout(() => setUploadProgress(70), 150);
    setTimeout(() => {
      setUploadProgress(100);
      onSubmit({
        title,
        documentNo: documentNo || `มจร-กว-2569/${Date.now().toString().slice(-3)}`,
        docType,
        department,
        fileFormat,
        fileSize: selectedFile?.size || '2.8 MB',
        fileName: selectedFile?.name || `${title.replace(/\s+/g, '_')}.${fileFormat}`,
        description,
        tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
        effectiveDate,
        expirationDate: expirationDate || undefined,
        initialVersion: initialVersion || 'v1.0',
        initialChangeDescription,
      });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-linear-to-r from-slate-50 to-white flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#B83B6F]" />
              อัปโหลดเอกสารใหม่เข้าสู่คลังกลาง (New Document Intake)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              จัดเก็บเอกสารทางการ 19 ประเภท รองรับ PDF, Word, Excel, PowerPoint และไฟล์ภาพ
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop File Area */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ไฟล์เอกสาร (PDF, DOCX, XLSX, PPTX, JPG, PNG) *
            </label>
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center relative hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold text-xs">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({selectedFile.size})</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-[#B83B6F] mx-auto mb-1 opacity-80" />
                  <p className="font-semibold text-slate-700">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ขนาดไม่เกิน 50 MB / ระบบจะคำนวณ Hash และตรวจสอบความปลอดภัย
                  </p>
                </>
              )}
            </div>
          </div>

          <Input
            label="ชื่อเอกสารทางการ *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น คู่มือการจัดทำและพัฒนาหลักสูตร หรือ คำสั่งแต่งตั้งคณะกรรมการ"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="เลขที่เอกสาร / ทะเบียนหนังสือ"
              value={documentNo}
              onChange={(e) => setDocumentNo(e.target.value)}
              placeholder="มจร-กว-2569/..."
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทเอกสาร (19 รูปแบบ) *
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentClassificationType)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
              >
                {DOCUMENT_CLASSIFICATIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    [{c.category}] {c.labelTh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="หน่วยงานเจ้าของเรื่อง *"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="กองวิชาการ สำนักงานอธิการบดี"
              required
            />

            <Input
              label="เวอร์ชันเริ่มต้น"
              value={initialVersion}
              onChange={(e) => setInitialVersion(e.target.value)}
              placeholder="v1.0"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="date"
              label="วันที่มีผลบังคับใช้ (Effective Date)"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />

            <Input
              type="date"
              label="วันสิ้นสุดผลบังคับใช้ / หมดอายุ (Expiration Date)"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>

          <Input
            label="คำค้นหา / ป้ายกำกับ Tags (คั่นด้วยจุลภาค)"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="มคอ.3, OBE, AUN-QA, กฎหมาย"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำอธิบายสาระสำคัญของเอกสาร
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="สรุปวัตถุประสงค์ ขอบเขต หรือเนื้อหาสำคัญ..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
            />
          </div>

          {/* Progress Bar */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-[#B83B6F]">
                <span>กำลังบันทึกและประมวลผลเอกสาร...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B83B6F] transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={onClose} disabled={uploadProgress !== null}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit" disabled={uploadProgress !== null} className="gap-1">
              บันทึกเอกสารเข้าสู่คลัง
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
