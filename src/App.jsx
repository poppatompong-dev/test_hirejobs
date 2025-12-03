import React, { useState, useEffect } from 'react';
import { 
  Printer, FileText, User, MapPin, Briefcase, Upload, ChevronDown, ChevronUp, X, CheckCircle, 
  Image as ImageIcon, File, Shield, AlertCircle, Send, Check, Settings, Key, Loader2, Link as LinkIcon, 
  Plus, Trash2, Search, Edit, LogOut, LogIn, Download, RefreshCw, AlertTriangle, ExternalLink, Eye, 
  Wifi, WifiOff, Users, Calendar, PieChart, LayoutDashboard, FileCheck, Save, ArrowRight, Filter, 
  Clock, Monitor, Grid, List, MousePointerClick, UserPlus, UserMinus
} from 'lucide-react';

// --- CONFIGURATION ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxCedIiJ1RfLX42tvRPEGbiZfd_V_63jKwFPrQ_DXdqn_iBHdQ1spfWS7hLBFYu2cjx/exec"; 
const LOGO_URL = "https://img5.pic.in.th/file/secure-sv1/Logof9c59c62588ec6ab.png";

// --- UI COMPONENTS ---
const SectionHeader = ({ title, icon: Icon, isOpen, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b ${isOpen ? 'bg-emerald-50' : ''}`}>
    <div className="flex items-center gap-3">{Icon && <Icon className="text-emerald-700" size={20}/>}<span className="font-bold text-gray-700">{title}</span></div>
    {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
  </div>
);

const CheckBox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className={`w-5 h-5 border rounded flex items-center justify-center ${checked?'bg-emerald-600 border-emerald-600':'border-gray-300 bg-white'}`}>
          {checked && <Check size={14} className="text-white"/>}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange}/>
  </label>
);

const DottedLine = ({ text, width = 'flex-1', center = false }) => (
  <div className={`${width} border-b-[1px] border-dotted border-black relative h-[26px] flex items-end ${center ? 'justify-center' : 'justify-start'} px-2`}>
    <span className="text-blue-900 font-bold whitespace-nowrap overflow-visible leading-normal -translate-y-[4px]" style={{fontFamily: 'Kanit, sans-serif', fontSize: '14px'}}>{text || ''}</span>
  </div>
);

const JobDetailModal = ({ job, onClose }) => {
    if (!job) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 font-kanit animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b flex justify-between items-start bg-emerald-50 rounded-t-xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-emerald-800">{job.name}</h2>
                        <p className="text-gray-600">{job.category} ({job.subCategory}) - {job.division}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-emerald-200 rounded-full"><X/></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded border"><span className="text-xs text-gray-500">วันที่รับสมัคร</span><div className="font-bold">{job.dateOpen} - {job.dateClose}</div></div>
                        <div className="bg-slate-50 p-3 rounded border"><span className="text-xs text-gray-500">วุฒิการศึกษา</span><div className="font-bold">{job.degree}</div></div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2"><User size={18}/> คุณสมบัติผู้สมัคร</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded border">{job.qualifications || "-"}</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2"><FileText size={18}/> เอกสารหลักฐานที่ต้องใช้</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded border">{job.documents || "-"}</p>
                    </div>

                    {job.notes && (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800">
                            <strong>หมายเหตุ:</strong> {job.notes}
                        </div>
                    )}

                    {job.pdfUrl && (
                        <a href={job.pdfUrl} target="_blank" className="flex items-center justify-center gap-2 w-full border border-emerald-600 text-emerald-600 py-2 rounded-lg font-bold hover:bg-emerald-50">
                            <Download size={18}/> ดาวน์โหลดประกาศฉบับเต็ม (PDF)
                        </a>
                    )}
                </div>
                <div className="p-4 border-t flex justify-end bg-gray-50 rounded-b-xl sticky bottom-0">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300">ปิด</button>
                </div>
            </div>
        </div>
    );
};

const AdminLoginModal = ({ show, onClose, onLogin }) => {
  const [pass, setPass] = useState('');
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 font-kanit">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="font-bold mb-4 text-emerald-800">เข้าสู่ระบบเจ้าหน้าที่</h2>
        <input 
            type="password" 
            value={pass} 
            onChange={e=>setPass(e.target.value)} 
            className="border w-full p-2 mb-4 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="รหัสผ่าน"
            autoFocus
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded">ยกเลิก</button>
          <button onClick={()=>onLogin(pass)} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">เข้าสู่ระบบ</button>
        </div>
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS ---
const getThaiDate = (dateObj) => {
  const d = new Date(dateObj); 
  if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
  return { day: d.getDate(), month: d.toLocaleString('th-TH', { month: 'long' }), year: d.getFullYear() + 543 };
};

const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const translateType = (type) => {
    if (type === 'mission') return 'พนักงานจ้างตามภารกิจ';
    if (type === 'general') return 'พนักงานจ้างทั่วไป';
    return type;
};

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking'); 
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [backdoorCount, setBackdoorCount] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);

  const [positions, setPositions] = useState([]);
  const [applicantList, setApplicantList] = useState([]);
  const [adminList, setAdminList] = useState([]);
  
  const [adminView, setAdminView] = useState('dashboard');
  const [applicantViewMode, setApplicantViewMode] = useState('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [posFilter, setPosFilter] = useState('all');
  
  const [editingPosId, setEditingPosId] = useState(null);
  const [newPos, setNewPos] = useState({ 
    type: 'mission', name: '', division: '', missionType: 'qualified', category: 'พนักงานจ้าง', subCategory: 'ทั่วไป',
    degree: '', age: '', exp: '', dateOpen: '', dateClose: '', pdfUrl: '',
    qualifications: '', documents: '', notes: '' 
  });
  const [newAdmin, setNewAdmin] = useState({ idCardNumber: '', phoneNumber: '', firstName: '', lastName: '', prefix: 'นาย' });

  const initialFormData = {
    prefix: 'นาย', firstName: '', lastName: '', nationality: 'ไทย', birthDate: '', age: '', religion: '', idCardNumber: '', photoPreview: null, photoFile: null, photoUrl: '',
    address: { houseNo: '', moo: '', road: '', subDistrict: '', district: '', province: 'อุทัยธานี', zipcode: '', phone: '' },
    contactAddress: { houseNo: '', moo: '', road: '', subDistrict: '', district: '', province: '', zipcode: '', phone: '' },
    isSameAddress: false,
    maritalStatus: 'single', spouseName: '-', spouseOccupation: '-', 
    fatherName: '', fatherStatus: 'alive', fatherOccupation: '', motherName: '', motherStatus: 'alive', motherOccupation: '',
    education: { degree: '', major: '', institution: '', gpa: '' },
    examPartA: { passed: false, year: '', level: '' },
    languageSkills: { language: 'อังกฤษ', listening: 'พอใช้', speaking: 'พอใช้', reading: 'พอใช้', writing: 'พอใช้' },
    specialSkills: '', prevWork: '', prevWorkPlace: '', prevPosition: '', prevDuration: '',
    emergencyContact: { name: '', relation: '', phone: '' }, newsSource: '',
    legalHistory: { hasCase: false, caseDetails: '' }, disciplinaryHistory: { hasPunishment: false, punishmentDetails: '' },
    selectedPositionId: '', displayPosition: '', displayDivision: '', displayJobType: '', displayMissionType: '', displayCategory: '',
    status: 'draft', submissionId: '', submissionDate: null, approvalDate: null, adminFeedback: '', examId: '', termsAccepted: false,
    attachments: { houseReg: {link:''}, idCard: {link:''}, education: {link:''}, medical: {link:''}, transcripts: {link:''}, other: {link:''} }
  };
  const [formData, setFormData] = useState(initialFormData);
  const [activeSection, setActiveSection] = useState(1);
  const [printMode, setPrintMode] = useState('application');

  // --- API CALLS ---
  const callAPI = async (action, payload = {}) => {
    setLoading(true);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action, ...payload }),
        mode: 'no-cors'
      });
      return { success: true };
    } catch (e) { return { success: false, error: e }; } finally { setLoading(false); }
  };

  const loadInitialData = async () => {
    setLoading(true);
    setDbStatus('checking');
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_all`);
      const data = await res.json();
      if (data.positions) setPositions(data.positions);
      if (data.applicants) {
        setApplicantList(data.applicants);
        if (currentUser) {
            const myApp = data.applicants.find(a => String(a.idCardNumber) === String(currentUser.idCardNumber));
            if (myApp) setFormData(myApp);
        }
      }
      if (data.admins) setAdminList(data.admins);
      setDbStatus('connected');
    } catch (e) { 
      setDbStatus('error');
      const localPos = localStorage.getItem('uthai_jobs_positions');
      if(localPos) setPositions(JSON.parse(localPos));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadInitialData(); }, []);

  // --- AUTH HANDLERS ---
  const handleRegister = async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      idCardNumber: f.idCard.value, phoneNumber: f.phone.value, prefix: f.prefix.value,
      firstName: f.fname.value, lastName: f.lname.value, email: f.email.value
    };
    const res = await callAPI('register', payload);
    if(res.success) { alert('ลงทะเบียนสำเร็จ!'); setView('login'); } 
    else { alert('ลงทะเบียนเสร็จสิ้น (หรือมีผู้ใช้นี้แล้ว)'); setView('login'); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const id = e.target.idCard.value, ph = e.target.phone.value;
    if (id === 'admin' && ph === 'admin123') { handleAdminLoginSubmit('admin123'); return; }

    setLoading(true);
    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'login', idCardNumber: id, phoneNumber: ph }) });
        const result = await res.json();
        if (result.result === 'success') {
            setCurrentUser(result.user);
            if (result.user.role === 'admin') setView('admin_dash');
            else {
              const appRes = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_all`);
              const appData = await appRes.json();
              const myApp = appData.applicants.find(a => String(a.idCardNumber) === String(id));
              if (myApp) setFormData(myApp);
              else setFormData({ 
                  ...initialFormData, 
                  idCardNumber: id, 
                  prefix: result.user.prefix, firstName: result.user.firstName, lastName: result.user.lastName, 
                  address: { ...initialFormData.address, phone: ph }, contactAddress: { ...initialFormData.contactAddress, phone: ph } 
              });
              setView('user_dash');
            }
            loadInitialData();
        } else { alert('ข้อมูลไม่ถูกต้อง'); }
    } catch(e) {
        alert('Offline Mode');
        setCurrentUser({ idCardNumber: id, firstName: 'User', lastName: 'Offline' });
        setFormData({ ...initialFormData, idCardNumber: id });
        setView('user_dash');
    } finally { setLoading(false); }
  };

  const handleAdminLoginSubmit = (pass) => {
    if (pass === 'admin123') { setCurrentUser({ firstName: 'Admin', role: 'admin' }); setView('admin_dash'); setShowAdminModal(false); loadInitialData(); } else alert('รหัสผิด');
  };

  const handleLogout = () => { setCurrentUser(null); setFormData(initialFormData); setView('landing'); };

  // --- FORM LOGIC ---
  const isLocked = () => ['submitted','approved','eligible'].includes(formData.status) && currentUser?.role !== 'admin';
  const handleInputChange = (f, v) => !isLocked() && setFormData(p => ({ ...p, [f]: v }));
  const handleNestedChange = (p, f, v) => !isLocked() && setFormData(prev => ({ ...prev, [p]: { ...prev[p], [f]: v } }));
  const handleSaveDraft = () => { localStorage.setItem('draft_' + formData.idCardNumber, JSON.stringify(formData)); alert('บันทึกแบบร่างแล้ว'); };
  
  const handleSubmitApplication = async () => {
    if (!formData.selectedPositionId || !formData.firstName) return alert("กรุณากรอกข้อมูลให้ครบ");
    if (!formData.termsAccepted) return alert("กรุณายอมรับเงื่อนไข");
    if (confirm("ยืนยันส่งใบสมัคร?")) {
      const subId = formData.submissionId || 'JOB-' + Math.floor(Math.random()*10000);
      const newData = { ...formData, status: 'submitted', submissionId: subId, submissionDate: new Date().toISOString() };
      setFormData(newData);
      const db = JSON.parse(localStorage.getItem('uthai_jobs_applicants_db') || '{}');
      db[newData.idCardNumber] = newData;
      localStorage.setItem('uthai_jobs_applicants_db', JSON.stringify(db));
      await callAPI('save_application', newData);
      alert("ส่งเรียบร้อย!");
      loadInitialData();
      setView('user_dash');
    }
  };

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 5*1024*1024) return alert("ไฟล์ใหญ่เกิน 5MB");
      const base64 = await fileToBase64(file);
      if (key === 'photoPreview') setFormData(p => ({ ...p, photoPreview: URL.createObjectURL(file), photoFile: base64 }));
      else setFormData(p => ({ ...p, attachments: { ...p.attachments, [key]: { ...p.attachments[key], checked: true, name: file.name, fileData: base64 } } }));
    }
  };

  const handlePositionSelect = (id) => {
    if (isLocked()) return;
    const pos = positions.find(p => p.id.toString() === id.toString());
    if (pos) setFormData(p => ({ ...p, selectedPositionId: id, displayPosition: pos.name, displayDivision: pos.division, displayCategory: pos.category, displayJobType: translateType(p.type), displayMissionType: p.missionType }));
  };

  // --- ADMIN ---
  const handleManagePosition = async (method, posData) => {
    let newPositions = [...positions];
    if (method === 'add') newPositions.push({ ...posData, id: Date.now(), status: 'Open' });
    if (method === 'edit') newPositions = newPositions.map(p => p.id === posData.id ? posData : p);
    if (method === 'delete') { if(!confirm("ยืนยันลบ?")) return; newPositions = newPositions.filter(p => p.id !== posData.id); }
    setPositions(newPositions);
    setEditingPosId(null);
    setNewPos({ category: 'พนักงานจ้าง', subCategory: 'ทั่วไป', name: '', division: '', desc: '', degree: '', age: '', exp: '', dateOpen: '', dateClose: '', pdfUrl: '', qualifications: '', documents: '', notes: '' });
    await callAPI('manage_position', { method: 'update_all', positions: newPositions });
  };

  const startEditPosition = (pos) => { setNewPos(pos); setEditingPosId(pos.id); };

  const handleAdminAction = async (status) => {
    const newData = { ...formData, status, approvalDate: status!=='correction'?new Date().toISOString():null, examId: status==='eligible' && !formData.examId ? "EX-"+Math.floor(1000+Math.random()*9000) : formData.examId, adminFeedback: formData.adminFeedback };
    setFormData(newData);
    await callAPI('save_application', newData);
    alert("บันทึกแล้ว"); loadInitialData(); setView('admin_dash');
  };
  
  const handleDeleteApplicant = async (idCard) => { if(confirm("ยืนยันลบ?")){ await callAPI('delete_applicant', { idCardNumber: idCard }); loadInitialData(); } };
  const handleAddAdmin = async () => { await callAPI('manage_admin', { method: 'add', ...newAdmin }); alert("เพิ่มแล้ว"); setNewAdmin({ idCardNumber: '', phoneNumber: '', firstName: '', lastName: '', prefix: 'นาย' }); loadInitialData(); };
  const handleDeleteAdmin = async (id) => { if(confirm("ยืนยันลบแอดมิน?")) { await callAPI('manage_admin', { method: 'delete', idCardNumber: id }); loadInitialData(); } };
  const handleClearDB = async () => { if (confirm("⚠️ ล้างข้อมูลทั้งหมด?")) { if (prompt("พิมพ์ 'DELETE'") === 'DELETE') { await callAPI('clear_database'); setApplicantList([]); alert("ล้างระบบแล้ว"); } } };

  const filteredApplicants = applicantList.filter(a => (a.firstName+a.idCardNumber).includes(searchTerm) && (filterStatus === 'all' || a.status === filterStatus));
  const exportCSV = () => {
      const headers = ["วันที่สมัคร", "เลขบัตร", "ชื่อ-สกุล", "ตำแหน่ง", "เบอร์โทร", "สถานะ"];
      const rows = filteredApplicants.map(a => [new Date(a.submissionDate).toLocaleDateString('th-TH'), `'${a.idCardNumber}`, `${a.prefix}${a.firstName} ${a.lastName}`, a.displayPosition, a.address.phone, a.status]);
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
      const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = "report_applicants.csv"; link.click();
  };

  // --- RENDER VIEWS ---
  return (
    <div className="min-h-screen bg-gray-50 font-kanit text-gray-800 print:bg-white print:p-0 flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap'); .font-sarabun { font-family: 'Sarabun', sans-serif; } @media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; } .no-print { display: none; } }`}</style>
      {loading && <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center text-white"><Loader2 size={48} className="animate-spin"/></div>}
      <AdminLoginModal show={showAdminModal} onClose={()=>setShowAdminModal(false)} onLogin={handleAdminLoginSubmit} />
      <JobDetailModal job={selectedJob} onClose={()=>setSelectedJob(null)}/>

      {/* NAVBAR */}
      <nav className="bg-white p-4 sticky top-0 z-50 shadow-md flex justify-between items-center border-b border-emerald-100">
         <div className="flex items-center gap-3 cursor-pointer" onClick={()=>setView('landing')}>
            <div className="bg-white p-1 rounded-full w-10 h-10 border flex items-center justify-center overflow-hidden"><img src={LOGO_URL} className="w-full h-full object-contain"/></div>
            <div><h1 className="font-bold text-lg text-emerald-800 leading-tight">ระบบรับสมัครพนักงานจ้าง</h1><p className="text-xs text-gray-500">เทศบาลเมืองอุทัยธานี</p></div>
         </div>
         <div className="flex items-center gap-3">
            {currentUser?.role === 'admin' && <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${dbStatus==='connected'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{dbStatus==='connected'?<Wifi size={14}/>:<WifiOff size={14}/>}<span className="hidden md:inline">{dbStatus==='connected'?'Online':'Offline'}</span></div>}
            {!currentUser && view !== 'login' && view !== 'register' && <button onClick={()=>setView('login')} className="bg-emerald-600 text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-emerald-700 transition flex gap-2 items-center"><User size={18}/> เข้าสู่ระบบ</button>}
            {currentUser && <div className="flex items-center gap-3"><span className="text-sm font-bold text-gray-700 hidden md:inline">สวัสดี, {currentUser.firstName}</span><button onClick={handleLogout} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-red-100 transition"><LogOut size={16}/> ออก</button></div>}
         </div>
      </nav>

      {/* 1. LANDING PAGE */}
      {view === 'landing' && (
        <div className="flex flex-col items-center w-full">
           <div className="w-full bg-gradient-to-b from-emerald-50 to-white py-16 px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">ร่วมงานกับเรา <span className="text-emerald-600">เทศบาลเมืองอุทัยธานี</span></h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">ระบบสมัครงานออนไลน์รูปแบบใหม่ สะดวก รวดเร็ว โปร่งใส ตรวจสอบสถานะได้ 24 ชั่วโมง</p>
              <div className="flex justify-center gap-4"><button onClick={()=>setView('register')} className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:bg-emerald-700 hover:-translate-y-1 transition transform">ลงทะเบียนสมัครงาน</button><button onClick={()=>setView('login')} className="bg-white border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-emerald-50 transition">เข้าสู่ระบบ</button></div>
           </div>
           <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition"><div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Clock size={32}/></div><h3 className="font-bold text-xl mb-2">สมัครได้ 24 ชั่วโมง</h3><p className="text-gray-500">ไม่เว้นวันหยุดราชการ กรอกข้อมูลและส่งเอกสารผ่านระบบออนไลน์ได้ทันที</p></div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition"><div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600"><Monitor size={32}/></div><h3 className="font-bold text-xl mb-2">ติดตามสถานะออนไลน์</h3><p className="text-gray-500">ตรวจสอบผลการสมัคร สถานะเอกสาร และประกาศรายชื่อผู้มีสิทธิ์สอบผ่านหน้าเว็บ</p></div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition"><div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600"><FileCheck size={32}/></div><h3 className="font-bold text-xl mb-2">โปร่งใส ตรวจสอบได้</h3><p className="text-gray-500">กระบวนการคัดเลือกเป็นไปตามระเบียบราชการ มั่นใจได้ในความยุติธรรม</p></div>
              </div>
           </div>
           <footer className="w-full bg-white py-8 border-t text-center text-gray-400 text-sm">
              <div className="mb-4 font-bold text-gray-600">พัฒนาโดย: กองการเจ้าหน้าที่ (งาน HR) และ นักวิชาการคอมพิวเตอร์<br/>"ขับเคลื่อนองค์กรด้วยนวัตกรรม บริการประชาชนด้วยหัวใจ"</div>
              <p className="mb-2">© 2025 เทศบาลเมืองอุทัยธานี</p>
              <button onClick={()=>{setBackdoorCount(p=>p+1); if(backdoorCount+1>=5){setShowAdminModal(true); setBackdoorCount(0);}}} className="flex items-center gap-1 mx-auto hover:text-emerald-600 opacity-50 hover:opacity-100 transition"><Settings size={12}/> สำหรับเจ้าหน้าที่</button>
           </footer>
        </div>
      )}

      {/* 2. USER DASHBOARD */}
      {view === 'user_dash' && (
        <div className="container mx-auto p-6 max-w-5xl">
           <div className="mb-8"><h2 className="text-2xl font-bold text-gray-800">ยินดีต้อนรับ, <span className="text-emerald-600">{currentUser.firstName}</span></h2><p className="text-gray-500">จัดการใบสมัครและติดตามสถานะของคุณได้ที่นี่</p></div>
           {!formData.submissionId ? (
               <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                   <div className="bg-emerald-600 p-6 text-white flex justify-between items-center"><h3 className="text-xl font-bold flex gap-2"><Briefcase/> ตำแหน่งที่เปิดรับสมัคร</h3><div className="flex gap-2"><select className="text-gray-800 text-sm rounded px-3 py-1" onChange={e=>setPosFilter(e.target.value)}><option value="all">ทั้งหมด</option><option value="พนักงานเทศบาล">พนักงานเทศบาล</option><option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option><option value="พนักงานจ้าง">พนักงานจ้าง</option></select></div></div>
                   <div className="p-6 grid gap-4">
                       <div className="relative mb-4"><Search className="absolute left-3 top-3 text-gray-400" size={20}/><input placeholder="ค้นหาตำแหน่งงาน..." className="w-full pl-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e=>setSearchTerm(e.target.value)}/></div>
                       {positions.length > 0 ? positions.filter(p=>(posFilter==='all'||p.category===posFilter)&&p.name.includes(searchTerm)).map(p=>(
                           <div key={p.id} className="border rounded-xl p-5 hover:border-emerald-400 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
                               <div><div className="flex items-center gap-2 mb-1"><h4 className="font-bold text-lg text-gray-800">{p.name}</h4><span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 border">{translateType(p.type)}</span></div><p className="text-sm text-gray-500 mb-2">{p.division}</p><div className="flex flex-wrap gap-3 text-xs text-emerald-700"><span className="bg-emerald-50 px-2 py-1 rounded flex items-center gap-1"><User size={12}/> รับ: {p.degree}</span><span className="bg-emerald-50 px-2 py-1 rounded flex items-center gap-1"><Calendar size={12}/> {p.dateOpen} - {p.dateClose}</span></div></div>
                               <div className="flex gap-2 w-full md:w-auto"><button onClick={()=>setSelectedJob(p)} className="flex-1 md:flex-none border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-50 text-center">รายละเอียด</button><button onClick={()=>{setFormData({...initialFormData, selectedPositionId: p.id, displayPosition: p.name, displayDivision: p.division, displayCategory: p.category, firstName: currentUser.firstName, lastName: currentUser.lastName, idCardNumber: currentUser.idCardNumber, address:{...initialFormData.address, phone:currentUser.phoneNumber}, contactAddress:{...initialFormData.contactAddress, phone:currentUser.phoneNumber} }); setView('form');}} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-lg hover:shadow-xl transition">สมัครสอบ</button></div>
                           </div>
                       )) : <div className="text-center py-12 text-gray-400">ไม่มีตำแหน่งที่เปิดรับในขณะนี้</div>}
                   </div>
               </div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
                      <div className="flex justify-between items-start mb-6"><div><div className="text-sm text-gray-500 mb-1">ตำแหน่งที่สมัคร</div><h2 className="text-2xl font-bold text-gray-800">{formData.displayPosition}</h2><p className="text-sm text-gray-500">{formData.displayDivision}</p></div><div className={`px-4 py-1 rounded-full text-sm font-bold ${formData.status==='eligible'?'bg-purple-100 text-purple-700':formData.status==='approved'?'bg-green-100 text-green-700':formData.status==='submitted'?'bg-blue-100 text-blue-700':'bg-gray-200 text-gray-600'}`}>{formData.status==='draft'?'แบบร่าง':formData.status==='submitted'?'รอตรวจสอบ':formData.status==='approved'?'เอกสารครบ':formData.status==='eligible'?'มีสิทธิ์สอบ':'แจ้งแก้ไข'}</div></div>
                      <div className="relative py-4 px-4 mb-6"><div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded"></div><div className={`absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 rounded transition-all duration-500`} style={{width: formData.status==='eligible'?'100%':formData.status==='approved'?'66%':'33%'}}></div><div className="flex justify-between"><div className="flex flex-col items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${['submitted','approved','eligible'].includes(formData.status)?'bg-emerald-500':'bg-gray-300'}`}>1</div><span className="text-xs">ยื่นใบสมัคร</span></div><div className="flex flex-col items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${['approved','eligible'].includes(formData.status)?'bg-emerald-500':'bg-gray-300'}`}>2</div><span className="text-xs">ตรวจสอบ</span></div><div className="flex flex-col items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${formData.status==='eligible'?'bg-emerald-500':'bg-gray-300'}`}>3</div><span className="text-xs">ประกาศผล</span></div></div></div>
                      {formData.status === 'correction' && <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 flex gap-3 items-start"><AlertTriangle className="shrink-0"/> <div><strong>แจ้งแก้ไข:</strong> {formData.adminFeedback}</div></div>}
                      <div className="flex flex-wrap gap-3">{['draft','correction'].includes(formData.status) && <button onClick={()=>setView('form')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-emerald-700 flex items-center gap-2"><Edit size={18}/> แก้ไขใบสมัคร</button>}{['submitted','approved','eligible'].includes(formData.status) && <button onClick={()=>{setPrintMode('application'); setView('print');}} className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2"><Printer size={18}/> พิมพ์ใบสมัคร</button>}{formData.status==='eligible' && <button onClick={()=>{setPrintMode('examCard'); setView('print');}} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-purple-700 flex items-center gap-2"><Shield size={18}/> บัตรประจำตัวสอบ</button>}</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 h-fit"><h3 className="font-bold text-gray-700 mb-4">ข้อมูลผู้สมัคร</h3><div className="flex flex-col items-center mb-4"><div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden mb-2 border-2 border-white shadow">{formData.photoPreview||formData.photoUrl ? <img src={formData.photoPreview||formData.photoUrl} className="w-full h-full object-cover"/> : <User className="w-full h-full p-4 text-gray-300"/>}</div><div className="font-bold text-lg">{formData.prefix}{formData.firstName} {formData.lastName}</div><div className="text-xs text-gray-500">{formData.idCardNumber}</div></div><div className="space-y-2 text-sm text-gray-600"><div className="flex justify-between border-b pb-2"><span>อายุ:</span> <span>{calculateAge(formData.birthDate)} ปี</span></div><div className="flex justify-between border-b pb-2"><span>วุฒิ:</span> <span>{formData.education.degree}</span></div><div className="flex justify-between border-b pb-2"><span>เบอร์โทร:</span> <span>{formData.address.phone}</span></div></div></div>
               </div>
           )}
        </div>
      )}

      {/* 3. FORM VIEW */}
      {view === 'form' && (
         <div className="container mx-auto p-6">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto">
               <div className="bg-emerald-800 text-white p-4 flex justify-between items-center"><h2 className="text-lg font-bold flex gap-2"><FileText/> แบบฟอร์มใบสมัคร</h2><button onClick={()=>setView(currentUser.role==='admin'?'admin_dash':'user_dash')}><X/></button></div>
               <div className="p-8 space-y-8">
                  <section><h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">1. ข้อมูลการสมัคร</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-sm font-bold">ตำแหน่ง</label><select className="w-full border p-2 rounded" value={formData.selectedPositionId} onChange={e=>handlePositionSelect(e.target.value)} disabled={isLocked()}><option value="">-- เลือกตำแหน่ง --</option>{positions.map(p=><option key={p.id} value={p.id}>{p.name} ({p.division})</option>)}</select></div><div><label className="text-sm font-bold">ทราบข่าวจาก</label><select className="w-full border p-2 rounded" value={formData.newsSource} onChange={e=>handleInputChange('newsSource',e.target.value)} disabled={isLocked()}><option value="">-- เลือก --</option><option>Facebook เทศบาล</option><option>เว็บไซต์เทศบาล</option><option>ป้ายประชาสัมพันธ์</option><option>หอกระจายข่าว</option><option>หนังสือราชการ</option><option>เพื่อน/คนรู้จัก</option></select></div></div></section>
                  <section><h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">2. ประวัติส่วนตัว</h3><div className="flex flex-col md:flex-row gap-6"><div className="flex flex-col items-center gap-2"><div className="w-32 h-40 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded overflow-hidden relative">{formData.photoPreview ? <img src={formData.photoPreview} className="w-full h-full object-cover"/> : <span className="text-gray-400 text-xs">รูปถ่าย 1 นิ้ว</span>}{!isLocked() && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e=>handleFileUpload(e,'photoPreview')}/>}</div><span className="text-xs text-gray-500">คลิกเพื่ออัปโหลดรูป</span></div><div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs text-gray-500">คำนำหน้า</label><input className="w-full border p-2 rounded bg-gray-100" value={formData.prefix} readOnly/></div><div><label className="text-xs text-gray-500">วันเกิด</label><input type="date" className="w-full border p-2 rounded" value={formData.birthDate} onChange={e=>{handleInputChange('birthDate',e.target.value); handleInputChange('age', calculateAge(e.target.value))}} disabled={isLocked()}/></div><div><label className="text-xs text-gray-500">อายุ (ปี)</label><input className="w-full border p-2 rounded bg-gray-100" value={formData.age} readOnly/></div><div><label className="text-xs text-gray-500">ศาสนา</label><input className="w-full border p-2 rounded" value={formData.religion} onChange={e=>handleInputChange('religion',e.target.value)} disabled={isLocked()}/></div><div><label className="text-xs text-gray-500">ชื่อ</label><input className="w-full border p-2 rounded bg-gray-100" value={formData.firstName} readOnly/></div><div><label className="text-xs text-gray-500">นามสกุล</label><input className="w-full border p-2 rounded bg-gray-100" value={formData.lastName} readOnly/></div><div><label className="text-xs text-gray-500">สัญชาติ</label><input className="w-full border p-2 rounded" value={formData.nationality} onChange={e=>handleInputChange('nationality',e.target.value)} disabled={isLocked()}/></div><div><label className="text-xs text-gray-500">สถานภาพ</label><select className="w-full border p-2 rounded" value={formData.maritalStatus} onChange={e=>handleInputChange('maritalStatus',e.target.value)} disabled={isLocked()}><option>โสด</option><option>สมรส</option><option>หย่าร้าง</option></select></div></div></div></section>
                  <section><h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">3. ข้อมูลการติดต่อ</h3><div className="space-y-4"><div className="p-4 bg-slate-50 rounded border"><h4 className="font-bold text-sm mb-2 text-emerald-700">ที่อยู่ตามทะเบียนบ้าน</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm"><input placeholder="บ้านเลขที่" className="border p-2 rounded" value={formData.address.houseNo} onChange={e=>handleNestedChange('address','houseNo',e.target.value)} disabled={isLocked()}/><input placeholder="หมู่" className="border p-2 rounded" value={formData.address.moo} onChange={e=>handleNestedChange('address','moo',e.target.value)} disabled={isLocked()}/><input placeholder="ถนน" className="border p-2 rounded col-span-2" value={formData.address.road} onChange={e=>handleNestedChange('address','road',e.target.value)} disabled={isLocked()}/><input placeholder="ตำบล" className="border p-2 rounded" value={formData.address.subDistrict} onChange={e=>handleNestedChange('address','subDistrict',e.target.value)} disabled={isLocked()}/><input placeholder="อำเภอ" className="border p-2 rounded" value={formData.address.district} onChange={e=>handleNestedChange('address','district',e.target.value)} disabled={isLocked()}/><input placeholder="จังหวัด" className="border p-2 rounded" value={formData.address.province} onChange={e=>handleNestedChange('address','province',e.target.value)} disabled={isLocked()}/><input placeholder="รหัสไปรษณีย์" className="border p-2 rounded" value={formData.address.zipcode} onChange={e=>handleNestedChange('address','zipcode',e.target.value)} disabled={isLocked()}/><input placeholder="เบอร์โทรศัพท์" className="border p-2 rounded" value={formData.address.phone} onChange={e=>handleNestedChange('address','phone',e.target.value)} disabled={isLocked()}/></div></div><div className="flex items-center gap-2"><input type="checkbox" checked={formData.isSameAddress} onChange={e=>{if(!isLocked()) setFormData(p=>({...p, isSameAddress:e.target.checked, contactAddress:e.target.checked?{...p.address}:p.contactAddress}))}} disabled={isLocked()}/> <span className="text-sm">ที่อยู่ติดต่อเหมือนทะเบียนบ้าน</span></div>{!formData.isSameAddress && <div className="p-4 bg-slate-50 rounded border"><h4 className="font-bold text-sm mb-2 text-emerald-700">ที่อยู่ที่ติดต่อได้</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm"><input placeholder="บ้านเลขที่" className="border p-2 rounded" value={formData.contactAddress.houseNo} onChange={e=>handleNestedChange('contactAddress','houseNo',e.target.value)} disabled={isLocked()}/><input placeholder="หมู่" className="border p-2 rounded" value={formData.contactAddress.moo} onChange={e=>handleNestedChange('contactAddress','moo',e.target.value)} disabled={isLocked()}/><input placeholder="ถนน" className="border p-2 rounded col-span-2" value={formData.contactAddress.road} onChange={e=>handleNestedChange('contactAddress','road',e.target.value)} disabled={isLocked()}/><input placeholder="จังหวัด" className="border p-2 rounded" value={formData.contactAddress.province} onChange={e=>handleNestedChange('contactAddress','province',e.target.value)} disabled={isLocked()}/><input placeholder="รหัสไปรษณีย์" className="border p-2 rounded" value={formData.contactAddress.zipcode} onChange={e=>handleNestedChange('contactAddress','zipcode',e.target.value)} disabled={isLocked()}/><input placeholder="เบอร์โทรศัพท์" className="border p-2 rounded" value={formData.contactAddress.phone} onChange={e=>handleNestedChange('contactAddress','phone',e.target.value)} disabled={isLocked()}/></div></div>}</div></section>
                  <section><h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">4. ประวัติการศึกษาและทำงาน</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-500">วุฒิการศึกษา</label><input className="w-full border p-2 rounded" value={formData.education.degree} onChange={e=>handleNestedChange('education','degree',e.target.value)} disabled={isLocked()}/></div><div><label className="text-xs text-gray-500">สาขาวิชา</label><input className="w-full border p-2 rounded" value={formData.education.major} onChange={e=>handleNestedChange('education','major',e.target.value)} disabled={isLocked()}/></div><div className="md:col-span-2"><label className="text-xs text-gray-500">สถานศึกษา</label><input className="w-full border p-2 rounded" value={formData.education.institution} onChange={e=>handleNestedChange('education','institution',e.target.value)} disabled={isLocked()}/></div></div><div className="bg-slate-50 p-4 rounded border mb-4"><h4 className="font-bold text-sm mb-2">ภาค ก.</h4><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="partA" checked={formData.examPartA.passed} onChange={()=>!isLocked() && setFormData(p=>({...p, examPartA:{...p.examPartA, passed:true}}))}/> สอบผ่านแล้ว</label><label className="flex items-center gap-2"><input type="radio" name="partA" checked={!formData.examPartA.passed} onChange={()=>!isLocked() && setFormData(p=>({...p, examPartA:{...p.examPartA, passed:false}}))}/> ยังไม่ผ่าน</label></div></div><div className="mb-4"><label className="block text-sm font-bold mb-2">ทักษะภาษา ({formData.languageSkills.language})</label><input className="border p-1 rounded text-sm mb-2" placeholder="ระบุภาษา (เช่น อังกฤษ, จีน)" value={formData.languageSkills.language} onChange={e=>!isLocked() && setFormData(p=>({...p, languageSkills:{...p.languageSkills, language:e.target.value}}))}/><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{['listening','speaking','reading','writing'].map(k=><div key={k}><span className="text-xs capitalize text-gray-500">{k}</span><select className="w-full border p-1 rounded" value={formData.languageSkills[k]} onChange={e=>handleNestedChange('languageSkills',k,e.target.value)} disabled={isLocked()}><option>ดีมาก</option><option>ดี</option><option>พอใช้</option></select></div>)}</div></div></section>
                  <section><h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">5. ข้อมูลอื่นๆ</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-500">บุคคลติดต่อฉุกเฉิน (ชื่อ)</label><input className="w-full border p-2 rounded" value={formData.emergencyContact.name} onChange={e=>handleNestedChange('emergencyContact','name',e.target.value)} disabled={isLocked()}/></div><div><label className="text-xs text-gray-500">เบอร์โทร</label><input className="w-full border p-2 rounded" value={formData.emergencyContact.phone} onChange={e=>handleNestedChange('emergencyContact','phone',e.target.value)} disabled={isLocked()}/></div></div><div className="space-y-2 text-sm"><div className="flex items-center justify-between border p-2 rounded"><span>เคยต้องคดีอาญา?</span><div className="flex gap-2"><label><input type="radio" checked={formData.legalHistory.hasCase} onChange={()=>!isLocked() && setFormData(p=>({...p, legalHistory:{...p.legalHistory, hasCase:true}}))}/> เคย</label><label><input type="radio" checked={!formData.legalHistory.hasCase} onChange={()=>!isLocked() && setFormData(p=>({...p, legalHistory:{...p.legalHistory, hasCase:false}}))}/> ไม่เคย</label></div></div></div></section>
                  <SectionHeader title="6. เอกสารแนบ (PDPA)" icon={File} isOpen={activeSection===6} onClick={()=>setActiveSection(activeSection===6?null:6)}/>{activeSection===6&&( <div className="space-y-3 p-4 bg-slate-50 rounded"><div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm mb-4"><h4 className="font-bold text-yellow-800 mb-2">คำชี้แจงและเงื่อนไข:</h4><ul className="list-disc list-inside text-yellow-700 space-y-1"><li>ผู้สมัครต้องกรอกข้อมูลให้ครบถ้วนและเป็นความจริง</li><li>เอกสารแนบจะถูกเก็บรักษาตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล</li><li>หากมีไฟล์ขนาดใหญ่ แนะนำให้นำฝากไว้ที่ Google Drive แล้วนำลิงก์มาแปะ</li></ul></div><div className="space-y-3">{[{k:'idCard',l:'สำเนาบัตรประชาชน'},{k:'houseReg',l:'สำเนาทะเบียนบ้าน'},{k:'education',l:'สำเนาวุฒิการศึกษา'},{k:'medical',l:'ใบรับรองแพทย์'},{k:'other',l:'เอกสารอื่นๆ (ถ้ามี)'}].map(d=>(<div key={d.k} className="bg-white p-3 rounded border flex flex-col md:flex-row gap-3 items-center"><div className="flex-1 font-bold text-sm flex items-center gap-2">{d.l} {formData.attachments[d.k].checked && <CheckCircle size={16} className="text-green-500"/>}</div><div className="flex-1 w-full"><input placeholder="วางลิงก์ URL ที่นี่..." className="w-full border p-1 rounded text-sm" value={formData.attachments[d.k].link} onChange={e=>!isLocked() && setFormData(p=>({...p, attachments:{...p.attachments, [d.k]:{...p.attachments[d.k], checked:!!e.target.value, link:e.target.value}}}))}/></div><div className="text-xs text-gray-400">หรือ</div><label className="cursor-pointer bg-gray-100 border px-3 py-1 rounded text-xs hover:bg-gray-200 flex items-center gap-1"><Upload size={12}/> อัปโหลดไฟล์ <input type="file" hidden onChange={e=>handleFileUpload(e,d.k)}/></label></div>))}</div></div>)}
                  {!isLocked() && (<div className="pt-6 border-t flex justify-between items-center"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4" checked={formData.termsAccepted} onChange={e=>handleInputChange('termsAccepted',e.target.checked)}/> ข้าพเจ้ายอมรับเงื่อนไขการสมัคร</label><div className="flex gap-2"><button onClick={handleSaveDraft} className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-50 font-bold">บันทึกแบบร่าง</button><button onClick={handleSubmitApplication} className="px-6 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg">ส่งใบสมัคร</button></div></div>)}
               </div>
            </div>
         </div>
      )}

      {/* 4. ADMIN DASHBOARD VIEW */}
      {view === 'admin_dash' && (
         <div className="container mx-auto p-6">
            <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
               <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการผู้สมัคร (Admin)</h1>
               <div className="flex gap-2">
                  <button onClick={()=>setAdminView('dashboard')} className={`px-4 py-2 rounded-lg font-bold ${adminView==='dashboard'?'bg-emerald-100 text-emerald-800':'text-gray-600'}`}>ภาพรวม</button>
                  <button onClick={()=>setAdminView('positions')} className={`px-4 py-2 rounded-lg font-bold ${adminView==='positions'?'bg-emerald-100 text-emerald-800':'text-gray-600'}`}>จัดการตำแหน่ง</button>
                  <button onClick={()=>setAdminView('admins')} className={`px-4 py-2 rounded-lg font-bold ${adminView==='admins'?'bg-emerald-100 text-emerald-800':'text-gray-600'}`}>ผู้ดูแล</button>
                  <button onClick={handleLogout} className="px-4 py-2 rounded-lg font-bold bg-gray-800 text-white">ออก</button>
               </div>
            </header>
            
            {adminView === 'dashboard' && (
               <>
                  <div className="flex justify-end mb-4 gap-2"><button onClick={()=>setApplicantViewMode('card')}><Grid/></button><button onClick={()=>setApplicantViewMode('table')}><List/></button><button onClick={exportCSV} className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"><Download size={16}/> Export CSV</button></div>
                  {applicantViewMode === 'table' ? (
                    <div className="bg-white rounded-xl shadow overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 text-gray-600 border-b"><tr><th className="p-4">ชื่อ-สกุล</th><th className="p-4">ตำแหน่ง</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr></thead><tbody className="divide-y">{filteredApplicants.map((app, i) => (<tr key={i} className="hover:bg-slate-50"><td className="p-4 font-bold">{app.prefix}{app.firstName} {app.lastName}</td><td className="p-4 text-sm">{app.displayPosition}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs ${app.status==='submitted'?'bg-orange-100':app.status==='approved'?'bg-green-100':'bg-gray-100'}`}>{app.status}</span></td><td className="p-4 flex gap-2"><button onClick={()=>{setFormData(app); setView('form');}} className="text-blue-600 font-bold">ตรวจสอบ</button><button onClick={()=>handleDeleteApplicant(app.idCardNumber)} className="text-red-500"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{filteredApplicants.map((app,i)=>(<div key={i} className="bg-white p-4 rounded shadow hover:shadow-md"><div className="flex justify-between"><div className="font-bold">{app.firstName} {app.lastName}</div><button onClick={()=>handleDeleteApplicant(app.idCardNumber)} className="text-red-500"><Trash2 size={14}/></button></div><div className="text-sm text-gray-500">{app.displayPosition}</div><div className="mt-2 flex justify-between"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{app.status}</span><button onClick={()=>{setFormData(app); setView('form');}} className="text-blue-600 text-xs font-bold">ตรวจสอบ</button></div></div>))}</div>
                  )}
               </>
            )}

            {adminView === 'positions' && (
               <div className="bg-white p-6 rounded-xl shadow">
                  <h3 className="font-bold text-lg mb-4">เพิ่ม/แก้ไข ตำแหน่งงาน</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-4 rounded-lg border">
                     <input placeholder="ชื่อตำแหน่ง" className="border p-2 rounded" value={newPos.name} onChange={e=>setNewPos({...newPos, name:e.target.value})}/>
                     <input placeholder="สังกัด" className="border p-2 rounded" value={newPos.division} onChange={e=>setNewPos({...newPos, division:e.target.value})}/>
                     <div className="flex gap-2">
                         <select className="border p-2 rounded flex-1" value={newPos.category} onChange={e=>setNewPos({...newPos, category:e.target.value})}><option value="พนักงานเทศบาล">พนักงานเทศบาล</option><option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option><option value="พนักงานจ้าง">พนักงานจ้าง</option></select>
                         <select className="border p-2 rounded flex-1" value={newPos.subCategory} onChange={e=>setNewPos({...newPos, subCategory:e.target.value})}>
                             {newPos.category==='พนักงานเทศบาล' && <><option value="แท่งทั่วไป">แท่งทั่วไป</option><option value="แท่งวิชาการ">แท่งวิชาการ</option><option value="แท่งอำนวยการ">แท่งอำนวยการ</option></>}
                             {newPos.category==='พนักงานจ้าง' && <><option value="ทั่วไป">ทั่วไป</option><option value="ตามภารกิจ">ตามภารกิจ</option></>}
                             {newPos.category==='ลูกจ้างประจำ' && <option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option>}
                         </select>
                     </div>
                     <input placeholder="วุฒิการศึกษา" className="border p-2 rounded" value={newPos.degree} onChange={e=>setNewPos({...newPos, degree:e.target.value})}/>
                     <input placeholder="อายุ (เช่น 20-35 ปี)" className="border p-2 rounded" value={newPos.age} onChange={e=>setNewPos({...newPos, age:e.target.value})}/>
                     <input placeholder="ประสบการณ์" className="border p-2 rounded" value={newPos.exp} onChange={e=>setNewPos({...newPos, exp:e.target.value})}/>
                     <div className="col-span-2 grid grid-cols-2 gap-4">
                         <div><span className="text-xs text-gray-500">วันเริ่มรับสมัคร</span><input type="date" className="border p-2 rounded w-full" value={newPos.dateOpen} onChange={e=>setNewPos({...newPos, dateOpen:e.target.value})}/></div>
                         <div><span className="text-xs text-gray-500">วันปิดรับสมัคร</span><input type="date" className="border p-2 rounded w-full" value={newPos.dateClose} onChange={e=>setNewPos({...newPos, dateClose:e.target.value})}/></div>
                     </div>
                     <textarea placeholder="คุณสมบัติผู้สมัคร" className="col-span-2 border p-2 rounded h-20" value={newPos.qualifications} onChange={e=>setNewPos({...newPos, qualifications:e.target.value})}/>
                     <textarea placeholder="เอกสารประกอบการสมัคร" className="col-span-2 border p-2 rounded h-20" value={newPos.documents} onChange={e=>setNewPos({...newPos, documents:e.target.value})}/>
                     <textarea placeholder="หมายเหตุ" className="col-span-2 border p-2 rounded h-20" value={newPos.notes} onChange={e=>setNewPos({...newPos, notes:e.target.value})}/>
                     <input placeholder="ลิงก์ PDF ประกาศ" className="border p-2 rounded col-span-2" value={newPos.pdfUrl} onChange={e=>setNewPos({...newPos, pdfUrl:e.target.value})}/>
                     <button onClick={()=>handleManagePosition(editingPosId ? 'edit' : 'add', newPos)} className="col-span-2 bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700">{editingPosId ? 'บันทึกแก้ไข' : 'เพิ่มตำแหน่ง'}</button>
                     {editingPosId && <button onClick={()=>{setEditingPosId(null); setNewPos({ category: 'พนักงานจ้าง', subCategory: 'ทั่วไป', name: '', division: '', desc: '', degree: '', age: '', exp: '', dateOpen: '', dateClose: '', pdfUrl: '', qualifications: '', documents: '', notes: '' });}} className="col-span-2 text-gray-500 text-sm">ยกเลิกแก้ไข</button>}
                  </div>
                  <div className="space-y-3">{positions.map(p=>(<div key={p.id} className="flex justify-between items-center border p-3 rounded hover:bg-gray-50"><div><div className="font-bold">{p.name}</div><div className="text-xs text-gray-500">{p.category} ({p.subCategory})</div></div><div className="flex gap-2"><button onClick={()=>startEditPosition(p)} className="text-blue-500"><Edit size={18}/></button><button onClick={()=>handleManagePosition('delete', p)} className="text-red-500"><Trash2 size={18}/></button></div></div>))}</div>
               </div>
            )}

            {adminView === 'admins' && (
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="font-bold mb-4">จัดการผู้ดูแลระบบ</h3>
                    <div className="flex gap-2 mb-4"><input placeholder="ชื่อจริง" className="border p-2 rounded" value={newAdmin.firstName} onChange={e=>setNewAdmin({...newAdmin, firstName:e.target.value})}/><input placeholder="นามสกุล" className="border p-2 rounded" value={newAdmin.lastName} onChange={e=>setNewAdmin({...newAdmin, lastName:e.target.value})}/><input placeholder="เลขบัตร (Username)" className="border p-2 rounded" value={newAdmin.idCardNumber} onChange={e=>setNewAdmin({...newAdmin, idCardNumber:e.target.value})}/><input placeholder="เบอร์โทร (Password)" className="border p-2 rounded" value={newAdmin.phoneNumber} onChange={e=>setNewAdmin({...newAdmin, phoneNumber:e.target.value})}/><button onClick={handleAddAdmin} className="bg-emerald-600 text-white px-4 rounded flex items-center gap-1"><UserPlus size={16}/> เพิ่ม</button></div>
                    <div className="space-y-2">{adminList.map((a,i)=>(<div key={i} className="flex justify-between border p-2 rounded"><span>{a.firstName} {a.lastName} ({a.idCardNumber})</span><button onClick={()=>handleDeleteAdmin(a.idCardNumber)} className="text-red-500"><UserMinus size={16}/></button></div>))}</div>
                </div>
            )}
         </div>
      )}

      {/* 5. LOGIN & REGISTER VIEW */}
      {(view === 'login' || view === 'register') && (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
           <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-bold text-center mb-6">{view==='login'?'เข้าสู่ระบบ':'ลงทะเบียน'}</h2>
              <form onSubmit={view==='login'?handleLogin:handleRegister} className="space-y-4">
                 {view==='register' && <div className="grid grid-cols-4 gap-2"><select name="prefix" className="border p-2 rounded"><option>นาย</option><option>นาง</option><option>นางสาว</option></select><input name="fname" placeholder="ชื่อ" className="col-span-3 border p-2 rounded" required/></div>}
                 {view==='register' && <input name="lname" placeholder="นามสกุล" className="w-full border p-2 rounded" required/>}
                 <input name="idCard" placeholder="เลขบัตรประชาชน" className="w-full border p-3 rounded text-center" required/>
                 <input name="phone" type="password" placeholder="เบอร์โทรศัพท์" className="w-full border p-3 rounded text-center" required/>
                 {view==='register' && <input name="email" type="email" placeholder="อีเมล (ถ้ามี)" className="w-full border p-2 rounded"/>}
                 <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded font-bold">ยืนยัน</button>
                 <button type="button" onClick={()=>setView('landing')} className="w-full text-center text-sm text-gray-500 mt-2">กลับหน้าหลัก</button>
              </form>
           </div>
        </div>
      )}

      {/* 6. PRINT VIEW - EXAM CARD ONLY */}
      {view === 'print' && (
        <div className="w-full h-screen bg-white flex justify-center items-start p-8 overflow-auto print:p-0 print:overflow-visible">
             <style>{`@media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; } .no-print { display: none; } }`}</style>
             <div className="fixed top-4 right-4 flex gap-2 no-print">
                <button onClick={()=>window.print()} className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2"><Printer/> พิมพ์</button>
                <button onClick={()=>setView('user_dash')} className="bg-gray-500 text-white px-4 py-2 rounded shadow">ปิด</button>
             </div>

             {/* *** EXAM CARD LAYOUT *** */}
             {printMode === 'examCard' ? (
                <div className="print-area w-[210mm] min-h-[297mm] p-[10mm]">
                    <div className="grid grid-cols-1 gap-8"> 
                        {/* การ์ดบัตรสอบ (ทำซ้ำ 2 ใบใน 1 หน้า A4 เพื่อประหยัดกระดาษ หรือทำใบเดียวใหญ่ๆ ตามชอบ) */}
                        <div className="border-2 border-black p-6 h-[14cm] relative bg-white">
                            <div className="absolute top-6 right-6 w-[3cm] h-[4cm] border border-black flex items-center justify-center bg-gray-100">
                                {formData.photoPreview || formData.photoUrl ? <img src={formData.photoPreview || formData.photoUrl} className="w-full h-full object-cover"/> : "รูปถ่าย 1 นิ้ว"}
                            </div>
                            
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-20 h-20"><img src={LOGO_URL} className="w-full h-full object-contain"/></div>
                                <div className="pt-2">
                                    <h1 className="font-bold text-2xl text-black">บัตรประจำตัวผู้เข้าสอบ</h1>
                                    <h2 className="font-bold text-xl text-black">เทศบาลเมืองอุทัยธานี</h2>
                                </div>
                            </div>

                            <div className="space-y-4 text-[18px] leading-relaxed text-black font-sarabun pl-4 w-[70%]">
                                <div className="flex items-end gap-2">
                                    <span className="font-bold">เลขประจำตัวสอบ:</span> 
                                    <span className="text-2xl font-bold tracking-widest border-b-2 border-dotted border-black px-4">{formData.examId || "-"}</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="font-bold">ชื่อ-สกุล:</span> 
                                    <span className="border-b border-dotted border-black flex-1">{formData.prefix}{formData.firstName} {formData.lastName}</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="font-bold">สมัครสอบตำแหน่ง:</span> 
                                    <span className="border-b border-dotted border-black flex-1">{formData.displayPosition}</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="font-bold">สนามสอบ:</span> 
                                    <span className="border-b border-dotted border-black flex-1">โรงเรียนเทศบาลเมืองอุทัยธานี</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="font-bold">วัน-เวลาสอบ:</span> 
                                    <span className="border-b border-dotted border-black flex-1">ตามประกาศกำหนดการสอบ</span>
                                </div>
                            </div>

                            <div className="absolute bottom-10 right-10 text-center w-[7cm]">
                                <div className="border-b border-dotted border-black h-10"></div>
                                <div className="text-base mt-2 font-bold">(ลงชื่อ) ....................................................</div>
                                <div className="text-sm">กรรมการคุมสอบ</div>
                            </div>
                        </div>
                    </div>
                </div>
             ) : (
               /* Application Form Preview (เหมือนเดิม) */
               <div className="print-area w-[210mm] min-h-[297mm] p-[20mm]">
                   {/* Header */}
                   <div className="flex justify-between items-start mb-4">
                       <div className="w-[3cm]"><img src={LOGO_URL} className="w-full"/></div>
                       <div className="flex-1 text-center pt-2"><h1 className="font-bold text-xl text-black">ใบสมัครพนักงานจ้าง</h1><h2 className="font-bold text-lg text-black">เทศบาลเมืองอุทัยธานี</h2></div>
                       <div className="w-[3cm] h-[4cm] border border-black flex items-center justify-center bg-gray-50 overflow-hidden">{formData.photoPreview||formData.photoUrl?<img src={formData.photoPreview||formData.photoUrl} className="w-full h-full object-cover"/>:<span className="text-xs text-gray-400">รูปถ่าย 1 นิ้ว</span>}</div>
                   </div>
                   {/* Content */}
                   <div className="space-y-1 text-[16px] leading-normal text-black font-sarabun mt-4 relative z-0">
                       <div className="flex items-end"><span className="w-20">ชื่อ-สกุล</span><DottedLine text={`${formData.prefix} ${formData.firstName} ${formData.lastName}`}/></div>
                       <div className="flex items-end"><span className="w-20">เกิดวันที่</span><DottedLine text={getThaiDate(formData.birthDate).day + " " + getThaiDate(formData.birthDate).month + " " + getThaiDate(formData.birthDate).year} /><span className="mx-2">อายุ</span><DottedLine text={formData.age} width="w-10"/><span className="mx-2">สัญชาติ</span><DottedLine text={formData.nationality} /><span className="mx-2">ศาสนา</span><DottedLine text={formData.religion}/></div>
                       <div className="flex items-end"><span className="w-20">ที่อยู่</span><DottedLine text={`${formData.address.houseNo} ${formData.address.subDistrict} ${formData.address.province} ${formData.address.zipcode}`}/></div>
                       <div className="flex items-end"><span className="w-20">โทรศัพท์</span><DottedLine text={formData.address.phone}/></div>
                       <div className="mt-4 font-bold underline">ประวัติครอบครัว</div>
                       <div className="flex items-end"><span>บิดา:</span><DottedLine text={formData.fatherName}/><span>อาชีพ:</span><DottedLine text={formData.fatherOccupation}/></div>
                       <div className="flex items-end"><span>มารดา:</span><DottedLine text={formData.motherName}/><span>อาชีพ:</span><DottedLine text={formData.motherOccupation}/></div>
                       <div className="mt-4 font-bold underline">การศึกษา</div>
                       <div className="flex items-end"><span>วุฒิสูงสุด:</span><DottedLine text={formData.education.degree}/><span>สาขา:</span><DottedLine text={formData.education.major}/></div>
                       <div className="flex items-end"><span>สถาบัน:</span><DottedLine text={formData.education.institution}/></div>
                       <div className="mt-4 font-bold underline">การสมัคร</div>
                       <div className="flex items-center gap-4"><span className="font-bold">ตำแหน่ง:</span> <span className="text-lg underline">{formData.displayPosition}</span></div>
                       <div className="mt-10 flex justify-between items-end"><div className="border border-black p-3 w-[8cm] h-[3.5cm] flex flex-col justify-between text-xs"><div className="font-bold underline text-center">สำหรับเจ้าหน้าที่</div><div>สถานะ: {formData.status==='approved'?'☑ เอกสารครบ':'☐ เอกสารครบ'}</div><div className="flex items-end">ลงชื่อ:<DottedLine/></div></div><div className="w-[8cm] text-center flex flex-col gap-4"><div>ข้าพเจ้าขอรับรองว่าข้อมูลข้างต้นเป็นความจริง</div><div className="flex items-end gap-2 justify-center mt-4">ลงชื่อ<DottedLine width="w-32"/>ผู้สมัคร</div><div>({formData.prefix}{formData.firstName} {formData.lastName})</div></div></div>
                   </div>
               </div>
             )}
        </div>
      )}

    </div>
  );
}