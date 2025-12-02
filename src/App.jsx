import React, { useState, useEffect } from 'react';
import { Printer, FileText, User, MapPin, Briefcase, Upload, ChevronDown, ChevronUp, X, CheckCircle, Image as ImageIcon, File, Shield, AlertCircle, Send, Check, Settings, Key, Loader2, WifiOff, Plus, Trash2, Search, Edit, LogOut, LogIn, Download, RefreshCw, Eye, AlertTriangle } from 'lucide-react';

// --- CONFIGURATION ---
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
  const [errors, setErrors] = useState({});
  
  // เพิ่มฟังก์ชันนี้ใน App component
const fetchApplicantsFromCloud = async () => {
    setLoading(true);
    try {
        // ลบ mode: 'no-cors' ออกเมื่อใช้ doGet เพื่ออ่านข้อมูล
        const response = await fetch(GOOGLE_SCRIPT_URL); 
        const data = await response.json();
        if (Array.isArray(data)) {
            setApplicantList(data);
            // อัปเดต localStorage ให้ตรงกันด้วย (เผื่อใช้ดู offline)
            const newDb = {};
            data.forEach(app => newDb[app.idCardNumber] = app);
            localStorage.setItem('uthai_jobs_applicants_db', JSON.stringify(newDb));
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("ไม่สามารถดึงข้อมูลล่าสุดจากระบบได้ จะแสดงข้อมูลเก่าในเครื่องแทน");
    } finally {
        setLoading(false);
    }
};

// แก้ไข useEffect ของ Admin ให้เรียกฟังก์ชันนี้
useEffect(() => { 
    if (role === 'admin') {
        refreshApplicantList(); // โหลดจากเครื่องก่อนให้เห็นไวๆ
        fetchApplicantsFromCloud(); // แล้วโหลดข้อมูลจริงจาก Cloud มาทับ
    }
}, [role]);

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
  const [newPos, setNewPos] = useState({ type: 'mission', name: '', division: '', missionType: 'qualified' });
  const [previewFile, setPreviewFile] = useState(null);

  // Form Data Template
  const initialFormData = {
    prefix: '', firstName: '', lastName: '', nationality: 'ไทย', birthDate: '',
    photoPreview: null, photoFile: null, 
    address: { houseNo: '', moo: '', road: '', subDistrict: '', district: '', province: '', phone: '' },
    maritalStatus: 'single', spouseName: '-', spouseOccupation: '-', spouseWorkplace: '-',
    fatherName: '', fatherOccupation: '', fatherWorkplace: '-',
    motherName: '', motherOccupation: '', motherWorkplace: '-',
    education: { degree: '', major: '', institution: '' },
    prevWork: '-', prevWorkPlace: '-',
    selectedPositionId: '', displayPosition: '', displayDivision: '', displayJobType: '', displayMissionType: '',
    idCardNumber: '', 
    status: 'draft',
    submissionId: '',
    submissionDate: null,
    approvalDate: null,
    adminFeedback: '',
    attachments: {
      houseReg: { checked: false, file: null, fileData: null, verified: null },
      idCard: { checked: false, file: null, fileData: null, verified: null },
      education: { checked: false, file: null, fileData: null, verified: null },
      medical: { checked: false, file: null, fileData: null, verified: null },
    }
  };

  const [formData, setFormData] = useState(initialFormData);
  const [activeSection, setActiveSection] = useState(1);
  
  const age = calculateAge(formData.birthDate);
  const today = new Date();
  const dateParts = { day: today.getDate(), month: today.toLocaleString('th-TH', { month: 'long' }), year: today.getFullYear() + 543 };

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!formData.lastName) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!formData.birthDate) newErrors.birthDate = 'กรุณาเลือกวันเกิด';
    if (!formData.idCardNumber || formData.idCardNumber.length !== 13) {
      newErrors.idCardNumber = 'กรุณากรอกเลขบัตรประชาชน 13 หลัก';
    }
    if (!formData.address.phone || formData.address.phone.length < 9) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    }
    if (!formData.selectedPositionId) newErrors.position = 'กรุณาเลือกตำแหน่ง';
    if (!formData.photoFile) newErrors.photo = 'กรุณาอัปโหลดรูปถ่าย';
    
    // Check attachments
    const requiredDocs = ['houseReg', 'idCard', 'education', 'medical'];
    const missingDocs = requiredDocs.filter(doc => !formData.attachments[doc].file);
    if (missingDocs.length > 0) {
      newErrors.attachments = 'กรุณาแนบเอกสารให้ครบถ้วน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
            alert('ล้างข้อมูลเรียบร้อยแล้ว');
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
  useEffect(() => { if (role === 'admin') refreshApplicantList(); }, [role]);

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
      if (!applicantIdCardLogin || applicantIdCardLogin.length !== 13) {
        return alert("กรุณากรอกเลขบัตรประชาชน 13 หลัก");
      }
      
      setLoading(true);
      setTimeout(() => {
          const db = getAllApplicants();
          const user = db[applicantIdCardLogin];
          
          if (user) {
              setFormData(user); 
              setRole('applicant');
              alert(`ยินดีต้อนรับคุณ ${user.firstName} ${user.lastName}`);
              setShowApplicantLogin(false);
          } else {
              if(window.confirm("ไม่พบข้อมูลในระบบ ต้องการเริ่มกรอกใบสมัครใหม่หรือไม่?")) {
                  const newUserData = { ...initialFormData, idCardNumber: applicantIdCardLogin };
                  setFormData(newUserData);
                  setRole('applicant');
                  setShowApplicantLogin(false);
              }
          }
          setLoading(false);
      }, 500);
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
      setErrors({});
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
      if (errors[f]) setErrors(prev => ({ ...prev, [f]: null }));
  };

  const handleNestedChange = (p, f, v) => { 
      if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
      setFormData(prev => ({ ...prev, [p]: { ...prev[p], [f]: v } }));
      if (errors[f]) setErrors(prev => ({ ...prev, [f]: null }));
  };

  const handlePositionSelect = (id) => {
    if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
    const pos = positions.find(p => p.id.toString() === id.toString());
    if (pos) {
      setFormData(prev => ({ 
        ...prev, 
        selectedPositionId: id, 
        displayPosition: pos.name, 
        displayDivision: pos.division, 
        displayJobType: pos.type, 
        displayMissionType: pos.missionType 
      }));
      if (errors.position) setErrors(prev => ({ ...prev, position: null }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        selectedPositionId: '', 
        displayPosition: '', 
        displayDivision: '', 
        displayJobType: '', 
        displayMissionType: '' 
      }));
    }
  };

  const handleFileUpload = async (e, type) => {
      if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์มีขนาดเกิน 5MB กรุณาเลือกไฟล์ที่เล็กกว่า');
        return;
      }

      if (type === 'photoPreview') {
        setFormData(p => ({ 
          ...p, 
          photoPreview: URL.createObjectURL(file), 
          photoFile: file 
        }));
        if (errors.photo) setErrors(prev => ({ ...prev, photo: null }));
      } else {
        try {
          const fileData = await fileToBase64(file);
          setFormData(p => ({ 
            ...p, 
            attachments: { 
              ...p.attachments, 
              [type]: { 
                ...p.attachments[type], 
                checked: true, 
                file: file.name,
                fileData: fileData,
                verified: null 
              } 
            } 
          }));
          if (errors.attachments) setErrors(prev => ({ ...prev, attachments: null }));
        } catch (error) {
          alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
        }
      }
  };

  const removeFile = (type) => {
      if (role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved')) return;
      if (type === 'photoPreview') {
        setFormData(p => ({ ...p, photoPreview: null, photoFile: null }));
      } else {
        setFormData(p => ({ 
          ...p, 
          attachments: { 
            ...p.attachments, 
            [type]: { 
              ...p.attachments[type], 
              checked: false, 
              file: null,
              fileData: null,
              verified: null 
            } 
          } 
        }));
      }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      setActiveSection(1); // Go to first section with errors
      return;
    }

    if (window.confirm('ยืนยันการส่งใบสมัคร? หลังจากส่งแล้วจะไม่สามารถแก้ไขได้จนกว่าจะได้รับการติดต่อกลับ')) {
      setLoading(true);
      try {
        let payload = { ...formData };
        
        // Convert photo to base64
        if (formData.photoFile) {
          try {
            const photoData = await fileToBase64(formData.photoFile);
            payload.photoFile = photoData; 
          } catch (e) { 
            console.error("Photo Error", e); 
          }
        } else { 
          payload.photoFile = null; 
        }

        const newSubmissionId = formData.submissionId || 'JOB-' + Date.now().toString().slice(-6);
        const subDate = new Date();
            
        const updatedFormData = {
          ...payload,
          status: 'submitted',
          submissionId: newSubmissionId,
          submissionDate: subDate.toISOString()
        };

        saveApplicantToDB(updatedFormData);
        setFormData(updatedFormData);
        setActiveSection(null);
        
        // Send to Google Sheets
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
          mode: 'no-cors'
        }).catch(err => console.log("Online sync failed", err));
            
        alert(`ส่งใบสมัครเรียบร้อยแล้ว!\n\nรหัสใบสมัคร: ${newSubmissionId}\nกรุณาจดบันทึกรหัสนี้ไว้สำหรับติดตามสถานะ`);
      } catch (error) {
        console.error("Error", error);
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      } finally { 
        setLoading(false); 
      }
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
      
      if (action === 'reject' && !formData.adminFeedback) {
        return alert('กรุณาระบุสิ่งที่ต้องแก้ไข');
      }

      const updatedFormData = {
          ...formData,
          status: newStatus,
          approvalDate: appDate,
          adminFeedback: formData.adminFeedback 
      };

      saveApplicantToDB(updatedFormData);
      setFormData(updatedFormData); 
      
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
    if (!newPos.name || !newPos.division) {
      return alert('กรุณากรอกข้อมูลให้ครบ'); 
    }
    const id = positions.length > 0 ? Math.max(...positions.map(p => p.id)) + 1 : 1; 
    setPositions([...positions, { ...newPos, id }]); 
    setNewPos({ type: 'mission', name: '', division: '', missionType: 'qualified' }); 
    alert('เพิ่มตำแหน่งเรียบร้อยแล้ว');
  };

  const handleDeletePosition = (id) => { 
    if (window.confirm('ยืนยันลบตำแหน่งนี้?')) { 
        const newPositions = positions.filter(p => p.id !== id);
        setPositions(newPositions); 
    } 
  };

  const filteredApplicants = applicantList.filter(app => {
      const matchesSearch = (app.firstName + app.lastName + (app.idCardNumber || '')).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
  });

  // --- UI COMPONENTS ---
  const DottedLine = ({ text, width = 'flex-1', center = false }) => (
    <div className={`${width} border-b-[1px] border-dotted border-black relative h-[22px] flex items-end ${center ? 'justify-center' : 'justify-start'} px-1`}>
      <span className="text-blue-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis leading-none -translate-y-[2px]" style={{fontFamily: 'Sarabun, sans-serif', fontSize: '14px'}}>
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

  const SectionHeader = ({ title, icon: Icon, isOpen, onClick, hasError }) => (
    <div onClick={onClick} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b ${isOpen ? 'bg-emerald-50' : ''} ${hasError ? 'bg-red-50 border-red-200' : ''}`}>
      <div className="flex items-center gap-3">
        <Icon className={hasError ? 'text-red-600' : 'text-emerald-700'} size={20}/>
        <span className={`font-semibold ${hasError ? 'text-red-700' : 'text-gray-700'}`}>{title}</span>
        {hasError && <AlertTriangle size={16} className="text-red-500"/>}
      </div>
      {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
    </div>
  );

  const FilePreview = ({ fileData, fileName, onClose }) => (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-3 flex justify-between items-center">
          <span className="font-bold">{fileName}</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20}/>
          </button>
        </div>
        <div className="p-4">
          {fileData && fileData.type.includes('image') ? (
            <img src={`data:${fileData.type};base64,${fileData.base64}`} alt={fileName} className="max-w-full"/>
          ) : (
            <iframe 
              src={`data:${fileData?.type};base64,${fileData?.base64}`} 
              className="w-full h-[70vh]"
              title={fileName}
            />
          )}
        </div>
      </div>
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

      {loading && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex flex-col items-center justify-center text-white">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="text-lg font-bold">กำลังประมวลผล...</p>
        </div>
      )}

      {previewFile && (
        <FilePreview 
          fileData={previewFile.data} 
          fileName={previewFile.name} 
          onClose={() => setPreviewFile(null)}
        />
      )}

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h2 className="font-bold mb-4 text-xl text-center">🔐 Admin Access</h2>
            <form onSubmit={handleAdminLogin}>
              <input 
                type="password" 
                value={loginPass} 
                onChange={e=>setLoginPass(e.target.value)} 
                className="border w-full p-3 mb-4 rounded-lg"
                placeholder="รหัสผ่าน"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setShowAdminLogin(false)} className="text-gray-500 px-4 py-2">ยกเลิก</button>
                <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">เข้าสู่ระบบ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicantLogin && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-emerald-600">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                        <User size={32}/>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบผู้สมัคร</h2>
                      <p className="text-sm text-gray-500 mt-2">กรุณากรอกเลขบัตรประชาชนเพื่อเข้าสู่ระบบหรือสมัครใหม่</p>
                  </div>
                  <form onSubmit={handleApplicantLogin} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประจำตัวประชาชน (13 หลัก)</label>
                          <input 
                            type="text" 
                            maxLength="13" 
                            value={applicantIdCardLogin} 
                            onChange={e => setApplicantIdCardLogin(e.target.value.replace(/[^0-9]/g, ''))} 
                            className="w-full border p-3 rounded-lg text-center text-lg tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="x-xxxx-xxxxx-xx-x"
                            required
                            autoFocus
                          />
                      </div>
                      <div className="flex flex-col gap-3 pt-2">
                          <button 
                            type="submit" 
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg"
                          >
                            <LogIn size={20}/> เข้าสู่ระบบ / สมัครใหม่
                          </button>
                          <button 
                            type="button" 
                            onClick={()=>setShowApplicantLogin(false)} 
                            className="w-full bg-white border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50"
                          >
                            ยกเลิก
                          </button>
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
            <div>
              <h1 className="font-bold text-lg">ระบบรับสมัครพนักงานจ้าง</h1>
              <p className="text-sm text-emerald-200">เทศบาลเมืองอุทัยธานี</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            {role === 'guest' && (
                <button 
                  onClick={() => setShowApplicantLogin(true)} 
                  className="bg-white text-emerald-900 px-4 py-1.5 rounded-full text-sm font-bold shadow flex items-center gap-2 hover:bg-emerald-50 transition"
                >
                  <User size={16}/> เข้าสู่ระบบผู้สมัคร
                </button>
            )}
            {role === 'applicant' && (
                <div className="flex items-center gap-3">
                    <span className="text-xs bg-emerald-800 px-3 py-1 rounded-full hidden md:inline-block">
                      ผู้สมัคร: {formData.idCardNumber}
                    </span>
                    {(formData.status === 'submitted' || formData.status === 'approved') && (
                        <button 
                          onClick={() => window.print()} 
                          className="bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-bold flex gap-2 items-center shadow hover:bg-yellow-500 transition"
                        >
                          <Printer size={16}/> พิมพ์ใบสมัคร
                        </button>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                    >
                      <LogOut size={14}/> ออกจากระบบ
                    </button>
                </div>
            )}
            {role === 'admin' && (
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {setAdminView('dashboard'); setShowPosManager(false);}} 
                      className={`p-2 rounded hover:bg-emerald-800 transition ${adminView==='dashboard' ? 'bg-emerald-700' : ''}`} 
                      title="รายชื่อผู้สมัคร"
                    >
                      <FileText size={18}/>
                    </button>
                    <button 
                      onClick={() => {setAdminView('settings');}} 
                      className={`p-2 rounded hover:bg-emerald-800 transition ${adminView==='settings' ? 'bg-emerald-700' : ''}`} 
                      title="ตั้งค่า"
                    >
                      <Settings size={18}/>
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="bg-red-500 text-sm px-3 py-1.5 rounded font-bold hover:bg-red-600"
                    >
                      ออกจากระบบ
                    </button>
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
               <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-gradient-to-br from-emerald-50 to-blue-50">
                   <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-bounce">
                     <FileText size={48}/>
                   </div>
                   <h2 className="text-3xl font-bold text-gray-800 mb-3">ยินดีต้อนรับ</h2>
                   <p className="text-gray-600 mb-8 max-w-md">
                     ระบบรับสมัครพนักงานจ้างเทศบาลเมืองอุทัยธานี<br/>
                     กรุณาเข้าสู่ระบบเพื่อสมัครงานหรือตรวจสอบสถานะ
                   </p>
                   <button 
                     onClick={() => setShowApplicantLogin(true)} 
                     className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-emerald-700 transition transform hover:scale-105 flex items-center gap-3 text-lg"
                   >
                     <LogIn size={24}/> เข้าสู่ระบบ / สมัครงาน
                   </button>
                   
                   <div className="mt-12 p-6 bg-white rounded-xl shadow-lg max-w-md">
                     <h3 className="font-bold text-lg mb-3 text-gray-800">📋 วิธีการใช้งาน</h3>
                     <ol className="text-left text-sm text-gray-600 space-y-2">
                       <li>1. คลิก "เข้าสู่ระบบ / สมัครงาน"</li>
                       <li>2. กรอกเลขบัตรประชาชน 13 หลัก</li>
                       <li>3. กรอกข้อมูลและแนบเอกสาร</li>
                       <li>4. กดส่งใบสมัคร</li>
                       <li>5. รอการติดต่อกลับจากเจ้าหน้าที่</li>
                     </ol>
                   </div>
               </div>
           )}

           {/* APPLICANT VIEW */}
           {role === 'applicant' && (
             <>
               <div className={`p-4 border-b ${
                 formData.status==='draft'?'bg-gradient-to-r from-gray-50 to-gray-100':
                 formData.status==='submitted'?'bg-gradient-to-r from-blue-50 to-blue-100':
                 formData.status==='approved'?'bg-gradient-to-r from-green-50 to-green-100':
                 'bg-gradient-to-r from-red-50 to-red-100'
               }`}>
                  <div className="font-bold text-base mb-2 uppercase tracking-wide flex items-center gap-2">
                    {formData.status==='draft'?<><FileText size={18} className="text-gray-600"/> สถานะ: กำลังกรอกข้อมูล</>:
                     formData.status==='submitted'?<><CheckCircle size={18} className="text-blue-600"/> สถานะ: รอตรวจสอบ</>:
                     formData.status==='approved'?<><CheckCircle size={18} className="text-green-600"/> สถานะ: อนุมัติแล้ว ✓</>:
                     <><AlertCircle size={18} className="text-red-600"/> สถานะ: ต้องแก้ไขข้อมูล</>}
                  </div>

                  {formData.submissionId && (
                    <div className="text-sm text-gray-600 mb-2 font-mono bg-white px-3 py-2 rounded border">
                      รหัสใบสมัคร: <span className="font-bold">{formData.submissionId}</span>
                    </div>
                  )}

                  {(formData.status==='draft' || formData.status === 'correction') && (
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading} 
                      className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18}/> {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการส่งใบสมัคร'}
                    </button>
                  )}

                  {formData.status==='correction' && formData.adminFeedback && (
                    <div className="mt-3 p-3 bg-white border-l-4 border-red-500 rounded text-sm text-red-700 shadow-sm">
                      <strong className="flex items-center gap-1 mb-1">
                        <AlertTriangle size={14}/> สิ่งที่ต้องแก้ไข:
                      </strong>
                      <p>{formData.adminFeedback}</p>
                    </div>
                  )}

                  {formData.status==='approved' && (
                    <div className="mt-2 p-3 bg-white border-l-4 border-green-500 rounded text-sm text-green-700 shadow-sm">
                      <strong className="flex items-center gap-1">
                        <CheckCircle size={14}/> ใบสมัครของคุณได้รับการอนุมัติแล้ว
                      </strong>
                      <p className="text-xs mt-1">กรุณารอการติดต่อจากเจ้าหน้าที่</p>
                    </div>
                  )}

                  {Object.keys(errors).length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      <strong className="flex items-center gap-1 mb-1">
                        <AlertCircle size={14}/> กรุณาแก้ไขข้อมูลต่อไปนี้:
                      </strong>
                      <ul className="list-disc list-inside text-xs">
                        {Object.values(errors).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
               </div>
               
               <div className={formData.status === 'submitted' || formData.status === 'approved' ? 'opacity-60 pointer-events-none grayscale-[0.3]' : ''}>
                  {/* Section 1: Personal Info */}
                  <SectionHeader 
                    title="1. ข้อมูลส่วนตัว" 
                    icon={User} 
                    isOpen={activeSection===1} 
                    onClick={()=>setActiveSection(activeSection===1?null:1)}
                    hasError={!!(errors.firstName || errors.lastName || errors.birthDate || errors.photo)}
                  />
                  {activeSection===1 && (
                    <div className="p-4 space-y-3 bg-slate-50/50">
                      <div className="flex gap-3 items-center bg-white p-3 rounded border border-emerald-100 shadow-sm">
                         <div className="w-[2.5cm] h-[3.25cm] bg-gray-200 rounded flex items-center justify-center overflow-hidden border border-gray-300 shrink-0 relative">
                           {formData.photoPreview ? (
                             <>
                               <img src={formData.photoPreview} className="w-full h-full object-cover"/>
                               <button
                                 onClick={() => removeFile('photoPreview')}
                                 className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                               >
                                 <X size={12}/>
                               </button>
                             </>
                           ) : (
                             <ImageIcon className="text-gray-400"/>
                           )}
                         </div>
                         <div className="flex-1">
                           <label className="cursor-pointer bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-emerald-100 font-bold transition w-full text-center block">
                             <Upload size={16} className="inline mr-1"/> อัปโหลดรูป 1 นิ้ว
                             <input type="file" hidden accept="image/*" onChange={e=>handleFileUpload(e,'photoPreview')}/>
                           </label>
                           {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                           <p className="text-xs text-gray-500 mt-2">ไฟล์ JPG/PNG ขนาดไม่เกิน 5MB</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-base">
                         <div>
                           <input 
                             placeholder="คำนำหน้า *" 
                             className={`border p-2 rounded bg-white w-full ${errors.prefix ? 'border-red-500' : ''}`}
                             value={formData.prefix} 
                             onChange={e=>handleInputChange('prefix',e.target.value)}
                           />
                         </div>
                         <div>
                           <input 
                             placeholder="สัญชาติ" 
                             className="border p-2 rounded bg-white w-full" 
                             value={formData.nationality} 
                             onChange={e=>handleInputChange('nationality',e.target.value)}
                           />
                         </div>
                         <div className="col-span-2">
                           <input 
                             placeholder="ชื่อจริง *" 
                             className={`border p-2 rounded bg-white w-full ${errors.firstName ? 'border-red-500' : ''}`}
                             value={formData.firstName} 
                             onChange={e=>handleInputChange('firstName',e.target.value)}
                           />
                           {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                         </div>
                         <div className="col-span-2">
                           <input 
                             placeholder="นามสกุล *" 
                             className={`border p-2 rounded bg-white w-full ${errors.lastName ? 'border-red-500' : ''}`}
                             value={formData.lastName} 
                             onChange={e=>handleInputChange('lastName',e.target.value)}
                           />
                           {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                         </div>
                         <div className="col-span-2">
                           <label className="text-sm text-gray-600 block mb-1">วันเกิด (เดือน/วัน/ปี ค.ศ.) *</label>
                           <input 
                             type="date" 
                             className={`border p-2 rounded bg-white w-full ${errors.birthDate ? 'border-red-500' : ''}`}
                             value={formData.birthDate} 
                             onChange={e=>handleInputChange('birthDate',e.target.value)}
                           />
                           {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                           {formData.birthDate && (
                             <p className="text-xs text-gray-500 mt-1">
                               อายุ: {age.years} ปี {age.months} เดือน
                             </p>
                           )}
                         </div>
                         <div className="col-span-2">
                           <label className="text-sm text-gray-600 block mb-1">เลขบัตรประชาชน *</label>
                           <input 
                             type="text"
                             maxLength="13"
                             placeholder="x-xxxx-xxxxx-xx-x" 
                             className={`border p-2 rounded bg-white w-full text-center tracking-wider ${errors.idCardNumber ? 'border-red-500' : ''}`}
                             value={formData.idCardNumber} 
                             onChange={e=>handleInputChange('idCardNumber',e.target.value.replace(/[^0-9]/g, ''))}
                           />
                           {errors.idCardNumber && <p className="text-red-500 text-xs mt-1">{errors.idCardNumber}</p>}
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Section 2: Address */}
                  <SectionHeader 
                    title="2. ที่อยู่และการติดต่อ" 
                    icon={MapPin} 
                    isOpen={activeSection===2} 
                    onClick={()=>setActiveSection(activeSection===2?null:2)}
                    hasError={!!errors.phone}
                  />
                  {activeSection===2 && (
                    <div className="p-4 grid grid-cols-2 gap-2 text-base bg-slate-50/50">
                      <input placeholder="บ้านเลขที่" className="border p-2 rounded bg-white" value={formData.address.houseNo} onChange={e=>handleNestedChange('address','houseNo',e.target.value)}/>
                      <input placeholder="หมู่ที่" className="border p-2 rounded bg-white" value={formData.address.moo} onChange={e=>handleNestedChange('address','moo',e.target.value)}/>
                      <input placeholder="ถนน" className="border p-2 rounded col-span-2 bg-white" value={formData.address.road} onChange={e=>handleNestedChange('address','road',e.target.value)}/>
                      <input placeholder="ตำบล" className="border p-2 rounded bg-white" value={formData.address.subDistrict} onChange={e=>handleNestedChange('address','subDistrict',e.target.value)}/>
                      <input placeholder="อำเภอ" className="border p-2 rounded bg-white" value={formData.address.district} onChange={e=>handleNestedChange('address','district',e.target.value)}/>
                      <input placeholder="จังหวัด" className="border p-2 rounded bg-white" value={formData.address.province} onChange={e=>handleNestedChange('address','province',e.target.value)}/>
                      <div className="col-span-2">
                        <input 
                          placeholder="โทรศัพท์ * (0x-xxxx-xxxx)" 
                          className={`border p-2 rounded bg-white w-full ${errors.phone ? 'border-red-500' : ''}`}
                          value={formData.address.phone} 
                          onChange={e=>handleNestedChange('address','phone',e.target.value)}
                          maxLength="10"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Family & Education */}
                  <SectionHeader 
                    title="3. ครอบครัว & การศึกษา" 
                    icon={Briefcase} 
                    isOpen={activeSection===3} 
                    onClick={()=>setActiveSection(activeSection===3?null:3)}
                  />
                  {activeSection===3 && (
                    <div className="p-4 space-y-3 text-base bg-slate-50/50">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-bold text-sm mb-2">สถานภาพ</h4>
                        <select 
                          className="w-full border p-2 rounded" 
                          value={formData.maritalStatus}
                          onChange={e=>handleInputChange('maritalStatus',e.target.value)}
                        >
                          <option value="single">โสด</option>
                          <option value="married">สมรส</option>
                          <option value="divorced">หย่า</option>
                          <option value="widowed">หม้าย</option>
                          <option value="separated">แยกกันอยู่</option>
                        </select>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-bold text-sm mb-2">การศึกษา</h4>
                        <input placeholder="วุฒิการศึกษา (เช่น ปวส., ปริญญาตรี)" className="border p-2 rounded w-full mb-2 bg-white" value={formData.education.degree} onChange={e=>handleNestedChange('education','degree',e.target.value)}/>
                        <input placeholder="สาขาวิชา" className="border p-2 rounded w-full mb-2 bg-white" value={formData.education.major} onChange={e=>handleNestedChange('education','major',e.target.value)}/>
                        <input placeholder="สถาบันการศึกษา" className="border p-2 rounded w-full bg-white" value={formData.education.institution} onChange={e=>handleNestedChange('education','institution',e.target.value)}/>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-bold text-sm mb-2">ข้อมูลครอบครัว (ถ้ามี)</h4>
                        <input placeholder="ชื่อคู่สมรส" className="border p-2 rounded w-full mb-2 bg-white" value={formData.spouseName} onChange={e=>handleInputChange('spouseName',e.target.value)}/>
                        <input placeholder="ชื่อบิดา" className="border p-2 rounded w-full mb-2 bg-white" value={formData.fatherName} onChange={e=>handleInputChange('fatherName',e.target.value)}/>
                        <input placeholder="อาชีพบิดา" className="border p-2 rounded w-full mb-2 bg-white" value={formData.fatherOccupation} onChange={e=>handleInputChange('fatherOccupation',e.target.value)}/>
                        <input placeholder="ชื่อมารดา" className="border p-2 rounded w-full mb-2 bg-white" value={formData.motherName} onChange={e=>handleInputChange('motherName',e.target.value)}/>
                        <input placeholder="อาชีพมารดา" className="border p-2 rounded w-full bg-white" value={formData.motherOccupation} onChange={e=>handleInputChange('motherOccupation',e.target.value)}/>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-bold text-sm mb-2">ประสบการณ์ทำงาน</h4>
                        <input placeholder="ตำแหน่งงานเดิม" className="border p-2 rounded w-full mb-2 bg-white" value={formData.prevWork} onChange={e=>handleInputChange('prevWork',e.target.value)}/>
                        <input placeholder="สถานที่ทำงาน" className="border p-2 rounded w-full bg-white" value={formData.prevWorkPlace} onChange={e=>handleInputChange('prevWorkPlace',e.target.value)}/>
                      </div>
                    </div>
                  )}

                  {/* Section 4: Position */}
                  <SectionHeader 
                    title="4. ตำแหน่งที่สมัคร" 
                    icon={Briefcase} 
                    isOpen={activeSection===5} 
                    onClick={()=>setActiveSection(activeSection===5?null:5)}
                    hasError={!!errors.position}
                  />
                  {activeSection===5 && (
                    <div className="p-4 bg-slate-50/50">
                      <select 
                        className={`w-full border p-3 rounded text-base bg-white shadow-sm ${errors.position ? 'border-red-500' : ''}`}
                        value={formData.selectedPositionId} 
                        onChange={e=>handlePositionSelect(e.target.value)}
                      >
                        <option value="">-- กรุณาเลือกตำแหน่ง *--</option>
                        {positions.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.division}) - {p.type === 'mission' ? 'ภารกิจ' : 'ทั่วไป'}
                          </option>
                        ))}
                      </select>
                      {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}

                      {formData.selectedPositionId && (
                        <div className="mt-3 p-3 bg-white rounded border border-emerald-200">
                          <h4 className="font-bold text-sm mb-1">ตำแหน่งที่เลือก:</h4>
                          <p className="text-sm">{formData.displayPosition}</p>
                          <p className="text-xs text-gray-500">สังกัด: {formData.displayDivision}</p>
                          <p className="text-xs text-gray-500">
                            ประเภท: {formData.displayJobType === 'mission' ? 'พนักงานจ้างตามภารกิจ' : 'พนักงานจ้างทั่วไป'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 5: Attachments */}
                  <SectionHeader 
                    title="5. แนบเอกสาร" 
                    icon={File} 
                    isOpen={activeSection===6} 
                    onClick={()=>setActiveSection(activeSection===6?null:6)}
                    hasError={!!errors.attachments}
                  />
                  {activeSection===6 && (
                    <div className="p-4 space-y-2 bg-slate-50/50">
                      {errors.attachments && (
                        <div className="bg-red-50 border border-red-200 p-2 rounded text-sm text-red-600 mb-3">
                          {errors.attachments}
                        </div>
                      )}
                      
                      {[
                        {key: 'houseReg', label: 'สำเนาทะเบียนบ้าน'},
                        {key: 'idCard', label: 'สำเนาบัตรประชาชน'},
                        {key: 'education', label: 'สำเนาวุฒิการศึกษา'},
                        {key: 'medical', label: 'ใบรับรองแพทย์'}
                      ].map(({key, label}) => (
                        <div key={key} className="flex justify-between items-center text-sm border p-3 rounded bg-white shadow-sm hover:shadow-md transition">
                          <span className="font-medium">{label}</span>
                          <div className="flex items-center gap-2">
                            {formData.attachments[key].file ? (
                              <>
                                <div className="text-emerald-600 flex gap-2 items-center bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                                  <CheckCircle size={16}/>
                                  <span className="text-xs">{formData.attachments[key].file}</span>
                                </div>
                                <button
                                  onClick={() => setPreviewFile({
                                    data: formData.attachments[key].fileData,
                                    name: formData.attachments[key].file
                                  })}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                  title="ดูไฟล์"
                                >
                                  <Eye size={16}/>
                                </button>
                                <button
                                  onClick={() => removeFile(key)}
                                  className="text-red-500 hover:text-red-600 p-1"
                                  title="ลบไฟล์"
                                >
                                  <X size={16}/>
                                </button>
                              </>
                            ) : (
                              <label className="text-blue-600 cursor-pointer font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 transition text-xs">
                                + แนบไฟล์
                                <input 
                                  type="file" 
                                  hidden 
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={e=>handleFileUpload(e,key)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-700 mt-3">
                        <strong>หมายเหตุ:</strong> รองรับไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 5MB
                      </div>
                    </div>
                  )}
               </div>
             </>
           )}

           {/* ADMIN VIEW */}
           {role === 'admin' && (
             <div className="flex flex-col h-full bg-slate-50 w-full">
                {/* Admin Header */}
                <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <Shield className="text-emerald-600"/> แผงควบคุมเจ้าหน้าที่
                    </h2>
                </div>

                {/* View: Dashboard (List) */}
                {adminView === 'dashboard' && (
                    <div className="p-6 max-w-7xl mx-auto w-full">
                        {/* Stats & Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-2xl font-bold text-blue-600">{applicantList.length}</div>
                                  <div className="text-xs text-gray-500">ทั้งหมด</div>
                                </div>
                                <FileText className="text-blue-400" size={32}/>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-2xl font-bold text-orange-500">{applicantList.filter(a=>a.status==='submitted').length}</div>
                                  <div className="text-xs text-gray-500">รอตรวจสอบ</div>
                                </div>
                                <AlertCircle className="text-orange-400" size={32}/>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-2xl font-bold text-green-600">{applicantList.filter(a=>a.status==='approved').length}</div>
                                  <div className="text-xs text-gray-500">อนุมัติแล้ว</div>
                                </div>
                                <CheckCircle className="text-green-400" size={32}/>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-2xl font-bold text-red-600">{applicantList.filter(a=>a.status==='correction').length}</div>
                                  <div className="text-xs text-gray-500">ส่งคืนแก้ไข</div>
                                </div>
                                <AlertTriangle className="text-red-400" size={32}/>
                              </div>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
                            <div className="flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm flex-1 max-w-md">
                                <Search className="text-gray-400" size={20}/>
                                <input 
                                  className="flex-1 outline-none text-sm" 
                                  placeholder="ค้นหาชื่อ หรือ เลขบัตร..." 
                                  value={searchTerm} 
                                  onChange={e=>setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select 
                                  className="bg-white p-2 rounded-lg border shadow-sm text-sm" 
                                  value={filterStatus} 
                                  onChange={e=>setFilterStatus(e.target.value)}
                                >
                                    <option value="all">ทั้งหมด</option>
                                    <option value="submitted">รอตรวจสอบ</option>
                                    <option value="approved">อนุมัติแล้ว</option>
                                    <option value="correction">ส่งคืนแก้ไข</option>
                                </select>
                                <button 
                                  onClick={handleExportCSV} 
                                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-emerald-700 flex items-center gap-2"
                                >
                                  <Download size={16}/> Export CSV
                                </button>
                                <button 
                                  onClick={() => setAdminView('settings')} 
                                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Settings size={16}/> ตั้งค่า
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                                        <tr>
                                          <th className="p-4">วันที่สมัคร</th>
                                          <th className="p-4">เลขบัตร</th>
                                          <th className="p-4">ชื่อ-นามสกุล</th>
                                          <th className="p-4">ตำแหน่ง</th>
                                          <th className="p-4">เบอร์โทร</th>
                                          <th className="p-4">สถานะ</th>
                                          <th className="p-4 text-center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredApplicants.map((app, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition">
                                                <td className="p-4 text-gray-500">{new Date(app.submissionDate).toLocaleDateString('th-TH')}</td>
                                                <td className="p-4 font-mono text-xs">{app.idCardNumber}</td>
                                                <td className="p-4">
                                                  <div className="font-medium text-gray-900">{app.prefix}{app.firstName} {app.lastName}</div>
                                                  <div className="text-xs text-gray-400">{app.submissionId}</div>
                                                </td>
                                                <td className="p-4">{app.displayPosition}</td>
                                                <td className="p-4">{app.address.phone}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        app.status==='approved'?'bg-green-100 text-green-700':
                                                        app.status==='correction'?'bg-red-100 text-red-700':
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {app.status==='approved'?'อนุมัติ':app.status==='correction'?'แก้ไข':'รอตรวจ'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button 
                                                      onClick={() => handleAdminSelectApplicant(app)} 
                                                      className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 shadow-sm text-xs font-bold flex items-center gap-1 mx-auto"
                                                    >
                                                      <Edit size={12}/> ตรวจสอบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredApplicants.length === 0 && (
                                          <tr>
                                            <td colSpan="7" className="p-8 text-center text-gray-400">
                                              <FileText size={48} className="mx-auto mb-2 opacity-20"/>
                                              ไม่พบข้อมูลผู้สมัคร
                                            </td>
                                          </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* View: Detail (Verify) */}
                {adminView === 'detail' && (
                  <div className="flex flex-col md:flex-row h-full overflow-hidden">
                     {/* Left: Tools */}
                     <div className="w-full md:w-[400px] bg-white border-r flex flex-col h-full overflow-y-auto p-4 shadow-lg z-10">
                        <button 
                          onClick={()=>setAdminView('dashboard')} 
                          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm p-2 hover:bg-gray-100 rounded transition"
                        >
                          ← กลับไปหน้ารายชื่อ
                        </button>

                        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-4 rounded-lg border mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                                <User className="text-emerald-600" size={24}/>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800">{formData.prefix}{formData.firstName} {formData.lastName}</h3>
                                <p className="text-sm text-gray-600">{formData.displayPosition}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                              <div className="bg-white p-2 rounded">
                                <span className="text-gray-500">เลขบัตร:</span>
                                <div className="font-mono font-bold">{formData.idCardNumber}</div>
                              </div>
                              <div className="bg-white p-2 rounded">
                                <span className="text-gray-500">โทร:</span>
                                <div className="font-bold">{formData.address.phone}</div>
                              </div>
                            </div>
                        </div>

                        <h4 className="font-bold text-sm mb-2 text-gray-700 flex items-center gap-2">
                          <CheckCircle size={16}/> ตรวจสอบเอกสาร
                        </h4>
                        <div className="space-y-2 mb-6">
                            {[
                              {key: 'houseReg', label: 'ทะเบียนบ้าน'},
                              {key: 'idCard', label: 'บัตรปชช.'},
                              {key: 'education', label: 'วุฒิการศึกษา'},
                              {key: 'medical', label: 'ใบรับรองแพทย์'}
                            ].map(({key, label}) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-white border rounded hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-700 font-medium">{label}</span>
                                      {formData.attachments[key].file && (
                                        <button
                                          onClick={() => setPreviewFile({
                                            data: formData.attachments[key].fileData,
                                            name: formData.attachments[key].file
                                          })}
                                          className="text-blue-500 hover:text-blue-600"
                                          title="ดูไฟล์"
                                        >
                                          <Eye size={14}/>
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                          onClick={()=>verifyDoc(key, true)} 
                                          className={`p-1.5 rounded transition ${formData.attachments[key].verified===true?'bg-green-500 text-white shadow-md':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                          title="อนุมัติ"
                                        >
                                          <Check size={14}/>
                                        </button>
                                        <button
                                          onClick={()=>verifyDoc(key, false)} 
                                          className={`p-1.5 rounded transition ${formData.attachments[key].verified===false?'bg-red-500 text-white shadow-md':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                          title="ไม่ผ่าน"
                                        >
                                          <X size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h4 className="font-bold text-sm mb-2 text-gray-700">ผลการพิจารณา</h4>
                        <textarea 
                            className="w-full border rounded p-3 text-sm mb-3 h-32 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" 
                            placeholder="ระบุเหตุผล (กรณีส่งคืนแก้ไข)"
                            value={formData.adminFeedback}
                            onChange={(e)=>handleAdminFeedbackChange(e.target.value)}
                        ></textarea>

                        <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={()=>handleAdminAction('reject')} 
                              className="bg-white border-2 border-red-500 text-red-600 py-3 rounded-lg hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-1 transition"
                            >
                              <X size={16}/> ส่งคืนแก้ไข
                            </button>
                            <button 
                              onClick={()=>handleAdminAction('approve')} 
                              className="bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-bold text-sm shadow-lg flex items-center justify-center gap-1 transition"
                            >
                              <Check size={16}/> อนุมัติ
                            </button>
                        </div>
                     </div>

                     {/* Right: Preview */}
                     <div className="flex-1 bg-gray-500 p-8 overflow-y-auto">
                        <div className="bg-white shadow-2xl mx-auto relative print:shadow-none print-container print-scale" style={{ width: '210mm', minHeight: '297mm', padding: '25mm 25mm', boxSizing: 'border-box' }}>
                            {formData.status === 'approved' && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden">
                                  <div className="border-[8px] border-green-600/20 text-green-600/20 font-bold text-[80px] -rotate-45 p-8 rounded-3xl uppercase tracking-widest whitespace-nowrap select-none">
                                  อนุมัติแล้ว
                                  </div>
                              </div>
                            )}

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-[2.2cm] h-[2.2cm] flex items-center justify-center pt-1">
                                  <img src={LOGO_URL} className="w-full h-full object-contain" onError={(e)=>{e.target.style.visibility='hidden'}}/>
                                </div>
                                <div className="flex-1 text-center px-2 pt-2">
                                  <h1 className="font-bold text-[20px] leading-tight mb-1 text-black">ใบสมัครเข้ารับการเลือกสรรบุคคลเป็น<br/>พนักงานจ้าง</h1>
                                  <h2 className="font-bold text-[20px] leading-tight mb-1 text-black">เทศบาลเมืองอุทัยธานี</h2>
                                </div>
                                <div className="w-[2.8cm] flex flex-col items-center pt-2">
                                  <div className="w-[2.5cm] h-[3.25cm] border border-black flex items-center justify-center text-center text-sm relative overflow-hidden bg-gray-50">
                                    {formData.photoPreview ? (
                                      <img src={formData.photoPreview} className="absolute inset-0 w-full h-full object-cover"/>
                                    ) : (
                                      <span className="text-gray-400">รูปถ่าย<br/>1 นิ้ว</span>
                                    )}
                                  </div>
                                </div>
                            </div>

                            {/* Body Content */}
                            <div className="space-y-1 text-[15px] leading-snug text-black font-sarabun">
                                <div className="flex items-end">
                                  <span className="mr-2 whitespace-nowrap">๑. ชื่อ - ชื่อสกุล</span>
                                  <DottedLine text={`${formData.prefix} ${formData.firstName} ${formData.lastName}`} />
                                  <span className="mx-2 whitespace-nowrap">สัญชาติ</span>
                                  <DottedLine text={formData.nationality} width="w-[2.5cm]" center={true} />
                                </div>

                                <div className="flex items-end">
                                  <span className="mr-2 whitespace-nowrap">๒. เกิดวันที่</span>
                                  <DottedLine text={formData.birthDate ? new Date(formData.birthDate).getDate() : ''} width="w-[1.2cm]" center={true}/>
                                  <span className="mx-2 whitespace-nowrap">เดือน</span>
                                  <DottedLine text={formData.birthDate ? new Date(formData.birthDate).toLocaleString('th-TH', { month: 'long' }) : ''} width="w-[2.5cm]" center={true}/>
                                  <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
                                  <DottedLine text={formData.birthDate ? new Date(formData.birthDate).getFullYear()+543 : ''} width="w-[1.5cm]" center={true}/>
                                </div>

                                <div className="flex items-end">
                                  <span className="mr-2 whitespace-nowrap">๓. ที่อยู่ปัจจุบัน เลขที่</span>
                                  <DottedLine text={formData.address.houseNo} width="w-[1.8cm]" center={true} />
                                  <span className="mx-1 whitespace-nowrap">หมู่ที่</span>
                                  <DottedLine text={formData.address.moo} width="w-[1cm]" center={true} />
                                  <span className="mx-1 whitespace-nowrap">ถนน</span>
                                  <DottedLine text={formData.address.road} width="w-[3cm]" />
                                  <span className="mx-1 whitespace-nowrap">ตำบล</span>
                                  <DottedLine text={formData.address.subDistrict} />
                                </div>

                                <div className="flex items-end">
                                  <span className="ml-6 mr-2 whitespace-nowrap">อำเภอ</span>
                                  <DottedLine text={formData.address.district} />
                                  <span className="mx-2 whitespace-nowrap">จังหวัด</span>
                                  <DottedLine text={formData.address.province} />
                                  <span className="mx-2 whitespace-nowrap">โทรศัพท์</span>
                                  <DottedLine text={formData.address.phone} width="w-[3.5cm]" />
                                </div>

                                <div className="flex items-center pt-2">
                                  <span className="mr-4 whitespace-nowrap">๔. สถานภาพ</span>
                                  <RadioOption checked={formData.maritalStatus==='single'} label="โสด"/>
                                  <RadioOption checked={formData.maritalStatus==='married'} label="สมรส"/>
                                  <RadioOption checked={formData.maritalStatus==='divorced'} label="หย่า"/>
                                  <RadioOption checked={formData.maritalStatus==='widowed'} label="หม้าย"/>
                                  <RadioOption checked={formData.maritalStatus==='separated'} label="แยกกันอยู่"/>
                                </div>

                                <div className="flex items-end pt-1">
                                  <span className="mr-2 whitespace-nowrap">๕. ชื่อคู่สมรส</span>
                                  <DottedLine text={formData.spouseName} />
                                  <span className="mx-2 whitespace-nowrap">อาชีพ</span>
                                  <DottedLine text={formData.spouseOccupation} width="w-[3.5cm]" />
                                </div>

                                <div className="flex items-end">
                                  <span className="mr-2 whitespace-nowrap">๖. ชื่อบิดา</span>
                                  <DottedLine text={formData.fatherName} />
                                  <span className="mx-2 whitespace-nowrap">อาชีพ</span>
                                  <DottedLine text={formData.fatherOccupation} width="w-[3.5cm]" />
                                </div>

                                <div className="flex items-end">
                                  <span className="mr-2 whitespace-nowrap">๗. ชื่อมารดา</span>
                                  <DottedLine text={formData.motherName} />
                                  <span className="mx-2 whitespace-nowrap">อาชีพ</span>
                                  <DottedLine text={formData.motherOccupation} width="w-[3.5cm]" />
                                </div>

                                <div className="flex items-end pt-2">
                                  <span className="mr-2 whitespace-nowrap">๘. วุฒิการศึกษา</span>
                                  <DottedLine text={formData.education.degree} />
                                  <span className="mx-2 whitespace-nowrap">สาขาวิชา</span>
                                  <DottedLine text={formData.education.major} width="w-[4.5cm]" />
                                </div>

                                <div className="flex items-end">
                                  <span className="ml-6 mr-2 whitespace-nowrap">สถานศึกษา</span>
                                  <DottedLine text={formData.education.institution} />
                                </div>

                                <div className="flex items-end pt-2">
                                  <span className="mr-2 whitespace-nowrap">๙. ประวัติการทำงานเดิม</span>
                                  <DottedLine text={formData.prevWork} />
                                  <span className="mx-2 whitespace-nowrap">สถานที่ทำงาน</span>
                                  <DottedLine text={formData.prevWorkPlace} width="w-[5.5cm]" />
                                </div>

                                <div className="pt-3">
                                  <div className="mb-1 font-bold">๑๐. ขอสมัครเข้ารับการเลือกสรรตำแหน่ง</div>
                                  <div className="ml-6 flex items-start mb-1">
                                    <BoxOption checked={formData.displayJobType==='mission'} label="พนักงานจ้างตามภารกิจ"/>
                                    <div className="ml-4 flex items-center">
                                      <span className="mr-2">ลักษณะงาน:</span>
                                      <RadioOption checked={formData.displayMissionType==='qualified'} label="ผู้มีคุณวุฒิ"/>
                                      <RadioOption checked={formData.displayMissionType==='skilled'} label="ผู้มีทักษะ"/>
                                    </div>
                                  </div>
                                  <div className="ml-6 flex items-end mb-2">
                                    <span className="mr-2">ตำแหน่ง</span>
                                    <DottedLine text={formData.displayJobType==='mission'?formData.displayPosition:''} />
                                    <span className="mx-2">สังกัด</span>
                                    <DottedLine text={formData.displayJobType==='mission'?formData.displayDivision:''} width="w-[4.5cm]" />
                                  </div>
                                  <div className="ml-6 flex items-start mb-1">
                                    <BoxOption checked={formData.displayJobType==='general'} label="พนักงานจ้างทั่วไป"/>
                                  </div>
                                  <div className="ml-6 flex items-end">
                                    <span className="mr-2">ตำแหน่ง</span>
                                    <DottedLine text={formData.displayJobType==='general'?formData.displayPosition:''} />
                                    <span className="mx-2">สังกัด</span>
                                    <DottedLine text={formData.displayJobType==='general'?formData.displayDivision:''} width="w-[4.5cm]" />
                                  </div>
                                </div>

                                <div className="mt-6 flex justify-between items-end">
                                  <div className="border border-black p-2 w-[8cm] h-[3.5cm] flex flex-col justify-between text-[13px]">
                                    <div className="text-center font-bold underline">สำหรับเจ้าหน้าที่</div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span>ตรวจสอบหลักฐาน:</span>
                                      <BoxOption checked={formData.status==='approved'} label="ครบถ้วน"/>
                                      <BoxOption checked={formData.status==='correction'} label="ไม่ครบถ้วน"/>
                                    </div>
                                    <div className="flex items-end">
                                      <span className="whitespace-nowrap">ขาดเหลือ:</span>
                                      <DottedLine text={formData.status==='correction'?formData.adminFeedback:''} />
                                    </div>
                                    <div className="flex items-end mt-2">
                                      <span className="whitespace-nowrap">ลงชื่อเจ้าหน้าที่:</span>
                                      <DottedLine text="" />
                                    </div>
                                    <div className="flex items-end justify-center">
                                      <span className="mr-1">วันที่</span>
                                      <DottedLine text={appDateDisplay.day} width="w-[0.8cm]" center={true}/>
                                      <span className="mx-1">/</span>
                                      <DottedLine text={appDateDisplay.month} width="w-[2cm]" center={true}/>
                                      <span className="mx-1">/</span>
                                      <DottedLine text={appDateDisplay.year} width="w-[1.2cm]" center={true}/>
                                    </div>
                                  </div>

                                  <div className="w-[7.5cm] flex flex-col gap-2 text-[14px] items-center">
                                    <div className="flex items-end w-full">
                                      <span className="mr-2">(ลงชื่อ)</span>
                                      <DottedLine width="flex-1" />
                                      <span className="ml-2">ผู้สมัคร</span>
                                    </div>
                                    <div className="flex items-end w-full">
                                      <span className="mr-2 invisible">(ลงชื่อ)</span>
                                      <span className="mr-2">(</span>
                                      <DottedLine text={`${formData.prefix}${formData.firstName} ${formData.lastName}`} center={true} />
                                      <span className="ml-2">)</span>
                                    </div>
                                    <div className="flex items-end w-full justify-center">
                                      <span className="mr-1">วันที่</span>
                                      <DottedLine text={subDateDisplay.day} width="w-[0.8cm]" center={true}/>
                                      <span className="mx-1">/</span>
                                      <DottedLine text={subDateDisplay.month} width="w-[2cm]" center={true}/>
                                      <span className="mx-1">/</span>
                                      <DottedLine text={subDateDisplay.year} width="w-[1.2cm]" center={true}/>
                                    </div>
                                  </div>
                                </div>
                            </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* View: Settings (Position Manager) */}
                {adminView === 'settings' && (
                   <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                       <div className="max-w-4xl mx-auto">
                           <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="font-bold text-xl text-slate-700 flex items-center gap-2">
                              <Settings size={24}/> ตั้งค่าระบบ
                            </h3>
                            <button 
                              onClick={()=>setAdminView('dashboard')} 
                              className="text-gray-500 hover:text-black text-sm px-4 py-2 hover:bg-gray-100 rounded transition"
                            >
                              กลับ
                            </button>
                         </div>

                         {/* Position Management */}
                         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                           <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                             <Briefcase size={20}/> จัดการตำแหน่งงาน
                           </h4>

                           <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mb-4">
                             <p className="text-sm font-bold text-emerald-800 mb-3">เพิ่มตำแหน่งใหม่</p>
                             <div className="space-y-2">
                               <input 
                                 placeholder="ชื่อตำแหน่ง *" 
                                 className="border p-2 w-full rounded text-sm" 
                                 value={newPos.name} 
                                 onChange={e=>setNewPos({...newPos, name:e.target.value})}
                               />
                               <input 
                                 placeholder="สังกัด (กอง/ฝ่าย) *" 
                                 className="border p-2 w-full rounded text-sm" 
                                 value={newPos.division} 
                                 onChange={e=>setNewPos({...newPos, division:e.target.value})}
                               />
                               <div className="flex gap-2">
                                   <select 
                                     className="border p-2 rounded text-sm flex-1" 
                                     value={newPos.type} 
                                     onChange={e=>setNewPos({...newPos, type:e.target.value})}
                                   >
                                     <option value="mission">ภารกิจ</option>
                                     <option value="general">ทั่วไป</option>
                                   </select>
                                   {newPos.type==='mission' && (
                                     <select 
                                       className="border p-2 rounded text-sm flex-1" 
                                       value={newPos.missionType} 
                                       onChange={e=>setNewPos({...newPos, missionType:e.target.value})}
                                     >
                                       <option value="qualified">ผู้มีคุณวุฒิ</option>
                                       <option value="skilled">ผู้มีทักษะ</option>
                                     </select>
                                   )}
                               </div>
                               <button 
                                 onClick={handleAddPosition} 
                                 className="bg-emerald-600 text-white w-full py-2.5 rounded text-sm font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 shadow"
                               >
                                 <Plus size={16}/> เพิ่มตำแหน่ง
                               </button>
                             </div>
                           </div>

                           <div className="space-y-2">
                             <p className="text-sm font-bold text-gray-600 mb-2">รายการตำแหน่งทั้งหมด ({positions.length})</p>
                             {positions.map(p => (
                               <div key={p.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border hover:shadow-md transition">
                                   <div className="flex-1">
                                     <div className="font-bold text-sm">{p.name}</div>
                                     <div className="text-xs text-gray-500 mt-1">
                                       <span className={`inline-block px-2 py-0.5 rounded mr-2 ${p.type==='mission'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>
                                         {p.type==='mission'?'ภารกิจ':'ทั่วไป'}
                                       </span>
                                       {p.missionType && (
                                         <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-700 mr-2">
                                           {p.missionType==='qualified'?'ผู้มีคุณวุฒิ':'ผู้มีทักษะ'}
                                         </span>
                                       )}
                                       สังกัด: {p.division}
                                     </div>
                                   </div>
                                   <button 
                                     onClick={()=>handleDeletePosition(p.id)} 
                                     className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                                   >
                                     <Trash2 size={18}/>
                                   </button>
                               </div>
                             ))}
                           </div>
                         </div>

                         {/* System Tools */}
                         <div className="bg-white rounded-xl shadow-lg p-6">
                           <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-600">
                             <AlertTriangle size={20}/> เครื่องมือระบบ
                           </h4>
                           <div className="space-y-3">
                             <button 
                               onClick={handleClearData} 
                               className="w-full px-6 py-3 rounded-lg text-sm font-bold text-red-600 border-2 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2 transition"
                             >
                               <Trash2 size={16}/> ล้างข้อมูลทดสอบ (ใช้ระวัง!)
                             </button>
                             <p className="text-xs text-gray-500">
                               ⚠️ การล้างข้อมูลจะลบข้อมูลผู้สมัครทั้งหมดในเครื่องนี้ และส่งคำสั่งล้างไปยัง Google Sheets
                             </p>
                           </div>
                         </div>
                       </div>
                   </div>
                )}
             </div>
           )}
        </div>

        {/* RIGHT PANEL: PREVIEW (Only for Applicant when status is submitted/approved) */}
        {role === 'applicant' && (formData.status === 'submitted' || formData.status === 'approved') && (
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
                  <div className="w-[2.2cm] h-[2.2cm] flex items-center justify-center pt-1">
                    <img src={LOGO_URL} className="w-full h-full object-contain" onError={(e)=>{e.target.style.visibility='hidden'}}/>
                  </div>
                  <div className="flex-1 text-center px-2 pt-2">
                    <h1 className="font-bold text-[20px] leading-tight mb-1 text-black">ใบสมัครเข้ารับการเลือกสรรบุคคลเป็น<br/>พนักงานจ้าง</h1>
                    <h2 className="font-bold text-[20px] leading-tight mb-1 text-black">เทศบาลเมืองอุทัยธานี</h2>
                  </div>
                  <div className="w-[2.8cm] flex flex-col items-center pt-2">
                    <div className="w-[2.5cm] h-[3.25cm] border border-black flex items-center justify-center text-center text-sm relative overflow-hidden bg-gray-50">
                      {formData.photoPreview ? (
                        <img src={formData.photoPreview} className="absolute inset-0 w-full h-full object-cover"/>
                      ) : (
                        <span className="text-gray-400">รูปถ่าย<br/>1 นิ้ว</span>
                      )}
                    </div>
                  </div>
              </div>

              {/* Body Content */}
              <div className="space-y-1 text-[15px] leading-snug text-black font-sarabun">
                  <div className="flex items-end">
                    <span className="mr-2 whitespace-nowrap">๑. ชื่อ - ชื่อสกุล</span>
                    <DottedLine text={`${formData.prefix} ${formData.firstName} ${formData.lastName}`} />
                    <span className="mx-2 whitespace-nowrap">สัญชาติ</span>
                    <DottedLine text={formData.nationality} width="w-[2.5cm]" center={true} />
                  </div>

                  <div className="flex items-end">
                    <span className="mr-2 whitespace-nowrap">๒. เกิดวันที่</span>
                    <DottedLine text={formData.birthDate ? new Date(formData.birthDate).getDate() : ''} width="w-[1.2cm]" center={true}/>
                    <span className="mx-2 whitespace-nowrap">เดือน</span>
                    <DottedLine text={formData.birthDate ? new Date(formData.birthDate).toLocaleString('th-TH', { month: 'long' }) : ''} width="w-[2.5cm]" center={true}/>
                    <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
                    <DottedLine text={formData.birthDate ? new Date(formData.birthDate).getFullYear()+543 : ''} width="w-[1.5cm]" center={true}/>
                  </div>

                  <div className="flex items-end">
                    <span className="mr-2 whitespace-nowrap">๓. ที่อยู่ปัจจุบัน เลขที่</span>
                    <DottedLine text={formData.address.houseNo} width="w-[1.8cm]" center={true} />
                    <span className="mx-1 whitespace-nowrap">หมู่ที่</span>
                    <DottedLine text={formData.address.moo} width="w-[1cm]" center={true} />
                    <span className="mx-1 whitespace-nowrap">ถนน</span>
                    <DottedLine text={formData.address.road} width="w-[3cm]" />
                    <span className="mx-1 whitespace-nowrap">ตำบล</span>
                    <DottedLine text={formData.address.subDistrict} />
                  </div>

                  <div className="flex items-end">
                    <span className="ml-6 mr-2 whitespace-nowrap">อำเภอ</span>
                    <DottedLine text={formData.address.district} />
                    <span className="mx-2 whitespace-nowrap">จังหวัด</span>
                    <DottedLine text={formData.address.province} />
                    <span className="mx-2 whitespace-nowrap">โทรศัพท์</span>
                    <DottedLine text={formData.address.phone} width="w-[3.5cm]" />
                  </div>

                  <div className="flex items-center pt-2">
                    <span className="mr-4 whitespace-nowrap">๔. สถานภาพ</span>
                    <RadioOption checked={formData.maritalStatus==='single'} label="โสด"/>
                    <RadioOption checked={formData.maritalStatus==='married'} label="สมรส"/>
                    <RadioOption checked={formData.maritalStatus==='divorced'} label="หย่า"/>
                    <RadioOption checked={formData.maritalStatus==='widowed'} label="หม้าย"/>
                    <RadioOption checked={formData.maritalStatus==='separated'} label="แยกกันอยู่"/>
                  </div>

                  <div className="flex items-end pt-1">
                    <span className="mr-2 whitespace-nowrap">๕. ชื่อคู่สมรส</span>
                    <DottedLine text={formData.spouseName} />
                    <span className="mx-2 whitespace-nowrap">อาชีพ</span>
                    <DottedLine text={formData.spouseOccupation} width="w-[3.5cm]" />
                  </div>

                  <div className="flex items-end">
                    <span className="mr-2 whitespace-nowrap">๖. ชื่อบิดา</span>
                    <DottedLine text={formData.fatherName} />
                    <span className="mx-2 whitespace-nowrap">อาชีพ</span>
                    <DottedLine text={formData.fatherOccupation} width="w-[3.5cm]" />
                  </div>

                  <div className="flex items-end">
                    <span className="mr-2 whitespace-nowrap">๗. ชื่อมารดา</span>
                    <DottedLine text={formData.motherName} />
                    <span className="mx-2 whitespace-nowrap">อาชีพ</span>
                    <DottedLine text={formData.motherOccupation} width="w-[3.5cm]" />
                  </div>

                  <div className="flex items-end pt-2">
                    <span className="mr-2 whitespace-nowrap">๘. วุฒิการศึกษา</span>
                    <DottedLine text={formData.education.degree} />
                    <span className="mx-2 whitespace-nowrap">สาขาวิชา</span>
                    <DottedLine text={formData.education.major} width="w-[4.5cm]" />
                  </div>

                  <div className="flex items-end">
                    <span className="ml-6 mr-2 whitespace-nowrap">สถานศึกษา</span>
                    <DottedLine text={formData.education.institution} />
                  </div>

                  <div className="flex items-end pt-2">
                    <span className="mr-2 whitespace-nowrap">๙. ประวัติการทำงานเดิม</span>
                    <DottedLine text={formData.prevWork} />
                    <span className="mx-2 whitespace-nowrap">สถานที่ทำงาน</span>
                    <DottedLine text={formData.prevWorkPlace} width="w-[5.5cm]" />
                  </div>

                  <div className="pt-3">
                    <div className="mb-1 font-bold">๑๐. ขอสมัครเข้ารับการเลือกสรรตำแหน่ง</div>
                    <div className="ml-6 flex items-start mb-1">
                      <BoxOption checked={formData.displayJobType==='mission'} label="พนักงานจ้างตามภารกิจ"/>
                      <div className="ml-4 flex items-center">
                        <span className="mr-2">ลักษณะงาน:</span>
                        <RadioOption checked={formData.displayMissionType==='qualified'} label="ผู้มีคุณวุฒิ"/>
                        <RadioOption checked={formData.displayMissionType==='skilled'} label="ผู้มีทักษะ"/>
                      </div>
                    </div>
                    <div className="ml-6 flex items-end mb-2">
                      <span className="mr-2">ตำแหน่ง</span>
                      <DottedLine text={formData.displayJobType==='mission'?formData.displayPosition:''} />
                      <span className="mx-2">สังกัด</span>
                      <DottedLine text={formData.displayJobType==='mission'?formData.displayDivision:''} width="w-[4.5cm]" />
                    </div>
                    <div className="ml-6 flex items-start mb-1">
                      <BoxOption checked={formData.displayJobType==='general'} label="พนักงานจ้างทั่วไป"/>
                    </div>
                    <div className="ml-6 flex items-end">
                      <span className="mr-2">ตำแหน่ง</span>
                      <DottedLine text={formData.displayJobType==='general'?formData.displayPosition:''} />
                      <span className="mx-2">สังกัด</span>
                      <DottedLine text={formData.displayJobType==='general'?formData.displayDivision:''} width="w-[4.5cm]" />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-end">
                    <div className="border border-black p-2 w-[8cm] h-[3.5cm] flex flex-col justify-between text-[13px]">
                      <div className="text-center font-bold underline">สำหรับเจ้าหน้าที่</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span>ตรวจสอบหลักฐาน:</span>
                        <BoxOption checked={formData.status==='approved'} label="ครบถ้วน"/>
                        <BoxOption checked={formData.status==='correction'} label="ไม่ครบถ้วน"/>
                      </div>
                      <div className="flex items-end">
                        <span className="whitespace-nowrap">ขาดเหลือ:</span>
                        <DottedLine text={formData.status==='correction'?formData.adminFeedback:''} />
                      </div>
                      <div className="flex items-end mt-2">
                        <span className="whitespace-nowrap">ลงชื่อเจ้าหน้าที่:</span>
                        <DottedLine text="" />
                      </div>
                      <div className="flex items-end justify-center">
                        <span className="mr-1">วันที่</span>
                        <DottedLine text={appDateDisplay.day} width="w-[0.8cm]" center={true}/>
                        <span className="mx-1">/</span>
                        <DottedLine text={appDateDisplay.month} width="w-[2cm]" center={true}/>
                        <span className="mx-1">/</span>
                        <DottedLine text={appDateDisplay.year} width="w-[1.2cm]" center={true}/>
                      </div>
                    </div>

                    <div className="w-[7.5cm] flex flex-col gap-2 text-[14px] items-center">
                      <div className="flex items-end w-full">
                        <span className="mr-2">(ลงชื่อ)</span>
                        <DottedLine width="flex-1" />
                        <span className="ml-2">ผู้สมัคร</span>
                      </div>
                      <div className="flex items-end w-full">
                        <span className="mr-2 invisible">(ลงชื่อ)</span>
                        <span className="mr-2">(</span>
                        <DottedLine text={`${formData.prefix}${formData.firstName} ${formData.lastName}`} center={true} />
                        <span className="ml-2">)</span>
                      </div>
                      <div className="flex items-end w-full justify-center">
                        <span className="mr-1">วันที่</span>
                        <DottedLine text={subDateDisplay.day} width="w-[0.8cm]" center={true}/>
                        <span className="mx-1">/</span>
                        <DottedLine text={subDateDisplay.month} width="w-[2cm]" center={true}/>
                        <span className="mx-1">/</span>
                        <DottedLine text={subDateDisplay.year} width="w-[1.2cm]" center={true}/>
                      </div>
                    </div>
                  </div>
              </div>
           </div>
        </div>
        )}
      </div>
    </div>
  );
}
