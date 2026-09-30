import React, { useState } from 'react';
import {
  Plus,
  Download,
  Filter as FilterIcon,
  FileSpreadsheet,
  FileCheck,
  Calendar,
  Layers,
  Sparkles,
  Search as SearchIcon,
} from 'lucide-react';
import type { AppRoute, TableColumn } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';
import { Search } from '../components/ui/Search.tsx';
import { Filter } from '../components/ui/Filter.tsx';
import { DataTable } from '../components/ui/DataTable.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Select } from '../components/ui/Select.tsx';
import { DatePicker } from '../components/ui/DatePicker.tsx';
import { useToast } from '../components/ui/Toast.tsx';

export interface ModuleConfig {
  title: string;
  subtitle: string;
  category: string;
  createButtonLabel: string;
  filterLabel: string;
  filterOptions: { id: string; label: string; count?: number }[];
  sampleData: Array<Record<string, any>>;
  columns: TableColumn<any>[];
}

export interface ModulePlaceholderViewProps {
  route: AppRoute;
  config: ModuleConfig;
}

export const ModulePlaceholderView: React.FC<ModulePlaceholderViewProps> = ({
  route,
  config,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemDate, setNewItemDate] = useState('2026-09-16');

  const { showToast } = useToast();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'บันทึกสำเร็จ (ข้อมูลจำลอง)', `สร้าง "${newItemTitle || 'รายการใหม่'}" ในระบบเรียบร้อย`);
    setIsCreateModalOpen(false);
    setNewItemTitle('');
  };

  // Filter sample data
  const filteredData = config.sampleData.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesFilter =
      selectedFilter === 'all' ||
      item.status === selectedFilter ||
      item.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B83B6F]">
            <span>{config.category}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {config.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{config.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              showToast('info', 'ส่งออกข้อมูล', 'ระบบสร้างไฟล์ Excel ตัวอย่างสำหรับรายงานนี้')
            }
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            ส่งออกข้อมูล
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            {config.createButtonLabel}
          </Button>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-72">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`ค้นหาใน ${config.title}...`}
              size="sm"
            />
          </div>

          <div className="w-full flex-1 overflow-x-auto">
            <Filter
              label={config.filterLabel}
              options={config.filterOptions}
              selectedId={selectedFilter}
              onSelect={setSelectedFilter}
              onReset={() => setSelectedFilter('all')}
            />
          </div>
        </div>

        {selectedRowKeys.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-[#FBE7EF]/50 rounded-lg border border-[#F8CBDD] text-xs">
            <span className="text-[#B83B6F] font-semibold">
              เลือกอยู่ {selectedRowKeys.length} รายการ
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  showToast('info', 'ดำเนินการกลุ่ม', `ประมวลผล ${selectedRowKeys.length} รายการที่เลือก`)
                }
              >
                ประมวลผลกลุ่ม
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRowKeys([])}
              >
                ยกเลิกการเลือก
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={config.columns}
        data={filteredData}
        keyExtractor={(item, index) => item.id || index}
        selectable={true}
        selectedKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredData.length,
          pageSize: 10,
          onPageChange: () => {},
        }}
      />

      {/* Foundation Note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
        <span>
          <strong>หมายเหตุสถาปัตยกรรม:</strong> โมดูลนี้อยู่ในสถานะ Foundation พร้อมรองรับการขยาย Field, Workflow การอนุมัติ, และการเชื่อมต่อฐานข้อมูลในลำดับถัดไป
        </span>
        <span className="text-[#B83B6F] font-medium shrink-0 ml-4">
          กองวิชาการ มจร
        </span>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={config.createButtonLabel}
        subtitle="บันทึกข้อมูลเข้าสู่ระบบบริหารงานวิชาการ"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateSubmit}>
              บันทึกรายการ
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="ชื่อรายการ / หัวข้อ"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="ระบุชื่อหรือหัวข้อของรายการ"
            required
          />
          <Select
            label="หมวดหมู่ / ส่วนงานที่เกี่ยวข้อง"
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            options={[
              { value: 'buddhist', label: 'คณะพุทธศาสตร์' },
              { value: 'education', label: 'คณะครุศาสตร์' },
              { value: 'humanities', label: 'คณะมนุษยศาสตร์' },
              { value: 'social', label: 'คณะสังคมศาสตร์' },
              { value: 'grad', label: 'บัณฑิตวิทยาลัย' },
              { value: 'central', label: 'กองวิชาการ / ส่วนกลาง' },
            ]}
          />
          <DatePicker
            label="วันที่กำหนด / บันทึกผล"
            value={newItemDate}
            onChange={setNewItemDate}
          />
        </form>
      </Modal>
    </div>
  );
};
