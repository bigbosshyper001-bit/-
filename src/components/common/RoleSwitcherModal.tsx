import React from 'react';
import {
  Shield,
  X,
  CheckCircle2,
  Users,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import type { AppSystemRole } from '../../types/architecture.ts';
import type { UserProfile } from '../../types.ts';
import { ROLE_DEFINITIONS, DEMO_PERSONAS } from '../../services/rbacService.ts';

export interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectRole: (user: UserProfile) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  const rolesList = Object.keys(DEMO_PERSONAS) as AppSystemRole[];

  const getRoleIcon = (role: AppSystemRole) => {
    switch (role) {
      case 'Super Admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'Executive':
        return <Award className="w-5 h-5 text-purple-600" />;
      case 'Central Admin':
        return <Sparkles className="w-5 h-5 text-[#D94F87]" />;
      case 'Faculty Admin':
        return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case 'Staff':
        return <Users className="w-5 h-5 text-slate-600" />;
      case 'Lecturer':
        return <BookOpen className="w-5 h-5 text-teal-600" />;
      case 'Mentor':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'Learner':
        return <GraduationCap className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-[#FAFAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#D94F87]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                สลับบทบาทผู้ใช้งาน (RBAC Role Switcher)
              </h3>
              <p className="text-xs text-slate-500">
                ทดสอบสิทธิ์การเข้าถึง 8 บทบาทระบบ: สิทธิ์การดู, สร้าง, แก้ไข, ลบ, อนุมัติ และส่งออก
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Grid */}
        <div className="p-5 max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/50">
          {rolesList.map((roleKey) => {
            const persona = DEMO_PERSONAS[roleKey];
            const meta = ROLE_DEFINITIONS[roleKey];
            const isCurrent = currentUser.role === roleKey || currentUser.role === meta.titleTh;

            return (
              <div
                key={roleKey}
                onClick={() => {
                  onSelectRole(persona);
                  onClose();
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-white border-[#D94F87] shadow-sm ring-2 ring-[#D94F87]/20'
                    : 'bg-white border-slate-200/80 hover:border-[#D94F87]/50 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        {getRoleIcon(roleKey)}
                      </div>
                      <span className="font-bold text-xs text-slate-900">{meta.titleTh}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBE7EF] text-[#B83B6F]">
                        กำลังใช้งาน
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {meta.descriptionTh}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                    {persona.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {persona.email.split('@')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#FAFAFC] flex items-center justify-between text-xs text-slate-500">
          <span>สิทธิ์จะถูกนำไปบังคับใช้ที่ UI และ Business Logic ทันที</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors text-xs"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
