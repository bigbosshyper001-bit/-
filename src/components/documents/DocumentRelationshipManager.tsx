import React, { useState } from 'react';
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Calendar,
  Award,
  BookOpen,
  Briefcase,
  AlertCircle,
  FileCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Select } from '../ui/Select.tsx';
import { Input } from '../ui/Input.tsx';
import type { CentralManagedDocument, DocumentRelationLink } from '../../types/documentManagement.ts';

interface DocumentRelationshipManagerProps {
  document: CentralManagedDocument;
  onAddRelation: (relation: Omit<DocumentRelationLink, 'id' | 'linkedAt' | 'linkedByName'>) => void;
  onRemoveRelation: (relationId: string) => void;
  onNavigateToModule?: (targetPath: string) => void;
  canEdit?: boolean;
}

// Preset selectable target records across academic modules
const SAMPLE_LINKABLE_TARGETS: Array<{
  module: DocumentRelationLink['targetModule'];
  moduleLabelTh: string;
  recordId: string;
  recordCode: string;
  title: string;
  path: string;
}> = [
  {
    module: 'meeting',
    moduleLabelTh: 'การประชุมสภาวิชาการ',
    recordId: 'MEET-2569-08',
    recordCode: 'สว 8/2569',
    title: 'การประชุมสภาวิชาการ ครั้งที่ 8/2569',
    path: '/meetings',
  },
  {
    module: 'meeting',
    moduleLabelTh: 'การประชุมสภาวิชาการ',
    recordId: 'MEET-2569-09',
    recordCode: 'สว 9/2569',
    title: 'การประชุมสภาวิชาการ ครั้งที่ 9/2569 (วาระพิเศษ)',
    path: '/meetings',
  },
  {
    module: 'resolution',
    moduleLabelTh: 'มติสภาวิชาการ',
    recordId: 'RES-2569-08-01',
    recordCode: 'มติ 8.1/2569',
    title: 'ให้ความเห็นชอบร่างหลักสูตรพุทธศาสตรบัณฑิต (ปรับปรุง 2570)',
    path: '/meetings',
  },
  {
    module: 'resolution',
    moduleLabelTh: 'มติสภาวิชาการ',
    recordId: 'RES-2569-08-02',
    recordCode: 'มติ 8.2/2569',
    title: 'อนุมัติการลงนามข้อตกลงความร่วมมือทางวิชาการ (MOU) ร่วมกับต่างประเทศ',
    path: '/meetings',
  },
  {
    module: 'action_item',
    moduleLabelTh: 'งานมอบหมายตามมติ',
    recordId: 'TASK-2569-08-01',
    recordCode: 'ACT-08-1',
    title: 'จัดทำคำแปลบันทึกข้อตกลงและส่งมอบสำนักนายกรัฐมนตรี/กต.',
    path: '/meetings',
  },
  {
    module: 'mou',
    moduleLabelTh: 'MOU / ความร่วมมือ',
    recordId: 'MOU-2569-001',
    recordCode: 'MOU-OXFORD-2569',
    title: 'ข้อตกลงความร่วมมือทางวิชาการ มจร - University of Oxford',
    path: '/collaboration',
  },
  {
    module: 'joint_degree',
    moduleLabelTh: 'หลักสูตรร่วม (Joint Degree)',
    recordId: 'PROG-JOINT-01',
    recordCode: 'Joint-PhD-01',
    title: 'หลักสูตรพุทธศาสตรดุษฎีบัณฑิตสาขาพระไตรปิฎกศึกษาร่วม (Joint Degree)',
    path: '/collaboration',
  },
  {
    module: 'dual_degree',
    moduleLabelTh: 'สองปริญญา (Dual Degree)',
    recordId: 'PROG-DUAL-02',
    recordCode: 'Dual-MA-02',
    title: 'หลักสูตรพุทธศาสตรมหาบัณฑิตและศึกษาศาสตรมหาบัณฑิต (Dual Degree)',
    path: '/collaboration',
  },
  {
    module: 'crosswalk',
    moduleLabelTh: 'ตารางเทียบโอน (Crosswalk)',
    recordId: 'CW-2569-01',
    recordCode: 'CW-MASTER-01',
    title: 'ตารางเทียบโอนรายวิชาหมวดบาลีสันสกฤต Oxford-MCU (Crosswalk)',
    path: '/collaboration',
  },
  {
    module: 'kpi',
    moduleLabelTh: 'ตัวชี้วัดผลสัมฤทธิ์ (KPI)',
    recordId: 'KPI-69-001',
    recordCode: 'KPI-1',
    title: 'ร้อยละของหลักสูตรที่ผ่านการรับรองมาตรฐาน AUN-QA',
    path: '/strategy',
  },
  {
    module: 'budget',
    moduleLabelTh: 'งบประมาณวิชาการ',
    recordId: 'BUD-2569-01',
    recordCode: 'BUD-69-01',
    title: 'งบประมาณโครงการพัฒนาความเป็นเลิศทางวิชาการและวิจัยพระพุทธศาสนา',
    path: '/strategy',
  },
  {
    module: 'credit_bank',
    moduleLabelTh: 'ระบบธนาคารหน่วยกิต',
    recordId: 'CB-2569-001',
    recordCode: 'CB-SYS',
    title: 'ระบบสะสมหน่วยกิตและเทียบโอนผลลัพธ์การเรียนรู้ มจร',
    path: '/credit-bank',
  },
];

