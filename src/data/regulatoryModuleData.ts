/**
 * Regulatory Management Data Model
 * 
 * Regulatory Matrix:
 * - Regulation
 * - Type: กฎหมาย, กฎกระทรวง, ประกาศ, หลักเกณฑ์, คำสั่ง, MOU
 * - Issuing Authority
 * - Effective Date
 * - Related Unit (เกี่ยวข้องกับใคร?)
 * - Responsible Person (ใครรับผิดชอบ?)
 * - Required Action (ต้องทำอะไร?)
 * - Deadline
 * - Status (รอการดำเนินการ, กำลังปฏิบัติตาม, ปฏิบัติครบถ้วนแล้ว, เฝ้าระวัง/ใกล้กำหนด)
 */

export type RegulatoryType = 'กฎหมาย' | 'กฎกระทรวง' | 'ประกาศ' | 'หลักเกณฑ์' | 'คำสั่ง' | 'MOU';

export type RegulatoryStatus = 'compliant' | 'in_progress' | 'pending' | 'warning' | 'review';

export interface RegulatoryRecord {
  id: string;
  code: string;
  regulationTitle: string;
  type: RegulatoryType;
  issuingAuthority: string;
  effectiveDate: string;
  relatedUnits: string[]; // เกี่ยวข้องกับใคร?
  responsiblePerson: string; // ใครรับผิดชอบ?
  responsibleRole: string;
  requiredAction: string; // ต้องทำอะไร?
  actionChecklist: { id: string; title: string; done: boolean }[];
  deadline: string; // Deadline?
  daysRemaining?: number;
  status: RegulatoryStatus; // สถานะ?
  impactLevel: 'high' | 'medium' | 'low';
  documentFile: string;
  complianceNotes: string;
  lastUpdated: string;
}

// -------------------------------------------------------------
// REAL DATABASE BACKED STORES - INITIALIZED EMPTY
// -------------------------------------------------------------

export const INITIAL_REGULATORY_RECORDS: RegulatoryRecord[] = [];
