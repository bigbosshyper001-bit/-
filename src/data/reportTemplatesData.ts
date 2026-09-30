/**
 * Report Definitions & Official Thai Government Document Templates
 * Supports all 11 user requested reports + 6 Editable Official Government Document Templates
 */

import type { OfficialDocTemplate } from '../types/architecture.ts';

export interface ReportDefinition {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  category: 'academic' | 'council' | 'strategy' | 'faculty' | 'credit_bank' | 'collaboration';
  description: string;
  department: string;
  defaultFilename: string;
  columns: { key: string; title: string; width?: number }[];
  fetchData: () => Record<string, any>[];
}

export const OFFICIAL_GOV_TEMPLATES: OfficialDocTemplate[] = [
  {
    id: 'gov-tmpl-01',
    code: 'MCU-FORM-MEMO',
    name: 'แบบบันทึกข้อความ (Official Memo)',
    category: 'memo',
    description: 'แบบบันทึกข้อความราชการมาตรฐานตามระเบียบสำนักนายกรัฐมนตรี พร้อมตราครุฑ ส่วนราชการ ข้อเท็จจริง ข้อพิจารณา และข้อเสนอ',
    fields: [
      { key: 'department', label: 'ส่วนราชการ', type: 'text', defaultValue: 'กองวิชาการ สำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย โทร. ๐-๓๕๒๔-๘๐๐๐' },
      { key: 'docNumber', label: 'ที่เอกสาร', type: 'text', defaultValue: 'อว ๐๖๒๕.๐๑/ว ' },
      { key: 'docDate', label: 'วันที่', type: 'text', defaultValue: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) },
      { key: 'subject', label: 'เรื่อง', type: 'text', defaultValue: 'ขออนุมัติบรรจุวาระการประชุมสภาวิชาการเพื่อพิจารณาปรับปรุงหลักสูตร' },
      { key: 'recipient', label: 'เรียน', type: 'text', defaultValue: 'รองอธิการบดีฝ่ายวิชาการ / เลขานุการสภาวิชาการ' },
      { key: 'factSection', label: '๑. ข้อเท็จจริง (ต้นเรื่อง)', type: 'textarea', defaultValue: 'ตามที่คณะพุทธศาสตร์ ได้ดำเนินการพัฒนาและปรับปรุงหลักสูตรพุทธศาสตรบัณฑิต เพื่อให้สอดคล้องตามเกณฑ์มาตรฐานหลักสูตรระดับอุดมศึกษา พ.ศ. ๒๕๖๕ และกรอบมาตรฐานคุณวุฒิระดับอุดมศึกษาแห่งชาติ โดยได้ผ่านความเห็นชอบจากคณะกรรมการประจำคณะพุทธศาสตร์ ในการประชุมครั้งที่ ๒/๒๕๖๙ เรียบร้อยแล้ว นั้น' },
      { key: 'considerationSection', label: '๒. ข้อพิจารณาและกฎหมายที่เกี่ยวข้อง', type: 'textarea', defaultValue: 'กองวิชาการได้ตรวจสอบเอกสารหลักสูตร มคอ.๒ โครงสร้างรายวิชา และแผนที่กระจายความรับผิดชอบมาตรฐานผลการเรียนรู้ พบว่ามีความถูกต้องครบถ้วนตามข้อบังคับมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ว่าด้วยการศึกษาระดับปริญญาตรี พ.ศ. ๒๕๔๒ และเกณฑ์ของกระทรวง อว.' },
      { key: 'proposalSection', label: '๓. ข้อเสนอแนะเพื่อพิจารณา', type: 'textarea', defaultValue: 'จึงเรียนมาเพื่อโปรดพิจารณาบรรจุเป็นวาระเพื่อพิจารณา ในการประชุมสภาวิชาการ ครั้งที่ ๓/๒๕๖๙ ต่อไป' },
      { key: 'signName', label: 'ชื่อผู้ลงนาม', type: 'text', defaultValue: 'พระมหาบุญเลิศ ช่วยธานี, ศ.ดร.' },
      { key: 'signPosition', label: 'ตำแหน่งผู้ลงนาม', type: 'text', defaultValue: 'ผู้อำนวยการกองวิชาการ' },
    ],
    defaultBodyHtml: '',
  },
  {
    id: 'gov-tmpl-02',
    code: 'MCU-FORM-AGENDA',
    name: 'ระเบียบวาระการประชุมสภาวิชาการ (Meeting Agenda)',
    category: 'meeting_agenda',
    description: 'ระเบียบวาระการประชุมสภาวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย จัดหมวดหมู่วาระที่ ๑ ถึง ๖ ตามแบบแผนสภามหาวิทยาลัย',
    fields: [
      { key: 'meetingTitle', label: 'ชื่อการประชุม', type: 'text', defaultValue: 'ระเบียบวาระการประชุมสภาวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' },
      { key: 'meetingRound', label: 'ครั้งที่ประชุม', type: 'text', defaultValue: 'ครั้งที่ ๓/๒๕๖๙' },
      { key: 'meetingDateTime', label: 'วัน เวลา ประชุม', type: 'text', defaultValue: 'วันพุธที่ ๒๕ ตุลาคม ๒๕๖๙ เวลา ๐๙.๓๐ น.' },
      { key: 'meetingLocation', label: 'สถานที่ประชุม', type: 'text', defaultValue: 'ณ ห้องประชุม ๔๐๑ ชั้น ๔ อาคารสำนักงานอธิการบดี มจร อยุธยา และผ่านระบบ Zoom' },
      { key: 'agenda1', label: 'วาระที่ ๑ เรื่องประธานแจ้งให้ที่ประชุมทราบ', type: 'textarea', defaultValue: '๑.๑ นโยบายกระทรวง อว. เกี่ยวกับการเทียบโอนธนาคารหน่วยกิต (National Credit Bank)\n๑.๒ การจัดสรรทุนอุดหนุนการวิจัยและพัฒนาสื่อการสอนพระพุทธศาสนาร่วมสมัย' },
      { key: 'agenda2', label: 'วาระที่ ๒ เรื่องรับรองรายงานการประชุม', type: 'textarea', defaultValue: 'รับรองรายงานการประชุมสภาวิชาการ ครั้งที่ ๒/๒๕๖๙ เมื่อวันพุธที่ ๒๔ กันยายน ๒๕๖๙' },
      { key: 'agenda3', label: 'วาระที่ ๓ เรื่องสืบเนื่องจากการประชุมครั้งก่อน', type: 'textarea', defaultValue: '๓.๑ ความคืบหน้าการส่งข้อมูลหลักสูตรเข้าสู่ระบบ CHECO กระทรวง อว.\n๓.๒ รายงานการจัดทำคลังข้อมูลอาจารย์ผู้ทรงคุณวุฒิพิเศษ' },
      { key: 'agenda4', label: 'วาระที่ ๔ เรื่องเสนอเพื่อพิจารณา', type: 'textarea', defaultValue: '๔.๑ พิจารณาให้ความเห็นชอบหลักสูตรพุทธศาสตรบัณฑิต (ปรับปรุง พ.ศ. ๒๕๖๙) คณะพุทธศาสตร์\n๔.๒ พิจารณาแต่งตั้งคณะอนุกรรมการกลั่นกรองมาตรฐานผลลัพธ์การเรียนรู้ (OBE)\n๔.๓ พิจารณาคำขอเทียบโอนหน่วยกิตจากระบบการเรียนรู้ออนไลน์ (MCU-MOOC)' },
      { key: 'agenda5', label: 'วาระที่ ๕ เรื่องเสนอเพื่อทราบ', type: 'textarea', defaultValue: '๕.๑ รายงานผลการประเมินประกันคุณภาพการศึกษาภายใน ระดับหลักสูตร (AUN-QA)\n๕.๒ ปฏิทินการศึกษา ประจำภาคการศึกษาที่ ๑ ปีการศึกษา ๒๕๖๙' },
      { key: 'agenda6', label: 'วาระที่ ๖ เรื่องอื่นๆ (ถ้ามี)', type: 'textarea', defaultValue: '๖.๑ กำหนดการประชุมสภาวิชาการ ครั้งต่อไป' },
      { key: 'signName', label: 'เลขาธิการ / ผู้จัดทำวาระ', type: 'text', defaultValue: 'พระสุวรรณเมธาภรณ์, ผศ.ดร.' },
      { key: 'signPosition', label: 'ตำแหน่ง', type: 'text', defaultValue: 'เลขานุการสภาวิชาการ' },
    ],
    defaultBodyHtml: '',
  },
  {
    id: 'gov-tmpl-03',
    code: 'MCU-FORM-MINUTES',
    name: 'รายงานการประชุมสภาวิชาการ (Meeting Minutes)',
    category: 'meeting_minutes',
    description: 'แบบรายงานการประชุมทางการ บันทึกรายนามผู้มาประชุม วาระการอภิปราย มติที่ประชุม และลายมือชื่อผู้จด/ตรวจรายงาน',
    fields: [
      { key: 'minutesTitle', label: 'ชื่อรายงานการประชุม', type: 'text', defaultValue: 'รายงานการประชุมสภาวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' },
      { key: 'roundAndYear', label: 'ครั้งที่/ปี', type: 'text', defaultValue: 'ครั้งที่ ๓/๒๕๖๙' },
      { key: 'heldDate', label: 'วันที่ประชุม', type: 'text', defaultValue: 'วันพุธที่ ๒๕ ตุลาคม พ.ศ. ๒๕๖๙' },
      { key: 'meetingVenue', label: 'สถานที่', type: 'text', defaultValue: 'ณ ห้องประชุม ๔๐๑ ชั้น ๔ อาคารสำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' },
      { key: 'attendees', label: 'ผู้มาประชุม (รายนาม)', type: 'textarea', defaultValue: '๑. พระธรรมวัชรบัณฑิต, ศ.ดร. ประธานสภาวิชาการ\n๒. พระสุวรรณเมธาภรณ์, ผศ.ดร. รองประธานสภาวิชาการ\n๓. พระมหาบุญเลิศ ช่วยธานี, ศ.ดร. กรรมการสภาวิชาการ\n๔. รศ.ดร.เวทย์ บรรณกรกุล กรรมการผู้ทรงคุณวุฒิ\n๕. ผศ.ดร.อิทธิพล แก้วกระตึก กรรมการและเลขานุการ' },
      { key: 'absentees', label: 'ผู้ไม่มาประชุม (ติดภารกิจ)', type: 'textarea', defaultValue: '๑. พระมหาราชัน จิตฺตปาโล, ดร. (ติดศาสนกิจต่างประเทศ)' },
      { key: 'invitedGuests', label: 'ผู้เข้าร่วมประชุม', type: 'textarea', defaultValue: '๑. นายวิเชียร สมควร หัวหน้าฝ่ายพัฒนาหลักสูตร' },
      { key: 'startTime', label: 'เวลาเริ่มประชุม', type: 'text', defaultValue: '๐๙.๓๐ น.' },
      { key: 'contentDetail', label: 'สรุปการอภิปรายและมติสำคัญ', type: 'textarea', defaultValue: 'วาระที่ ๔.๑ การพิจารณาหลักสูตรพุทธศาสตรบัณฑิต:\nที่ประชุมได้อภิปรายโครงสร้างหลักสูตรและเห็นชอบตามที่คณะกรรมการกลั่นกรองเสนอ\n\nมติที่ประชุม: เห็นชอบหลักสูตรพุทธศาสตรบัณฑิต (ปรับปรุง พ.ศ. ๒๕๖๙) และมอบหมายให้กองวิชาการนำเสนอสภามหาวิทยาลัยเพื่ออนุมัติต่อไป' },
      { key: 'endTime', label: 'เวลาเลิกประชุม', type: 'text', defaultValue: '๑๒.๔๕ น.' },
      { key: 'recorderName', label: 'ผู้จดรายงานการประชุม', type: 'text', defaultValue: 'นางสาวกานดา นามมั่น นักวิชาการศึกษา' },
      { key: 'reviewerName', label: 'ผู้ตรวจรายงานการประชุม', type: 'text', defaultValue: 'พระสุวรรณเมธาภรณ์, ผศ.ดร. เลขานุการสภาวิชาการ' },
    ],
    defaultBodyHtml: '',
  },
  {
    id: 'gov-tmpl-04',
    code: 'MCU-FORM-RESOLUTION-NOTICE',
    name: 'หนังสือแจ้งมติสภาวิชาการ (Council Resolution Notice)',
    category: 'resolution_notice',
    description: 'หนังสือราชการแจ้งมติที่ประชุมสภาวิชาการ เพื่อส่งต่อให้คณะ สำนักทะเบียน และหน่วยงานที่เกี่ยวข้องนำไปปฏิบัติ',
    fields: [
      { key: 'officeHeader', label: 'ส่วนราชการ', type: 'text', defaultValue: 'สำนักงานสภาวิชาการ กองวิชาการ สำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย โทร. ๐-๓๕๒๔-๘๐๐๐' },
      { key: 'docCode', label: 'ที่เอกสาร', type: 'text', defaultValue: 'อว ๐๖๒๕.๐๑/มติ.' },
      { key: 'issueDate', label: 'ลงวันที่', type: 'text', defaultValue: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) },
      { key: 'titleSubject', label: 'เรื่อง', type: 'text', defaultValue: 'แจ้งมติที่ประชุมสภาวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' },
      { key: 'toEntity', label: 'เรียน', type: 'text', defaultValue: 'คณบดีคณะพุทธศาสตร์ / ผู้อำนวยการสำนักทะเบียนและวัดผล' },
      { key: 'enclosures', label: 'สิ่งที่ส่งมาด้วย', type: 'text', defaultValue: '๑. สำเนารายงานการประชุมสภาวิชาการ ครั้งที่ ๓/๒๕๖๙ จำนวน ๑ ชุด\n๒. เล่มหลักสูตร มคอ.๒ ฉบับแก้ไขตามมติ จำนวน ๑ เล่ม' },
      { key: 'messageBody', label: 'ข้อความแจ้งมติ', type: 'textarea', defaultValue: 'ด้วยสภาวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ในการประชุมครั้งที่ ๓/๒๕๖๙ เมื่อวันที่ ๒๕ ตุลาคม ๒๕๖๙ ได้มีมติเห็นชอบหลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (หลักสูตรปรับปรุง พ.ศ. ๒๕๖๙) ของคณะพุทธศาสตร์ โดยให้ปรับปรุงแก้ไขตามข้อสังเกตของคณะกรรมการในประเด็นคำอธิบายรายวิชา หมวดวิชาศึกษาทั่วไปให้สมบูรณ์ ก่อนนำเสนอสภามหาวิทยาลัย\n\nจึงเรียนมาเพื่อโปรดทราบ และดำเนินการในส่วนที่เกี่ยวข้องต่อไป' },
      { key: 'signerName', label: 'ชื่อผู้ลงนาม', type: 'text', defaultValue: 'พระธรรมวัชรบัณฑิต, ศ.ดร.' },
      { key: 'signerTitle', label: 'ตำแหน่งผู้ลงนาม', type: 'text', defaultValue: 'อธิการบดี / ประธานสภาวิชาการ' },
    ],
    defaultBodyHtml: '',
  },
  {
    id: 'gov-tmpl-05',
    code: 'MCU-FORM-APPOINTMENT-ORDER',
    name: 'คำสั่งแต่งตั้งคณะกรรมการ/คณะทำงาน (Official Order)',
    category: 'appointment_order',
    description: 'แบบฟอร์มคำสั่งมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย แต่งตั้งคณะกรรมการพัฒนาหลักสูตรหรือวิชาการ พร้อมระบุอำนาจหน้าที่',
    fields: [
      { key: 'orderNumber', label: 'คำสั่งที่', type: 'text', defaultValue: 'คำสั่งมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ที่ ๑๔๒/๒๕๖๙' },
      { key: 'orderTitle', label: 'เรื่อง', type: 'text', defaultValue: 'แต่งตั้งคณะกรรมการพัฒนาและปรับปรุงหลักสูตรพุทธศาสตรบัณฑิต' },
      { key: 'legalAuthority', label: 'อำนาจตามกฎหมาย', type: 'textarea', defaultValue: 'เพื่อให้การดำเนินงานพัฒนาและปรับปรุงหลักสูตรการเรียนการสอนของมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย เป็นไปด้วยความเรียบร้อย มีประสิทธิภาพ สอดคล้องตามเกณฑ์มาตรฐานหลักสูตรระดับอุดมศึกษา พ.ศ. ๒๕๖๕ และกรอบมาตรฐานคุณวุฒิระดับอุดมศึกษาแห่งชาติ\n\nอาศัยอำนาจตามความในมาตรา ๒๗ และมาตรา ๓๓ แห่งพระราชบัญญัติมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย พ.ศ. ๒๕๔๐ จึงแต่งตั้งคณะกรรมการพัฒนาและปรับปรุงหลักสูตร ดังนี้' },
      { key: 'committeeList', label: 'รายนามคณะกรรมการ', type: 'textarea', defaultValue: '๑. พระธรรมวัชรบัณฑิต, ศ.ดร. ที่ปรึกษา\n๒. คณบดีคณะพุทธศาสตร์ ประธานกรรมการ\n๓. พระมหาบุญเลิศ ช่วยธานี, ศ.ดร. รองประธานกรรมการ\n๔. รศ.ดร.เวทย์ บรรณกรกุล กรรมการผู้ทรงคุณวุฒิภายนอก\n๕. ผศ.ดร.อิทธิพล แก้วกระตึก กรรมการ\n๖. หัวหน้าภาควิชาพระพุทธศาสนา กรรมการและเลขานุการ' },
      { key: 'dutiesAndPowers', label: 'อำนาจและหน้าที่', type: 'textarea', defaultValue: '๑. สำรวจความต้องการของผู้ใช้บัณฑิตและผู้มีส่วนได้ส่วนเสีย (Stakeholders)\n๒. จัดทำรายละเอียดโครงสร้างหลักสูตร คำอธิบายรายวิชา และผลลัพธ์การเรียนรู้ (PLOs)\n๓. ประสานงานกองวิชาการเพื่อนำเสนอสภาวิชาการและสภามหาวิทยาลัย\n๔. ปฏิบัติหน้าที่อื่นๆ ตามที่มหาวิทยาลัยมอบหมาย' },
      { key: 'effectiveDate', label: 'สั่ง ณ วันที่', type: 'text', defaultValue: 'สั่ง ณ วันที่ ๒๕ ตุลาคม พ.ศ. ๒๕๖๙' },
      { key: 'chancellorName', label: 'ชื่ออธิการบดี', type: 'text', defaultValue: 'พระธรรมวัชรบัณฑิต, ศ.ดร.' },
      { key: 'chancellorTitle', label: 'ตำแหน่ง', type: 'text', defaultValue: 'อธิการบดีมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' },
    ],
    defaultBodyHtml: '',
  },
  {
    id: 'gov-tmpl-06',
    code: 'MCU-FORM-ACTION-REPORT',
    name: 'แบบรายงานผลแผนปฏิบัติการ (Action Plan Progress Report)',
    category: 'action_plan_report',
    description: 'แบบรายงานสรุปความก้าวหน้าโครงการตามแผนปฏิบัติการประจำปี สอดรับตัวชี้วัดยุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    fields: [
      { key: 'agencyName', label: 'หน่วยงานผู้รับผิดชอบ', type: 'text', defaultValue: 'กองวิชาการ สำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย' },
      { key: 'fiscalYear', label: 'ประจำปีงบประมาณ', type: 'text', defaultValue: 'พ.ศ. ๒๕๖๙' },
      { key: 'projectTitle', label: 'ชื่อโครงการ / แผนงาน', type: 'text', defaultValue: 'โครงการยกระดับมาตรฐานหลักสูตรสู่เกณฑ์ AUN-QA และระบบธนาคารหน่วยกิต (Credit Bank)' },
      { key: 'strategicPillar', label: 'สอดคล้องยุทธศาสตร์', type: 'text', defaultValue: 'ยุทธศาสตร์ที่ ๑ การพัฒนาหลักสูตรพระพุทธศาสนาและวิชาการระดับสากล' },
      { key: 'objectiveSummary', label: 'วัตถุประสงค์โครงการ', type: 'textarea', defaultValue: '๑. เพื่อปรับปรุงหลักสูตรทุกระดับให้สอดคล้องกับกรอบมาตรฐานคุณวุฒิระดับอุดมศึกษาแห่งชาติ\n๒. เพื่อพัฒนาระบบคลังหน่วยกิตและการเทียบโอนประสบการณ์การเรียนรู้ตลอดชีวิต' },
      { key: 'progressStatus', label: 'ผลการดำเนินงานและความคืบหน้า', type: 'textarea', defaultValue: 'การดำเนินงานบรรลุแล้ว ๘๕% โดยได้จัดอบรมเชิงปฏิบัติการ OBE แล้ว ๔ รุ่น, ผ่านการรับรองหลักสูตรในระบบ CHECO จำนวน ๑๒ หลักสูตร และเปิดรับเทียบโอนหน่วยกิตรุ่นแรกจำนวน ๑๒๐ ราย' },
      { key: 'budgetReport', label: 'รายงานงบประมาณ', type: 'textarea', defaultValue: 'งบประมาณจัดสรร: ๑,๒๐๐,๐๐๐ บาท | เบิกจ่ายแล้ว: ๙๘๐,๐๐๐ บาท (คิดเป็น ๘๑.๖๗%)' },
      { key: 'issuesAndSolutions', label: 'ปัญหาอุปสรรคและแนวทางแก้ไข', type: 'textarea', defaultValue: 'ปัญหา: ระบบเชื่อมต่อ CHECO ภายนอกขัดข้องชั่วคราว\nแนวทางแก้ไข: ใช้งานผ่าน Integration Adapter และ Outbox Buffer สำรอง' },
      { key: 'reporterName', label: 'ผู้รายงาน', type: 'text', defaultValue: 'พระมหาบุญเลิศ ช่วยธานี, ศ.ดร.' },
      { key: 'reporterPosition', label: 'ตำแหน่ง', type: 'text', defaultValue: 'ผู้อำนวยการกองวิชาการ' },
    ],
    defaultBodyHtml: '',
  },
];
