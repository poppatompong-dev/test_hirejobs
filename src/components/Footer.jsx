import { Link } from 'react-router-dom'

export default function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer className="mt-auto bg-white dark:bg-[#0f1a14] border-t border-gray-200 dark:border-[#1e2a24]">
            {/* Slogan strip */}
            <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 dark:border-primary/20 py-4 px-4">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                    <span className="text-lg">🌿</span>
                    <p className="text-sm font-semibold text-primary dark:text-primary-light tracking-wide italic">
                        "เมืองน่าอยู่ บุคลากรมีคุณภาพ บริการด้วยใจ"
                    </p>
                    <span className="text-lg">🌿</span>
                </div>
            </div>

            {/* Main footer */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo + name */}
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-9 h-9 opacity-80" />
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">เทศบาลเมืองอุทัยธานี</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">ระบบรับสมัครงานออนไลน์</p>
                        </div>
                    </div>

                    {/* Developer credit */}
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>
                            ออกแบบและพัฒนาโดย{' '}
                            <span className="font-semibold text-primary dark:text-primary-light">นักวิชาการคอมพิวเตอร์</span>
                            {' '}และ{' '}
                            <span className="font-semibold text-primary dark:text-primary-light">นักทรัพยากรบุคคล</span>
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                        <a href="https://www.uthaicity.go.th/" target="_blank" rel="noopener noreferrer"
                            className="hover:text-primary transition-colors flex items-center gap-1">
                            เว็บไซต์หลัก
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                        <span className="text-gray-200 dark:text-gray-700">|</span>
                        <Link to="/check-status" className="hover:text-primary transition-colors">ตรวจสอบสถานะ</Link>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1e2a24] text-center text-xs text-gray-400 dark:text-gray-600">
                    © {year} เทศบาลเมืองอุทัยธานี สงวนลิขสิทธิ์
                </div>
            </div>
        </footer>
    )
}
