import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const ADMIN_PASSWORD = 'uthai2026'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = (e) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth', 'true')
            navigate('/admin/dashboard')
        } else {
            setError('รหัสผ่านไม่ถูกต้อง')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071a0e] via-[#0d2a16] to-[#071a0e] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 animate-float" />
                    <h1 className="text-2xl font-bold text-white">ระบบเจ้าหน้าที่</h1>
                    <p className="text-gray-400 mt-1">เทศบาลเมืองอุทัยธานี</p>
                </div>

                <div className="glass rounded-3xl p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">รหัสผ่านเจ้าหน้าที่</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                placeholder="กรอกรหัสผ่าน"
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
                        >
                            เข้าสู่ระบบ
                        </button>
                    </form>

                    <Link to="/" className="block text-center text-sm text-white/50 mt-6 hover:text-white/80 transition-colors">
                        ← กลับหน้าหลัก
                    </Link>
                </div>
            </div>
        </div>
    )
}
