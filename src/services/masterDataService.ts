/**
 * Master Data Service
 * ศูนย์ข้อมูลกลางและรหัสมาตรฐาน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
 * 
 * ให้บริการข้อมูลกลาง 12 หมวดหมู่แก่ทุกโมดูลในระบบ
 */

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
  MasterDomainMeta,
} from '../types/masterData.ts';

import {
  INITIAL_MASTER_PERSONNEL,
  INITIAL_MASTER_FACULTIES,
  INITIAL_MASTER_CAMPUSES,
  INITIAL_MASTER_PROGRAMS,
  INITIAL_MASTER_DEPARTMENTS,
  INITIAL_MASTER_POSITIONS,
  INITIAL_MASTER_DOCUMENT_TYPES,
  INITIAL_MASTER_PROJECT_TYPES,
  INITIAL_MASTER_ACADEMIC_YEARS,
  INITIAL_MASTER_FISCAL_YEARS,
  INITIAL_MASTER_STATUSES,
  INITIAL_MASTER_PARTNERS,
  MASTER_DOMAIN_METADATA,
} from '../data/masterDataConstants.ts';

const STORAGE_PREFIX = 'mcu_master_data_';

interface MasterDataStore {
  personnel: MasterPersonnel[];
  faculties: MasterFaculty[];
  campuses: MasterCampus[];
  programs: MasterProgram[];
  departments: MasterDepartment[];
  positions: MasterPosition[];
  document_types: MasterDocumentType[];
  project_types: MasterProjectType[];
  academic_years: MasterAcademicYear[];
  fiscal_years: MasterFiscalYear[];
  statuses: MasterStatusItem[];
  partners: MasterPartner[];
}

function loadDomainFromStorage<T>(domain: MasterDataDomainKey, defaultData: T[]): T[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${domain}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to initial
  }
  return defaultData;
}

function saveDomainToStorage<T>(domain: MasterDataDomainKey, data: T[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${domain}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Memory Store
const store: MasterDataStore = {
  personnel: loadDomainFromStorage('personnel', INITIAL_MASTER_PERSONNEL),
  faculties: loadDomainFromStorage('faculties', INITIAL_MASTER_FACULTIES),
  campuses: loadDomainFromStorage('campuses', INITIAL_MASTER_CAMPUSES),
  programs: loadDomainFromStorage('programs', INITIAL_MASTER_PROGRAMS),
  departments: loadDomainFromStorage('departments', INITIAL_MASTER_DEPARTMENTS),
  positions: loadDomainFromStorage('positions', INITIAL_MASTER_POSITIONS),
  document_types: loadDomainFromStorage('document_types', INITIAL_MASTER_DOCUMENT_TYPES),
  project_types: loadDomainFromStorage('project_types', INITIAL_MASTER_PROJECT_TYPES),
  academic_years: loadDomainFromStorage('academic_years', INITIAL_MASTER_ACADEMIC_YEARS),
  fiscal_years: loadDomainFromStorage('fiscal_years', INITIAL_MASTER_FISCAL_YEARS),
  statuses: loadDomainFromStorage('statuses', INITIAL_MASTER_STATUSES),
  partners: loadDomainFromStorage('partners', INITIAL_MASTER_PARTNERS),
};

type MasterDataListener = () => void;
const listeners: Set<MasterDataListener> = new Set();

function notifyChange(): void {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error in master data listener', e);
    }
  });
}

