import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderArchive,
  Search,
  Filter,
  Plus,
  Star,
  Clock,
  Share2,
  User,
  History,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Tag,
  Upload,
  Calendar,
  Building2,
  FileCheck,
  Presentation,
  ShieldCheck,
  Sparkles,
  Link2,
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { useToast } from '../ui/Toast.tsx';
import type {
  CentralManagedDocument,
  DocumentClassificationType,
  DmsFileFormat,
  DmsDocumentStatus,
  DocumentFilterOptions,
} from '../../types/documentManagement.ts';
import { DOCUMENT_CLASSIFICATIONS } from '../../data/dmsClassificationData.ts';
import { centralDocumentService } from '../../services/centralDocumentService.ts';
import { DocumentDetailModal } from './DocumentDetailModal.tsx';
import { DocumentPreviewModal } from './DocumentPreviewModal.tsx';
import { DocumentNewUploadModal } from './DocumentNewUploadModal.tsx';
import { rbacService } from '../../services/rbacService.ts';

interface DocumentCenterModuleProps {
  onNavigateToModule?: (targetPath: string) => void;
}

export const DocumentCenterModule: React.FC<DocumentCenterModuleProps> = ({
  onNavigateToModule,
}) => {
  const { showToast } = useToast();

  // Documents state subscribed to centralDocumentService
  const [documents, setDocuments] = useState<CentralManagedDocument[]>(() =>
    centralDocumentService.getAll()
  );

  useEffect(() => {
    const unsubscribe = centralDocumentService.subscribe(() => {
      setDocuments(centralDocumentService.getAll());
    });
    return unsubscribe;
  }, []);

  // Quick Views / Tabs: all, favorites, recent, expiring, relations, my_documents
  const [activeView, setActiveView] = useState<
    'all' | 'favorites' | 'recently_updated' | 'expiring' | 'relations' | 'my_documents'
  >('all');

  // Search & Advanced Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DocumentClassificationType | 'all'>('all');
  const [selectedFormat, setSelectedFormat] = useState<DmsFileFormat | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<DmsDocumentStatus | 'all'>('all');
  const [expiryWarningFilter, setExpiryWarningFilter] = useState<'all' | 'expired' | 'expiring_7_days' | 'expiring_30_days'>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'version' | 'downloadCount'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocForDetail, setSelectedDocForDetail] = useState<CentralManagedDocument | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<CentralManagedDocument | null>(null);

  // Simulated Current User Profile
  const currentUser = useMemo(() => ({
    id: 'usr-1',
    name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    role: 'Central Admin',
    position: 'ผู้อำนวยการกองวิชาการ',
    email: 'academic.director@mcu.ac.th',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
  }), []);

  const canUpload = rbacService.can(currentUser as any, 'documents.upload');
  const canDelete = rbacService.can(currentUser as any, 'documents.delete');

  // Expiration reference date (simulated as current operational date 2026-09-18)
  const systemNow = useMemo(() => new Date('2026-09-18T12:00:00'), []);

  // Filtered and sorted documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Quick View tab filter
      if (activeView === 'favorites' && !doc.isFavorite) return false;
      if (activeView === 'my_documents' && doc.ownerId !== currentUser.id) return false;
      if (activeView === 'relations' && doc.relations.length === 0) return false;
      if (activeView === 'expiring') {
        const badge = centralDocumentService.getExpirationBadge(doc, systemNow);
        if (badge.status === 'normal') return false;
      }

      // 2. Search query across title, docNo, description, tags, owner, relations
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = doc.title.toLowerCase().includes(q);
        const inNo = doc.documentNo.toLowerCase().includes(q);
        const inDesc = doc.description.toLowerCase().includes(q);
        const inOwner = doc.ownerName.toLowerCase().includes(q);
        const inDept = doc.department.toLowerCase().includes(q);
        const inTags = doc.tags.some((t) => t.toLowerCase().includes(q));
        const inRelations = doc.relations.some(
          (r) => (r.targetRecordCode || '').toLowerCase().includes(q) || r.targetRecordTitle.toLowerCase().includes(q)
        );
        if (!inTitle && !inNo && !inDesc && !inOwner && !inDept && !inTags && !inRelations) {
          return false;
        }
      }

      // 3. Dropdown Filters
      if (selectedType !== 'all' && doc.docType !== selectedType) return false;
      if (selectedFormat !== 'all' && doc.fileFormat !== selectedFormat) return false;
      if (selectedDepartment !== 'all' && !doc.department.includes(selectedDepartment)) return false;
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false;

      // 4. Expiry warning filter
      if (expiryWarningFilter !== 'all') {
        const badge = centralDocumentService.getExpirationBadge(doc, systemNow);
        if (expiryWarningFilter === 'expired' && badge.status !== 'expired') return false;
        if (expiryWarningFilter === 'expiring_7_days' && badge.status !== 'expiring_7_days') return false;
        if (expiryWarningFilter === 'expiring_30_days' && badge.status !== 'expiring_30_days') return false;
      }

      return true;
    }).sort((a, b) => {
      const mult = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'th') * mult;
      if (sortBy === 'downloadCount') return (a.downloadCount - b.downloadCount) * mult;
      if (sortBy === 'version') return a.currentVersion.localeCompare(b.currentVersion) * mult;
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * mult;
    });
  }, [
    documents,
    activeView,
    searchQuery,
    selectedType,
    selectedFormat,
    selectedDepartment,
    selectedStatus,
    expiryWarningFilter,
    sortBy,
    sortOrder,
    currentUser.id,
    systemNow,
  ]);

  // Statistics overview
  const stats = useMemo(() => {
    let expired = 0;
    let expiringSoon = 0;
    let totalRelations = 0;

    documents.forEach((d) => {
      totalRelations += d.relations.length;
      const b = centralDocumentService.getExpirationBadge(d, systemNow);
      if (b.status === 'expired') expired++;
      if (b.status === 'expiring_7_days' || b.status === 'expiring_30_days') expiringSoon++;
    });

    return {
      total: documents.length,
      expired,
      expiringSoon,
      totalRelations,
    };
  }, [documents, systemNow]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => set.add(d.department));
    return Array.from(set);
  }, [documents]);

  // Toggle favorite
  const handleToggleFavorite = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    centralDocumentService.toggleFavorite(docId);
    showToast('อัปเดตรายการโปรดแล้ว', 'info');
  };

  // Download handler
  const handleDownload = (doc: CentralManagedDocument, version: string) => {
    centralDocumentService.logDownload(doc.id, version, currentUser as any);
    showToast(`ดาวน์โหลด ${doc.title} (${version}) เรียบร้อยแล้ว`, 'success');
  };

  // Status changer
  const handleStatusChange = (docId: string, newStatus: DmsDocumentStatus) => {
    centralDocumentService.updateStatus(docId, newStatus, 'ปรับปรุงสถานะผ่านหน้าคลังเอกสาร', currentUser as any);
    showToast(`ปรับสถานะเอกสารเป็น ${newStatus} แล้ว`, 'success');
    if (selectedDocForDetail?.id === docId) {
      setSelectedDocForDetail(centralDocumentService.getById(docId) || null);
    }
  };

  // New Document upload submit
  const handleCreateDocument = (data: any) => {
    try {
      const created = centralDocumentService.createDocument(
        {
          title: data.title,
          documentNo: data.documentNo,
          docType: data.docType,
          department: data.department,
          fileFormat: data.fileFormat,
          fileSize: data.fileSize,
          fileName: data.fileName,
          description: data.description,
          tags: data.tags,
          effectiveDate: data.effectiveDate,
          expirationDate: data.expirationDate,
          initialVersion: data.initialVersion,
          initialChangeDescription: data.initialChangeDescription,
        },
        currentUser as any
      );
      showToast('อัปโหลดเอกสารใหม่เข้าสู่ระบบคลังกลางสำเร็จ', 'success');
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    }
  };

  // Helper for Classification Badge
  const getClassificationMeta = (typeKey: DocumentClassificationType) => {
    return (
      DOCUMENT_CLASSIFICATIONS.find((c) => c.key === typeKey) || {
        key: typeKey,
        labelTh: typeKey,
        category: 'หนังสือและคำสั่ง',
        badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
      }
    );
  };

  // File type icon
  const getFileFormatIcon = (format: DmsFileFormat) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'doc':
      case 'docx':
        return <FileCheck className="w-4 h-4 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'jpg':
      case 'png':
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#B83B6F] to-[#942854] flex items-center justify-center text-white shadow-xs shrink-0">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  ระบบคลังเอกสารวิชาการกลาง (Document Management System - DMS)
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBE7EF] text-[#B83B6F] border border-[#F5C2D6]">
                  Single Source of Truth
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Version & Relations
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ศูนย์กลางจัดเก็บเอกสารทางการ 19 รูปแบบ อัปโหลดครั้งเดียวเชื่อมโยงสู่ทุกโมดูล (MOU, หลักสูตร, มติ, วาระประชุม, KPI) รองรับ PDF, Word, Excel, PPTX และภาพ พร้อมประวัติเวอร์ชันและแจ้งเตือนหมดอายุ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canUpload && (
              <Button
                id="btn-dms-upload-new"
                variant="primary"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="gap-1.5 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                อัปโหลดเอกสารใหม่
              </Button>
            )}
          </div>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">เอกสารทั้งหมด</span>
              <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">{stats.total} รายการ</p>
            </div>
            <FolderArchive className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-700 font-medium">เชื่อมโยงข้ามระบบ</span>
              <p className="text-lg font-bold text-emerald-800 font-mono mt-0.5">{stats.totalRelations} จุดเชื่อม</p>
            </div>
            <Link2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-700 font-medium">ใกล้ครบกำหนด/หมดอายุ</span>
              <p className="text-lg font-bold text-amber-800 font-mono mt-0.5">{stats.expiringSoon} ฉบับ</p>
            </div>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>

          <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-rose-700 font-medium">สิ้นสุดผลบังคับใช้ (Expired)</span>
              <p className="text-lg font-bold text-rose-800 font-mono mt-0.5">{stats.expired} ฉบับ</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B83B6F]" />
            <input
              id="input-dms-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเอกสารกลาง: ชื่อเรื่อง, เลขที่หนังสือ, คำสำคัญ (Tags), หน่วยงาน, ผู้จัดทำ หรือชื่อมติ/MOU ที่เชื่อมโยง..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#B83B6F]/20 focus:border-[#B83B6F] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        </div>

        {/* Quick Tabs Bar */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveView('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeView === 'all'
                ? 'bg-[#B83B6F] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            เอกสารทั้งหมด ({documents.length})
          </button>

          <button
            onClick={() => setActiveView('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeView === 'favorites'
                ? 'bg-[#B83B6F] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            รายการโปรด (Favorites)
          </button>

          <button
            onClick={() => setActiveView('relations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeView === 'relations'
                ? 'bg-[#B83B6F] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            เอกสารที่มีการเชื่อมโยงข้ามระบบ ({stats.totalRelations})
          </button>

          <button
            onClick={() => setActiveView('expiring')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeView === 'expiring'
                ? 'bg-[#B83B6F] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            แจ้งเตือนหมดอายุ / ใกล้ครบกำหนด ({stats.expiringSoon + stats.expired})
          </button>

          <button
            onClick={() => setActiveView('my_documents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeView === 'my_documents'
                ? 'bg-[#B83B6F] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            เอกสารของฉัน (My Documents)
          </button>

          <div className="ml-auto">
            <button
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isAdvancedFilterOpen ? 'bg-slate-100 border-slate-300 text-slate-900 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B83B6F]" />
              ตัวกรองละเอียด
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar (File formats, 19 Classifications, Departments, Expiry) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Classification Filter (19 types) */}
            <select
              id="dms-filter-doctype"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700 font-medium"
            >
              <option value="all">ทุกประเภทเอกสาร (19 Classifications)</option>
              {DOCUMENT_CLASSIFICATIONS.map((c) => (
                <option key={c.key} value={c.key}>
                  [{c.category}] {c.labelTh}
                </option>
              ))}
            </select>

            {/* File format */}
            <select
              id="dms-filter-format"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700 font-medium"
            >
              <option value="all">ทุกรูปแบบไฟล์ (All Formats)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="docx">Word (.docx)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pptx">PowerPoint (.pptx)</option>
              <option value="jpg">JPEG (.jpg)</option>
              <option value="png">PNG (.png)</option>
            </select>

            {/* Department */}
            <select
              id="dms-filter-dept"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700 font-medium"
            >
              <option value="all">ทุกหน่วยงาน (All Departments)</option>
              {departments.map((dep, idx) => (
                <option key={idx} value={dep}>
                  {dep}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              id="dms-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 bg-white text-slate-700 font-medium"
            >
              <option value="all">ทุกสถานะ (All Statuses)</option>
              <option value="Draft">Draft (ร่าง)</option>
              <option value="Under Review">Under Review (ตรวจพิจารณา)</option>
              <option value="Approved">Approved (อนุมัติแล้ว)</option>
              <option value="Expired">Expired (หมดอายุ)</option>
              <option value="Archived">Archived (เก็บถาวร)</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg py-1 px-2 bg-white text-slate-700 font-medium"
            >
              <option value="updatedAt">วันที่ปรับปรุงล่าสุด</option>
              <option value="title">ชื่อเอกสาร (ก-ฮ)</option>
              <option value="version">เวอร์ชัน</option>
              <option value="downloadCount">ยอดดาวน์โหลด</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title={sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable Panel */}
        {isAdvancedFilterOpen && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-lg text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                กรองตามสถานะความถูกต้อง / อายุเอกสาร (Expiration Status):
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setExpiryWarningFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs border ${
                    expiryWarningFilter === 'all'
                      ? 'bg-slate-800 text-white border-slate-800 font-bold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setExpiryWarningFilter('expiring_30_days')}
                  className={`px-2.5 py-1 rounded text-xs border ${
                    expiryWarningFilter === 'expiring_30_days'
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'bg-white text-amber-800 border-amber-200'
                  }`}
                >
                  ใกล้หมดอายุใน 30 วัน
                </button>
                <button
                  onClick={() => setExpiryWarningFilter('expiring_7_days')}
                  className={`px-2.5 py-1 rounded text-xs border ${
                    expiryWarningFilter === 'expiring_7_days'
                      ? 'bg-red-600 text-white border-red-600 font-bold'
                      : 'bg-white text-red-800 border-red-200'
                  }`}
                >
                  เร่งด่วนใน 7 วัน
                </button>
                <button
                  onClick={() => setExpiryWarningFilter('expired')}
                  className={`px-2.5 py-1 rounded text-xs border ${
                    expiryWarningFilter === 'expired'
                      ? 'bg-rose-700 text-white border-rose-700 font-bold'
                      : 'bg-white text-rose-800 border-rose-200'
                  }`}
                >
                  หมดอายุแล้ว (Expired)
                </button>
              </div>
            </div>

            <div className="flex items-end justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType('all');
                  setSelectedFormat('all');
                  setSelectedDepartment('all');
                  setSelectedStatus('all');
                  setExpiryWarningFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                ล้างตัวกรองทั้งหมด
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Document Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            พบเอกสาร <strong className="text-slate-800 font-mono">{filteredDocuments.length}</strong> รายการ
          </span>
          <span className="text-[11px] text-slate-400">
            คลิกที่แถวเอกสารเพื่อดูรายละเอียด ประวัติเวอร์ชัน ความสัมพันธ์ข้ามระบบ และพรีวิว
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-3 w-10 text-center">★</th>
                <th className="py-3 px-3 w-16">ไฟล์</th>
                <th className="py-3 px-3">ชื่อเอกสาร / เลขที่ / ป้ายกำกับ</th>
                <th className="py-3 px-3">ประเภทการจำแนก (Classification)</th>
                <th className="py-3 px-3">หน่วยงาน / ผู้จัดทำ</th>
                <th className="py-3 px-3 text-center">เวอร์ชัน</th>
                <th className="py-3 px-3">การเชื่อมโยง (Relations)</th>
                <th className="py-3 px-3">วันหมดอายุ / สถานะ</th>
                <th className="py-3 px-3 text-center w-28">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FolderArchive className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">ไม่พบเอกสารตรงตามเงื่อนไขการค้นหา</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองประเภทเอกสารเป็น "ทุกประเภทเอกสาร"
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const meta = getClassificationMeta(doc.docType);
                  const expiryBadge = centralDocumentService.getExpirationBadge(doc, systemNow);

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDocForDetail(doc)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Favorite Star */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => handleToggleFavorite(doc.id, e)}
                          className="text-slate-300 hover:text-amber-400 transition-colors"
                          title={doc.isFavorite ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              doc.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* File format icon */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1.5 rounded-md bg-slate-100 shrink-0">
                            {getFileFormatIcon(doc.fileFormat)}
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-600 uppercase">
                            {doc.fileFormat}
                          </span>
                        </div>
                      </td>

                      {/* Title & Metadata */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 leading-snug group-hover:text-[#B83B6F] transition-colors">
                            {doc.title}
                          </p>
                          {doc.ownerId === currentUser.id && (
                            <span className="text-[10px] font-semibold bg-[#FBE7EF] text-[#B83B6F] px-1.5 py-0.2 rounded shrink-0">
                              ของฉัน
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          {doc.documentNo && <span className="font-mono">{doc.documentNo}</span>}
                          <span>• {doc.fileSize}</span>
                          <span>• ดาวน์โหลด {doc.downloadCount} ครั้ง</span>
                        </div>

                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600"
                              >
                                #{tag}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{doc.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Classification Badge */}
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${meta.badgeColor}`}>
                          {meta.labelTh}
                        </span>
                      </td>

                      {/* Department & Owner */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800 text-[11px]">{doc.department}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.ownerName}</p>
                      </td>

                      {/* Version */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {doc.currentVersion}
                        </span>
                        {doc.versions.length > 1 && (
                          <span className="block text-[9px] text-slate-400 mt-0.5 font-sans">
                            {doc.versions.length} เวอร์ชัน
                          </span>
                        )}
                      </td>

                      {/* Cross-module Relations */}
                      <td className="py-3 px-3">
                        {doc.relations.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Link2 className="w-3 h-3" />
                              เชื่อมโยง {doc.relations.length} รายการ
                            </span>
                            <div className="text-[10px] text-slate-500 truncate max-w-44">
                              {doc.relations[0]?.targetRecordTitle}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">ยังไม่มีการผูก</span>
                        )}
                      </td>

                      {/* Expiration & Status */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${expiryBadge.badgeClass}`}>
                            <Clock className="w-3 h-3" />
                            {expiryBadge.labelTh}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ปรับปรุง: {doc.updatedAt}
                          </div>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocForPreview(doc);
                            }}
                            className="p-1.5 text-slate-600 hover:text-[#B83B6F] hover:bg-[#FBE7EF] rounded-md transition-colors"
                            title="เปิดดูเอกสาร (Preview)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc, doc.currentVersion);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="ดาวน์โหลดไฟล์"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocForDetail(doc);
                            }}
                            className="px-2 py-1 text-xs font-semibold text-[#B83B6F] hover:bg-[#FBE7EF] rounded-md transition-colors"
                          >
                            รายละเอียด
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODALS INTEGRATION */}
      
      {/* Detail & Multi-tab Modal */}
      {selectedDocForDetail && (
        <DocumentDetailModal
          document={selectedDocForDetail}
          isOpen={Boolean(selectedDocForDetail)}
          onClose={() => setSelectedDocForDetail(null)}
          onPreview={(doc) => setSelectedDocForPreview(doc)}
          onDownload={handleDownload}
          onStatusChange={handleStatusChange}
          onNavigateToModule={onNavigateToModule}
          canEdit={canUpload}
        />
      )}

      {/* Embedded Document Preview Modal */}
      {selectedDocForPreview && (
        <DocumentPreviewModal
          document={selectedDocForPreview}
          isOpen={Boolean(selectedDocForPreview)}
          onClose={() => setSelectedDocForPreview(null)}
          onDownload={() => handleDownload(selectedDocForPreview, selectedDocForPreview.currentVersion)}
        />
      )}

      {/* New Document Upload Modal */}
      {isUploadModalOpen && (
        <DocumentNewUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleCreateDocument}
        />
      )}

    </div>
  );
};
