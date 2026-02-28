import { useState, useEffect, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ClockTowerScene from '../components/ClockTowerScene'

function ClockTowerLoading() {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <img src="/logo.png" alt="" className="absolute inset-0 m-auto w-10 h-10 opacity-60" />
                </div>
                <p className="text-white/40 text-sm animate-pulse">กำลังโหลดหอนาฬิกา 3 มิติ...</p>
            </div>
        </div>
    )
}

export default function LandingPage() {
    const [positions, setPositions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPositions() {
            const { data, error } = await supabase
                .from('positions')
                .select('*')
                .order('department')
            if (!error && data) setPositions(data)
            setLoading(false)
        }
        fetchPositions()
    }, [])

    return (
        <div className="min-h-screen bg-[#071a0e] text-white overflow-x-hidden">

            {/* ── TOP GOVERNMENT BAR ── */}
            <div className="bg-[#03100a] border-b border-white/10 px-4 py-2 relative z-20">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="ตราสัญลักษณ์" className="w-8 h-8 opacity-90" />
                        <div className="text-xs leading-tight">
                            <p className="text-white/60">กระทรวงมหาดไทย · กรมส่งเสริมการปกครองท้องถิ่น</p>
                            <p className="text-white/90 font-semibold">เทศบาลเมืองอุทัยธานี</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-5 text-xs text-white/50">
                        <a href="https://www.uthai.go.th" target="_blank" rel="noopener" className="hover:text-white/80 transition-colors">เว็บไซต์หลัก</a>
                        <span className="text-white/20">|</span>
                        <Link to="/check-status" className="hover:text-white/80 transition-colors">ตรวจสอบสถานะ</Link>
                        <span className="text-white/20">|</span>
                        <Link to="/admin" className="hover:text-white/80 transition-colors">เจ้าหน้าที่</Link>
                    </div>
                </div>
            </div>

            {/* ── HERO SECTION ── */}
            <section className="relative min-h-screen flex items-center justify-center">
                <Suspense fallback={<ClockTowerLoading />}>
                    <ClockTowerScene />
                </Suspense>

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#03100a]/70 via-transparent to-[#071a0e] z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071a0e]/80 via-transparent to-[#071a0e]/80 z-[1]" />

                {/* Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
                    <div className="animate-fade-in-up">

                        {/* Official seal area */}
                        <div className="inline-flex flex-col items-center gap-3 mb-10">
                            <img
                                src="/logo.png"
                                alt="ตราเทศบาลเมืองอุทัยธานี"
                                className="w-24 h-24 md:w-28 md:h-28 mx-auto drop-shadow-[0_0_30px_rgba(0,132,61,0.5)] animate-float"
                            />
                            {/* Decorative lines */}
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
                                <span className="text-[#D4AF37]/70 text-xs tracking-[0.3em] font-medium uppercase">ราชการส่วนท้องถิ่น</span>
                                <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
                            </div>
                        </div>
                    </div>

                    {/* Official Title Box */}
                    <div className="animate-fade-in-up stagger-1 opacity-0 mb-10">
                        <div className="inline-block border border-[#D4AF37]/30 rounded-2xl px-8 py-6 bg-black/30 backdrop-blur-sm">
                            <p className="text-[#D4AF37]/80 text-sm tracking-[0.25em] mb-2 font-medium uppercase">ประกาศ</p>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">
                                รับสมัครบุคคลเพื่อจัดจ้าง
                            </h1>
                            <h2 className="text-xl md:text-2xl font-semibold text-[#D4AF37]">
                                เป็นพนักงานจ้างของเทศบาลเมืองอุทัยธานี
                            </h2>
                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-white/60">
                                <span>ประจำปีงบประมาณ {new Date().getFullYear() + 543}</span>
                                <span className="hidden sm:inline text-white/30">·</span>
                                <span>สมัครผ่านระบบออนไลน์เท่านั้น</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up stagger-2 opacity-0">
                        <Link
                            to="/consent"
                            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-primary text-white font-bold text-base rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-primary/40 transition-all duration-300 border border-primary-light/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            ยื่นใบสมัครออนไลน์
                        </Link>
                        <Link
                            to="/check-status"
                            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/8 border border-white/25 text-white font-semibold text-base rounded-xl hover:bg-white/15 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            ตรวจสอบสถานะการสมัคร
                        </Link>
                        <a
                            href="#positions"
                            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/8 border border-white/25 text-white font-semibold text-base rounded-xl hover:bg-white/15 hover:border-white/40 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            ดูตำแหน่งที่เปิดรับ
                        </a>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
                        <div className="w-1.5 h-3 bg-white/50 rounded-full" />
                    </div>
                </div>
            </section>

            {/* ── INFO NOTICE STRIP ── */}
            <div className="relative z-10 bg-[#D4AF37]/10 border-y border-[#D4AF37]/20 px-4 py-4">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 text-sm">
                    {[
                        { icon: '📋', text: 'กรอกใบสมัครออนไลน์ผ่านเว็บไซต์เท่านั้น' },
                        { icon: '🪪', text: 'ต้องใช้บัตรประชาชน 13 หลัก' },
                        { icon: '📎', text: 'แนบเอกสารในระบบ ไม่ต้องส่งทางไปรษณีย์' },
                        { icon: '📧', text: 'ตรวจสอบสถานะผ่านระบบออนไลน์' },
                    ].map((item) => (
                        <div key={item.text} className="flex items-center gap-2 text-white/70">
                            <span>{item.icon}</span>
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── POSITIONS SECTION ── */}
            <section id="positions" className="relative z-10 bg-gradient-to-b from-[#071a0e] to-[#061710] py-20 px-4">
                <div className="max-w-5xl mx-auto">

                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 mb-5">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
                            <span className="text-[#D4AF37]/80 text-xs tracking-[0.25em] font-medium uppercase">ประกาศรับสมัคร</span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            ตำแหน่งที่เปิดรับสมัคร
                        </h2>
                        <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
                            เลือกตำแหน่งที่สนใจ แล้วกดปุ่ม <span className="text-primary-light">"ยื่นใบสมัครออนไลน์"</span> เพื่อเริ่มกระบวนการสมัคร
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : positions.length === 0 ? (
                        <div className="text-center py-16 border border-white/10 rounded-2xl">
                            <p className="text-white/40 text-lg">ยังไม่มีตำแหน่งเปิดรับสมัครในขณะนี้</p>
                            <p className="text-white/25 text-sm mt-2">กรุณาติดตามประกาศจากเทศบาลเมืองอุทัยธานีอีกครั้ง</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                            {positions.map((pos, index) => (
                                <div
                                    key={pos.id}
                                    className="group flex items-center gap-4 bg-white/4 hover:bg-white/8 border border-white/10 hover:border-primary/40 rounded-xl p-5 transition-all duration-250 cursor-pointer"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {/* Position number */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary-light text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors text-sm leading-snug">
                                            {pos.title}
                                        </h3>
                                        <p className="text-white/45 text-xs mt-0.5 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {pos.department}
                                        </p>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/25 group-hover:text-primary-light transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <div className="text-center mt-12 pt-10 border-t border-white/8">
                        <p className="text-white/40 text-sm mb-5">
                            หากไม่แน่ใจ สามารถสอบถามได้ที่ฝ่ายบุคลากร เทศบาลเมืองอุทัยธานี โทร. 056-513-xxx
                        </p>
                        <Link
                            to="/consent"
                            className="inline-flex items-center gap-2.5 px-10 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-base rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 border border-primary-light/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            ยื่นใบสมัครออนไลน์
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-[#030d07] border-t border-white/8 py-12 px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        {/* Logo block */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <img src="/logo.png" alt="Logo" className="w-14 h-14 opacity-80" />
                            <div className="text-left">
                                <p className="text-white/80 font-semibold text-sm">เทศบาลเมืองอุทัยธานี</p>
                                <p className="text-white/40 text-xs">Uthai Thani Municipality</p>
                                <p className="text-white/30 text-xs mt-0.5">จ.อุทัยธานี ๖๑๐๐๐</p>
                            </div>
                        </div>

                        <div className="hidden md:block h-16 w-px bg-white/10 flex-shrink-0" />

                        {/* Contact */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-3 text-xs text-white/40">
                            <div>
                                <p className="text-white/60 font-medium mb-0.5">ที่อยู่</p>
                                <p>1 ถ.ศรีอุทัย อ.เมือง</p>
                                <p>จ.อุทัยธานี 61000</p>
                            </div>
                            <div>
                                <p className="text-white/60 font-medium mb-0.5">ติดต่อ</p>
                                <p>โทร. 056-513-036</p>
                                <p>แฟกซ์. 056-513-037</p>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <p className="text-white/60 font-medium mb-0.5">ลิงก์ที่เกี่ยวข้อง</p>
                                <a href="https://www.uthai.go.th" target="_blank" rel="noopener" className="block hover:text-white/70 transition-colors">เว็บไซต์หลักเทศบาล</a>
                                <Link to="/admin" className="block hover:text-white/70 transition-colors">ระบบเจ้าหน้าที่</Link>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
                        <p>© {new Date().getFullYear()} เทศบาลเมืองอุทัยธานี สงวนลิขสิทธิ์ — ระบบรับสมัครงานออนไลน์</p>
                        <p>พัฒนาโดยฝ่ายเทคโนโลยีสารสนเทศ</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
