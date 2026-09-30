import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { McuLogo } from '../components/common/McuLogo.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import type { UserProfile } from '../types.ts';

export interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('academic.director@mcu.ac.th');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { showToast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      showToast('success', 'เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับสู่ระบบบริหารจัดการกองวิชาการ มจร');
      onLoginSuccess({
        id: 'usr-1',
        name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
        role: 'ผู้อำนวยการกองวิชาการ',
        position: 'ผู้อำนวยการกองวิชาการ สำนักงานอธิการบดี',
        department: 'กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
        email: email || 'academic.director@mcu.ac.th',
        initials: 'ผอ',
      });
    }, 450);
  };

  const handleQuickFill = (role: 'director' | 'officer') => {
    if (role === 'director') {
      setEmail('academic.director@mcu.ac.th');
      setPassword('director1234');
      showToast('info', 'เลือกบัญชีทดสอบ', 'ผู้อำนวยการกองวิชาการ');
    } else {
      setEmail('academic.officer@mcu.ac.th');
      setPassword('officer1234');
      showToast('info', 'เลือกบัญชีทดสอบ', 'เจ้าหน้าที่บริหารงานวิชาการ');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAFAFC] text-slate-800">
      {/* LEFT COLUMN: Brand & University Identity */}
      <div className="lg:w-1/2 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/90 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative">
        {/* Top brand header */}
        <div className="relative z-10">
          <McuLogo size="lg" />
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D94F87]" />
            <span>Internal Enterprise Academic Platform</span>
          </div>
        </div>

        {/* Middle institutional narrative */}
        <div className="my-10 lg:my-0 relative z-10 max-w-lg">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            ระบบบริหารจัดการ<span className="text-[#D94F87]">กองวิชาการ</span>
          </h1>
          <p className="text-base text-slate-600 mt-2 font-medium">
            Academic Affairs Management Platform
          </p>
          <p className="text-sm text-slate-500 mt-4 leading-relaxed">
            ศูนย์กลางการกำกับมาตรฐานหลักสูตร ติดตามมติสภาวิชาการ ขับเคลื่อนตัวชี้วัดความสำเร็จ (KPI) และบริหารจัดการระบบธนาคารหน่วยกิต (Credit Bank) มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
          </p>

          {/* Institutional pillars */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-[#FAFAFC]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <BookOpen className="w-4 h-4 text-[#7357B8]" />
                <span>มาตรฐานหลักสูตร &amp; MOU</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                กำกับคุณภาพหลักสูตรและสถาบันสมทบ
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-[#FAFAFC]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Award className="w-4 h-4 text-[#168C8C]" />
                <span>Credit Bank ตลอดชีวิต</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                สะสมและเทียบโอนหน่วยกิตมาตรฐาน อว.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="relative z-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
          <span>มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</span>
          <span className="text-slate-500 font-medium">กองวิชาการ สำนักงานอธิการบดี</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-xl border border-slate-200 shadow-2xs">
          {/* Header */}
          <div className="mb-6 text-left">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">เข้าสู่ระบบบุคลากร</h2>
            <p className="text-xs text-slate-500 mt-1">
              เข้าใช้งานด้วยบัญชีผู้ใช้เครือข่าย มจร (@mcu.ac.th)
            </p>
          </div>

          {/* Quick fill buttons for preview convenience */}
          <div className="mb-6 p-3 bg-[#FAFAFC] rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
              <span>เลือกบัญชีตัวอย่างเพื่อทดสอบ:</span>
              <span className="text-[#D94F87] text-[10px]">Demo Profiles</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('director')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-[#FBE7EF] hover:text-[#B83B6F] hover:border-[#F8CBDD] text-[11px] font-medium text-slate-700 transition-colors text-left truncate"
              >
                1. ผู้อำนวยการ
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('officer')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-[#FBE7EF] hover:text-[#B83B6F] hover:border-[#F8CBDD] text-[11px] font-medium text-slate-700 transition-colors text-left truncate"
              >
                2. เจ้าหน้าที่
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="ชื่อผู้ใช้งาน / อีเมลมหาวิทยาลัย"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mcu.ac.th"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 select-none flex items-center justify-between">
                <span>รหัสผ่าน (Password)</span>
                <button
                  type="button"
                  onClick={() =>
                    showToast('info', 'กู้คืนรหัสผ่าน', 'ติดต่อศูนย์เทคโนโลยีสารสนเทศ หรือเจ้าหน้าที่กองวิชาการ')
                  }
                  className="text-xs text-[#D94F87] hover:text-[#B83B6F] hover:underline font-normal"
                >
                  ลืมรหัสผ่าน?
                </button>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full text-sm bg-white text-slate-900 rounded-lg border border-slate-200 hover:border-slate-300 focus:border-[#D94F87] focus:ring-2 focus:ring-[#FBE7EF] outline-none pl-9 pr-10 py-2 h-9.5 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#D94F87] focus:ring-[#D94F87] accent-[#D94F87]"
                />
                <span className="text-xs text-slate-600">จดจำการเข้าสู่ระบบ</span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </form>

          {/* System note */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            <span>กองวิชาการ สำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</span>
          </div>
        </div>
      </div>
    </div>
  );
};
