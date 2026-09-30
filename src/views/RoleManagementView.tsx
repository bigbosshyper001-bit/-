import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Plus,
  Copy,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Users,
  Key,
  Lock,
  Search,
  Sliders,
  CheckSquare,
  Square,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import { rbacService, PERMISSION_MODULES, DEFAULT_SYSTEM_ROLES } from '../services/rbacService.ts';
import { centralDatabase } from '../services/centralDatabase.ts';
import type { RoleDefinition, StandardPermissionAction } from '../types/rbac.ts';
import type { UserProfile } from '../types.ts';

export interface RoleManagementViewProps {
  currentUser?: UserProfile;
}

const ACTION_COLUMNS: { action: StandardPermissionAction; labelTh: string; labelEn: string }[] = [
  { action: 'view', labelTh: 'ดูข้อมูล (View)', labelEn: 'View' },
  { action: 'create', labelTh: 'สร้าง (Create)', labelEn: 'Create' },
  { action: 'edit', labelTh: 'แก้ไข (Edit)', labelEn: 'Edit' },
  { action: 'delete', labelTh: 'ลบ (Delete)', labelEn: 'Delete' },
  { action: 'approve', labelTh: 'อนุมัติ (Approve)', labelEn: 'Approve' },
  { action: 'export', labelTh: 'ส่งออก (Export)', labelEn: 'Export' },
];

