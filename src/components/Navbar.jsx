import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, FileText, Search, Home, ChevronRight } from 'lucide-react'

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => { setMobileOpen(false) }, [location.pathname])

    const navLinks = [
        { to: '/', label: 'หน้าหลัก', icon: Home },
        { to: '/check-status', label: 'ตรวจสอบสถานะ', icon: Search },
        { to: '/consent', label: 'ยื่นใบสมัคร', icon: FileText, highlight: true },
    ]

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/95 dark:bg-[#0f1a14]/95 backdrop-blur-md shadow-md shadow-gray-200/50 dark:shadow-black/30'
            : 'bg-white dark:bg-[#0f1a14]'
            } border-b border-gray-200 dark:border-[#1e2a24]`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 group-hover:scale-105 transition-transform duration-200" />
                            <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="hidden sm:block leading-tight">
                            <p className="text-sm font-extrabold text-gray-800 dark:text-white tracking-tight">เทศบาลเมืองอุทัยธานี</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Uthai Thani Municipality</p>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ to, label, icon: Icon, highlight }) =>
                            highlight ? (
                                <Link key={to} to={to}
                                    className="ml-2 flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow-primary/40">
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ) : (
                                <Link key={to} to={to}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${location.pathname === to
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2a24] hover:text-gray-900 dark:hover:text-white'
                                        }`}>
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            )
                        )}
                        <span className="mx-2 text-gray-200 dark:text-gray-700">|</span>
                        <Link to="/admin"
                            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1">
                            เจ้าหน้าที่
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e2a24] transition-colors"
                        aria-label="เมนู"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 dark:border-[#1e2a24] bg-white dark:bg-[#0f1a14] px-4 py-3 space-y-1">
                    {navLinks.map(({ to, label, icon: Icon, highlight }) => (
                        <Link key={to} to={to}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${highlight
                                ? 'bg-primary text-white hover:bg-primary-dark'
                                : location.pathname === to
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2a24]'
                                }`}>
                            <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4" />
                                {label}
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-40" />
                        </Link>
                    ))}
                    <div className="pt-2 pb-1 border-t border-gray-100 dark:border-[#1e2a24]">
                        <Link to="/admin" className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-[#1e2a24] transition-colors">
                            เข้าสู่ระบบเจ้าหน้าที่
                            <ChevronRight className="w-4 h-4 opacity-40" />
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
