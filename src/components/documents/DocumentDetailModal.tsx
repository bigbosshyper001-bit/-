import React, { useState } from 'react';
import {
  FileText,
  History,
  Link2,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  Tag,
  User,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  Presentation,
  ImageIcon,
  Eye,
  Check,
  ChevronRight,
  GitCommit,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import type {
  CentralManagedDocument,
  DocumentVersionEntry,
  DocumentRelationLink,
  DmsDocumentStatus,
} from '../../types/documentManagement.ts';
import { centralDocumentService } from '../../services/centralDocumentService.ts';
import { DocumentRelationshipManager } from './DocumentRelationshipManager.tsx';
import { DocumentVersionUploadModal } from './DocumentVersionUploadModal.tsx';

interface DocumentDetailModalProps {
  document: CentralManagedDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onPreview: (doc: CentralManagedDocument) => void;
  onDownload: (doc: CentralManagedDocument, version: string) => void;
  onStatusChange: (docId: string, newStatus: DmsDocumentStatus) => void;
  onNavigateToModule?: (targetPath: string) => void;
  canEdit?: boolean;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  isOpen,
  onClose,
  onPreview,
  onDownload,
  onStatusChange,
  onNavigateToModule,
  canEdit = true,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'versions' | 'relations' | 'audit'>('info');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // Version Comparison Selector
  const [compareV1, setCompareV1] = useState<string>('');
  const [compareV2, setCompareV2] = useState<string>('');

  if (!isOpen || !document) return null;

  const expiryBadge = centralDocumentService.getExpirationBadge(document);

  const getStatusBadge = (status: DmsDocumentStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Draft':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Expired':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Archived':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleAddRelation = (rel: Omit<DocumentRelationLink, 'id' | 'linkedAt' | 'linkedByName'>) => {
    const dummyUser = {
      id: 'usr-current',
      name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
      role: 'Central Admin',
    } as any;
    centralDocumentService.linkRelation(document.id, rel, dummyUser);
  };

  const handleRemoveRelation = (relationId: string) => {
    const dummyUser = {
      id: 'usr-current',
      name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
      role: 'Central Admin',
    } as any;
    centralDocumentService.unlinkRelation(document.id, relationId, dummyUser);
  };

  const handleUploadNewVersion = (params: any) => {
    const dummyUser = {
      id: 'usr-current',
      name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
      role: 'Central Admin',
    } as any;
    centralDocumentService.uploadNewVersion(document.id, params, dummyUser);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title=""
        size="lg"
      >
        <div className="space-y-4 text-xs">
          
          {/* Header Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#B83B6F] text-white text-[11px] uppercase">
                  {document.fileFormat}
                </span>
                <span className="font-mono text-slate-500 font-semibold text-xs">
                  {document.documentNo}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold text-[11px] border border-blue-200">
                  {document.currentVersion}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(document.status)}`}>
                  {document.status}
                </span>
              </div>

              {/* Expiration warning badge */}
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] border flex items-center gap-1 ${expiryBadge.badgeClass}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {expiryBadge.labelTh}
                </span>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {document.title}
            </h3>

            <p className="text-slate-600 leading-relaxed">
              {document.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
            </p>

            {/* Quick action bar */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onPreview(document)}
                  className="gap-1.5 text-xs shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  เปิดดูเอกสาร (Preview)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(document, document.currentVersion)}
                  className="gap-1.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#B83B6F]" />
                  ดาวน์โหลด ({document.fileSize})
                </Button>

                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVersionModalOpen(true)}
                    className="gap-1.5 text-xs text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    อัปโหลดเวอร์ชันใหม่
                  </Button>
                )}
              </div>

              {/* Status quick changer for Admin */}
              {canEdit && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[11px]">เปลี่ยนสถานะ:</span>
                  <select
                    value={document.status}
                    onChange={(e) => onStatusChange(document.id, e.target.value as DmsDocumentStatus)}
                    className="text-[11px] font-semibold py-1 px-2 rounded-md border border-slate-300 bg-white"
                  >
                    <option value="Draft">Draft (ร่าง)</option>
                    <option value="Under Review">Under Review (ตรวจพิจารณา)</option>
                    <option value="Approved">Approved (อนุมัติแล้ว)</option>
                    <option value="Expired">Expired (หมดอายุ)</option>
                    <option value="Archived">Archived (เก็บถาวร)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-3.5 font-bold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'info'
                  ? 'border-[#B83B6F] text-[#B83B6F]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              ข้อมูลเอกสาร (Metadata)
            </button>

            <button
              onClick={() => setActiveTab('versions')}
              className={`py-2 px-3.5 font-bold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'versions'
                  ? 'border-[#B83B6F] text-[#B83B6F]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              ประวัติเวอร์ชัน ({document.versions.length})
            </button>

            <button
              onClick={() => setActiveTab('relations')}
              className={`py-2 px-3.5 font-bold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'relations'
                  ? 'border-[#B83B6F] text-[#B83B6F]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              ความสัมพันธ์ข้ามระบบ ({document.relations.length})
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-3.5 font-bold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'border-[#B83B6F] text-[#B83B6F]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              บันทึกการตรวจสอบ (Audit Trail)
            </button>
          </div>

          {/* TAB 1: METADATA INFO */}
          {activeTab === 'info' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">ประเภทการจำแนก:</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{document.docType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">หน่วยงานเจ้าของเรื่อง:</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{document.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">ผู้จัดทำ / ผู้รับผิดชอบ:</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{document.ownerName}</span>
                  <span className="text-[10px] text-slate-400">{document.ownerPosition}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">จำนวนการดาวน์โหลด:</span>
                  <span className="font-bold text-slate-800 mt-0.5 block font-mono">
                    {document.downloadCount} ครั้ง
                  </span>
                </div>
              </div>

              {/* Dates & Expiration Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#B83B6F]" />
                  กรอบเวลาและการบริหารวันหมดอายุ (Validity & Expiration Dates)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">วันที่มีผลบังคับใช้ (Effective)</span>
                    <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                      {document.effectiveDate || 'ไม่ได้ระบุ'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">วันสิ้นสุดผลใช้บังคับ (Expiration)</span>
                    <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                      {document.expirationDate || 'ไม่มีกำหนด'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">วันแจ้งเตือนต่ออายุ (Renewal Alert)</span>
                    <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                      {document.renewalDate || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags & Keywords */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#B83B6F]" />
                  คำค้นหาและป้ายกำกับ (Tags):
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {document.tags.length > 0 ? (
                    document.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#FBE7EF] text-[#B83B6F] border border-[#F5C2D6]"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">ไม่มีป้ายกำกับ</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERSION HISTORY & COMPARISON */}
          {activeTab === 'versions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#B83B6F]" />
                    ประวัติการแก้ไขและเวอร์ชัน (Version Control Logs)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    จัดเก็บทุกฉบับที่มีการแก้ไข พร้อมบันทึก Changelog และเปรียบเทียบการเปลี่ยนแปลง
                  </p>
                </div>

                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVersionModalOpen(true)}
                    className="gap-1 text-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#B83B6F]" />
                    อัปโหลดเวอร์ชันใหม่
                  </Button>
                )}
              </div>

              {/* Version Comparison Selector */}
              {document.versions.length >= 2 && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                      เครื่องมือเปรียบเทียบความเปลี่ยนแปลงระหว่างเวอร์ชัน (Diff Comparison):
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={compareV1 || document.versions[1]?.version}
                      onChange={(e) => setCompareV1(e.target.value)}
                      className="text-xs p-1.5 bg-white border border-blue-300 rounded-lg text-slate-700"
                    >
                      {document.versions.map((v) => (
                        <option key={v.version} value={v.version}>
                          เวอร์ชันเดิม: {v.version} ({v.uploadedAt.substring(0, 10)})
                        </option>
                      ))}
                    </select>

                    <span className="text-blue-700 font-bold">เปรียบเทียบกับ</span>

                    <select
                      value={compareV2 || document.versions[0]?.version}
                      onChange={(e) => setCompareV2(e.target.value)}
                      className="text-xs p-1.5 bg-white border border-blue-300 rounded-lg text-slate-700"
                    >
                      {document.versions.map((v) => (
                        <option key={v.version} value={v.version}>
                          เวอร์ชันใหม่: {v.version} ({v.uploadedAt.substring(0, 10)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Summary of difference */}
                  <div className="p-2.5 bg-white rounded-lg border border-blue-200 text-[11px] text-slate-700 space-y-1">
                    <p className="font-semibold text-blue-950">
                      ผลการเปรียบเทียบ: มีการแก้ไขเนื้อหาและปรับเกณฑ์ความสอดคล้องตามมติสภาวิชาการ
                    </p>
                    <p className="text-slate-600">
                      • ปรับปรุงขนาดไฟล์: {document.versions[1]?.fileSize} → {document.versions[0]?.fileSize}
                    </p>
                    <p className="text-slate-600">
                      • บันทึกการแก้ไขล่าสุด: "{document.versions[0]?.changeDescription}"
                    </p>
                  </div>
                </div>
              )}

              {/* Version Timeline Entries */}
              <div className="space-y-2.5">
                {document.versions.map((ver, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      ver.isCurrent
                        ? 'bg-white border-[#B83B6F] shadow-xs ring-1 ring-[#B83B6F]/20'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                              ver.isCurrent
                                ? 'bg-[#FBE7EF] text-[#B83B6F] border border-[#F5C2D6]'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ver.version}
                          </span>

                          {ver.isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              ฉบับบังคับใช้อยู่ (Current Active)
                            </span>
                          )}

                          <span className="text-slate-400 text-[11px]">• {ver.uploadedAt}</span>
                          <span className="text-slate-500 font-medium text-[11px]">โดย {ver.uploadedByName} ({ver.uploadedByRole})</span>
                        </div>

                        <p className="text-slate-800 text-xs font-semibold mt-1.5">
                          บันทึกการเปลี่ยนแปลง: <span className="font-normal text-slate-600">{ver.changeDescription}</span>
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                          <span>ไฟล์: {ver.fileName}</span>
                          <span>• ขนาด: {ver.fileSize}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(document, ver.version)}
                        className="gap-1 text-xs shrink-0"
                      >
                        <Download className="w-3.5 h-3.5 text-[#B83B6F]" />
                        ดาวน์โหลด ({ver.fileSize})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RELATIONSHIPS MANAGER */}
          {activeTab === 'relations' && (
            <DocumentRelationshipManager
              document={document}
              onAddRelation={handleAddRelation}
              onRemoveRelation={handleRemoveRelation}
              onNavigateToModule={onNavigateToModule}
              canEdit={canEdit}
            />
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#B83B6F]" />
                    ประวัติการตรวจสอบกิจกรรม (Audit Trail & Activity Logs)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    บันทึกการเข้าถึง ดาวน์โหลด การแก้ไข และการปรับสถานะเอกสารตามมาตรฐานความปลอดภัย
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {document.auditHistory.length} กิจกรรม
                </span>
              </div>

              <div className="space-y-2">
                {document.auditHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {entry.action}
                        </span>
                        <span className="font-bold text-slate-800 text-xs">
                          {entry.actionLabelTh}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">{entry.details}</p>
                      <p className="text-[10px] text-slate-400">
                        ผู้ปฏิบัติงาน: <strong className="text-slate-600">{entry.userName}</strong> ({entry.userRole})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="text-slate-400 text-[11px]">
              รหัสอ้างอิงระบบ: {document.id}
            </span>
            <Button variant="outline" size="sm" onClick={onClose}>
              ปิดหน้าต่าง
            </Button>
          </div>

        </div>
      </Modal>

      {/* Version Upload Modal */}
      {isVersionModalOpen && (
        <DocumentVersionUploadModal
          document={document}
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          onSubmit={handleUploadNewVersion}
        />
      )}
    </>
  );
};