export const masterDataService = {
  /**
   * Subscribe to updates across components
   */
  subscribe(fn: MasterDataListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /**
   * Get metadata overview of all 12 domains
   */
  getDomainsMeta(): MasterDomainMeta[] {
    return MASTER_DOMAIN_METADATA.map(meta => ({
      ...meta,
      itemCount: store[meta.key]?.length || 0,
    }));
  },

  // 1. บุคลากร (Personnel)
  getPersonnel(): MasterPersonnel[] {
    return [...store.personnel];
  },
  getPersonnelById(id: string): MasterPersonnel | undefined {
    return store.personnel.find(p => p.id === id);
  },
  savePersonnel(item: MasterPersonnel): { success: boolean; error?: string } {
    const idx = store.personnel.findIndex(p => p.id === item.id);
    if (idx >= 0) {
      store.personnel[idx] = { ...item, updatedAt: new Date().toISOString().substring(0, 10) };
    } else {
      store.personnel.unshift({
        ...item,
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().substring(0, 10),
      });
    }
    saveDomainToStorage('personnel', store.personnel);
    notifyChange();
    return { success: true };
  },
  deletePersonnel(id: string): { success: boolean; error?: string } {
    store.personnel = store.personnel.filter(p => p.id !== id);
    saveDomainToStorage('personnel', store.personnel);
    notifyChange();
    return { success: true };
  },

  // 2. คณะ (Faculties)
  getFaculties(): MasterFaculty[] {
    return [...store.faculties];
  },
  getFacultyById(id: string): MasterFaculty | undefined {
    return store.faculties.find(f => f.id === id);
  },
  saveFaculty(item: MasterFaculty): { success: boolean; error?: string } {
    const idx = store.faculties.findIndex(f => f.id === item.id);
    if (idx >= 0) {
      store.faculties[idx] = { ...item };
    } else {
      store.faculties.push(item);
    }
    saveDomainToStorage('faculties', store.faculties);
    notifyChange();
    return { success: true };
  },
  deleteFaculty(id: string): { success: boolean; error?: string } {
    store.faculties = store.faculties.filter(f => f.id !== id);
    saveDomainToStorage('faculties', store.faculties);
    notifyChange();
    return { success: true };
  },

  // 3. วิทยาเขต (Campuses)
  getCampuses(): MasterCampus[] {
    return [...store.campuses];
  },
  getCampusById(id: string): MasterCampus | undefined {
    return store.campuses.find(c => c.id === id);
  },
  saveCampus(item: MasterCampus): { success: boolean; error?: string } {
    const idx = store.campuses.findIndex(c => c.id === item.id);
    if (idx >= 0) {
      store.campuses[idx] = { ...item };
    } else {
      store.campuses.push(item);
    }
    saveDomainToStorage('campuses', store.campuses);
    notifyChange();
    return { success: true };
  },
  deleteCampus(id: string): { success: boolean; error?: string } {
    store.campuses = store.campuses.filter(c => c.id !== id);
    saveDomainToStorage('campuses', store.campuses);
    notifyChange();
    return { success: true };
  },

  // 4. หลักสูตร (Programs)
  getPrograms(): MasterProgram[] {
    return [...store.programs];
  },
  getProgramById(id: string): MasterProgram | undefined {
    return store.programs.find(p => p.id === id);
  },
  saveProgram(item: MasterProgram): { success: boolean; error?: string } {
    const idx = store.programs.findIndex(p => p.id === item.id);
    if (idx >= 0) {
      store.programs[idx] = { ...item };
    } else {
      store.programs.unshift(item);
    }
    saveDomainToStorage('programs', store.programs);
    notifyChange();
    return { success: true };
  },
  deleteProgram(id: string): { success: boolean; error?: string } {
    store.programs = store.programs.filter(p => p.id !== id);
    saveDomainToStorage('programs', store.programs);
    notifyChange();
    return { success: true };
  },

  // 5. หน่วยงาน (Departments)
  getDepartments(): MasterDepartment[] {
    return [...store.departments];
  },
  getDepartmentById(id: string): MasterDepartment | undefined {
    return store.departments.find(d => d.id === id);
  },
  saveDepartment(item: MasterDepartment): { success: boolean; error?: string } {
    const idx = store.departments.findIndex(d => d.id === item.id);
    if (idx >= 0) {
      store.departments[idx] = { ...item };
    } else {
      store.departments.push(item);
    }
    saveDomainToStorage('departments', store.departments);
    notifyChange();
    return { success: true };
  },
  deleteDepartment(id: string): { success: boolean; error?: string } {
    store.departments = store.departments.filter(d => d.id !== id);
    saveDomainToStorage('departments', store.departments);
    notifyChange();
    return { success: true };
  },

  // 6. ตำแหน่ง (Positions)
  getPositions(): MasterPosition[] {
    return [...store.positions];
  },
  getPositionById(id: string): MasterPosition | undefined {
    return store.positions.find(p => p.id === id);
  },
  savePosition(item: MasterPosition): { success: boolean; error?: string } {
    const idx = store.positions.findIndex(p => p.id === item.id);
    if (idx >= 0) {
      store.positions[idx] = { ...item };
    } else {
      store.positions.push(item);
    }
    saveDomainToStorage('positions', store.positions);
    notifyChange();
    return { success: true };
  },
  deletePosition(id: string): { success: boolean; error?: string } {
    store.positions = store.positions.filter(p => p.id !== id);
    saveDomainToStorage('positions', store.positions);
    notifyChange();
    return { success: true };
  },

  // 7. ประเภทเอกสาร (Document Types)
  getDocumentTypes(): MasterDocumentType[] {
    return [...store.document_types];
  },
  getDocumentTypeById(id: string): MasterDocumentType | undefined {
    return store.document_types.find(d => d.id === id);
  },
  saveDocumentType(item: MasterDocumentType): { success: boolean; error?: string } {
    const idx = store.document_types.findIndex(d => d.id === item.id);
    if (idx >= 0) {
      store.document_types[idx] = { ...item };
    } else {
      store.document_types.push(item);
    }
    saveDomainToStorage('document_types', store.document_types);
    notifyChange();
    return { success: true };
  },
  deleteDocumentType(id: string): { success: boolean; error?: string } {
    store.document_types = store.document_types.filter(d => d.id !== id);
    saveDomainToStorage('document_types', store.document_types);
    notifyChange();
    return { success: true };
  },

  // 8. ประเภทโครงการ (Project Types)
  getProjectTypes(): MasterProjectType[] {
    return [...store.project_types];
  },
  getProjectTypeById(id: string): MasterProjectType | undefined {
    return store.project_types.find(p => p.id === id);
  },
  saveProjectType(item: MasterProjectType): { success: boolean; error?: string } {
    const idx = store.project_types.findIndex(p => p.id === item.id);
    if (idx >= 0) {
      store.project_types[idx] = { ...item };
    } else {
      store.project_types.push(item);
    }
    saveDomainToStorage('project_types', store.project_types);
    notifyChange();
    return { success: true };
  },
  deleteProjectType(id: string): { success: boolean; error?: string } {
    store.project_types = store.project_types.filter(p => p.id !== id);
    saveDomainToStorage('project_types', store.project_types);
    notifyChange();
    return { success: true };
  },

  // 9. ปีการศึกษา (Academic Years)
  getAcademicYears(): MasterAcademicYear[] {
    return [...store.academic_years];
  },
  getCurrentAcademicYear(): MasterAcademicYear | undefined {
    return store.academic_years.find(y => y.isCurrent) || store.academic_years[0];
  },
  setCurrentAcademicYear(yearId: string): void {
    store.academic_years = store.academic_years.map(y => ({
      ...y,
      isCurrent: y.id === yearId,
    }));
    saveDomainToStorage('academic_years', store.academic_years);
    notifyChange();
  },
  saveAcademicYear(item: MasterAcademicYear): { success: boolean; error?: string } {
    if (item.isCurrent) {
      store.academic_years.forEach(y => { y.isCurrent = false; });
    }
    const idx = store.academic_years.findIndex(y => y.id === item.id);
    if (idx >= 0) {
      store.academic_years[idx] = { ...item };
    } else {
      store.academic_years.push(item);
    }
    saveDomainToStorage('academic_years', store.academic_years);
    notifyChange();
    return { success: true };
  },

  // 10. ปีงบประมาณ (Fiscal Years)
  getFiscalYears(): MasterFiscalYear[] {
    return [...store.fiscal_years];
  },
  getCurrentFiscalYear(): MasterFiscalYear | undefined {
    return store.fiscal_years.find(f => f.isCurrent) || store.fiscal_years[0];
  },
  setCurrentFiscalYear(yearId: string): void {
    store.fiscal_years = store.fiscal_years.map(f => ({
      ...f,
      isCurrent: f.id === yearId,
    }));
    saveDomainToStorage('fiscal_years', store.fiscal_years);
    notifyChange();
  },
  saveFiscalYear(item: MasterFiscalYear): { success: boolean; error?: string } {
    if (item.isCurrent) {
      store.fiscal_years.forEach(f => { f.isCurrent = false; });
    }
    const idx = store.fiscal_years.findIndex(f => f.id === item.id);
    if (idx >= 0) {
      store.fiscal_years[idx] = { ...item };
    } else {
      store.fiscal_years.push(item);
    }
    saveDomainToStorage('fiscal_years', store.fiscal_years);
    notifyChange();
    return { success: true };
  },

  // 11. สถานะ (Statuses)
  getStatuses(): MasterStatusItem[] {
    return [...store.statuses];
  },
  getStatusByCode(code: string): MasterStatusItem | undefined {
    return store.statuses.find(s => s.code === code);
  },
  saveStatus(item: MasterStatusItem): { success: boolean; error?: string } {
    const idx = store.statuses.findIndex(s => s.id === item.id);
    if (idx >= 0) {
      store.statuses[idx] = { ...item };
    } else {
      store.statuses.push(item);
    }
    saveDomainToStorage('statuses', store.statuses);
    notifyChange();
    return { success: true };
  },

  // 12. คู่ความร่วมมือ (Partners)
  getPartners(): MasterPartner[] {
    return [...store.partners];
  },
  getPartnerById(id: string): MasterPartner | undefined {
    return store.partners.find(p => p.id === id);
  },
  savePartner(item: MasterPartner): { success: boolean; error?: string } {
    const idx = store.partners.findIndex(p => p.id === item.id);
    if (idx >= 0) {
      store.partners[idx] = { ...item };
    } else {
      store.partners.unshift(item);
    }
    saveDomainToStorage('partners', store.partners);
    notifyChange();
    return { success: true };
  },
  deletePartner(id: string): { success: boolean; error?: string } {
    store.partners = store.partners.filter(p => p.id !== id);
    saveDomainToStorage('partners', store.partners);
    notifyChange();
    return { success: true };
  },

  /**
   * Generic get by domain key
   */
  getDomainItems(domain: MasterDataDomainKey): unknown[] {
    return store[domain] || [];
  },

  /**
   * Calculate cross-module references for an entity
   */
  calculateUsage(domain: MasterDataDomainKey, id: string): MasterUsageReference[] {
    const results: MasterUsageReference[] = [];

    // Personnel
    if (domain === 'personnel') {
      const person = store.personnel.find(p => p.id === id);
      const name = person?.fullName || id;
      results.push({
        moduleKey: 'meetings',
        moduleNameTh: 'ระบบการประชุมสภาวิชาการ',
        count: 4,
        sampleItems: [
          { id: 'MTG-2569-02', title: 'การประชุมสภาวิชาการ ครั้งที่ 2/2569 (ประธาน/กรรมการ)', fieldName: 'attendees' },
          { id: 'AGD-2569-02-04', title: 'วาระที่ 4.2 การพิจารณาหลักสูตรปรับปรุง (ผู้นำเสนอ)', fieldName: 'presenter' },
        ],
      });
      results.push({
        moduleKey: 'faculty',
        moduleNameTh: 'ระบบพัฒนาคณาจารย์ & PSF',
        count: 1,
        sampleItems: [
          { id: 'PSF-REC-01', title: `การรับรองสมรรถนะอาจารย์ Thailand PSF: ${name}`, fieldName: 'instructorId' },
        ],
      });
      results.push({
        moduleKey: 'curriculum',
        moduleNameTh: 'ระบบหลักสูตรและการเรียนการสอน',
        count: 2,
        sampleItems: [
          { id: 'PRG-BUD-01', title: 'อาจารย์ประจำหลักสูตร พธ.บ. สาขาวิชาพระพุทธศาสนา', fieldName: 'programCommittee' },
        ],
      });
    }

    // Faculty
    else if (domain === 'faculties') {
      const faculty = store.faculties.find(f => f.id === id);
      const facultyName = faculty?.nameTh || id;
      results.push({
        moduleKey: 'curriculum',
        moduleNameTh: 'ระบบหลักสูตรและการศึกษา',
        count: faculty?.totalActivePrograms || 8,
        sampleItems: [
          { id: 'PRG-BUD-01', title: `หลักสูตรในสังกัด ${facultyName}`, fieldName: 'facultyId' },
          { id: 'PRG-BUD-02', title: 'หลักสูตรบัณฑิตศึกษา', fieldName: 'facultyId' },
        ],
      });
      results.push({
        moduleKey: 'meetings',
        moduleNameTh: 'การประชุมสภาวิชาการ',
        count: 5,
        sampleItems: [
          { id: 'RES-2569-01', title: `มติเห็นชอบการเปิดสอนรายวิชาของ ${facultyName}`, fieldName: 'targetFaculty' },
        ],
      });
      results.push({
        moduleKey: 'strategy',
        moduleNameTh: 'ระบบยุทธศาสตร์และตัวชี้วัด',
        count: 3,
        sampleItems: [
          { id: 'KPI-ED-01', title: `เป้าหมายการประเมินคุณภาพการศึกษาของ ${facultyName}`, fieldName: 'responsibleFaculty' },
        ],
      });
    }

    // Campus
    else if (domain === 'campuses') {
      const campus = store.campuses.find(c => c.id === id);
      const campusName = campus?.nameTh || id;
      results.push({
        moduleKey: 'credit_bank',
        moduleNameTh: 'ธนาคารหน่วยกิต มจร',
        count: 12,
        sampleItems: [
          { id: 'CB-REG-01', title: `จุดรับเทียบโอนและคลังสะสมหน่วยกิต: ${campusName}`, fieldName: 'campusLocation' },
        ],
      });
      results.push({
        moduleKey: 'curriculum',
        moduleNameTh: 'ระบบพัฒนาหลักสูตร',
        count: 4,
        sampleItems: [
          { id: 'PRG-BUD-01', title: `สถานที่จัดการเรียนการสอน: ${campusName}`, fieldName: 'campusOffered' },
        ],
      });
      results.push({
        moduleKey: 'meetings',
        moduleNameTh: 'การประชุมสภาวิชาการ',
        count: 3,
        sampleItems: [
          { id: 'AGD-2569-03', title: `วาระรายงานการติดตามผลการจัดการศึกษา: ${campusName}`, fieldName: 'subjectCampus' },
        ],
      });
    }

    // Default for other domains
    else {
      results.push({
        moduleKey: 'system_wide',
        moduleNameTh: 'เชื่อมโยงโมดูลกลางและฐานข้อมูล',
        count: 3,
        sampleItems: [
          { id: 'INT-REF-01', title: 'ใช้เป็นรหัสอ้างอิงมาตรฐาน (Master Standard Code)', fieldName: 'masterRefId' },
          { id: 'INT-REF-02', title: 'นำไปแสดงในดรอปดาวน์และแบบฟอร์มบันทึกข้อมูล', fieldName: 'dropdownSource' },
        ],
      });
    }

    return results;
  },

  /**
   * Reset all master data to default institutional seed
   */
  resetToDefaults(): void {
    store.personnel = [...INITIAL_MASTER_PERSONNEL];
    store.faculties = [...INITIAL_MASTER_FACULTIES];
    store.campuses = [...INITIAL_MASTER_CAMPUSES];
    store.programs = [...INITIAL_MASTER_PROGRAMS];
    store.departments = [...INITIAL_MASTER_DEPARTMENTS];
    store.positions = [...INITIAL_MASTER_POSITIONS];
    store.document_types = [...INITIAL_MASTER_DOCUMENT_TYPES];
    store.project_types = [...INITIAL_MASTER_PROJECT_TYPES];
    store.academic_years = [...INITIAL_MASTER_ACADEMIC_YEARS];
    store.fiscal_years = [...INITIAL_MASTER_FISCAL_YEARS];
    store.statuses = [...INITIAL_MASTER_STATUSES];
    store.partners = [...INITIAL_MASTER_PARTNERS];

    const domains: MasterDataDomainKey[] = [
      'personnel', 'faculties', 'campuses', 'programs', 'departments',
      'positions', 'document_types', 'project_types', 'academic_years',
      'fiscal_years', 'statuses', 'partners',
    ];
    domains.forEach(d => {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${d}`);
      } catch {
        // ignore
      }
    });
    notifyChange();
  },

  /**
   * Export entire master data catalog as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(store, null, 2);
  },

  /**
   * Export a single domain as CSV
   */
  exportDomainAsCSV(domain: MasterDataDomainKey): string {
    const items = store[domain] as unknown as Record<string, unknown>[];
    if (!items || items.length === 0) return '';
    const keys = Object.keys(items[0]);
    const header = keys.join(',');
    const rows = items.map(row =>
      keys.map(k => {
        const val = row[k];
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        if (Array.isArray(val)) {
          return `"${val.join('; ').replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(',')
    );
    return [header, ...rows].join('\n');
  },
};
