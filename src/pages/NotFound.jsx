import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import ClockTowerScene from '../components/ClockTowerScene'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-[#0a0f0d] dark:via-[#101a14] dark:to-[#0a0f0d] flex items-center justify-center p-4 relative overflow-hidden">
            {/* 3D Clock Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10" style={{ transform: 'scale(1.5) translateY(20%)' }}>
                <ClockTowerScene />
            </div>

            <div className="relative z-10 text-center max-w-md w-full bg-white/80 dark:bg-[#151f1a]/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50 dark:border-white/5">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-danger shadow-inner shadow-red-200 dark:shadow-red-900/50">
                    <span className="text-4xl font-black tracking-tighter">404</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">ไม่พบหน้านี้</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    หน้าที่คุณกำลังพยายามเข้าถึงอาจถูกลบ ย้าย หรือไม่มีอยู่จริงกรุณาตรวจสอบ URL อีกครั้ง
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center w-full gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Home className="w-5 h-5" />
                    กลับสู่หน้าหลัก
                </Link>
            </div>

            <div className="absolute bottom-6 text-center text-xs text-gray-400 dark:text-gray-600">
                ระบบรับสมัครงานออนไลน์ • เทศบาลเมืองอุทัยธานี
            </div>
        </div>
    )
}
