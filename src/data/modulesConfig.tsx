import React from 'react';
import type { ModuleConfig } from '../views/ModulePlaceholderView.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  meetings: {
    title: 'การประชุมและมติสภาวิชาการ',
    subtitle: 'ระบบบริหารวาระการประชุม บันทึกรายงานการประชุม และติดตามการขับเคลื่อนมติ',
    category: 'บริหารวิชาการ',
    createButtonLabel: 'สร้างวาระการประชุมใหม่',
    filterLabel: 'สถานะมติ',
    filterOptions: [
      { id: 'all', label: 'ทั้งหมด' },
      { id: 'approved', label: 'อนุมัติแล้ว', count: 18 },
      { id: 'in-progress', label: 'กำลังขับเคลื่อน', count: 6 },
      { id: 'pending', label: 'รอดำเนินการ', count: 3 },
    ],
    columns: [
      { key: 'code', title: 'รหัสวาระ', width: '130px' },
      {
        key: 'title',
        title: 'เรื่องที่พิจารณา / มติ',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.description}</p>
          </div>
        ),
      },
      { key: 'meeting', title: 'การประชุม', width: '160px' },
      { key: 'department', title: 'หน่วยงานเสนอ', width: '150px' },
      { key: 'date', title: 'วันที่ประชุม', width: '120px' },
      {
        key: 'status',
        title: 'สถานะมติ',
        width: '140px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        code: 'วาระ 4.1',
        title: 'การรับรองหลักสูตรพุทธศาสตรบัณฑิต (ปรับปรุง พ.ศ. 2568)',
        description: 'คณะพุทธศาสตร์',
        meeting: 'สภาวิชาการ ครั้งที่ 8/2569',
        department: 'คณะพุทธศาสตร์',
        date: '10 ก.ย. 2569',
        status: 'approved',
      },
      {
        id: '2',
        code: 'วาระ 4.2',
        title: 'การลงนาม MOU ร่วมมือกับมหาวิทยาลัยเคลาณิยะ ศรีลังกา',
        description: 'โครงการแลกเปลี่ยนนักวิชาการ',
        meeting: 'สภาวิชาการ ครั้งที่ 8/2569',
        department: 'วิทยาลัยพระธรรมทูต',
        date: '10 ก.ย. 2569',
        status: 'in-progress',
      },
      {
        id: '3',
        code: 'วาระ 5.1',
        title: 'การเทียบโอนผลการเรียนรู้ Credit Bank หลักสูตรพระไตรปิฎกศึกษา',
        description: 'สะสมหน่วยกิตล่วงหน้า',
        meeting: 'สภาวิชาการ ครั้งที่ 7/2569',
        department: 'ศูนย์ Credit Bank',
        date: '14 ส.ค. 2569',
        status: 'approved',
      },
      {
        id: '4',
        code: 'วาระ 5.2',
        title: 'การจัดทำกรอบมาตรฐานตำแหน่งทางวิชาการเกณฑ์ใหม่ ก.พ.อ.',
        description: 'เตรียมจัดสัมมนาบุคลากร',
        meeting: 'สภาวิชาการ ครั้งที่ 7/2569',
        department: 'กองวิชาการ',
        date: '14 ส.ค. 2569',
        status: 'pending',
      },
    ],
  },

  strategy: {
    title: 'แผน / KPI / งบประมาณ / Risk',
    subtitle: 'กำกับติดตามตัวชี้วัดความสำเร็จตามแผนยุทธศาสตร์วิชาการ การใช้งบประมาณ และบริหารความเสี่ยง',
    category: 'แผนและยุทธศาสตร์',
    createButtonLabel: 'สร้างตัวชี้วัด KPI ใหม่',
    filterLabel: 'ระดับการประเมิน',
    filterOptions: [
      { id: 'all', label: 'ทุกตัวชี้วัด' },
      { id: 'approved', label: 'บรรลุเป้าหมาย', count: 8 },
      { id: 'in-progress', label: 'อยู่ระหว่างดำเนินการ', count: 4 },
      { id: 'warning', label: 'เฝ้าระวัง', count: 2 },
    ],
    columns: [
      { key: 'kpiCode', title: 'รหัส KPI', width: '100px' },
      {
        key: 'kpiName',
        title: 'ชื่อตัวชี้วัดและคำอธิบาย',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.kpiName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.plan}</p>
          </div>
        ),
      },
      { key: 'target', title: 'เป้าหมาย', width: '120px' },
      { key: 'actual', title: 'ผลงานปัจจุบัน', width: '120px' },
      { key: 'budget', title: 'งบประมาณที่ใช้', width: '130px' },
      {
        key: 'status',
        title: 'สถานะ',
        width: '140px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        kpiCode: 'KPI-1.1',
        kpiName: 'ร้อยละของหลักสูตรที่ได้รับการรับรองตามเกณฑ์ AUN-QA',
        plan: 'ยุทธศาสตร์ที่ 1 ด้านวิชาการ',
        target: '85.00 %',
        actual: '88.50 %',
        budget: '1,250,000 บาท',
        status: 'approved',
      },
      {
        id: '2',
        kpiCode: 'KPI-1.2',
        kpiName: 'จำนวนผู้เรียนในระบบคลังหน่วยกิต (Credit Bank)',
        plan: 'การเรียนรู้ตลอดชีวิต',
        target: '1,200 คน',
        actual: '1,420 คน',
        budget: '850,000 บาท',
        status: 'approved',
      },
      {
        id: '3',
        kpiCode: 'KPI-2.1',
        kpiName: 'จำนวนอาจารย์ที่ผ่านเกณฑ์ Thailand PSF ระดับที่ 2 ขึ้นไป',
        plan: 'พัฒนาสมรรถนะอาจารย์',
        target: '60.00 %',
        actual: '52.00 %',
        budget: '600,000 บาท',
        status: 'in-progress',
      },
      {
        id: '4',
        kpiCode: 'RISK-01',
        kpiName: 'ความเสี่ยงด้านการปรับปรุงหลักสูตรไม่ทันตามรอบ 5 ปี',
        plan: 'แผนบริหารความเสี่ยงวิชาการ',
        target: '0 หลักสูตร',
        actual: '2 หลักสูตร',
        budget: 'เฝ้าระวัง',
        status: 'warning',
      },
    ],
  },

  collaboration: {
    title: 'หลักสูตรความร่วมมือและ MOU',
    subtitle: 'บันทึกข้อตกลงความร่วมมือทางวิชาการ (MOU/MOA) สถาบันสมทบในและต่างประเทศ',
    category: 'หลักสูตรและการศึกษา',
    createButtonLabel: 'สร้าง MOU ใหม่',
    filterLabel: 'ประเภทความร่วมมือ',
    filterOptions: [
      { id: 'all', label: 'ทั้งหมด' },
      { id: 'active', label: 'มีผลบังคับใช้', count: 12 },
      { id: 'pending', label: 'รอลงนาม', count: 3 },
    ],
    columns: [
      { key: 'mouNo', title: 'เลขที่ MOU', width: '140px' },
      {
        key: 'institution',
        title: 'สถาบันคู่สัญญา / รายละเอียด',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.institution}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.scope}</p>
          </div>
        ),
      },
      { key: 'country', title: 'ประเทศ/พื้นที่', width: '130px' },
      { key: 'validity', title: 'ระยะเวลาสัญญา', width: '160px' },
      {
        key: 'status',
        title: 'สถานะสัญญา',
        width: '130px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        mouNo: 'MOU-MCU-2569-01',
        institution: 'University of Kelaniya',
        scope: 'แลกเปลี่ยนคณาจารย์และวิจัยพระพุทธศาสนา',
        country: 'ประเทศศรีลังกา',
        validity: '2568 - 2573 (5 ปี)',
        status: 'active',
      },
      {
        id: '2',
        mouNo: 'MOU-MCU-2569-02',
        institution: 'Nalanda University',
        scope: 'หลักสูตรร่วม ปรัชญาดุษฎีบัณฑิต',
        country: 'ประเทศอินเดีย',
        validity: '2569 - 2574 (5 ปี)',
        status: 'active',
      },
      {
        id: '3',
        mouNo: 'MOU-MCU-2569-03',
        institution: 'วิทยาลัยศาสนศึกษา มหาวิทยาลัยมหิดล',
        scope: 'เครือข่ายธนาคารหน่วยกิตระดับชาติ',
        country: 'ในประเทศ',
        validity: '2569 - 2572 (3 ปี)',
        status: 'pending',
      },
    ],
  },

  courses: {
    title: 'Short Course / Non-degree',
    subtitle: 'การบริหารจัดการหลักสูตรระยะสั้น ประกาศนียบัตรวิชาชีพ และการศึกษาเพื่อการเรียนรู้ตลอดชีวิต',
    category: 'หลักสูตรและการศึกษา',
    createButtonLabel: 'สร้าง Short Course ใหม่',
    filterLabel: 'สถานะหลักสูตร',
    filterOptions: [
      { id: 'all', label: 'ทั้งหมด' },
      { id: 'active', label: 'เปิดรับสมัคร', count: 15 },
      { id: 'draft', label: 'ร่างหลักสูตร', count: 4 },
    ],
    columns: [
      { key: 'courseCode', title: 'รหัสหลักสูตร', width: '120px' },
      {
        key: 'courseName',
        title: 'ชื่อหลักสูตรอบรม / วัตถุประสงค์',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.courseName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.dept}</p>
          </div>
        ),
      },
      { key: 'credits', title: 'เทียบหน่วยกิต', width: '120px' },
      { key: 'duration', title: 'ระยะเวลาอบรม', width: '130px' },
      { key: 'enrolled', title: 'ผู้เรียน', width: '100px' },
      {
        key: 'status',
        title: 'สถานะ',
        width: '130px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        courseCode: 'SC-MCU-101',
        courseName: 'การพัฒนาภาวะผู้นำทางพระพุทธศาสนาในยุคดิจิทัล',
        dept: 'คณะสังคมศาสตร์',
        credits: '3 หน่วยกิต',
        duration: '45 ชั่วโมง',
        enrolled: '145 คน',
        status: 'active',
      },
      {
        id: '2',
        courseCode: 'SC-MCU-102',
        courseName: 'การจัดการความขัดแย้งและสันติวิธีตามแนวพุทธ',
        dept: 'สถาบันสันติศึกษา',
        credits: '3 หน่วยกิต',
        duration: '60 ชั่วโมง',
        enrolled: '88 คน',
        status: 'active',
      },
      {
        id: '3',
        courseCode: 'SC-MCU-103',
        courseName: 'พระพุทธศาสนากับการดูแลสุขภาพแบบองค์รวม (Mindfulness)',
        dept: 'คณะพุทธศาสตร์',
        credits: '2 หน่วยกิต',
        duration: '30 ชั่วโมง',
        enrolled: '210 คน',
        status: 'active',
      },
    ],
  },

  'pre-degree': {
    title: 'ระบบการเรียนรู้ล่วงหน้า (Pre-degree)',
    subtitle: 'โครงการสะสมหน่วยกิตล่วงหน้าสำหรับนักเรียนมัธยมศึกษาตอนปลายและผู้สนใจทั่วไป',
    category: 'หลักสูตรและการศึกษา',
    createButtonLabel: 'เปิดรับสมัครรุ่นใหม่',
    filterLabel: 'ปีการศึกษา',
    filterOptions: [
      { id: 'all', label: 'ทุกภาคเรียน' },
      { id: 'active', label: 'กำลังศึกษา', count: 9 },
      { id: 'completed', label: 'เทียบโอนแล้ว', count: 18 },
    ],
    columns: [
      { key: 'cohort', title: 'รุ่น/ปีการศึกษา', width: '120px' },
      {
        key: 'school',
        title: 'โรงเรียนเครือข่าย / กลุ่มวิชา',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.school}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.subjects}</p>
          </div>
        ),
      },
      { key: 'students', title: 'จำนวนนักเรียน', width: '120px' },
      { key: 'accumulated', title: 'หน่วยกิตสะสมเฉลี่ย', width: '150px' },
      {
        key: 'status',
        title: 'สถานะโครงการ',
        width: '140px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        cohort: 'รุ่นที่ 4 (2569)',
        school: 'โรงเรียนบาลีสาธิตศึกษา มหาจุฬาฯ',
        subjects: 'วิชาภาษาบาลี 1-2 และปรัชญาเบื้องต้น',
        students: '64 คน',
        accumulated: '6 หน่วยกิต',
        status: 'active',
      },
      {
        id: '2',
        cohort: 'รุ่นที่ 3 (2568)',
        school: 'เครือข่ายโรงเรียนพระปริยัติธรรม แผนกสามัญศึกษา',
        subjects: 'หมวดวิชาศึกษาทั่วไป (GE)',
        students: '120 คน',
        accumulated: '12 หน่วยกิต',
        status: 'completed',
      },
    ],
  },

  'credit-bank': {
    title: 'ธนาคารหน่วยกิต (Credit Bank)',
    subtitle: 'ระบบบริหารการสะสมหน่วยกิต การเทียบโอนผลการเรียนรู้ และประสบการณ์ตามมาตรฐาน อว.',
    category: 'หลักสูตรและการศึกษา',
    createButtonLabel: 'บันทึกรายการเทียบโอนใหม่',
    filterLabel: 'สถานะการเทียบโอน',
    filterOptions: [
      { id: 'all', label: 'ทั้งหมด' },
      { id: 'approved', label: 'อนุมัติเทียบโอน', count: 42 },
      { id: 'pending', label: 'รอคณะกรรมการพิจารณา', count: 8 },
    ],
    columns: [
      { key: 'studentId', title: 'รหัสผู้เรียน', width: '130px' },
      {
        key: 'studentName',
        title: 'ชื่อ-ฉายา / หลักสูตรเป้าหมาย',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.studentName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.targetCurriculum}</p>
          </div>
        ),
      },
      { key: 'creditsRequested', title: 'ขอเทียบโอน', width: '120px' },
      { key: 'creditsApproved', title: 'อนุมัติแล้ว', width: '120px' },
      { key: 'submissionDate', title: 'วันที่ยื่นคำร้อง', width: '120px' },
      {
        key: 'status',
        title: 'สถานะคำร้อง',
        width: '140px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        studentId: 'CB-6901-0021',
        studentName: 'พระมหาอภิสิทธิ์ ธมฺมธโร',
        targetCurriculum: 'หลักสูตรพุทธศาสตรบัณฑิต',
        creditsRequested: '18 หน่วยกิต',
        creditsApproved: '18 หน่วยกิต',
        submissionDate: '02 ก.ย. 2569',
        status: 'approved',
      },
      {
        id: '2',
        studentId: 'CB-6901-0022',
        studentName: 'นายกิตติศักดิ์ พรหมมินทร์',
        targetCurriculum: 'หลักสูตรครุศาสตรบัณฑิต สาขาการสอนพระพุทธศาสนา',
        creditsRequested: '12 หน่วยกิต',
        creditsApproved: 'รอตรวจสอบ',
        submissionDate: '08 ก.ย. 2569',
        status: 'pending',
      },
    ],
  },

  faculty: {
    title: 'อาจารย์และสมรรถนะอาจารย์',
    subtitle: 'ฐานข้อมูลภาระงานอาจารย์ มาตรฐานสมรรถนะอาจารย์ (Thailand PSF) และการขอกำหนดตำแหน่งทางวิชาการ',
    category: 'บุคลากรวิชาการ',
    createButtonLabel: 'บันทึกประเมินสมรรถนะ',
    filterLabel: 'ระดับตำแหน่ง',
    filterOptions: [
      { id: 'all', label: 'ทุกตำแหน่ง' },
      { id: 'active', label: 'ผ่านเกณฑ์ PSF', count: 35 },
      { id: 'pending', label: 'รอพิจารณาผลงาน', count: 5 },
    ],
    columns: [
      { key: 'empId', title: 'รหัสประจำตัว', width: '120px' },
      {
        key: 'name',
        title: 'ชื่อ-สกุล / ตำแหน่งวิชาการ',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.affiliation}</p>
          </div>
        ),
      },
      { key: 'psfLevel', title: 'Thailand PSF', width: '140px' },
      { key: 'workload', title: 'ภาระงานเฉลี่ย', width: '130px' },
      {
        key: 'status',
        title: 'สถานะ',
        width: '130px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        empId: 'FAC-1002',
        name: 'รศ.ดร.พระมหาสุทธิพงษ์ สุทฺธิวํโส',
        affiliation: 'ภาควิชาพระพุทธศาสนา คณะพุทธศาสตร์',
        psfLevel: 'PSF ระดับ 3 (Master)',
        workload: '38 ชม./สัปดาห์',
        status: 'active',
      },
      {
        id: '2',
        empId: 'FAC-1008',
        name: 'ผศ.ดร.วิโรจน์ เจริญสุข',
        affiliation: 'คณะครุศาสตร์ มจร',
        psfLevel: 'PSF ระดับ 2 (Proficient)',
        workload: '35 ชม./สัปดาห์',
        status: 'active',
      },
    ],
  },

  regulatory: {
    title: 'การกำกับมาตรฐานวิชาการ (Regulatory)',
    subtitle: 'ระบบติดตามกฎกระทรวง เกณฑ์มาตรฐานหลักสูตร อว. ประกาศ และข้อบังคับมหาวิทยาลัย',
    category: 'มาตรฐานและกำกับ',
    createButtonLabel: 'เพิ่มข้อกำหนดใหม่',
    filterLabel: 'ระดับการกำกับ',
    filterOptions: [
      { id: 'all', label: 'ทั้งหมด' },
      { id: 'approved', label: 'ปฏิบัติตามครบถ้วน', count: 24 },
      { id: 'warning', label: 'รอปรับปรุงเกณฑ์', count: 3 },
    ],
    columns: [
      { key: 'docNo', title: 'เลขที่ประกาศ', width: '150px' },
      {
        key: 'title',
        title: 'ชื่อประกาศและข้อบังคับ',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.authority}</p>
          </div>
        ),
      },
      { key: 'effectiveDate', title: 'วันที่มีผลบังคับ', width: '130px' },
      {
        key: 'status',
        title: 'สถานะการกำกับ',
        width: '140px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        docNo: 'ประกาศ อว. 2565',
        title: 'เกณฑ์มาตรฐานหลักสูตรระดับอุดมศึกษา พ.ศ. 2565',
        authority: 'กระทรวงการอุดมศึกษาฯ (อว.)',
        effectiveDate: '27 ก.ย. 2565',
        status: 'approved',
      },
      {
        id: '2',
        docNo: 'ข้อบังคับ มจร 2567',
        title: 'ข้อบังคับมหาวิทยาลัยว่าด้วยการจัดการศึกษาธนาคารหน่วยกิต',
        authority: 'สภามหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        effectiveDate: '15 ม.ค. 2567',
        status: 'approved',
      },
    ],
  },

  forms: {
    title: 'แบบฟอร์มออนไลน์กองวิชาการ',
    subtitle: 'ศูนย์รวมแบบคำร้องและแบบประเมินทางวิชาการระบบอิเล็กทรอนิกส์ (E-Forms)',
    category: 'บริการและเอกสาร',
    createButtonLabel: 'สร้างแบบฟอร์มใหม่',
    filterLabel: 'หมวดหมู่ฟอร์ม',
    filterOptions: [
      { id: 'all', label: 'ทุกหมวดหมู่' },
      { id: 'curriculum', label: 'ด้านหลักสูตร', count: 6 },
      { id: 'credit', label: 'ด้าน Credit Bank', count: 4 },
      { id: 'faculty', label: 'ด้านอาจารย์', count: 5 },
    ],
    columns: [
      { key: 'formId', title: 'รหัสแบบฟอร์ม', width: '130px' },
      {
        key: 'formName',
        title: 'ชื่อแบบคำร้องออนไลน์',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.formName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.description}</p>
          </div>
        ),
      },
      { key: 'userGroup', title: 'ผู้มีสิทธิ์ใช้งาน', width: '140px' },
      { key: 'submissions', title: 'ยื่นคำร้องแล้ว', width: '120px' },
      {
        key: 'status',
        title: 'สถานะระบบ',
        width: '130px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        formId: 'FORM-ACAD-01',
        formName: 'แบบขออนุมัติปรับปรุงรายละเอียดของรายวิชา (มคอ.3 / มคอ.4)',
        description: 'สำหรับอาจารย์ผู้รับผิดชอบรายวิชา',
        userGroup: 'อาจารย์ผู้สอน',
        submissions: '128 รายการ',
        status: 'active',
      },
      {
        id: '2',
        formId: 'FORM-ACAD-02',
        formName: 'แบบคำร้องขอเทียบโอนผลการเรียนรู้สะสม (Credit Bank)',
        description: 'สำหรับผู้เรียนในระบบและภายนอก',
        userGroup: 'นิสิต / ผู้เรียน',
        submissions: '42 รายการ',
        status: 'active',
      },
    ],
  },

  documents: {
    title: 'เอกสารกลางวิชาการ',
    subtitle: 'คลังเอกสาร ประกาศ มติ และระเบียบทางวิชาการของมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    category: 'บริการและเอกสาร',
    createButtonLabel: 'อัปโหลดเอกสารใหม่',
    filterLabel: 'ประเภทเอกสาร',
    filterOptions: [
      { id: 'all', label: 'เอกสารทั้งหมด' },
      { id: 'active', label: 'เปิดใช้งาน', count: 18 },
      { id: 'draft', label: 'ฉบับร่าง', count: 3 },
    ],
    columns: [
      { key: 'docNumber', title: 'เลขที่เอกสาร', width: '140px' },
      {
        key: 'docTitle',
        title: 'ชื่อเอกสาร / รายละเอียด',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.docTitle}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.category}</p>
          </div>
        ),
      },
      { key: 'fileSize', title: 'ขนาดไฟล์', width: '110px' },
      { key: 'uploadDate', title: 'วันที่นำเข้า', width: '120px' },
      {
        key: 'status',
        title: 'สถานะ',
        width: '120px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        docNumber: 'มจร 0002/ว 114',
        docTitle: 'คู่มือการพัฒนาหลักสูตรตามเกณฑ์ Outcome-Based Education (OBE)',
        category: 'คู่มือมาตรฐานวิชาการ',
        fileSize: '4.2 MB (PDF)',
        uploadDate: '01 ก.ย. 2569',
        status: 'active',
      },
      {
        id: '2',
        docNumber: 'มจร 0002/ว 118',
        docTitle: 'แบบรายงานผลการดำเนินงานของหลักสูตรประจำปีการศึกษา 2568',
        category: 'แบบรายงานสรุป',
        fileSize: '1.8 MB (DOCX)',
        uploadDate: '05 ก.ย. 2569',
        status: 'active',
      },
    ],
  },

  reports: {
    title: 'รายงานและสารสนเทศวิชาการ',
    subtitle: 'ระบบสรุปรายงานสถิติวิชาการ ข้อมูลสารสนเทศสภาวิชาการ และการจัดส่งข้อมูล อว.',
    category: 'สารสนเทศ',
    createButtonLabel: 'สร้างรายงานสรุปใหม่',
    filterLabel: 'ประเภทรายงาน',
    filterOptions: [
      { id: 'all', label: 'ทั้งหมด' },
      { id: 'approved', label: 'สมบูรณ์แล้ว', count: 14 },
      { id: 'in-progress', label: 'กำลังรวบรวม', count: 2 },
    ],
    columns: [
      { key: 'reportCode', title: 'รหัสรายงาน', width: '130px' },
      {
        key: 'reportName',
        title: 'ชื่อรายงานวิชาการ',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.reportName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.cycle}</p>
          </div>
        ),
      },
      { key: 'author', title: 'ผู้จัดทำ', width: '140px' },
      { key: 'generatedDate', title: 'วันที่สร้าง', width: '120px' },
      {
        key: 'status',
        title: 'สถานะ',
        width: '130px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        reportCode: 'REP-ACAD-69-Q2',
        reportName: 'รายงานสรุปผลการขับเคลื่อนมติสภาวิชาการ ไตรมาสที่ 2/2569',
        cycle: 'นำเสนอสภาวิชาการ',
        author: 'ฝ่ายเลขานุการสภาวิชาการ',
        generatedDate: '15 ก.ค. 2569',
        status: 'approved',
      },
      {
        id: '2',
        reportCode: 'REP-CB-69-01',
        reportName: 'สถิติการสะสมหน่วยกิตในระบบ Credit Bank ประจำปี 2569',
        cycle: 'รายงานประจำปี',
        author: 'กลุ่มงานสารสนเทศวิชาการ',
        generatedDate: '01 ก.ย. 2569',
        status: 'approved',
      },
    ],
  },

  integrations: {
    title: 'การเชื่อมต่อระบบ (Integration)',
    subtitle: 'การเชื่อมโยงข้อมูลกับระบบทะเบียน (REG), ฐานข้อมูล กพอ., ระบบ อว., และระบบสารสนเทศกลาง มจร',
    category: 'ระบบ',
    createButtonLabel: 'ตั้งค่าการเชื่อมต่อใหม่',
    filterLabel: 'สถานะการเชื่อมต่อ',
    filterOptions: [
      { id: 'all', label: 'ทั้งหมด' },
      { id: 'active', label: 'เชื่อมต่อสำเร็จ', count: 5 },
      { id: 'warning', label: 'กำลังตรวจสอบ', count: 1 },
    ],
    columns: [
      { key: 'serviceName', title: 'ชื่อบริการ / API', width: '160px' },
      {
        key: 'description',
        title: 'ระบบเป้าหมายและรูปแบบข้อมูล',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.targetSystem}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.description}</p>
          </div>
        ),
      },
      { key: 'type', title: 'ประเภท', width: '130px' },
      { key: 'lastSync', title: 'อัปเดตล่าสุด', width: '130px' },
      {
        key: 'status',
        title: 'สถานะ',
        width: '130px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        serviceName: 'MCU REG API',
        targetSystem: 'ระบบบริการการศึกษาและงานทะเบียน (MCU REG)',
        description: 'ตรวจสอบผลการเรียนและรหัสนิสิต',
        type: 'REST API',
        lastSync: '10 นาทีที่แล้ว',
        status: 'active',
      },
      {
        id: '2',
        serviceName: 'MHESI Credit API',
        targetSystem: 'ระบบธนาคารหน่วยกิตกลาง อว. (National Credit Bank)',
        description: 'ส่งต่อข้อมูลหน่วยกิตสะสมระดับชาติ',
        type: 'OAuth 2.0 Webhook',
        lastSync: '1 ชั่วโมงที่แล้ว',
        status: 'active',
      },
    ],
  },

  settings: {
    title: 'ตั้งค่าระบบบริหารงานวิชาการ',
    subtitle: 'กำหนดค่าสิทธิ์ผู้ใช้งาน สิทธิ์คณะกรรมการสภาวิชาการ และพารามิเตอร์ระบบ',
    category: 'ระบบ',
    createButtonLabel: 'เพิ่มผู้ใช้งานระบบ',
    filterLabel: 'กลุ่มผู้ใช้',
    filterOptions: [
      { id: 'all', label: 'ทั้งหมด' },
      { id: 'active', label: 'เปิดใช้งาน', count: 8 },
    ],
    columns: [
      { key: 'configItem', title: 'หัวข้อการตั้งค่า', width: '180px' },
      {
        key: 'detail',
        title: 'รายละเอียดและพารามิเตอร์',
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.detail}</p>
          </div>
        ),
      },
      { key: 'updatedBy', title: 'ผู้แก้ไขล่าสุด', width: '150px' },
      {
        key: 'status',
        title: 'สถานะ',
        width: '130px',
        align: 'center',
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    sampleData: [
      {
        id: '1',
        configItem: 'ปีการศึกษาปัจจุบัน',
        title: 'ปีการศึกษา 2569 (ภาคการศึกษาที่ 1)',
        detail: 'กำหนดเป็นค่าเริ่มต้นของทุกโมดูล',
        updatedBy: 'ผู้ดูแลระบบกองวิชาการ',
        status: 'active',
      },
      {
        id: '2',
        configItem: 'สิทธิ์การลงนามมติ',
        title: 'การอนุมัติแบบ Dual-Sign (ผอ.กองวิชาการ + รองอธิการบดี)',
        detail: 'ขั้นตอนการออกมติสภาวิชาการ',
        updatedBy: 'ผอ.กองวิชาการ',
        status: 'active',
      },
    ],
  },
};
