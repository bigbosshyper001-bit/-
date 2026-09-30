/**
 * Master Data Management View
 * ศูนย์ข้อมูลกลางและรหัสมาตรฐาน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
 * 
 * ครอบคลุม 12 หมวดหมู่ข้อมูลกลางที่ทุกโมดูลใช้ร่วมกัน
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  MapPin,
  GraduationCap,
  Network,
  Award,
  FileText,
  FolderKanban,
  CalendarDays,
  Coins,
  CheckCircle2,
  Handshake,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  RefreshCw,
  Filter,
  Check,
  X,
  Layers,
  ShieldCheck,
  Link2,
  FileSpreadsheet,
  Info,
} from 'lucide-react';

import type { UserProfile } from '../types.ts';
import type {
  MasterDataDomainKey,
  MasterPersonnel,
  MasterFaculty,
  MasterCampus,
  MasterProgram,
  MasterDepartment,
  MasterPosition,
  MasterDocumentType,
  MasterProjectType,
  MasterAcademicYear,
  MasterFiscalYear,
  MasterStatusItem,
  MasterPartner,
  MasterUsageReference,
} from '../types/masterData.ts';

import { masterDataService } from '../services/masterDataService.ts';

interface MasterDataViewProps {
  currentUser: UserProfile;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({ currentUser }) => {
  const [activeDomain, setActiveDomain] = useState<MasterDataDomainKey>('personnel');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Trigger state for re-render when service updates
  const [, setTick] = useState(0);

  // Usage Modal
  const [selectedUsageItem, setSelectedUsageItem] = useState<{
    id: string;
    name: string;
    domain: MasterDataDomainKey;
    references: MasterUsageReference[];
  } | null>(null);

  // Add / Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const unsub = masterDataService.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsub;
  }, []);

  const domainsMeta = masterDataService.getDomainsMeta();
  const currentMeta = domainsMeta.find(d => d.key === activeDomain) || domainsMeta[0];

  // Helper icons
  const getDomainIcon = (key: MasterDataDomainKey) => {
    switch (key) {
      case 'personnel': return <Users className="w-5 h-5" />;
      case 'faculties': return <Building2 className="w-5 h-5" />;
      case 'campuses': return <MapPin className="w-5 h-5" />;
      case 'programs': return <GraduationCap className="w-5 h-5" />;
      case 'departments': return <Network className="w-5 h-5" />;
      case 'positions': return <Award className="w-5 h-5" />;
      case 'document_types': return <FileText className="w-5 h-5" />;
      case 'project_types': return <FolderKanban className="w-5 h-5" />;
      case 'academic_years': return <CalendarDays className="w-5 h-5" />;
      case 'fiscal_years': return <Coins className="w-5 h-5" />;
      case 'statuses': return <CheckCircle2 className="w-5 h-5" />;
      case 'partners': return <Handshake className="w-5 h-5" />;
    }
  };

  // Filtered Items per Domain
  const filteredPersonnel = useMemo(() => {
    const list = masterDataService.getPersonnel();
    return list.filter(item => {
      const matchSearch =
        item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.campusName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredFaculties = useMemo(() => {
    const list = masterDataService.getFaculties();
    return list.filter(item => {
      const matchSearch =
        item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deanName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredCampuses = useMemo(() => {
    const list = masterDataService.getCampuses();
    return list.filter(item => {
      const matchSearch =
        item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredPrograms = useMemo(() => {
    const list = masterDataService.getPrograms();
    return list.filter(item => {
      const matchSearch =
        item.titleTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facultyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchCat = categoryFilter === 'all' || item.level === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const filteredDepartments = useMemo(() => {
    const list = masterDataService.getDepartments();
    return list.filter(item => {
      const matchSearch =
        item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.headName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredPositions = useMemo(() => {
    const list = masterDataService.getPositions();
    return list.filter(item => {
      const matchSearch =
        item.titleTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const filteredDocTypes = useMemo(() => {
    const list = masterDataService.getDocumentTypes();
    return list.filter(item => {
      const matchSearch =
        item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const filteredProjectTypes = useMemo(() => {
    const list = masterDataService.getProjectTypes();
    return list.filter(item => {
      const matchSearch =
        item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.defaultStrategicPillar.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredAcademicYears = useMemo(() => {
    const list = masterDataService.getAcademicYears();
    return list.filter(item => {
      const matchSearch = item.year.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredFiscalYears = useMemo(() => {
    const list = masterDataService.getFiscalYears();
    return list.filter(item => {
      const matchSearch = item.year.includes(searchQuery) || (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredStatuses = useMemo(() => {
    const list = masterDataService.getStatuses();
    return list.filter(item => {
      const matchSearch =
        item.labelTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.domain === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [searchQuery, categoryFilter]);

  const filteredPartners = useMemo(() => {
    const list = masterDataService.getPartners();
    return list.filter(item => {
      const matchSearch =
        item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mouNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  // Handle Usage Modal
  const openUsageModal = (id: string, name: string) => {
    const refs = masterDataService.calculateUsage(activeDomain, id);
    setSelectedUsageItem({
      id,
      name,
      domain: activeDomain,
      references: refs,
    });
  };

  // Handle Export
  const handleExportJSON = () => {
    const jsonStr = masterDataService.exportAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcu_master_data_catalog_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ส่งออกชุดข้อมูลกลางทั้งหมดเป็นไฟล์ JSON สำเร็จ');
  };

  const handleExportCSV = () => {
    const csvStr = masterDataService.exportDomainAsCSV(activeDomain);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcu_master_${activeDomain}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`ส่งออกข้อมูลหมวด ${currentMeta.labelTh} เป็นไฟล์ CSV สำเร็จ`);
  };

  const handleResetDefaults = () => {
    if (window.confirm('คุณต้องการคืนค่าข้อมูลกลางทั้งหมดกลับเป็นค่าเริ่มต้นของมหาวิทยาลัยหรือไม่?')) {
      masterDataService.resetToDefaults();
      showToast('คืนค่าข้อมูลกลางเริ่มต้นสำเร็จ เรียบร้อย');
    }
  };

  // Open Edit / Create Form
  const handleOpenAdd = () => {
    const idPrefix = activeDomain.substring(0, 3).toUpperCase();
    const newId = `${idPrefix}-${Date.now().toString().slice(-4)}`;
    setEditingItem({
      id: newId,
      code: `${newId}`,
      status: 'active',
      isNew: true,
    });
    setEditModalOpen(true);
  };

  const handleOpenEdit = (item: Record<string, unknown>) => {
    setEditingItem({ ...item, isNew: false });
    setEditModalOpen(true);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`ยืนยันการลบรายการ "${name}" จากข้อมูลกลางหรือไม่?`)) {
      switch (activeDomain) {
        case 'personnel': masterDataService.deletePersonnel(id); break;
        case 'faculties': masterDataService.deleteFaculty(id); break;
        case 'campuses': masterDataService.deleteCampus(id); break;
        case 'programs': masterDataService.deleteProgram(id); break;
        case 'departments': masterDataService.deleteDepartment(id); break;
        case 'positions': masterDataService.deletePosition(id); break;
        case 'document_types': masterDataService.deleteDocumentType(id); break;
        case 'project_types': masterDataService.deleteProjectType(id); break;
        case 'partners': masterDataService.deletePartner(id); break;
        default:
          break;
      }
      showToast(`ลบรายการ "${name}" เรียบร้อยแล้ว`);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    switch (activeDomain) {
      case 'personnel':
        masterDataService.savePersonnel(editingItem as unknown as MasterPersonnel);
        break;
      case 'faculties':
        masterDataService.saveFaculty(editingItem as unknown as MasterFaculty);
        break;
      case 'campuses':
        masterDataService.saveCampus(editingItem as unknown as MasterCampus);
        break;
      case 'programs':
        masterDataService.saveProgram(editingItem as unknown as MasterProgram);
        break;
      case 'departments':
        masterDataService.saveDepartment(editingItem as unknown as MasterDepartment);
        break;
      case 'positions':
        masterDataService.savePosition(editingItem as unknown as MasterPosition);
        break;
      case 'document_types':
        masterDataService.saveDocumentType(editingItem as unknown as MasterDocumentType);
        break;
      case 'project_types':
        masterDataService.saveProjectType(editingItem as unknown as MasterProjectType);
        break;
      case 'academic_years':
        masterDataService.saveAcademicYear(editingItem as unknown as MasterAcademicYear);
        break;
      case 'fiscal_years':
        masterDataService.saveFiscalYear(editingItem as unknown as MasterFiscalYear);
        break;
      case 'statuses':
        masterDataService.saveStatus(editingItem as unknown as MasterStatusItem);
        break;
      case 'partners':
        masterDataService.savePartner(editingItem as unknown as MasterPartner);
        break;
    }

    setEditModalOpen(false);
    setEditingItem(null);
    showToast('บันทึกข้อมูลกลางสำเร็จ เรียบร้อยแล้ว');
  };

  // Helper all faculties, departments, campuses for selects
  const allFaculties = masterDataService.getFaculties();
  const allCampuses = masterDataService.getCampuses();
  const allDepartments = masterDataService.getDepartments();
  const allPositions = masterDataService.getPositions();

  return (
    <div className="space-y-6 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>ระบบฐานข้อมูลและมาตรฐานรหัสกลาง (Institutional Master Data System)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              ศูนย์ข้อมูลกลาง (Common Master Data Center)
            </h1>
            <p className="text-amber-100/90 text-sm sm:text-base max-w-3xl leading-relaxed">
              รวมศูนย์ข้อมูลอ้างอิงมาตรฐานที่ทุกโมดูล (สภาวิชาการ, หลักสูตร, ธนาคารหน่วยกิต, ยุทธศาสตร์, พัฒนาคณาจารย์, ระเบียบ และสารบรรณ) ใช้ร่วมกัน เพื่อความเป็นเอกภาพและความถูกต้องตามระเบียบ มจร
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm"
              title="ดาวน์โหลดโครงสร้างข้อมูลกลางทั้งหมดเป็น JSON"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก JSON ทั้งหมด</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-2 px-3 py-2 bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-700/50 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm"
              title="คืนค่าข้อมูลเป็นค่าเริ่มต้นทางการของ มจร"
            >
              <RefreshCw className="w-4 h-4" />
              <span>คืนค่าเริ่มต้น</span>
            </button>
          </div>
        </div>

        {/* Global Statistics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-amber-800/60 text-xs sm:text-sm">
          <div>
            <span className="text-amber-300/80 block text-xs">กลุ่มข้อมูลกลาง</span>
            <span className="text-xl font-bold text-white">12 หมวดหมู่หลัก</span>
          </div>
          <div>
            <span className="text-amber-300/80 block text-xs">วิทยาเขตที่เชื่อมโยง</span>
            <span className="text-xl font-bold text-white">12 วิทยาเขต/วิทยาลัย</span>
          </div>
          <div>
            <span className="text-amber-300/80 block text-xs">โมดูลที่ใช้งานร่วมกัน</span>
            <span className="text-xl font-bold text-white">10+ โมดูล 100% เชื่อมกัน</span>
          </div>
          <div>
            <span className="text-amber-300/80 block text-xs">ความสอดคล้องระดับสถาบัน</span>
            <span className="text-xl font-bold text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" /> สมบูรณ์ (Verified)
            </span>
          </div>
        </div>
      </div>

      {/* 12 Domains Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {domainsMeta.map(meta => {
          const isActive = meta.key === activeDomain;
          return (
            <button
              key={meta.key}
              onClick={() => {
                setActiveDomain(meta.key);
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50/60 shadow-xs'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                  <div className="bg-amber-600 text-white w-12 text-center text-[9px] font-bold py-0.5 transform rotate-45 translate-x-3 -translate-y-1">
                    เลือก
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {getDomainIcon(meta.key)}
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {meta.itemCount}
                </span>
              </div>
              <div>
                <h3 className={`font-semibold text-sm leading-tight ${isActive ? 'text-amber-900' : 'text-slate-800'}`}>
                  {meta.labelTh}
                </h3>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{meta.labelEn}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area for Selected Domain */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Domain Header & Action Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  {getDomainIcon(activeDomain)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    ข้อมูลกลาง: {currentMeta.labelTh} ({currentMeta.labelEn})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {currentMeta.descriptionTh}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition-colors"
                title="ส่งออกหมวดนี้เป็น CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>ส่งออก CSV</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่ม{currentMeta.labelTh}ใหม่</span>
              </button>
            </div>
          </div>

          {/* Search and Secondary Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`ค้นหาใน${currentMeta.labelTh} (ชื่อ, รหัส, คณะ, วิทยาเขต)...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <div className="flex items-center gap-1 text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span>ตัวกรอง:</span>
              </div>

              {/* Status filter if applicable */}
              {activeDomain !== 'statuses' && (
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="active">เปิดใช้งาน (Active)</option>
                  <option value="inactive">ปิดใช้งาน (Inactive)</option>
                  {activeDomain === 'personnel' && <option value="on_leave">ลาศึกษา/ปฏิบัติศาสนกิจ</option>}
                  {activeDomain === 'academic_years' && <option value="closed">ปิดภาคการศึกษาแล้ว</option>}
                  {activeDomain === 'academic_years' && <option value="planned">วางแผนล่วงหน้า</option>}
                </select>
              )}

              {/* Category Filter for Programs, Positions, DocTypes, Statuses */}
              {activeDomain === 'programs' && (
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
                >
                  <option value="all">ทุกระดับการศึกษา</option>
                  <option value="ปริญญาตรี">ปริญญาตรี</option>
                  <option value="ปริญญาโท">ปริญญาโท</option>
                  <option value="ปริญญาเอก">ปริญญาเอก</option>
                  <option value="ประกาศนียบัตร">ประกาศนียบัตร / ธนาคารหน่วยกิต</option>
                </select>
              )}

              {activeDomain === 'positions' && (
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
                >
                  <option value="all">ทุกสายงาน</option>
                  <option value="academic">ตำแหน่งวิชาการ</option>
                  <option value="administrative">ตำแหน่งบริหาร</option>
                  <option value="support">ตำแหน่งสายสนับสนุน</option>
                </select>
              )}

              {activeDomain === 'document_types' && (
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
                >
                  <option value="all">ทุกหมวดหมู่เอกสาร</option>
                  <option value="หนังสือและคำสั่ง">หนังสือและคำสั่ง</option>
                  <option value="การประชุมและมติ">การประชุมและมติ</option>
                  <option value="ระเบียบและข้อบังคับ">ระเบียบและข้อบังคับ</option>
                  <option value="หลักสูตรและวิชาการ">หลักสูตรและวิชาการ</option>
                  <option value="แบบฟอร์มคำขอ">แบบฟอร์มคำขอ</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="overflow-x-auto">
          {/* 1. Personnel Table */}
          {activeDomain === 'personnel' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสบุคลากร</th>
                  <th className="px-5 py-3.5">ชื่อ-นามสกุล / สมณศักดิ์</th>
                  <th className="px-5 py-3.5">ตำแหน่งทางวิชาการ/บริหาร</th>
                  <th className="px-5 py-3.5">คณะ / หน่วยงาน</th>
                  <th className="px-5 py-3.5">วิทยาเขต</th>
                  <th className="px-5 py-3.5">สถานะ</th>
                  <th className="px-5 py-3.5 text-right">การเชื่อมโยง / การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPersonnel.map(person => (
                  <tr key={person.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500 font-medium">
                      {person.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{person.titlePrefix} {person.fullName}</div>
                      {person.monkTitle && (
                        <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {person.monkTitle}
                        </span>
                      )}
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{person.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{person.academicPositionName}</div>
                      {person.adminPositionName && (
                        <div className="text-xs text-indigo-700 font-medium">{person.adminPositionName}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-800 font-medium">{person.facultyName}</div>
                      <div className="text-xs text-slate-500">{person.departmentName}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {person.campusName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        person.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {person.status === 'active' ? 'ปฏิบัติงานปกติ' : 'พักการปฏิบัติหน้าที่'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(person.id, person.fullName)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg transition-colors"
                        title="ดูความเชื่อมโยงกับโมดูลอื่นๆ ในระบบ"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>การเชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(person as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(person.id, person.fullName)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบข้อมูล"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 2. Faculties Table */}
          {activeDomain === 'faculties' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสคณะ</th>
                  <th className="px-5 py-3.5">ชื่อสำนัก / คณะ (ไทย - อังกฤษ)</th>
                  <th className="px-5 py-3.5">คณบดี / ผู้อำนวยการ</th>
                  <th className="px-5 py-3.5">ที่ตั้งสำนักงาน</th>
                  <th className="px-5 py-3.5 text-center">จำนวนภาควิชา</th>
                  <th className="px-5 py-3.5 text-center">หลักสูตรที่เปิดสอน</th>
                  <th className="px-5 py-3.5">สถานะ</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculties.map(fac => (
                  <tr key={fac.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-amber-900">
                      {fac.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{fac.nameTh}</div>
                      <div className="text-xs text-slate-500 font-sans">{fac.nameEn}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">
                      {fac.deanName}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {fac.officeLocation}
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-slate-800">
                      {fac.totalDepartments} ภาควิชา
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {fac.totalActivePrograms} หลักสูตร
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        เปิดดำเนินการ
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(fac.id, fac.nameTh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>การเชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(fac as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 3. Campuses Table */}
          {activeDomain === 'campuses' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสวิทยาเขต</th>
                  <th className="px-5 py-3.5">ชื่อวิทยาเขต / วิทยาลัยสงฆ์</th>
                  <th className="px-5 py-3.5">ภาค / จังหวัด</th>
                  <th className="px-5 py-3.5">รองอธิการบดี / ผู้อำนวยการ</th>
                  <th className="px-5 py-3.5">เบอร์โทรศัพท์ / อีเมล</th>
                  <th className="px-5 py-3.5 text-right">จำนวนนิสิต (ประมาณการ)</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampuses.map(campus => (
                  <tr key={campus.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-600">
                      {campus.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {campus.nameTh}
                        {campus.isMainCampus && (
                          <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">
                            ส่วนกลาง
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{campus.nameEn}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium text-slate-700">{campus.province}</span>
                      <span className="block text-[11px] text-slate-500">{campus.region}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">
                      {campus.rectorOrViceRector}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-600">
                      <div>{campus.phone}</div>
                      <div className="text-slate-400">{campus.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                      {campus.activeStudentsEstimate.toLocaleString()} รูป/คน
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(campus.id, campus.nameTh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>การเชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(campus as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 4. Programs Table */}
          {activeDomain === 'programs' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสหลักสูตร CHECO</th>
                  <th className="px-5 py-3.5">ชื่อหลักสูตร / วุฒิการศึกษา</th>
                  <th className="px-5 py-3.5">ระดับ</th>
                  <th className="px-5 py-3.5">คณะผู้รับผิดชอบ</th>
                  <th className="px-5 py-3.5">วิทยาเขตที่เปิดสอน</th>
                  <th className="px-5 py-3.5 text-center">หน่วยกิตรวม</th>
                  <th className="px-5 py-3.5">สถานะ CHECO</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrograms.map(prg => (
                  <tr key={prg.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">
                      {prg.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{prg.titleTh}</div>
                      <div className="text-xs text-amber-800 font-medium mt-0.5">{prg.degreeAbbrTh}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                        {prg.level}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">
                      {prg.facultyName}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs">
                      {prg.campusesOffered.join(', ')}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                      {prg.totalCredits} นก.
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        prg.checoStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {prg.checoStatus === 'approved' ? 'ผ่าน CHECO แล้ว' : 'อยู่ระหว่างพิจารณา'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(prg.id, prg.titleTh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>เชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(prg as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 5. Departments Table */}
          {activeDomain === 'departments' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสหน่วยงาน</th>
                  <th className="px-5 py-3.5">ชื่อหน่วยงาน</th>
                  <th className="px-5 py-3.5">ประเภท / สังกัด</th>
                  <th className="px-5 py-3.5">หัวหน้าหน่วยงาน</th>
                  <th className="px-5 py-3.5">สถานที่ตั้ง</th>
                  <th className="px-5 py-3.5">สถานะ</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map(dept => (
                  <tr key={dept.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">
                      {dept.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{dept.nameTh}</div>
                      <div className="text-xs text-slate-500">{dept.nameEn}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className="font-medium text-slate-800">{dept.parentOrgType}</span>
                      <div className="text-slate-500">{dept.facultyName || 'ส่วนกลาง'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-800 font-medium">
                      {dept.headName}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {dept.location}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ปกติ
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(dept.id, dept.nameTh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>เชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(dept as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 6. Positions Table */}
          {activeDomain === 'positions' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสตำแหน่ง</th>
                  <th className="px-5 py-3.5">ชื่อตำแหน่ง (ไทย / อังกฤษ)</th>
                  <th className="px-5 py-3.5">กลุ่มตำแหน่ง</th>
                  <th className="px-5 py-3.5 text-center">ระดับ Rank</th>
                  <th className="px-5 py-3.5">คุณสมบัติมาตรฐาน / หลักเกณฑ์</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPositions.map(pos => (
                  <tr key={pos.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">
                      {pos.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{pos.titleTh}</div>
                      <div className="text-xs text-slate-500">{pos.titleEn}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        pos.category === 'academic'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : pos.category === 'administrative'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {pos.categoryLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                      ระดับ {pos.levelRank}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-md">
                      {pos.standardQualification}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(pos.id, pos.titleTh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>เชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(pos as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 7. Document Types Table */}
          {activeDomain === 'document_types' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสเอกสาร</th>
                  <th className="px-5 py-3.5">ชื่อประเภทเอกสาร</th>
                  <th className="px-5 py-3.5">หมวดหมู่</th>
                  <th className="px-5 py-3.5 text-center">อายุการเก็บรักษา</th>
                  <th className="px-5 py-3.5 text-center">ชั้นความลับ</th>
                  <th className="px-5 py-3.5">โมดูลหลักที่ใช้</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocTypes.map(doc => (
                  <tr key={doc.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">
                      {doc.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{doc.nameTh}</div>
                      <div className="text-xs text-slate-500">{doc.nameEn}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${doc.badgeColor}`}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-slate-700">
                      {doc.retentionPeriodYears === 'ถาวร' ? 'จัดเก็บถาวร' : `${doc.retentionPeriodYears} ปี`}
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs text-slate-600">
                      {doc.confidentialityDefault}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-indigo-700 font-semibold">
                      {doc.primaryModule}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(doc.id, doc.nameTh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>เชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(doc as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 8. Project Types Table */}
          {activeDomain === 'project_types' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสโครงการ</th>
                  <th className="px-5 py-3.5">ชื่อประเภทโครงการ</th>
                  <th className="px-5 py-3.5">ยุทธศาสตร์มหาวิทยาลัยที่สอดคล้อง</th>
                  <th className="px-5 py-3.5">แหล่งงบประมาณ</th>
                  <th className="px-5 py-3.5">แนวทางการผูกตัวชี้วัด (KPI Alignment)</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjectTypes.map(prj => (
                  <tr key={prj.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">
                      {prj.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{prj.nameTh}</div>
                      <div className="text-xs text-slate-500">{prj.nameEn}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-medium max-w-xs">
                      {prj.defaultStrategicPillar}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {prj.fundingSource}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-sm">
                      {prj.kpiAlignmentGuide}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(prj.id, prj.nameTh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>เชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(prj as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 9. Academic Years Table */}
          {activeDomain === 'academic_years' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">ปีการศึกษา (ไทย - ค.ศ.)</th>
                  <th className="px-5 py-3.5">ช่วงเวลาการจัดการศึกษา</th>
                  <th className="px-5 py-3.5">ภาคการศึกษาปัจจุบัน</th>
                  <th className="px-5 py-3.5">คำอธิบายและการใช้งาน</th>
                  <th className="px-5 py-3.5 text-center">สถานะปีการศึกษา</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAcademicYears.map(ay => (
                  <tr key={ay.id} className={`hover:bg-amber-50/30 transition-colors ${ay.isCurrent ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                        ปีการศึกษา {ay.year}
                        {ay.isCurrent && (
                          <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                            ปีการศึกษาปัจจุบัน (Current)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">Academic Year {ay.yearEn}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-mono">
                      {ay.startDate} ถึง {ay.endDate}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-800">
                      {ay.currentSemester}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-md">
                      {ay.description}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ay.isCurrent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : ay.status === 'closed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {ay.isCurrent ? 'ปีปัจจุบัน' : ay.status === 'closed' ? 'ปิดภาคเรียนแล้ว' : 'วางแผน'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {!ay.isCurrent && (
                        <button
                          onClick={() => {
                            masterDataService.setCurrentAcademicYear(ay.id);
                            showToast(`ตั้งปีการศึกษา ${ay.year} เป็นปีปัจจุบันเรียบร้อยแล้ว`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-xs"
                        >
                          ตั้งเป็นปีปัจจุบัน
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(ay as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 10. Fiscal Years Table */}
          {activeDomain === 'fiscal_years' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">ปีงบประมาณ</th>
                  <th className="px-5 py-3.5">รอบระยะเวลางบประมาณ</th>
                  <th className="px-5 py-3.5">ไตรมาสปัจจุบัน</th>
                  <th className="px-5 py-3.5 text-right">กรอบงบประมาณรวม</th>
                  <th className="px-5 py-3.5">หมายเหตุและการติดตาม</th>
                  <th className="px-5 py-3.5 text-center">สถานะ</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiscalYears.map(fy => (
                  <tr key={fy.id} className={`hover:bg-amber-50/30 transition-colors ${fy.isCurrent ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                        ปีงบประมาณ พ.ศ. {fy.year}
                        {fy.isCurrent && (
                          <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                            ปีงบประมาณปัจจุบัน
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-mono">
                      {fy.startDate} ถึง {fy.endDate}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-800">
                      {fy.currentQuarter}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      {fy.totalBudgetMillion.toLocaleString()} ล้านบาท
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-sm">
                      {fy.notes || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        fy.isCurrent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : fy.status === 'closed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {fy.isCurrent ? 'ใช้งานปัจจุบัน' : fy.status === 'closed' ? 'ปิดรอบแล้ว' : 'วางแผน'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {!fy.isCurrent && (
                        <button
                          onClick={() => {
                            masterDataService.setCurrentFiscalYear(fy.id);
                            showToast(`ตั้งปีงบประมาณ พ.ศ. ${fy.year} เป็นปีปัจจุบันเรียบร้อยแล้ว`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-xs"
                        >
                          ตั้งเป็นปีปัจจุบัน
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(fy as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 11. Statuses Table */}
          {activeDomain === 'statuses' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">รหัสสถานะ (Code)</th>
                  <th className="px-5 py-3.5">ตัวอย่างป้ายสถานะ (Badge Preview)</th>
                  <th className="px-5 py-3.5">ชื่อสถานะ (ภาษาไทย - อังกฤษ)</th>
                  <th className="px-5 py-3.5">ขอบเขตโมดูล (Domain Scope)</th>
                  <th className="px-5 py-3.5 text-center">ลำดับขั้นตอน</th>
                  <th className="px-5 py-3.5">คำอธิบายความหมาย</th>
                  <th className="px-5 py-3.5 text-center">เป็นสถานะสิ้นสุด</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStatuses.map(sts => (
                  <tr key={sts.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-700">
                      {sts.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${sts.badgeBg} ${sts.badgeText} ${sts.badgeBorder}`}>
                        {sts.labelTh}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{sts.labelTh}</div>
                      <div className="text-xs text-slate-500">{sts.labelEn}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700">
                      {sts.domainLabel}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                      ขั้นที่ {sts.stepOrder}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-sm">
                      {sts.description}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {sts.isTerminal ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> สิ้นสุดกระบวนการ
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">ยังไม่สิ้นสุด</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(sts as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 12. Partners Table */}
          {activeDomain === 'partners' && (
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">เลขที่ MOU</th>
                  <th className="px-5 py-3.5">ชื่อองค์กร / สถาบันคู่ความร่วมมือ</th>
                  <th className="px-5 py-3.5">ประเภท</th>
                  <th className="px-5 py-3.5">ประเทศ / ที่ตั้ง</th>
                  <th className="px-5 py-3.5">ขอบเขตความร่วมมือหลัก</th>
                  <th className="px-5 py-3.5 text-center">หลักสูตรร่วม</th>
                  <th className="px-5 py-3.5">ระยะเวลาความร่วมมือ</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map(ptn => (
                  <tr key={ptn.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">
                      {ptn.mouNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{ptn.nameTh}</div>
                      <div className="text-xs text-slate-500">{ptn.nameEn}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {ptn.typeLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700">
                      <div className="font-medium">{ptn.country}</div>
                      <div className="text-slate-500">{ptn.city}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-sm">
                      <ul className="list-disc list-inside space-y-0.5">
                        {ptn.cooperationScopes.slice(0, 2).map((s, i) => (
                          <li key={i} className="truncate">{s}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {ptn.activeProgramsCount} หลักสูตร
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-600">
                      {ptn.startDate} ถึง {ptn.endDate}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openUsageModal(ptn.id, ptn.nameTh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>เชื่อมโยง</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(ptn as unknown as Record<string, unknown>)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer info */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            แสดงผลรายการข้อมูลกลางที่ผ่านการรับรองมาตรฐานสถาบัน โดยกองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
          </div>
          <div className="font-medium text-slate-700">
            ระบบจัดเก็บเวอร์ชัน: 1.0-Institutional-Standard
          </div>
        </div>
      </div>

      {/* Usage References Modal */}
      {selectedUsageItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    ความเชื่อมโยงกับโมดูลอื่น (Cross-Module Usage Matrix)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    รายการ: {selectedUsageItem.name} ({selectedUsageItem.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUsageItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                ข้อมูลกลางรายการนี้ถูกเชื่อมต่อกับโมดูลหลักต่างๆ ของมหาวิทยาลัย เพื่อรักษาความถูกต้องของ Foreign Key และป้องกันความซ้ำซ้อนของข้อมูล:
              </p>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {selectedUsageItem.references.map((ref, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-600" />
                        {ref.moduleNameTh}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                        {ref.count} รายการ
                      </span>
                    </div>
                    <div className="space-y-1 pt-1">
                      {ref.sampleItems.map((sample, sIdx) => (
                        <div key={sIdx} className="text-xs text-slate-600 flex items-center gap-2 pl-2 border-l-2 border-amber-300">
                          <span className="font-mono text-[11px] text-slate-400">{sample.id}</span>
                          <span className="font-medium text-slate-700">{sample.title}</span>
                          <span className="text-[10px] text-slate-400">({sample.fieldName})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUsageItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  {editingItem.isNew ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingItem.isNew ? `เพิ่ม${currentMeta.labelTh}ใหม่` : `แก้ไข${currentMeta.labelTh}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    รหัสมาตรฐาน: {String(editingItem.code || editingItem.id || '')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Common Fields: Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสมาตรฐาน (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={String(editingItem.code || '')}
                    onChange={e => setEditingItem({ ...editingItem, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานะการใช้งาน *
                  </label>
                  <select
                    value={String(editingItem.status || 'active')}
                    onChange={e => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="active">เปิดใช้งาน (Active)</option>
                    <option value="inactive">ปิดการใช้งาน (Inactive)</option>
                    {activeDomain === 'personnel' && <option value="on_leave">ลาศึกษา/ปฏิบัติศาสนกิจ</option>}
                  </select>
                </div>
              </div>

              {/* Dynamic inputs based on activeDomain */}
              {activeDomain === 'personnel' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">คำนำหน้านาม / สมณศักดิ์ *</label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร."
                        value={String(editingItem.titlePrefix || '')}
                        onChange={e => setEditingItem({ ...editingItem, titlePrefix: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.fullName || '')}
                        onChange={e => setEditingItem({ ...editingItem, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่งทางวิชาการ</label>
                      <select
                        value={String(editingItem.academicPositionName || 'อาจารย์')}
                        onChange={e => setEditingItem({ ...editingItem, academicPositionName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      >
                        <option value="ศาสตราจารย์">ศาสตราจารย์ (ศ.)</option>
                        <option value="รองศาสตราจารย์">รองศาสตราจารย์ (รศ.)</option>
                        <option value="ผู้ช่วยศาสตราจารย์">ผู้ช่วยศาสตราจารย์ (ผศ.)</option>
                        <option value="อาจารย์">อาจารย์ (อ.)</option>
                        <option value="นักวิชาการศึกษา">นักวิชาการศึกษา</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่งทางการบริหาร (ถ้ามี)</label>
                      <input
                        type="text"
                        placeholder="เช่น รองอธิการบดี, คณบดี, ผู้อำนวยการกอง"
                        value={String(editingItem.adminPositionName || '')}
                        onChange={e => setEditingItem({ ...editingItem, adminPositionName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">สังกัดสำนัก/คณะ *</label>
                      <select
                        value={String(editingItem.facultyName || allFaculties[0]?.nameTh || '')}
                        onChange={e => {
                          const fac = allFaculties.find(f => f.nameTh === e.target.value);
                          setEditingItem({
                            ...editingItem,
                            facultyName: e.target.value,
                            facultyId: fac?.id || 'FAC-BUD',
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      >
                        {allFaculties.map(f => (
                          <option key={f.id} value={f.nameTh}>{f.nameTh}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">วิทยาเขตประจำ *</label>
                      <select
                        value={String(editingItem.campusName || allCampuses[0]?.nameTh || '')}
                        onChange={e => {
                          const cmp = allCampuses.find(c => c.nameTh === e.target.value);
                          setEditingItem({
                            ...editingItem,
                            campusName: e.target.value,
                            campusId: cmp?.id || 'CMP-CENTRAL',
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      >
                        {allCampuses.map(c => (
                          <option key={c.id} value={c.nameTh}>{c.nameTh}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลสถาบัน *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@mcu.ac.th"
                        value={String(editingItem.email || '')}
                        onChange={e => setEditingItem({ ...editingItem, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                      <input
                        type="text"
                        value={String(editingItem.phone || '')}
                        onChange={e => setEditingItem({ ...editingItem, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Faculties / Campuses Name fields */}
              {(activeDomain === 'faculties' || activeDomain === 'campuses' || activeDomain === 'departments') && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อภาษาไทย *</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.nameTh || '')}
                        onChange={e => setEditingItem({ ...editingItem, nameTh: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อภาษาอังกฤษ (English Name) *</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.nameEn || '')}
                        onChange={e => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Programs */}
              {activeDomain === 'programs' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อหลักสูตร (ภาษาไทย) *</label>
                    <input
                      type="text"
                      required
                      value={String(editingItem.titleTh || '')}
                      onChange={e => setEditingItem({ ...editingItem, titleTh: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ระดับการศึกษา *</label>
                      <select
                        value={String(editingItem.level || 'ปริญญาตรี')}
                        onChange={e => setEditingItem({ ...editingItem, level: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      >
                        <option value="ปริญญาตรี">ปริญญาตรี</option>
                        <option value="ปริญญาโท">ปริญญาโท</option>
                        <option value="ปริญญาเอก">ปริญญาเอก</option>
                        <option value="ประกาศนียบัตร">ประกาศนียบัตร</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนหน่วยกิตรวม</label>
                      <input
                        type="number"
                        value={Number(editingItem.totalCredits || 132)}
                        onChange={e => setEditingItem({ ...editingItem, totalCredits: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Statuses */}
              {activeDomain === 'statuses' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสถานะภาษาไทย *</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.labelTh || '')}
                        onChange={e => setEditingItem({ ...editingItem, labelTh: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสถานะภาษาอังกฤษ *</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.labelEn || '')}
                        onChange={e => setEditingItem({ ...editingItem, labelEn: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบาย</label>
                    <textarea
                      rows={2}
                      value={String(editingItem.description || '')}
                      onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              {/* Partners */}
              {activeDomain === 'partners' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสถาบัน/องค์กรคู่ความร่วมมือ *</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.nameTh || '')}
                        onChange={e => setEditingItem({ ...editingItem, nameTh: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">เลขที่บันทึกข้อตกลง (MOU No.) *</label>
                      <input
                        type="text"
                        required
                        value={String(editingItem.mouNumber || '')}
                        onChange={e => setEditingItem({ ...editingItem, mouNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ประเทศ</label>
                      <input
                        type="text"
                        value={String(editingItem.country || '')}
                        onChange={e => setEditingItem({ ...editingItem, country: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">เมือง / มลรัฐ</label>
                      <input
                        type="text"
                        value={String(editingItem.city || '')}
                        onChange={e => setEditingItem({ ...editingItem, city: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  บันทึกข้อมูลกลาง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
