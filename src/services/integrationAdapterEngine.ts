/**
 * Integration Adapter Engine
 * 
 * Core implementation of progressive integration without assuming external APIs exist.
 * Provides:
 * 1. Nine (9) comprehensive System Adapter definitions (HR, Curriculum, REG, Credit Bank, QA, E-Doc, Email, SSO, Central/MHESI)
 * 2. Multi-mode adapters (Live API, API-Ready Contract, Staging DB View, Batch Excel/CSV, SFTP, SSO, Outbox Buffer)
 * 3. File Ingestion & Field Mapping Engine (dry-run validation, error detection, schema compliance)
 * 4. Staging DB / Read-Only View mock poller
 * 5. Outbox queue buffer management (store-and-forward for offline/no-api systems)
 * 6. API-Ready Contract Sandbox / Simulator
 * 7. Standard Template Generator for staff manual import
 */

import type {
  IntegrationAdapterDefinition,
  OutboxQueueItem,
  BatchIngestionJob,
  BatchIngestionRowResult,
  IntegrationMode,
  AdapterReadinessStatus,
} from '../types/integrationArchitecture.ts';

// 9 Core Systems Definitions
export const CORE_INTEGRATION_ADAPTERS: IntegrationAdapterDefinition[] = [
  // 1. ระบบบุคลากร (HR / Personnel System)
  {
    id: 'adapter-hr-personnel',
    code: 'MCU-HRIS-ADP',
    name: 'ระบบบุคลากร (HR / Personnel System)',
    nameEn: 'MCU Human Resource Information System Adapter',
    category: 'hr_personnel',
    targetSystem: 'ระบบกองการบริหารงานบุคคล สำนักงานอธิการบดี (MCU-HRIS)',
    externalAgency: 'กองการบริหารงานบุคคล มจร',
    hasLiveApi: false,
    currentMode: 'BATCH_FILE_EXCEL_CSV',
    supportedModes: ['BATCH_FILE_EXCEL_CSV', 'STAGING_DB_VIEW', 'API_READY_CONTRACT'],
    readinessStatus: 'BATCH_FILE_ACTIVE',
    whyNoApiReason:
      'ระบบ HRIS เดิมของมหาวิทยาลัยติดตั้งแบบ On-Premise ภายในเครือข่ายปิด ยังไม่มี REST API Endpoint เปิดให้บริการ ปัจจุบันใช้ระบบนำเข้าไฟล์ตามงวด (Monthly Batch) และมุมมองฐานข้อมูล Staging View',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): นำเข้าข้อมูลอาจารย์และตำแหน่งวิชาการผ่าน Template Excel ที่ตรวจสอบโครงสร้างอัตโนมัติ',
      midTerm: 'ระยะที่ 2: เชื่อมต่อ Read-Only Staging DB View (VIEW_HR_FACULTY_SYNC) ด้วย Scheduled Cron ทุกเที่ยงคืน',
      longTerm: 'ระยะที่ 3: สลับใช้ REST API Gateway ทันทีเมื่อกองการเจ้าหน้าที่เปิด Microservice HR Hub (ใช้ Data Contract ที่เตรียมไว้)',
    },
    dataContract: {
      contractVersion: 'v1.4-draft',
      endpointStub: 'https://hris.mcu.ac.th/api/v1/faculty/roster-sync',
      httpMethod: 'POST',
      authMethod: 'API Key (HMAC SHA-256)',
      headers: {
        'Content-Type': 'application/json',
        'X-MCU-Client-ID': 'academic-affairs-system',
        'X-Signature-HMAC': 'sha256=<signature>',
      },
      sampleRequestPayload: JSON.stringify(
        {
          syncBatchId: 'HR-SYNC-2569-01',
          facultyList: [
            {
              citizenId: '1-1002-00123-45-6',
              staffCode: 'MCU-T-0842',
              prefixTh: 'ผศ.ดร.',
              fullNameTh: 'พระมหาพิเชษฐ์ อภิวฑฺฒโน',
              academicRank: 'ผู้ช่วยศาสตราจารย์',
              facultyDepartment: 'คณะพุทธศาสตร์ ภาควิชาพระพุทธศาสนา',
              qualificationHighest: 'พธ.ด. (พระพุทธศาสนา)',
              psfLevel: 'Level 3',
              teachingWorkloadHours: 18,
            },
          ],
        },
        null,
        2
      ),
      sampleResponsePayload: JSON.stringify(
        {
          success: true,
          batchId: 'HR-SYNC-2569-01',
          processedCount: 1,
          updatedCount: 1,
          errors: [],
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'citizen_id', targetField: 'nationalId', dataType: 'string', required: true, transformRule: 'mask_cid', description: 'เลขประจำตัวประชาชน 13 หลัก', exampleValue: '1-1002-00123-45-6' },
        { sourceField: 'staff_id', targetField: 'facultyCode', dataType: 'string', required: true, transformRule: 'trim', description: 'รหัสประจำตัวบุคลากร', exampleValue: 'MCU-T-0842' },
        { sourceField: 'name_th', targetField: 'name', dataType: 'string', required: true, transformRule: 'trim', description: 'ชื่อ-ฉายา/นามสกุล ภาษาไทย', exampleValue: 'พระมหาพิเชษฐ์ อภิวฑฺฒโน' },
        { sourceField: 'academic_rank', targetField: 'academicPosition', dataType: 'string', required: false, transformRule: 'trim', description: 'ตำแหน่งทางวิชาการ (ผศ./รศ./ศ.)', exampleValue: 'ผู้ช่วยศาสตราจารย์' },
        { sourceField: 'department', targetField: 'department', dataType: 'string', required: true, transformRule: 'trim', description: 'ภาควิชา/คณะต้นสังกัด', exampleValue: 'คณะพุทธศาสตร์' },
        { sourceField: 'psf_level', targetField: 'competencyLevel', dataType: 'string', required: false, transformRule: 'uppercase', description: 'ระดับมาตรฐาน Thailand PSF', exampleValue: 'LEVEL 3' },
      ],
    },
    fallbackStrategy: {
      primary: 'นำเข้าไฟล์ Excel (.xlsx) ตามโครงสร้างมาตรฐานผ่านหน้า Batch Ingestion Gateway',
      secondary: 'เข้าถึงข้อมูลผ่าน Read-Only Staging DB Table (VIEW_HR_FACULTY_LOCAL)',
      offlineBehavior: 'บันทึกข้อมูลในแคชภายใน (Local In-Memory / IndexedDB) พร้อมแจ้งเตือนผู้ดูแลระบบ',
      syncRecovery: 'ระบบจัดคิว Delta Changes และแจ้งเตือนเมื่อพบข้อมูลขัดแย้ง (Conflict Resolution Panel)',
    },
    stagingTemplate: {
      filename: 'Template_MCU_HR_Faculty_Import.csv',
      columns: [
        { key: 'citizen_id', label: 'เลขบัตรประชาชน', example: '1100200123456', required: true, dataType: 'text' },
        { key: 'staff_id', label: 'รหัสอาจารย์', example: 'MCU-T-0842', required: true, dataType: 'text' },
        { key: 'name_th', label: 'ชื่อ-สกุล/ฉายา', example: 'พระมหาพิเชษฐ์ อภิวฑฺฒโน', required: true, dataType: 'text' },
        { key: 'academic_rank', label: 'ตำแหน่งวิชาการ', example: 'ผู้ช่วยศาสตราจารย์', required: false, dataType: 'text' },
        { key: 'department', label: 'สังกัดคณะ/ภาควิชา', example: 'คณะพุทธศาสตร์', required: true, dataType: 'text' },
        { key: 'psf_level', label: 'Thailand PSF', example: 'Level 3', required: false, dataType: 'text' },
      ],
      sampleCsv: `citizen_id,staff_id,name_th,academic_rank,department,psf_level\n1100200123456,MCU-T-0842,พระมหาพิเชษฐ์ อภิวฑฺฒโน,ผู้ช่วยศาสตราจารย์,คณะพุทธศาสตร์,Level 3\n1100400567890,MCU-T-0915,รศ.ดร.สมชาย ปัญญาวชิโร,รองศาสตราจารย์,คณะครุศาสตร์,Level 4`,
    },
    syncStats: {
      lastSyncAt: '2026-09-22 14:00:00',
      totalRecordsProcessed: 890,
      successCount: 886,
      errorCount: 4,
      outboxPendingCount: 0,
      healthRate: 99.5,
    },
  },

  // 2. ระบบหลักสูตร (Curriculum System)
  {
    id: 'adapter-curriculum',
    code: 'CHECO-CURR-ADP',
    name: 'ระบบหลักสูตร (Curriculum System & CHECO)',
    nameEn: 'Curriculum Harmonization & CHECO Adapter',
    category: 'curriculum',
    targetSystem: 'ระบบพิจารณาความสอดคล้องหลักสูตร (CHECO สป.อว.) & ระบบหลักสูตร มจร',
    externalAgency: 'สำนักงานปลัดกระทรวงการอุดมศึกษาฯ (สป.อว.) / สำนักทะเบียน มจร',
    hasLiveApi: false,
    currentMode: 'API_READY_CONTRACT',
    supportedModes: ['API_READY_CONTRACT', 'BATCH_FILE_EXCEL_CSV', 'QUEUE_BUFFER_OUTBOX'],
    readinessStatus: 'API_READY_CONTRACT',
    whyNoApiReason:
      'ระบบ CHECO ของ สป.อว. ยังเปิดให้ยื่นผ่าน Web Portal เท่านั้น และยังไม่เปิด Production REST API แบบ 2-Way Gateway สำหรับส่งข้อมูล มคอ.2 จากระบบสภาวิชาการมหาวิทยาลัย จึงต้องเตรียม Data Contract และระบบ Outbox Packet ไว้ล่วงหน้า',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): ส่งออกข้อมูลหลักสูตรเป็น CHECO Compliance Package (JSON/Excel/PDF ZIP) เพื่อยื่นผ่านระบบกลาง',
      midTerm: 'ระยะที่ 2: เชื่อมต่อ Sandbox Environment ของ สป.อว. ผ่าน API-Ready Simulator Contract',
      longTerm: 'ระยะที่ 3: เปิดใช้งาน Live REST Webhook ยื่นขอรับรองและรับผลการพิจารณาแบบอัตโนมัติ',
    },
    dataContract: {
      contractVersion: 'v2.0-mhesi',
      endpointStub: 'https://checo.mhesi.go.th/api/v2/curriculums/submission',
      httpMethod: 'POST',
      authMethod: 'OAuth 2.0 / Bearer Token',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer <mhesi_access_token>',
      },
      sampleRequestPayload: JSON.stringify(
        {
          curriculumCode: 'CURR-2569-BUD-01',
          degreeLevel: 'Bachelor',
          programNameTh: 'หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (ฉบับปรับปรุง พ.ศ. 2569)',
          programNameEn: 'Bachelor of Arts Program in Buddhism (Revised B.E. 2569)',
          totalCredits: 120,
          councilApprovedDate: '2026-08-25',
          plos: [
            { code: 'PLO1', description: 'อธิบายหลักพุทธธรรมและประยุกต์ใช้ในการดำเนินชีวิต' },
            { code: 'PLO2', description: 'วิเคราะห์หลักคำสอนเปรียบเทียบกับปรัชญาตะวันออก' },
          ],
        },
        null,
        2
      ),
      sampleResponsePayload: JSON.stringify(
        {
          submissionId: 'CHECO-REQ-2569-8921',
          status: 'RECEIVED_UNDER_EVALUATION',
          submittedAt: '2026-09-20T09:30:00Z',
          estimatedDays: 45,
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'program_code', targetField: 'code', dataType: 'string', required: true, transformRule: 'uppercase', description: 'รหัสหลักสูตร', exampleValue: 'CURR-2569-BUD-01' },
        { sourceField: 'program_name_th', targetField: 'nameTh', dataType: 'string', required: true, transformRule: 'trim', description: 'ชื่อหลักสูตรภาษาไทย', exampleValue: 'หลักสูตรพุทธศาสตรบัณฑิต' },
        { sourceField: 'credits', targetField: 'totalCredits', dataType: 'number', required: true, transformRule: 'parse_number', description: 'จำนวนหน่วยกิตรวม', exampleValue: '120' },
        { sourceField: 'academic_council_approval', targetField: 'councilApprovalDate', dataType: 'date', required: true, transformRule: 'format_thai_date', description: 'วันที่มีมติสภาวิชาการเห็นชอบ', exampleValue: '2569-08-25' },
      ],
    },
    fallbackStrategy: {
      primary: 'สร้าง CHECO Compliance Export Package (ZIP รวม JSON + มคอ.2 Excel + มติสภา PDF)',
      secondary: 'จัดเก็บใน Outbox Buffer รองรับการส่งใหม่เมื่อระบบ CHECO REST API เปิดให้บริการ',
      offlineBehavior: 'ระบบยังสามารถแก้ไข พัฒนา และผ่านขั้นตอนสภาวิชาการได้ตามปกติ ไม่หยุดชะงัก',
      syncRecovery: 'ส่งข้อมูลตกค้างทั้งหมดอัตโนมัติ (Bulk Outbox Dispatch) พร้อมบันทึกเลขที่รับเรื่อง',
    },
    stagingTemplate: {
      filename: 'Template_MCU_Curriculum_Batch.csv',
      columns: [
        { key: 'program_code', label: 'รหัสหลักสูตร', example: 'CURR-2569-BUD-01', required: true, dataType: 'text' },
        { key: 'program_name_th', label: 'ชื่อหลักสูตร (ไทย)', example: 'หลักสูตรพุทธศาสตรบัณฑิต', required: true, dataType: 'text' },
        { key: 'credits', label: 'หน่วยกิตรวม', example: '120', required: true, dataType: 'number' },
        { key: 'degree_level', label: 'ระดับปริญญา', example: 'ปริญญาตรี', required: true, dataType: 'text' },
        { key: 'academic_council_approval', label: 'วันที่สภาเห็นชอบ', example: '2569-08-25', required: true, dataType: 'date' },
      ],
      sampleCsv: `program_code,program_name_th,credits,degree_level,academic_council_approval\nCURR-2569-BUD-01,หลักสูตรพุทธศาสตรบัณฑิต,120,ปริญญาตรี,2569-08-25\nCURR-2569-ED-02,หลักสูตรครุศาสตรมหาบัณฑิต,36,ปริญญาโท,2569-07-14`,
    },
    syncStats: {
      lastSyncAt: '2026-09-21 16:30:00',
      totalRecordsProcessed: 164,
      successCount: 162,
      errorCount: 2,
      outboxPendingCount: 3,
      healthRate: 98.8,
    },
  },

  // 3. ระบบทะเบียน (Registrar / Student Information System - SIS)
  {
    id: 'adapter-reg-sis',
    code: 'MCU-REG-SIS-ADP',
    name: 'ระบบทะเบียน (Registrar / SIS System)',
    nameEn: 'MCU Student Information & Registrar Adapter',
    category: 'registrar_sis',
    targetSystem: 'ระบบทะเบียนและวัดผล มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU-REG)',
    externalAgency: 'สำนักทะเบียนและวัดผล มจร',
    hasLiveApi: false,
    currentMode: 'STAGING_DB_VIEW',
    supportedModes: ['STAGING_DB_VIEW', 'BATCH_FILE_EXCEL_CSV', 'API_READY_CONTRACT'],
    readinessStatus: 'STAGING_VIEW_ACTIVE',
    whyNoApiReason:
      'ฐานข้อมูลสำนักทะเบียนเป็นสถาปัตยกรรมแบบเก่า (Legacy RDBMS) ทำงานบนเครือข่ายความปลอดภัยสูง ยังไม่มี REST Microservice ปัจจุบันใช้ระบบ Read-Only Database View (VIEW_MCU_REG_GRADES_SYNC) และการ Export CSV รายภาคเรียน',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): อ่านผลการเรียน ทรานสคริปต์ และข้อมูลนิสิตผ่าน Staging DB View วันละ 2 ครั้ง',
      midTerm: 'ระยะที่ 2: ให้ฝ่ายทะเบียนอัปโหลดไฟล์สรุปผลการเรียน Pre-degree/Short Course ผ่าน Batch Ingestion Gateway',
      longTerm: 'ระยะที่ 3: สลับเป็น REST/Webhook ทันทีที่โครงการปรับปรุงระบบทะเบียนใหม่ (New SIS Cloud) เริ่มทดสอบ API',
    },
    dataContract: {
      contractVersion: 'v1.2',
      endpointStub: 'https://reg.mcu.ac.th/api/v1/enrollment/grades',
      httpMethod: 'GET',
      authMethod: 'Staging DB Credentials',
      headers: {
        'X-Database-Schema': 'MCU_REG_STAGING',
        'X-View-Name': 'VW_ACADEMIC_TRANSCRIPT_SYNC',
      },
      sampleRequestPayload: JSON.stringify(
        {
          academicYear: 2569,
          semester: 1,
          departmentCode: 'BUD',
        },
        null,
        2
      ),
      sampleResponsePayload: JSON.stringify(
        {
          totalEnrolled: 3450,
          records: [
            {
              studentId: '6601001001',
              courseCode: '000101',
              courseNameTh: 'พระไตรปิฎกศึกษา',
              grade: 'A',
              credit: 3,
              status: 'COMPLETED',
            },
          ],
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'student_id', targetField: 'studentCode', dataType: 'string', required: true, transformRule: 'trim', description: 'รหัสนิสิต', exampleValue: '6601001001' },
        { sourceField: 'course_code', targetField: 'courseCode', dataType: 'string', required: true, transformRule: 'uppercase', description: 'รหัสวิชา', exampleValue: '000101' },
        { sourceField: 'grade_val', targetField: 'letterGrade', dataType: 'string', required: true, transformRule: 'uppercase', description: 'ระดับคะแนน/เกรด', exampleValue: 'A' },
        { sourceField: 'credits', targetField: 'creditsEarned', dataType: 'number', required: true, transformRule: 'parse_number', description: 'หน่วยกิตที่ได้รับ', exampleValue: '3' },
      ],
    },
    fallbackStrategy: {
      primary: 'คิวรีข้อมูลจาก Staging DB View ในช่วงเวลา 03:00 น. อัตโนมัติ',
      secondary: 'นำเข้าแฟ้มข้อมูลผลการเรียนผ่านไฟล์ CSV ที่เข้ารหัสความปลอดภัย',
      offlineBehavior: 'ใช้ข้อมูลที่ซิงก์สำเร็จครั้งล่าสุด และแสดงป้ายสัญลักษณ์ "ข้อมูล ณ วันที่ล่าสุด"',
      syncRecovery: 'เปรียบเทียบ Checksum รายวิชาเพื่ออัปเดตเฉพาะระเบียนที่มีการเปลี่ยนแปลง (Delta Diff)',
    },
    stagingTemplate: {
      filename: 'Template_MCU_REG_Grades_Batch.csv',
      columns: [
        { key: 'student_id', label: 'รหัสนิสิต', example: '6601001001', required: true, dataType: 'text' },
        { key: 'course_code', label: 'รหัสวิชา', example: '000101', required: true, dataType: 'text' },
        { key: 'grade_val', label: 'เกรด', example: 'A', required: true, dataType: 'text' },
        { key: 'credits', label: 'หน่วยกิต', example: '3', required: true, dataType: 'number' },
      ],
      sampleCsv: `student_id,course_code,grade_val,credits\n6601001001,000101,A,3\n6601001002,000102,B+,3`,
    },
    syncStats: {
      lastSyncAt: '2026-09-22 03:00:15',
      totalRecordsProcessed: 3450,
      successCount: 3442,
      errorCount: 8,
      outboxPendingCount: 0,
      healthRate: 99.7,
    },
  },

  // 4. Credit Bank (ธนาคารหน่วยกิต)
  {
    id: 'adapter-credit-bank',
    code: 'MCU-NCB-ADP',
    name: 'Credit Bank (ธนาคารหน่วยกิต)',
    nameEn: 'National & Institutional Credit Bank Adapter',
    category: 'credit_bank',
    targetSystem: 'ธนาคารหน่วยกิตแห่งชาติ (National Credit Bank อว.) & MCU Credit Bank',
    externalAgency: 'กระทรวงการอุดมศึกษาฯ (อว.) / กองบริการการศึกษา มจร',
    hasLiveApi: true,
    currentMode: 'LIVE_API',
    supportedModes: ['LIVE_API', 'API_READY_CONTRACT', 'BATCH_FILE_EXCEL_CSV'],
    readinessStatus: 'LIVE_CONNECTED',
    whyNoApiReason:
      'มี REST API สำหรับ National Credit Bank อว. แต่สำหรับสถาบันภายนอกหรือเครือข่ายพระพุทธศาสนาต่างประเทศที่ยังไม่มี API จะใช้ Adapter Batch File รองรับแบบคู่ขนาน',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): เชื่อมต่อ Live REST API อว. สำหรับเทียบโอนระดับชาติ + ใช้ CSV สำหรับเครือข่ายพระพุทธศาสนาสากล',
      midTerm: 'ระยะที่ 2: เปิด Inbound Webhook รับผลการรับรองสะสมหน่วยกิตแบบ Real-time',
      longTerm: 'ระยะที่ 3: ระบบออก Digital Badge & Verifiable Credential เข้าระบบคลังหน่วยกิตอัตโนมัติ',
    },
    dataContract: {
      contractVersion: 'v2.1',
      endpointStub: 'https://api.ncb.mhesi.go.th/v2/credits/transfer',
      httpMethod: 'POST',
      authMethod: 'OAuth 2.0 / Bearer Token',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer <ncb_bearer_token>',
      },
      sampleRequestPayload: JSON.stringify(
        {
          institutionCode: 'MCU-001',
          learnerNationalId: '1-1002-00345-67-8',
          skillStandardCode: 'BUD-LIFE-SKILL-01',
          courseCode: 'BUD-101',
          courseNameTh: 'พระพุทธศาสนากับชีวิตสมัยใหม่',
          creditsAccumulated: 3,
          certifiedAt: '2026-09-15',
        },
        null,
        2
      ),
      sampleResponsePayload: JSON.stringify(
        {
          success: true,
          ncbTransactionId: 'NCB-TX-998234',
          creditsBanked: 3,
          currentTotalCredits: 18,
          timestamp: '2026-09-17T08:30:12Z',
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'national_id', targetField: 'learnerNationalId', dataType: 'string', required: true, transformRule: 'mask_cid', description: 'เลขประจำตัวประชาชนผู้สะสม', exampleValue: '1-1002-00345-67-8' },
        { sourceField: 'course_code', targetField: 'courseCode', dataType: 'string', required: true, transformRule: 'uppercase', description: 'รหัสรายวิชา/ชุดวิชา', exampleValue: 'BUD-101' },
        { sourceField: 'credits', targetField: 'creditsAccumulated', dataType: 'number', required: true, transformRule: 'parse_number', description: 'หน่วยกิตที่สะสม', exampleValue: '3' },
      ],
    },
    fallbackStrategy: {
      primary: 'ส่งผ่าน REST API ของธนาคารหน่วยกิตแห่งชาติ (อว.)',
      secondary: 'หากเครือข่าย อว. ปิดปรับปรุง จัดเก็บคำขอลง Outbox Buffer และส่งซ้ำอัตโนมัติเมื่อระบบกลับมาออนไลน์',
      offlineBehavior: 'ออกหนังสือรับรองหน่วยกิตสะสมชั่วคราว (Provisional Credit Slip) ให้แก่นิสิต',
      syncRecovery: 'ตรวจสอบสถานะ Reconciliation ทุกวันเวลา 06:00 น.',
    },
    stagingTemplate: {
      filename: 'Template_MCU_Credit_Bank_Batch.csv',
      columns: [
        { key: 'national_id', label: 'เลขประจำตัวประชาชน', example: '1100200345678', required: true, dataType: 'text' },
        { key: 'learner_name', label: 'ชื่อ-นามสกุล', example: 'นายอานนท์ ภักดี', required: true, dataType: 'text' },
        { key: 'course_code', label: 'รหัสรายวิชา', example: 'BUD-101', required: true, dataType: 'text' },
        { key: 'credits', label: 'จำนวนหน่วยกิต', example: '3', required: true, dataType: 'number' },
      ],
      sampleCsv: `national_id,learner_name,course_code,credits\n1100200345678,นายอานนท์ ภักดี,BUD-101,3\n1100300456789,นางสาวสุชาดา เมตตา,BUD-102,3`,
    },
    syncStats: {
      lastSyncAt: '2026-09-22 11:30:00',
      totalRecordsProcessed: 428,
      successCount: 428,
      errorCount: 0,
      outboxPendingCount: 0,
      healthRate: 100.0,
    },
  },

  // 5. QA (Quality Assurance)
  {
    id: 'adapter-qa',
    code: 'MCU-QA-EDPEX-ADP',
    name: 'ระบบประกันคุณภาพ (QA System / EdPEx / AUN-QA)',
    nameEn: 'Academic Quality Assurance & Accreditation Adapter',
    category: 'qa_accreditation',
    targetSystem: 'ระบบรายงานการประเมินตนเอง (SAR) / CHE QA Online / EdPEx มจร',
    externalAgency: 'กองแผนงานและพัฒนาคุณภาพ มจร / สป.อว.',
    hasLiveApi: false,
    currentMode: 'API_READY_CONTRACT',
    supportedModes: ['API_READY_CONTRACT', 'BATCH_FILE_EXCEL_CSV', 'STAGING_DB_VIEW'],
    readinessStatus: 'API_READY_CONTRACT',
    whyNoApiReason:
      'ระบบ CHE QA Online ของส่วนกลางยังเป็นระบบ Web Entry แบบปิด ไม่มี API สำหรับดูดข้อมูลตัวชี้วัดหรือหลักฐานร่องรอยจากภายนอก ส่วนระบบ QA มหาวิทยาลัยกำลังอยู่ระหว่างการร่างมาตรฐาน Data Exchange',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): ส่งออกตารางตัวชี้วัด KPI และเอกสารหลักฐาน SAR เป็น Excel & Data Package ตามเกณฑ์ EdPEx/AUN-QA',
      midTerm: 'ระยะที่ 2: ใช้ API-Ready Contract จำลองการส่งคะแนนการประเมินและค่าเป้าหมายเข้าสู่ Data Warehouse กลาง',
      longTerm: 'ระยะที่ 3: เชื่อมต่อ REST Endpoint ส่งผลประเมินตนเองแบบเรียลไทม์เมื่อระบบ CHE QA Next-Gen เปิดตัว',
    },
    dataContract: {
      contractVersion: 'v1.8',
      endpointStub: 'https://qa.mcu.ac.th/api/v1/sar/kpi-feed',
      httpMethod: 'POST',
      authMethod: 'API Key (HMAC SHA-256)',
      headers: {
        'Content-Type': 'application/json',
        'X-QA-System-Key': '<qa_system_token>',
      },
      sampleRequestPayload: JSON.stringify(
        {
          academicYear: 2569,
          standardFramework: 'EdPEx',
          category: 'หมวด 1 การนำองค์กร',
          kpiCode: 'KPI-EDPEX-01',
          kpiNameTh: 'ร้อยละของความสำเร็จในการขับเคลื่อนยุทธศาสตร์วิชาการ',
          targetScore: 85.0,
          actualScore: 88.4,
          status: 'ACHIEVED',
          evidenceLinks: ['https://documents.mcu.ac.th/sar/2569/evidence-kpi01.pdf'],
        },
        null,
        2
      ),
      sampleResponsePayload: JSON.stringify(
        {
          success: true,
          indicatorId: 'QA-2569-IND-01',
          recordedAt: '2026-09-21T10:00:00Z',
          weightedScore: 4.85,
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'kpi_code', targetField: 'code', dataType: 'string', required: true, transformRule: 'uppercase', description: 'รหัสตัวชี้วัด QA', exampleValue: 'KPI-EDPEX-01' },
        { sourceField: 'target_value', targetField: 'target', dataType: 'number', required: true, transformRule: 'parse_number', description: 'ค่าเป้าหมาย', exampleValue: '85.0' },
        { sourceField: 'actual_value', targetField: 'actual', dataType: 'number', required: true, transformRule: 'parse_number', description: 'ผลงานที่ทำได้จริง', exampleValue: '88.4' },
      ],
    },
    fallbackStrategy: {
      primary: 'ส่งออกตารางสรุปผลตัวชี้วัดและแนบไฟล์หลักฐาน (SAR Compliance Package)',
      secondary: 'กรอกผ่าน Batch File Excel ที่แม็ปหัวตารางตามแบบฟอร์ม สกอ.',
      offlineBehavior: 'คำนวณและประมวลผลคะแนนภายในระบบวิชาการเพื่อพร้อมส่งออกเมื่อเครือข่ายเชื่อมต่อ',
      syncRecovery: 'บันทึก Audit Log ทุกครั้งที่มีการแก้ไขคะแนนหรือหลักฐานร่องรอย',
    },
    stagingTemplate: {
      filename: 'Template_MCU_QA_KPI_SAR.csv',
      columns: [
        { key: 'kpi_code', label: 'รหัสตัวชี้วัด', example: 'KPI-EDPEX-01', required: true, dataType: 'text' },
        { key: 'kpi_name', label: 'ชื่อตัวชี้วัด', example: 'ร้อยละความสำเร็จตามแผน', required: true, dataType: 'text' },
        { key: 'target_value', label: 'เป้าหมาย', example: '85.0', required: true, dataType: 'number' },
        { key: 'actual_value', label: 'ผลงานจริง', example: '88.4', required: true, dataType: 'number' },
      ],
      sampleCsv: `kpi_code,kpi_name,target_value,actual_value\nKPI-EDPEX-01,ร้อยละความสำเร็จตามแผนยุทธศาสตร์,85.0,88.4\nKPI-AUN-02,ความพึงพอใจของนิสิตต่อหลักสูตร,4.0,4.35`,
    },
    syncStats: {
      lastSyncAt: '2026-09-22 09:00:00',
      totalRecordsProcessed: 32,
      successCount: 32,
      errorCount: 0,
      outboxPendingCount: 0,
      healthRate: 100.0,
    },
  },

  // 6. ระบบเอกสาร (E-Document / สารบรรณอิเล็กทรอนิกส์)
  {
    id: 'adapter-edoc',
    code: 'MCU-EDOC-SARABAN-ADP',
    name: 'ระบบเอกสาร (E-Document / สารบรรณอิเล็กทรอนิกส์)',
    nameEn: 'MCU E-Document & Digital Saraban Adapter',
    category: 'edocument_saraban',
    targetSystem: 'ระบบสารบรรณอิเล็กทรอนิกส์ มหาวิทยาลัย (MCU E-Saraban)',
    externalAgency: 'กองกลาง สำนักงานอธิการบดี มจร',
    hasLiveApi: false,
    currentMode: 'QUEUE_BUFFER_OUTBOX',
    supportedModes: ['QUEUE_BUFFER_OUTBOX', 'SFTP_BATCH', 'API_READY_CONTRACT'],
    readinessStatus: 'STANDBY',
    whyNoApiReason:
      'ระบบสารบรรณของกองกลางเป็นซอฟต์แวร์ Client-Server เฉพาะทาง ไม่มี REST API สำหรับออกเลขที่หนังสือจากภายนอก จึงออกแบบเป็นสถาปัตยกรรม Outbox Queue Buffer (พักมติสภาและคำสั่งแต่งตั้ง) เพื่อส่งออกแบบ Batch XML/PDF Packet ให้เจ้าหน้าที่สารบรรณรับเข้า',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): พักมติสภาวิชาการใน Outbox Buffer และส่งออกเป็น Dispatch Packet พร้อมไฟล์ PDF แนบ',
      midTerm: 'ระยะที่ 2: วางไฟล์ Dispatch XML เข้าสู่ Secure SFTP Folder ที่เจ้าหน้าที่สารบรรณตั้ง Script รูดเข้าอัตโนมัติ',
      longTerm: 'ระยะที่ 3: สลับใช้งาน Webhook Dispatcher ทันทีเมื่อสารบรรณขึ้นระบบ Cloud Next-Gen',
    },
    dataContract: {
      contractVersion: 'v1.0',
      endpointStub: 'https://edoc.mcu.ac.th/api/v1/dispatch/memo',
      httpMethod: 'POST',
      authMethod: 'OAuth 2.0 / Bearer Token',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer <edoc_bearer_token>',
      },
      sampleRequestPayload: JSON.stringify(
        {
          documentType: 'COUNCIL_RESOLUTION',
          referenceMeeting: 'การประชุมสภาวิชาการ ครั้งที่ 8/2569',
          title: 'แจ้งมติเห็นชอบหลักสูตรพุทธศาสตรบัณฑิต (ฉบับปรับปรุง พ.ศ. 2569)',
          urgency: 'ด่วนที่สุด',
          confidentiality: 'ปกติ',
          signerName: 'พระธรรมวัชรบัณฑิต, ศ.ดร.',
          recipientAgencies: ['สำนักทะเบียนและวัดผล', 'คณะพุทธศาสตร์'],
        },
        null,
        2
      ),
      sampleResponsePayload: JSON.stringify(
        {
          success: true,
          registeredDocumentNo: 'ศธ 0524.01/ว 142',
          registeredDate: '2026-09-20',
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'doc_title', targetField: 'title', dataType: 'string', required: true, transformRule: 'trim', description: 'ชื่อเรื่อง/หัวข้อหนังสือ', exampleValue: 'แจ้งมติสภาวิชาการ' },
        { sourceField: 'urgency_level', targetField: 'urgency', dataType: 'string', required: true, transformRule: 'trim', description: 'ชั้นความเร็ว (ด่วนที่สุด/ด่วนมาก/ปกติ)', exampleValue: 'ด่วนที่สุด' },
      ],
    },
    fallbackStrategy: {
      primary: 'คิวพักข้อมูลมติและคำสั่งใน Outbox Buffer ป้องกันข้อมูลตกหล่น',
      secondary: 'ส่งออกเป็นเอกสารชุดสารบรรณ (Official Dispatch Packet) พร้อมใบปะหน้า',
      offlineBehavior: 'ระบบวิชาการทำงานล่วงหน้าได้ทันที โดยออกเลขอ้างอิงภายใน (Internal Reference Tracking)',
      syncRecovery: 'เมื่อเจ้าหน้าที่สารบรรณออกเลขจริง ให้บันทึกเลขที่หนังสือราชการย้อนกลับเข้ามาอัปเดตระบบ',
    },
    stagingTemplate: {
      filename: 'Template_MCU_Saraban_Dispatch.csv',
      columns: [
        { key: 'doc_title', label: 'เรื่อง', example: 'แจ้งมติการประชุมสภาวิชาการ', required: true, dataType: 'text' },
        { key: 'urgency_level', label: 'ชั้นความเร็ว', example: 'ด่วนที่สุด', required: true, dataType: 'text' },
        { key: 'department_to', label: 'หน่วยงานผู้รับ', example: 'คณะพุทธศาสตร์', required: true, dataType: 'text' },
      ],
      sampleCsv: `doc_title,urgency_level,department_to\nแจ้งมติการประชุมสภาวิชาการ ครั้งที่ 8/2569,ด่วนที่สุด,คณะพุทธศาสตร์\nคำสั่งแต่งตั้งอาจารย์ที่ปรึกษาวิทยานิพนธ์,ด่วนมาก,บัณฑิตวิทยาลัย`,
    },
    syncStats: {
      lastSyncAt: '2026-09-22 17:00:00',
      totalRecordsProcessed: 1250,
      successCount: 1245,
      errorCount: 5,
      outboxPendingCount: 4,
      healthRate: 99.6,
    },
  },

  // 7. Email (ระบบอีเมลมหาวิทยาลัย)
  {
    id: 'adapter-email',
    code: 'MCU-MAIL-GATEWAY-ADP',
    name: 'ระบบ Email (MCU Academic Mail Gateway)',
    nameEn: 'University Mail & Notification Gateway Adapter',
    category: 'email_gateway',
    targetSystem: 'ระบบไปรษณีย์อิเล็กทรอนิกส์มหาวิทยาลัย (Google Workspace for Education / M365 / SMTP Relay)',
    externalAgency: 'สำนักเทคโนโลยีสารสนเทศ มจร',
    hasLiveApi: true,
    currentMode: 'LIVE_API',
    supportedModes: ['LIVE_API', 'QUEUE_BUFFER_OUTBOX'],
    readinessStatus: 'LIVE_CONNECTED',
    whyNoApiReason:
      'มี API พร้อมใช้งาน (Google Gmail API / Microsoft Graph API / SMTP Relay) พร้อมทั้งมีระบบ Fallback แจ้งเตือนในแอพพลิเคชัน (In-App Push Notification) เสมอหากระบบอีเมลภายนอกขัดข้อง',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): ส่งอีเมลผ่าน Google Workspace Service Account + Fallback สู่ In-App Notification',
      midTerm: 'ระยะที่ 2: เพิ่มการส่ง Calendar Invite (.ics) สำหรับนัดหมายประชุมสภาวิชาการและคณะกรรมการ',
      longTerm: 'ระยะที่ 3: เชื่อมต่อ SMS Gateway และ LINE Official สำหรับแจ้งเตือนเร่งด่วนชั้นวิกฤต',
    },
    dataContract: {
      contractVersion: 'v2.0',
      endpointStub: 'https://mail-gateway.mcu.ac.th/api/v1/send-mail',
      httpMethod: 'POST',
      authMethod: 'SMTP TLS / OAuth',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer <mail_service_token>',
      },
      sampleRequestPayload: JSON.stringify(
        {
          to: 'faculty-dean@mcu.ac.th',
          cc: ['academic-secretary@mcu.ac.th'],
          subject: '[แจ้งเตือนสภาวิชาการ] กำหนดส่งเอกสารวาระการประชุม ครั้งที่ 9/2569',
          templateId: 'COUNCIL_MEETING_AGENDA_CALL',
          templateVariables: {
            recipientName: 'คณบดีคณะพุทธศาสตร์',
            meetingDate: '28 กันยายน 2569 เวลา 09:30 น.',
            submissionDeadline: '24 กันยายน 2569 เวลา 16:30 น.',
          },
        },
        null,
        2
      ),
      sampleResponsePayload: JSON.stringify(
        {
          success: true,
          messageId: '<25690922.academic.mcu.ac.th>',
          status: 'DELIVERED_TO_GATEWAY',
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'to_email', targetField: 'to', dataType: 'string', required: true, transformRule: 'trim', description: 'อีเมลผู้รับ', exampleValue: 'dean@mcu.ac.th' },
        { sourceField: 'subject_line', targetField: 'subject', dataType: 'string', required: true, transformRule: 'trim', description: 'หัวข้ออีเมล', exampleValue: 'แจ้งกำหนดการประชุม' },
      ],
    },
    fallbackStrategy: {
      primary: 'ส่งผ่าน Google Workspace / M365 Mail API Gateway',
      secondary: 'ส่งผ่าน Internal SMTP Relay ของศูนย์คอมพิวเตอร์',
      offlineBehavior: 'บันทึกลง In-App Notification Center ภายในระบบเพื่อให้ผู้ใช้เห็นทันทีเมื่อเข้าสู่ระบบ',
      syncRecovery: 'พักอีเมลใน Outbox Queue และลองส่งใหม่อัตโนมัติ (Retry with Exponential Backoff)',
    },
    stagingTemplate: {
      filename: 'Template_MCU_Email_Recipient_List.csv',
      columns: [
        { key: 'to_email', label: 'อีเมล', example: 'dean@mcu.ac.th', required: true, dataType: 'text' },
        { key: 'subject_line', label: 'หัวข้อ', example: 'แจ้งการประชุมสภาวิชาการ', required: true, dataType: 'text' },
      ],
      sampleCsv: `to_email,subject_line\ndean.buddhist@mcu.ac.th,แจ้งกำหนดการประชุมสภาวิชาการ\ndean.education@mcu.ac.th,แจ้งกำหนดการประชุมสภาวิชาการ`,
    },
    syncStats: {
      lastSyncAt: '2026-09-22 18:30:00',
      totalRecordsProcessed: 540,
      successCount: 538,
      errorCount: 2,
      outboxPendingCount: 1,
      healthRate: 99.6,
    },
  },

  // 8. SSO (Single Sign-On / มหาวิทยาลัย)
  {
    id: 'adapter-sso',
    code: 'MCU-PASS-SSO-ADP',
    name: 'ระบบ SSO (MCU-Pass / Central Identity Provider)',
    nameEn: 'University Single Sign-On & Identity Federation Adapter',
    category: 'sso_identity',
    targetSystem: 'ระบบบริหารจัดการบัญชีผู้ใช้งานกลาง มจร (MCU-Pass / Active Directory / SAML / OIDC)',
    externalAgency: 'สำนักเทคโนโลยีสารสนเทศ มจร',
    hasLiveApi: false,
    currentMode: 'SSO_FEDERATED',
    supportedModes: ['SSO_FEDERATED', 'API_READY_CONTRACT'],
    readinessStatus: 'FEDERATED_ACTIVE',
    whyNoApiReason:
      'ระบบ MCU-Pass ใช้โปรโตคอลมาตรฐาน SAML 2.0 และ OpenID Connect ในการตรวจสอบสิทธิ์ตัวตน แต่ยังไม่มี REST API สำหรับ Sync บทบาทและสิทธิ์วิชาการสองทาง จึงใช้สถาปัตยกรรม Claims Token Mapping และ Local Database Fallback',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): ตรวจสอบตัวตนผ่าน SAML/OIDC Federated Login และจับคู่กับฐานข้อมูลผู้ใช้งานในระบบ',
      midTerm: 'ระยะที่ 2: ใช้ SCIM 2.0 (System for Cross-domain Identity Management) ซิงก์รายชื่อและสถานะบุคลากร',
      longTerm: 'ระยะที่ 3: รองรับ Digital ID ผ่านแอปพลิเคชัน ThaiD ของกรมการปกครองสำหรับนิสิตและคณาจารย์',
    },
    dataContract: {
      contractVersion: 'v2.0-oidc',
      endpointStub: 'https://sso.mcu.ac.th/oauth2/v1/userinfo',
      httpMethod: 'GET',
      authMethod: 'SAML 2.0 / OIDC Token',
      headers: {
        Authorization: 'Bearer <id_token>',
      },
      sampleRequestPayload: JSON.stringify({}, null, 2),
      sampleResponsePayload: JSON.stringify(
        {
          sub: 'mcu-usr-00892',
          email: 'pichet.api@mcu.ac.th',
          name: 'ผศ.ดร.พระมหาพิเชษฐ์ อภิวฑฺฒโน',
          citizenId: '1-1002-00123-45-6',
          faculty: 'คณะพุทธศาสตร์',
          roles: ['FACULTY_MEMBER', 'ACADEMIC_COMMITTEE'],
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'sub', targetField: 'ssoUid', dataType: 'string', required: true, transformRule: 'trim', description: 'รหัสอ้างอิงผู้ใช้งานในระบบ SSO', exampleValue: 'mcu-usr-00892' },
        { sourceField: 'email', targetField: 'email', dataType: 'string', required: true, transformRule: 'trim', description: 'อีเมลประจำตัวมหาวิทยาลัย', exampleValue: 'pichet@mcu.ac.th' },
        { sourceField: 'citizenId', targetField: 'nationalId', dataType: 'string', required: true, transformRule: 'mask_cid', description: 'เลขประจำตัวประชาชน', exampleValue: '1-1002-00123-45-6' },
      ],
    },
    fallbackStrategy: {
      primary: 'ยืนยันตัวตนผ่าน MCU-Pass Single Sign-On (SAML 2.0 / OIDC)',
      secondary: 'หากเครือข่าย SSO มหาวิทยาลัยล่ม รองรับการเข้าสู่ระบบผ่าน Local Secure Account (เฉพาะผู้ดูแลระบบและผู้บริหาร)',
      offlineBehavior: 'Session Token ภายในคงสภาพการทำงานต่อเนื่อง ไม่เด้งออกจากระบบขณะทำงานสำคัญ',
      syncRecovery: 'ตรวจสอบสถานะ Token กับ IdP กลางเมื่อเครือข่ายกลับมาปกติ',
    },
    stagingTemplate: {
      filename: 'Template_MCU_SSO_Account_Map.csv',
      columns: [
        { key: 'sso_email', label: 'อีเมล SSO', example: 'pichet@mcu.ac.th', required: true, dataType: 'text' },
        { key: 'role_mapped', label: 'บทบาทในระบบวิชาการ', example: 'Lecturer', required: true, dataType: 'text' },
      ],
      sampleCsv: `sso_email,role_mapped\npichet.api@mcu.ac.th,Lecturer\nsomchai.pan@mcu.ac.th,Faculty Admin`,
    },
    syncStats: {
      lastSyncAt: '2026-09-22 19:15:00',
      totalRecordsProcessed: 120,
      successCount: 120,
      errorCount: 0,
      outboxPendingCount: 0,
      healthRate: 100.0,
    },
  },

  // 9. ระบบของมหาวิทยาลัย/หน่วยงานภายนอก (Central University Gateway & MHESI Hub)
  {
    id: 'adapter-mhesi-central',
    code: 'MCU-MHESI-HUB-ADP',
    name: 'ระบบมหาวิทยาลัย/หน่วยงานภายนอก (University Central & MHESI Hub)',
    nameEn: 'Central University Gateway & MHESI Data Hub Adapter',
    category: 'external_university_gov',
    targetSystem: 'ระบบสารสนเทศกลางมหาวิทยาลัย (MCU Central Data Gateway) & ศูนย์ข้อมูล อว. (MHESI)',
    externalAgency: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (ส่วนกลาง) & สำนักงานปลัดกระทรวง อว.',
    hasLiveApi: false,
    currentMode: 'BATCH_FILE_EXCEL_CSV',
    supportedModes: ['BATCH_FILE_EXCEL_CSV', 'SFTP_BATCH', 'API_READY_CONTRACT'],
    readinessStatus: 'BATCH_FILE_ACTIVE',
    whyNoApiReason:
      'หน่วยงานกำกับดูแลระดับกระทรวง (อว.) และศูนย์ข้อมูลกลางมหาวิทยาลัยยังอยู่ในช่วงจัดทำกรอบธรรมาภิบาลข้อมูล (Data Governance) จึงเปิดรับรายงานสถิติวิชาการตามงวดผ่าน Secure SFTP Batch File และแบบรายงานกลางเท่านั้น',
    transitionRoadmap: {
      shortTerm: 'ระยะที่ 1 (ปัจจุบัน): สร้างไฟล์ชุดข้อมูลรายงานสถิติวิชาการประจำปี (Annual Academic Statistics Dataset) นำส่งผ่าน SFTP/Excel',
      midTerm: 'ระยะที่ 2: จัดทำ API-Ready DTO เชื่อมโยงเข้าสู่ Enterprise Service Bus (ESB) ของมหาวิทยาลัย',
      longTerm: 'ระยะที่ 3: แลกเปลี่ยนข้อมูลสองทางกับ MHESI Open Data Gateway แบบไร้รอยต่อ',
    },
    dataContract: {
      contractVersion: 'v1.5',
      endpointStub: 'https://gateway.mcu.ac.th/api/v1/central/academic-summary',
      httpMethod: 'POST',
      authMethod: 'mTLS X.509 Certificate',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Cert-SHA256': '<cert_thumbprint>',
      },
      sampleRequestPayload: JSON.stringify(
        {
          fiscalYear: 2569,
          campusCount: 11,
          collegeCount: 5,
          activeCurriculums: 164,
          totalGraduates: 4250,
          accreditedPercentage: 98.5,
        },
        null,
        2
      ),
      sampleResponsePayload: JSON.stringify(
        {
          success: true,
          reportTrackingCode: 'MHESI-REP-2569-0941',
          verifiedAt: '2026-09-20T14:20:00Z',
        },
        null,
        2
      ),
      fieldMappings: [
        { sourceField: 'fiscal_year', targetField: 'academicYear', dataType: 'number', required: true, transformRule: 'parse_number', description: 'ปีงบประมาณ/ปีการศึกษา', exampleValue: '2569' },
        { sourceField: 'graduates_count', targetField: 'graduates', dataType: 'number', required: true, transformRule: 'parse_number', description: 'จำนวนผู้สำเร็จการศึกษา', exampleValue: '4250' },
      ],
    },
    fallbackStrategy: {
      primary: 'สร้างรายงานสรุปเชิงบริหาร (Executive Summary Dataset) ส่งผ่าน SFTP Server',
      secondary: 'ส่งออกเป็นเอกสารรายงานสมบูรณ์พร้อมตารางข้อมูลแนบ (PDF + Excel Dataset)',
      offlineBehavior: 'ประมวลผลสรุปข้อมูลจากฐานข้อมูลกลางอย่างถูกต้องแม่นยำเพื่อพร้อมจัดส่งตามกำหนด',
      syncRecovery: 'มีระบบ Versioning กำกับทุกชุดข้อมูลที่ส่งออก ป้องกันความสับสนของข้อมูล',
    },
    stagingTemplate: {
      filename: 'Template_MCU_MHESI_Annual_Summary.csv',
      columns: [
        { key: 'fiscal_year', label: 'ปีการศึกษา', example: '2569', required: true, dataType: 'number' },
        { key: 'total_curriculums', label: 'จำนวนหลักสูตร', example: '164', required: true, dataType: 'number' },
        { key: 'graduates_count', label: 'ผู้สำเร็จการศึกษา', example: '4250', required: true, dataType: 'number' },
      ],
      sampleCsv: `fiscal_year,total_curriculums,graduates_count\n2569,164,4250\n2568,160,4120`,
    },
    syncStats: {
      lastSyncAt: '2026-09-22 15:00:00',
      totalRecordsProcessed: 98,
      successCount: 98,
      errorCount: 0,
      outboxPendingCount: 0,
      healthRate: 100.0,
    },
  },
];

