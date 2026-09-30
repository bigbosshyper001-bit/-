/**
 * Central Document Management Service
 * 
 * Provides centralized storage, version control, multi-module linking,
 * expiration monitoring, and audit logging for all academic documents.
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import type { UserProfile } from '../types.ts';
import type {
  CentralManagedDocument,
  DocumentVersionEntry,
  DocumentRelationLink,
  DocumentAuditTrailEntry,
  DmsDocumentStatus,
  DocumentClassificationType,
  DmsFileFormat,
  DocumentFilterOptions,
} from '../types/documentManagement.ts';
import { INITIAL_CENTRAL_DOCUMENTS } from '../data/dmsClassificationData.ts';
import { auditLogService } from './auditLogService.ts';
import { rbacService } from './rbacService.ts';

const DMS_STORAGE_KEY = 'mcu_central_dms_documents_v2_real';

class CentralDocumentService {
  private documents: CentralManagedDocument[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadDocuments();
  }

  private loadDocuments() {
    try {
      localStorage.removeItem('mcu_central_dms_documents_v1');
      const saved = localStorage.getItem(DMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((d: any) => d.id?.includes('DOC-CENTRAL-00') || d.titleTh?.includes('พระราชบัญญัติ'))) {
          this.documents = [];
          this.persist();
        } else {
          this.documents = parsed;
        }
      } else {
        this.documents = [...INITIAL_CENTRAL_DOCUMENTS];
        this.persist();
      }
    } catch (e) {
      console.warn('Failed to load documents from localStorage, resetting to initial', e);
      this.documents = [...INITIAL_CENTRAL_DOCUMENTS];
    }
  }

  private persist() {
    try {
      localStorage.setItem(DMS_STORAGE_KEY, JSON.stringify(this.documents));
    } catch (e) {
      console.error('Failed to persist DMS documents', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getAll(): CentralManagedDocument[] {
    return [...this.documents];
  }

  public getById(id: string): CentralManagedDocument | undefined {
    return this.documents.find((d) => d.id === id);
  }

  public getByTargetRecord(targetRecordId: string): CentralManagedDocument[] {
    return this.documents.filter((d) =>
      d.relations.some((r) => r.targetRecordId === targetRecordId)
    );
  }

  public getByTargetModule(targetModule: DocumentRelationLink['targetModule']): CentralManagedDocument[] {
    return this.documents.filter((d) =>
      d.relations.some((r) => r.targetModule === targetModule)
    );
  }

  /**
   * Upload / Create New Document
   */
  public createDocument(
    params: {
      documentNo?: string;
      title: string;
      description?: string;
      docType: DocumentClassificationType;
      department: string;
      tags?: string[];
      effectiveDate?: string;
      expirationDate?: string;
      renewalDate?: string;
      fileFormat: DmsFileFormat;
      fileSize: string;
      fileSizeBytes?: number;
      fileName: string;
      initialVersion?: string; // default "v1.0"
      initialChangeDescription?: string;
      initialRelations?: Omit<DocumentRelationLink, 'id' | 'linkedAt' | 'linkedByName'>[];
    },
    currentUser: UserProfile
  ): CentralManagedDocument {
    // RBAC check
    if (!rbacService.can(currentUser, 'documents.upload')) {
      throw new Error('ท่านไม่มีสิทธิ์ในการอัปโหลดเอกสารเข้าสู่ระบบ (ต้องการสิทธิ์: documents.upload)');
    }

    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10);
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const docId = `DMS-2569-${Date.now().toString().slice(-4)}`;
    const docNo = params.documentNo || `มจร-กว-2569/${Date.now().toString().slice(-3)}`;
    const versionStr = params.initialVersion || 'v1.0';

    const firstVersion: DocumentVersionEntry = {
      version: versionStr,
      fileName: params.fileName,
      fileFormat: params.fileFormat,
      fileSize: params.fileSize,
      fileSizeBytes: params.fileSizeBytes || 2048000,
      fileUrl: params.fileName,
      uploadedAt: timeStr,
      uploadedById: currentUser.id,
      uploadedByName: currentUser.name,
      uploadedByRole: currentUser.role,
      changeDescription: params.initialChangeDescription || 'อัปโหลดเอกสารฉบับแรกเข้าสู่ระบบ',
      isCurrent: true,
      metadataSnapshot: {
        title: params.title,
        type: params.docType,
        department: params.department,
        status: 'Draft',
        tags: params.tags || [],
        effectiveDate: params.effectiveDate,
        expirationDate: params.expirationDate,
      },
    };

    const links: DocumentRelationLink[] = (params.initialRelations || []).map((r, idx) => ({
      ...r,
      id: `rel-${Date.now()}-${idx}`,
      linkedAt: dateStr,
      linkedByName: currentUser.name,
    }));

    const auditEntry: DocumentAuditTrailEntry = {
      id: `aud-${Date.now()}`,
      documentId: docId,
      action: 'UPLOAD',
      actionLabelTh: 'อัปโหลดเอกสารใหม่',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: timeStr,
      details: `อัปโหลดเอกสาร "${params.title}" (เวอร์ชัน ${versionStr}) เข้าสู่คลังเอกสารกลาง`,
      newValue: versionStr,
    };

    const newDoc: CentralManagedDocument = {
      id: docId,
      documentNo: docNo,
      title: params.title,
      description: params.description || '',
      docType: params.docType,
      department: params.department,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerPosition: currentUser.position || 'เจ้าหน้าที่วิชาการ',
      ownerEmail: currentUser.email || 'staff@mcu.ac.th',
      status: 'Draft',
      currentVersion: versionStr,
      createdAt: dateStr,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      updatedAt: dateStr,
      updatedById: currentUser.id,
      updatedByName: currentUser.name,
      downloadCount: 0,
      isFavorite: false,
      tags: params.tags || [],
      effectiveDate: params.effectiveDate,
      expirationDate: params.expirationDate,
      renewalDate: params.renewalDate,
      fileFormat: params.fileFormat,
      fileSize: params.fileSize,
      fileSizeBytes: params.fileSizeBytes || 2048000,
      fileUrl: params.fileName,
      relations: links,
      versions: [firstVersion],
      auditHistory: [auditEntry],
    };

    this.documents = [newDoc, ...this.documents];
    this.persist();

    // Cross-system global audit
    auditLogService.log({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'System',
      recordId: docId,
      recordTitle: `อัปโหลดเอกสาร: ${newDoc.title}`,
      details: `สร้างเอกสารเลขที่ ${docNo} ประเภท ${newDoc.docType} เวอร์ชัน ${versionStr}`,
    });

    return newDoc;
  }

  /**
   * Add New Version to Existing Document
   */
  public uploadNewVersion(
    documentId: string,
    params: {
      newVersionNumber: string; // e.g. "v1.1" or "v2.0"
      fileName: string;
      fileFormat: DmsFileFormat;
      fileSize: string;
      fileSizeBytes?: number;
      changeDescription: string;
      effectiveDate?: string;
      expirationDate?: string;
    },
    currentUser: UserProfile
  ): CentralManagedDocument {
    const docIndex = this.documents.findIndex((d) => d.id === documentId);
    if (docIndex === -1) throw new Error('ไม่พบเอกสารที่ระบุ');

    const doc = this.documents[docIndex];

    if (!rbacService.can(currentUser, 'documents.upload')) {
      throw new Error('ท่านไม่มีสิทธิ์ในการอัปโหลดเวอร์ชันใหม่');
    }

    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10);
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // Demote old versions
    const updatedVersions = doc.versions.map((v) => ({
      ...v,
      isCurrent: false,
    }));

    const newVersionEntry: DocumentVersionEntry = {
      version: params.newVersionNumber,
      fileName: params.fileName,
      fileFormat: params.fileFormat,
      fileSize: params.fileSize,
      fileSizeBytes: params.fileSizeBytes || 2500000,
      fileUrl: params.fileName,
      uploadedAt: timeStr,
      uploadedById: currentUser.id,
      uploadedByName: currentUser.name,
      uploadedByRole: currentUser.role,
      changeDescription: params.changeDescription,
      isCurrent: true,
      metadataSnapshot: {
        title: doc.title,
        type: doc.docType,
        department: doc.department,
        status: doc.status,
        tags: doc.tags,
        effectiveDate: params.effectiveDate || doc.effectiveDate,
        expirationDate: params.expirationDate || doc.expirationDate,
      },
    };

    const auditEntry: DocumentAuditTrailEntry = {
      id: `aud-${Date.now()}`,
      documentId: doc.id,
      action: 'VERSION_CREATE',
      actionLabelTh: `ปรับปรุงเวอร์ชัน ${params.newVersionNumber}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: timeStr,
      details: `อัปโหลดเวอร์ชันใหม่ ${params.newVersionNumber} รายละเอียด: ${params.changeDescription}`,
      previousValue: doc.currentVersion,
      newValue: params.newVersionNumber,
    };

    const updatedDoc: CentralManagedDocument = {
      ...doc,
      currentVersion: params.newVersionNumber,
      fileFormat: params.fileFormat,
      fileSize: params.fileSize,
      fileSizeBytes: params.fileSizeBytes || 2500000,
      fileUrl: params.fileName,
      updatedAt: dateStr,
      updatedById: currentUser.id,
      updatedByName: currentUser.name,
      effectiveDate: params.effectiveDate || doc.effectiveDate,
      expirationDate: params.expirationDate || doc.expirationDate,
      versions: [newVersionEntry, ...updatedVersions],
      auditHistory: [auditEntry, ...doc.auditHistory],
    };

    this.documents[docIndex] = updatedDoc;
    this.persist();

    auditLogService.log({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'UPDATE',
      module: 'System',
      recordId: doc.id,
      recordTitle: `อัปโหลดเวอร์ชัน: ${doc.title} (${params.newVersionNumber})`,
      details: params.changeDescription,
    });

    return updatedDoc;
  }

  /**
   * Link Document to Record without duplicating files
   */
  public linkRelation(
    documentId: string,
    relation: Omit<DocumentRelationLink, 'id' | 'linkedAt' | 'linkedByName'>,
    currentUser: UserProfile
  ): CentralManagedDocument {
    const docIndex = this.documents.findIndex((d) => d.id === documentId);
    if (docIndex === -1) throw new Error('ไม่พบเอกสารที่ระบุ');

    const doc = this.documents[docIndex];

    // Avoid duplicate links
    const exists = doc.relations.some(
      (r) => r.targetModule === relation.targetModule && r.targetRecordId === relation.targetRecordId
    );
    if (exists) return doc;

    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10);
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const newLink: DocumentRelationLink = {
      ...relation,
      id: `rel-${Date.now()}`,
      linkedAt: dateStr,
      linkedByName: currentUser.name,
    };

    const auditEntry: DocumentAuditTrailEntry = {
      id: `aud-${Date.now()}`,
      documentId: doc.id,
      action: 'RELATION_ADD',
      actionLabelTh: `เชื่อมโยง ${relation.targetModule}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: timeStr,
      details: `เชื่อมโยงเอกสารเข้ากับ ${relation.targetRecordTitle} (${relation.targetRecordId})`,
    };

    const updatedDoc: CentralManagedDocument = {
      ...doc,
      relations: [...doc.relations, newLink],
      auditHistory: [auditEntry, ...doc.auditHistory],
    };

    this.documents[docIndex] = updatedDoc;
    this.persist();
    return updatedDoc;
  }

  /**
   * Remove Relation Link
   */
  public unlinkRelation(
    documentId: string,
    relationId: string,
    currentUser: UserProfile
  ): CentralManagedDocument {
    const docIndex = this.documents.findIndex((d) => d.id === documentId);
    if (docIndex === -1) throw new Error('ไม่พบเอกสารที่ระบุ');

    const doc = this.documents[docIndex];
    const removedRel = doc.relations.find((r) => r.id === relationId);
    if (!removedRel) return doc;

    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const auditEntry: DocumentAuditTrailEntry = {
      id: `aud-${Date.now()}`,
      documentId: doc.id,
      action: 'RELATION_REMOVE',
      actionLabelTh: `ยกเลิกการเชื่อมโยง`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: timeStr,
      details: `ยกเลิกการเชื่อมโยงกับ ${removedRel.targetRecordTitle}`,
    };

    const updatedDoc: CentralManagedDocument = {
      ...doc,
      relations: doc.relations.filter((r) => r.id !== relationId),
      auditHistory: [auditEntry, ...doc.auditHistory],
    };

    this.documents[docIndex] = updatedDoc;
    this.persist();
    return updatedDoc;
  }

  /**
   * Update Document Status & Lifecycle
   */
  public updateStatus(
    documentId: string,
    newStatus: DmsDocumentStatus,
    reason: string,
    currentUser: UserProfile
  ): CentralManagedDocument {
    const docIndex = this.documents.findIndex((d) => d.id === documentId);
    if (docIndex === -1) throw new Error('ไม่พบเอกสารที่ระบุ');

    const doc = this.documents[docIndex];
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const auditEntry: DocumentAuditTrailEntry = {
      id: `aud-${Date.now()}`,
      documentId: doc.id,
      action: newStatus === 'Approved' ? 'APPROVE' : 'STATUS_CHANGE',
      actionLabelTh: `เปลี่ยนสถานะเป็น ${newStatus}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: timeStr,
      details: `เปลี่ยนสถานะจาก ${doc.status} เป็น ${newStatus} (${reason})`,
      previousValue: doc.status,
      newValue: newStatus,
    };

    const updatedDoc: CentralManagedDocument = {
      ...doc,
      status: newStatus,
      updatedAt: timeStr.substring(0, 10),
      updatedById: currentUser.id,
      updatedByName: currentUser.name,
      auditHistory: [auditEntry, ...doc.auditHistory],
    };

    this.documents[docIndex] = updatedDoc;
    this.persist();

    auditLogService.log({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: newStatus === 'Approved' ? 'APPROVE' : 'UPDATE',
      module: 'System',
      recordId: doc.id,
      recordTitle: `สถานะเอกสาร: ${doc.title}`,
      details: `เปลี่ยนเป็น ${newStatus}: ${reason}`,
    });

    return updatedDoc;
  }

  /**
   * Edit Document Metadata
   */
  public updateMetadata(
    documentId: string,
    updates: Partial<Pick<CentralManagedDocument, 'title' | 'description' | 'docType' | 'department' | 'tags' | 'effectiveDate' | 'expirationDate' | 'renewalDate' | 'documentNo'>>,
    currentUser: UserProfile
  ): CentralManagedDocument {
    const docIndex = this.documents.findIndex((d) => d.id === documentId);
    if (docIndex === -1) throw new Error('ไม่พบเอกสารที่ระบุ');

    const doc = this.documents[docIndex];
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const auditEntry: DocumentAuditTrailEntry = {
      id: `aud-${Date.now()}`,
      documentId: doc.id,
      action: 'EDIT',
      actionLabelTh: 'แก้ไขข้อมูลเอกสาร',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: timeStr,
      details: `แก้ไขเมตาดาตาเอกสาร`,
    };

    const updatedDoc: CentralManagedDocument = {
      ...doc,
      ...updates,
      updatedAt: timeStr.substring(0, 10),
      updatedById: currentUser.id,
      updatedByName: currentUser.name,
      auditHistory: [auditEntry, ...doc.auditHistory],
    };

    this.documents[docIndex] = updatedDoc;
    this.persist();
    return updatedDoc;
  }

  /**
   * Record Download Action
   */
  public logDownload(documentId: string, versionNumber: string, currentUser: UserProfile) {
    const docIndex = this.documents.findIndex((d) => d.id === documentId);
    if (docIndex === -1) return;

    const doc = this.documents[docIndex];
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const auditEntry: DocumentAuditTrailEntry = {
      id: `aud-${Date.now()}`,
      documentId: doc.id,
      action: 'DOWNLOAD',
      actionLabelTh: `ดาวน์โหลดไฟล์ (${versionNumber})`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: timeStr,
      details: `ดาวน์โหลดไฟล์เวอร์ชัน ${versionNumber}`,
    };

    this.documents[docIndex] = {
      ...doc,
      downloadCount: doc.downloadCount + 1,
      auditHistory: [auditEntry, ...doc.auditHistory],
    };
    this.persist();
  }

  /**
   * Toggle Favorite
   */
  public toggleFavorite(documentId: string): boolean {
    const docIndex = this.documents.findIndex((d) => d.id === documentId);
    if (docIndex === -1) return false;

    const current = !!this.documents[docIndex].isFavorite;
    this.documents[docIndex] = {
      ...this.documents[docIndex],
      isFavorite: !current,
    };
    this.persist();
    return !current;
  }

  /**
   * Check expiration status helper
   */
  public getExpirationBadge(doc: CentralManagedDocument, referenceDate: Date = new Date()): {
    status: 'normal' | 'expiring_30_days' | 'expiring_7_days' | 'expired';
    labelTh: string;
    daysRemaining: number | null;
    badgeClass: string;
  } {
    if (!doc.expirationDate) {
      return {
        status: 'normal',
        labelTh: 'ไม่มีกำหนดหมดอายุ',
        daysRemaining: null,
        badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
      };
    }

    const expDate = new Date(doc.expirationDate);
    const diffMs = expDate.getTime() - referenceDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0 || doc.status === 'Expired') {
      return {
        status: 'expired',
        labelTh: 'หมดอายุแล้ว',
        daysRemaining: diffDays,
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      };
    }

    if (diffDays <= 7) {
      return {
        status: 'expiring_7_days',
        labelTh: `หมดอายุในอีก ${diffDays} วัน`,
        daysRemaining: diffDays,
        badgeClass: 'bg-red-50 text-red-700 border-red-200 font-semibold',
      };
    }

    if (diffDays <= 30) {
      return {
        status: 'expiring_30_days',
        labelTh: `หมดอายุในอีก ${diffDays} วัน`,
        daysRemaining: diffDays,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
      };
    }

    return {
      status: 'normal',
      labelTh: `มีผลถึง ${doc.expirationDate}`,
      daysRemaining: diffDays,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  /**
   * Filter & Search
   */
  public filterDocuments(options: DocumentFilterOptions, referenceDate: Date = new Date()): CentralManagedDocument[] {
    const search = (options.search || '').trim().toLowerCase();

    return this.documents.filter((doc) => {
      // 1. Text Search across Title, DocNo, Tags, Description, Owner
      if (search) {
        const inTitle = doc.title.toLowerCase().includes(search);
        const inNo = doc.documentNo.toLowerCase().includes(search);
        const inDesc = doc.description.toLowerCase().includes(search);
        const inOwner = doc.ownerName.toLowerCase().includes(search);
        const inDept = doc.department.toLowerCase().includes(search);
        const inTags = doc.tags.some((t) => t.toLowerCase().includes(search));
        const inVersions = doc.versions.some(
          (v) => v.version.toLowerCase().includes(search) || v.changeDescription.toLowerCase().includes(search)
        );
        const inRelations = doc.relations.some(
          (r) => (r.targetRecordCode || '').toLowerCase().includes(search) || r.targetRecordTitle.toLowerCase().includes(search)
        );

        if (!inTitle && !inNo && !inDesc && !inOwner && !inDept && !inTags && !inVersions && !inRelations) {
          return false;
        }
      }

      // 2. Doc Type
      if (options.docType && options.docType !== 'all') {
        if (doc.docType !== options.docType) return false;
      }

      // 3. Department
      if (options.department && options.department !== 'all') {
        if (!doc.department.includes(options.department)) return false;
      }

      // 4. Status
      if (options.status && options.status !== 'all') {
        if (doc.status !== options.status) return false;
      }

      // 5. File format
      if (options.fileFormat && options.fileFormat !== 'all') {
        if (doc.fileFormat !== options.fileFormat) return false;
      }

      // 6. Tag filter
      if (options.tag && options.tag !== 'all') {
        if (!doc.tags.includes(options.tag)) return false;
      }

      // 7. Related Module filter
      if (options.relatedModule && options.relatedModule !== 'all') {
        if (!doc.relations.some((r) => r.targetModule === options.relatedModule)) return false;
      }

      // 8. Expiry Warning filter
      if (options.expiryWarning && options.expiryWarning !== 'all') {
        const badge = this.getExpirationBadge(doc, referenceDate);
        if (options.expiryWarning === 'expired' && badge.status !== 'expired') return false;
        if (options.expiryWarning === 'expiring_7_days' && badge.status !== 'expiring_7_days') return false;
        if (options.expiryWarning === 'expiring_30_days' && badge.status !== 'expiring_30_days') return false;
      }

      return true;
    }).sort((a, b) => {
      const sortBy = options.sortBy || 'updatedAt';
      const order = options.sortOrder === 'asc' ? 1 : -1;

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'th') * order;
      }
      if (sortBy === 'downloadCount') {
        return (a.downloadCount - b.downloadCount) * order;
      }
      if (sortBy === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
      }
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * order;
    });
  }

  public getDocumentsByModuleRecord(targetModule: string, targetRecordId: string): CentralManagedDocument[] {
    return this.documents.filter((doc) =>
      doc.relations.some((r) => r.targetModule === targetModule && r.targetRecordId === targetRecordId)
    );
  }

  /**
   * Reset to seed
   */
  public resetToFactory(): void {
    this.documents = [...INITIAL_CENTRAL_DOCUMENTS];
    localStorage.removeItem(DMS_STORAGE_KEY);
    this.persist();
  }
}

export const centralDocumentService = new CentralDocumentService();
export default centralDocumentService;
