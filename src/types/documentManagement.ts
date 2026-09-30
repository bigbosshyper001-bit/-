/**
 * Document Management System Types
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 * 
 * Supports:
 * - 19 Document Types
 * - Document Statuses (Draft, Under Review, Approved, Expired, Archived)
 * - Version Control (v1.0, v1.1, v2.0, metadata comparison)
 * - Multi-record Relationships (MOU ↔ Joint Degree ↔ Crosswalk ↔ Resolution ↔ Action Item)
 * - Expiration tracking (30 days, 7 days, Expired)
 * - RBAC & Audit history
 */

export type DocumentClassificationType =
  | 'official_letter'      // หนังสือราชการ
  | 'order'                // คำสั่ง
  | 'announcement'         // ประกาศ
  | 'meeting_minutes'      // รายงานการประชุม
  | 'meeting_agenda'       // วาระการประชุม
  | 'resolution_register'  // ทะเบียนมติ
  | 'mou'                  // MOU
  | 'curriculum'           // Curriculum
  | 'curriculum_crosswalk' // Curriculum Crosswalk
  | 'kpi_doc'              // KPI documents
  | 'budget_doc'           // Budget documents
  | 'risk_doc'             // Risk documents
  | 'short_course_doc'     // Short Course documents
  | 'non_degree_doc'       // Non-degree documents
  | 'pre_degree_doc'       // Pre-degree documents
  | 'credit_bank_doc'      // Credit Bank documents
  | 'faculty_doc'          // Faculty documents
  | 'regulatory_doc'       // Regulatory documents
  | 'general_doc';         // General documents

export interface DocumentClassificationMeta {
  key: DocumentClassificationType;
  labelTh: string;
  labelEn: string;
  category: 'หนังสือและคำสั่ง' | 'การประชุมและมติ' | 'หลักสูตรและวิชาการ' | 'ยุทธศาสตร์และงบประมาณ' | 'บุคลากรและกำกับ';
  badgeColor: string;
}

export type DmsFileFormat =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'jpg'
  | 'png';

export type DmsDocumentStatus =
  | 'Draft'
  | 'Under Review'
  | 'Approved'
  | 'Expired'
  | 'Archived';

export interface DocumentVersionEntry {
  version: string; // e.g. "v1.0", "v1.1", "v2.0"
  fileName: string;
  fileFormat: DmsFileFormat;
  fileSize: string;
  fileSizeBytes: number;
  fileUrl: string;
  uploadedAt: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedByRole: string;
  changeDescription: string;
  isCurrent: boolean;
  metadataSnapshot?: {
    title: string;
    type: DocumentClassificationType;
    department: string;
    status: DmsDocumentStatus;
    tags: string[];
    effectiveDate?: string;
    expirationDate?: string;
  };
}

export interface DocumentRelationLink {
  id: string;
  targetModule:
    | 'meeting'
    | 'resolution'
    | 'action_item'
    | 'mou'
    | 'joint_degree'
    | 'dual_degree'
    | 'crosswalk'
    | 'kpi'
    | 'budget'
    | 'risk'
    | 'credit_bank'
    | 'faculty'
    | 'regulatory';
  targetRecordId: string;
  targetRecordCode?: string;
  targetRecordTitle: string;
  targetPath?: string;
  relationshipType: 'primary' | 'reference' | 'attachment' | 'approved_basis';
  linkedAt: string;
  linkedByName: string;
}

export interface DocumentAuditTrailEntry {
  id: string;
  documentId: string;
  action:
    | 'UPLOAD'
    | 'DOWNLOAD'
    | 'EDIT'
    | 'DELETE'
    | 'VERSION_CREATE'
    | 'APPROVE'
    | 'STATUS_CHANGE'
    | 'RELATION_ADD'
    | 'RELATION_REMOVE';
  actionLabelTh: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface CentralManagedDocument {
  id: string;
  documentNo: string; // e.g. "มจร-กว-2569/018"
  title: string;
  description: string;
  docType: DocumentClassificationType;
  department: string;
  ownerId: string;
  ownerName: string;
  ownerPosition: string;
  ownerEmail: string;
  status: DmsDocumentStatus;
  currentVersion: string; // "v1.0", "v1.1", "v2.0"
  createdAt: string;
  createdById: string;
  createdByName: string;
  updatedAt: string;
  updatedById: string;
  updatedByName: string;
  downloadCount: number;
  isFavorite?: boolean;
  tags: string[];
  
  // Dates & Expiration Management
  effectiveDate?: string; // YYYY-MM-DD
  expirationDate?: string; // YYYY-MM-DD
  renewalDate?: string; // YYYY-MM-DD

  // File attributes of current active version
  fileFormat: DmsFileFormat;
  fileSize: string;
  fileSizeBytes: number;
  fileUrl: string;

  // Multi-record relationships
  relations: DocumentRelationLink[];

  // Version History
  versions: DocumentVersionEntry[];

  // Audit History
  auditHistory: DocumentAuditTrailEntry[];

  // Workflow integration
  workflowInstanceId?: string;
}

export interface DocumentFilterOptions {
  search?: string;
  docType?: DocumentClassificationType | 'all';
  department?: string | 'all';
  status?: DmsDocumentStatus | 'all';
  fileFormat?: DmsFileFormat | 'all';
  owner?: string | 'all';
  tag?: string | 'all';
  relatedModule?: string | 'all';
  expiryWarning?: 'all' | 'expired' | 'expiring_7_days' | 'expiring_30_days';
  sortBy?: 'updatedAt' | 'createdAt' | 'title' | 'version' | 'downloadCount';
  sortOrder?: 'asc' | 'desc';
}
