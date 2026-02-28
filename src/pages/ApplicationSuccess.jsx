import { Link, useLocation } from 'react-router-dom'

export default function ApplicationSuccess() {
    const location = useLocation()
    const { fullName } = location.state || {}

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-[#0a0f0d] dark:via-[#0f1a14] dark:to-[#0a0f0d] flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="bg-white dark:bg-[#151f1a] rounded-3xl shadow-2xl dark:shadow-black/30 p-10 text-center border border-gray-100 dark:border-[#1e2a24]">
                    {/* Success animation */}
                    <div className="relative inline-flex items-center justify-center mb-8">
                        <div className="absolute w-24 h-24 bg-primary/10 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-3">
                        ส่งใบสมัครสำเร็จ!
                    </h1>

                    {fullName && (
                        <p className="text-lg text-primary font-semibold mb-2">
                            {fullName}
                        </p>
                    )}

                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        ใบสมัครของท่านได้ถูกส่งเรียบร้อยแล้ว<br />
                        เจ้าหน้าที่จะดำเนินการตรวจสอบ<br />
                        และแจ้งผลให้ทราบในภายหลัง
                    </p>

                    <div className="bg-primary-50 dark:bg-primary/10 rounded-2xl p-5 mb-8 text-left">
                        <h3 className="text-sm font-bold text-primary mb-2">📋 ขั้นตอนถัดไป</h3>
                        <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
                            <li>เจ้าหน้าที่ตรวจสอบเอกสาร</li>
                            <li>ประกาศรายชื่อผู้มีสิทธิ์สอบ</li>
                            <li>รับบัตรประจำตัวสอบ</li>
                        </ol>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            กลับหน้าหลัก
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
