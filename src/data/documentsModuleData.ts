/**
 * Document Center & Library Data Model
 * 
 * Supports:
 * - File formats: PDF, DOCX, XLSX, PPTX, JPG, PNG
 * - Metadata: ชื่อ, ประเภท, หน่วยงาน, เจ้าของ, วันที่, Version, Status, Permission
 * - Version History
 * - Quick Categories: Recent, Favorites, Recently Updated, My Documents, Shared Documents
 */

export type DocumentFileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'jpg' | 'png';

export type DocumentCategory =
  | 'regulations_orders' // ระเบียบและคำสั่ง
  | 'curriculum_mko' // หลักสูตรและ มคอ.
  | 'forms_templates' // แบบฟอร์มและเทมเพลต
  | 'meeting_minutes' // รายงานการประชุม
  | 'research_academic' // งานวิจัยและเอกสารวิชาการ
  | 'public_relations'; // ประชาสัมพันธ์และสื่อ

export type DocumentPermission = 'public' | 'internal_staff' | 'faculty_only' | 'committee_only' | 'admin_only';

export type DocumentStatus = 'active' | 'draft' | 'under_review' | 'archived';

export interface DocumentVersion {
  version: string;
  updatedAt: string;
  updatedBy: string;
  fileUrl: string;
  fileSize: string;
  changelog: string;
}

export interface CentralDocument {
  id: string;
  documentNo?: string;
  title: string;
  fileType: DocumentFileType;
  fileSize: string;
  category: DocumentCategory;
  categoryLabelTh: string;
  department: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  status: DocumentStatus;
  permission: DocumentPermission;
  permissionLabelTh: string;
  downloadCount: number;
  isFavorite: boolean;
  isShared: boolean;
  isMyDocument: boolean;
  tags: string[];
  versionHistory: DocumentVersion[];
  description?: string;
}

// -------------------------------------------------------------
// REAL DATABASE BACKED STORES - INITIALIZED EMPTY
// -------------------------------------------------------------

export const INITIAL_DOCUMENTS: CentralDocument[] = [];
