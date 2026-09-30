/**
 * Institutional Error Handling Service
 * 
 * Standardizes errors across all modules:
 * - Success
 * - Warning
 * - Error
 * - Unauthorized
 * - Forbidden
 * - Not Found
 * - Server Error
 * - ValidationError
 * - IntegrityError
 * 
 * Never exposes raw technical stack traces to end users.
 * Provides clear, actionable institutional feedback.
 */

export type InstitutionalErrorSeverity =
  | 'Success'
  | 'Warning'
  | 'Error'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'ServerError'
  | 'ValidationError'
  | 'IntegrityError';

export interface AppErrorPayload {
  code: string;
  type: InstitutionalErrorSeverity;
  title: string;
  message: string;
  actionableHint?: string;
  technicalDetails?: string; // Kept internally for diagnostic audit only
  field?: string;
  timestamp: string;
}

export class InstitutionalError extends Error {
  public readonly payload: AppErrorPayload;

  constructor(
    type: InstitutionalErrorSeverity,
    title: string,
    message: string,
    actionableHint?: string,
    technicalDetails?: string,
    code = 'MCU_ERR_' + Math.floor(1000 + Math.random() * 9000)
  ) {
    super(message);
    this.name = 'InstitutionalError';
    this.payload = {
      code,
      type,
      title,
      message,
      actionableHint: actionableHint || 'กรุณาตรวจสอบข้อมูลหรือติดต่อผู้ดูแลระบบกองวิชาการ',
      technicalDetails,
      timestamp: new Date().toISOString(),
    };
  }
}

export const errorService = {
  /**
   * Create 401 Unauthorized Error
   */
  unauthorized(message = 'กรุณาเข้าสู่ระบบก่อนดำเนินการ'): InstitutionalError {
    return new InstitutionalError(
      'Unauthorized',
      'จำเป็นต้องเข้าสู่ระบบ (401 Unauthorized)',
      message,
      'กรุณาลงชื่อเข้าใช้ด้วยบัญชีบุคลากร มจร ก่อนเข้าถึงข้อมูลนี้',
      'Session token is missing, expired, or invalid'
    );
  },

  /**
   * Create 403 Forbidden Error
   */
  forbidden(
    permissionRequired?: string,
    message = 'ท่านไม่มีสิทธิ์ในการดำเนินการนี้'
  ): InstitutionalError {
    const hint = permissionRequired
      ? `ต้องการสิทธิ์: "${permissionRequired}" กรุณาติดต่อผู้ดูแลระบบ (Super Admin) เพื่อขอเพิ่มสิทธิ์การใช้งาน`
      : 'หากจำเป็นต้องเข้าถึงข้อมูลนี้ กรุณาติดต่อหัวหน้าหน่วยงานหรือผู้ดูแลระบบ';
    return new InstitutionalError(
      'Forbidden',
      'ปฏิเสธการเข้าถึง (403 Forbidden)',
      message,
      hint,
      `Permission check failed: ${permissionRequired || 'Unknown'}`
    );
  },

  /**
   * Create 404 Not Found Error
   */
  notFound(recordType: string, id: string): InstitutionalError {
    return new InstitutionalError(
      'NotFound',
      'ไม่พบข้อมูลในระบบ (404 Not Found)',
      `ไม่พบข้อมูล ${recordType} รหัส "${id}" ที่ท่านระบุ`,
      'กรุณาตรวจสอบรหัสอ้างอิง หรือข้อมูลอาจถูกย้าย/ยกเลิกไปแล้ว',
      `Record lookup failed for entity=${recordType}, id=${id}`
    );
  },

  /**
   * Create Validation Error
   */
  validationError(
    message: string,
    fieldErrors?: Record<string, string>,
    actionableHint = 'กรุณาตรวจสอบและกรอกข้อมูลในช่องที่มีเครื่องหมายดอกจัน (*) ให้ครบถ้วนถูกต้อง'
  ): InstitutionalError {
    return new InstitutionalError(
      'ValidationError',
      'ข้อมูลไม่ผ่านการตรวจสอบความถูกต้อง',
      message,
      actionableHint,
      JSON.stringify(fieldErrors || {})
    );
  },

  /**
   * Create Referential Integrity Error
   */
  integrityError(
    title: string,
    message: string,
    actionableHint: string
  ): InstitutionalError {
    return new InstitutionalError(
      'IntegrityError',
      title,
      message,
      actionableHint,
      'Foreign key constraint or cascade protection rule prevented deletion/update'
    );
  },

  /**
   * Create Server/Internal Error with sanitization
   */
  serverError(err: any): InstitutionalError {
    const rawMsg = err instanceof Error ? err.message : String(err);
    return new InstitutionalError(
      'ServerError',
      'เกิดข้อผิดพลาดในการประมวลผล (500)',
      'ระบบไม่สามารถดำเนินคำขอได้ในขณะนี้ ข้อมูลของท่านยังคงปลอดภัย',
      'กรุณารอครู่หนึ่งแล้วลองใหม่อีกครั้ง หากปัญหายังคงอยู่กรุณาแจ้งฝ่ายเทคโนโลยีสารสนเทศ กองวิชาการ',
      rawMsg
    );
  },

  /**
   * User-facing safe error message extractor
   * NEVER returns technical stack traces
   */
  formatUserErrorMessage(err: unknown): {
    title: string;
    message: string;
    actionableHint: string;
    type: InstitutionalErrorSeverity;
  } {
    if (err instanceof InstitutionalError) {
      return {
        title: err.payload.title,
        message: err.payload.message,
        actionableHint: err.payload.actionableHint || '',
        type: err.payload.type,
      };
    }

    if (err instanceof Error) {
      // If error message was custom formulated
      return {
        title: 'แจ้งเตือนระบบ',
        message: err.message,
        actionableHint: 'กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง',
        type: 'Error',
      };
    }

    return {
      title: 'เกิดข้อผิดพลาด',
      message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง',
      actionableHint: 'หากปัญหายังคงอยู่ ติดต่อผู้ดูแลระบบกองวิชาการ มจร',
      type: 'ServerError',
    };
  },
};
