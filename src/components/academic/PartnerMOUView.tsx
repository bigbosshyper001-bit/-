import React, { useState, useMemo } from 'react';
import {
  Globe2,
  Handshake,
  Award,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Mail,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  Users,
} from 'lucide-react';
import type { PartnerRecord, DegreeProgramRecord } from '../../data/academicModuleData.ts';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { ResponsiveTable } from '../ui/ResponsiveTable.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { useToast } from '../ui/Toast.tsx';

export interface PartnerMOUViewProps {
  partners: PartnerRecord[];
  degreePrograms: DegreeProgramRecord[];
  onAddPartner: (newPartner: PartnerRecord) => void;
  onUpdatePartner: (updated: PartnerRecord) => void;
  onOpenAdapter?: () => void;
}

export const PartnerMOUView: React.FC<PartnerMOUViewProps> = ({
  partners,
  degreePrograms,
  onAddPartner,
  onUpdatePartner,
  onOpenAdapter,
}) => {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'partners' | 'dual_degree' | 'joint_degree'>('partners');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  // Modal States
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State for Add Partner
  const [formState, setFormState] = useState({
    university: '',
    country: 'ประเทศศรีลังกา',
    contact: '',
    email: '',
    phone: '',
    mouNumber: '',
    startDate: '2026-06-01',
    endDate: '2031-05-31',
    status: 'active' as PartnerRecord['status'],
    collaborationType: ['dual_degree'] as PartnerRecord['collaborationType'],
    programs: '',
    scope: '',
  });

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchSearch =
        p.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mouNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contact.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchCountry = countryFilter === 'all' || p.country === countryFilter;

      return matchSearch && matchStatus && matchCountry;
    });
  }, [partners, searchTerm, statusFilter, countryFilter]);

  // Filtered degree programs
  const dualDegreePrograms = useMemo(
    () => degreePrograms.filter((d) => d.type === 'dual_degree'),
    [degreePrograms]
  );
  const jointDegreePrograms = useMemo(
    () => degreePrograms.filter((d) => d.type === 'joint_degree'),
    [degreePrograms]
  );

  const countries = useMemo(() => {
    const set = new Set(partners.map((p) => p.country));
    return Array.from(set);
  }, [partners]);

  const handleSaveNewPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.university || !formState.mouNumber || !formState.contact) {
      showToast('กรุณากรอกข้อมูลสถาบัน, เลขที่ MOU และผู้ประสานงานให้ครบถ้วน', 'warning');
      return;
    }

    const newPartner: PartnerRecord = {
      id: `pt-${Date.now()}`,
      university: formState.university,
      country: formState.country,
      countryCode: formState.country.includes('ไทย') ? 'TH' : 'INTL',
      contact: formState.contact,
      email: formState.email,
      phone: formState.phone,
      mouNumber: formState.mouNumber,
      startDate: formState.startDate,
      endDate: formState.endDate,
      status: formState.status,
      collaborationType: formState.collaborationType,
      programs: formState.programs ? formState.programs.split(',').map((s) => s.trim()) : ['หมวดวิชาพุทธศาสตร์'],
      scope: formState.scope || 'ข้อตกลงความร่วมมือทางวิชาการและการพัฒนาหลักสูตร',
      signedDocument: `${formState.mouNumber.replace(/\//g, '_')}_Signed.pdf`,
      activeStudents: 0,
    };

    onAddPartner(newPartner);
    setIsAddPartnerOpen(false);
    showToast(`บันทึกข้อมูลความร่วมมือกับ ${formState.university} สำเร็จแล้ว`, 'success');

    // Reset Form
    setFormState({
      university: '',
      country: 'ประเทศศรีลังกา',
      contact: '',
      email: '',
      phone: '',
      mouNumber: '',
      startDate: '2026-06-01',
      endDate: '2031-05-31',
      status: 'active',
      collaborationType: ['dual_degree'],
      programs: '',
      scope: '',
    });
  };

  const handleExportCSV = () => {
    const csvHeader = 'University,Country,MOU Number,Contact,Email,Start Date,End Date,Status\n';
    const csvRows = filteredPartners
      .map(
        (p) =>
          `"${p.university}","${p.country}","${p.mouNumber}","${p.contact}","${p.email}","${p.startDate}","${p.endDate}","${p.status}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MCU_Partners_MOU_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    showToast('ส่งออกไฟล์ข้อมูล MOU สำเร็จแล้ว', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-50 text-[#B83B6F] flex items-center justify-center shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">สถาบันคู่ความร่วมมือ</p>
            <p className="text-xl font-bold text-slate-900">{partners.length} สถาบัน</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">MOU ที่มีผลบังคับใช้</p>
            <p className="text-xl font-bold text-slate-900">
              {partners.filter((p) => p.status === 'active').length} ฉบับ
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Dual Degree (สองปริญญา)</p>
            <p className="text-xl font-bold text-slate-900">{dualDegreePrograms.length} หลักสูตร</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Joint Degree (หลักสูตรร่วม)</p>
            <p className="text-xl font-bold text-slate-900">{jointDegreePrograms.length} หลักสูตร</p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex overflow-x-auto scrollbar-none p-1 bg-slate-100 rounded-lg border border-slate-200/80 gap-1 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('partners')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeSubTab === 'partners'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>คู่ความร่วมมือ & MOU</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {partners.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('dual_degree')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeSubTab === 'dual_degree'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>หลักสูตรสองปริญญา (Dual Degree)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700">
              {dualDegreePrograms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('joint_degree')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeSubTab === 'joint_degree'
                ? 'bg-white text-[#B83B6F] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>หลักสูตรร่วม (Joint Degree)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-700">
              {jointDegreePrograms.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {onOpenAdapter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAdapter}
              className="text-xs text-slate-700 border-slate-300"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Integration Adapter
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs text-slate-700 border-slate-300"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            ส่งออก CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddPartnerOpen(true)}
            className="text-xs bg-[#B83B6F] hover:bg-[#A02F5E] text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            เพิ่มคู่ความร่วมมือ / MOU
          </Button>
        </div>
      </div>

      {/* VIEW: Partners & MOU Data Table */}
      {activeSubTab === 'partners' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อสถาบัน, ประเทศ, เลขที่ MOU, หรือผู้ประสานงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="all">ทุกสถานะ MOU</option>
                <option value="active">มีผลบังคับใช้ (Active)</option>
                <option value="pending">รอลงนาม (Pending)</option>
                <option value="expiring">ใกล้หมดอายุ (Expiring)</option>
                <option value="inactive">สิ้นสุดสัญญา (Inactive)</option>
              </select>

              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
              >
                <option value="all">ทุกประเทศ</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden p-3 sm:p-4">
            <ResponsiveTable
              data={filteredPartners}
              keyExtractor={(partner) => partner.id}
              emptyMessage="ไม่พบข้อมูลสถาบันคู่ความร่วมมือตามเงื่อนไขที่ระบุ"
              columns={[
                {
                  key: 'university',
                  title: 'สถาบันคู่ความร่วมมือ (University)',
                  render: (partner) => (
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{partner.university}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{partner.scope}</div>
                    </div>
                  ),
                },
                {
                  key: 'country',
                  title: 'ประเทศ (Country)',
                  render: (partner) => (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                      <Globe2 className="w-3 h-3 text-slate-500" />
                      {partner.country}
                    </span>
                  ),
                },
                {
                  key: 'mouNumber',
                  title: 'เลขที่ MOU',
                  render: (partner) => (
                    <span className="font-mono text-slate-800 font-medium text-xs">{partner.mouNumber}</span>
                  ),
                },
                {
                  key: 'contact',
                  title: 'ผู้ประสานงาน / อีเมล (Contact)',
                  render: (partner) => (
                    <div>
                      <div className="font-medium text-slate-800 flex items-center gap-1 text-xs">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{partner.contact}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{partner.email}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'duration',
                  title: 'ระยะเวลาสัญญา',
                  render: (partner) => (
                    <div className="whitespace-nowrap text-xs">
                      <div className="text-slate-700 font-medium">{partner.startDate} ถึง</div>
                      <div className="text-[11px] text-slate-500">{partner.endDate}</div>
                    </div>
                  ),
                },
                {
                  key: 'type',
                  title: 'ประเภทความร่วมมือ',
                  align: 'center',
                  render: (partner) => (
                    <div className="flex flex-wrap gap-1 justify-center max-w-[180px] mx-auto">
                      {partner.collaborationType.includes('dual_degree') && (
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium border border-purple-200">
                          Dual Degree
                        </span>
                      )}
                      {partner.collaborationType.includes('joint_degree') && (
                        <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-medium border border-teal-200">
                          Joint Degree
                        </span>
                      )}
                      {partner.collaborationType.includes('credit_transfer') && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-200">
                          Credit Bank
                        </span>
                      )}
                      {partner.collaborationType.includes('mou_exchange') && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                          แลกเปลี่ยน
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'status',
                  title: 'สถานะ',
                  align: 'center',
                  render: (partner) => <StatusBadge status={partner.status} />,
                },
                {
                  key: 'actions',
                  title: 'การจัดการ',
                  align: 'right',
                  render: (partner) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPartner(partner);
                        setIsDetailModalOpen(true);
                      }}
                      className="text-xs text-[#B83B6F] hover:bg-pink-50"
                    >
                      ดูรายละเอียด
                    </Button>
                  ),
                },
              ]}
              renderCard={(partner) => ({
                id: partner.id,
                title: partner.university,
                subtitle: `${partner.country} • MOU: ${partner.mouNumber}`,
                statusBadge: <StatusBadge status={partner.status} />,
                fields: [
                  { label: 'ขอบเขต', value: partner.scope, fullWidth: true },
                  { label: 'ผู้ประสานงาน', value: partner.contact },
                  { label: 'อีเมล', value: partner.email },
                  { label: 'ระยะเวลา', value: `${partner.startDate} ถึง ${partner.endDate}` },
                  {
                    label: 'ประเภทความร่วมมือ',
                    value: (
                      <div className="flex flex-wrap gap-1">
                        {partner.collaborationType.map((t) => (
                          <span
                            key={t}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              t === 'dual_degree'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : t === 'joint_degree'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : t === 'credit_transfer'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t === 'dual_degree'
                              ? 'Dual Degree'
                              : t === 'joint_degree'
                              ? 'Joint Degree'
                              : t === 'credit_transfer'
                              ? 'Credit Bank'
                              : 'แลกเปลี่ยน'}
                          </span>
                        ))}
                      </div>
                    ),
                    fullWidth: true,
                  },
                ],
                primaryAction: (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-[#B83B6F] border-pink-200 hover:bg-pink-50"
                    onClick={() => {
                      setSelectedPartner(partner);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    ดูรายละเอียดและเอกสาร MOU
                  </Button>
                ),
              })}
            />
          </div>
        </div>
      )}

      {/* VIEW: Dual Degree Programs */}
      {activeSubTab === 'dual_degree' && (
        <div className="space-y-4">
          <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 text-sm">
                ข้อกำหนดหลักสูตรสองปริญญา (Dual Degree Academic Structure)
              </h3>
              <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                ผู้สำเร็จการศึกษาจะได้รับปริญญาบัตรจำนวน 2 ฉบับแยกกันจากทั้ง มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)
                และสถาบันคู่สัญญาต่างประเทศ โดยมีการเทียบโอนหน่วยกิตสะสมตามกรอบหลักสูตรที่สภาวิชาการให้ความเห็นชอบ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {dualDegreePrograms.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-semibold">
                        Dual Degree (สองปริญญา)
                      </span>
                      <span className="text-xs text-slate-500 font-mono">MOU: {prog.mouNumber}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{prog.titleTh}</h3>
                    <p className="text-xs text-slate-500 italic mt-0.5">{prog.titleEn}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">นักศึกษาในโครงการ</p>
                      <p className="text-base font-bold text-slate-900">
                        {prog.enrolledStudents} / {prog.quotaPerYear} คน/ปี
                      </p>
                    </div>
                    <StatusBadge status={prog.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-1 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-medium block">สถาบันคู่สัญญา</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{prog.partnerUniversity}</span>
                    <span className="text-[11px] text-slate-500">{prog.partnerCountry}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-medium block">โครงสร้างระยะเวลา</span>
                    <span className="font-semibold text-purple-700 mt-0.5 block">{prog.studyModel}</span>
                    <span className="text-[11px] text-slate-500">คณะเจ้าของ: {prog.mcuFaculty}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-medium block">การแบ่งหน่วยกิตสะสม</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">รวม {prog.totalCredits} หน่วยกิต</span>
                    <span className="text-[11px] text-slate-500">
                      มจร: {prog.mcuCredits} • สถาบันคู่สัญญา: {prog.partnerCredits}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-medium block">ปริญญาที่ได้รับ (2 ใบ)</span>
                    <ul className="list-disc list-inside text-slate-700 mt-0.5 space-y-0.5 text-[11px]">
                      {prog.degreesAwardedTh.map((deg, i) => (
                        <li key={i} className="truncate">
                          {deg}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: Joint Degree Programs */}
      {activeSubTab === 'joint_degree' && (
        <div className="space-y-4">
          <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700 shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-teal-900 text-sm">
                ข้อกำหนดหลักสูตรร่วม (Joint Degree Academic Framework)
              </h3>
              <p className="text-xs text-teal-700 mt-1 leading-relaxed">
                หลักสูตรที่ มจร และมหาวิทยาลัยพันธมิตรร่วมกันออกแบบ จัดการเรียนการสอน กำกับวิทยานิพนธ์
                และออกปริญญาบัตรร่วมกันฉบับเดียว (Single Joint Degree Certificate) ลงนามโดยอธิการบดีของทั้งสองสถาบัน
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {jointDegreePrograms.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-teal-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-xs font-semibold">
                        Joint Degree (หลักสูตรร่วม ปริญญาบัตร 1 ใบ)
                      </span>
                      <span className="text-xs text-slate-500 font-mono">MOU: {prog.mouNumber}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{prog.titleTh}</h3>
                    <p className="text-xs text-slate-500 italic mt-0.5">{prog.titleEn}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">นักศึกษาในโครงการ</p>
                      <p className="text-base font-bold text-slate-900">
                        {prog.enrolledStudents} / {prog.quotaPerYear} คน/ปี
                      </p>
                    </div>
                    <StatusBadge status={prog.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-1 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-medium block">สถาบันร่วมสอน</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{prog.partnerUniversity}</span>
                    <span className="text-[11px] text-slate-500">{prog.partnerCountry}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-medium block">รูปแบบการจัดการศึกษา</span>
                    <span className="font-semibold text-teal-700 mt-0.5 block">{prog.studyModel}</span>
                    <span className="text-[11px] text-slate-500">หน่วยงานกำกับ: {prog.mcuFaculty}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-medium block">หน่วยกิตร่วม</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{prog.totalCredits} หน่วยกิต</span>
                    <span className="text-[11px] text-slate-500">
                      อาจารย์ที่ปรึกษาร่วม (Joint Co-advisors)
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-medium block">ปริญญาบัตรร่วม</span>
                    <p className="text-slate-800 mt-0.5 font-medium text-[11px] leading-snug">
                      {prog.degreesAwardedTh[0]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add New Partner & MOU */}
      <Modal
        isOpen={isAddPartnerOpen}
        onClose={() => setIsAddPartnerOpen(false)}
        title="เพิ่มสถาบันคู่ความร่วมมือ / บันทึกข้อตกลง MOU ใหม่"
        size="lg"
      >
        <form onSubmit={handleSaveNewPartner} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ชื่อสถาบัน / มหาวิทยาลัยคู่สัญญา (University) *
              </label>
              <Input
                value={formState.university}
                onChange={(e) => setFormState({ ...formState, university: e.target.value })}
                placeholder="เช่น University of Peradeniya, Kyoto Zen University"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">ประเทศ (Country) *</label>
              <select
                value={formState.country}
                onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#D94F87]"
              >
                <option value="ประเทศศรีลังกา">ประเทศศรีลังกา</option>
                <option value="ประเทศอินเดีย">ประเทศอินเดีย</option>
                <option value="ประเทศญี่ปุ่น">ประเทศญี่ปุ่น</option>
                <option value="ประเทศเกาหลีใต้">ประเทศเกาหลีใต้</option>
                <option value="ประเทศมาเลเซีย">ประเทศมาเลเซีย</option>
                <option value="ประเทศไต้หวัน">ประเทศไต้หวัน</option>
                <option value="ประเทศไทย (ในประเทศ)">ประเทศไทย (ในประเทศ)</option>
                <option value="สหราชอาณาจักร (UK)">สหราชอาณาจักร (UK)</option>
                <option value="สหรัฐอเมริกา (USA)">สหรัฐอเมริกา (USA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">เลขที่สัญญา MOU (MOU Number) *</label>
              <Input
                value={formState.mouNumber}
                onChange={(e) => setFormState({ ...formState, mouNumber: e.target.value })}
                placeholder="เช่น MOU-MCU-2569-021"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">วันที่เริ่มสัญญา (Start Date)</label>
              <Input
                type="date"
                value={formState.startDate}
                onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">วันที่สิ้นสุดสัญญา (End Date)</label>
              <Input
                type="date"
                value={formState.endDate}
                onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">ผู้ประสานงาน (Contact Person) *</label>
              <Input
                value={formState.contact}
                onChange={(e) => setFormState({ ...formState, contact: e.target.value })}
                placeholder="เช่น Prof. Dr. John Doe (Dean)"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">อีเมลติดต่อ (Email)</label>
              <Input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="contact@university.edu"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">สถานะสัญญา (Status)</label>
              <select
                value={formState.status}
                onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#D94F87]"
              >
                <option value="active">มีผลบังคับใช้ (Active)</option>
                <option value="pending">รอลงนาม (Pending)</option>
                <option value="expiring">ใกล้หมดอายุ (Expiring)</option>
                <option value="inactive">สิ้นสุดสัญญา (Inactive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">ขอบเขตความร่วมมือ (Scope)</label>
            <textarea
              rows={2}
              value={formState.scope}
              onChange={(e) => setFormState({ ...formState, scope: e.target.value })}
              placeholder="ระบุวัตถุประสงค์ เช่น การจัดการเรียนการสอนสองปริญญา การแลกเปลี่ยนอาจารย์ การเทียบโอนหน่วยกิต..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D94F87]/20 focus:border-[#D94F87]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddPartnerOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#B83B6F] hover:bg-[#A02F5E] text-white">
              บันทึกข้อมูลสถาบัน
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Partner Details & Signed Document */}
      {selectedPartner && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`รายละเอียดคู่ความร่วมมือ: ${selectedPartner.university}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 font-medium">สถาบันคู่สัญญา</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{selectedPartner.university}</p>
                <p className="text-slate-600 mt-1 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                  {selectedPartner.country}
                </p>
              </div>

              <div className="text-right">
                <p className="text-slate-500 font-medium">เลขที่บันทึกข้อตกลง</p>
                <p className="font-mono text-base font-bold text-slate-900 mt-0.5">{selectedPartner.mouNumber}</p>
                <div className="mt-1 flex justify-end">
                  <StatusBadge status={selectedPartner.status} />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B83B6F]" />
                ขอบเขตและสาระสำคัญของบันทึกข้อตกลง
              </h4>
              <p className="text-slate-700 leading-relaxed">{selectedPartner.scope}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500 font-medium">ผู้ประสานงานหลัก</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedPartner.contact}</p>
                <p className="text-slate-500 mt-0.5">{selectedPartner.email}</p>
                <p className="text-slate-500">{selectedPartner.phone}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500 font-medium">ระยะเวลาความร่วมมือ</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedPartner.startDate} ถึง {selectedPartner.endDate}
                </p>
                <p className="text-emerald-700 font-medium mt-1">
                  จำนวนนักศึกษาในโครงการ: {selectedPartner.activeStudents} คน
                </p>
              </div>
            </div>

            <div className="p-3 bg-pink-50/50 rounded-lg border border-pink-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B83B6F]" />
                <span className="font-medium text-slate-800">เอกสารฉบับลงนาม: {selectedPartner.signedDocument}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast(`เปิดดาวน์โหลดเอกสาร ${selectedPartner.signedDocument}`, 'info')}
                className="text-xs text-[#B83B6F] border-pink-300"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                ดาวน์โหลด PDF
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
