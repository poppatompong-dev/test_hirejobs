import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import StepPosition from '../components/wizard/StepPosition'
import StepPersonalInfo from '../components/wizard/StepPersonalInfo'
import StepEducation from '../components/wizard/StepEducation'
import StepDocuments from '../components/wizard/StepDocuments'

const STEPS = [
    { label: 'เลือกตำแหน่ง', icon: '💼' },
    { label: 'ข้อมูลส่วนตัว', icon: '👤' },
    { label: 'การศึกษา', icon: '🎓' },
    { label: 'เอกสาร', icon: '📎' },
]

// File security: allowed MIME types and max size
const ALLOWED_MIMES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function validateCitizenId(id) {
    if (!/^\d{13}$/.test(id)) return false
    let sum = 0
    for (let i = 0; i < 12; i++) sum += parseInt(id[i]) * (13 - i)
    return (11 - (sum % 11)) % 10 === parseInt(id[12])
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
}

export default function ApplicationWizard() {
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState({})
    const [files, setFiles] = useState({})
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [cooldown, setCooldown] = useState(false)

    // Check PDPA consent
    useEffect(() => {
        if (!sessionStorage.getItem('pdpa_consent')) {
            navigate('/consent')
        }
    }, [navigate])

    const updateForm = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }))
        const clearedErrors = { ...errors }
        Object.keys(updates).forEach(k => delete clearedErrors[k])
        setErrors(clearedErrors)
    }

    const handleFileChange = (key, file) => {
        if (file) {
            // Validate file type
            if (!ALLOWED_MIMES.includes(file.type)) {
                setErrors(prev => ({ ...prev, [key]: 'ประเภทไฟล์ไม่ถูกต้อง (รองรับ JPG, PNG, WebP, PDF)' }))
                return
            }
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                setErrors(prev => ({ ...prev, [key]: 'ขนาดไฟล์ต้องไม่เกิน 5 MB' }))
                return
            }
        }
        setFiles(prev => {
            const next = { ...prev }
            if (file) next[key] = file
            else delete next[key]
            return next
        })
        // Clear error for this file key
        setErrors(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const validateStep = () => {
        const newErrors = {}
        if (step === 0) {
            if (!formData.position_id) newErrors.position_id = 'กรุณาเลือกตำแหน่งที่ต้องการสมัคร'
        } else if (step === 1) {
            if (!formData.citizen_id || !validateCitizenId(formData.citizen_id)) newErrors.citizen_id = 'กรุณากรอกเลขบัตรประชาชน 13 หลักที่ถูกต้อง'
            if (!formData.full_name?.trim()) newErrors.full_name = 'กรุณากรอกชื่อ-นามสกุล'
            if (!formData.birth_date) newErrors.birth_date = 'กรุณาเลือกวันเกิด'
            if (!formData.phone?.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
            if (!formData.address?.trim()) newErrors.address = 'กรุณากรอกที่อยู่'
        } else if (step === 2) {
            if (!formData.education_level) newErrors.education_level = 'กรุณาเลือกระดับการศึกษา'
            if (!formData.institution?.trim()) newErrors.institution = 'กรุณากรอกชื่อสถาบันการศึกษา'
        } else if (step === 3) {
            if (!files.photo) newErrors.photo = 'กรุณาอัปโหลดรูปถ่าย'
            if (!files.id_card) newErrors.id_card = 'กรุณาอัปโหลดสำเนาบัตรประชาชน'
            if (!files.transcript) newErrors.transcript = 'กรุณาอัปโหลดใบระเบียนผลการเรียน'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (!validateStep()) return
        if (step < STEPS.length - 1) setStep(step + 1)
    }

    const handlePrev = () => {
        if (step > 0) setStep(step - 1)
    }

    const handleSubmit = async () => {
        if (!validateStep()) return
        if (cooldown) return

        setSubmitting(true)
        setSubmitError('')
        setCooldown(true)
        // Rate limiting: 10s cooldown
        setTimeout(() => setCooldown(false), 10000)

        try {
            // 1. Insert application with consent timestamp
            const consentAt = sessionStorage.getItem('pdpa_consent') || new Date().toISOString()
            const { data: app, error: appError } = await supabase
                .from('applications')
                .insert({
                    citizen_id: formData.citizen_id,
                    full_name: formData.full_name,
                    birth_date: formData.birth_date,
                    address: formData.address,
                    phone: formData.phone,
                    email: formData.email || null,
                    position_id: formData.position_id,
                    education_level: formData.education_level,
                    institution: formData.institution,
                    major: formData.major || null,
                    gpa: formData.gpa ? parseFloat(formData.gpa) : null,
                    graduation_date: formData.graduation_date || null,
                    current_occupation: formData.current_occupation || null,
                    work_place: formData.work_place || null,
                    skills: formData.skills || null,
                    disability_type: formData.disability_type || null,
                    consent_at: consentAt,
                })
                .select()
                .single()

            if (appError) throw appError

            // 2. Upload documents with UUID filename (security: prevent directory traversal)
            for (const [fileType, file] of Object.entries(files)) {
                const ext = file.name.split('.').pop().toLowerCase()
                const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'].includes(ext) ? ext : 'bin'
                const uuid = generateUUID()
                const filePath = `${app.id}/${uuid}.${safeExt}`

                const { error: uploadError } = await supabase.storage
                    .from('applicant-docs')
                    .upload(filePath, file, { upsert: true })

                if (uploadError) {
                    console.error('Upload error:', uploadError)
                    continue
                }

                const { data: urlData } = supabase.storage
                    .from('applicant-docs')
                    .getPublicUrl(filePath)

                await supabase.from('documents').insert({
                    application_id: app.id,
                    file_type: fileType,
                    file_url: urlData.publicUrl,
                    file_name: `${uuid}.${safeExt}`,
                    original_name: file.name,
                })
            }

            navigate('/success', { state: { applicationId: app.id, fullName: formData.full_name } })
        } catch (err) {
            console.error('Submit error:', err)
            if (err.code === '23505') {
                setSubmitError('หมายเลขบัตรประชาชนนี้ได้ลงทะเบียนสมัครแล้ว กรุณาตรวจสอบอีกครั้ง')
            } else {
                setSubmitError('เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-[#0a0f0d] dark:via-[#101a14] dark:to-[#0a0f0d]">
            {/* Header */}
            <header className="bg-white/80 dark:bg-[#151f1a]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#1e2a24] sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="ตราเทศบาลเมืองอุทัยธานี" className="w-10 h-10" />
                        <div>
                            <p className="text-sm font-bold text-primary leading-tight">เทศบาลเมืองอุทัยธานี</p>
                            <p className="text-xs text-gray-500">ระบบรับสมัครงานออนไลน์</p>
                        </div>
                    </Link>
                    <Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับหน้าหลัก
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Stepper */}
                <div className="flex items-center justify-center mb-10">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${i < step
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : i === step
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                        }`}
                                >
                                    {i < step ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : s.icon}
                                </div>
                                <p className={`text-xs mt-2 font-medium hidden sm:block ${i <= step ? 'text-primary' : 'text-gray-400'}`}>
                                    {s.label}
                                </p>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all duration-300 ${i < step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-[#151f1a] rounded-3xl shadow-xl shadow-gray-200/80 dark:shadow-black/20 p-6 md:p-10 border border-gray-100 dark:border-[#1e2a24]">
                    {step === 0 && <StepPosition data={formData} onChange={updateForm} errors={errors} />}
                    {step === 1 && <StepPersonalInfo data={formData} onChange={updateForm} errors={errors} />}
                    {step === 2 && <StepEducation data={formData} onChange={updateForm} errors={errors} />}
                    {step === 3 && <StepDocuments files={files} onFileChange={handleFileChange} uploading={submitting} errors={errors} />}

                    {submitError && (
                        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-danger text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {submitError}
                        </div>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.502-1.368.635-1.958L13.035 4.372a1.13 1.13 0 00-2.07 0L2.367 17.042c-.867.59-.42 1.958.635 1.958z" />
                            </svg>
                            กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100 dark:border-[#1e2a24]">
                        <button
                            onClick={handlePrev}
                            disabled={step === 0}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${step === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            ย้อนกลับ
                        </button>

                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
                            >
                                ถัดไป
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || cooldown}
                                className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl shadow-lg transition-all duration-300 ${submitting || cooldown
                                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-primary/30 hover:scale-105'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        กำลังส่ง...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        ส่งใบสมัคร
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
