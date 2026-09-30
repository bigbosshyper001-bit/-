/**
 * Official Thai Government Document Template Renderer
 * Generates standards-compliant HTML formatted for:
 * - Microsoft Word (.doc) with TH Sarabun New typography
 * - Printable PDF with Garuda seal and institutional margins
 */

import type { OfficialDocTemplate } from '../types/architecture.ts';

// SVG Garuda Emblem (ตราครุฑ มาตรฐานงานสารบรรณ)
export const THAI_GARUDA_SVG = `
<svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; margin: 0 auto;">
  <path d="M50 8C48 14 44 20 40 24C36 28 30 30 26 31C24 35 24 40 27 44C30 48 35 50 39 50C42 50 44 48 45 46C46 51 45 56 42 61C39 66 33 70 28 73C33 74 38 73 42 71C46 69 49 65 50 61C51 65 54 69 58 71C62 73 67 74 72 73C67 70 61 66 58 61C55 56 54 51 55 46C56 48 58 50 61 50C65 50 70 48 73 44C76 40 76 35 74 31C70 30 64 28 60 24C56 20 52 14 50 8Z" fill="#8B0000"/>
  <path d="M43 28C41 33 37 37 32 39C30 42 32 46 36 46C40 46 43 43 45 40C44 36 44 32 43 28Z" fill="#C53030"/>
  <path d="M57 28C59 33 63 37 68 39C70 42 68 46 64 46C60 46 57 43 55 40C56 36 56 32 57 28Z" fill="#C53030"/>
  <circle cx="50" cy="22" r="4" fill="#8B0000"/>
  <path d="M46 52C48 56 50 59 50 64C50 59 52 56 54 52C52 53 48 53 46 52Z" fill="#8B0000"/>
  <path d="M35 75C40 79 45 84 50 90C55 84 60 79 65 75C60 77 55 78 50 78C45 78 40 77 35 75Z" fill="#8B0000"/>
</svg>
`;

