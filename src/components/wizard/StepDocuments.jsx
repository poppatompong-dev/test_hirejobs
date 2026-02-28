import { useState, useRef } from 'react'
import imageCompression from 'browser-image-compression'

const FILE_TYPES = [
    { key: 'photo', label: 'รูปถ่ายหน้าตรง (1 นิ้ว)', desc: 'ถ่ายไม่เกิน 6 เดือน', accept: 'image/*', required: true },
    { key: 'id_card', label: 'สำเนาบัตรประจำตัวประชาชน', desc: 'ลงนามรับรองสำเนาถูกต้อง', accept: 'image/*,.pdf', required: true },
    { key: 'transcript', label: 'สำเนาใบระเบียนผลการเรียน (Transcript)', desc: 'ลงนามรับรองสำเนาถูกต้อง', accept: 'image/*,.pdf', required: true },
    { key: 'house_registration', label: 'สำเนาทะเบียนบ้าน', desc: 'ลงนามรับรองสำเนาถูกต้อง', accept: 'image/*,.pdf', required: false },
    { key: 'certificate', label: 'ใบรับรองอื่น ๆ (ถ้ามี)', desc: 'วุฒิบัตร ใบประกาศ ฯลฯ', accept: 'image/*,.pdf', required: false },
]

export default function StepDocuments({ files, onFileChange, uploading, errors }) {
    const [previews, setPreviews] = useState({})
    const [compressing, setCompressing] = useState({})
    const [compressInfo, setCompressInfo] = useState({})
    const fileInputRefs = useRef({})

    const handleFileSelect = async (key, file) => {
        if (!file) return

        // Compress images before passing up
        if (file.type.startsWith('image/')) {
            setCompressing(prev => ({ ...prev, [key]: true }))
            try {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                }
                const originalSizeKB = (file.size / 1024).toFixed(1)
                const compressed = await imageCompression(file, options)
                const compressedSizeKB = (compressed.size / 1024).toFixed(1)
                setCompressInfo(prev => ({ ...prev, [key]: { before: originalSizeKB, after: compressedSizeKB } }))
                // Keep original file name
                const renamedFile = new File([compressed], file.name, { type: compressed.type })
                onFileChange(key, renamedFile)

                const reader = new FileReader()
                reader.onloadend = () => setPreviews(prev => ({ ...prev, [key]: reader.result }))
                reader.readAsDataURL(renamedFile)
            } catch {
                // Fallback: use original file
                onFileChange(key, file)
                const reader = new FileReader()
                reader.onloadend = () => setPreviews(prev => ({ ...prev, [key]: reader.result }))
                reader.readAsDataURL(file)
            } finally {
                setCompressing(prev => ({ ...prev, [key]: false }))
            }
        } else {
            // PDF — no compression
            onFileChange(key, file)
            setPreviews(prev => ({ ...prev, [key]: 'pdf' }))
        }
    }

    const removeFile = (key) => {
        onFileChange(key, null)
        setPreviews(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
        if (fileInputRefs.current[key]) {
            fileInputRefs.current[key].value = ''
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">อัปโหลดเอกสาร</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">แนบไฟล์เอกสารประกอบการสมัคร</p>
                <p className="text-xs text-primary/70 mt-1">🗜️ รูปภาพจะถูกบีบอัดอัตโนมัติเพื่อประหยัดพื้นที่</p>
            </div>

            <div className="space-y-4">
                {FILE_TYPES.map((ft) => (
                    <div
                        key={ft.key}
                        className={`rounded-2xl border-2 p-5 transition-all duration-200 ${errors?.[ft.key]
                                ? 'border-danger/50 bg-red-50 dark:bg-red-900/10'
                                : files[ft.key]
                                    ? 'border-primary/40 bg-primary/5'
                                    : 'border-gray-200 dark:border-[#1e2a24] bg-white dark:bg-[#0d1a12] hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-white">
                                    {ft.label}
                                    {ft.required && <span className="text-danger ml-1">*</span>}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{ft.desc}</p>
                                {errors?.[ft.key] && <p className="text-xs text-danger mt-1">{errors[ft.key]}</p>}
                            </div>
                            {files[ft.key] && (
                                <button
                                    onClick={() => removeFile(ft.key)}
                                    className="text-danger hover:bg-red-50 rounded-lg p-1 transition-colors"
                                    title="ลบไฟล์"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {compressing[ft.key] ? (
                            <div className="flex items-center gap-3 py-4 px-4 bg-primary/5 rounded-xl">
                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                                <span className="text-sm text-primary font-medium">กำลังบีบอัดรูปภาพ...</span>
                            </div>
                        ) : files[ft.key] ? (
                            <div className="flex items-center gap-4">
                                {previews[ft.key] && previews[ft.key] !== 'pdf' ? (
                                    <img
                                        src={previews[ft.key]}
                                        alt="preview"
                                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-[#1e2a24]"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-[#1e2a24] rounded-xl flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{files[ft.key].name}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-xs text-gray-500">{(files[ft.key].size / 1024).toFixed(1)} KB</p>
                                        {compressInfo[ft.key] && (
                                            <p className="text-xs text-emerald-600 font-medium">
                                                🗜️ {compressInfo[ft.key].before} → {compressInfo[ft.key].after} KB
                                            </p>
                                        )}
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs text-success font-medium mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        เลือกไฟล์แล้ว
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm text-gray-500 mt-2 group-hover:text-primary transition-colors">
                                    คลิกเพื่อเลือกไฟล์
                                </span>
                                <input
                                    ref={(el) => (fileInputRefs.current[ft.key] = el)}
                                    type="file"
                                    accept={ft.accept}
                                    className="sr-only"
                                    onChange={(e) => handleFileSelect(ft.key, e.target.files[0])}
                                />
                            </label>
                        )}
                    </div>
                ))}
            </div>

            {uploading && (
                <div className="flex items-center justify-center gap-3 py-6 text-primary">
                    <div className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="font-medium">กำลังอัปโหลดเอกสาร...</span>
                </div>
            )}
        </div>
    )
}
