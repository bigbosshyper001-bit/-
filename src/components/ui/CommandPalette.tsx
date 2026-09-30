import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  PlusCircle,
  Calendar,
  Target,
  FileText,
  ShieldAlert,
  GraduationCap,
  FileCheck,
  Upload,
  ArrowRight,
  BookOpen,
  Users,
  Settings,
  Activity,
  Database,
  X,
  CornerDownLeft,
} from 'lucide-react';
import type { AppRoute, CommandPaletteAction } from '../../types.ts';
import { centralDb } from '../../services/centralDatabase.ts';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
  onQuickAction?: (actionId: string, title: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onQuickAction,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define the requested actions & search items
  const actions: CommandPaletteAction[] = [
    {
      id: 'create-meeting',
      title: 'สร้างการประชุมวิชาการ',
      subtitle: 'กำหนดวาระการประชุม บันทึกผู้เข้าร่วม และร่างมติ',
      category: 'การสร้างรายการใหม่',
      shortcut: 'M',
      accent: 'pink',
      iconName: 'calendar',
      onSelect: () => {
        onQuickAction?.('create-meeting', 'สร้างการประชุมวิชาการ');
        onClose();
      },
    },
    {
      id: 'create-kpi',
      title: 'สร้าง KPI ประจำปี',
      subtitle: 'กำหนดตัวชี้วัด ค่าเป้าหมาย และผู้รับผิดชอบหลัก',
      category: 'การสร้างรายการใหม่',
      shortcut: 'K',
      accent: 'blue',
      iconName: 'target',
      onSelect: () => {
        onQuickAction?.('create-kpi', 'สร้าง KPI ประจำปี');
        onClose();
      },
    },
    {
      id: 'create-action-plan',
      title: 'สร้าง Action Plan',
      subtitle: 'แผนปฏิบัติการประจำกองวิชาการ และไตรมาส',
      category: 'การสร้างรายการใหม่',
      accent: 'blue',
      iconName: 'file-text',
      onSelect: () => {
        onQuickAction?.('create-action-plan', 'สร้าง Action Plan');
        onClose();
      },
    },
    {
      id: 'create-risk',
      title: 'สร้าง Risk (บันทึกความเสี่ยงวิชาการ)',
      subtitle: 'ระบุปัจจัยความเสี่ยง ระดับผลกระทบ และมาตรการควบคุม',
      category: 'การสร้างรายการใหม่',
      shortcut: 'R',
      accent: 'red',
      iconName: 'shield-alert',
      onSelect: () => {
        onQuickAction?.('create-risk', 'สร้าง Risk');
        onClose();
      },
    },
    {
      id: 'create-curriculum',
      title: 'สร้างหลักสูตร / ปรับปรุงหลักสูตร',
      subtitle: 'หลักสูตรปกติ, ความร่วมมือ และ Short Course',
      category: 'การสร้างรายการใหม่',
      shortcut: 'C',
      accent: 'purple',
      iconName: 'book-open',
      onSelect: () => {
        onQuickAction?.('create-curriculum', 'สร้างหลักสูตร');
        onClose();
      },
    },
    {
      id: 'create-mou',
      title: 'สร้าง MOU ความร่วมมือทางวิชาการ',
      subtitle: 'บันทึกข้อตกลงความร่วมมือกับสถาบันเครือข่าย',
      category: 'การสร้างรายการใหม่',
      accent: 'purple',
      iconName: 'file-check',
      onSelect: () => {
        onQuickAction?.('create-mou', 'สร้าง MOU ความร่วมมือ');
        onClose();
      },
    },
    {
      id: 'create-form',
      title: 'สร้างแบบฟอร์มออนไลน์',
      subtitle: 'สร้างคำร้องและแบบประเมินทางวิชาการ',
      category: 'การสร้างรายการใหม่',
      accent: 'teal',
      iconName: 'plus-circle',
      onSelect: () => {
        onQuickAction?.('create-form', 'สร้างแบบฟอร์มออนไลน์');
        onClose();
      },
    },
    {
      id: 'upload-document',
      title: 'อัปโหลดเอกสารกลาง',
      subtitle: 'ประกาศ คำสั่ง มหาวิทยาลัย และเกณฑ์มาตรฐานวิชาการ',
      category: 'การสร้างรายการใหม่',
      shortcut: 'U',
      accent: 'pink',
      iconName: 'upload',
      onSelect: () => {
        onQuickAction?.('upload-document', 'อัปโหลดเอกสารกลาง');
        onClose();
      },
    },
    // Navigation items
    {
      id: 'nav-dashboard',
      title: 'Dashboard กองวิชาการ',
      subtitle: 'ภาพรวมมติที่ประชุม ตัวชี้วัด และสถานะงาน',
      category: 'การเข้าถึงด่วน',
      accent: 'pink',
      iconName: 'arrow-right',
      onSelect: () => {
        onNavigate('/dashboard');
        onClose();
      },
    },
    {
      id: 'nav-my-work',
      title: 'งานของฉัน (My Work & Tasks)',
      subtitle: 'ติดตามงานที่ต้องทำวันนี้ ใกล้ครบกำหนด และรอการอนุมัติ',
      category: 'การเข้าถึงด่วน',
      accent: 'pink',
      iconName: 'file-check',
      onSelect: () => {
        onNavigate('/my-work');
        onClose();
      },
    },
    {
      id: 'nav-calendar',
      title: 'ปฏิทินงานวิชาการและกำหนดเวลา (Calendar)',
      subtitle: 'รวบรวมวาระการประชุม เดดไลน์มติ และการหมดอายุเอกสาร',
      category: 'การเข้าถึงด่วน',
      accent: 'pink',
      iconName: 'calendar',
      onSelect: () => {
        onNavigate('/calendar');
        onClose();
      },
    },
    {
      id: 'nav-notification-settings',
      title: 'ตั้งค่าการแจ้งเตือนและการเตือนความจำ',
      subtitle: 'กำหนดช่องทางแจ้งเตือน In-app / Email และ Reminder Rules',
      category: 'การเข้าถึงด่วน',
      accent: 'blue',
      iconName: 'settings',
      onSelect: () => {
        onNavigate('/settings/notifications');
        onClose();
      },
    },
    {
      id: 'nav-meetings',
      title: 'การประชุมและมติสภาวิชาการ',
      subtitle: 'ติดตามสถานะการขับเคลื่อนมติ',
      category: 'การเข้าถึงด่วน',
      accent: 'pink',
      iconName: 'calendar',
      onSelect: () => {
        onNavigate('/meetings');
        onClose();
      },
    },
    {
      id: 'nav-credit-bank',
      title: 'ธนาคารหน่วยกิต (Credit Bank)',
      subtitle: 'การสะสมและเทียบโอนหน่วยกิตตลอดชีวิต',
      category: 'การเข้าถึงด่วน',
      accent: 'teal',
      iconName: 'graduation-cap',
      onSelect: () => {
        onNavigate('/credit-bank');
        onClose();
      },
    },
    {
      id: 'nav-faculty',
      title: 'อาจารย์และสมรรถนะอาจารย์',
      subtitle: 'เกณฑ์ภาระงาน มาตรฐานวิชาการ และตำแหน่งทางวิชาการ',
      category: 'การเข้าถึงด่วน',
      accent: 'blue',
      iconName: 'users',
      onSelect: () => {
        onNavigate('/faculty');
        onClose();
      },
    },
    {
      id: 'nav-system-health',
      title: 'สถานะระบบและรายงานคุณภาพข้อมูล (System Health & Quality)',
      subtitle: 'ตรวจสอบ 9 เสาหลักความเสถียรภาพ ความสมบูรณ์เชิงสัมพันธ์ และ Snapshot สำรองข้อมูล',
      category: 'การเข้าถึงด่วน',
      accent: 'pink',
      iconName: 'activity',
      onSelect: () => {
        onNavigate('/admin/system-health');
        onClose();
      },
    },
    {
      id: 'nav-master-data',
      title: 'ศูนย์ข้อมูลกลางและรหัสมาตรฐาน (Institutional Master Data)',
      subtitle: 'จัดการข้อมูลกลาง 12 หมวดหมู่: บุคลากร, คณะ, วิทยาเขต, หลักสูตร, หน่วยงาน, ตำแหน่ง, ประเภทเอกสาร ฯลฯ',
      category: 'การเข้าถึงด่วน',
      accent: 'blue',
      iconName: 'database',
      onSelect: () => {
        onNavigate('/master-data');
        onClose();
      },
    },
    // Sample system data searches
    {
      id: 'data-meeting-res',
      title: 'มติที่ประชุมสภาวิชาการ ครั้งที่ 8/2569',
      subtitle: 'อนุมัติหลักสูตรพัฒนาพระวิปัสสนาจารย์ (วาระ 4.1)',
      category: 'ข้อมูลระบบ',
      accent: 'green',
      iconName: 'file-check',
      onSelect: () => {
        onNavigate('/meetings');
        onClose();
      },
    },
    {
      id: 'data-curr-buddha',
      title: 'หลักสูตรพุทธศาสตรบัณฑิต (ปรับปรุง 2568)',
      subtitle: 'คณะพุทธศาสตร์ มจร • รับรองมาตรฐานหลักสูตร',
      category: 'ข้อมูลระบบ',
      accent: 'purple',
      iconName: 'book-open',
      onSelect: () => {
        onNavigate('/courses');
        onClose();
      },
    },
    {
      id: 'data-reg-std',
      title: 'เกณฑ์มาตรฐานหลักสูตรระดับอุดมศึกษา พ.ศ. 2565',
      subtitle: 'เอกสารกำกับมาตรฐานทางวิชาการ กกอ. / กระทรวง อว.',
      category: 'ข้อมูลระบบ',
      accent: 'blue',
      iconName: 'file-text',
      onSelect: () => {
        onNavigate('/regulatory');
        onClose();
      },
    },
  ];

  const dbResults: CommandPaletteAction[] = query.trim()
    ? centralDb.globalSearch(query).map((res) => ({
        id: 'db-' + res.id,
        title: res.title,
        subtitle: (res.code ? `[${res.code}] ` : '') + res.subtitle,
        category: res.category as any,
        accent: res.accent as any,
        iconName: res.category.includes('Meeting')
          ? 'calendar'
          : res.category.includes('KPI')
          ? 'target'
          : res.category.includes('Curriculum') || res.category.includes('Course')
          ? 'book-open'
          : res.category.includes('Faculty')
          ? 'users'
          : 'file-text',
        onSelect: () => {
          onNavigate(res.targetPath as AppRoute);
          onClose();
        },
      }))
    : [];

  const filtered = query.trim()
    ? [
        ...dbResults,
        ...actions.filter((act) => {
          const q = query.toLowerCase();
          return (
            act.title.toLowerCase().includes(q) ||
            (act.subtitle && act.subtitle.toLowerCase().includes(q)) ||
            act.category.toLowerCase().includes(q)
          );
        }),
      ]
    : actions;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].onSelect();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  const renderIcon = (name: string) => {
    switch (name) {
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'target':
        return <Target className="w-4 h-4" />;
      case 'file-text':
        return <FileText className="w-4 h-4" />;
      case 'shield-alert':
        return <ShieldAlert className="w-4 h-4" />;
      case 'book-open':
        return <BookOpen className="w-4 h-4" />;
      case 'file-check':
        return <FileCheck className="w-4 h-4" />;
      case 'plus-circle':
        return <PlusCircle className="w-4 h-4" />;
      case 'upload':
        return <Upload className="w-4 h-4" />;
      case 'graduation-cap':
        return <GraduationCap className="w-4 h-4" />;
      case 'users':
        return <Users className="w-4 h-4" />;
      case 'activity':
        return <Activity className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getAccentBadge = (accent?: string) => {
    switch (accent) {
      case 'pink':
        return 'text-[#B83B6F] bg-[#FBE7EF] border-[#F8CBDD]';
      case 'purple':
        return 'text-[#5B419B] bg-[#F3EFFF] border-[#DACFF6]';
      case 'teal':
        return 'text-[#0E6A6A] bg-[#E6F6F6] border-[#BFE7E7]';
      case 'blue':
        return 'text-[#265799] bg-[#EDF4FC] border-[#BCD5F4]';
      case 'green':
        return 'text-[#27744B] bg-[#EAF6F0] border-[#C1E6D3]';
      case 'orange':
        return 'text-[#A36817] bg-[#FEF5EA] border-[#F9DCB4]';
      case 'red':
        return 'text-[#A32828] bg-[#FDEDED] border-[#F6BEBE]';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-[#FAFAFC]">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="ค้นหาการประชุม, KPI, หลักสูตร, อาจารย์, เอกสาร หรือพิมพ์คำสั่ง..."
            aria-label="ค้นหาการประชุม, KPI, หลักสูตร, อาจารย์, เอกสาร หรือพิมพ์คำสั่ง"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 shrink-0">
            ESC ปิด
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              ไม่พบคำสั่งหรือข้อมูลที่ตรงกับ &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-100 ${
                    isSelected ? 'bg-[#FBE7EF]/60 shadow-2xs' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${getAccentBadge(
                        item.accent
                      )}`}
                    >
                      {renderIcon(item.iconName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.shortcut && (
                      <kbd className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#D94F87]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#FAFAFC] border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">↑</kbd>
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">↓</kbd>
              เลื่อนเลือก
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">↵</kbd>
              เข้าสู่รายการ
            </span>
          </div>
          <span className="text-[#B83B6F] font-medium">กองวิชาการ มจร</span>
        </div>
      </div>
    </div>
  );
};