export const documentTemplateRenderer = {
  /**
   * Render complete HTML document based on template category and form values
   */
  renderHtml(template: OfficialDocTemplate, values: Record<string, string>): string {
    switch (template.category) {
      case 'memo':
        return this.renderMemo(values);
      case 'meeting_agenda':
        return this.renderMeetingAgenda(values);
      case 'meeting_minutes':
        return this.renderMeetingMinutes(values);
      case 'resolution_notice':
        return this.renderResolutionNotice(values);
      case 'appointment_order':
        return this.renderAppointmentOrder(values);
      case 'action_plan_report':
      default:
        return this.renderActionPlanReport(values);
    }
  },

  renderMemo(values: Record<string, string>): string {
    return `
      <div style="font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.25; color: #000;">
        <table style="width: 100%; border: none; border-collapse: collapse; margin-bottom: 8pt;">
          <tr>
            <td style="width: 15%; border: none; vertical-align: top; text-align: left;">
              ${THAI_GARUDA_SVG}
            </td>
            <td style="width: 85%; border: none; text-align: center; vertical-align: middle;">
              <span style="font-size: 29pt; font-weight: bold; letter-spacing: 1px;">บันทึกข้อความ</span>
            </td>
          </tr>
        </table>

        <div style="border-bottom: 2pt solid #000; padding-bottom: 6pt; margin-bottom: 12pt;">
          <p style="margin: 3pt 0;"><strong>ส่วนราชการ:</strong> ${values.department || ''}</p>
          <table style="width: 100%; border: none; border-collapse: collapse; margin: 3pt 0;">
            <tr>
              <td style="width: 50%; border: none; padding: 0;"><strong>ที่:</strong> ${values.docNumber || ''}</td>
              <td style="width: 50%; border: none; padding: 0;"><strong>วันที่:</strong> ${values.docDate || ''}</td>
            </tr>
          </table>
          <p style="margin: 3pt 0;"><strong>เรื่อง:</strong> ${values.subject || ''}</p>
        </div>

        <p style="margin: 6pt 0 12pt 0;"><strong>เรียน:</strong> ${values.recipient || ''}</p>

        <div style="text-align: justify; text-indent: 40pt; margin-bottom: 12pt; white-space: pre-line;">
          ${values.factSection || ''}
        </div>

        <div style="text-align: justify; text-indent: 40pt; margin-bottom: 12pt; white-space: pre-line;">
          ${values.considerationSection || ''}
        </div>

        <div style="text-align: justify; text-indent: 40pt; margin-bottom: 24pt; white-space: pre-line;">
          ${values.proposalSection || ''}
        </div>

        <div style="margin-top: 36pt; width: 100%;">
          <table style="width: 100%; border: none; border-collapse: collapse;">
            <tr>
              <td style="width: 45%; border: none;"></td>
              <td style="width: 55%; border: none; text-align: center; font-size: 16pt;">
                (ลงชื่อ) ....................................................<br><br>
                ( ${values.signName || ''} )<br>
                ${values.signPosition || ''}
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  },

  renderMeetingAgenda(values: Record<string, string>): string {
    return `
      <div style="font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.25; color: #000;">
        <div style="text-align: center; margin-bottom: 12pt;">
          ${THAI_GARUDA_SVG}
          <h2 style="font-size: 20pt; font-weight: bold; margin: 8pt 0 2pt 0;">${values.meetingTitle || 'ระเบียบวาระการประชุมสภาวิชาการ'}</h2>
          <h3 style="font-size: 18pt; font-weight: bold; margin: 0 0 4pt 0;">${values.meetingRound || ''}</h3>
          <p style="font-size: 16pt; margin: 2pt 0;">${values.meetingDateTime || ''}</p>
          <p style="font-size: 15pt; color: #333; margin: 2pt 0;">${values.meetingLocation || ''}</p>
        </div>

        <hr style="border: 0; border-top: 1pt solid #000; margin: 12pt 0 16pt 0;">

        <div style="margin-bottom: 14pt;">
          <strong style="font-size: 17pt;">วาระที่ ๑ เรื่องประธานแจ้งให้ที่ประชุมทราบ</strong>
          <div style="margin-left: 20pt; margin-top: 4pt; white-space: pre-line;">${values.agenda1 || '-'}</div>
        </div>

        <div style="margin-bottom: 14pt;">
          <strong style="font-size: 17pt;">วาระที่ ๒ เรื่องรับรองรายงานการประชุม</strong>
          <div style="margin-left: 20pt; margin-top: 4pt; white-space: pre-line;">${values.agenda2 || '-'}</div>
        </div>

        <div style="margin-bottom: 14pt;">
          <strong style="font-size: 17pt;">วาระที่ ๓ เรื่องสืบเนื่องจากการประชุมครั้งก่อน</strong>
          <div style="margin-left: 20pt; margin-top: 4pt; white-space: pre-line;">${values.agenda3 || '-'}</div>
        </div>

        <div style="margin-bottom: 14pt;">
          <strong style="font-size: 17pt; color: #831843;">วาระที่ ๔ เรื่องเสนอเพื่อพิจารณา</strong>
          <div style="margin-left: 20pt; margin-top: 4pt; white-space: pre-line;">${values.agenda4 || '-'}</div>
        </div>

        <div style="margin-bottom: 14pt;">
          <strong style="font-size: 17pt;">วาระที่ ๕ เรื่องเสนอเพื่อทราบ</strong>
          <div style="margin-left: 20pt; margin-top: 4pt; white-space: pre-line;">${values.agenda5 || '-'}</div>
        </div>

        <div style="margin-bottom: 14pt;">
          <strong style="font-size: 17pt;">วาระที่ ๖ เรื่องอื่นๆ (ถ้ามี)</strong>
          <div style="margin-left: 20pt; margin-top: 4pt; white-space: pre-line;">${values.agenda6 || '-'}</div>
        </div>

        <div style="margin-top: 36pt; width: 100%;">
          <table style="width: 100%; border: none; border-collapse: collapse;">
            <tr>
              <td style="width: 45%; border: none;"></td>
              <td style="width: 55%; border: none; text-align: center; font-size: 16pt;">
                (ลงชื่อ) ....................................................<br><br>
                ( ${values.signName || ''} )<br>
                ${values.signPosition || 'เลขานุการสภาวิชาการ'}
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  },

  renderMeetingMinutes(values: Record<string, string>): string {
    return `
      <div style="font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.25; color: #000;">
        <div style="text-align: center; margin-bottom: 12pt;">
          ${THAI_GARUDA_SVG}
          <h2 style="font-size: 20pt; font-weight: bold; margin: 8pt 0 2pt 0;">${values.minutesTitle || 'รายงานการประชุมสภาวิชาการ'}</h2>
          <h3 style="font-size: 18pt; font-weight: bold; margin: 0 0 4pt 0;">${values.roundAndYear || ''}</h3>
          <p style="font-size: 16pt; margin: 2pt 0;">${values.heldDate || ''}</p>
          <p style="font-size: 15pt; color: #333; margin: 2pt 0;">${values.meetingVenue || ''}</p>
        </div>

        <hr style="border: 0; border-top: 1pt solid #000; margin: 10pt 0 14pt 0;">

        <div style="margin-bottom: 12pt;">
          <strong>ผู้มาประชุม:</strong>
          <div style="margin-left: 20pt; white-space: pre-line;">${values.attendees || ''}</div>
        </div>

        ${values.absentees ? `
        <div style="margin-bottom: 12pt;">
          <strong>ผู้ไม่มาประชุม:</strong>
          <div style="margin-left: 20pt; white-space: pre-line;">${values.absentees}</div>
        </div>` : ''}

        ${values.invitedGuests ? `
        <div style="margin-bottom: 12pt;">
          <strong>ผู้เข้าร่วมประชุม:</strong>
          <div style="margin-left: 20pt; white-space: pre-line;">${values.invitedGuests}</div>
        </div>` : ''}

        <p style="margin: 8pt 0;"><strong>เริ่มประชุมเวลา:</strong> ${values.startTime || ''}</p>

        <div style="margin: 16pt 0; text-align: justify; line-height: 1.35; white-space: pre-line;">
          ${values.contentDetail || ''}
        </div>

        <p style="margin: 8pt 0;"><strong>เลิกประชุมเวลา:</strong> ${values.endTime || ''}</p>

        <div style="margin-top: 36pt; width: 100%;">
          <table style="width: 100%; border: none; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
                (ลงชื่อ) .................................................... ผู้จดรายงานการประชุม<br>
                ( ${values.recorderName || ''} )<br>
                นักวิชาการศึกษา
              </td>
              <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
                (ลงชื่อ) .................................................... ผู้ตรวจรายงานการประชุม<br>
                ( ${values.reviewerName || ''} )<br>
                เลขานุการสภาวิชาการ
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  },

  renderResolutionNotice(values: Record<string, string>): string {
    return `
      <div style="font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.25; color: #000;">
        <table style="width: 100%; border: none; border-collapse: collapse; margin-bottom: 8pt;">
          <tr>
            <td style="width: 15%; border: none; vertical-align: top;">
              ${THAI_GARUDA_SVG}
            </td>
            <td style="width: 85%; border: none; text-align: right; vertical-align: top; font-size: 15pt;">
              ${values.officeHeader || ''}
            </td>
          </tr>
        </table>

        <table style="width: 100%; border: none; border-collapse: collapse; margin: 4pt 0 10pt 0;">
          <tr>
            <td style="width: 60%; border: none; padding: 0;"><strong>ที่:</strong> ${values.docCode || ''}</td>
            <td style="width: 40%; border: none; padding: 0; text-align: right;"><strong>ลงวันที่:</strong> ${values.issueDate || ''}</td>
          </tr>
        </table>

        <p style="margin: 4pt 0;"><strong>เรื่อง:</strong> ${values.titleSubject || ''}</p>
        <p style="margin: 4pt 0;"><strong>เรียน:</strong> ${values.toEntity || ''}</p>
        <p style="margin: 4pt 0 14pt 0;"><strong>สิ่งที่ส่งมาด้วย:</strong><br><span style="margin-left: 20pt; white-space: pre-line;">${values.enclosures || '-'}</span></p>

        <div style="text-align: justify; text-indent: 40pt; margin-bottom: 24pt; line-height: 1.35; white-space: pre-line;">
          ${values.messageBody || ''}
        </div>

        <div style="margin-top: 40pt; width: 100%;">
          <table style="width: 100%; border: none; border-collapse: collapse;">
            <tr>
              <td style="width: 45%; border: none;"></td>
              <td style="width: 55%; border: none; text-align: center;">
                (ลงชื่อ) ....................................................<br><br>
                ( ${values.signerName || ''} )<br>
                ${values.signerTitle || ''}
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  },

  renderAppointmentOrder(values: Record<string, string>): string {
    return `
      <div style="font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.25; color: #000;">
        <div style="text-align: center; margin-bottom: 12pt;">
          ${THAI_GARUDA_SVG}
          <h2 style="font-size: 20pt; font-weight: bold; margin: 8pt 0 4pt 0;">${values.orderNumber || 'คำสั่งมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย'}</h2>
          <h3 style="font-size: 18pt; font-weight: bold; margin: 0 0 12pt 0;">${values.orderTitle || ''}</h3>
        </div>

        <div style="text-align: justify; text-indent: 40pt; margin-bottom: 14pt; white-space: pre-line; line-height: 1.35;">
          ${values.legalAuthority || ''}
        </div>

        <div style="margin-left: 20pt; margin-bottom: 16pt; white-space: pre-line;">
          ${values.committeeList || ''}
        </div>

        <div style="margin-bottom: 16pt;">
          <strong>ให้มีอำนาจและหน้าที่ ดังนี้</strong>
          <div style="margin-left: 20pt; margin-top: 4pt; white-space: pre-line;">
            ${values.dutiesAndPowers || ''}
          </div>
        </div>

        <p style="text-indent: 40pt; margin-top: 20pt;">ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป</p>

        <p style="text-align: right; margin-top: 14pt; margin-right: 40pt;">${values.effectiveDate || ''}</p>

        <div style="margin-top: 36pt; width: 100%;">
          <table style="width: 100%; border: none; border-collapse: collapse;">
            <tr>
              <td style="width: 40%; border: none;"></td>
              <td style="width: 60%; border: none; text-align: center;">
                (ลงชื่อ) ....................................................<br><br>
                ( ${values.chancellorName || ''} )<br>
                ${values.chancellorTitle || 'อธิการบดีมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย'}
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  },

  renderActionPlanReport(values: Record<string, string>): string {
    return `
      <div style="font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.25; color: #000;">
        <div style="text-align: center; margin-bottom: 12pt;">
          ${THAI_GARUDA_SVG}
          <h2 style="font-size: 20pt; font-weight: bold; margin: 8pt 0 4pt 0;">แบบรายงานผลการดำเนินงานตามแผนปฏิบัติการ</h2>
          <h3 style="font-size: 17pt; font-weight: bold; margin: 0 0 4pt 0;">ประจำปีงบประมาณ ${values.fiscalYear || '๒๕๖๙'}</h3>
          <p style="font-size: 15pt; color: #4B5563; margin: 0;">${values.agencyName || ''}</p>
        </div>

        <hr style="border: 0; border-top: 1pt solid #000; margin: 10pt 0 14pt 0;">

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14pt;">
          <tr>
            <td style="width: 25%; font-weight: bold; background: #F9FAFB; padding: 6pt; border: 1pt solid #000;">ชื่อโครงการ/แผนงาน</td>
            <td style="width: 75%; padding: 6pt; border: 1pt solid #000;">${values.projectTitle || ''}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #F9FAFB; padding: 6pt; border: 1pt solid #000;">สอดคล้องยุทธศาสตร์</td>
            <td style="padding: 6pt; border: 1pt solid #000;">${values.strategicPillar || ''}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #F9FAFB; padding: 6pt; border: 1pt solid #000;">วัตถุประสงค์</td>
            <td style="padding: 6pt; border: 1pt solid #000; white-space: pre-line;">${values.objectiveSummary || ''}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #F9FAFB; padding: 6pt; border: 1pt solid #000;">ความก้าวหน้าโครงการ</td>
            <td style="padding: 6pt; border: 1pt solid #000; white-space: pre-line;">${values.progressStatus || ''}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #F9FAFB; padding: 6pt; border: 1pt solid #000;">การใช้งบประมาณ</td>
            <td style="padding: 6pt; border: 1pt solid #000; white-space: pre-line;">${values.budgetReport || ''}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #F9FAFB; padding: 6pt; border: 1pt solid #000;">ปัญหาและแนวทางแก้ไข</td>
            <td style="padding: 6pt; border: 1pt solid #000; white-space: pre-line;">${values.issuesAndSolutions || ''}</td>
          </tr>
        </table>

        <div style="margin-top: 36pt; width: 100%;">
          <table style="width: 100%; border: none; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; border: none;"></td>
              <td style="width: 50%; border: none; text-align: center;">
                (ลงชื่อ) .................................................... ผู้รายงาน<br><br>
                ( ${values.reporterName || ''} )<br>
                ${values.reporterPosition || ''}
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  },
};
