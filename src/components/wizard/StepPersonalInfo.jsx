import { useMemo } from 'react'

// Thai 13-digit citizen ID checksum validation
function validateCitizenId(id) {
    if (!/^\d{13}$/.test(id)) return false
    let sum = 0
    for (let i = 0; i < 12; i++) {
        sum += parseInt(id[i]) * (13 - i)
    }
    const check = (11 - (sum % 11)) % 10
    return check === parseInt(id[12])
}

function calculateAge(birthDateStr) {
    if (!birthDateStr) return ''
    const birth = new Date(birthDateStr)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

export default function StepPersonalInfo({ data, onChange, errors }) {
    const age = useMemo(() => calculateAge(data.birth_date), [data.birth_date])
    const idValid = useMemo(() => data.citizen_id ? validateCitizenId(data.citizen_id) : null, [data.citizen_id])

    const inputClass = (field) =>
        `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors?.[field]
            ? 'border-danger bg-red-50'
            : 'border-gray-200 focus:border-primary bg-white'
        }`

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">ข้อมูลส่วนตัว</h3>
                <p className="text-gray-500 mt-2">กรอกข้อมูลส่วนตัวของท่าน</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Citizen ID */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        เลขบัตรประจำตัวประชาชน <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            maxLength={13}
                            placeholder="กรอกเลข 13 หลัก"
                            value={data.citizen_id || ''}
                            onChange={(e) => onChange({ citizen_id: e.target.value.replace(/\D/g, '') })}
                            className={inputClass('citizen_id')}
                        />
                        {data.citizen_id && data.citizen_id.length === 13 && (
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${idValid ? 'text-success' : 'text-danger'}`}>
                                {idValid ? '✓ ถูกต้อง' : '✗ ไม่ถูกต้อง'}
                            </span>
                        )}
                    </div>
                    {data.citizen_id && data.citizen_id.length === 13 && !idValid && (
                        <p className="text-danger text-sm mt-1">เลขบัตรประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง</p>
                    )}
                </div>

                {/* Full Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        ชื่อ-นามสกุล (นาย/นาง/นางสาว) <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="เช่น นายสมชาย ใจดี"
                        value={data.full_name || ''}
                        onChange={(e) => onChange({ full_name: e.target.value })}
                        className={inputClass('full_name')}
                    />
                </div>

                {/* Birth Date */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        วันเกิด <span className="text-danger">*</span>
                    </label>
                    <input
                        type="date"
                        value={data.birth_date || ''}
                        onChange={(e) => onChange({ birth_date: e.target.value })}
                        className={inputClass('birth_date')}
                    />
                </div>

                {/* Auto Age */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">อายุ</label>
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600">
                        {age !== '' ? `${age} ปี` : 'กรุณาเลือกวันเกิด'}
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        เบอร์โทรศัพท์ <span className="text-danger">*</span>
                    </label>
                    <input
                        type="tel"
                        maxLength={10}
                        placeholder="0812345678"
                        value={data.phone || ''}
                        onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, '') })}
                        className={inputClass('phone')}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">อีเมล</label>
                    <input
                        type="email"
                        placeholder="email@example.com"
                        value={data.email || ''}
                        onChange={(e) => onChange({ email: e.target.value })}
                        className={inputClass('email')}
                    />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        ที่อยู่ปัจจุบัน <span className="text-danger">*</span>
                    </label>
                    <textarea
                        rows={3}
                        placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                        value={data.address || ''}
                        onChange={(e) => onChange({ address: e.target.value })}
                        className={inputClass('address')}
                    />
                </div>
            </div>
        </div>
    )
}