// In-Memory Storage for Outbox and Batch Jobs
const IN_MEMORY_OUTBOX: OutboxQueueItem[] = [
  {
    id: 'OUTBOX-001',
    adapterId: 'adapter-curriculum',
    adapterCode: 'CHECO-CURR-ADP',
    targetSystem: 'ระบบพิจารณาความสอดคล้องหลักสูตร (CHECO สป.อว.)',
    action: 'DISPATCH_CURRICULUM_MKO2',
    payload: {
      curriculumCode: 'CURR-2569-BUD-01',
      titleTh: 'หลักสูตรพุทธศาสตรบัณฑิต (ปรับปรุง 2569)',
      councilResolution: 'มติสภาวิชาการ 8/2569',
    },
    createdAt: '2026-09-22 16:45:00',
    status: 'queued',
    retryCount: 0,
  },
  {
    id: 'OUTBOX-002',
    adapterId: 'adapter-edoc',
    adapterCode: 'MCU-EDOC-SARABAN-ADP',
    targetSystem: 'ระบบสารบรรณอิเล็กทรอนิกส์ (MCU E-Saraban)',
    action: 'DISPATCH_COUNCIL_RESOLUTION',
    payload: {
      documentType: 'COUNCIL_MINUTES',
      meetingNo: 'ครั้งที่ 8/2569',
      recipientDepartments: ['คณะพุทธศาสตร์', 'สำนักทะเบียน'],
    },
    createdAt: '2026-09-22 17:10:00',
    status: 'queued',
    retryCount: 0,
  },
];

