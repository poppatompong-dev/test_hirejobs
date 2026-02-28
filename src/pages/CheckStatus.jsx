import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { generateExamCard } from '../utils/generateExamCard'
import ExamCardTemplate from '../components/ExamCardTemplate'
import { Search, ArrowLeft, FileText, CheckCircle2, Clock, XCircle, AlertTriangle, Download, Printer } from 'lucide-react'

const STATUS_MAP = {
    pending: { label: 'รอตรวจสอบ', color: 'amber', icon: Clock, desc: 'เจ้าหน้าที่กำลังตรวจสอบข้อมูลและเอกสารของท่าน' },
    approved: { label: 'มีสิทธิ์สอบ', color: 'emerald', icon: CheckCircle2, desc: 'ท่านผ่านการคัดกรองแล้ว สามารถดาวน์โหลดบัตรประจำตัวสอบได้' },
    rejected: { label: 'ไม่ผ่านการคัดกรอง', color: 'red', icon: XCircle, desc: 'เอกสารของท่านไม่ผ่านการตรวจสอบ' },
    edit_requested: { label: 'ขอให้แก้ไขเอกสาร', color: 'orange', icon: AlertTriangle, desc: 'กรุณาแก้ไขเอกสารตามหมายเหตุ แล้วติดต่อเจ้าหน้าที่' },
}

export default function CheckStatus() {
    const [citizenId, setCitizenId] = useState('')
    const [result, setResult] = useState(null)
    const [position, setPosition] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showCard, setShowCard] = useState(false)
    const [generatingPdf, setGeneratingPdf] = useState(false)

    async function handleSearch(e) {
        e.preventDefault()
        if (citizenId.length !== 13) { setError('กรุณากรอกเลขบัตรประชาชน 13 หลัก'); return }
        setLoading(true); setError(''); setResult(null)
        try {
            const { data, error: err } = await supabase
                .from('applications').select('*').eq('citizen_id', citizenId).order('created_at', { ascending: false }).limit(1).single()
            if (err || !data) { setError('ไม่พบข้อมูลการสมัครด้วยเลขบัตรประชาชนนี้'); setLoading(false); return }
            setResult(data)
            if (data.position_id) {
                const { data: pos } = await supabase.from('positions').select('*').eq('id', data.position_id).single()
                setPosition(pos)
            }
        } catch { setError('เกิดข้อผิดพลาด กรุณาลองใหม่') }
        setLoading(false)
    }

    const handleDownloadCard = () => { setShowCard(true) }
    const handleCardReady = async (el) => {
        if (generatingPdf) return
        setGeneratingPdf(true)
        await new Promise(r => setTimeout(r, 500))
        await generateExamCard(el, result)
        setGeneratingPdf(false)
        setShowCard(false)
    }

    const statusInfo = result ? STATUS_MAP[result.status] || STATUS_MAP.pending : null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-[#0a0f0d] dark:via-[#0f1a14] dark:to-[#0a0f0d]">
            {/* Header */}
            <header className="bg-white dark:bg-[#0f1a14] border-b border-gray-200 dark:border-[#1e2a24] sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10" />
                        <div>
                            <p className="text-sm font-bold text-primary leading-tight">เทศบาลเมืองอุทัยธานี</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ระบบตรวจสอบสถานะการสมัคร</p>
                        </div>
                    </Link>
                    <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5">
                        <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-12">
                {/* Search Box */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-2">ตรวจสอบสถานะการสมัคร</h1>
                    <p className="text-gray-500 dark:text-gray-400">กรอกเลขบัตรประชาชน 13 หลัก เพื่อตรวจสอบผลการสมัคร</p>
                </div>

                <form onSubmit={handleSearch} className="bg-white dark:bg-[#151f1a] rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 border border-gray-100 dark:border-[#1e2a24] mb-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">เลขบัตรประชาชน</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            maxLength={13}
                            value={citizenId}
                            onChange={(e) => { setCitizenId(e.target.value.replace(/\D/g, '')); setError('') }}
                            placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-lg tracking-widest transition-all"
                        />
                        <button type="submit" disabled={loading}
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 disabled:opacity-50">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                            ค้นหา
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-3 flex items-center gap-1.5"><XCircle className="w-4 h-4" />{error}</p>}
                </form>

                {/* Result */}
                {result && statusInfo && (
                    <div className="animate-fade-in-up space-y-6">
                        {/* Status Card */}
                        <div className={`bg-white dark:bg-[#151f1a] rounded-2xl shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-[#1e2a24] overflow-hidden`}>
                            <div className={`p-6 bg-${statusInfo.color}-50 border-b border-${statusInfo.color}-100`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-${statusInfo.color}-100 flex items-center justify-center`}>
                                        <statusInfo.icon className={`w-7 h-7 text-${statusInfo.color}-600`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">สถานะปัจจุบัน</p>
                                        <p className={`text-xl font-extrabold text-${statusInfo.color}-700`}>{statusInfo.label}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{statusInfo.desc}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reject/Edit note */}
                            {(result.status === 'rejected' || result.status === 'edit_requested') && result.reject_reason && (
                                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-xs font-bold text-red-600 mb-1">หมายเหตุจากเจ้าหน้าที่:</p>
                                    <p className="text-sm text-red-700">{result.reject_reason}</p>
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="p-6 grid grid-cols-2 gap-4">
                                {[
                                    ['ชื่อ-สกุล', result.full_name],
                                    ['ตำแหน่ง', position?.title || '-'],
                                    ['สังกัด', position?.department || '-'],
                                    ['วันที่สมัคร', new Date(result.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })],
                                    ...(result.exam_number ? [['เลขประจำตัวสอบ', result.exam_number]] : []),
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Download Card Button */}
                            {result.status === 'approved' && (
                                <div className="px-6 pb-6">
                                    <button onClick={handleDownloadCard} disabled={generatingPdf}
                                        className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 text-lg disabled:opacity-50">
                                        {generatingPdf ? (
                                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังสร้าง PDF...</>
                                        ) : (
                                            <><Printer className="w-5 h-5" /> ดาวน์โหลดบัตรประจำตัวสอบ</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Hidden card for pdf generation */}
                {showCard && result && (
                    <div className="fixed left-[-9999px] top-0">
                        <ExamCardTemplate application={result} position={position} onReady={handleCardReady} />
                    </div>
                )}
            </main>
        </div>
    )
}