export const RoleManagementView: React.FC<RoleManagementViewProps> = ({ currentUser }) => {
  const { showToast } = useToast();

  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-executive');
  const [workingPermissions, setWorkingPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetRoleForAction, setTargetRoleForAction] = useState<RoleDefinition | null>(null);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  });
  const [duplicateRoleName, setDuplicateRoleName] = useState('');

  // Permissions check
  const canManageRoles = rbacService.can(currentUser, 'roles.manage') || rbacService.can(currentUser, 'roles.edit');
  const canCreateRole = rbacService.can(currentUser, 'roles.create');
  const canDeleteRole = rbacService.can(currentUser, 'roles.delete');

  // Load roles
  useEffect(() => {
    const unsub = rbacService.subscribeRoles((updatedRoles) => {
      // Calculate user counts for each role from centralDatabase
      const users = centralDatabase.getUserAccounts();
      const rolesWithCounts = updatedRoles.map((r) => ({
        ...r,
        userCount: users.filter((u) => u.role === r.name).length,
      }));
      setRoles(rolesWithCounts);

      // If selected role is not set or removed, default to first
      if (!selectedRoleId && rolesWithCounts.length > 0) {
        setSelectedRoleId(rolesWithCounts[0].id);
        setWorkingPermissions([...rolesWithCounts[0].permissions]);
      }
    });

    return unsub;
  }, []);

  // Update working permissions when selected role changes
  useEffect(() => {
    const current = roles.find((r) => r.id === selectedRoleId);
    if (current) {
      setWorkingPermissions([...current.permissions]);
      setHasChanges(false);
    }
  }, [selectedRoleId, roles]);

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  // Helper to check if working permissions contain code
  const isPermissionEnabled = (code: string) => {
    if (!activeRole) return false;
    if (activeRole.permissions.includes('*') && activeRole.name === 'Super Admin') return true;
    if (workingPermissions.includes('*')) return true;
    if (workingPermissions.includes(code)) return true;

    // Handle aliases
    if (code === 'documents.upload' && (workingPermissions.includes('documents.create') || workingPermissions.includes('documents.upload'))) return true;
    if (code === 'documents.create' && (workingPermissions.includes('documents.upload') || workingPermissions.includes('documents.create'))) return true;
    if (code === 'documents.download' && (workingPermissions.includes('documents.export') || workingPermissions.includes('documents.download'))) return true;
    if (code === 'documents.export' && (workingPermissions.includes('documents.download') || workingPermissions.includes('documents.export'))) return true;

    return false;
  };

  // Toggle single permission cell
  const handleTogglePermission = (code: string) => {
    if (!canManageRoles) {
      showToast('error', 'สิทธิ์ไม่เพียงพอ', 'คุณไม่มีสิทธิ์แก้ไขการกำหนดสิทธิ์ของระบบ');
      return;
    }
    if (activeRole?.name === 'Super Admin') {
      showToast('info', 'Super Admin มีสิทธิ์ครอบคลุมทุกส่วน', 'ไม่จำเป็นต้องปรับแก้สิทธิ์ของ Super Admin');
      return;
    }

    let updated: string[];
    if (workingPermissions.includes(code)) {
      updated = workingPermissions.filter((p) => p !== code);
      // If code was alias, remove matching
      if (code === 'documents.upload') updated = updated.filter((p) => p !== 'documents.create');
      if (code === 'documents.download') updated = updated.filter((p) => p !== 'documents.export');
    } else {
      updated = [...workingPermissions, code];
    }

    setWorkingPermissions(updated);
    setHasChanges(true);
  };

  // Toggle all permissions for an entire module (row)
  const handleToggleRow = (moduleKey: string) => {
    if (!canManageRoles || activeRole?.name === 'Super Admin') return;

    const moduleObj = PERMISSION_MODULES.find((m) => m.key === moduleKey);
    if (!moduleObj) return;

    const allRowCodes = moduleObj.actions.map((a) => a.code);
    const areAllEnabled = allRowCodes.every((code) => isPermissionEnabled(code));

    let updated: string[];
    if (areAllEnabled) {
      // Turn off all in row
      updated = workingPermissions.filter((p) => !allRowCodes.includes(p));
    } else {
      // Turn on all in row
      const toAdd = allRowCodes.filter((code) => !workingPermissions.includes(code));
      updated = [...workingPermissions, ...toAdd];
    }

    setWorkingPermissions(updated);
    setHasChanges(true);
  };

  // Toggle all permissions for an entire action column
  const handleToggleColumn = (action: StandardPermissionAction) => {
    if (!canManageRoles || activeRole?.name === 'Super Admin') return;

    const allColCodes = PERMISSION_MODULES.flatMap((m) =>
      m.actions.filter((a) => a.action === action).map((a) => a.code)
    );

    const areAllEnabled = allColCodes.every((code) => isPermissionEnabled(code));

    let updated: string[];
    if (areAllEnabled) {
      updated = workingPermissions.filter((p) => !allColCodes.includes(p));
    } else {
      const toAdd = allColCodes.filter((code) => !workingPermissions.includes(code));
      updated = [...workingPermissions, ...toAdd];
    }

    setWorkingPermissions(updated);
    setHasChanges(true);
  };

  // Save changes to current role
  const handleSaveChanges = () => {
    if (!activeRole) return;
    try {
      rbacService.updateRole(
        activeRole.id,
        {
          permissions: workingPermissions,
        },
        currentUser
      );
      showToast('success', 'บันทึก Matrix สิทธิ์สำเร็จ', `ปรับปรุงสิทธิ์บทบาท "${activeRole.name}" (${workingPermissions.length} สิทธิ์) เรียบร้อยแล้ว`);
      setHasChanges(false);
    } catch (err: any) {
      showToast('error', 'เกิดข้อผิดพลาด', err.message);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (!activeRole) return;
    setWorkingPermissions([...activeRole.permissions]);
    setHasChanges(false);
    showToast('info', 'ยกเลิกการเปลี่ยนแปลง', 'คืนค่าสิทธิ์ตามที่บันทึกไว้ล่าสุด');
  };

  // Reset to default system permissions
  const handleResetRoleDefaults = () => {
    if (!activeRole) return;
    const defaultRole = DEFAULT_SYSTEM_ROLES.find((r) => r.id === activeRole.id || r.name === activeRole.name);
    if (defaultRole) {
      setWorkingPermissions([...defaultRole.permissions]);
      setHasChanges(true);
      showToast('info', 'คืนค่าเริ่มต้นสำเร็จ', `โหลดสิทธิ์ตั้งต้นของบทบาท ${activeRole.name} แล้ว (กรุณากดบันทึก)`);
    }
  };

  // Create Role Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name.trim()) {
      showToast('error', 'กรุณาระบุชื่อบทบาท');
      return;
    }

    try {
      const newRole = rbacService.createRole(
        {
          name: createFormData.name,
          nameEn: createFormData.nameEn,
          description: createFormData.description,
          badgeClass: createFormData.badgeClass,
          permissions: ['meeting.view', 'documents.view', 'reports.view'], // base safe defaults
        },
        currentUser
      );

      showToast('success', 'สร้างบทบาทใหม่สำเร็จ', `เพิ่มบทบาท "${newRole.name}" เรียบร้อยแล้ว`);
      setIsCreateModalOpen(false);
      setSelectedRoleId(newRole.id);
    } catch (err: any) {
      showToast('error', 'ไม่สามารถสร้างบทบาทได้', err.message);
    }
  };

  // Open Duplicate Modal
  const handleOpenDuplicate = (role: RoleDefinition) => {
    setTargetRoleForAction(role);
    setDuplicateRoleName(`${role.name} (สำเนา)`);
    setIsDuplicateModalOpen(true);
  };

  // Submit Duplicate
  const handleDuplicateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleForAction || !duplicateRoleName.trim()) return;

    try {
      const cloned = rbacService.duplicateRole(targetRoleForAction.id, duplicateRoleName.trim(), currentUser);
      showToast('success', 'คัดลอกบทบาทสำเร็จ', `สร้างบทบาท "${cloned.name}" พร้อมสิทธิ์เหมือนต้นฉบับแล้ว`);
      setIsDuplicateModalOpen(false);
      setSelectedRoleId(cloned.id);
    } catch (err: any) {
      showToast('error', 'เกิดข้อผิดพลาด', err.message);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (role: RoleDefinition) => {
    if (role.isSystem) {
      showToast('error', 'ไม่สามารถลบได้', 'บทบาทมาตรฐานของระบบไม่สามารถลบออกได้');
      return;
    }
    if (role.userCount && role.userCount > 0) {
      showToast('error', 'ไม่สามารถลบได้', `ยังมีผู้ใช้งาน ${role.userCount} บัญชี ผูกกับบทบาทนี้ กรุณาย้ายผู้ใช้ก่อน`);
      return;
    }
    setTargetRoleForAction(role);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!targetRoleForAction) return;
    try {
      rbacService.deleteRole(targetRoleForAction.id, currentUser);
      showToast('success', 'ลบบทบาทสำเร็จ', `ลบบทบาท "${targetRoleForAction.name}" ออกจากระบบแล้ว`);
      setIsDeleteModalOpen(false);
      setSelectedRoleId(roles[0]?.id || 'role-executive');
    } catch (err: any) {
      showToast('error', 'ไม่สามารถลบบทบาทได้', err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#FBE7EF] text-[#D94F87] border border-[#F8CBDD]">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              การจัดการบทบาทและสิทธิ์ (Role & Permission Matrix)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            กำหนดบทบาทหน้าที่ สิทธิ์ระดับโมดูล และสิทธิ์การกระทำ (View, Create, Edit, Delete, Approve, Export)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            disabled={!canCreateRole}
            onClick={() => {
              setCreateFormData({
                name: '',
                nameEn: '',
                description: '',
                badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              });
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างบทบาทใหม่</span>
          </Button>
        </div>
      </div>

      {/* Role Cards Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#D94F87]" />
            <span>เลือกบทบาทเพื่อกำหนดค่า Permission Matrix ({roles.length} บทบาท)</span>
          </div>
          <span className="text-xs text-slate-400">
            * 6 บทบาทเริ่มต้นเป็นมาตรฐานระบบ สามารถเพิ่มบทบาทใหม่ได้ไม่จำกัด
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {roles.map((role) => {
            const isSelected = role.id === selectedRoleId;

            return (
              <div
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#D94F87] ring-2 ring-[#D94F87]/20 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${role.badgeClass}`}
                    >
                      {role.name}
                    </span>
                    {role.isSystem ? (
                      <span className="text-[10px] text-slate-400 font-medium" title="บทบาทมาตรฐานระบบ">
                        System
                      </span>
                    ) : (
                      <span className="text-[10px] text-indigo-600 font-medium" title="บทบาทกำหนดเอง">
                        Custom
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[32px]">
                    {role.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{role.userCount || 0} บัญชี</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Duplicate */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDuplicate(role);
                      }}
                      className="p-1 hover:text-[#D94F87] rounded hover:bg-slate-100"
                      title="คัดลอกบทบาทนี้เพื่อสร้างใหม่"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete (if custom) */}
                    {!role.isSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDelete(role);
                        }}
                        className="p-1 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="ลบบทบาทนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MATRIX CONTROL BAR */}
      {activeRole && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-bold border ${activeRole.badgeClass}`}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              {activeRole.name}
            </span>
            <div className="text-xs text-slate-500">
              {activeRole.name === 'Super Admin' ? (
                <span className="text-emerald-700 font-semibold">
                  มีสิทธิ์สูงสุดในทุกโมดูล (Full Universal Access)
                </span>
              ) : (
                <span>
                  กำหนดแล้ว{' '}
                  <strong className="text-slate-800 font-bold font-mono">
                    {workingPermissions.length}
                  </strong>{' '}
                  สิทธิ์การใช้งาน
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {activeRole.isSystem && activeRole.name !== 'Super Admin' && (
              <button
                onClick={handleResetRoleDefaults}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>คืนค่าเริ่มต้นของบทบาท</span>
              </button>
            )}

            {hasChanges && (
              <button
                onClick={handleDiscardChanges}
                className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5"
              >
                ยกเลิก
              </button>
            )}

            <Button
              variant="primary"
              disabled={!hasChanges || !canManageRoles}
              onClick={handleSaveChanges}
              className="flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลงสิทธิ์</span>
            </Button>
          </div>
        </div>
      )}

      {/* VISUAL PERMISSION MATRIX TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <span>ตารางสิทธิ์การเข้าใช้งาน (Visual Permission Matrix)</span>
            <span className="text-[11px] text-slate-400 font-normal">
              คลิกที่หัวตารางเพื่อเปิด/ปิดทั้งคอลัมน์ หรือคลิกที่ท้ายแถวเพื่อเปิด/ปิดทั้งโมดูล
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                ✓
              </span>
              อนุญาต (Allowed)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                -
              </span>
              ไม่อนุญาต (Denied)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-700">
              <tr>
                <th className="py-3 px-4 w-72">โมดูลงานวิชาการ (Module)</th>
                {ACTION_COLUMNS.map((col) => (
                  <th
                    key={col.action}
                    className="py-3 px-3 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleToggleColumn(col.action)}
                    title={`คลิกเพื่อเปิด/ปิดสิทธิ์ ${col.labelEn} ทั้งหมด`}
                  >
                    <div className="font-bold text-slate-800">{col.labelEn}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{col.labelTh.split(' ')[0]}</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right w-24">แถวทั้งหมด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MODULES.map((mod) => {
                const rowCodes = mod.actions.map((a) => a.code);
                const isRowAllEnabled = rowCodes.every((c) => isPermissionEnabled(c));

                return (
                  <tr key={mod.key} className="hover:bg-slate-50/50 transition-colors">
                    {/* Module Title */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{mod.labelTh}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-normal">
                            {mod.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{mod.descriptionTh}</div>
                      </div>
                    </td>

                    {/* Matrix Action Columns */}
                    {ACTION_COLUMNS.map((col) => {
                      const actionDef = mod.actions.find((a) => a.action === col.action);
                      if (!actionDef) {
                        return (
                          <td key={col.action} className="py-3 px-3 text-center bg-slate-50/30">
                            <span className="text-slate-300 font-mono text-xs">-</span>
                          </td>
                        );
                      }

                      const enabled = isPermissionEnabled(actionDef.code);
                      const isSuper = activeRole?.name === 'Super Admin';

                      return (
                        <td key={col.action} className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={!canManageRoles || isSuper}
                            onClick={() => handleTogglePermission(actionDef.code)}
                            title={`${actionDef.labelTh} (${actionDef.code})`}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                              enabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold hover:bg-emerald-100 shadow-2xs'
                                : 'bg-slate-50 text-slate-300 border border-slate-200 hover:border-slate-300 hover:text-slate-400'
                            } ${isSuper ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {enabled ? (
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <span className="text-xs font-mono">-</span>
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Row Select All Toggle */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={!canManageRoles || activeRole?.name === 'Super Admin'}
                        onClick={() => handleToggleRow(mod.key)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isRowAllEnabled
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {isRowAllEnabled ? 'ปิดทั้งหมด' : 'เปิดทั้งหมด'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ROLE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="สร้างบทบาทใหม่ในระบบ (Create Custom Role)"
        subtitle="เพิ่มบทบาทหน้าที่ใหม่และกำหนดสิทธิ์เข้าถึงตามโครงสร้างของกองวิชาการ"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อบทบาท (ภาษาไทย) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="เช่น หัวหน้าสาขาวิชา, เจ้าหน้าที่วิจัย, ผู้ตรวจข้อสอบ"
              value={createFormData.name}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อภาษาอังกฤษ (English Name)
            </label>
            <Input
              type="text"
              placeholder="เช่น Department Head, Research Officer"
              value={createFormData.nameEn}
              onChange={(e) => setCreateFormData({ ...createFormData, nameEn: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำอธิบายหน้าที่และความรับผิดชอบ
            </label>
            <textarea
              rows={3}
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              placeholder="ระบุขอบเขตความรับผิดชอบของบทบาทนี้..."
              className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#D94F87]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สีป้ายกำกับ (Badge Style)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Indigo', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                { label: 'Rose Pink', class: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]' },
                { label: 'Teal', class: 'bg-teal-50 text-teal-700 border-teal-200' },
                { label: 'Amber', class: 'bg-amber-50 text-amber-800 border-amber-200' },
                { label: 'Emerald', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { label: 'Slate', class: 'bg-slate-100 text-slate-700 border-slate-200' },
              ].map((style) => (
                <button
                  key={style.label}
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, badgeClass: style.class })}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between ${style.class} ${
                    createFormData.badgeClass === style.class ? 'ring-2 ring-slate-800' : ''
                  }`}
                >
                  <span>{style.label}</span>
                  {createFormData.badgeClass === style.class && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              สร้างบทบาท
            </Button>
          </div>
        </form>
      </Modal>

      {/* DUPLICATE ROLE MODAL */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="คัดลอกบทบาท (Duplicate Role)"
        subtitle={`คัดลอกสิทธิ์ทั้งหมดจาก "${targetRoleForAction?.name}" เพื่อสร้างบทบาทใหม่`}
        size="sm"
      >
        <form onSubmit={handleDuplicateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อบทบาทใหม่ <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              value={duplicateRoleName}
              onChange={(e) => setDuplicateRoleName(e.target.value)}
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              จะได้รับสิทธิ์ตั้งต้น {targetRoleForAction?.permissions.length || 0} รายการเหมือนต้นฉบับ
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDuplicateModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              ยืนยันการคัดลอก
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE ROLE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="ยืนยันการลบบทบาท"
        subtitle={`คุณต้องการลบบทบาท "${targetRoleForAction?.name}" หรือไม่?`}
        size="sm"
      >
        <div className="space-y-4 py-2">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">คำเตือน:</span> เมื่อลบบทบาทแล้ว จะไม่สามารถกู้คืนได้ และการดำเนินการจะถูกบันทึกใน Audit Trail
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="primary"
              className="bg-rose-600 hover:bg-rose-700 border-rose-600"
              onClick={handleConfirmDelete}
            >
              ยืนยันการลบ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
