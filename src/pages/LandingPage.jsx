import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ClockTowerScene from '../components/ClockTowerScene'

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
            {/* ── HERO SECTION ── */}
            <section className="relative min-h-screen flex items-center justify-center">
                <ClockTowerScene />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#071a0e]/40 via-transparent to-[#071a0e] z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071a0e]/60 via-transparent to-[#071a0e]/60 z-[1]" />

                {/* Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <div className="animate-fade-in-up">
                        <img
                            src="/logo.png"
                            alt="ตราเทศบาลเมืองอุทัยธานี"
                            className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 drop-shadow-2xl animate-float"
                        />
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 animate-fade-in-up stagger-1 leading-tight">
                        <span className="bg-gradient-to-r from-[#D4AF37] via-[#E8C84A] to-[#D4AF37] bg-clip-text text-transparent">
                            ระบบรับสมัครงานออนไลน์
                        </span>
                    </h1>

                    <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-primary-100 mb-3 animate-fade-in-up stagger-2 opacity-0">
                        เทศบาลเมืองอุทัยธานี
                    </h2>

                    <p className="text-base md:text-lg text-gray-300 mb-10 max-w-2xl mx-auto animate-fade-in-up stagger-3 opacity-0">
                        สมัครงานง่าย สะดวก รวดเร็ว — ยื่นใบสมัครผ่านระบบออนไลน์ได้ทันที
                        ไม่ต้องเดินทางมาสมัครด้วยตนเอง
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-4 opacity-0">
                        <Link
                            to="/consent"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all duration-300 animate-pulse-glow"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            สมัครงานออนไลน์
                        </Link>
                        <Link
                            to="/check-status"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border-2 border-accent/50 text-accent-light font-semibold text-lg rounded-2xl hover:bg-accent/20 hover:border-accent transition-all duration-300 backdrop-blur-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            ตรวจสอบสถานะ
                        </Link>
                        <a
                            href="#positions"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            ดูตำแหน่งว่าง
                        </a>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
                        <div className="w-1.5 h-3 bg-white/60 rounded-full" />
                    </div>
                </div>
            </section>

            {/* ── POSITIONS SECTION ── */}
            <section id="positions" className="relative z-10 bg-gradient-to-b from-[#071a0e] to-[#0d2a16] py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary-light rounded-full text-sm font-medium mb-4 border border-primary/30">
                            ตำแหน่งที่เปิดรับสมัคร
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            ตำแหน่งงานที่เปิดรับ
                        </h2>
                        <p className="text-gray-400 max-w-lg mx-auto">
                            เลือกตำแหน่งที่ท่านสนใจ แล้วกดปุ่มสมัครงานเพื่อเริ่มกรอกใบสมัคร
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : positions.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-lg">ยังไม่มีตำแหน่งเปิดรับสมัครในขณะนี้</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {positions.map((pos, index) => (
                                <div
                                    key={pos.id}
                                    className="group glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                                                {pos.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                {pos.department}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-xl bg-primary/20 text-primary-light group-hover:bg-primary group-hover:text-white transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            to="/consent"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            เริ่มสมัครงาน
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-[#050f09] border-t border-white/10 py-10 px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    <img src="/logo.png" alt="Logo" className="w-14 h-14 mx-auto mb-4 opacity-60" />
                    <p className="text-gray-400 text-sm">
                        เทศบาลเมืองอุทัยธานี | Uthai Thani Municipality
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                        © {new Date().getFullYear()} สงวนลิขสิทธิ์ — ระบบรับสมัครงานออนไลน์
                    </p>
                    <Link to="/admin" className="text-gray-600 text-xs mt-3 inline-block hover:text-gray-400 transition-colors">
                        เข้าสู่ระบบเจ้าหน้าที่
                    </Link>
                </div>
            </footer>
        </div>
    )
}
