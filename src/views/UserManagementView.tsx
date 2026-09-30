import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Key,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Building,
  Mail,
  Phone,
  Eye,
  Sliders,
  Check,
  X,
  Copy,
  UserCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { Drawer } from '../components/ui/Drawer.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import { centralDatabase } from '../services/centralDatabase.ts';
import { rbacService, PERMISSION_MODULES } from '../services/rbacService.ts';
import type { SystemUserAccount, RoleDefinition, StandardPermissionAction } from '../types/rbac.ts';
import type { UserProfile } from '../types.ts';

export interface UserManagementViewProps {
  currentUser?: UserProfile;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const { showToast } = useToast();

  const [users, setUsers] = useState<SystemUserAccount[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Drawers and Modals state
  const [selectedUser, setSelectedUser] = useState<SystemUserAccount | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form states for Create / Edit
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    position: '',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    role: 'เจ้าหน้าที่',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  // Custom permissions form state
  const [customGranted, setCustomGranted] = useState<string[]>([]);
  const [customDenied, setCustomDenied] = useState<string[]>([]);

  // Permissions check
  const canCreateUser = rbacService.can(currentUser, 'users.create');
  const canEditUser = rbacService.can(currentUser, 'users.edit');
  const canDeleteUser = rbacService.can(currentUser, 'users.delete');
  const canManageRoles = rbacService.can(currentUser, 'roles.view');

  // Load users and subscribe to roles
  const loadUsers = () => {
    setUsers(centralDatabase.getUserAccounts());
  };

  useEffect(() => {
    loadUsers();
    const unsubRoles = rbacService.subscribeRoles((updatedRoles) => {
      setRoles(updatedRoles);
    });
    const unsubDb = centralDatabase.subscribe(() => {
      loadUsers();
    });
    return () => {
      unsubRoles();
      unsubDb();
    };
  }, []);

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (departmentFilter !== 'ALL' && u.department !== departmentFilter) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.position.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // Unique departments for filter
  const departments = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));

  // Open User Detail
  const handleOpenDetail = (user: SystemUserAccount) => {
    setSelectedUser(user);
    setIsDetailDrawerOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      position: '',
      department: 'กองวิชาการ สำนักงานอธิการบดี',
      role: 'เจ้าหน้าที่',
      status: 'active',
    });
    setIsCreateModalOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email) {
      showToast('error', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'ชื่อ-นามสกุล, ชื่อผู้ใช้ และอีเมลเป็นข้อมูลจำเป็น');
      return;
    }

    try {
      const created = centralDatabase.createUserAccount(formData, currentUser);
      showToast('success', 'สร้างผู้ใช้งานสำเร็จ', `เพิ่มบัญชี ${created.name} (${created.role}) เรียบร้อยแล้ว`);
      setIsCreateModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showToast('error', 'เกิดข้อผิดพลาด', err.message || 'ไม่สามารถสร้างผู้ใช้งานได้');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: SystemUserAccount) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      position: user.position,
      department: user.department,
      role: user.role,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit User
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      centralDatabase.updateUserAccount(
        selectedUser.id,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          role: formData.role,
          status: formData.status,
        },
        currentUser
      );
      showToast('success', 'บันทึกข้อมูลสำเร็จ', `ปรับปรุงข้อมูลของ ${formData.name} เรียบร้อยแล้ว`);
      setIsEditModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showToast('error', 'เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  // Toggle User Status (Activate / Deactivate)
  const handleToggleStatus = (user: SystemUserAccount) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      centralDatabase.setUserStatus(user.id, nextStatus, currentUser);
      showToast(
        nextStatus === 'active' ? 'success' : 'info',
        nextStatus === 'active' ? 'เปิดใช้งานบัญชีแล้ว' : 'ระงับการใช้งานบัญชีแล้ว',
        `บัญชีของ ${user.name} เปลี่ยนสถานะเป็น "${nextStatus === 'active' ? 'กำลังใช้งาน' : 'ระงับการใช้งาน'}"`
      );
      loadUsers();
    } catch (err: any) {
      showToast('error', 'เกิดข้อผิดพลาด', err.message);
    }
  };

  // Open Permissions Modal
  const handleOpenPermissions = (user: SystemUserAccount) => {
    setSelectedUser(user);
    setCustomGranted(user.customPermissions || []);
    setCustomDenied(user.deniedPermissions || []);
    setIsPermissionsModalOpen(true);
  };

  // Toggle Custom Granted
  const handleToggleGrant = (code: string) => {
    if (customGranted.includes(code)) {
      setCustomGranted(customGranted.filter((c) => c !== code));
    } else {
      setCustomGranted([...customGranted, code]);
      // If was previously denied, remove from denial
      setCustomDenied(customDenied.filter((c) => c !== code));
    }
  };

  // Toggle Custom Denied
  const handleToggleDeny = (code: string) => {
    if (customDenied.includes(code)) {
      setCustomDenied(customDenied.filter((c) => c !== code));
    } else {
      setCustomDenied([...customDenied, code]);
      // If was previously granted, remove from grants
      setCustomGranted(customGranted.filter((c) => c !== code));
    }
  };

  // Save Custom Permissions
  const handleSavePermissions = () => {
    if (!selectedUser) return;
    try {
      centralDatabase.updateUserPermissions(selectedUser.id, customGranted, customDenied, currentUser);
      showToast('success', 'บันทึกสิทธิ์เฉพาะบุคคลสำเร็จ', `ปรับปรุงสิทธิ์ของ ${selectedUser.name} เรียบร้อยแล้ว`);
      setIsPermissionsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showToast('error', 'เกิดข้อผิดพลาด', err.message);
    }
  };

  // Handle Reset Password
  const handleResetPassword = (user: SystemUserAccount) => {
    try {
      const res = centralDatabase.resetUserPassword(user.id, currentUser);
      setSelectedUser(user);
      setTempPasswordResult(res.tempPassword);
      setIsResetPasswordModalOpen(true);
      showToast('success', 'รีเซ็ตรหัสผ่านสำเร็จ', `สร้างรหัสผ่านชั่วคราวสำหรับ ${user.name} แล้ว`);
    } catch (err: any) {
      showToast('error', 'เกิดข้อผิดพลาด', err.message);
    }
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!tempPasswordResult) return;
    navigator.clipboard.writeText(tempPasswordResult);
    showToast('info', 'คัดลอกรหัสผ่านแล้ว', tempPasswordResult);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    try {
      centralDatabase.deleteUserAccount(selectedUser.id, currentUser);
      showToast('success', 'ลบผู้ใช้งานสำเร็จ', `ลบบัญชีของ ${selectedUser.name} เรียบร้อยแล้ว`);
      setIsDeleteConfirmOpen(false);
      setIsDetailDrawerOpen(false);
      loadUsers();
    } catch (err: any) {
      showToast('error', 'ไม่สามารถลบผู้ใช้ได้', err.message);
    }
  };

  // Statistics
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const inactiveUsersCount = users.filter((u) => u.status !== 'active').length;
  const customPermissionsCount = users.filter(
    (u) => (u.customPermissions && u.customPermissions.length > 0) || (u.deniedPermissions && u.deniedPermissions.length > 0)
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#FBE7EF] text-[#D94F87] border border-[#F8CBDD]">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              การจัดการผู้ใช้งานระบบ (User Management)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            บริหารจัดการบัญชีผู้ใช้งาน สังกัดหน่วยงาน กำหนดบทบาท สถานะการเข้าใช้งาน และสิทธิ์เฉพาะบุคคล
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            disabled={!canCreateUser}
            onClick={handleOpenCreate}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>สร้างผู้ใช้งานใหม่</span>
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ผู้ใช้งานทั้งหมด</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalUsersCount}</div>
          <div className="text-xs text-slate-500 mt-1">ครอบคลุม 6 บทบาทมาตรฐาน</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">กำลังใช้งาน (Active)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{activeUsersCount}</div>
          <div className="text-xs text-slate-500 mt-1">พร้อมสิทธิ์เข้าถึงระบบ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">ระงับชั่วคราว / ปิด</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{inactiveUsersCount}</div>
          <div className="text-xs text-slate-500 mt-1">ไม่อนุญาตให้ล็อกอิน</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#B83B6F]">สิทธิ์เฉพาะบุคคล (Override)</span>
            <Sliders className="w-4 h-4 text-[#D94F87]" />
          </div>
          <div className="text-2xl font-bold text-[#B83B6F] mt-2">{customPermissionsCount}</div>
          <div className="text-xs text-slate-500 mt-1">ผู้ใช้ที่มีการปรับแต่งสิทธิ์</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, username, อีเมล, ตำแหน่ง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">บทบาท:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="ALL">ทั้งหมด ({users.length})</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">สถานะ:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="active">กำลังใช้งาน (Active)</option>
              <option value="inactive">ปิดใช้งาน (Inactive)</option>
              <option value="suspended">ระงับชั่วคราว (Suspended)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs text-[#D94F87] hover:underline px-2 py-1"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="py-3 px-4">ผู้ใช้งาน (User)</th>
                <th className="py-3 px-4">ตำแหน่งและสังกัด</th>
                <th className="py-3 px-4">บทบาท (Role)</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4">เข้าสู่ระบบล่าสุด</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleDef = roles.find((r) => r.name === user.role) || rbacService.getRole(user.role);
                  const hasCustom = (user.customPermissions && user.customPermissions.length > 0) || (user.deniedPermissions && user.deniedPermissions.length > 0);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Account */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FBE7EF] text-[#B83B6F] flex items-center justify-center font-bold text-xs border border-[#F8CBDD] flex-shrink-0">
                            {user.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span>{user.name}</span>
                              {hasCustom && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200" title="มีสิทธิ์เฉพาะบุคคลเพิ่มเติม">
                                  Custom
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-slate-600">@{user.username}</span>
                              <span>•</span>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Position & Department */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-800">{user.position}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{user.department}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                            roleDef?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role}
                        </span>
                      </td>

                      {/* Status Badge & Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => canEditUser && handleToggleStatus(user)}
                          disabled={!canEditUser}
                          title={canEditUser ? 'คลิกเพื่อเปลี่ยนสถานะบัญชี' : undefined}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 cursor-pointer'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {user.status === 'active' ? 'กำลังใช้งาน' : 'ระงับชั่วคราว'}
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.lastLogin || '-'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Detail */}
                          <button
                            onClick={() => handleOpenDetail(user)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="ดูข้อมูลโดยละเอียดและสิทธิ์"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit User */}
                          {canEditUser && (
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="แก้ไขข้อมูลผู้ใช้"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Custom Permissions */}
                          {canEditUser && (
                            <button
                              onClick={() => handleOpenPermissions(user)}
                              className="p-1.5 rounded-md text-purple-600 hover:bg-purple-50"
                              title="มอบสิทธิ์เฉพาะบุคคล (Grant/Revoke)"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reset Password */}
                          {canEditUser && (
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50"
                              title="รีเซ็ตรหัสผ่านชั่วคราว"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      <Drawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        title={selectedUser?.name || 'รายละเอียดผู้ใช้งาน'}
        subtitle={`@${selectedUser?.username} • ${selectedUser?.role}`}
        width="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Profile Header */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="w-14 h-14 rounded-full bg-[#FBE7EF] text-[#B83B6F] flex items-center justify-center font-bold text-lg border border-[#F8CBDD]">
                {selectedUser.initials}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500">@{selectedUser.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                      roles.find((r) => r.name === selectedUser.role)?.badgeClass ||
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      selectedUser.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {selectedUser.status === 'active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Information List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ข้อมูลการติดต่อและตำแหน่ง
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1">ตำแหน่งงาน</span>
                  <span className="font-semibold text-slate-800">{selectedUser.position}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1">สังกัดหน่วยงาน</span>
                  <span className="font-semibold text-slate-800">{selectedUser.department}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1">อีเมลทางการ</span>
                  <span className="font-semibold text-slate-800">{selectedUser.email}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1">เบอร์โทรศัพท์</span>
                  <span className="font-semibold text-slate-800">{selectedUser.phone || '-'}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1">วันที่สร้างบัญชี</span>
                  <span className="font-semibold text-slate-800">{selectedUser.createdDate}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1">เข้าสู่ระบบล่าสุด</span>
                  <span className="font-semibold text-slate-800">{selectedUser.lastLogin}</span>
                </div>
              </div>
            </div>

            {/* Effective Permissions Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  สิทธิ์การเข้าใช้งานที่มีผลบังคับ (Effective Permissions)
                </h4>
                {canEditUser && (
                  <button
                    onClick={() => {
                      setIsDetailDrawerOpen(false);
                      handleOpenPermissions(selectedUser);
                    }}
                    className="text-xs text-[#D94F87] hover:underline flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>ปรับแต่งสิทธิ์</span>
                  </button>
                )}
              </div>

              {/* Individual overrides banner if any */}
              {((selectedUser.customPermissions && selectedUser.customPermissions.length > 0) ||
                (selectedUser.deniedPermissions && selectedUser.deniedPermissions.length > 0)) && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-purple-900 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>มีการกำหนดสิทธิ์เฉพาะบุคคลสำหรับบัญชีนี้</span>
                  </div>
                  {selectedUser.customPermissions && selectedUser.customPermissions.length > 0 && (
                    <div className="text-purple-700">
                      • ได้รับสิทธิ์เพิ่มพิเศษ (+): {selectedUser.customPermissions.join(', ')}
                    </div>
                  )}
                  {selectedUser.deniedPermissions && selectedUser.deniedPermissions.length > 0 && (
                    <div className="text-rose-700">
                      • ยกเว้นสิทธิ์ (-): {selectedUser.deniedPermissions.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Module-by-module check */}
              <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {PERMISSION_MODULES.slice(0, 8).map((mod) => {
                  const hasView = rbacService.can(selectedUser, `${mod.key}.view`);
                  const hasCreate = rbacService.can(selectedUser, `${mod.key}.create`) || rbacService.can(selectedUser, `${mod.key}.upload`);
                  const hasApprove = rbacService.can(selectedUser, `${mod.key}.approve`);
                  const hasExport = rbacService.can(selectedUser, `${mod.key}.export`) || rbacService.can(selectedUser, `${mod.key}.download`);

                  return (
                    <div key={mod.key} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">{mod.labelTh}</div>
                        <div className="text-[11px] text-slate-400">{mod.labelEn}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            hasView ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          View {hasView ? '✓' : '-'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            hasCreate ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          Create {hasCreate ? '✓' : '-'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            hasApprove ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          Approve {hasApprove ? '✓' : '-'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            hasExport ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          Export {hasExport ? '✓' : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danger Zone: Delete User */}
            {canDeleteUser && selectedUser.role !== 'Super Admin' && (
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบบัญชีผู้ใช้งานนี้</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="สร้างบัญชีผู้ใช้งานใหม่"
        subtitle="กรอกข้อมูลผู้ใช้งาน กำหนดบทบาท และสังกัดหน่วยงานในมหาวิทยาลัย"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="เช่น นายกิตติศักดิ์ ศรีสมบัติ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="เช่น kittisak.s"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมลทางการ (@mcu.ac.th) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="เช่น kittisak.s@mcu.ac.th"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <Input
                type="text"
                placeholder="เช่น 035-248-062"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่งงาน
              </label>
              <Input
                type="text"
                placeholder="เช่น นักวิชาการศึกษาปฏิบัติการ"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สังกัดหน่วยงาน
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="กองวิชาการ สำนักงานอธิการบดี">กองวิชาการ สำนักงานอธิการบดี</option>
                <option value="กลุ่มงานมาตรฐานและพัฒนาหลักสูตร กองวิชาการ">กลุ่มงานมาตรฐานและพัฒนาหลักสูตร กองวิชาการ</option>
                <option value="ศูนย์บริหารจัดการธนาคารหน่วยกิต มจร">ศูนย์บริหารจัดการธนาคารหน่วยกิต มจร</option>
                <option value="สำนักทะเบียนและวัดผล มจร">สำนักทะเบียนและวัดผล มจร</option>
                <option value="ศูนย์พัฒนาอาจารย์และ Thailand PSF">ศูนย์พัฒนาอาจารย์และ Thailand PSF</option>
                <option value="คณะพุทธศาสตร์">คณะพุทธศาสตร์</option>
                <option value="คณะครุศาสตร์">คณะครุศาสตร์</option>
                <option value="คณะมนุษยศาสตร์">คณะมนุษยศาสตร์</option>
                <option value="คณะสังคมศาสตร์">คณะสังคมศาสตร์</option>
                <option value="บัณฑิตวิทยาลัย">บัณฑิตวิทยาลัย</option>
                <option value="สำนักงานสภามหาวิทยาลัย">สำนักงานสภามหาวิทยาลัย</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                บทบาทในระบบ (Role) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#D94F87]"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} {r.isSystem ? '(มาตรฐาน)' : '(กำหนดเอง)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะเริ่มต้น
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="active">เปิดใช้งานทันที (Active)</option>
                <option value="inactive">ปิดใช้งานชั่วคราว (Inactive)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              ระบบจะทำการสุ่มสร้างรหัสผ่านชั่วคราว (Temporary Password) ให้โดยอัตโนมัติ และส่งข้อมูลทางอีเมล
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              ยืนยันการสร้างผู้ใช้งาน
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`แก้ไขข้อมูล: ${selectedUser?.name}`}
        subtitle="ปรับปรุงข้อมูลตำแหน่ง สังกัด บทบาท หรือสถานะการเข้าใช้งาน"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username - ไม่สามารถเปลี่ยนได้)
              </label>
              <Input
                type="text"
                value={formData.username}
                disabled
                className="bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมลทางการ <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <Input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่งงาน
              </label>
              <Input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สังกัดหน่วยงาน
              </label>
              <Input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                บทบาทในระบบ (Role) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#D94F87]"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะบัญชี
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="active">เปิดใช้งาน (Active)</option>
                <option value="inactive">ปิดใช้งาน (Inactive)</option>
                <option value="suspended">ระงับชั่วคราว (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกการแก้ไข
            </Button>
          </div>
        </form>
      </Modal>

      {/* INDIVIDUAL PERMISSIONS MODAL */}
      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        title={`กำหนดสิทธิ์เฉพาะบุคคล: ${selectedUser?.name}`}
        subtitle={`บทบาทหลัก: ${selectedUser?.role} • คุณสามารถให้สิทธิ์เพิ่ม (+) หรือยกเว้นสิทธิ์ (-) เฉพาะผู้ใช้นี้ได้`}
        size="xl"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Sliders className="w-4 h-4 text-[#D94F87] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">หลักการทำงานของสิทธิ์เฉพาะบุคคล:</span>
              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600">
                <li><span className="text-emerald-700 font-bold">[+] เพิ่มสิทธิ์:</span> ผู้ใช้จะได้สิทธิ์นี้แม้บทบาทหลักจะไม่มี</li>
                <li><span className="text-rose-700 font-bold">[-] ยกเว้นสิทธิ์:</span> ผู้ใช้จะถูกระงับสิทธิ์นี้แม้บทบาทหลักจะมี</li>
                <li><span className="text-slate-500 font-bold">[Default]:</span> ใช้สิทธิ์ตามบทบาทหลัก ({selectedUser?.role})</li>
              </ul>
            </div>
          </div>

          {/* Module-by-module permission selectors */}
          <div className="space-y-4">
            {PERMISSION_MODULES.map((mod) => (
              <div key={mod.key} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{mod.labelTh}</h4>
                    <p className="text-[11px] text-slate-500">{mod.descriptionTh}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {mod.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mod.actions.map((act) => {
                    const isGranted = customGranted.includes(act.code);
                    const isDenied = customDenied.includes(act.code);
                    const hasDefault = selectedUser && rbacService.hasPermission(selectedUser.role, mod.key, act.action);

                    return (
                      <div
                        key={act.code}
                        className={`p-2 rounded-lg border text-xs flex flex-col justify-between gap-2 transition-all ${
                          isGranted
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : isDenied
                            ? 'bg-rose-50/70 border-rose-300'
                            : 'bg-slate-50/50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{act.labelTh}</div>
                          <code className="text-[10px] font-mono text-slate-400 block">{act.code}</code>
                          <div className="text-[10px] text-slate-500 mt-1">
                            สิทธิ์จากบทบาท: {hasDefault ? <span className="text-emerald-600 font-semibold">มีสิทธิ์</span> : <span className="text-slate-400">ไม่มี</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => handleToggleGrant(act.code)}
                            className={`flex-1 py-1 px-1.5 rounded text-[10px] font-semibold text-center transition-colors ${
                              isGranted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'
                            }`}
                          >
                            + เพิ่มสิทธิ์
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleDeny(act.code)}
                            className={`flex-1 py-1 px-1.5 rounded text-[10px] font-semibold text-center transition-colors ${
                              isDenied
                                ? 'bg-rose-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50'
                            }`}
                          >
                            - ยกเว้น
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setCustomGranted([]);
              setCustomDenied([]);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            ล้างการปรับแต่งทั้งหมด (Reset to Role)
          </button>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPermissionsModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSavePermissions}
            >
              บันทึกสิทธิ์เฉพาะบุคคล
            </Button>
          </div>
        </div>
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="รีเซ็ตรหัสผ่านชั่วคราวสำเร็จ"
        subtitle={`บัญชี: ${selectedUser?.name} (${selectedUser?.email})`}
        size="md"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">
              รหัสผ่านชั่วคราวสำหรับการเข้าสู่ระบบครั้งแรก (กรุณาคัดลอกและแจ้งผู้ใช้งาน)
            </p>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 flex items-center justify-center gap-3">
              <span className="font-mono text-lg font-bold tracking-wider text-slate-800">
                {tempPasswordResult}
              </span>
              <button
                onClick={handleCopyPassword}
                className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-[#D94F87] transition-colors"
                title="คัดลอกรหัสผ่าน"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-left text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1 text-slate-700 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>การบันทึกความปลอดภัย:</span>
            </div>
            <p>
              ระบบได้บันทึกการรีเซ็ตรหัสผ่านนี้ลงในประวัติ Audit Trail เรียบร้อยแล้ว ผู้ใช้จะต้องเปลี่ยนรหัสผ่านใหม่หลังจากเข้าสู่ระบบครั้งแรก
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setIsResetPasswordModalOpen(false)}
            >
              รับทราบและปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="ยืนยันการลบบัญชีผู้ใช้งาน"
        subtitle={`คุณต้องการลบบัญชีของ ${selectedUser?.name} หรือไม่?`}
        size="sm"
      >
        <div className="space-y-4 py-2">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">คำเตือน:</span> การดำเนินการนี้จะลบบัญชีผู้ใช้ ประวัติการเข้าสู่ระบบ และยกเลิกสิทธิ์ทั้งหมดทันที การกระทำนี้จะถูกบันทึกใน Audit Log
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
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
