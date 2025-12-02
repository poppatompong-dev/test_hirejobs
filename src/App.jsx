import React, { useState, useEffect } from 'react';
import { Printer, FileText, User, MapPin, Briefcase, Upload, ChevronDown, ChevronUp, X, CheckCircle, Image as ImageIcon, File, Shield, AlertCircle, Send, Check, Settings, Key, Loader2, WifiOff, Plus, Trash2, Search, Edit, LogOut, LogIn, Download, RefreshCw } from 'lucide-react';

// --- CONFIGURATION ---
// ✅ URL นี้คือ Backend ของคุณที่เชื่อมต่อกับ Google Sheets
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKgsNXof0BLv858SsWKCqRgykSSQsFpL2nsi0PhzvIou8R3Kk1cO-8kZE-Wgr32cay/exec"; 
const LOGO_URL = "https://img5.pic.in.th/file/secure-sv1/Logof9c59c62588ec6ab.png";

export default function App() {
  // --- STATE ---
  const [role, setRole] = useState('guest'); 
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showApplicantLogin, setShowApplicantLogin] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [applicantIdCardLogin, setApplicantIdCardLogin] = useState('');
  const [backdoorCount, setBackdoorCount] = useState(0);
  const [loading, setLoading] = useState(false); 
  
  // Admin Dashboard State
  const [adminView, setAdminView] = useState('dashboard'); 
  const [applicantList, setApplicantList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 

  // Position Management
  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('uthai_jobs_positions');
      return saved ? JSON.parse(saved) : [
        { id: 1, type: 'mission', name: 'ผู้ช่วยนักจัดการงานทั่วไป', division: 'สำนักปลัดเทศบาล', missionType: 'qualified' },
        { id: 2, type: 'mission', name: 'ผู้ช่วยนายช่างโยธา', division: 'กองช่าง', missionType: 'skilled' },
        { id: 3, type: 'general', name: 'พนักงานขับรถขยะ', division: 'กองสาธารณสุขฯ', missionType: null },
        { id: 4, type: 'general', name: 'คนงานทั่วไป', division: 'กองช่าง', missionType: null },
      ];
    } catch (e) { return []; }
  });

  const [showPosManager, setShowPosManager] = useState(false);
  const [showVerifyPanel, setShowVerifyPanel] = useState(false);
  const [newPos, setNewPos] = useState({ type: 'mission', name: '', division: '', missionType: 'qualified' });

  // Form Data Template
  const initialFormData = {
    prefix: 'นาย', firstName: 'ตัวอย่าง', lastName: 'รักงาน', nationality: 'ไทย', birthDate: '1995-05-20',
    photoPreview: null, photoFile: null, 
    address: { houseNo: '99/9', moo: '1', road: 'รักชาติ', subDistrict: 'อุทัยใหม่', district: 'เมืองอุทัยธานี', province: 'อุทัยธานี', phone: '081-234-5678' },
    maritalStatus: 'single', spouseName: '-', spouseOccupation: '-', spouseWorkplace: '-',
    fatherName: 'นายบิดา มีสุข', fatherOccupation: 'เกษตรกร', fatherWorkplace: '-',
    motherName: 'นางมารดา มีสุข', motherOccupation: 'ค้าขาย', motherWorkplace: '-',
    education: { degree: 'ปริญญาตรี', major: 'รัฐประศาสนศาสตร์', institution: 'มหาวิทยาลัยราชภัฏนครสวรรค์' },
    prevWork: 'ธุรการ (ลูกจ้างชั่วคราว)', prevWorkPlace: 'อบต. ทุ่งนา',
    selectedPositionId: '', displayPosition: '', displayDivision: '', displayJobType: '', displayMissionType: '',
    idCardNumber: '', 
    status: 'draft',
    submissionId: '',
    submissionDate: null,
    approvalDate: null,
    adminFeedback: '',
    attachments: {
      houseReg: { checked: false, file: null, verified: null },
      idCard: { checked: false, file: null, verified: null },
      education: { checked: false, file: null, verified: null },
      medical: { checked: false, file: null, verified: null },
    }
  };

  const [formData, setFormData] = useState(initialFormData);
  const [activeSection, setActiveSection] = useState(1);
  
  const age = calculateAge(formData.birthDate);
  const today = new Date();
  const dateParts = { day: today.getDate(), month: today.toLocaleString('th-TH', { month: 'long' }), year: today.getFullYear() + 543 };

  // --- PERSISTENCE ---
  const getAllApplicants = () => {
      const saved = localStorage.getItem('uthai_jobs_applicants_db');
      return saved ? JSON.parse(saved) : {};
  };

  const saveApplicantToDB = (data) => {
      const db = getAllApplicants();
      const key = data.idCardNumber || 'TEMP_' + Date.now();
      db[key] = data; 
      localStorage.setItem('uthai_jobs_applicants_db', JSON.stringify(db));
      if (role === 'admin') refreshApplicantList();
  };

  const refreshApplicantList = () => {
      const db = getAllApplicants();
      const list = Object.values(db);
      list.sort((a, b) => new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0));
      setApplicantList(list);
  };

  // ✅ ฟังก์ชันใหม่: ดึงข้อมูลจาก Cloud (Google Sheets)
  const fetchApplicantsFromCloud = async () => {
    setLoading(true);
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            // เรียงลำดับข้อมูลตามวันที่ล่าสุด
            data.sort((a, b) => new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0));
            setApplicantList(data);
            
            // สำรองข้อมูลลง LocalStorage ด้วย (เพื่อให้มีข้อมูลดูตอนเน็ตหลุด)
            const newDb = {};
            data.forEach(app => newDb[app.idCardNumber] = app);
            localStorage.setItem('uthai_jobs_applicants_db', JSON.stringify(newDb));
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("ไม่สามารถดึงข้อมูลล่าสุดจากระบบออนไลน์ได้ (กำลังแสดงข้อมูลเก่าในเครื่อง)");
    } finally {
        setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('⚠️ คำเตือน: การล้างข้อมูลจะลบทั้งในเครื่องนี้ และใน Google Sheets!\nคุณแน่ใจหรือไม่?')) {
        setLoading(true);
        try {
             await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'clear' }),
                mode: 'no-cors'
            });
            localStorage.removeItem('uthai_jobs_applicants_db');
            setApplicantList([]);
            setFormData(initialFormData);
            alert('ส่งคำสั่งล้างข้อมูลเรียบร้อย');
        } catch (e) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ แต่ลบในเครื่องแล้ว');
            localStorage.removeItem('uthai_jobs_applicants_db');
            setApplicantList([]);
        } finally {
            setLoading(false);
        }
    }
  };

  const handleExportCSV = () => {
    const headers = ["วันที่สมัคร", "เลขบัตรประชาชน", "ชื่อ-นามสกุล", "ตำแหน่ง", "เบอร์โทร", "สถานะ"];
    const rows = filteredApplicants.map(app => [
        app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('th-TH') : '-',
        app.idCardNumber,
        `${app.prefix}${app.firstName} ${app.lastName}`,
        app.displayPosition,
        app.address.phone,
        app.status === 'approved' ? 'อนุมัติ' : app.status === 'submitted' ? 'รอตรวจสอบ' : 'แก้ไข'
    ]);
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "report_applicants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => { localStorage.setItem('uthai_jobs_positions', JSON.stringify(positions)); }, [positions]);
  
  // ✅ แก้ไข useEffect: ถ้าเป็น Admin ให้ดึงข้อมูลจาก Cloud เสมอ
  useEffect(() => { 
      if (role === 'admin') {
          refreshApplicantList(); // โหลดจากเครื่องก่อนเพื่อให้แสดงผลไว
          fetchApplicantsFromCloud(); // แล้วดึงข้อมูลจริงจาก Cloud มาทับ
      } 
  }, [role]);

  function calculateAge(birthDate) {
    if (!birthDate) return { years: 0, months: 0 };
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return { years: 0, months: 0 };
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) { years--; months += 12; }
    return { years, months };
  }
  
  function getThaiDate(dateObj) {
      if (!dateObj) return { day: '', month: '', year: '' };
      const d = new Date(dateObj); 
      if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
      return {
          day: d.getDate(),
          month: d.toLocaleString('th-TH', { month: 'long' }),
          year: d.getFullYear() + 543
      };
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve({ base64: base64, type: file.type, name: file.name });
      };
      reader.onerror = error => reject(error);
    });
  };

  // --- HANDLERS ---
  const handleApplicantLogin = (e) => {
      e.preventDefault();
      if (!applicantIdCardLogin || applicantIdCardLogin.length !== 13) return alert("กรุณากรอกเลขบัตรประชาชน 13 หลัก");
      
      setLoading(true);
      
      // ลองดึงข้อมูลล่าสุดจาก Cloud ก่อน Login
      fetch(GOOGLE_SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
             const user = data.find(u => u.idCardNumber === applicantIdCardLogin);
             if (user) {
                  setFormData(user);
                  setRole('applicant');
                  alert(`ยินดีต้อนรับคุณ ${user.firstName} ${user.lastName}`);
                  setShowApplicantLogin(false);
             } else {
                 // ถ้าไม่เจอใน Cloud ลองดูใน LocalStorage (เผื่อเพิ่งกรอกแต่เน็ตหลุด)
                 const db = getAllApplicants();
                 const localUser = db[applicantIdCardLogin];
                 if (localUser) {
                      setFormData(localUser);
                      setRole('applicant');
                      alert(`ยินดีต้อนรับคุณ ${localUser.firstName} ${localUser.lastName} (ข้อมูล Offline)`);
                      setShowApplicantLogin(false);
                 } else {
                      if(window.confirm("ไม่พบข้อมูลในระบบ ต้องการเริ่มกรอกใบสมัครใหม่หรือไม่?")) {
                          const newUserData = { ...initialFormData, idCardNumber: applicantIdCardLogin };
                          setFormData(newUserData);
                          setRole('applicant');
                          setShowApplicantLogin(false);
                      }
                 }
             }
        })
        .catch(() => {
             // ถ้าดึง Cloud ไม่ได้ ให้ใช้ LocalStorage
             const db = getAllApplicants();
             const user = db[applicantIdCardLogin];
             if (user) {
                  setFormData(user); 
                  setRole('applicant');
                  alert(`ยินดีต้อนรับคุณ ${user.firstName} ${user.lastName} (โหมด Offline)`);
                  setShowApplicantLogin(false);
             } else {
                  if(window.confirm("ไม่พบข้อมูลในระบบ (และเชื่อมต่อเซิร์ฟเวอร์ไม่ได้) ต้องการเริ่มกรอกใหม่หรือไม่?")) {
                      const newUserData = { ...initialFormData, idCardNumber: applicantIdCardLogin };
                      setFormData(newUserData);
                      setRole('applicant');
                      setShowApplicantLogin(false);
                  }
             }
        })
        .finally(() => setLoading(false));
  };

  const handleAdminLogin = (e) => { 
      e.preventDefault(); 
      if (loginPass === 'admin123') { 
          setRole('admin'); 
          setShowAdminLogin(false); 
          setLoginPass(''); 
          setAdminView('dashboard');
      } else { 
          alert('รหัสผ่านไม่ถูกต้อง'); 
      } 
  };

  const handleLogout = () => { 
      setRole('guest'); 
      setFormData(initialFormData);
      setShowPosManager(false); 
      setApplicantIdCardLogin('');
  };

  const handleLogoClick = () => { 
      if (role === 'admin') return; 
      const newCount = backdoorCount + 1; 
      setBackdoorCount(newCount); 
      if (newCount >= 5) { setShowAdminLogin(true); setBackdoorCount(0); } 
  };

  const handleInputChange = (f, v) => { 
      if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
      setFormData(p => ({ ...p, [f]: v })); 
  };
  const handleNestedChange = (p, f, v) => { 
      if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
      setFormData(prev => ({ ...prev, [p]: { ...prev[p], [f]: v } })); 
  };
  const handlePositionSelect = (id) => {
    if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
    const pos = positions.find(p => p.id.toString() === id.toString());
    if (pos) setFormData(prev => ({ ...prev, selectedPositionId: id, displayPosition: pos.name, displayDivision: pos.division, displayJobType: pos.type, displayMissionType: pos.missionType }));
    else setFormData(prev => ({ ...prev, selectedPositionId: '', displayPosition: '', displayDivision: '', displayJobType: '', displayMissionType: '' }));
  };
  const handleFileUpload = (e, type) => {
      if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
      const file = e.target.files[0];
      if (!file) return;
      if (type === 'photoPreview') setFormData(p => ({ ...p, photoPreview: URL.createObjectURL(file), photoFile: file }));
      else setFormData(p => ({ ...p, attachments: { ...p.attachments, [type]: { ...p.attachments[type], checked: true, file: file.name, verified: null } } }));
  };
  const removeFile = (type) => {
      if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
      if (type === 'photoPreview') setFormData(p => ({ ...p, photoPreview: null, photoFile: null }));
      else setFormData(p => ({ ...p, attachments: { ...p.attachments, [type]: { ...p.attachments[type], checked: false, file: null, verified: null } } }));
  };

  const handleSubmit = async () => {
    if (!formData.selectedPositionId) return alert('กรุณาเลือกตำแหน่งที่สมัคร');
    if (!formData.firstName || !formData.lastName) return alert('กรุณากรอกชื่อ-นามสกุล');
    
    let currentIdCard = formData.idCardNumber;
    if (!currentIdCard || currentIdCard.length !== 13) {
         currentIdCard = prompt("กรุณากรอกเลขบัตรประชาชน 13 หลัก เพื่อใช้ติดตามสถานะ:");
         if (!currentIdCard || currentIdCard.length !== 13) return alert("เลขบัตรประชาชนไม่ถูกต้อง");
    }
    
    if (window.confirm('ยืนยันการส่งใบสมัคร? ข้อมูลจะถูกบันทึกลงฐานข้อมูล')) {
      setLoading(true);
      try {
        let payload = { ...formData, idCardNumber: currentIdCard };
        if (formData.photoFile) {
            try {
                const photoData = await fileToBase64(formData.photoFile);
                payload.photoFile = photoData.base64; // ส่งเฉพาะ string base64
            } catch (e) { console.error("Photo Error", e); }
        } else { payload.photoFile = null; }

        const newSubmissionId = formData.submissionId || 'JOB-' + Math.floor(Math.random() * 10000);
        const subDate = new Date();
            
        const updatedFormData = {
            ...payload,
            status: 'submitted',
            submissionId: newSubmissionId,
            submissionDate: subDate.toISOString()
        };

        // บันทึกลงเครื่องก่อน
        saveApplicantToDB(updatedFormData);
        setFormData(updatedFormData);
        setActiveSection(null);
        
        // ส่งขึ้น Cloud
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(updatedFormData),
            mode: 'no-cors'
        })
        .then(() => alert(`ส่งใบสมัครเรียบร้อย! รหัส: ${newSubmissionId}`))
        .catch(err => {
            console.log("Online sync failed", err);
            alert(`บันทึกในเครื่องแล้ว แต่ส่งออนไลน์ไม่สำเร็จ (กรุณาแจ้งเจ้าหน้าที่) รหัส: ${newSubmissionId}`);
        });
            
      } catch (error) {
        console.error("Error", error);
        alert("เกิดข้อผิดพลาด");
      } finally { setLoading(false); }
    }
  };

  const verifyDoc = (key, status) => {
      setFormData(prev => ({
          ...prev,
          attachments: {
              ...prev.attachments,
              [key]: { ...prev.attachments[key], verified: status }
          }
      }));
  };

  const handleAdminAction = (action) => {
      let newStatus = action === 'approve' ? 'approved' : 'correction';
      let appDate = action === 'approve' ? new Date().toISOString() : null;
      
      if (action === 'reject' && !formData.adminFeedback) return alert('กรุณาระบุสิ่งที่ต้องแก้ไข');

      const updatedFormData = {
          ...formData,
          status: newStatus,
          approvalDate: appDate,
          adminFeedback: formData.adminFeedback 
      };

      // บันทึกลงเครื่อง
      saveApplicantToDB(updatedFormData);
      setFormData(updatedFormData); 
      
      // ส่งอัปเดตไปที่ Cloud (Google Sheets)
      // เราส่งข้อมูลทั้งหมดไปทับเลย เพื่อให้สถานะอัปเดต
      fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(updatedFormData),
            mode: 'no-cors'
      });

      alert(action === 'approve' ? 'อนุมัติใบสมัครแล้ว' : 'ส่งคืนให้ผู้สมัครแก้ไขแล้ว');
      setAdminView('dashboard'); 
  };

  const handleAdminSelectApplicant = (applicant) => {
      setFormData(applicant);
      setAdminView('detail');
  };

  const handleAdminFeedbackChange = (val) => {
      setFormData(prev => ({ ...prev, adminFeedback: val }));
  };

  const handleAddPosition = () => { 
    if (!newPos.name || !newPos.division) return alert('กรุณากรอกข้อมูลให้ครบ'); 
    const id = positions.length > 0 ? Math.max(...positions.map(p => p.id)) + 1 : 1; 
    setPositions([...positions, { ...newPos, id }]); 
    setNewPos({ type: 'mission', name: '', division: '', missionType: 'qualified' }); 
  };
  const handleDeletePosition = (id) => { 
    if (window.confirm('ยืนยันลบตำแหน่งนี้?')) { 
        const newPositions = positions.filter(p => p.id !== id);
        setPositions(newPositions); 
    } 
  };

  const filteredApplicants = applicantList.filter(app => {
      const matchesSearch = (app.firstName + app.lastName + (app.idCardNumber || '')).includes(searchTerm);
      const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
  });

   // --- UI COMPONENTS ---
  // ✅ แก้ไข: เพิ่มความสูงเป็น h-[28px], เปลี่ยน overflow-hidden เป็น overflow-visible, ปรับ leading
  const DottedLine = ({ text, width = 'flex-1', center = false }) => (
    <div className={`${width} border-b-[1px] border-dotted border-black relative h-[28px] flex items-end ${center ? 'justify-center' : 'justify-start'} px-1`}>
      <span className="text-blue-900 font-bold whitespace-nowrap overflow-visible leading-normal -translate-y-[2px]" style={{fontFamily: 'Sarabun, sans-serif', fontSize: '15px'}}>
        {typeof text === 'string' || typeof text === 'number' ? text : ''}
      </span>
    </div>
  );
  const RadioOption = ({ checked, label }) => (
    <div className="flex items-center gap-1 mr-3">
      <span className="text-[14px] font-sarabun text-black">{checked ? '☑' : '☐'}</span>
      <span className="text-[14px] font-sarabun text-black">{label}</span>
    </div>
  );
  const BoxOption = ({ checked, label }) => (
    <div className="flex items-start gap-1 mb-1">
      <div className="w-4 h-4 border border-black flex items-center justify-center relative bg-white shrink-0 mt-[2px]">
        {checked && <span className="text-black text-xs font-bold">✓</span>}
      </div>
      <span className="text-[14px] font-sarabun leading-tight ml-1">{label}</span>
    </div>
  );
  const SectionHeader = ({ title, icon: Icon, isOpen, onClick }) => (
    <div onClick={onClick} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b ${isOpen ? 'bg-emerald-50' : ''}`}>
      <div className="flex items-center gap-3">
        <Icon className="text-emerald-700" size={20}/>
        <span className="font-semibold text-gray-700">{title}</span>
      </div>
      {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
    </div>
  );

  const subDateDisplay = formData.submissionDate ? getThaiDate(formData.submissionDate) : { day: '', month: '', year: '' };
  const appDateDisplay = formData.approvalDate ? getThaiDate(formData.approvalDate) : { day: '', month: '', year: '' };

  return (
    <div className="min-h-screen bg-gray-100 font-sarabun text-gray-800 print:bg-white print:p-0" style={{ fontFamily: '"Sarabun", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        .font-sarabun { font-family: 'Sarabun', sans-serif; }
        @media print { 
            @page { size: A4 portrait; margin: 0.5cm; } 
            body { -webkit-print-color-adjust: exact; background: white; } 
            .no-print { display: none !important; } 
            .page-break { page-break-after: always; }
            .print-container { width: 100% !important; height: 100% !important; padding: 0px 30px !important; box-shadow: none !important; margin: 0 !important; }
            .print-scale { transform: scale(0.98); transform-origin: top center; }
        }
      `}</style>

      {(loading) && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex flex-col items-center justify-center text-white">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p>กำลังประมวลผล...</p>
        </div>
      )}

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="font-bold mb-4">Admin Access</h2>
            <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} className="border w-full p-2 mb-4"/>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setShowAdminLogin(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleAdminLogin} className="bg-emerald-600 text-white px-4 py-2 rounded">Login</button>
            </div>
          </div>
        </div>
      )}

      {showApplicantLogin && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-emerald-600">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600"><User size={32}/></div>
                      <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบผู้สมัคร</h2>
                  </div>
                  <form onSubmit={handleApplicantLogin} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประจำตัวประชาชน (13 หลัก)</label>
                          <input type="text" maxLength="13" value={applicantIdCardLogin} onChange={e => setApplicantIdCardLogin(e.target.value.replace(/[^0-9]/g, ''))} className="w-full border p-3 rounded-lg text-center text-lg tracking-widest" required/>
                      </div>
                      <div className="flex flex-col gap-3 pt-2">
                          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"><LogIn size={20}/> เข้าสู่ระบบ</button>
                          <button type="button" onClick={()=>setShowApplicantLogin(false)} className="w-full bg-white border border-gray-300 text-gray-600 py-2.5 rounded-lg">ยกเลิก</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-emerald-900 text-white p-3 sticky top-0 z-50 shadow-lg no-print flex justify-between items-center font-sarabun">
         <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="bg-white p-1 rounded-full border-2 border-emerald-700 w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src={LOGO_URL} className="w-full h-full object-contain" onError={(e)=>{e.target.style.display='none'}}/>
            </div>
            <div><h1 className="font-bold text-lg">ระบบรับสมัครพนักงานจ้าง</h1><p className="text-sm text-emerald-200">เทศบาลเมืองอุทัยธานี</p></div>
         </div>
         <div className="flex items-center gap-3">
            {role === 'guest' && (
                <button onClick={() => setShowApplicantLogin(true)} className="bg-white text-emerald-900 px-4 py-1.5 rounded-full text-sm font-bold shadow flex items-center gap-2"><User size={16}/> เข้าสู่ระบบผู้สมัคร</button>
            )}
            {role === 'applicant' && (
                <div className="flex items-center gap-3">
                    <span className="text-xs bg-emerald-800 px-3 py-1 rounded-full hidden md:inline-block">ผู้สมัคร: {formData.idCardNumber}</span>
                    {(formData.status === 'submitted' || formData.status === 'approved') && (
                        <button onClick={() => window.print()} className="bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-bold flex gap-2 items-center shadow hover:bg-yellow-500 transition"><Printer size={16}/> Print</button>
                    )}
                    <button onClick={handleLogout} className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"><LogOut size={14}/> ออก</button>
                </div>
            )}
            {role === 'admin' && (
                <div className="flex items-center gap-2">
                    {/* ปุ่มอัปเดตข้อมูล */}
                    <button onClick={fetchApplicantsFromCloud} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold shadow flex items-center gap-1"><RefreshCw size={14}/> อัปเดต</button>
                    <button onClick={() => {setAdminView('dashboard'); setShowPosManager(false);}} className={`p-2 rounded hover:bg-emerald-800 ${adminView==='dashboard' ? 'bg-emerald-700' : ''}`} title="รายชื่อ"><FileText size={18}/></button>
                    <button onClick={() => {setAdminView('settings');}} className={`p-2 rounded hover:bg-emerald-800 ${adminView==='settings' ? 'bg-emerald-700' : ''}`} title="ตั้งค่า"><Settings size={18}/></button>
                    <button onClick={handleLogout} className="bg-red-500 text-sm px-3 py-1.5 rounded font-bold">ออก</button>
                </div>
            )}
         </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto font-sarabun">
        
        {/* LEFT PANEL */}
        <div className={`lg:w-[420px] bg-white border-r h-[calc(100vh-60px)] overflow-y-auto no-print shadow-xl z-10 ${role==='admin' && adminView==='dashboard' ? 'w-full lg:w-full' : ''}`}>
           {/* Guest View */}
           {role === 'guest' && (
               <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-slate-50">
                   <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-pulse"><FileText size={48}/></div>
                   <h2 className="text-2xl font-bold text-gray-800 mb-2">ยินดีต้อนรับ</h2>
                   <p className="text-gray-600 mb-8">กรุณาเข้าสู่ระบบเพื่อสมัครงานหรือตรวจสอบสถานะ</p>
                   <button onClick={() => setShowApplicantLogin(true)} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition transform hover:scale-105 flex items-center gap-2"><LogIn size={20}/> เข้าสู่ระบบ / สมัครงาน</button>
               </div>
           )}

           {/* APPLICANT VIEW */}
           {role === 'applicant' && (
             <>
               <div className={`p-4 border-b ${formData.status==='draft'?'bg-gray-50':formData.status==='submitted'?'bg-blue-50':formData.status==='approved'?'bg-green-50':'bg-red-50'}`}>
                  <div className="font-bold text-base mb-2 uppercase tracking-wide flex items-center gap-2">
                    {formData.status==='draft'?<><FileText size={18} className="text-gray-600"/> สถานะ: กำลังกรอกข้อมูล</>:
                     formData.status==='submitted'?<><CheckCircle size={18} className="text-blue-600"/> สถานะ: รอตรวจสอบ</>:
                     formData.status==='approved'?<><CheckCircle size={18} className="text-green-600"/> สถานะ: อนุมัติแล้ว</>:
                     <><AlertCircle size={18} className="text-red-600"/> สถานะ: แก้ไขข้อมูล</>}
                  </div>
                  {formData.status==='draft' || formData.status === 'correction' ? (
                       <button onClick={handleSubmit} disabled={loading} className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition text-base disabled:opacity-50"><Send size={18}/> {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการส่งใบสมัคร'}</button>
                  ) : null}
                  {formData.status==='correction' && <div className="mt-2 p-3 bg-white border border-red-200 rounded-lg text-sm text-red-700 shadow-sm"><strong>สิ่งที่ต้องแก้ไข:</strong> {formData.adminFeedback}</div>}
               </div>
               
               <div className={formData.status === 'submitted' || formData.status === 'approved' ? 'opacity-60 pointer-events-none grayscale-[0.5]' : ''}>
                  {/* Form sections */}
                  <SectionHeader title="1. ข้อมูลส่วนตัว" icon={User} isOpen={activeSection===1} onClick={()=>setActiveSection(activeSection===1?null:1)}/>
                  {activeSection===1 && <div className="p-4 space-y-3 bg-slate-50/50">
                      <div className="flex gap-3 items-center bg-white p-3 rounded border border-emerald-100 shadow-sm">
                         <div className="w-[2.5cm] h-[3.25cm] bg-gray-200 rounded flex items-center justify-center overflow-hidden border border-gray-300 shrink-0">{formData.photoPreview?<img src={formData.photoPreview} className="w-full h-full object-cover"/>:<ImageIcon className="text-gray-400"/>}</div>
                         <label className="cursor-pointer bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-emerald-100 font-bold transition w-full text-center"><Upload size={16} className="inline mr-1"/> อัปโหลดรูป 1 นิ้ว <input type="file" hidden onChange={e=>handleFileUpload(e,'photoPreview')}/></label>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-base">
                         <input placeholder="คำนำหน้า" className="border p-2 rounded bg-white" value={formData.prefix} onChange={e=>handleInputChange('prefix',e.target.value)}/>
                         <input placeholder="สัญชาติ" className="border p-2 rounded bg-white" value={formData.nationality} onChange={e=>handleInputChange('nationality',e.target.value)}/>
                         <input placeholder="ชื่อจริง" className="border p-2 rounded col-span-2 bg-white" value={formData.firstName} onChange={e=>handleInputChange('firstName',e.target.value)}/>
                         <input placeholder="นามสกุล" className="border p-2 rounded col-span-2 bg-white" value={formData.lastName} onChange={e=>handleInputChange('lastName',e.target.value)}/>
                         <label className="text-sm text-gray-500 col-span-2">วันเกิด (เดือน/วัน/ปี ค.ศ.)</label>
                         <input type="date" className="border p-2 rounded col-span-2 bg-white" value={formData.birthDate} onChange={e=>handleInputChange('birthDate',e.target.value)}/>
                      </div>
                  </div>}

                  <SectionHeader title="2. ที่อยู่" icon={MapPin} isOpen={activeSection===2} onClick={()=>setActiveSection(activeSection===2?null:2)}/>
                  {activeSection===2 && <div className="p-4 grid grid-cols-2 gap-2 text-base bg-slate-50/50">
                      <input placeholder="บ้านเลขที่" className="border p-2 rounded bg-white" value={formData.address.houseNo} onChange={e=>handleNestedChange('address','houseNo',e.target.value)}/>
                      <input placeholder="หมู่ที่" className="border p-2 rounded bg-white" value={formData.address.moo} onChange={e=>handleNestedChange('address','moo',e.target.value)}/>
                      <input placeholder="ถนน" className="border p-2 rounded col-span-2 bg-white" value={formData.address.road} onChange={e=>handleNestedChange('address','road',e.target.value)}/>
                      <input placeholder="ตำบล" className="border p-2 rounded bg-white" value={formData.address.subDistrict} onChange={e=>handleNestedChange('address','subDistrict',e.target.value)}/>
                      <input placeholder="อำเภอ" className="border p-2 rounded bg-white" value={formData.address.district} onChange={e=>handleNestedChange('address','district',e.target.value)}/>
                      <input placeholder="จังหวัด" className="border p-2 rounded bg-white" value={formData.address.province} onChange={e=>handleNestedChange('address','province',e.target.value)}/>
                      <input placeholder="โทรศัพท์" className="border p-2 rounded bg-white" value={formData.address.phone} onChange={e=>handleNestedChange('address','phone',e.target.value)}/>
                  </div>}

                  <SectionHeader title="3-4. ครอบครัว & การศึกษา" icon={Briefcase} isOpen={activeSection===3} onClick={()=>setActiveSection(activeSection===3?null:3)}/>
                  {activeSection===3 && <div className="p-4 space-y-2 text-base bg-slate-50/50">
                      <input placeholder="วุฒิการศึกษา (เช่น ปริญญาตรี)" className="border p-2 rounded w-full bg-white" value={formData.education.degree} onChange={e=>handleNestedChange('education','degree',e.target.value)}/>
                      <input placeholder="สาขาวิชา" className="border p-2 rounded w-full bg-white" value={formData.education.major} onChange={e=>handleNestedChange('education','major',e.target.value)}/>
                      <input placeholder="สถาบันการศึกษา" className="border p-2 rounded w-full bg-white" value={formData.education.institution} onChange={e=>handleNestedChange('education','institution',e.target.value)}/>
                      <div className="border-t pt-2 mt-2"><p className="text-sm font-bold mb-1">ข้อมูลคู่สมรส/บิดา/มารดา (ถ้ามี)</p>
                      <input placeholder="ชื่อคู่สมรส" className="border p-2 rounded w-full mb-1 bg-white" value={formData.spouseName} onChange={e=>handleInputChange('spouseName',e.target.value)}/>
                      <input placeholder="ชื่อบิดา" className="border p-2 rounded w-full mb-1 bg-white" value={formData.fatherName} onChange={e=>handleInputChange('fatherName',e.target.value)}/>
                      <input placeholder="ชื่อมารดา" className="border p-2 rounded w-full bg-white" value={formData.motherName} onChange={e=>handleInputChange('motherName',e.target.value)}/>
                      </div>
                  </div>}

                  <SectionHeader title="5. ตำแหน่งที่สมัคร" icon={Briefcase} isOpen={activeSection===5} onClick={()=>setActiveSection(activeSection===5?null:5)}/>
                  {activeSection===5 && <div className="p-4 bg-slate-50/50">
                      <select className="w-full border p-2 rounded text-base bg-white shadow-sm" value={formData.selectedPositionId} onChange={e=>handlePositionSelect(e.target.value)}>
                          <option value="">-- กรุณาเลือกตำแหน่ง --</option>
                          {positions.map(p=><option key={p.id} value={p.id}>{p.name} ({p.division})</option>)}
                      </select>
                  </div>}

                  <SectionHeader title="6. แนบเอกสาร" icon={File} isOpen={activeSection===6} onClick={()=>setActiveSection(activeSection===6?null:6)}/>
                  {activeSection===6 && <div className="p-4 space-y-2 bg-slate-50/50">
                      {['houseReg','idCard','education','medical'].map(k=>(
                          <div key={k} className="flex justify-between items-center text-sm border p-2 rounded bg-white shadow-sm">
                              <span>{k==='houseReg'?'ทะเบียนบ้าน':k==='idCard'?'บัตรปชช.':k==='education'?'วุฒิฯ':'ใบรับรองแพทย์'}</span>
                              {formData.attachments[k].file ? <div className="text-emerald-600 flex gap-2 items-center bg-emerald-50 px-2 py-1 rounded border border-emerald-100"><CheckCircle size={16}/><span>แนบแล้ว</span><X size={16} className="text-red-400 cursor-pointer hover:text-red-600" onClick={()=>removeFile(k)}/></div> : <label className="text-blue-600 cursor-pointer font-bold hover:underline bg-blue-50 px-3 py-1 rounded border border-blue-100 hover:bg-blue-100 transition">+ แนบไฟล์<input type="file" hidden onChange={e=>handleFileUpload(e,k)}/></label>}
                          </div>
                      ))}
                  </div>}
               </div>
             </>
           )}

           {/* ADMIN VIEW */}
           {role === 'admin' && (
             <div className="flex flex-col h-full bg-slate-50 w-full">
                {/* Admin Header */}
                <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Shield className="text-emerald-600"/> แผงควบคุมเจ้าหน้าที่</h2>
                    <div className="flex gap-2">
                        <button onClick={()=>setAdminView('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold ${adminView==='dashboard'?'bg-emerald-100 text-emerald-700':'text-gray-500 hover:bg-gray-100'}`}>รายชื่อผู้สมัคร</button>
                        <button onClick={()=>{setAdminView('settings');}} className={`px-4 py-2 rounded-lg text-sm font-bold ${adminView==='settings'?'bg-emerald-100 text-emerald-700':'text-gray-500 hover:bg-gray-100'}`}>ตั้งค่า</button>
                        {/* ปุ่มล้างข้อมูล */}
                        <button onClick={handleClearData} className="px-4 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 border border-red-200">ล้างข้อมูลทดสอบ</button>
                    </div>
                </div>

                {/* View: Dashboard (List) */}
                {adminView === 'dashboard' && (
                    <div className="p-6 max-w-6xl mx-auto w-full">
                        {/* Stats & Search */}
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                            <div className="flex gap-2">
                                <div className="bg-white p-4 rounded-xl shadow-sm border w-32 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{applicantList.length}</div>
                                    <div className="text-xs text-gray-500">ทั้งหมด</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border w-32 text-center">
                                    <div className="text-2xl font-bold text-green-600">{applicantList.filter(a=>a.status==='approved').length}</div>
                                    <div className="text-xs text-gray-500">อนุมัติแล้ว</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border w-32 text-center">
                                    <div className="text-2xl font-bold text-orange-500">{applicantList.filter(a=>a.status==='submitted').length}</div>
                                    <div className="text-xs text-gray-500">รอตรวจ</div>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm flex-1 max-w-md">
                                <Search className="text-gray-400" size={20}/>
                                <input className="flex-1 outline-none text-sm" placeholder="ค้นหาชื่อ หรือ เลขบัตร..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                            </div>
                            <select className="bg-white p-2 rounded-lg border shadow-sm text-sm" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                                <option value="all">ทั้งหมด</option>
                                <option value="submitted">รอตรวจสอบ</option>
                                <option value="approved">อนุมัติแล้ว</option>
                                <option value="correction">ส่งคืนแก้ไข</option>
                            </select>
                            <button onClick={handleExportCSV} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-emerald-700 flex items-center gap-2"><Download size={16}/> Export CSV</button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                                    <tr><th className="p-4">วันที่สมัคร</th><th className="p-4">ชื่อ-นามสกุล</th><th className="p-4">ตำแหน่ง</th><th className="p-4">สถานะ</th><th className="p-4 text-center">จัดการ</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredApplicants.map((app, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition">
                                            <td className="p-4 text-gray-500">{new Date(app.submissionDate).toLocaleDateString('th-TH')}</td>
                                            <td className="p-4 font-medium text-gray-900">{app.prefix}{app.firstName} {app.lastName}<br/><span className="text-xs text-gray-400">{app.idCardNumber}</span></td>
                                            <td className="p-4">{app.displayPosition}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    app.status==='approved'?'bg-green-100 text-green-700':
                                                    app.status==='correction'?'bg-red-100 text-red-700':
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {app.status==='approved'?'อนุมัติ':app.status==='correction'?'แก้ไข':'รอตรวจ'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleAdminSelectApplicant(app)} className="bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 shadow-sm text-xs flex items-center gap-1 mx-auto"><Edit size={12}/> ตรวจสอบ</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredApplicants.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">ไม่พบข้อมูล</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: Detail (Verify) */}
                {adminView === 'detail' && (
                  <div className="flex flex-col md:flex-row h-full overflow-hidden">
                     {/* Left: Tools */}
                     <div className="w-full md:w-[350px] bg-white border-r flex flex-col h-full overflow-y-auto p-4 shadow-lg z-10">
                        <button onClick={()=>setAdminView('dashboard')} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm">← กลับไปหน้ารายชื่อ</button>
                        <div className="bg-slate-50 p-4 rounded-lg border mb-4">
                            <h3 className="font-bold text-lg text-gray-800">{formData.prefix}{formData.firstName} {formData.lastName}</h3>
                            <p className="text-sm text-gray-500">{formData.displayPosition}</p>
                        </div>

                        <h4 className="font-bold text-sm mb-2 text-gray-700 flex items-center gap-2"><CheckCircle size={16}/> ตรวจสอบเอกสาร</h4>
                        <div className="space-y-2 mb-6">
                            {['houseReg', 'idCard', 'education', 'medical'].map((key) => (
                                <div key={key} className="flex items-center justify-between p-2 bg-white border rounded hover:bg-gray-50">
                                    <span className="text-sm text-gray-600">{key}</span>
                                    <div className="flex gap-1">
                                        <button onClick={()=>verifyDoc(key, true)} className={`p-1 rounded ${formData.attachments[key].verified===true?'bg-green-500 text-white':'bg-gray-100 text-gray-400'}`}><Check size={14}/></button>
                                        <button onClick={()=>verifyDoc(key, false)} className={`p-1 rounded ${formData.attachments[key].verified===false?'bg-red-500 text-white':'bg-gray-100 text-gray-400'}`}><X size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h4 className="font-bold text-sm mb-2 text-gray-700">ผลการพิจารณา</h4>
                        <textarea 
                            className="w-full border rounded p-2 text-sm mb-3 h-24 focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="ระบุเหตุผล (กรณีส่งคืนแก้ไข)"
                            value={formData.adminFeedback}
                            onChange={(e)=>handleAdminFeedbackChange(e.target.value)}
                        ></textarea>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={()=>handleAdminAction('reject')} className="bg-white border border-red-200 text-red-600 py-2 rounded hover:bg-red-50 font-bold text-sm">ส่งคืนแก้ไข</button>
                            <button onClick={()=>handleAdminAction('approve')} className="bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 font-bold text-sm shadow-sm">อนุมัติใบสมัคร</button>
                        </div>
                     </div>

                     {/* Right: Preview (Use existing preview logic) */}
                     <div className="flex-1 bg-gray-500 p-8 overflow-y-auto">
                        <div className="bg-white shadow-2xl mx-auto relative print:shadow-none print-container print-scale" style={{ width: '210mm', minHeight: '297mm', padding: '25mm 25mm', boxSizing: 'border-box' }}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-[2.2cm] h-[2.2cm] flex items-center justify-center pt-1"><img src={LOGO_URL} className="w-full h-full object-contain" onError={(e)=>{e.target.style.visibility='hidden'}}/></div>
                                <div className="flex-1 text-center px-2 pt-2"><h1 className="font-bold text-[20px] leading-tight mb-1 text-black">ใบสมัครเข้ารับการเลือกสรรบุคคลเป็น<br/>พนักงานจ้าง</h1><h2 className="font-bold text-[20px] leading-tight mb-1 text-black">เทศบาลเมืองอุทัยธานี</h2></div>
                                <div className="w-[2.8cm] flex flex-col items-center pt-2"><div className="w-[2.5cm] h-[3.25cm] border border-black flex items-center justify-center text-center text-sm relative overflow-hidden bg-gray-50">{formData.photoPreview ? <img src={formData.photoPreview} className="absolute inset-0 w-full h-full object-cover"/> : <span className="text-gray-400">รูปถ่าย<br/>1 นิ้ว</span>}</div></div>
                            </div>
                            {/* Body Content */}
                            <div className="space-y-1 text-[15px] leading-snug text-black font-sarabun">
                                <div className="flex items-end"><span className="mr-2 whitespace-nowrap">๑. ชื่อ - ชื่อสกุล</span><DottedLine text={`${formData.prefix} ${formData.firstName} ${formData.lastName}`} /><span className="mx-2 whitespace-nowrap">สัญชาติ</span><DottedLine text={formData.nationality} width="w-[2.5cm]" center={true} /></div>
                                <div className="flex items-end"><span className="mr-2 whitespace-nowrap">๒. เกิดวันที่</span><DottedLine text={new Date(formData.birthDate).getDate()} width="w-[1.2cm]" center={true}/><span className="mx-2 whitespace-nowrap">เดือน</span><DottedLine text={new Date(formData.birthDate).toLocaleString('th-TH', { month: 'long' })} width="w-[2.5cm]" center={true}/><span className="mx-2 whitespace-nowrap">พ.ศ.</span><DottedLine text={new Date(formData.birthDate).getFullYear()+543} width="w-[1.5cm]" center={true}/></div>
                                <div className="flex items-end"><span className="mr-2 whitespace-nowrap">๓. ที่อยู่ปัจจุบัน เลขที่</span><DottedLine text={formData.address.houseNo} width="w-[1.8cm]" center={true} /><span className="mx-1 whitespace-nowrap">หมู่ที่</span><DottedLine text={formData.address.moo} width="w-[1cm]" center={true} /><span className="mx-1 whitespace-nowrap">ถนน</span><DottedLine text={formData.address.road} width="w-[3cm]" /><span className="mx-1 whitespace-nowrap">ตำบล</span><DottedLine text={formData.address.subDistrict} /></div>
                                <div className="flex items-end"><span className="ml-6 mr-2 whitespace-nowrap">อำเภอ</span><DottedLine text={formData.address.district} /><span className="mx-2 whitespace-nowrap">จังหวัด</span><DottedLine text={formData.address.province} /><span className="mx-2 whitespace-nowrap">โทรศัพท์</span><DottedLine text={formData.address.phone} width="w-[3.5cm]" /></div>
                                <div className="pt-3"><div className="mb-1 font-bold">๑๐. ขอสมัครเข้ารับการเลือกสรรตำแหน่ง</div><div className="ml-6 flex items-start mb-1"><BoxOption checked={formData.displayJobType==='mission'} label="พนักงานจ้างตามภารกิจ"/><div className="ml-4 flex items-center"><span className="mr-2">ลักษณะงาน:</span><RadioOption checked={formData.displayMissionType==='qualified'} label="ผู้มีคุณวุฒิ"/><RadioOption checked={formData.displayMissionType==='skilled'} label="ผู้มีทักษะ"/></div></div><div className="ml-6 flex items-end mb-2"><span className="mr-2">ตำแหน่ง</span><DottedLine text={formData.displayJobType==='mission'?formData.displayPosition:''} /><span className="mx-2">สังกัด</span><DottedLine text={formData.displayJobType==='mission'?formData.displayDivision:''} width="w-[4.5cm]" /></div><div className="ml-6 flex items-start mb-1"><BoxOption checked={formData.displayJobType==='general'} label="พนักงานจ้างทั่วไป"/></div><div className="ml-6 flex items-end"><span className="mr-2">ตำแหน่ง</span><DottedLine text={formData.displayJobType==='general'?formData.displayPosition:''} /><span className="mx-2">สังกัด</span><DottedLine text={formData.displayJobType==='general'?formData.displayDivision:''} width="w-[4.5cm]" /></div></div>
                                <div className="mt-6 flex justify-between items-end"><div className={`border border-black p-2 w-[8cm] h-[3.5cm] flex flex-col justify-between text-[13px]`}><div className="text-center font-bold underline">สำหรับเจ้าหน้าที่</div><div className="flex items-center gap-2 mt-1"><span>ตรวจสอบหลักฐาน:</span><BoxOption checked={formData.status==='approved'} label="ครบถ้วน"/><BoxOption checked={formData.status==='correction'} label="ไม่ครบถ้วน"/></div><div className="flex items-end"><span className="whitespace-nowrap">ขาดเหลือ:</span><DottedLine text={formData.status==='correction'?'เอกสารไม่สมบูรณ์':''} /></div><div className="flex items-end mt-2"><span className="whitespace-nowrap">ลงชื่อเจ้าหน้าที่:</span><DottedLine text="" /></div><div className="flex items-end justify-center"><span className="mr-1">วันที่</span><DottedLine text={appDateDisplay.day} width="w-[0.8cm]" center={true}/><span className="mx-1">/</span><DottedLine text={appDateDisplay.month} width="w-[2cm]" center={true}/><span className="mx-1">/</span><DottedLine text={appDateDisplay.year} width="w-[1.2cm]" center={true}/></div></div><div className="w-[7.5cm] flex flex-col gap-2 text-[14px] items-center"><div className="flex items-end w-full"><span className="mr-2">(ลงชื่อ)</span><DottedLine width="flex-1" /><span className="ml-2">ผู้สมัคร</span></div><div className="flex items-end w-full"><span className="mr-2 invisible">(ลงชื่อ)</span><span className="mr-2">(</span><DottedLine text={`${formData.prefix}${formData.firstName} ${formData.lastName}`} center={true} /><span className="ml-2">)</span></div><div className="flex items-end w-full justify-center"><span className="mr-1">วันที่</span><DottedLine text={subDateDisplay.day} width="w-[0.8cm]" center={true}/><span className="mx-1">/</span><DottedLine text={subDateDisplay.month} width="w-[2cm]" center={true}/><span className="mx-1">/</span><DottedLine text={subDateDisplay.year} width="w-[1.2cm]" center={true}/></div></div></div>
                            </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* View: Settings (Pos Manager) */}
                {adminView === 'settings' && (
                   <div className="flex-1 p-4 overflow-y-auto">
                       <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-slate-700">จัดการตำแหน่งงาน</h3>
                        <button onClick={()=>setAdminView('dashboard')} className="text-gray-500 hover:text-black text-sm">กลับ</button>
                     </div>
                     <div className="space-y-2 mb-4 p-3 bg-white rounded shadow-sm border max-w-2xl mx-auto">
                       <p className="text-xs font-bold text-slate-500">เพิ่มตำแหน่งใหม่</p>
                       <input placeholder="ชื่อตำแหน่ง" className="border p-2 w-full rounded text-sm" value={newPos.name} onChange={e=>setNewPos({...newPos, name:e.target.value})}/>
                       <input placeholder="สังกัด (กอง/ฝ่าย)" className="border p-2 w-full rounded text-sm" value={newPos.division} onChange={e=>setNewPos({...newPos, division:e.target.value})}/>
                       <div className="flex gap-2">
                           <select className="border p-2 rounded text-sm flex-1" value={newPos.type} onChange={e=>setNewPos({...newPos, type:e.target.value})}><option value="mission">ภารกิจ</option><option value="general">ทั่วไป</option></select>
                           {newPos.type==='mission' && <select className="border p-2 rounded text-sm flex-1" value={newPos.missionType} onChange={e=>setNewPos({...newPos, missionType:e.target.value})}><option value="qualified">ผู้มีคุณวุฒิ</option><option value="skilled">ผู้มีทักษะ</option></select>}
                       </div>
                       <button onClick={handleAddPosition} className="bg-blue-600 text-white w-full py-2 rounded text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2"><Plus size={14}/> เพิ่มตำแหน่ง</button>
                     </div>
                     <div className="space-y-2 max-w-2xl mx-auto">
                       {positions.map(p => (
                         <div key={p.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-200">
                           <div><div className="font-bold text-sm">{p.name}</div><div className="text-xs text-gray-500">{p.type==='mission'?'ภารกิจ':'ทั่วไป'} | {p.division}</div></div>
                           <button onClick={()=>handleDeletePosition(p.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                         </div>
                       ))}
                     </div>
                   </div>
                )}
             </div>
           )}
        </div>

        {/* RIGHT PANEL: PREVIEW (Hidden for Admin Dashboard, Visible for Applicant/Verify) */}
        {role !== 'admin' || adminView === 'detail' ? (
        <div className="flex-1 bg-gray-500 p-4 md:p-8 overflow-y-auto h-[calc(100vh-60px)] print:h-auto print:overflow-visible print:bg-white print:p-0">
           <div className="bg-white shadow-2xl mx-auto relative print:shadow-none print-container print-scale" style={{ width: '210mm', minHeight: '297mm', padding: '25mm 25mm', boxSizing: 'border-box' }}>
              {formData.status === 'approved' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden">
                    <div className="border-[8px] border-green-600/20 text-green-600/20 font-bold text-[80px] -rotate-45 p-8 rounded-3xl uppercase tracking-widest whitespace-nowrap select-none">
                    อนุมัติแล้ว
                    </div>
                </div>
              )}

              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                  <div className="w-[2.2cm] h-[2.2cm] flex items-center justify-center pt-1"><img src={LOGO_URL} className="w-full h-full object-contain" onError={(e)=>{e.target.style.visibility='hidden'}}/></div>
                  <div className="flex-1 text-center px-2 pt-2"><h1 className="font-bold text-[20px] leading-tight mb-1 text-black">ใบสมัครเข้ารับการเลือกสรรบุคคลเป็น<br/>พนักงานจ้าง</h1><h2 className="font-bold text-[20px] leading-tight mb-1 text-black">เทศบาลเมืองอุทัยธานี</h2></div>
                  <div className="w-[2.8cm] flex flex-col items-center pt-2"><div className="w-[2.5cm] h-[3.25cm] border border-black flex items-center justify-center text-center text-sm relative overflow-hidden bg-gray-50">{formData.photoPreview ? <img src={formData.photoPreview} className="absolute inset-0 w-full h-full object-cover"/> : <span className="text-gray-400">รูปถ่าย<br/>1 นิ้ว</span>}</div></div>
              </div>
              {/* Body Content (Reused from main) */}
              <div className="space-y-1 text-[15px] leading-snug text-black font-sarabun">
                  <div className="flex items-end"><span className="mr-2 whitespace-nowrap">๑. ชื่อ - ชื่อสกุล</span><DottedLine text={`${formData.prefix} ${formData.firstName} ${formData.lastName}`} /><span className="mx-2 whitespace-nowrap">สัญชาติ</span><DottedLine text={formData.nationality} width="w-[2.5cm]" center={true} /></div>
                  <div className="flex items-end"><span className="mr-2 whitespace-nowrap">๒. เกิดวันที่</span><DottedLine text={new Date(formData.birthDate).getDate()} width="w-[1.2cm]" center={true}/><span className="mx-2 whitespace-nowrap">เดือน</span><DottedLine text={new Date(formData.birthDate).toLocaleString('th-TH', { month: 'long' })} width="w-[2.5cm]" center={true}/><span className="mx-2 whitespace-nowrap">พ.ศ.</span><DottedLine text={new Date(formData.birthDate).getFullYear()+543} width="w-[1.5cm]" center={true}/></div>
                  <div className="flex items-end"><span className="mr-2 whitespace-nowrap">๓. ที่อยู่ปัจจุบัน เลขที่</span><DottedLine text={formData.address.houseNo} width="w-[1.8cm]" center={true} /><span className="mx-1 whitespace-nowrap">หมู่ที่</span><DottedLine text={formData.address.moo} width="w-[1cm]" center={true} /><span className="mx-1 whitespace-nowrap">ถนน</span><DottedLine text={formData.address.road} width="w-[3cm]" /><span className="mx-1 whitespace-nowrap">ตำบล</span><DottedLine text={formData.address.subDistrict} /></div>
                  <div className="flex items-end"><span className="ml-6 mr-2 whitespace-nowrap">อำเภอ</span><DottedLine text={formData.address.district} /><span className="mx-2 whitespace-nowrap">จังหวัด</span><DottedLine text={formData.address.province} /><span className="mx-2 whitespace-nowrap">โทรศัพท์</span><DottedLine text={formData.address.phone} width="w-[3.5cm]" /></div>
                  <div className="flex items-center pt-2"><span className="mr-4 whitespace-nowrap">๔. สถานภาพ</span><RadioOption checked={formData.maritalStatus==='single'} label="โสด"/><RadioOption checked={formData.maritalStatus==='married'} label="สมรส"/><RadioOption checked={formData.maritalStatus==='divorced'} label="หย่า"/><RadioOption checked={formData.maritalStatus==='widowed'} label="หม้าย"/><RadioOption checked={formData.maritalStatus==='separated'} label="แยกกันอยู่"/></div>
                  <div className="flex items-end pt-1"><span className="mr-2 whitespace-nowrap">๕. ชื่อคู่สมรส</span><DottedLine text={formData.spouseName} /><span className="mx-2 whitespace-nowrap">อาชีพ</span><DottedLine text={formData.spouseOccupation} width="w-[3.5cm]" /></div>
                  <div className="flex items-end"><span className="mr-2 whitespace-nowrap">๖. ชื่อบิดา</span><DottedLine text={formData.fatherName} /><span className="mx-2 whitespace-nowrap">อาชีพ</span><DottedLine text={formData.fatherOccupation} width="w-[3.5cm]" /></div>
                  <div className="flex items-end"><span className="mr-2 whitespace-nowrap">๗. ชื่อมารดา</span><DottedLine text={formData.motherName} /><span className="mx-2 whitespace-nowrap">อาชีพ</span><DottedLine text={formData.motherOccupation} width="w-[3.5cm]" /></div>
                  <div className="flex items-end pt-2"><span className="mr-2 whitespace-nowrap">๘. วุฒิการศึกษา</span><DottedLine text={formData.education.degree} /><span className="mx-2 whitespace-nowrap">สาขาวิชา</span><DottedLine text={formData.education.major} width="w-[4.5cm]" /></div>
                  <div className="flex items-end"><span className="ml-6 mr-2 whitespace-nowrap">สถานศึกษา</span><DottedLine text={formData.education.institution} /></div>
                  <div className="flex items-end pt-2"><span className="mr-2 whitespace-nowrap">๙. ประวัติการทำงานเดิม</span><DottedLine text={formData.prevWork} /><span className="mx-2 whitespace-nowrap">สถานที่ทำงาน</span><DottedLine text={formData.prevWorkPlace} width="w-[5.5cm]" /></div>
                  <div className="pt-3"><div className="mb-1 font-bold">๑๐. ขอสมัครเข้ารับการเลือกสรรตำแหน่ง</div><div className="ml-6 flex items-start mb-1"><BoxOption checked={formData.displayJobType==='mission'} label="พนักงานจ้างตามภารกิจ"/><div className="ml-4 flex items-center"><span className="mr-2">ลักษณะงาน:</span><RadioOption checked={formData.displayMissionType==='qualified'} label="ผู้มีคุณวุฒิ"/><RadioOption checked={formData.displayMissionType==='skilled'} label="ผู้มีทักษะ"/></div></div><div className="ml-6 flex items-end mb-2"><span className="mr-2">ตำแหน่ง</span><DottedLine text={formData.displayJobType==='mission'?formData.displayPosition:''} /><span className="mx-2">สังกัด</span><DottedLine text={formData.displayJobType==='mission'?formData.displayDivision:''} width="w-[4.5cm]" /></div><div className="ml-6 flex items-start mb-1"><BoxOption checked={formData.displayJobType==='general'} label="พนักงานจ้างทั่วไป"/></div><div className="ml-6 flex items-end"><span className="mr-2">ตำแหน่ง</span><DottedLine text={formData.displayJobType==='general'?formData.displayPosition:''} /><span className="mx-2">สังกัด</span><DottedLine text={formData.displayJobType==='general'?formData.displayDivision:''} width="w-[4.5cm]" /></div></div>
                  <div className="mt-6 flex justify-between items-end"><div className={`border border-black p-2 w-[8cm] h-[3.5cm] flex flex-col justify-between text-[13px]`}><div className="text-center font-bold underline">สำหรับเจ้าหน้าที่</div><div className="flex items-center gap-2 mt-1"><span>ตรวจสอบหลักฐาน:</span><BoxOption checked={formData.status==='approved'} label="ครบถ้วน"/><BoxOption checked={formData.status==='correction'} label="ไม่ครบถ้วน"/></div><div className="flex items-end"><span className="whitespace-nowrap">ขาดเหลือ:</span><DottedLine text={formData.status==='correction'?'เอกสารไม่สมบูรณ์':''} /></div><div className="flex items-end mt-2"><span className="whitespace-nowrap">ลงชื่อเจ้าหน้าที่:</span><DottedLine text="" /></div><div className="flex items-end justify-center"><span className="mr-1">วันที่</span><DottedLine text={appDateDisplay.day} width="w-[0.8cm]" center={true}/><span className="mx-1">/</span><DottedLine text={appDateDisplay.month} width="w-[2cm]" center={true}/><span className="mx-1">/</span><DottedLine text={appDateDisplay.year} width="w-[1.2cm]" center={true}/></div></div><div className="w-[7.5cm] flex flex-col gap-2 text-[14px] items-center"><div className="flex items-end w-full"><span className="mr-2">(ลงชื่อ)</span><DottedLine width="flex-1" /><span className="ml-2">ผู้สมัคร</span></div><div className="flex items-end w-full"><span className="mr-2 invisible">(ลงชื่อ)</span><span className="mr-2">(</span><DottedLine text={`${formData.prefix}${formData.firstName} ${formData.lastName}`} center={true} /><span className="ml-2">)</span></div><div className="flex items-end w-full justify-center"><span className="mr-1">วันที่</span><DottedLine text={subDateDisplay.day} width="w-[0.8cm]" center={true}/><span className="mx-1">/</span><DottedLine text={subDateDisplay.month} width="w-[2cm]" center={true}/><span className="mx-1">/</span><DottedLine text={subDateDisplay.year} width="w-[1.2cm]" center={true}/></div></div></div>
              </div>
           </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}