export class IntegrationAdapterEngine {
  private static adapters: IntegrationAdapterDefinition[] = [...CORE_INTEGRATION_ADAPTERS];
  private static outbox: OutboxQueueItem[] = [...IN_MEMORY_OUTBOX];
  private static batchJobs: BatchIngestionJob[] = [];

  static getAdapters(): IntegrationAdapterDefinition[] {
    return [...this.adapters];
  }

  static getAdapterById(id: string): IntegrationAdapterDefinition | undefined {
    return this.adapters.find((a) => a.id === id);
  }

  static updateAdapterMode(adapterId: string, newMode: IntegrationMode): boolean {
    const adapter = this.adapters.find((a) => a.id === adapterId);
    if (!adapter) return false;

    adapter.currentMode = newMode;
    switch (newMode) {
      case 'LIVE_API':
        adapter.readinessStatus = 'LIVE_CONNECTED';
        break;
      case 'API_READY_CONTRACT':
        adapter.readinessStatus = 'API_READY_CONTRACT';
        break;
      case 'STAGING_DB_VIEW':
        adapter.readinessStatus = 'STAGING_VIEW_ACTIVE';
        break;
      case 'BATCH_FILE_EXCEL_CSV':
        adapter.readinessStatus = 'BATCH_FILE_ACTIVE';
        break;
      case 'SSO_FEDERATED':
        adapter.readinessStatus = 'FEDERATED_ACTIVE';
        break;
      default:
        adapter.readinessStatus = 'STANDBY';
    }
    return true;
  }

