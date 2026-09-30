import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  GraduationCap,
  Building,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Send,
  Download,
  Eye,
  Sliders,
} from 'lucide-react';
import { TOKENS } from '../design-tokens.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Select } from '../components/ui/Select.tsx';
import { DatePicker } from '../components/ui/DatePicker.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { Tabs } from '../components/ui/Tabs.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { Drawer } from '../components/ui/Drawer.tsx';
import { Tooltip } from '../components/ui/Tooltip.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import { DataTable } from '../components/ui/DataTable.tsx';
import { Search } from '../components/ui/Search.tsx';
import { Filter } from '../components/ui/Filter.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { EmptyState, ErrorState } from '../components/ui/EmptyState.tsx';
import { Timeline } from '../components/ui/Timeline.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import { KPICard } from '../components/ui/KPICard.tsx';
import { ChartCard } from '../components/ui/ChartCard.tsx';
import { ActivityFeed } from '../components/ui/ActivityFeed.tsx';
import { FileUpload } from '../components/ui/FileUpload.tsx';

export const DesignSystemView: React.FC = () => {
  const [activeCategoryTab, setActiveCategoryTab] = useState('components');
  const [testInput, setTestInput] = useState('ตัวอย่างข้อความ');
  const [testSelect, setTestSelect] = useState('mcu-buddhist');
  const [testDate, setTestDate] = useState('2026-09-16');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterChoice, setFilterChoice] = useState('all');
  const [searchVal, setSearchVal] = useState('');
  const [demoProgress, setDemoProgress] = useState(68);

  const { showToast } = useToast();

  const sampleTableData = [
    { id: '1', name: 'หลักสูตรพุทธศาสตรบัณฑิต', code: 'CURR-01', level: 'ปริญญาตรี', status: 'approved' },
    { id: '2', name: 'หลักสูตรครุศาสตรมหาบัณฑิต', code: 'CURR-02', level: 'ปริญญาโท', status: 'in-progress' },
    { id: '3', name: 'หลักสูตรประกาศนียบัตรพระไตรปิฎกศึกษา', code: 'SC-03', level: 'Non-degree', status: 'pending' },
  ];

  const sampleTimelineItems = [
    {
      id: 't-1',
      title: 'ยกร่างข้อบังคับธนาคารหน่วยกิต',
      description: 'กองวิชาการรวบรวมเกณฑ์ อว. และประกาศมหาวิทยาลัย',
      timestamp: '10 ส.ค. 2569',
      accent: 'teal' as const,
      status: 'เสร็จสิ้น',
    },
    {
      id: 't-2',
      title: 'ผ่านความเห็นชอบคณะกรรมการวิชาการ',
      description: 'พิจารณาปรับปรุงข้อกำหนดการเทียบโอนผลลัพธ์การเรียนรู้',
      timestamp: '25 ส.ค. 2569',
      accent: 'purple' as const,
      status: 'เสร็จสิ้น',
    },
    {
      id: 't-3',
      title: 'เสนอสภาวิชาการอนุมัติ',
      description: 'บรรจุในวาระการประชุมสภาวิชาการ ครั้งที่ 8/2569',
      timestamp: '10 ก.ย. 2569',
      accent: 'pink' as const,
      status: 'อนุมัติแล้ว',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] rounded-full text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D94F87]" />
          <span>MCU Design System &amp; Component Foundation</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Design Tokens &amp; Reusable Component System
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          ระบบ Token กลางและชุดคอมโพเนนต์มาตรฐาน 24 รายการ ออกแบบตามหลัก 60 / 30 / 10 พร้อมฟอนต์ Noto Sans Thai และ Micro-interactions สำหรับระบบบริหารงานวิชาการ มจร
        </p>
      </div>

      {/* Tabs for Section Navigation */}
      <Tabs
        tabs={[
          { id: 'components', label: '1. Reusable Components (24 รายการ)', count: 24 },
          { id: 'colors', label: '2. Color System (60 / 30 / 10)' },
          { id: 'typography', label: '3. Typography Scale' },
        ]}
        activeTab={activeCategoryTab}
        onChange={setActiveCategoryTab}
        variant="pill"
      />

      {/* SECTION 1: COMPONENT SHOWCASE */}
      {activeCategoryTab === 'components' && (
        <div className="space-y-10">
          {/* Group 1: Buttons & Interactive Feedback */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.1 Button (ปุ่มและสถานะตอบสนอง 150-250ms)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={() => showToast('success', 'Primary Action', 'กดปุ่ม Primary สำเร็จ')}>
                Primary Button
              </Button>
              <Button variant="secondary" onClick={() => showToast('info', 'Secondary Action', 'กดปุ่ม Secondary')}>
                Secondary Button
              </Button>
              <Button variant="outline" onClick={() => showToast('info', 'Outline Action', 'กดปุ่ม Outline')}>
                Outline Button
              </Button>
              <Button variant="ghost" onClick={() => showToast('info', 'Ghost Action', 'กดปุ่ม Ghost')}>
                Ghost Button
              </Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => showToast('error', 'Danger Action', 'ลบรายการ (ตัวอย่าง)')}>
                Danger Button
              </Button>
              <Button variant="primary" isLoading={true}>
                กำลังโหลด...
              </Button>
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Small Button
              </Button>
              <Button variant="secondary" size="lg">
                Large Button
              </Button>
            </div>
          </section>

          {/* Group 2: Form Controls (Input, Select, DatePicker) */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.2 Form Controls (Input, Select, Thai DatePicker)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="ชื่ออาจารย์ / ผู้เสนอวาระ"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                helperText="กรอกชื่อ-นามสกุลพร้อมตำแหน่งวิชาการ"
              />
              <Select
                label="สังกัดส่วนงาน"
                value={testSelect}
                onChange={(e) => setTestSelect(e.target.value)}
                options={[
                  { value: 'mcu-buddhist', label: 'คณะพุทธศาสตร์' },
                  { value: 'mcu-education', label: 'คณะครุศาสตร์' },
                  { value: 'mcu-humanities', label: 'คณะมนุษยศาสตร์' },
                  { value: 'mcu-social', label: 'คณะสังคมศาสตร์' },
                  { value: 'mcu-grad', label: 'บัณฑิตวิทยาลัย' },
                ]}
                helperText="เลือกส่วนงานที่สังกัด"
              />
              <DatePicker
                label="วันที่ประชุม / เสนอวาระ"
                value={testDate}
                onChange={setTestDate}
                helperText="รองรับปฏิทินพุทธศักราช (พ.ศ.)"
              />
            </div>
          </section>

          {/* Group 3: Badges & StatusBadges (Icon + Text + Color) */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.3 Semantic Badges &amp; StatusBadges (Icon + Text + Color ห้ามใช้สีอย่างเดียว)
            </h3>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="approved" />
                <StatusBadge status="completed" />
                <StatusBadge status="pending" />
                <StatusBadge status="in-progress" />
                <StatusBadge status="warning" />
                <StatusBadge status="overdue" />
                <StatusBadge status="critical" />
                <StatusBadge status="curriculum" />
                <StatusBadge status="credit" />
                <StatusBadge status="academic" />
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <Badge accent="pink" icon={<Building className="w-3.5 h-3.5" />}>Academic Affairs</Badge>
                <Badge accent="purple" icon={<BookOpen className="w-3.5 h-3.5" />}>Curriculum</Badge>
                <Badge accent="teal" icon={<GraduationCap className="w-3.5 h-3.5" />}>Credit Bank</Badge>
                <Badge accent="blue" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>Information</Badge>
                <Badge accent="green" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>Approved</Badge>
                <Badge accent="orange" icon={<Clock className="w-3.5 h-3.5" />}>Pending</Badge>
                <Badge accent="red" icon={<AlertCircle className="w-3.5 h-3.5" />}>Critical</Badge>
              </div>
            </div>
          </section>

          {/* Group 4: Modals, Drawers, Toasts, Tooltips */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.4 Overlays: Modal, Drawer, Toast, Tooltip
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                เปิดตัวอย่าง Modal Dialog
              </Button>
              <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
                เปิดตัวอย่าง Slide-over Drawer
              </Button>
              <Tooltip content="Tooltip แสดงข้อมูลรายละเอียดเมื่อ Hover" position="top">
                <Button variant="secondary">ทดสอบ Tooltip (Hover Me)</Button>
              </Tooltip>
              <Button
                variant="primary"
                onClick={() => showToast('success', 'บันทึกข้อมูลสำเร็จ', 'ระบบบันทึกมติที่ประชุมสภาวิชาการ')}
              >
                ยิง Success Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => showToast('warning', 'แจ้งเตือนกำหนดเวลา', 'เหลือเวลาส่งรายงานอีก 3 วัน')}
              >
                ยิง Warning Toast
              </Button>
            </div>

            {/* Modal instance */}
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="ตัวอย่างหน้าต่าง Modal System"
              subtitle="กล่องข้อความยืนยันการทำรายการแบบ Accessibility พร้อม ESC dismiss"
              footer={
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                    ปิดหน้าต่าง
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false);
                      showToast('success', 'ยืนยันสำเร็จ', 'ทำรายการเรียบร้อย');
                    }}
                  >
                    ยืนยัน
                  </Button>
                </>
              }
            >
              <p className="text-xs text-slate-600 leading-relaxed">
                นี่คือ Modal Component มาตรฐานที่รองรับการปิดด้วยปุ่ม ESC หรือการคลิก Backdrop ด้านนอก มีแอนิเมชัน Fade-in / Zoom-in ละมุนตา (150-200ms)
              </p>
            </Modal>

            {/* Drawer instance */}
            <Drawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              title="ตัวอย่าง Slide-over Drawer"
              subtitle="แผงข้อมูลด้านข้างสำหรับการตรวจสอบรายละเอียดหรือ Filter ขั้นสูง"
              footer={
                <Button variant="primary" size="sm" onClick={() => setIsDrawerOpen(false)}>
                  ปิดแถบ
                </Button>
              }
            >
              <div className="space-y-4 text-xs text-slate-600">
                <p>แผงสไลด์จากด้านขวา เหมาะสำหรับการดูข้อมูลเชิงลึก บันทึกช่วยจำ หรือการแจ้งเตือน</p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800">รหัสเอกสาร:</span> MCU-ACAD-2569-DOC
                </div>
              </div>
            </Drawer>
          </section>

          {/* Group 5: Search & Filter bar */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.5 Search &amp; Filter Components
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-80">
                <Search
                  value={searchVal}
                  onChange={setSearchVal}
                  placeholder="ค้นหาในระบบ..."
                  shortcutHint="⌘K"
                />
              </div>
              <div className="w-full flex-1">
                <Filter
                  label="ประเภท"
                  options={[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'bachelor', label: 'ปริญญาตรี', count: 12 },
                    { id: 'master', label: 'ปริญญาโท', count: 8 },
                    { id: 'nondegree', label: 'Non-degree', count: 5 },
                  ]}
                  selectedId={filterChoice}
                  onSelect={setFilterChoice}
                  onReset={() => setFilterChoice('all')}
                />
              </div>
            </div>
          </section>

          {/* Group 6: DataTable & Pagination */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.6 DataTable &amp; Pagination
            </h3>
            <DataTable
              columns={[
                { key: 'code', title: 'รหัส', width: '110px' },
                { key: 'name', title: 'ชื่อหลักสูตร' },
                { key: 'level', title: 'ระดับการศึกษา', width: '130px' },
                {
                  key: 'status',
                  title: 'สถานะ',
                  width: '130px',
                  align: 'center',
                  render: (row) => <StatusBadge status={row.status} />,
                },
              ]}
              data={sampleTableData}
              keyExtractor={(item) => item.id}
              selectable={true}
              pagination={{
                currentPage: 1,
                totalPages: 3,
                totalItems: 25,
                pageSize: 10,
                onPageChange: () => {},
              }}
            />
          </section>

          {/* Group 7: Progress Bar, KPICard, ChartCard */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.7 Progress Bar &amp; KPI Card (Flat hierarchy, No nested card slop)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <ProgressBar value={demoProgress} label="ความก้าวหน้าการขับเคลื่อนมติสภาวิชาการ" accent="green" />
                <ProgressBar value={45} label="งบประมาณจัดทำหลักสูตร" accent="purple" />
                <ProgressBar value={82} label="การสะสมหน่วยกิต Credit Bank" accent="teal" />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDemoProgress((p) => Math.min(p + 10, 100))}
                  >
                    + เพิ่ม Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDemoProgress((p) => Math.max(p - 10, 0))}
                  >
                    - ลด Progress
                  </Button>
                </div>
              </div>

              <KPICard
                title="ตัวชี้วัดความสำเร็จ (KPI ตัวอย่าง)"
                value="88.4"
                unit="%"
                progress={88.4}
                target="ร้อยละ 80"
                accent="blue"
                subtitle="ผ่านเกณฑ์มาตรฐานระดับอุดมศึกษา"
                trend={{ value: '+5.2%', direction: 'up', label: 'ไตรมาส 3' }}
              />
            </div>
          </section>

          {/* Group 8: Timeline & FileUpload */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.8 Timeline &amp; FileUpload (Drag-and-Drop + Manual Click)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-3">Timeline ลำดับขั้นตอน</h4>
                <Timeline items={sampleTimelineItems} />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-3">File Upload Component</h4>
                <FileUpload
                  label="อัปโหลดเอกสารประกอบวาระการประชุม"
                  helperText="รองรับไฟล์ PDF, Word, Excel ขนาดไม่เกิน 25MB"
                  onFilesSelected={(files) =>
                    showToast('success', 'เลือกไฟล์แล้ว', `รับไฟล์ ${files.length} รายการเข้าสู่ระบบ`)
                  }
                />
              </div>
            </div>
          </section>

          {/* Group 9: Skeleton & Empty/Error States */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              1.9 Skeleton, EmptyState &amp; ErrorState
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-slate-100 bg-[#FAFAFC] space-y-2">
                <span className="text-xs font-semibold text-slate-700 block mb-2">Skeleton Loading</span>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="rectangular" height={50} />
              </div>

              <EmptyState
                title="ยังไม่มีข้อมูลในส่วนนี้"
                description="ท่านสามารถกดปุ่มเพื่อสร้างรายการใหม่ได้ทันที"
                actionLabel="สร้างรายการแรก"
                onAction={() => showToast('info', 'สร้างรายการ', 'เปิดแบบฟอร์มบันทึก')}
              />

              <ErrorState
                title="เกิดข้อผิดพลาดในการโหลด"
                message="ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ปลายทางได้"
                onRetry={() => showToast('info', 'ลองใหม่', 'ระบบกำลังเชื่อมต่อใหม่')}
              />
            </div>
          </section>
        </div>
      )}

      {/* SECTION 2: COLOR SYSTEM (60 / 30 / 10) */}
      {activeCategoryTab === 'colors' && (
        <div className="space-y-6">
          {/* 60% White / Off-white */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  60% Dominant Canvas &amp; Surfaces (White / Off White)
                </h3>
                <p className="text-xs text-slate-500">
                  พื้นหลังและพื้นผิวหลัก ต้องเป็น White / Off White เพื่อความสงบ สะอาดตา และความสบายตาในการทำงาน Enterprise
                </p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 rounded text-xs font-bold text-slate-700">60%</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg border border-slate-200 bg-[#FFFFFF] shadow-2xs text-xs">
                <span className="font-semibold block text-slate-900">Pure White</span>
                <span className="text-slate-400 font-mono text-[11px]">#FFFFFF</span>
                <span className="text-[10px] text-slate-500 block mt-1">การ์ด, ตาราง, โมดอล</span>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-[#FAFAFC] shadow-2xs text-xs">
                <span className="font-semibold block text-slate-900">Off White Canvas</span>
                <span className="text-slate-400 font-mono text-[11px]">#FAFAFC</span>
                <span className="text-[10px] text-slate-500 block mt-1">พื้นหลังหลักของระบบ</span>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-[#F8FAFC] shadow-2xs text-xs">
                <span className="font-semibold block text-slate-900">Surface Subtle</span>
                <span className="text-slate-400 font-mono text-[11px]">#F8FAFC</span>
                <span className="text-[10px] text-slate-500 block mt-1">ตาราง Header, แถบย่อย</span>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs text-xs">
                <span className="font-semibold block text-slate-900">Border Neutral</span>
                <span className="text-slate-400 font-mono text-[11px]">#E2E8F0</span>
                <span className="text-[10px] text-slate-500 block mt-1">เส้นขอบเรียบหรู</span>
              </div>
            </div>
          </div>

          {/* 30% Pink / Rose Brand */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  30% Brand Accent (Pink / Rose)
                </h3>
                <p className="text-xs text-slate-500">
                  สีชมพูประจำองค์กร มจร ใช้เป็น Accent ของ Brand, Active State ใน Sidebar, และ Primary Buttons ห้ามใช้สีชมพูทั้งหน้า
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#FBE7EF] text-[#B83B6F] rounded text-xs font-bold border border-[#F8CBDD]">
                30%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-lg bg-[#D94F87] text-white shadow-xs">
                <span className="font-bold block text-sm">Primary Pink</span>
                <span className="font-mono text-[11px] opacity-90">#D94F87</span>
                <span className="text-[11px] opacity-90 block mt-1">ปุ่มหลัก, Active Indicators, Focus ring</span>
              </div>
              <div className="p-4 rounded-lg bg-[#B83B6F] text-white shadow-xs">
                <span className="font-bold block text-sm">Deep Rose</span>
                <span className="font-mono text-[11px] opacity-90">#B83B6F</span>
                <span className="text-[11px] opacity-90 block mt-1">Hover state, Typography accent, Logo placeholder</span>
              </div>
              <div className="p-4 rounded-lg bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD]">
                <span className="font-bold block text-sm">Soft Pink</span>
                <span className="font-mono text-[11px]">#FBE7EF</span>
                <span className="text-[11px] block mt-1">Active Menu background, Soft badge container</span>
              </div>
            </div>
          </div>

          {/* 10% Purpose-driven Semantic Accents */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  10% Purpose-Driven Semantic Accents
                </h3>
                <p className="text-xs text-slate-500">
                  ใช้สีเพื่อสื่อความหมายเฉพาะทางวิชาการ ควบคู่กับ Icon และ Text เสมอ
                </p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 rounded text-xs font-bold text-slate-700">10%</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F3EFFF] text-[#5B419B] border border-[#DACFF6]">
                <span className="font-bold block">Purple</span>
                <span className="font-mono text-[10px]">#7357B8</span>
                <span className="text-[10px] block mt-1 font-medium">Curriculum / หลักสูตร</span>
              </div>
              <div className="p-3 rounded-lg bg-[#E6F6F6] text-[#0E6A6A] border border-[#BFE7E7]">
                <span className="font-bold block">Teal</span>
                <span className="font-mono text-[10px]">#168C8C</span>
                <span className="text-[10px] block mt-1 font-medium">Credit / ธนาคารหน่วยกิต</span>
              </div>
              <div className="p-3 rounded-lg bg-[#EDF4FC] text-[#265799] border border-[#BCD5F4]">
                <span className="font-bold block">Blue</span>
                <span className="font-mono text-[10px]">#3977C8</span>
                <span className="text-[10px] block mt-1 font-medium">Information / สารสนเทศ</span>
              </div>
              <div className="p-3 rounded-lg bg-[#EAF6F0] text-[#27744B] border border-[#C1E6D3]">
                <span className="font-bold block">Green</span>
                <span className="font-mono text-[10px]">#3A9D68</span>
                <span className="text-[10px] block mt-1 font-medium">Approved / เสร็จสิ้น</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FEF5EA] text-[#A36817] border border-[#F9DCB4]">
                <span className="font-bold block">Orange</span>
                <span className="font-mono text-[10px]">#E59A35</span>
                <span className="text-[10px] block mt-1 font-medium">Pending / รอดำเนินการ</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FDEDED] text-[#A32828] border border-[#F6BEBE]">
                <span className="font-bold block">Red</span>
                <span className="font-mono text-[10px]">#D64545</span>
                <span className="text-[10px] block mt-1 font-medium">Critical / เร่งด่วน</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TYPOGRAPHY HIERARCHY */}
      {activeCategoryTab === 'typography' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Noto Sans Thai Typography Hierarchy</h3>
            <p className="text-xs text-slate-500">
              ลำดับขั้นตัวอักษร มี hierarchy ชัดเจน ไม่ใช้ตัวหนา (Bold) พร่ำเพรื่อ
            </p>
          </div>

          <div className="space-y-6 divide-y divide-slate-100">
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 font-mono">H1 Display / 24-32px / Bold</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                ระบบบริหารจัดการกองวิชาการ มจร
              </h1>
            </div>

            <div className="pt-4">
              <span className="text-[11px] text-slate-400 font-mono">H2 Section Title / 18-20px / Bold</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1">
                การประชุมและมติสภาวิชาการ ครั้งที่ 8/2569
              </h2>
            </div>

            <div className="pt-4">
              <span className="text-[11px] text-slate-400 font-mono">H3 Card Header / 14-16px / SemiBold</span>
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 mt-1">
                การเทียบโอนหน่วยกิตและประสบการณ์สะสม (Credit Bank)
              </h3>
            </div>

            <div className="pt-4">
              <span className="text-[11px] text-slate-400 font-mono">Body / 14px / Regular (Line Height 1.6)</span>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
                มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ส่งเสริมการเรียนรู้ตลอดชีวิตและการพัฒนาวิชาการพระพุทธศาสนาตามเกณฑ์มาตรฐานระดับอุดมศึกษา
              </p>
            </div>

            <div className="pt-4">
              <span className="text-[11px] text-slate-400 font-mono">Caption &amp; Label / 11-12px / Medium</span>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs font-medium text-slate-500">
                  รหัสเอกสาร: MCU-ACAD-2569-DOC
                </span>
                <span className="text-[11px] text-slate-400">
                  อัปเดตล่าสุด 16 กันยายน 2569
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
