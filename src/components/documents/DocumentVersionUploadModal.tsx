import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Presentation,
  ImageIcon,
  X,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import type {
  CentralManagedDocument,
  DmsFileFormat,
} from '../../types/documentManagement.ts';

interface DocumentVersionUploadModalProps {
  document: CentralManagedDocument;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    newVersionNumber: string;
    fileName: string;
    fileFormat: DmsFileFormat;
    fileSize: string;
    changeDescription: string;
    effectiveDate?: string;
    expirationDate?: string;
  }) => void;
}

export const DocumentVersionUploadModal: React.FC<DocumentVersionUploadModalProps> = ({
  document,
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Suggest next version
  const currentVerStr = document.currentVersion || 'v1.0';
  const verNum = parseFloat(currentVerStr.replace('v', '')) || 1.0;
  const minorNext = `v${(verNum + 0.1).toFixed(1)}`;
  const majorNext = `v${Math.floor(verNum + 1.0)}.0`;

  const [versionType, setVersionType] = useState<'minor' | 'major' | 'custom'>('minor');
  const [customVersion, setCustomVersion] = useState(minorNext);
  const [changeDescription, setChangeDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    format: DmsFileFormat;
    size: string;
  } | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetVersionNumber =
    versionType === 'minor' ? minorNext : versionType === 'major' ? majorNext : customVersion;

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate allowed extensions: PDF, DOCX, XLSX, PPTX, JPG, PNG
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'png'];

    if (!ext || !allowed.includes(ext)) {
      setErrorMsg('รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ PDF, DOCX, XLSX, PPTX, JPG, PNG เท่านั้น');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('ขนาดไฟล์เกินกำหนด (สูงสุด 50 MB)');
      return;
    }

    setErrorMsg(null);
    const format = (ext === 'doc' ? 'docx' : ext === 'xls' ? 'xlsx' : ext === 'ppt' ? 'pptx' : ext) as DmsFileFormat;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

    setSelectedFile({
      name: file.name,
      format,
      size: `${sizeMb} MB`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDescription.trim()) {
      setErrorMsg('กรุณากรอกบันทึกการเปลี่ยนแปลง (Changelog)');
      return;
    }

    // Simulate upload progress
    setUploadProgress(20);
    setTimeout(() => setUploadProgress(65), 150);
    setTimeout(() => {
      setUploadProgress(100);
      onSubmit({
        newVersionNumber: targetVersionNumber,
        fileName: selectedFile?.name || `${document.title.replace(/\s+/g, '_')}_${targetVersionNumber}.${document.fileFormat}`,
        fileFormat: selectedFile?.format || document.fileFormat,
        fileSize: selectedFile?.size || '3.5 MB',
        changeDescription,
        effectiveDate: document.effectiveDate,
        expirationDate: document.expirationDate,
      });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-linear-to-r from-slate-50 to-white flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#B83B6F]" />
              อัปโหลดเวอร์ชันใหม่ (New Version Control)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
              เอกสาร: {document.title} (ปัจจุบัน: <strong className="text-blue-700">{document.currentVersion}</strong>)
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

          {/* Version Increment Choice */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              เลือกระดับการปรับปรุงเวอร์ชัน:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVersionType('minor')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  versionType === 'minor'
                    ? 'border-[#B83B6F] bg-[#FBE7EF]/40 text-[#B83B6F] font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-mono text-sm">{minorNext}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-normal">Minor Update (แก้ไขย่อย/ปรับปรุงเนื้อหา)</div>
              </button>

              <button
                type="button"
                onClick={() => setVersionType('major')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  versionType === 'major'
                    ? 'border-[#B83B6F] bg-[#FBE7EF]/40 text-[#B83B6F] font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-mono text-sm">{majorNext}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-normal">Major Revision (ยกเครื่องใหม่/มติใหม่)</div>
              </button>

              <button
                type="button"
                onClick={() => setVersionType('custom')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  versionType === 'custom'
                    ? 'border-[#B83B6F] bg-[#FBE7EF]/40 text-[#B83B6F] font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-mono text-sm">กำหนดเอง</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-normal">Custom version tag</div>
              </button>
            </div>

            {versionType === 'custom' && (
              <div className="mt-2">
                <Input
                  label="ระบุเวอร์ชันใหม่ (เช่น v1.5, v2.1-final)"
                  value={customVersion}
                  onChange={(e) => setCustomVersion(e.target.value)}
                  placeholder="v..."
                  required
                />
              </div>
            )}
          </div>

          {/* Changelog Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              บันทึกการเปลี่ยนแปลง (Changelog / Release Notes) *
            </label>
            <textarea
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              rows={3}
              placeholder="อธิบายว่ามีการแก้ไขส่วนใด เพิ่มเติมข้อมูลอะไร หรืออ้างอิงมติประชุมใด..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20"
              required
            />
          </div>

          {/* File Upload Box */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              แนบไฟล์เอกสารฉบับปรับปรุง (PDF, DOCX, XLSX, PPTX, JPG, PNG):
            </label>
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center relative hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                onChange={handleSimulateFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold text-xs">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-500">({selectedFile.size})</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-[#B83B6F] mx-auto mb-1 opacity-80" />
                  <p className="font-semibold text-slate-700">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    (หากไม่ได้เลือกไฟล์ ระบบจะใช้นามสกุลเดิมและต่อยอดเวอร์ชันอัตโนมัติ)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-[#B83B6F]">
                <span>กำลังบันทึกและสร้าง Hash ประวัติเวอร์ชัน...</span>
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={onClose} disabled={uploadProgress !== null}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit" disabled={uploadProgress !== null} className="gap-1">
              บันทึกเวอร์ชัน {targetVersionNumber}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
