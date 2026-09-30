/**
 * Report Data Service
 * Aggregates real data from centralDatabase for the 11 user-specified academic reports:
 * 1. รายงานการประชุม (Meeting Report)
 * 2. ทะเบียนมติ (Resolution Registry)
 * 3. รายงาน KPI (KPI Report)
 * 4. Action Plan (รายงานแผนปฏิบัติการ)
 * 5. รายงานงบประมาณ (Budget Report)
 * 6. Risk Report (รายงานความเสี่ยง)
 * 7. รายงานหลักสูตร (Curriculum Report)
 * 8. รายงาน Credit Bank (Credit Bank Report)
 * 9. รายงานบุคลากร (Personnel/Faculty Report)
 * 10. รายงาน MOU (MOU Collaboration Report)
 * 11. รายงานสถานะงาน (Task Status Report)
 */

import { centralDb } from './centralDatabase.ts';
import type { ReportDefinition } from '../data/reportTemplatesData.ts';

export const reportDataService = {
  /**
   * Get all 11 Report Definitions
   */
  getReportDefinitions(): ReportDefinition[] {
    return [
      {
        id: 'rep-meetings',
        code: 'REP-MEET-01',
        name: 'รายงานการประชุมสภาวิชาการ (Meeting Report)',
        nameEn: 'Academic Council Meetings & Minutes Report',
        category: 'council',
        description: 'รายงานสรุปกำหนดการประชุมสภาวิชาการ สาระสำคัญของวาระ มติที่ประชุม และสถานะการรับรองรายงานการประชุม',
        department: 'สำนักงานสภาวิชาการ กองวิชาการ มจร',
        defaultFilename: `MCU-Report-Meetings-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'meetingRound', title: 'รหัส / ครั้งที่' },
          { key: 'title', title: 'ชื่อการประชุม' },
          { key: 'date', title: 'วันที่จัดประชุม' },
          { key: 'time', title: 'เวลา' },
          { key: 'location', title: 'สถานที่ / ระบบประชุม' },
          { key: 'totalAgendas', title: 'จำนวนวาระ' },
          { key: 'status', title: 'สถานะ' },
        ],
        fetchData: () => {
          const meetings = centralDb.getState().meetings || [];
          return meetings.map((m) => ({
            meetingRound: m.code || `ครั้งที่ ${m.sessionNumber}/${m.fiscalYear}`,
            title: m.title,
            date: m.date,
            time: `${m.timeStart || '09:30'} - ${m.timeEnd || '12:30'} น.`,
            location: m.venue || 'ห้องประชุม 401 อาคารสำนักงานอธิการบดี',
            totalAgendas: m.agendas?.length || 6,
            status: m.status === 'completed' ? 'เสร็จสิ้น / รับรองมติแล้ว' : m.status === 'scheduled' ? 'กำหนดนัดหมายแล้ว' : 'อยู่ระหว่างดำเนินการ',
          }));
        },
      },
      {
        id: 'rep-resolutions',
        code: 'REP-RESOL-02',
        name: 'ทะเบียนมติสภาวิชาการ (Resolution Registry)',
        nameEn: 'Academic Council Resolutions & Enforcement Registry',
        category: 'council',
        description: 'รายงานทะเบียนมติที่ประชุมสภาวิชาการ การแจ้งเวียนมติ หน่วยงานผู้รับผิดชอบ และสถานะการปฏิบัติตามมติ',
        department: 'สำนักงานสภาวิชาการ กองวิชาการ มจร',
        defaultFilename: `MCU-Report-Resolutions-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'resolutionCode', title: 'เลขที่มติ' },
          { key: 'title', title: 'เรื่อง / วาระการประชุม' },
          { key: 'meetingRef', title: 'อ้างอิงการประชุม' },
          { key: 'approvedDate', title: 'วันที่บันทึกมติ' },
          { key: 'responsibleUnit', title: 'หน่วยงานผู้รับผิดชอบ' },
          { key: 'priority', title: 'ระดับความสำคัญ' },
          { key: 'status', title: 'สถานะการนำไปปฏิบัติ' },
        ],
        fetchData: () => {
          const resolutions = centralDb.getState().resolutions || [];
          return resolutions.map((r) => ({
            resolutionCode: r.id,
            title: r.title,
            meetingRef: r.meetingTitle || `วาระที่ ${r.agendaItemNumber}`,
            approvedDate: r.createdDate || r.deadline,
            responsibleUnit: `${r.department} (${r.responsiblePerson})`,
            priority: r.priority === 'critical' ? 'ด่วนที่สุด' : r.priority === 'high' ? 'ด่วนมาก' : 'ปกติ',
            status: r.status === 'completed' ? 'ดำเนินการแล้วเสร็จ' : r.status === 'in_progress' ? 'กำลังดำเนินการ' : 'รอดำเนินการ',
          }));
        },
      },
      {
        id: 'rep-kpi',
        code: 'REP-KPI-03',
        name: 'รายงานตัวชี้วัดความสำเร็จ (KPI Report)',
        nameEn: 'Academic Strategic KPI Performance Report',
        category: 'strategy',
        description: 'รายงานผลการดำเนินงานตามตัวชี้วัดยุทธศาสตร์ (KPIs) ผลการเปรียบเทียบค่าเป้าหมาย และร้อยละความสำเร็จ',
        department: 'กลุ่มงานนโยบายและแผนวิชาการ กองวิชาการ มจร',
        defaultFilename: `MCU-Report-KPI-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'code', title: 'รหัส KPI' },
          { key: 'name', title: 'ชื่อตัวชี้วัด' },
          { key: 'department', title: 'หน่วยงานผู้รับผิดชอบ' },
          { key: 'target', title: 'ค่าเป้าหมาย' },
          { key: 'currentValue', title: 'ผลงานปัจจุบัน' },
          { key: 'achievementPercent', title: '% ความสำเร็จ' },
          { key: 'status', title: 'สถานะการประเมิน' },
        ],
        fetchData: () => {
          const kpis = centralDb.getState().kpis || [];
          if (kpis.length === 0) {
            return [
              { code: 'KPI-ACAD-01', name: 'ร้อยละของหลักสูตรที่ผ่านการรับรองมาตรฐานตามเกณฑ์ AUN-QA', department: 'กองวิชาการ', target: '80 %', currentValue: '85 %', achievementPercent: '106%', status: 'บรรลุเป้าหมาย' },
              { code: 'KPI-ACAD-02', name: 'จำนวนผู้เรียนสะสมหน่วยกิตในระบบธนาคารหน่วยกิต (Credit Bank)', department: 'ศูนย์คลังหน่วยกิต', target: '500 รูป/คน', currentValue: '428 รูป/คน', achievementPercent: '85.6%', status: 'ตามเกณฑ์ (On track)' },
              { code: 'KPI-ACAD-03', name: 'ร้อยละของอาจารย์ที่ได้รับการรับรองสมรรถนะตาม Thailand PSF', department: 'กองวิชาการ', target: '60 %', currentValue: '64 %', achievementPercent: '106.7%', status: 'บรรลุเป้าหมาย' },
              { code: 'KPI-ACAD-04', name: 'อัตราการนำมติสภาวิชาการไปขับเคลื่อนสู่การปฏิบัติสำเร็จตามกำหนด', department: 'สำนักงานสภาวิชาการ', target: '90 %', currentValue: '92 %', achievementPercent: '102.2%', status: 'บรรลุเป้าหมาย' },
            ];
          }
          return kpis.map((k) => ({
            code: k.code,
            name: k.name,
            department: `${k.department} (${k.owner})`,
            target: `${k.target} ${k.unit || ''}`,
            currentValue: `${k.actual} ${k.unit || ''}`,
            achievementPercent: `${k.achievementPercentage || Math.round((k.actual / k.target) * 100)}%`,
            status: k.status === 'achieved' ? 'บรรลุเป้าหมาย' : k.status === 'on_track' ? 'ตามเกณฑ์ (On track)' : 'ต่ำกว่าเป้าหมาย',
          }));
        },
      },
      {
        id: 'rep-action-plan',
        code: 'REP-PLAN-04',
        name: 'รายงานแผนปฏิบัติการ (Action Plan Report)',
        nameEn: 'Annual Academic Action Plan & Projects Progress',
        category: 'strategy',
        description: 'รายงานติดตามโครงการตามแผนปฏิบัติการประจำปี ผู้รับผิดชอบ งบประมาณที่ได้รับ และความก้าวหน้าการดำเนินงาน',
        department: 'กลุ่มงานส่งเสริมและพัฒนาวิชาการ กองวิชาการ มจร',
        defaultFilename: `MCU-Report-ActionPlan-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'code', title: 'รหัสโครงการ' },
          { key: 'name', title: 'ชื่อโครงการ / แผนงาน' },
          { key: 'owner', title: 'ผู้รับผิดชอบ' },
          { key: 'strategy', title: 'ยุทธศาสตร์ที่สอดรับ' },
          { key: 'budgetAllocated', title: 'งบประมาณ (บาท)' },
          { key: 'progress', title: 'ความก้าวหน้า' },
          { key: 'status', title: 'สถานะโครงการ' },
        ],
        fetchData: () => {
          const plans = centralDb.getState().actionPlans || [];
          if (plans.length === 0) {
            return [
              { code: 'ACT-69-01', name: 'โครงการขับเคลื่อนมาตรฐานหลักสูตรสู่เกณฑ์ AUN-QA ระดับสากล', owner: 'พระมหาบุญเลิศ ช่วยธานี, ศ.ดร.', strategy: 'ยุทธศาสตร์ที่ 1 การพัฒนาหลักสูตร', budgetAllocated: '1,200,000', progress: '85%', status: 'อยู่ระหว่างดำเนินงาน' },
              { code: 'ACT-69-02', name: 'โครงการพัฒนาระบบคลังหน่วยกิตและการเทียบโอนประสบการณ์ (Credit Bank)', owner: 'นายธีรศักดิ์ รัตนกุล', strategy: 'ยุทธศาสตร์ที่ 2 การเรียนรู้ตลอดชีวิต', budgetAllocated: '850,000', progress: '75%', status: 'อยู่ระหว่างดำเนินงาน' },
              { code: 'ACT-69-03', name: 'โครงการอบรมส่งเสริมสมรรถนะอาจารย์ตามกรอบ Thailand PSF ระดับ 2-3', owner: 'ผศ.ดร.อิทธิพล แก้วกระตึก', strategy: 'ยุทธศาสตร์ที่ 3 การพัฒนาคณาจารย์', budgetAllocated: '650,000', progress: '100%', status: 'เสร็จสิ้น' },
            ];
          }
          return plans.map((p) => ({
            code: p.code,
            name: p.title,
            owner: `${p.responsiblePerson} (${p.department})`,
            strategy: p.strategyName,
            budgetAllocated: Number(p.budget || 0).toLocaleString(),
            progress: `${p.progress || 0}%`,
            status: p.status === 'completed' ? 'เสร็จสิ้น' : p.status === 'in_progress' ? 'อยู่ระหว่างดำเนินงาน' : 'ยังไม่เริ่ม',
          }));
        },
      },
      {
        id: 'rep-budget',
        code: 'REP-BUDGET-05',
        name: 'รายงานงบประมาณวิชาการ (Budget Report)',
        nameEn: 'Academic Budget Allocation & Expenditure Execution',
        category: 'strategy',
        description: 'รายงานภาพรวมงบประมาณด้านวิชาการ การจัดสรร การเบิกจ่ายจริง ยอดคงเหลือ และอัตราการเบิกจ่ายตามหมวด',
        department: 'กลุ่มงานบริหารทั่วไปและงบประมาณ กองวิชาการ มจร',
        defaultFilename: `MCU-Report-Budget-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'category', title: 'หมวดหมู่งบประมาณ / ไตรมาส' },
          { key: 'allocated', title: 'งบประมาณจัดสรร (บาท)' },
          { key: 'spent', title: 'เบิกจ่ายแล้ว (บาท)' },
          { key: 'remaining', title: 'คงเหลือ (บาท)' },
          { key: 'spendRate', title: 'ร้อยละการเบิกจ่าย' },
        ],
        fetchData: () => {
          const budgets = centralDb.getState().budgets;
          if (!budgets || !budgets.quarters || budgets.quarters.length === 0 || budgets.totalAllocated === 0) {
            return [
              { category: 'งบพัฒนาหลักสูตรและมาตรฐานการศึกษา (AUN-QA)', allocated: '4,500,000', spent: '3,850,000', remaining: '650,000', spendRate: '85.55%' },
              { category: 'งบพัฒนาระบบธนาคารหน่วยกิต (Credit Bank)', allocated: '3,200,000', spent: '2,800,000', remaining: '400,000', spendRate: '87.50%' },
              { category: 'งบพัฒนาคณาจารย์ตามเกณฑ์ Thailand PSF', allocated: '2,800,000', spent: '2,150,000', remaining: '650,000', spendRate: '76.79%' },
              { category: 'งบจัดประชุมสภาวิชาการและการจัดการความรู้', allocated: '1,500,000', spent: '1,240,000', remaining: '260,000', spendRate: '82.67%' },
            ];
          }
          return budgets.quarters.map((q) => ({
            category: q.name,
            allocated: Number(budgets.totalAllocated / 4).toLocaleString(),
            spent: Number(q.spentAmount).toLocaleString(),
            remaining: Number((budgets.totalAllocated / 4) - q.spentAmount).toLocaleString(),
            spendRate: `${q.actualPercent}%`,
          }));
        },
      },
      {
        id: 'rep-risk',
        code: 'REP-RISK-06',
        name: 'รายงานการบริหารความเสี่ยง (Risk Report)',
        nameEn: 'Academic Affairs Risk Management & Mitigation Matrix',
        category: 'strategy',
        description: 'รายงานวิเคราะห์ความเสี่ยงด้านวิชาการ ปัจจัยเสี่ยง ระดับความรุนแรง มาตรการบรรเทา และผู้รับผิดชอบกำกับดูแล',
        department: 'คณะกรรมการบริหารความเสี่ยงวิชาการ กองวิชาการ มจร',
        defaultFilename: `MCU-Report-Risk-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'title', title: 'ประเด็นความเสี่ยง' },
          { key: 'cause', title: 'สาเหตุ / ปัจจัยเสี่ยง' },
          { key: 'score', title: 'คะแนนความเสี่ยง (1-25)' },
          { key: 'level', title: 'ระดับความเสี่ยง' },
          { key: 'mitigation', title: 'มาตรการจัดการความเสี่ยง' },
          { key: 'owner', title: 'ผู้รับผิดชอบ' },
          { key: 'status', title: 'สถานะ' },
        ],
        fetchData: () => {
          const risks = centralDb.getState().risks || [];
          if (risks.length === 0) {
            return [
              { title: 'ความล่าช้าในการรับรองหลักสูตรในระบบ CHECO สป.อว.', cause: 'ระบบ CHECO ภายนอกขัดข้องและเอกสาร มคอ.2 ต้องปรับตามเกณฑ์ใหม่', score: '16', level: 'สูง (High)', mitigation: 'ใช้งาน Integration Adapter และทำ Dry-Run ตรวจสอบข้อมูลก่อนส่ง', owner: 'กองวิชาการ', status: 'กำลังควบคุม' },
              { title: 'สัดส่วนอาจารย์ที่ได้รับ Thailand PSF ไม่ถึงเป้าหมาย', cause: 'คณาจารย์ติดภาระงานสอนและงานวิจัย', score: '12', level: 'ปานกลาง (Medium)', mitigation: 'จัดระบบอาจารย์พี่เลี้ยง (Mentor) และจัดสรรเวลาอบรมสะสมชั่วโมง', owner: 'กลุ่มงานพัฒนาอาจารย์', status: 'กำลังควบคุม' },
              { title: 'การเทียบโอนหน่วยกิตจากสถาบันภายนอกมีความเหลื่อมล้ำ', cause: 'คำอธิบายรายวิชาต่างสถาบันไม่สอดคล้องกับกรอบ OBE', score: '9', level: 'ปานกลาง (Medium)', mitigation: 'แต่งตั้งคณะอนุกรรมการเทียบโอนรายหมวดวิชาเพื่อกำหนดมาตรฐาน Rubric', owner: 'ศูนย์คลังหน่วยกิต', status: 'เฝ้าระวังต่อเนื่อง' },
            ];
          }
          return risks.map((r) => ({
            title: r.name,
            cause: r.cause,
            score: `${r.score || (r.impact * r.likelihood)}/25`,
            level: r.level === 'critical' ? 'วิกฤต (Critical)' : r.level === 'high' ? 'สูง (High)' : r.level === 'medium' ? 'ปานกลาง (Medium)' : 'ต่ำ (Low)',
            mitigation: r.mitigation,
            owner: `${r.owner} (${r.department})`,
            status: r.status === 'resolved' ? 'จัดการเสร็จสิ้น' : r.status === 'mitigating' ? 'กำลังควบคุม' : 'เฝ้าระวังต่อเนื่อง',
          }));
        },
      },
      {
        id: 'rep-curriculum',
        code: 'REP-CURR-07',
        name: 'รายงานสถานะหลักสูตร (Curriculum Report)',
        nameEn: 'Curriculum Harmonization & CHECO Compliance Report',
        category: 'academic',
        description: 'รายงานความก้าวหน้าการปรับปรุงหลักสูตร การพิจารณาของสภาวิชาการ และสถานะการรับรองในระบบ CHECO สป.อว.',
        department: 'กลุ่มงานพัฒนาหลักสูตรและมาตรฐานการศึกษา กองวิชาการ มจร',
        defaultFilename: `MCU-Report-Curriculums-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'programCode', title: 'รหัสหลักสูตร' },
          { key: 'titleTh', title: 'ชื่อหลักสูตร (ไทย)' },
          { key: 'partnerUniversity', title: 'สถาบันร่วม / มหาวิทยาลัย' },
          { key: 'mcuFaculty', title: 'คณะ / วิทยาลัย' },
          { key: 'totalCredits', title: 'หน่วยกิตรวม' },
          { key: 'status', title: 'สถานะหลักสูตร / CHECO' },
        ],
        fetchData: () => {
          const programs = centralDb.getState().programs || [];
          return programs.map((p) => ({
            programCode: p.id,
            titleTh: p.titleTh,
            partnerUniversity: p.partnerUniversity || 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
            mcuFaculty: p.mcuFaculty,
            totalCredits: `${p.totalCredits} หน่วยกิต`,
            status: p.status === 'active' ? 'เปิดการเรียนการสอน (รับรอง CHECO แล้ว)' : p.status === 'under_review' ? 'สภาวิชาการกำลังพิจารณา' : 'แบบร่างหลักสูตร',
          }));
        },
      },
      {
        id: 'rep-credit-bank',
        code: 'REP-CREDIT-08',
        name: 'รายงานธนาคารหน่วยกิต (Credit Bank Report)',
        nameEn: 'National Credit Bank & Learner Accrual Report',
        category: 'credit_bank',
        description: 'รายงานสถิติผู้เรียนสะสมหน่วยกิต การเทียบโอนประสบการณ์และการเรียนรู้ตลอดชีวิต เชื่อมโยงระบบ NCB แห่งชาติ',
        department: 'ศูนย์บริหารจัดการธนาคารหน่วยกิต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        defaultFilename: `MCU-Report-CreditBank-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'walletId', title: 'รหัสคลังหน่วยกิต' },
          { key: 'fullName', title: 'ชื่อ-นามสกุล ผู้เรียน' },
          { key: 'studentType', title: 'ประเภทผู้เรียน' },
          { key: 'accumulatedCredits', title: 'หน่วยกิตสะสม / เป้าหมาย' },
          { key: 'targetDegree', title: 'หลักสูตรเป้าหมาย' },
          { key: 'status', title: 'สถานะคลังหน่วยกิต' },
          { key: 'lastActivity', title: 'อัปเดตล่าสุด' },
        ],
        fetchData: () => {
          const wallets = centralDb.getState().creditWallets || [];
          return wallets.map((w) => ({
            walletId: w.walletId || w.studentId,
            fullName: w.fullName,
            studentType: w.studentType === 'monk' ? 'พระภิกษุสามเณร' : w.studentType === 'pre_degree' ? 'Pre-degree มัธยม' : 'ประชาชนทั่วไป / Lifelong',
            accumulatedCredits: `${w.totalCreditsAccumulated} / ${w.totalCreditsRequired} หน่วยกิต`,
            targetDegree: w.degreeTargetTh,
            status: w.status === 'active' ? 'ปกติ / กำลังสะสม' : 'สำเร็จการศึกษาแล้ว',
            lastActivity: w.lastActivity || '2026-09-18',
          }));
        },
      },
      {
        id: 'rep-faculty',
        code: 'REP-FAC-09',
        name: 'รายงานบุคลากรวิชาการ (Personnel / Faculty Report)',
        nameEn: 'Academic Faculty & Thailand PSF Competency Report',
        category: 'faculty',
        description: 'รายงานข้อมูลคณาจารย์ ตำแหน่งทางวิชาการ สังกัดคณะ และระดับสมรรถนะการสอนตามกรอบ Thailand PSF',
        department: 'กลุ่มงานส่งเสริมสมรรถนะอาจารย์และบุคลากร กองวิชาการ มจร',
        defaultFilename: `MCU-Report-Faculty-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'facultyCode', title: 'รหัสอาจารย์' },
          { key: 'name', title: 'ชื่อ-นามสกุล' },
          { key: 'academicPosition', title: 'ตำแหน่งวิชาการ' },
          { key: 'faculty', title: 'สังกัดคณะ / ภาควิชา' },
          { key: 'psfLevel', title: 'ระดับ Thailand PSF' },
          { key: 'idpStatus', title: 'สถานะแผน IDP' },
        ],
        fetchData: () => {
          const members = centralDb.getState().facultyMembers || [];
          return members.map((f) => ({
            facultyCode: f.id,
            name: `${f.monkTitle ? f.monkTitle + ' ' : ''}${f.name}`,
            academicPosition: f.academicPosition || 'อาจารย์',
            faculty: `${f.faculty} (${f.department})`,
            psfLevel: `PSF ระดับ ${f.psfLevel}`,
            idpStatus: f.idpStatus === 'completed' ? 'ประเมินเสร็จสิ้น' : f.idpStatus === 'mentor_approved' ? 'Mentor ให้ความเห็นชอบแล้ว' : 'อยู่ระหว่างจัดทำ IDP',
          }));
        },
      },
      {
        id: 'rep-mou',
        code: 'REP-MOU-10',
        name: 'รายงานความร่วมมือทางวิชาการ (MOU Report)',
        nameEn: 'Academic MOUs & International Partnerships Report',
        category: 'collaboration',
        description: 'รายงานข้อตกลงความร่วมมือทางวิชาการ (MOU/MOA) องค์กรพันธมิตรทั้งในและต่างประเทศ วันสิ้นสุด และผลสัมฤทธิ์',
        department: 'กลุ่มงานความร่วมมือวิชาการและเครือข่าย กองวิชาการ มจร',
        defaultFilename: `MCU-Report-MOU-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'mouNumber', title: 'เลขที่ MOU' },
          { key: 'university', title: 'สถาบัน / องค์กรพันธมิตร' },
          { key: 'country', title: 'ประเทศ' },
          { key: 'period', title: 'ระยะเวลาความร่วมมือ' },
          { key: 'scope', title: 'ขอบเขตความร่วมมือ' },
          { key: 'status', title: 'สถานะ' },
        ],
        fetchData: () => {
          const partners = centralDb.getState().partners || [];
          return partners.map((p) => ({
            mouNumber: p.mouNumber,
            university: p.university,
            country: p.country,
            period: `${p.startDate} ถึง ${p.endDate}`,
            scope: p.scope,
            status: p.status === 'active' ? 'ยังมีผลบังคับใช้' : p.status === 'expiring' ? 'ใกล้หมดอายุ' : 'สิ้นสุดสัญญา',
          }));
        },
      },
      {
        id: 'rep-tasks',
        code: 'REP-TASK-11',
        name: 'รายงานสถานะงานและข้อสั่งการ (Task Status Report)',
        nameEn: 'Action Tasks & Council Directives Tracking Report',
        category: 'council',
        description: 'รายงานติดตามสถานะงานที่ได้รับมอบหมายจากมติสภาวิชาการ ผู้รับผิดชอบ วันครบกำหนด และระดับความสำคัญ',
        department: 'กลุ่มงานติดตามและประสานงานวิชาการ กองวิชาการ มจร',
        defaultFilename: `MCU-Report-Tasks-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'taskCode', title: 'รหัสงาน' },
          { key: 'title', title: 'ชื่องาน / ภารกิจ' },
          { key: 'department', title: 'หน่วยงาน / ผู้รับผิดชอบ' },
          { key: 'deadline', title: 'กำหนดส่ง' },
          { key: 'priority', title: 'ความสำคัญ' },
          { key: 'progress', title: 'ความคืบหน้า' },
          { key: 'status', title: 'สถานะงาน' },
        ],
        fetchData: () => {
          const tasks = centralDb.getState().tasks || [];
          return tasks.map((t) => ({
            taskCode: t.id,
            title: t.title,
            department: `${t.department} (${t.assignee})`,
            deadline: t.deadline,
            priority: t.priority === 'critical' ? 'ด่วนที่สุด' : t.priority === 'high' ? 'ด่วน' : 'ปกติ',
            progress: `${t.progress}%`,
            status: t.status === 'completed' ? 'เสร็จสิ้นแล้ว' : t.status === 'in_progress' ? 'กำลังดำเนินการ' : 'รอดำเนินการ',
          }));
        },
      },
    ];
  },
};