export const DocumentRelationshipManager: React.FC<DocumentRelationshipManagerProps> = ({
  document,
  onAddRelation,
  onRemoveRelation,
  onNavigateToModule,
  canEdit = true,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState(SAMPLE_LINKABLE_TARGETS[0].recordId);
  const [relationshipType, setRelationshipType] = useState<DocumentRelationLink['relationshipType']>('reference');

  const handleSaveRelation = () => {
    const target = SAMPLE_LINKABLE_TARGETS.find((t) => t.recordId === selectedTargetId);
    if (!target) return;

    onAddRelation({
      targetModule: target.module,
      targetRecordId: target.recordId,
      targetRecordCode: target.recordCode,
      targetRecordTitle: target.title,
      targetPath: target.path,
      relationshipType,
    });

    setIsAdding(false);
  };

  const getModuleBadge = (moduleKey: DocumentRelationLink['targetModule']) => {
    switch (moduleKey) {
      case 'meeting':
      case 'resolution':
      case 'action_item':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'mou':
      case 'joint_degree':
      case 'dual_degree':
      case 'crosswalk':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'kpi':
      case 'budget':
      case 'risk':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'credit_bank':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-[#B83B6F]" />
            การเชื่อมโยงข้อมูลหลายระบบ (Cross-Module Relationships)
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            เชื่อมเอกสารเข้ากับบันทึก วาระการประชุม มติ MOU และหลักสูตร โดยไม่ต้องคัดลอกไฟล์ซ้ำ (Single Source of Truth)
          </p>
        </div>

        {canEdit && !isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#B83B6F]" />
            เพิ่มการเชื่อมโยง
          </Button>
        )}
      </div>

      {/* Adding Form */}
      {isAdding && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <p className="font-semibold text-xs text-slate-800">
            เลือกรายการหรือโมดูลที่ต้องการเชื่อมโยงกับเอกสารนี้:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                รายการเป้าหมายในระบบ:
              </label>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
              >
                {SAMPLE_LINKABLE_TARGETS.map((t) => (
                  <option key={t.recordId} value={t.recordId}>
                    [{t.moduleLabelTh}] {t.recordCode} - {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                ประเภทความสัมพันธ์:
              </label>
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="primary">เอกสารหลัก (Primary Source)</option>
                <option value="approved_basis">ฐานข้อมูลมติ/การอนุมัติ (Approved Basis)</option>
                <option value="attachment">เอกสารแนบประกอบ (Attachment)</option>
                <option value="reference">เอกสารอ้างอิง (Reference Link)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveRelation}>
              บันทึกการเชื่อมโยง
            </Button>
          </div>
        </div>
      )}

      {/* Relations List */}
      {document.relations.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50">
          <Link2 className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-600">ยังไม่มีการเชื่อมโยงกับโมดูลอื่น</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ท่านสามารถกดปุ่ม "เพิ่มการเชื่อมโยง" เพื่อผูกเอกสารนี้กับมติสภาวิชาการ MOU หรือตัวชี้วัดได้ทันที
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {document.relations.map((rel) => (
            <div
              key={rel.id}
              className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-[#B83B6F]/40 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 mt-0.5 ${getModuleBadge(
                    rel.targetModule
                  )}`}
                >
                  {rel.targetModule.toUpperCase()}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {rel.targetRecordCode && (
                      <span className="font-mono font-bold text-xs text-slate-700">
                        {rel.targetRecordCode}
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                      {rel.relationshipType === 'primary' && 'เอกสารหลัก'}
                      {rel.relationshipType === 'approved_basis' && 'ฐานการอนุมัติ'}
                      {rel.relationshipType === 'attachment' && 'เอกสารแนบ'}
                      {rel.relationshipType === 'reference' && 'อ้างอิง'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                    {rel.targetRecordTitle}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    เชื่อมโยงเมื่อ {rel.linkedAt} โดย {rel.linkedByName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onNavigateToModule && rel.targetPath && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToModule(rel.targetPath!)}
                    className="gap-1 text-[11px] h-7 px-2"
                    title="ไปที่โมดูลนี้"
                  >
                    เปิดดู <ArrowRight className="w-3 h-3 text-[#B83B6F]" />
                  </Button>
                )}

                {canEdit && (
                  <button
                    onClick={() => onRemoveRelation(rel.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="ลบการเชื่อมโยง"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
