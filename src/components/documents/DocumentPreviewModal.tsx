import React, { useState } from 'react';
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import type { CentralManagedDocument } from '../../types/documentManagement.ts';

interface DocumentPreviewModalProps {
  document: CentralManagedDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages] = useState<number>(4);
  const [rotation, setRotation] = useState<number>(0);

  if (!isOpen || !document) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const isPdf = document.fileFormat === 'pdf';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[92vh] overflow-hidden animate-in fade-in duration-200">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden mr-4">
            <div className="w-9 h-9 rounded-lg bg-[#B83B6F] flex items-center justify-center text-white shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-rose-300 font-bold uppercase tracking-wider">
                  [{document.fileFormat.toUpperCase()}]
                </span>
                <span className="font-mono text-xs text-slate-300 font-semibold">
                  {document.documentNo}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {document.currentVersion}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white truncate mt-0.5">
                {document.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="gap-1.5 text-xs bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-[#B83B6F]" />
                ดาวน์โหลด ({document.fileSize})
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF / Document Toolbar */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">หน้า:</span>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="font-mono px-2 py-0.5 bg-white rounded border border-slate-300 text-slate-800 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          {/* Zoom & Rotate Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
              title="ย่อขนาด"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-slate-700 font-medium w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
              title="ขยายขนาด"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <button
              onClick={handleRotate}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
              title="หมุนหน้าเอกสาร"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
              title="พิมพ์เอกสาร"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ลายมือชื่อดิจิทัลรับรอง (Digital Seal)
            </span>
          </div>
        </div>

        {/* Embedded Viewer Canvas */}
        <div className="flex-1 bg-slate-200/80 p-4 overflow-auto flex justify-center items-start">
          <div
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full max-w-3xl bg-white rounded-lg shadow-xl border border-slate-300 p-8 sm:p-12 min-h-[850px] relative text-slate-800"
          >
            {/* Watermark / Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <div className="text-center">
                <Building2 className="w-96 h-96 text-slate-900 mx-auto" />
                <p className="text-4xl font-bold uppercase mt-4">MCU ACADEMIC AFFAIRS</p>
              </div>
            </div>

            {/* Document Header Representation */}
            <div className="text-center border-b pb-6 mb-6">
              <div className="w-16 h-16 rounded-full bg-linear-to-tr from-[#B83B6F] to-[#942854] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                กองวิชาการ สำนักงานอธิการบดี อาคารเรียนรวม วังน้อย พระนครศรีอยุธยา
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
                <span>เลขที่: {document.documentNo}</span>
                <span>ลงวันที่: {document.effectiveDate || document.createdAt}</span>
              </div>
            </div>

            {/* Document Body Simulation */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 text-sm mb-1">
                  เรื่อง: {document.title}
                </p>
                <p className="text-slate-600">
                  เรียน: กรรมการสภาวิชาการ คณบดี ผู้อำนวยการส่วนงาน และคณาจารย์ผู้เกี่ยวข้อง
                </p>
              </div>

              <div className="space-y-3 text-justify indent-8">
                <p>
                  ตามที่มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ได้มุ่งเน้นการปฏิรูปและยกระดับคุณภาพการจัดการศึกษา
                  ตามมาตรฐานการอุดมศึกษา พ.ศ. 2565 และการประกันคุณภาพระดับหลักสูตรตามเกณฑ์ AUN-QA นั้น
                  กองวิชาการได้รับมอบหมายให้จัดทำและรวบรวมเอกสารฉบับนี้ เพื่อเป็นแนวปฏิบัติในการบริหารจัดการหลักสูตร
                  การเทียบโอนผลลัพธ์การเรียนรู้ และการดำเนินงานตามพันธกิจของมหาวิทยาลัย
                </p>
                <p>
                  สาระสำคัญของเอกสารฉบับนี้: {document.description || 'ระบุขั้นตอน กฎเกณฑ์ และแนวทางปฏิบัติที่ได้รับความเห็นชอบจากคณะกรรมการสภาวิชาการอย่างเป็นทางการ'}
                </p>
                <p>
                  จึงประกาศ/แจ้งเวียนมาเพื่อโปรดทราบและถือปฏิบัติตามแนวทางที่ระบุไว้ในเอกสารฉบับนี้อย่างเคร่งครัด
                  ทั้งนี้มีผลบังคับใช้ตั้งแต่วันที่ {document.effectiveDate || document.createdAt} เป็นต้นไป
                </p>
              </div>

              {/* Version & Relationship Meta Box */}
              <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[11px] bg-slate-50/60 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 block">หน่วยงานผู้จัดทำ:</span>
                  <span className="font-semibold text-slate-800">{document.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ผู้รับผิดชอบ / เจ้าของเรื่อง:</span>
                  <span className="font-semibold text-slate-800">{document.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">เวอร์ชันจัดเก็บปัจจุบัน:</span>
                  <span className="font-mono font-bold text-[#B83B6F]">{document.currentVersion}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">การเชื่อมโยงระบบ:</span>
                  <span className="font-semibold text-blue-700">
                    {document.relations.length} รายการที่เกี่ยวข้อง
                  </span>
                </div>
              </div>

              {/* Signature Block */}
              <div className="mt-12 flex justify-end">
                <div className="text-center w-64">
                  <div className="h-14 flex items-center justify-center font-serif text-slate-400 italic">
                    (ลงลายมือชื่อดิจิทัลรับรอง)
                  </div>
                  <p className="font-bold text-slate-800">{document.ownerName}</p>
                  <p className="text-[11px] text-slate-500">{document.ownerPosition}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    MCU Verified Certificate ID: #{document.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer page stamp */}
            <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center text-[10px] text-slate-400 border-t pt-2">
              <span>ระบบคลังเอกสารวิชาการกลาง มจร (Academic DMS)</span>
              <span>หน้า {currentPage} จาก {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-4">
            <span>ไฟล์: <strong className="text-slate-700 font-mono">{document.fileUrl}</strong></span>
            <span>ขนาด: <strong className="text-slate-700">{document.fileSize}</strong></span>
            <span>ดาวน์โหลดแล้ว: <strong className="text-slate-700">{document.downloadCount} ครั้ง</strong></span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิดหน้าจอพรีวิว
          </Button>
        </div>

      </div>
    </div>
  );
};
