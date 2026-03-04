import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { generateExamCard } from '../utils/generateExamCard'
import { exportToExcel } from '../utils/exportExcel'
import { sendLineNotify, formatStatusMessage } from '../utils/lineNotify'
import ExamCardTemplate from '../components/ExamCardTemplate'
import ApplicationFormTemplate from '../components/ApplicationFormTemplate'
import { generateApplicationForm } from '../utils/generateApplicationForm'
import {
    LayoutDashboard, Users, Briefcase, Settings, LogOut, Search, FileSpreadsheet,
    Eye, CheckCircle2, XCircle, AlertTriangle, FileText, Printer, Trash2,
    Plus, Edit3, ToggleLeft, ToggleRight, ChevronRight, Menu, X, Clock,
    BarChart3, Filter, RefreshCw, Download, ChevronDown, Globe,
    StickyNote, CalendarClock, CheckSquare, Square, Settings2,
    CalendarDays, UserCog, KeyRound, ShieldCheck, Ban
} from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [applications, setApplications] = useState([])
    const [positions, setPositions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPosition, setFilterPosition] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    // Sidebar & Navigation
    const [activeSection, setActiveSection] = useState('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    // Modals
    const [selectedApp, setSelectedApp] = useState(null)
    const [documents, setDocuments] = useState([])
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showCardModal, setShowCardModal] = useState(false)
    const [showPosModal, setShowPosModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
    const [showRejectModal, setShowRejectModal] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [rejectType, setRejectType] = useState('rejected') // 'rejected' | 'edit_requested'
    // Audit
    const [auditLogs, setAuditLogs] = useState([])
    // Card generation
    const [cardApp, setCardApp] = useState(null)
    const [cardPos, setCardPos] = useState(null)
    const [generatingPdf, setGeneratingPdf] = useState(false)
    const cardRef = useRef(null)
    const [appFormApp, setAppFormApp] = useState(null)
    const [appFormPos, setAppFormPos] = useState(null)
    const [showAppFormModal, setShowAppFormModal] = useState(false)
    const [generatingAppFormPdf, setGeneratingAppFormPdf] = useState(false)

    // Position form
    const [posForm, setPosForm] = useState({ title: '', department: '', is_active: true, quota: '', salary_range: '', requirements: '', open_date: '', close_date: '' })
    const [editingPos, setEditingPos] = useState(null)
    // Stats
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, editRequested: 0 })
    // Bulk selection
    const [selectedIds, setSelectedIds] = useState(new Set())
    // Admin notes
    const [adminNote, setAdminNote] = useState('')
    const [savingNote, setSavingNote] = useState(false)
    // Settings
    const [settingsForm, setSettingsForm] = useState({ open_date: '', close_date: '', max_per_position: '' })
    const [settingsSaved, setSettingsSaved] = useState(false)
    // Data masking
    const [revealedIds, setRevealedIds] = useState(new Set())
    // Confirm modals
    const [showApproveConfirm, setShowApproveConfirm] = useState(null)
    const [showDeletePosConfirm, setShowDeletePosConfirm] = useState(null)
    const [showTogglePosConfirm, setShowTogglePosConfirm] = useState(null)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    // Fiscal Years
    const [fiscalYears, setFiscalYears] = useState([])
    const [fyForm, setFyForm] = useState({ year: '', label: '', open_date: '', close_date: '', is_active: false })
    const [editingFy, setEditingFy] = useState(null)
    const [showFyModal, setShowFyModal] = useState(false)
    const [showDeleteFyConfirm, setShowDeleteFyConfirm] = useState(null)
    // Admin Users
    const [adminUsers, setAdminUsers] = useState([])
    const [userForm, setUserForm] = useState({ username: '', password: '', role: 'admin', is_active: true })
    const [editingUser, setEditingUser] = useState(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(null)

    useEffect(() => {
        if (sessionStorage.getItem('admin_auth') !== 'true') navigate('/admin')
    }, [navigate])

    useEffect(() => {
        fetchData()
        fetchAuditLogs()

        // Supabase Realtime Listener for new/updated applications
        const channel = supabase.channel('applications_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, (payload) => {
                fetchData() // Refresh data on any change
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    async function fetchData() {
        setLoading(true)
        const [appsRes, posRes] = await Promise.all([
            supabase.from('applications').select('*').order('created_at', { ascending: false }),
            supabase.from('positions').select('*').order('department'),
        ])
        const apps = appsRes.data || []
        setApplications(apps)
        setPositions(posRes.data || [])
        setStats({
            total: apps.length,
            pending: apps.filter(a => a.status === 'pending').length,
            approved: apps.filter(a => a.status === 'approved').length,
            rejected: apps.filter(a => a.status === 'rejected').length,
            editRequested: apps.filter(a => a.status === 'edit_requested').length,
        })
        setLoading(false)
    }

    async function fetchAuditLogs() {
        const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
        setAuditLogs(data || [])
    }

    async function writeAuditLog(action, targetId, metadata = {}) {
        await supabase.from('audit_logs').insert({ actor: 'admin', action, target_id: targetId, target_type: 'application', metadata })
    }

    // ── Status Changes ──
    async function handleApprove(appId) {
        const approvedCount = applications.filter(a => a.status === 'approved').length
        const examNumber = String(approvedCount + 1).padStart(4, '0')
        const { error } = await supabase.from('applications').update({ status: 'approved', exam_number: examNumber }).eq('id', appId)
        if (error) console.error("Approve Error:", error);
        await writeAuditLog('approve', appId, { exam_number: examNumber })
        const app = applications.find(a => a.id === appId)
        const pos = positions.find(p => p.id === app?.position_id)
        if (app) sendLineNotify(formatStatusMessage({ ...app, exam_number: examNumber }, 'approved', pos))
        fetchData()
    }

    async function handleRejectSubmit() {
        if (!showRejectModal || !rejectReason.trim()) return
        const { error } = await supabase.from('applications').update({ status: rejectType, reject_reason: rejectReason }).eq('id', showRejectModal.id)
        if (error) console.error("Reject Error:", error);
        await writeAuditLog(rejectType, showRejectModal.id, { reason: rejectReason })
        const pos = positions.find(p => p.id === showRejectModal.position_id)
        sendLineNotify(formatStatusMessage(showRejectModal, rejectType, pos))
        setShowRejectModal(null); setRejectReason(''); setRejectType('rejected')
        fetchData()
    }

    // ── Delete Application ──
    async function handleDeleteApp(appId) {
        const { error: err1 } = await supabase.from('documents').delete().eq('application_id', appId)
        if (err1) console.error("Delete Docs Error:", err1);
        const { error: err2 } = await supabase.from('applications').delete().eq('id', appId)
        if (err2) console.error("Delete App Error:", err2);
        await writeAuditLog('delete_application', appId)
        setShowDeleteConfirm(null); fetchData()
    }

    // ── Position CRUD ──
    async function handleSavePosition() {
        if (!posForm.title.trim() || !posForm.department.trim()) return
        if (editingPos) {
            const { error } = await supabase.from('positions').update(posForm).eq('id', editingPos.id)
            if (error) alert("Error updating position: " + error.message);
            await writeAuditLog('update_position', editingPos.id, posForm)
        } else {
            const { error } = await supabase.from('positions').insert(posForm)
            if (error) alert("Error creating position: " + error.message);
            await writeAuditLog('create_position', null, posForm)
        }
        setPosForm({ title: '', department: '', is_active: true }); setEditingPos(null); setShowPosModal(false); fetchData()
    }

    async function handleDeletePosition(posId) {
        const { error } = await supabase.from('positions').delete().eq('id', posId)
        if (error) {
            console.error("Delete Position Error:", error);
            alert("ไม่สามารถลบตำแหน่งได้: " + error.message);
        }
        await writeAuditLog('delete_position', posId); fetchData()
    }

    // ── Data Masking ──
    const toggleReveal = async (appId) => {
        setRevealedIds(prev => {
            const n = new Set(prev)
            if (n.has(appId)) {
                n.delete(appId)
            } else {
                n.add(appId)
                // Log when admin reveals masked data
                writeAuditLog('reveal_data', appId, { message: 'Viewed masked citizen ID & phone' })
            }
            return n
        })
    }
    const maskId = (id) => id ? `${id[0]}-${id.slice(1, 5)}**-*****-**-${id[12]}` : '-'
    const maskPhone = (phone) => phone ? `${phone.slice(0, 3)}-***-${phone.slice(6)}` : '-'

    async function handleTogglePositionConfirmed(pos) {
        await supabase.from('positions').update({ is_active: !pos.is_active }).eq('id', pos.id)
        setShowTogglePosConfirm(null); fetchData()
    }

    // ── View Docs / Review ──
    async function handleReview(app) {
        setSelectedApp(app)
        const { data } = await supabase.from('documents').select('*').eq('application_id', app.id)
        setDocuments(data || [])
        setShowReviewModal(true)
        await writeAuditLog('review', app.id, { applicant: app.full_name })
    }

    // ── Exam Card ──
    async function handleGenerateCard(app) {
        const pos = positions.find(p => p.id === app.position_id)
        const { data: docs } = await supabase.from('documents').select('*').eq('application_id', app.id).eq('file_type', 'photo').limit(1)
        setCardApp({ ...app, photoUrl: docs?.[0]?.file_url || null })
        setCardPos(pos); setShowCardModal(true)
    }

    const handleCardReady = useCallback(async (el) => {
        if (generatingPdf) return
        setGeneratingPdf(true); cardRef.current = el
        await new Promise(r => setTimeout(r, 500))
        await generateExamCard(el, cardApp)
        setGeneratingPdf(false); setShowCardModal(false)
        await writeAuditLog('generate_exam_card', cardApp.id, { exam_number: cardApp.exam_number })
    }, [cardApp, generatingPdf])

    // ── App Form ──
    async function handleGenerateAppForm(app) {
        const pos = positions.find(p => p.id === app.position_id)
        setAppFormApp(app); setAppFormPos(pos); setShowAppFormModal(true)
    }

    const handleAppFormReady = useCallback(async (el) => {
        if (generatingAppFormPdf) return
        setGeneratingAppFormPdf(true)
        await new Promise(r => setTimeout(r, 500))
        await generateApplicationForm(el, appFormApp)
        setGeneratingAppFormPdf(false); setShowAppFormModal(false)
        await writeAuditLog('generate_app_form', appFormApp.id, {})
    }, [appFormApp, generatingAppFormPdf])

    // ── Excel ──
    const handleExportExcel = () => exportToExcel(filteredApps, positions, 'ผู้สมัครงาน')

    // ── Admin Notes ──
    async function handleSaveNote(appId) {
        setSavingNote(true)
        await supabase.from('applications').update({ admin_notes: adminNote }).eq('id', appId)
        await writeAuditLog('add_note', appId, { note: adminNote })
        setSavingNote(false)
        fetchData()
    }

    // ── Helpers ──
    const getPos = (posId) => positions.find(p => p.id === posId)
    const filteredApps = applications.filter(app => {
        if (filterStatus !== 'all' && app.status !== filterStatus) return false
        if (filterPosition !== 'all' && app.position_id !== filterPosition) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            if (!app.full_name?.toLowerCase().includes(q) && !app.citizen_id?.includes(q)) return false
        }
        return true
    })

    // ── Bulk Selection ──
    const toggleSelect = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
    const toggleSelectAll = () => {
        const approvedIds = filteredApps.filter(a => a.status === 'approved').map(a => a.id)
        if (approvedIds.every(id => selectedIds.has(id))) setSelectedIds(new Set())
        else setSelectedIds(new Set(approvedIds))
    }
    const selectedApps = filteredApps.filter(a => selectedIds.has(a.id))

    // ── Bulk Print (open each card modal sequentially) ──
    const handleBulkPrint = async () => {
        for (const app of selectedApps) {
            await handleGenerateCard(app)
        }
    }

    // ── Settings ──
    async function handleSaveSettings() {
        localStorage.setItem('uthai_admin_settings', JSON.stringify(settingsForm))
        setSettingsSaved(true)
        setTimeout(() => setSettingsSaved(false), 2000)
    }

    // Load settings on mount
    useEffect(() => {
        const saved = localStorage.getItem('uthai_admin_settings')
        if (saved) try { setSettingsForm(JSON.parse(saved)) } catch { }
    }, [])

    const handleLogout = () => { setShowLogoutConfirm(true) }
    const handleLogoutConfirmed = () => { sessionStorage.removeItem('admin_auth'); navigate('/admin') }

    // ── Fiscal Year CRUD ──
    async function fetchFiscalYears() {
        const { data } = await supabase.from('fiscal_years').select('*').order('year', { ascending: false })
        setFiscalYears(data || [])
    }
    async function handleSaveFY() {
        if (!fyForm.year || !fyForm.label) return
        if (editingFy) {
            await supabase.from('fiscal_years').update(fyForm).eq('id', editingFy.id)
            await writeAuditLog('update_fiscal_year', editingFy.id, fyForm)
        } else {
            await supabase.from('fiscal_years').insert(fyForm)
            await writeAuditLog('create_fiscal_year', null, fyForm)
        }
        setShowFyModal(false); setFyForm({ year: '', label: '', open_date: '', close_date: '', is_active: false }); setEditingFy(null)
        fetchFiscalYears()
    }
    async function handleDeleteFY(id) {
        await supabase.from('fiscal_years').delete().eq('id', id)
        await writeAuditLog('delete_fiscal_year', id)
        setShowDeleteFyConfirm(null); fetchFiscalYears()
    }
    async function handleSetActiveFY(fy) {
        await supabase.from('fiscal_years').update({ is_active: false }).neq('id', 0)
        await supabase.from('fiscal_years').update({ is_active: true }).eq('id', fy.id)
        await writeAuditLog('set_active_fiscal_year', fy.id, { year: fy.year })
        fetchFiscalYears()
    }
    useEffect(() => { fetchFiscalYears() }, [])

    // ── Admin Users CRUD ──
    async function fetchAdminUsers() {
        const { data } = await supabase.from('admin_users').select('id, username, role, is_active, created_at').order('created_at', { ascending: false })
        setAdminUsers(data || [])
    }
    async function handleSaveUser() {
        if (!userForm.username.trim() || (!editingUser && !userForm.password.trim())) return
        if (editingUser) {
            const updateData = { username: userForm.username, role: userForm.role, is_active: userForm.is_active }
            if (userForm.password.trim()) updateData.password = userForm.password
            await supabase.from('admin_users').update(updateData).eq('id', editingUser.id)
            await writeAuditLog('update_admin_user', editingUser.id, { username: userForm.username })
        } else {
            await supabase.from('admin_users').insert(userForm)
            await writeAuditLog('create_admin_user', null, { username: userForm.username })
        }
        setShowUserModal(false); setUserForm({ username: '', password: '', role: 'admin', is_active: true }); setEditingUser(null)
        fetchAdminUsers()
    }
    async function handleDeleteUser(id) {
        await supabase.from('admin_users').delete().eq('id', id)
        await writeAuditLog('delete_admin_user', id)
        setShowDeleteUserConfirm(null); fetchAdminUsers()
    }
    useEffect(() => { fetchAdminUsers() }, [])

    // ── NAV ITEMS ──
    const navItems = [
        { key: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
        { key: 'applicants', label: 'ผู้สมัครงาน', icon: Users, badge: stats.pending > 0 ? stats.pending : null },
        { key: 'positions', label: 'ตำแหน่งงาน', icon: Briefcase, badge: positions.length },
        { key: 'fiscal_years', label: 'ปีงบประมาณ', icon: CalendarDays },
        { key: 'admin_users', label: 'ผู้ดูแลระบบ', icon: UserCog },
        { key: 'audit', label: 'ประวัติการใช้งาน', icon: Clock },
        { key: 'settings', label: 'ตั้งค่าระบบ', icon: Settings2 },
    ]

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0f0d]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0a0f0d] flex">
            {/* ═══ SIDEBAR ═══ */}
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-white dark:bg-[#0f1a14] border-r border-gray-200 dark:border-[#1e2a24] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} sticky top-0 h-screen z-40`}>
                {/* Logo */}
                <div className="p-4 border-b border-gray-100 dark:border-[#1e2a24] flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 flex-shrink-0" />
                    {sidebarOpen && (
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-primary truncate">ระบบจัดการใบสมัคร</p>
                            <p className="text-xs text-gray-400 truncate">เทศบาลเมืองอุทัยธานี</p>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 px-3 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => { setActiveSection(item.key); if (item.key === 'audit') fetchAuditLogs() }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${activeSection === item.key
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1e2a24] hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${activeSection === item.key ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                            {sidebarOpen && <span className="flex-1 text-left truncate">{item.label}</span>}
                            {sidebarOpen && item.badge && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-gray-100 dark:border-[#1e2a24] space-y-1">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1e2a24] transition-all">
                        <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                        {sidebarOpen && <span>ย่อเมนู</span>}
                    </button>
                    <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1e2a24] transition-all">
                        <Globe className="w-5 h-5" />
                        {sidebarOpen && <span>กลับเว็บไซต์</span>}
                    </Link>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>ออกจากระบบ</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0f1a14] shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-[#1e2a24] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src="/logo.png" alt="Logo" className="w-10 h-10" />
                                <p className="text-sm font-bold text-primary">ระบบจัดการ</p>
                            </div>
                            <button onClick={() => setMobileSidebarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e2a24] rounded-xl"><X className="w-5 h-5 text-gray-500 dark:text-gray-400" /></button>
                        </div>
                        <nav className="flex-1 py-4 px-3 space-y-1">
                            {navItems.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => { setActiveSection(item.key); if (item.key === 'audit') fetchAuditLogs(); setMobileSidebarOpen(false) }}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${activeSection === item.key ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1e2a24]'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.badge && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">{item.badge}</span>}
                                </button>
                            ))}
                        </nav>
                        <div className="p-3 border-t border-gray-100 dark:border-[#1e2a24]">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <LogOut className="w-5 h-5" /><span>ออกจากระบบ</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* ═══ MAIN AREA ═══ */}
            <div className="flex-1 min-w-0">
                {/* Top Bar */}
                <header className="bg-white dark:bg-[#0f1a14] border-b border-gray-200 dark:border-[#1e2a24] sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-[#1e2a24] rounded-xl">
                                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {navItems.find(n => n.key === activeSection)?.label || 'ภาพรวม'}
                                </h1>
                                <p className="text-xs text-gray-400 hidden sm:block">Admin Panel — เทศบาลเมืองอุทัยธานี</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchData} className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e2a24] rounded-xl transition-colors" title="รีเฟรช">
                                <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> ออนไลน์
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {/* ═══ SECTION: Dashboard ═══ */}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: 'ทั้งหมด', value: stats.total, icon: Users, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
                                    { label: 'รอตรวจสอบ', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
                                    { label: 'มีสิทธิ์สอบ', value: stats.approved, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50' },
                                    { label: 'ไม่ผ่าน', value: stats.rejected, icon: XCircle, gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50' },
                                    { label: 'ขอแก้ไข', value: stats.editRequested, icon: AlertTriangle, gradient: 'from-orange-400 to-amber-600', bg: 'bg-orange-50' },
                                ].map((stat) => (
                                    <button key={stat.label}
                                        onClick={() => { setActiveSection('applicants'); setFilterStatus(stat.label === 'ทั้งหมด' ? 'all' : stat.label === 'รอตรวจสอบ' ? 'pending' : stat.label === 'มีสิทธิ์สอบ' ? 'approved' : stat.label === 'ไม่ผ่าน' ? 'rejected' : 'edit_requested') }}
                                        className="relative overflow-hidden bg-white dark:bg-[#151f1a] rounded-2xl p-5 border border-gray-100 dark:border-[#1e2a24] shadow-sm hover:shadow-md transition-all text-left group"
                                    >
                                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-bl-[32px] group-hover:opacity-10 transition-opacity`} />
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                                <stat.icon className={`w-4 h-4`} style={{ color: stat.gradient.includes('blue') ? '#3b82f6' : stat.gradient.includes('amber') ? '#f59e0b' : stat.gradient.includes('emerald') ? '#059669' : stat.gradient.includes('red') ? '#dc2626' : '#f97316' }} />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-extrabold text-gray-800 dark:text-white">{stat.value}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <button onClick={() => setActiveSection('applicants')} className="bg-white dark:bg-[#151f1a] rounded-2xl p-4 border border-gray-100 dark:border-[#1e2a24] shadow-sm hover:shadow-md transition-all text-left group">
                                    <Users className="w-6 h-6 text-primary mb-2" />
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">ดูผู้สมัคร</p>
                                    <p className="text-xs text-gray-400 mt-0.5">ตรวจสอบและจัดการใบสมัคร</p>
                                </button>
                                <button onClick={() => setActiveSection('positions')} className="bg-white dark:bg-[#151f1a] rounded-2xl p-4 border border-gray-100 dark:border-[#1e2a24] shadow-sm hover:shadow-md transition-all text-left group">
                                    <Briefcase className="w-6 h-6 text-primary mb-2" />
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">ตำแหน่งงาน</p>
                                    <p className="text-xs text-gray-400 mt-0.5">เพิ่ม/แก้ไข ตำแหน่ง {positions.length} รายการ</p>
                                </button>
                                <button onClick={handleExportExcel} className="bg-white dark:bg-[#151f1a] rounded-2xl p-4 border border-gray-100 dark:border-[#1e2a24] shadow-sm hover:shadow-md transition-all text-left group">
                                    <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-2" />
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">ส่งออก Excel</p>
                                    <p className="text-xs text-gray-400 mt-0.5">ดาวน์โหลดข้อมูลผู้สมัคร</p>
                                </button>
                                <button onClick={() => { setActiveSection('audit'); fetchAuditLogs() }} className="bg-white dark:bg-[#151f1a] rounded-2xl p-4 border border-gray-100 dark:border-[#1e2a24] shadow-sm hover:shadow-md transition-all text-left group">
                                    <BarChart3 className="w-6 h-6 text-violet-600 mb-2" />
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">ประวัติ</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Audit Log ทุกการดำเนินการ</p>
                                </button>
                            </div>

                            {/* Recent Pending */}
                            {stats.pending > 0 && (
                                <div className="bg-white dark:bg-[#151f1a] rounded-2xl border border-gray-100 dark:border-[#1e2a24] shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1e2a24] flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> รอตรวจสอบล่าสุด</h3>
                                        <button onClick={() => { setActiveSection('applicants'); setFilterStatus('pending') }} className="text-xs text-primary hover:underline">ดูทั้งหมด →</button>
                                    </div>
                                    <div className="divide-y divide-gray-50 dark:divide-[#1e2a24]">
                                        {applications.filter(a => a.status === 'pending').slice(0, 5).map(app => {
                                            const pos = getPos(app.position_id)
                                            return (
                                                <div key={app.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1e2a24] transition-colors">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{app.full_name}</p>
                                                        <p className="text-xs text-gray-400">{pos?.title} — {pos?.department}</p>
                                                    </div>
                                                    <button onClick={() => handleReview(app)} className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                                                        <Eye className="w-3.5 h-3.5" /> ตรวจสอบ
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Applicants-per-Position Bar Chart */}
                            {positions.length > 0 && (
                                <div className="bg-white dark:bg-[#151f1a] rounded-2xl border border-gray-100 dark:border-[#1e2a24] shadow-sm p-5">
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-violet-500" />
                                        สัดส่วนผู้สมัครตามตำแหน่ง
                                    </h3>
                                    <div className="space-y-3">
                                        {positions.map(pos => {
                                            const count = applications.filter(a => a.position_id === pos.id).length
                                            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                                            return (
                                                <div key={pos.id}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">{pos.title} — {pos.department}</span>
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-2">{count} คน</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {stats.total === 0 && <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีผู้สมัคร</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ SECTION: Applicants ═══ */}
                    {activeSection === 'applicants' && (
                        <div className="space-y-4">
                            {/* Bulk Action Toolbar */}
                            {selectedIds.size > 0 && (
                                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium text-primary">
                                        เลือก {selectedIds.size} รายการ (มีสิทธิ์สอบ)
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
                                            ยกเลิกการเลือก
                                        </button>
                                        <button onClick={handleBulkPrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark">
                                            <Printer className="w-3.5 h-3.5" /> พิมพ์บัตรสอบทั้งหมด ({selectedIds.size})
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Toolbar */}
                            <div className="bg-white dark:bg-[#151f1a] rounded-2xl p-5 border border-gray-100 dark:border-[#1e2a24] shadow-sm space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="text" placeholder="ค้นหาชื่อ หรือ เลขบัตรประชาชน..." value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                                    </div>
                                    <button onClick={handleExportExcel}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold rounded-xl hover:bg-emerald-100 transition-all text-sm whitespace-nowrap">
                                        <FileSpreadsheet className="w-4 h-4" /> Export Excel
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-[#1e2a24] focus:outline-none bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 text-sm">
                                            <option value="all">ทุกสถานะ</option>
                                            <option value="pending">⏳ รอตรวจสอบ</option>
                                            <option value="approved">✅ มีสิทธิ์สอบ</option>
                                            <option value="rejected">❌ ไม่ผ่าน</option>
                                            <option value="edit_requested">⚠️ ขอแก้ไข</option>
                                        </select>
                                    </div>
                                    <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}
                                        className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#1e2a24] focus:outline-none bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 text-sm">
                                        <option value="all">ทุกตำแหน่ง</option>
                                        {positions.map(pos => <option key={pos.id} value={pos.id}>{pos.title} — {pos.department}</option>)}
                                    </select>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">แสดง <strong className="text-gray-800 dark:text-white">{filteredApps.length}</strong> รายการ</span>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white dark:bg-[#151f1a] rounded-2xl border border-gray-100 dark:border-[#1e2a24] shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-[#0d1a12] border-b border-gray-200 dark:border-[#1e2a24]">
                                                <th className="px-4 py-3">
                                                    <button onClick={toggleSelectAll} title="เลือกทั้งหมดที่มีสิทธิ์สอบ">
                                                        {filteredApps.filter(a => a.status === 'approved').every(a => selectedIds.has(a.id)) && filteredApps.some(a => a.status === 'approved')
                                                            ? <CheckSquare className="w-4 h-4 text-primary" />
                                                            : <Square className="w-4 h-4 text-gray-400" />
                                                        }
                                                    </button>
                                                </th>
                                                {['#', 'ชื่อ-สกุล', 'เลขบัตร', 'ตำแหน่ง / สังกัด', 'สถานะ', 'วันที่สมัคร', 'การดำเนินการ'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredApps.length === 0 ? (
                                                <tr><td colSpan={8} className="text-center py-16 text-gray-400 dark:text-gray-500">
                                                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />ไม่พบข้อมูลใบสมัคร
                                                </td></tr>
                                            ) : filteredApps.map((app, idx) => {
                                                const pos = getPos(app.position_id)
                                                return (
                                                    <tr key={app.id} className={`border-b border-gray-50 dark:border-[#1e2a24] hover:bg-primary-50/30 dark:hover:bg-primary/5 transition-colors ${selectedIds.has(app.id) ? 'bg-primary/5' : ''}`}>
                                                        <td className="px-4 py-3">
                                                            {app.status === 'approved' && (
                                                                <button onClick={() => toggleSelect(app.id)}>
                                                                    {selectedIds.has(app.id)
                                                                        ? <CheckSquare className="w-4 h-4 text-primary" />
                                                                        : <Square className="w-4 h-4 text-gray-300" />}
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">{idx + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{app.full_name}</p>
                                                            {app.exam_number && <p className="text-xs text-primary font-mono mt-0.5">เลขสอบ: {app.exam_number}</p>}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">{app.citizen_id}</td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm text-gray-800 dark:text-gray-200">{pos?.title || '-'}</p>
                                                            <p className="text-xs text-gray-400">{pos?.department || '-'}</p>
                                                        </td>
                                                        <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                            {new Date(app.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <IconBtn icon={Eye} tip="ตรวจสอบ" color="blue" onClick={() => handleReview(app)} />
                                                                <IconBtn icon={FileText} tip="พิมพ์ใบสมัคร" color="primary" onClick={() => handleGenerateAppForm(app)} />
                                                                {app.status === 'pending' && (
                                                                    <>
                                                                        <IconBtn icon={CheckCircle2} tip="อนุมัติ" color="emerald" onClick={() => setShowApproveConfirm(app)} />
                                                                        <IconBtn icon={XCircle} tip="ไม่อนุมัติ" color="red" onClick={() => { setShowRejectModal(app); setRejectType('rejected') }} />
                                                                        <IconBtn icon={AlertTriangle} tip="ขอแก้ไข" color="orange" onClick={() => { setShowRejectModal(app); setRejectType('edit_requested') }} />
                                                                    </>
                                                                )}
                                                                {app.status === 'approved' && <IconBtn icon={Printer} tip="บัตรสอบ" color="primary" onClick={() => handleGenerateCard(app)} />}
                                                                <IconBtn icon={Trash2} tip="ลบ" color="red" onClick={() => setShowDeleteConfirm(app)} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ SECTION: Positions ═══ */}
                    {activeSection === 'positions' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">จัดการตำแหน่งงาน</h3>
                                <button onClick={() => { setEditingPos(null); setPosForm({ title: '', department: '', is_active: true }); setShowPosModal(true) }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm">
                                    <Plus className="w-4 h-4" /> เพิ่มตำแหน่ง
                                </button>
                            </div>
                            <div className="bg-white dark:bg-[#151f1a] rounded-2xl border border-gray-100 dark:border-[#1e2a24] shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-[#0d1a12] border-b border-gray-200 dark:border-[#1e2a24]">
                                            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">#</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ตำแหน่ง</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">สังกัด</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">จำนวนรับ / อัตรา</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ผู้สมัคร</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">สถานะ</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">การดำเนินการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {positions.map((pos, idx) => {
                                            const appCount = applications.filter(a => a.position_id === pos.id).length
                                            const isExpired = pos.close_date && new Date(pos.close_date) < new Date()
                                            return (
                                                <tr key={pos.id} className="border-b border-gray-50 dark:border-[#1e2a24] hover:bg-gray-50 dark:hover:bg-[#1e2a24] transition-colors">
                                                    <td className="px-5 py-3 text-sm text-gray-400 dark:text-gray-500">{idx + 1}</td>
                                                    <td className="px-5 py-3">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{pos.title}</p>
                                                        {pos.salary_range && <p className="text-xs text-emerald-600 mt-0.5">อัตรา: {pos.salary_range}</p>}
                                                        {pos.close_date && <p className={`text-xs mt-0.5 ${isExpired ? 'text-red-500' : 'text-amber-600'}`}>ปิดรับ: {new Date(pos.close_date).toLocaleDateString('th-TH')}{isExpired ? ' (หมดเขตแล้ว)' : ''}</p>}
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{pos.department}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="text-sm">
                                                            <span className="font-bold text-primary">{appCount}</span>
                                                            {pos.quota && <span className="text-gray-400"> / {pos.quota} อัตรา</span>}
                                                        </div>
                                                        {pos.quota && (
                                                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 w-20 overflow-hidden">
                                                                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((appCount / parseInt(pos.quota)) * 100, 100)}%` }} />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <button onClick={() => setShowTogglePosConfirm(pos)}
                                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${pos.is_active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                            {pos.is_active !== false ? <><ToggleRight className="w-4 h-4" /> เปิดรับ</> : <><ToggleLeft className="w-4 h-4" /> ปิด</>}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <IconBtn icon={Edit3} tip="แก้ไข" color="blue"
                                                                onClick={() => { setEditingPos(pos); setPosForm({ title: pos.title, department: pos.department, is_active: pos.is_active, quota: pos.quota || '', salary_range: pos.salary_range || '', requirements: pos.requirements || '', open_date: pos.open_date || '', close_date: pos.close_date || '' }); setShowPosModal(true) }} />
                                                            <IconBtn icon={Trash2} tip="ลบ" color="red" onClick={() => setShowDeletePosConfirm(pos)} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═══ SECTION: Audit ═══ */}
                    {activeSection === 'audit' && (
                        <div className="bg-white dark:bg-[#151f1a] rounded-2xl border border-gray-100 dark:border-[#1e2a24] shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1e2a24] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2"><Clock className="w-4 h-4" /> ประวัติการใช้งาน (ล่าสุด 100 รายการ)</h3>
                                <button onClick={fetchAuditLogs} className="text-xs text-primary hover:underline flex items-center gap-1"><RefreshCw className="w-3 h-3" /> รีเฟรช</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead><tr className="bg-gray-50 dark:bg-[#0d1a12] border-b border-gray-200 dark:border-[#1e2a24]">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">เวลา</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ผู้ดำเนินการ</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">การดำเนินการ</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">รายละเอียด</th>
                                    </tr></thead>
                                    <tbody>
                                        {auditLogs.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-12 text-gray-400 dark:text-gray-500">ยังไม่มีประวัติ</td></tr>
                                        ) : auditLogs.map(log => (
                                            <tr key={log.id} className="border-b border-gray-50 dark:border-[#1e2a24] hover:bg-gray-50 dark:hover:bg-[#1e2a24] text-sm">
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{log.actor}</td>
                                                <td className="px-4 py-3"><span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{log.action}</span></td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono max-w-xs truncate">{log.metadata ? JSON.stringify(log.metadata) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═══ SECTION: Settings ═══ */}
                    {activeSection === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#151f1a] rounded-2xl border border-gray-100 dark:border-[#1e2a24] shadow-sm p-6">
                                <h3 className="text-base font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                                    <CalendarClock className="w-5 h-5 text-primary" />
                                    ช่วงเวลารับสมัครงาน (ภาพรวม)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">วันเปิดรับสมัคร</label>
                                        <input type="date" value={settingsForm.open_date}
                                            onChange={e => setSettingsForm(p => ({ ...p, open_date: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">วันปิดรับสมัคร</label>
                                        <input type="date" value={settingsForm.close_date}
                                            onChange={e => setSettingsForm(p => ({ ...p, close_date: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">จำนวนรับสูงสุดต่อตำแหน่ง (คน)</label>
                                        <input type="number" value={settingsForm.max_per_position} min="1"
                                            onChange={e => setSettingsForm(p => ({ ...p, max_per_position: e.target.value }))}
                                            placeholder="ไม่จำกัด"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                                    </div>
                                </div>
                                <div className="mt-5 flex items-center gap-3">
                                    <button onClick={handleSaveSettings}
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors">
                                        บันทึกการตั้งค่า
                                    </button>
                                    {settingsSaved && <span className="text-emerald-600 text-sm font-medium">✓ บันทึกแล้ว</span>}
                                </div>
                                {settingsForm.open_date && settingsForm.close_date && (
                                    <div className="mt-4 p-4 bg-primary/5 rounded-xl text-sm text-primary">
                                        ละเอียดปัจจุบัน: เปิดรับ {new Date(settingsForm.open_date).toLocaleDateString('th-TH', { dateStyle: 'long' })} — ปิด {new Date(settingsForm.close_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                                    </div>
                                )}
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-400">
                                <p className="font-semibold mb-1">⚠️ หมายเหตุ</p>
                                <p>การตั้งค่านี้เก็บไว้ใน localStorage ไม่ได้แชร์ข้ามอุปกรณ์ หากต้องการควบคุมกำหนดเวลารับสมัครควรบันทึก open_date/close_date ในตาราง positions แต่ละรายการ (เพิ่มตำแหน่งใหม่)</p>
                            </div>
                        </div>
                    )}

                    {/* ═══ SECTION: Fiscal Years ═══ */}
                    {activeSection === 'fiscal_years' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">จัดการปีงบประมาณ</h3>
                                <button onClick={() => { setEditingFy(null); setFyForm({ year: '', label: '', open_date: '', close_date: '', is_active: false }); setShowFyModal(true) }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm">
                                    <Plus className="w-4 h-4" /> เพิ่มปีงบประมาณ
                                </button>
                            </div>
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 text-sm text-primary dark:text-primary-light">
                                <p className="font-semibold">📅 ปีงบประมาณที่ใช้งานอยู่: <span className="font-bold">{fiscalYears.find(f => f.is_active)?.label || 'ยังไม่ได้ตั้งค่า'}</span></p>
                            </div>
                            <div className="bg-white dark:bg-[#151f1a] rounded-2xl border border-gray-100 dark:border-[#1e2a24] shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-[#0d1a12] border-b border-gray-200 dark:border-[#1e2a24]">
                                            {['ปี พ.ศ.', 'ชื่อ/ป้ายกำกับ', 'เปิดรับ', 'ปิดรับ', 'สถานะ', 'การดำเนินการ'].map(h => (
                                                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fiscalYears.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-gray-500">ยังไม่มีปีงบประมาณ</td></tr>
                                        ) : fiscalYears.map(fy => (
                                            <tr key={fy.id} className="border-b border-gray-50 dark:border-[#1e2a24] hover:bg-gray-50 dark:hover:bg-[#1e2a24] transition-colors">
                                                <td className="px-5 py-3 font-bold text-gray-800 dark:text-white">{fy.year}</td>
                                                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{fy.label}</td>
                                                <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{fy.open_date ? new Date(fy.open_date).toLocaleDateString('th-TH') : '-'}</td>
                                                <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{fy.close_date ? new Date(fy.close_date).toLocaleDateString('th-TH') : '-'}</td>
                                                <td className="px-5 py-3">
                                                    {fy.is_active ? (
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">✅ ใช้งานอยู่</span>
                                                    ) : (
                                                        <button onClick={() => handleSetActiveFY(fy)}
                                                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">
                                                            ตั้งเป็นปัจจุบัน
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <IconBtn icon={Edit3} tip="แก้ไข" color="blue"
                                                            onClick={() => { setEditingFy(fy); setFyForm({ year: fy.year, label: fy.label, open_date: fy.open_date || '', close_date: fy.close_date || '', is_active: fy.is_active }); setShowFyModal(true) }} />
                                                        {!fy.is_active && <IconBtn icon={Trash2} tip="ลบ" color="red" onClick={() => setShowDeleteFyConfirm(fy)} />}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═══ SECTION: Admin Users ═══ */}
                    {activeSection === 'admin_users' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">จัดการผู้ดูแลระบบ</h3>
                                <button onClick={() => { setEditingUser(null); setUserForm({ username: '', password: '', role: 'admin', is_active: true }); setShowUserModal(true) }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm">
                                    <Plus className="w-4 h-4" /> เพิ่มผู้ดูแล
                                </button>
                            </div>
                            <div className="bg-white dark:bg-[#151f1a] rounded-2xl border border-gray-100 dark:border-[#1e2a24] shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-[#0d1a12] border-b border-gray-200 dark:border-[#1e2a24]">
                                            {['#', 'ชื่อผู้ใช้', 'บทบาท', 'วันที่สร้าง', 'สถานะ', 'การดำเนินการ'].map(h => (
                                                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminUsers.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center py-12 text-gray-400 dark:text-gray-500">ยังไม่มีผู้ดูแลระบบ</td></tr>
                                        ) : adminUsers.map((user, idx) => (
                                            <tr key={user.id} className="border-b border-gray-50 dark:border-[#1e2a24] hover:bg-gray-50 dark:hover:bg-[#1e2a24] transition-colors">
                                                <td className="px-5 py-3 text-sm text-gray-400 dark:text-gray-500">{idx + 1}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <UserCog className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{user.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'superadmin' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                        {user.role === 'superadmin' ? '👑 Super Admin' : '🔑 Admin'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(user.created_at).toLocaleDateString('th-TH')}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}>
                                                        {user.is_active ? 'ใช้งาน' : 'ระงับ'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <IconBtn icon={Edit3} tip="แก้ไข" color="blue"
                                                            onClick={() => { setEditingUser(user); setUserForm({ username: user.username, password: '', role: user.role, is_active: user.is_active }); setShowUserModal(true) }} />
                                                        <IconBtn icon={Trash2} tip="ลบ" color="red" onClick={() => setShowDeleteUserConfirm(user)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-400">
                                <p className="font-semibold mb-1">⚠️ หมายเหตุ</p>
                                <p>ระบบนี้จัดการรายชื่อผู้ดูแลและข้อมูลบัญชีใน Supabase ต้องสร้างตาราง <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">admin_users</code> ใน Supabase ก่อนใช้งาน</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ═══ MODALS ═══ */}

            {/* Reject / Edit Request Modal */}
            {showRejectModal && (
                <Modal onClose={() => { setShowRejectModal(null); setRejectReason('') }}>
                    <div className="flex items-center gap-3 mb-5">
                        {rejectType === 'rejected' ? <XCircle className="w-8 h-8 text-red-500" /> : <AlertTriangle className="w-8 h-8 text-orange-500" />}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{rejectType === 'rejected' ? 'ไม่อนุมัติใบสมัคร' : 'ขอให้แก้ไขเอกสาร'}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{showRejectModal.full_name}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">เหตุผล / หมายเหตุ <span className="text-red-500">*</span></label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                placeholder={rejectType === 'rejected' ? 'ระบุเหตุผลที่ไม่อนุมัติ...' : 'ระบุเอกสารที่ต้องแก้ไข...'}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowRejectModal(null); setRejectReason('') }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#1e2a24] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e2a24] font-medium text-sm">ยกเลิก</button>
                            <button onClick={handleRejectSubmit} disabled={!rejectReason.trim()}
                                className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-colors ${rejectType === 'rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
                                    } disabled:opacity-50`}>
                                {rejectType === 'rejected' ? 'ยืนยันไม่อนุมัติ' : 'ส่งแจ้งให้แก้ไข'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Application Confirmation */}
            {showDeleteConfirm && (
                <ConfirmModal
                    variant="danger"
                    icon={Trash2}
                    title="ยืนยันการลบใบสมัคร"
                    description={<>ต้องการลบใบสมัครของ <strong className="text-gray-800">{showDeleteConfirm.full_name}</strong> หรือไม่?<br /><span className="text-xs text-red-400 mt-1 block">เอกสารแนบทั้งหมดจะถูกลบพร้อมกัน และไม่สามารถย้อนกลับได้</span></>}
                    confirmText="ยืนยันลบ"
                    onConfirm={() => handleDeleteApp(showDeleteConfirm.id)}
                    onClose={() => setShowDeleteConfirm(null)}
                />
            )}

            {/* Approve Confirmation */}
            {showApproveConfirm && (
                <ConfirmModal
                    variant="success"
                    icon={CheckCircle2}
                    title="ยืนยันการอนุมัติ"
                    description={<>อนุมัติให้ <strong className="text-gray-800">{showApproveConfirm.full_name}</strong> มีสิทธิ์เข้าสอบ<br /><span className="text-xs text-gray-400 mt-1 block">ระบบจะออกเลขประจำตัวสอบให้อัตโนมัติ</span></>}
                    confirmText="อนุมัติ"
                    onConfirm={() => { handleApprove(showApproveConfirm.id); setShowApproveConfirm(null) }}
                    onClose={() => setShowApproveConfirm(null)}
                />
            )}

            {/* Delete Position Confirmation */}
            {showDeletePosConfirm && (
                <ConfirmModal
                    variant="danger"
                    icon={Trash2}
                    title="ยืนยันการลบตำแหน่ง"
                    description={<>ต้องการลบตำแหน่ง <strong className="text-gray-800">{showDeletePosConfirm.title}</strong><br /><span className="text-xs text-red-400 mt-1 block">การลบจะไม่สามารถย้อนกลับได้</span></>}
                    confirmText="ลบตำแหน่ง"
                    onConfirm={() => { handleDeletePosition(showDeletePosConfirm.id); setShowDeletePosConfirm(null) }}
                    onClose={() => setShowDeletePosConfirm(null)}
                />
            )}

            {/* Toggle Position Confirmation */}
            {showTogglePosConfirm && (
                <ConfirmModal
                    variant={showTogglePosConfirm.is_active !== false ? 'warning' : 'success'}
                    icon={showTogglePosConfirm.is_active !== false ? ToggleLeft : ToggleRight}
                    title={showTogglePosConfirm.is_active !== false ? 'ปิดรับสมัครตำแหน่งนี้?' : 'เปิดรับสมัครตำแหน่งนี้?'}
                    description={<>ตำแหน่ง <strong className="text-gray-800">{showTogglePosConfirm.title}</strong><br /><span className="text-xs text-gray-400 mt-1 block">{showTogglePosConfirm.is_active !== false ? 'ผู้สมัครจะไม่สามารถเลือกตำแหน่งนี้ได้' : 'ผู้สมัครจะมองเห็นและเลือกตำแหน่งนี้ได้'}</span></>}
                    confirmText={showTogglePosConfirm.is_active !== false ? 'ปิดรับสมัคร' : 'เปิดรับสมัคร'}
                    onConfirm={() => handleTogglePositionConfirmed(showTogglePosConfirm)}
                    onClose={() => setShowTogglePosConfirm(null)}
                />
            )}

            {/* Logout Confirmation */}
            {showLogoutConfirm && (
                <ConfirmModal
                    variant="warning"
                    icon={LogOut}
                    title="ออกจากระบบ?"
                    description="ยืนยันการออกจากระบบเจ้าหน้าที่ คุณจะต้องเข้าสู่ระบบใหม่อีกครั้ง"
                    confirmText="ออกจากระบบ"
                    onConfirm={handleLogoutConfirmed}
                    onClose={() => setShowLogoutConfirm(false)}
                />
            )}

            {/* Position Form Modal */}
            {showPosModal && (
                <Modal onClose={() => setShowPosModal(false)}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                        {editingPos ? <><Edit3 className="w-5 h-5 text-primary" /> แก้ไขตำแหน่ง</> : <><Plus className="w-5 h-5 text-primary" /> เพิ่มตำแหน่งใหม่</>}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ชื่อตำแหน่ง <span className="text-red-400">*</span></label>
                            <input type="text" value={posForm.title} onChange={(e) => setPosForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="เช่น พนักงานจ้างตามภารกิจ"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">สังกัด (กอง/สำนัก) <span className="text-red-400">*</span></label>
                            <input type="text" value={posForm.department} onChange={(e) => setPosForm(prev => ({ ...prev, department: e.target.value }))}
                                placeholder="เช่น สำนักปลัดเทศบาล"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">จำนวนรับ (อัตรา)</label>
                                <input type="number" min="0" value={posForm.quota} onChange={e => setPosForm(p => ({ ...p, quota: e.target.value }))}
                                    placeholder="ไม่จำกัด"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">อัตราค่าจ้าง</label>
                                <input type="text" value={posForm.salary_range} onChange={e => setPosForm(p => ({ ...p, salary_range: e.target.value }))}
                                    placeholder="เช่น 9,000 บาท/เดือน"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">วันเปิดรับสมัคร</label>
                                <input type="date" value={posForm.open_date} onChange={e => setPosForm(p => ({ ...p, open_date: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">วันปิดรับสมัคร</label>
                                <input type="date" value={posForm.close_date} onChange={e => setPosForm(p => ({ ...p, close_date: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">คุณสมบัติ (ย่อ)</label>
                            <textarea value={posForm.requirements} onChange={e => setPosForm(p => ({ ...p, requirements: e.target.value }))}
                                rows={3} placeholder="ระบุวุฒิการศึกษา หรือคุณสมบัติเฉพาะ..."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowPosModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#1e2a24] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e2a24] font-medium text-sm">ยกเลิก</button>
                            <button onClick={handleSavePosition} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark font-bold text-sm">
                                {editingPos ? 'บันทึกการแก้ไข' : 'เพิ่มตำแหน่ง'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Review Modal (Full Application Detail) */}
            {showReviewModal && selectedApp && (
                <Modal onClose={() => setShowReviewModal(false)} large>
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{selectedApp.full_name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{selectedApp.citizen_id}</p>
                        </div>
                        <StatusBadge status={selectedApp.status} />
                    </div>

                    {/* Info Grid — mirrors ใบสมัครหน้า 1-3 */}
                    <div className="bg-gray-50 dark:bg-[#0d1a12] rounded-2xl p-5 mb-5 space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> ข้อมูลผู้สมัคร</h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            {[
                                ['ตำแหน่ง', `${getPos(selectedApp.position_id)?.title || '-'}`],
                                ['สังกัด', `${getPos(selectedApp.position_id)?.department || '-'}`],
                                ['วันเกิด', selectedApp.birth_date || '-'],
                                ['โทรศัพท์', selectedApp.phone || '-'],
                                ['อีเมล', selectedApp.email || '-'],
                                ['วุฒิการศึกษา', selectedApp.education_level || '-'],
                                ['สถาบัน', selectedApp.institution || '-'],
                                ['สาขาวิชา', selectedApp.major || '-'],
                                ['GPA', selectedApp.gpa || '-'],
                                ['วันสำเร็จ', selectedApp.graduation_date || '-'],
                                ['อาชีพปัจจุบัน', selectedApp.current_occupation || '-'],
                                ['สถานที่ทำงาน', selectedApp.work_place || '-'],
                                ['ทักษะ', selectedApp.skills || '-'],
                                ['ความพิการ', selectedApp.disability_type || 'ไม่มี'],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <span className="text-gray-400 text-xs">{label}</span>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">{value}</p>
                                </div>
                            ))}
                            <div className="col-span-2">
                                <span className="text-gray-400 text-xs">ที่อยู่</span>
                                <p className="font-medium text-gray-700 dark:text-gray-300">{selectedApp.address || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> เอกสารแนบ ({documents.length} รายการ)</h4>
                    {documents.length === 0 ? (
                        <p className="text-gray-400 dark:text-gray-500 text-sm py-8 text-center">ไม่มีเอกสารแนบ</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 mb-5">
                            {documents.map(doc => {
                                const labels = { photo: '📷 รูปถ่าย', id_card: '🪪 บัตรประชาชน', transcript: '📜 ใบระเบียน', house_registration: '📋 ทะเบียนบ้าน' }
                                return (
                                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                        className="rounded-xl border border-gray-200 dark:border-[#1e2a24] p-3 hover:bg-primary-50 dark:hover:bg-primary/5 hover:border-primary/30 transition-all group block">
                                        {doc.file_url?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                            <img src={doc.file_url} alt={doc.file_type} className="w-full h-28 object-cover rounded-lg mb-2" />
                                        ) : (
                                            <div className="w-full h-28 bg-gray-100 dark:bg-[#0d1a12] rounded-lg mb-2 flex items-center justify-center"><FileText className="w-10 h-10 text-gray-300 dark:text-gray-600" /></div>
                                        )}
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">{labels[doc.file_type] || doc.file_type}</p>
                                        <p className="text-xs text-gray-400 truncate">{doc.original_name || doc.file_name}</p>
                                    </a>
                                )
                            })}
                        </div>
                    )}

                    {/* Admin Notes */}
                    <div className="border-t border-gray-100 dark:border-[#1e2a24] pt-4 mt-4">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1.5 mb-2">
                            <StickyNote className="w-3.5 h-3.5" /> บันทึกแอดมิน (ไม่แสดงต่อผู้สมัคร)
                        </label>
                        <textarea
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                            rows={3}
                            placeholder="บันทึกภายในสำหรับเจ้าหน้าที่เท่านั้น..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                        />
                        {selectedApp.admin_notes && adminNote === '' && (
                            <p className="text-xs text-gray-400 mt-1">บันทึกเดิม: {selectedApp.admin_notes}</p>
                        )}
                        <button
                            onClick={() => handleSaveNote(selectedApp.id)}
                            disabled={!adminNote.trim() || savingNote}
                            className="mt-2 px-4 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-40 flex items-center gap-1.5"
                        >
                            {savingNote ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <StickyNote className="w-3 h-3" />}
                            บันทึกนโอตส์
                        </button>
                    </div>

                    {/* Actions */}
                    {selectedApp.status === 'pending' && (
                        <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-[#1e2a24]">
                            <button onClick={() => { setShowReviewModal(false); setShowApproveConfirm(selectedApp) }}
                                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> อนุมัติ
                            </button>
                            <button onClick={() => { setShowReviewModal(false); setShowRejectModal(selectedApp); setRejectType('edit_requested') }}
                                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 flex items-center justify-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> ขอแก้ไข
                            </button>
                            <button onClick={() => { setShowReviewModal(false); setShowRejectModal(selectedApp); setRejectType('rejected') }}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 flex items-center justify-center gap-2">
                                <XCircle className="w-4 h-4" /> ไม่อนุมัติ
                            </button>
                        </div>
                    )}
                </Modal>
            )}

            {/* ── Fiscal Year Modal ── */}
            {showFyModal && (
                <Modal onClose={() => setShowFyModal(false)}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        {editingFy ? 'แก้ไขปีงบประมาณ' : 'เพิ่มปีงบประมาณใหม่'}
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ปี พ.ศ. <span className="text-red-400">*</span></label>
                                <input type="number" value={fyForm.year} onChange={e => setFyForm(p => ({ ...p, year: e.target.value }))}
                                    placeholder="เช่น 2568"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ป้ายกำกับ <span className="text-red-400">*</span></label>
                                <input type="text" value={fyForm.label} onChange={e => setFyForm(p => ({ ...p, label: e.target.value }))}
                                    placeholder="เช่น ปีงบประมาณ 2568"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">วันเปิดรับสมัคร</label>
                                <input type="date" value={fyForm.open_date} onChange={e => setFyForm(p => ({ ...p, open_date: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">วันปิดรับสมัคร</label>
                                <input type="date" value={fyForm.close_date} onChange={e => setFyForm(p => ({ ...p, close_date: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                            </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={fyForm.is_active} onChange={e => setFyForm(p => ({ ...p, is_active: e.target.checked }))}
                                className="w-4 h-4 accent-primary" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ตั้งเป็นปีงบประมาณที่ใช้งานอยู่ (จะยกเลิกปีอื่นอัตโนมัติ)</span>
                        </label>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowFyModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#1e2a24] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e2a24] font-medium text-sm">ยกเลิก</button>
                            <button onClick={handleSaveFY} disabled={!fyForm.year || !fyForm.label}
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark font-bold text-sm disabled:opacity-50">
                                {editingFy ? 'บันทึกการแก้ไข' : 'เพิ่มปีงบประมาณ'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Fiscal Year Confirm */}
            {showDeleteFyConfirm && (
                <ConfirmModal
                    variant="danger" icon={Trash2}
                    title="ลบปีงบประมาณ"
                    description={<>ต้องการลบปีงบประมาณ <strong className="text-gray-800 dark:text-gray-200">{showDeleteFyConfirm.label}</strong> หรือไม่?</>}
                    confirmText="ลบ"
                    onConfirm={() => handleDeleteFY(showDeleteFyConfirm.id)}
                    onClose={() => setShowDeleteFyConfirm(null)}
                />
            )}

            {/* ── Admin User Modal ── */}
            {showUserModal && (
                <Modal onClose={() => setShowUserModal(false)}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-primary" />
                        {editingUser ? 'แก้ไขผู้ดูแลระบบ' : 'เพิ่มผู้ดูแลระบบใหม่'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ชื่อผู้ใช้ <span className="text-red-400">*</span></label>
                            <input type="text" value={userForm.username} onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))}
                                placeholder="username"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                รหัสผ่าน {editingUser && <span className="text-gray-400 font-normal">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>}
                                {!editingUser && <span className="text-red-400">*</span>}
                            </label>
                            <input type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                                placeholder={editingUser ? 'เว้นว่างเพื่อคงรหัสผ่านเดิม' : 'รหัสผ่าน'}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">บทบาท</label>
                            <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                                <option value="admin">🔑 Admin</option>
                                <option value="superadmin">👑 Super Admin</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={userForm.is_active} onChange={e => setUserForm(p => ({ ...p, is_active: e.target.checked }))}
                                className="w-4 h-4 accent-primary" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">บัญชีใช้งานได้ (Active)</span>
                        </label>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowUserModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#1e2a24] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e2a24] font-medium text-sm">ยกเลิก</button>
                            <button onClick={handleSaveUser}
                                disabled={!userForm.username.trim() || (!editingUser && !userForm.password.trim())}
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark font-bold text-sm disabled:opacity-50">
                                {editingUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ดูแล'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Admin User Confirm */}
            {showDeleteUserConfirm && (
                <ConfirmModal
                    variant="danger" icon={Trash2}
                    title="ลบผู้ดูแลระบบ"
                    description={<>ต้องการลบบัญชี <strong className="text-gray-800 dark:text-gray-200">{showDeleteUserConfirm.username}</strong> หรือไม่?</>}
                    confirmText="ลบบัญชี"
                    onConfirm={() => handleDeleteUser(showDeleteUserConfirm.id)}
                    onClose={() => setShowDeleteUserConfirm(null)}
                />
            )}

            {/* Exam Card Modal */}
            {showCardModal && cardApp && (
                <Modal onClose={() => { if (!generatingPdf) setShowCardModal(false) }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"><Printer className="w-5 h-5 text-primary" /> บัตรประจำตัวสอบ</h3>
                        {generatingPdf && <div className="flex items-center gap-2 text-primary text-sm"><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> สร้าง PDF...</div>}
                    </div>
                    <div className="overflow-auto rounded-xl border border-gray-200 dark:border-[#1e2a24]">
                        <ExamCardTemplate application={cardApp} position={cardPos} onReady={handleCardReady} />
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">PDF จะถูกดาวน์โหลดอัตโนมัติ</p>
                </Modal>
            )}
            {/* Application Form Modal */}
            {showAppFormModal && appFormApp && (
                <Modal onClose={() => { if (!generatingAppFormPdf) setShowAppFormModal(false) }} large>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> ใบสมัคร</h3>
                        {generatingAppFormPdf && <div className="flex items-center gap-2 text-primary text-sm"><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> สร้าง PDF...</div>}
                    </div>
                    <div className="overflow-auto rounded-xl border border-gray-200 dark:border-[#1e2a24]" style={{ maxHeight: '70vh' }}>
                        <ApplicationFormTemplate application={appFormApp} position={appFormPos} onReady={handleAppFormReady} />
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">PDF จะถูกดาวน์โหลดอัตโนมัติ</p>
                </Modal>
            )}
        </div>
    )
}

/* ── Helper Components ── */

function StatusBadge({ status }) {
    const map = {
        pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: '⏳ รอตรวจสอบ' },
        approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: '✅ มีสิทธิ์สอบ' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: '❌ ไม่ผ่าน' },
        edit_requested: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: '⚠️ ขอแก้ไข' },
    }
    const s = map[status] || map.pending
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>
}

function IconBtn({ icon: Icon, tip, color, onClick }) {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30',
        primary: 'bg-primary/10 text-primary hover:bg-primary/20',
    }
    return (
        <button onClick={onClick} title={tip}
            className={`p-1.5 rounded-lg transition-colors ${colors[color]}`}>
            <Icon className="w-4 h-4" />
        </button>
    )
}

function ConfirmModal({ variant = 'danger', icon: Icon, title, description, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก', onConfirm, onClose }) {
    const variants = {
        danger:  { ring: 'ring-red-100',     iconBg: 'bg-red-100',     iconColor: 'text-red-500',     btn: 'bg-red-500 hover:bg-red-600 focus:ring-red-200' },
        warning: { ring: 'ring-orange-100',  iconBg: 'bg-orange-100',  iconColor: 'text-orange-500',  btn: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-200' },
        success: { ring: 'ring-emerald-100', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500', btn: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-200' },
        info:    { ring: 'ring-blue-100',    iconBg: 'bg-blue-100',    iconColor: 'text-blue-500',    btn: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-200' },
    }
    const v = variants[variant] || variants.danger
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative bg-white dark:bg-[#151f1a] rounded-3xl max-w-sm w-full shadow-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
                <div className={`w-24 h-24 ${v.iconBg} rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ${v.ring}`}>
                    <Icon className={`w-12 h-12 ${v.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">{description}</div>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 px-5 py-3 border-2 border-gray-200 dark:border-[#1e2a24] text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#1e2a24] font-semibold transition-colors text-sm">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm}
                        className={`flex-1 px-5 py-3 ${v.btn} text-white rounded-2xl font-bold transition-colors text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-4`}>
                        <Icon className="w-4 h-4" />
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

function Modal({ children, onClose, large }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className={`relative bg-white dark:bg-[#151f1a] rounded-3xl ${large ? 'max-w-3xl' : 'max-w-lg'} w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6`} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-[#1e2a24] rounded-xl transition-colors z-10">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
                {children}
            </div>
        </div>
    )
}