  static getOutboxItems(): OutboxQueueItem[] {
    return [...this.outbox];
  }

  static addOutboxItem(item: Omit<OutboxQueueItem, 'id' | 'createdAt' | 'status' | 'retryCount'>): OutboxQueueItem {
    const newItem: OutboxQueueItem = {
      ...item,
      id: `OUTBOX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'queued',
      retryCount: 0,
    };
    this.outbox.unshift(newItem);
    return newItem;
  }

  static flushOutboxItem(itemId: string): { success: boolean; message: string } {
    const item = this.outbox.find((o) => o.id === itemId);
    if (!item) return { success: false, message: 'ไม่พบรายการในคิว Outbox' };

    item.status = 'dispatched';
    return {
      success: true,
      message: `ส่งข้อมูล ${item.action} ไปยัง ${item.targetSystem} เรียบร้อยแล้ว`,
    };
  }

  static flushAllOutbox(): number {
    let count = 0;
    this.outbox.forEach((item) => {
      if (item.status === 'queued') {
        item.status = 'dispatched';
        count++;
      }
    });
    return count;
  }

  /**
   * Process & Dry-Run Batch File Content (CSV / JSON) against an Adapter's Data Contract
   */
  static processBatchIngestion(
    adapterId: string,
    filename: string,
    rawContent: string,
    fileType: 'csv' | 'excel' | 'json'
  ): BatchIngestionJob {
    const adapter = this.getAdapterById(adapterId);
    if (!adapter) {
      throw new Error(`ไม่พบ Adapter ID: ${adapterId}`);
    }

    const rows: BatchIngestionRowResult[] = [];
    const dryRunSummary: string[] = [];

    if (fileType === 'json') {
      try {
        const parsed = JSON.parse(rawContent);
        const dataArr: any[] = Array.isArray(parsed) ? parsed : parsed.data || parsed.records || [parsed];

        dataArr.forEach((raw, idx) => {
          const errors: string[] = [];
          const warnings: string[] = [];
          const mappedData: Record<string, any> = {};

          adapter.dataContract.fieldMappings.forEach((rule) => {
            const val = raw[rule.sourceField];
            if (rule.required && (val === undefined || val === null || val === '')) {
              errors.push(`ขาดฟิลด์บังคับ: ${rule.sourceField} (${rule.description})`);
            } else if (val !== undefined && val !== null) {
              mappedData[rule.targetField] = val;
            }
          });

          rows.push({
            rowNumber: idx + 1,
            isValid: errors.length === 0,
            rawData: raw,
            mappedData,
            errors,
            warnings,
          });
        });
      } catch (err: any) {
        dryRunSummary.push(`เกิดข้อผิดพลาดในการแปลงไฟล์ JSON: ${err.message}`);
      }
    } else {
      // CSV parser
      const lines = rawContent.trim().split(/\r?\n/);
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        dryRunSummary.push(`ตรวจพบคอลัมน์ในไฟล์: ${headers.join(', ')}`);

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
          const rawRow: Record<string, any> = {};
          headers.forEach((h, hIdx) => {
            rawRow[h] = values[hIdx] ?? '';
          });

          const errors: string[] = [];
          const warnings: string[] = [];
          const mappedData: Record<string, any> = {};

          adapter.dataContract.fieldMappings.forEach((rule) => {
            const val = rawRow[rule.sourceField];
            if (rule.required && (!val || val.trim() === '')) {
              errors.push(`คอลัมน์ "${rule.sourceField}" (${rule.description}) ต้องไม่เป็นค่าว่าง`);
            } else if (val !== undefined) {
              mappedData[rule.targetField] = val;
            }
          });

          rows.push({
            rowNumber: i,
            isValid: errors.length === 0,
            rawData: rawRow,
            mappedData,
            errors,
            warnings,
          });
        }
      } else {
        dryRunSummary.push('ไฟล์ไม่มีเนื้อหาหรือไม่มีแถวหัวตาราง (Header)');
      }
    }

    const validRows = rows.filter((r) => r.isValid).length;
    const errorRows = rows.filter((r) => !r.isValid).length;

    dryRunSummary.push(`ผลการตรวจสอบ Dry-Run: ผ่าน ${validRows} แถว / พบข้อผิดพลาด ${errorRows} แถว`);

    const job: BatchIngestionJob = {
      id: `BATCH-JOB-${Date.now()}`,
      adapterId,
      adapterName: adapter.name,
      filename,
      fileType,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      totalRows: rows.length,
      validRows,
      errorRows,
      status: errorRows === 0 && validRows > 0 ? 'validated' : errorRows > 0 ? 'validated' : 'failed',
      dryRunSummary,
      rows,
    };

    this.batchJobs.unshift(job);
    return job;
  }

  /**
   * Commit a validated batch job into live system records
   */
  static commitBatchJob(jobId: string): { success: boolean; recordsCommitted: number; message: string } {
    const job = this.batchJobs.find((j) => j.id === jobId);
    if (!job) return { success: false, recordsCommitted: 0, message: 'ไม่พบ Job' };

    const validCount = job.validRows;
    job.status = 'committed';

    // Update adapter stats
    const adapter = this.getAdapterById(job.adapterId);
    if (adapter) {
      adapter.syncStats.totalRecordsProcessed += validCount;
      adapter.syncStats.successCount += validCount;
      adapter.syncStats.lastSyncAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    return {
      success: true,
      recordsCommitted: validCount,
      message: `นำเข้าข้อมูลจำนวน ${validCount} รายการเข้าสู่ระบบสำเร็จเรียบร้อย`,
    };
  }

  /**
   * Simulate API-ready Contract ping or Mock Request
   */
  static simulateApiContractCall(
    adapterId: string,
    payloadString: string
  ): { success: boolean; latencyMs: number; response: any; error?: string } {
    const adapter = this.getAdapterById(adapterId);
    if (!adapter) {
      return { success: false, latencyMs: 0, response: null, error: 'ไม่พบ Adapter' };
    }

    try {
      const parsed = JSON.parse(payloadString);
      // Validate contract requirements
      const missingFields: string[] = [];
      adapter.dataContract.fieldMappings.forEach((rule) => {
        if (rule.required && parsed[rule.sourceField] === undefined && parsed[rule.targetField] === undefined) {
          missingFields.push(rule.sourceField);
        }
      });

      const latencyMs = Math.floor(Math.random() * 200) + 120; // 120-320ms simulated response

      if (missingFields.length > 0) {
        return {
          success: false,
          latencyMs,
          response: {
            statusCode: 422,
            error: 'Unprocessable Entity - Schema Validation Failed',
            missingRequiredFields: missingFields,
            contractVersion: adapter.dataContract.contractVersion,
          },
        };
      }

      const mockResponse = JSON.parse(adapter.dataContract.sampleResponsePayload);
      return {
        success: true,
        latencyMs,
        response: {
          ...mockResponse,
          _simulatedContractStatus: 'PASSED',
          _endpointTarget: adapter.dataContract.endpointStub,
          _timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: 15,
        response: null,
        error: `JSON Format Error: ${err.message}`,
      };
    }
  }
}

export const integrationAdapterEngine = IntegrationAdapterEngine;
