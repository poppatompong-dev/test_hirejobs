import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ConsentPage() {
    const [agreed, setAgreed] = useState(false)
    const navigate = useNavigate()

    const handleProceed = () => {
        if (agreed) {
            sessionStorage.setItem('pdpa_consent', new Date().toISOString())
            navigate('/apply')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-[#0a0f0d] dark:via-[#0f1a14] dark:to-[#0a0f0d]">
            {/* Header */}
            <header className="bg-white/80 dark:bg-[#0f1a14]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#1e2a24] sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10" />
                        <div>
                            <p className="text-sm font-bold text-primary leading-tight">เทศบาลเมืองอุทัยธานี</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ระบบรับสมัครงานออนไลน์</p>
                        </div>
                    </Link>
                    <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับหน้าหลัก
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Shield Icon */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/20 mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">
                        นโยบายความเป็นส่วนตัว
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                    </p>
                </div>

                {/* Content Card */}
                <div className="bg-white dark:bg-[#151f1a] rounded-3xl shadow-xl shadow-gray-200/80 dark:shadow-black/20 border border-gray-100 dark:border-[#1e2a24] overflow-hidden animate-fade-in-up stagger-1 opacity-0">
                    {/* Green header bar */}
                    <div className="bg-gradient-to-r from-primary to-primary-light px-6 py-4">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            แจ้งเตือนเกี่ยวกับการเก็บข้อมูลส่วนบุคคล
                        </h2>
                    </div>

                    <div className="p-6 md:p-8 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                        {/* Organization */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                                ผู้ควบคุมข้อมูลส่วนบุคคล
                            </h3>
                            <p className="ml-10">
                                <strong>เทศบาลเมืองอุทัยธานี</strong> เป็นผู้ควบคุมข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                                โดยมีสำนักงานตั้งอยู่ที่ อำเภอเมืองอุทัยธานี จังหวัดอุทัยธานี
                            </p>
                        </div>

                        {/* Data Collected */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                                ข้อมูลที่จัดเก็บ
                            </h3>
                            <div className="ml-10 bg-gray-50 dark:bg-[#0d1a12] rounded-2xl p-4">
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span><strong>ข้อมูลส่วนตัว:</strong> ชื่อ-นามสกุล เลขบัตรประชาชน 13 หลัก วันเกิด ที่อยู่ เบอร์โทรศัพท์ อีเมล</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span><strong>ข้อมูลการศึกษา:</strong> วุฒิการศึกษา สถาบัน สาขาวิชา คะแนนเฉลี่ย</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span><strong>เอกสารประกอบ:</strong> รูปถ่าย สำเนาบัตรประชาชน สำเนาทะเบียนบ้าน ใบระเบียนผลการเรียน</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Purpose */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                                วัตถุประสงค์ในการจัดเก็บ
                            </h3>
                            <div className="ml-10">
                                <ul className="space-y-1.5">
                                    <li className="flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        เพื่อใช้ในกระบวนการรับสมัครและคัดเลือกบุคลากรของเทศบาลเมืองอุทัยธานี
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        เพื่อตรวจสอบคุณสมบัติและคุณวุฒิของผู้สมัคร
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        เพื่อจัดทำบัตรประจำตัวผู้สอบและติดต่อแจ้งผลการคัดเลือก
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Retention */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                                ระยะเวลาจัดเก็บ
                            </h3>
                            <p className="ml-10">
                                ข้อมูลจะถูกจัดเก็บไว้เป็นระยะเวลา <strong>1 ปี</strong> นับจากวันสิ้นสุดกระบวนการรับสมัคร
                                หลังจากนั้นข้อมูลจะถูกลบออกจากระบบ เว้นแต่กฎหมายกำหนดให้เก็บรักษาไว้นานกว่านั้น
                            </p>
                        </div>

                        {/* Rights */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                                สิทธิของเจ้าของข้อมูล
                            </h3>
                            <div className="ml-10 grid gap-2 sm:grid-cols-2">
                                {[
                                    'สิทธิในการเข้าถึงข้อมูลของตนเอง',
                                    'สิทธิในการแก้ไขข้อมูลให้ถูกต้อง',
                                    'สิทธิในการลบข้อมูล',
                                    'สิทธิในการระงับการใช้ข้อมูล',
                                    'สิทธิในการคัดค้านการเก็บรวบรวม',
                                    'สิทธิในการถอนความยินยอม',
                                ].map((right, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-primary-50 dark:bg-primary/10 rounded-xl px-3 py-2 text-sm dark:text-gray-300">
                                        <span className="text-primary">✦</span>
                                        {right}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                                มาตรการรักษาความปลอดภัย
                            </h3>
                            <p className="ml-10">
                                ข้อมูลของท่านจะถูกเก็บรักษาด้วยมาตรการรักษาความปลอดภัยที่เหมาะสม
                                รวมถึงการเข้ารหัสข้อมูล การควบคุมการเข้าถึง และการบันทึกประวัติการเข้าถึงข้อมูล (Audit Log)
                                เฉพาะเจ้าหน้าที่ที่เกี่ยวข้องเท่านั้นที่สามารถเข้าถึงข้อมูลได้
                            </p>
                        </div>
                    </div>

                    {/* Consent Section */}
                    <div className="border-t border-gray-100 dark:border-[#1e2a24] bg-gray-50 dark:bg-[#0d1a12] px-6 md:px-8 py-6">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="flex-shrink-0 mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${agreed
                                        ? 'bg-primary border-primary'
                                        : 'border-gray-300 group-hover:border-primary/50'
                                    }`}>
                                    {agreed && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                ข้าพเจ้าได้อ่านและเข้าใจนโยบายความเป็นส่วนตัวดังกล่าวข้างต้นแล้ว
                                และ<strong className="text-primary">ยินยอม</strong>ให้เทศบาลเมืองอุทัยธานีเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า
                                ตามวัตถุประสงค์ที่ระบุไว้
                            </span>
                        </label>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleProceed}
                                disabled={!agreed}
                                className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 font-bold text-lg rounded-2xl transition-all duration-300 ${agreed
                                        ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg hover:shadow-primary/30 hover:scale-[1.02]'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                ยินยอมและดำเนินการต่อ
                            </button>
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-200 dark:border-[#1e2a24] text-gray-500 dark:text-gray-400 font-medium rounded-2xl hover:bg-gray-100 dark:hover:bg-[#1e2a24] transition-all"
                            >
                                ไม่ยินยอม
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
