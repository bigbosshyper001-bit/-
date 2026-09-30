import React from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  Key,
  Users,
  Lock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type { UserProfile, AppRoute } from '../../types.ts';
import { Button } from '../ui/Button.tsx';
import { rbacService } from '../../services/rbacService.ts';

export interface UnauthorizedStateProps {
  type?: '401' | '403';
  user?: UserProfile | null;
  requiredPermission?: string;
  targetRoute?: string;
  onNavigate: (route: AppRoute) => void;
  onOpenRoleSwitcher?: () => void;
}

export const UnauthorizedState: React.FC<UnauthorizedStateProps> = ({
  type = '403',
  user,
  requiredPermission,
  targetRoute,
  onNavigate,
  onOpenRoleSwitcher,
}) => {
  const is401 = type === '401';
  const roleDef = user ? rbacService.getRole(user.role) : undefined;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-[#D94F87] to-amber-400" />

        {/* Icon & Code */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FBE7EF] text-[#D94F87] border border-[#F8CBDD] mb-4">
          {is401 ? <Lock className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-2">
          HTTP {is401 ? '401 UNAUTHORIZED' : '403 FORBIDDEN'}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {is401
            ? 'จำเป็นต้องเข้าสู่ระบบก่อนเข้าใช้งาน'
            : 'ไม่ได้รับอนุญาตให้เข้าถึงหน้านี้ (Access Denied)'}
        </h1>

        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          {is401
            ? 'เซสชันการเข้าใช้งานของคุณหมดอายุ หรือยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบด้วยบัญชีผู้ใช้มหาวิทยาลัย'
            : 'บัญชีผู้ใช้ของคุณไม่มีสิทธิ์ในการเข้าดูหรือจัดการข้อมูลในส่วนนี้ ตามนโยบายการควบคุมการเข้าถึงตามบทบาท (RBAC) กองวิชาการ มจร'}
        </p>

        {/* User Context & Missing Permission Box */}
        {user && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200/70 text-left">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>ข้อมูลบัญชีผู้ใช้ปัจจุบัน</span>
            </div>

            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-bold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
                <div className="text-xs text-slate-600 mt-1">{user.position}</div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                    roleDef?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  บทบาท: {user.role}
                </span>
                <span className="text-[11px] text-slate-400">
                  {user.department || 'กองวิชาการ'}
                </span>
              </div>
            </div>

            {requiredPermission && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-rose-800 bg-rose-50/60 p-2 rounded border border-rose-100">
                <Key className="w-3.5 h-3.5 text-[#D94F87] flex-shrink-0" />
                <span>
                  สิทธิ์ที่ต้องการสำหรับหน้านี้:{' '}
                  <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-rose-200 text-[#B83B6F]">
                    {requiredPermission}
                  </code>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            กลับสู่หน้าหลัก (Dashboard)
          </Button>

          {onOpenRoleSwitcher && (
            <Button
              variant="secondary"
              className="w-full sm:w-auto bg-[#FBE7EF] text-[#B83B6F] hover:bg-[#F8CBDD] border-[#F8CBDD]"
              onClick={onOpenRoleSwitcher}
            >
              <Users className="w-4 h-4 mr-1.5" />
              สลับบทบาทเพื่อทดสอบสิทธิ์
            </Button>
          )}

          {is401 && (
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => onNavigate('/login')}
            >
              เข้าสู่ระบบ (Sign In)
            </Button>
          )}
        </div>

        {/* Helper footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ระบบรักษาความปลอดภัยและการจำกัดสิทธิ์ กองวิชาการ มจร (ISO/IEC 27001)</span>
        </div>
      </div>
    </div>
  );
};
