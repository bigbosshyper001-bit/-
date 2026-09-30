/**
 * Meeting & Resolution Management Data Store
 * ระบบการประชุมและมติ - กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (Clean Slate for Production)
 */

export interface MeetingAgendaItem {
  id: string;
  order: number;
  itemNumber: string; // e.g. "1.1", "4.2"
  title: string;
  description: string;
  category: 'แจ้งเพื่อทราบ' | 'รับรองรายงาน' | 'เรื่องสืบเนื่อง' | 'เสนอเพื่อพิจารณา' | 'เรื่องอื่นๆ';
  presenter: string;
  presenterRole: string;
  department: string;
  durationMinutes: number;
  documents: { name: string; size: string; type: string }[];
  resolutionProposal?: string;
  resolutionDecision?: string;
  resolutionId?: string;
}

export interface MeetingAttendee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'attended' | 'absent' | 'assigned_substitute' | 'invited';
  substituteName?: string;
}

export interface MeetingRecord {
  id: string;
  code: string; // e.g. "สว.2569/08"
  title: string;
  sessionNumber: number;
  fiscalYear: string;
  date: string; // YYYY-MM-DD
  timeStart: string;
  timeEnd: string;
  venue: string;
  chairperson: string;
  secretary: string;
  department: string;
  notes: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  agendas: MeetingAgendaItem[];
  attendees: MeetingAttendee[];
  totalResolutions: number;
  completedResolutions: number;
}

export interface ResolutionRecord {
  id: string; // RES-2569-08-01
  meetingId: string;
  meetingTitle: string;
  agendaItemNumber: string;
  title: string;
  details: string;
  responsiblePerson: string;
  department: string;
  deadline: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'overdue';
  evidence?: {
    title: string;
    submittedDate: string;
    fileUrl?: string;
    verifiedBy?: string;
  };
  createdDate: string;
}

export interface MeetingTask {
  id: string;
  resolutionId: string;
  title: string;
  department: string;
  assignee: string;
  deadline: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'in_review' | 'completed' | 'overdue';
  progress: number;
  meetingReference: string;
  updatedAt: string;
}

export interface MeetingOrderRecord {
  id: string;
  orderNumber: string; // คำสั่ง มจร ที่ 124/2569
  title: string;
  issuedDate: string;
  signedBy: string;
  committeeType: 'สภาวิชาการ' | 'กลั่นกรองหลักสูตร' | 'พัฒนาอาจารย์' | 'คลังหน่วยกิต';
  status: 'active' | 'expired';
  membersCount: number;
  fileUrl: string;
}

export interface MeetingInvitationRecord {
  id: string;
  letterNumber: string; // ศธ 0524.03/ว 412
  meetingId: string;
  meetingTitle: string;
  subject: string;
  sentDate: string;
  meetingDate: string;
  recipientsCount: number;
  confirmedCount: number;
  status: 'sent' | 'draft' | 'read';
}

export interface MeetingNotification {
  id: string;
  type: 'deadline_soon' | 'overdue' | 'new_task' | 'reassigned' | 'status_changed';
  title: string;
  description: string;
  timestamp: string;
  targetId: string;
  isRead: boolean;
}

// -------------------------------------------------------------
// PRODUCTION-READY DATA STORES (CLEAN SLATE - READY FOR REAL DATA)
// -------------------------------------------------------------
export const INITIAL_MEETINGS: MeetingRecord[] = [];
export const INITIAL_RESOLUTIONS: ResolutionRecord[] = [];
export const INITIAL_TASKS: MeetingTask[] = [];
export const INITIAL_ORDERS: MeetingOrderRecord[] = [];
export const INITIAL_INVITATIONS: MeetingInvitationRecord[] = [];
export const INITIAL_NOTIFICATIONS: MeetingNotification[] = [];
