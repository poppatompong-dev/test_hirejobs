import { useMemo, useState, useEffect } from 'react'
import { InputThaiAddress } from 'thai-address-autocomplete-react'

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

    // Address splitting for autocomplete
    const [addrParts, setAddrParts] = useState({
        details: '', // บ้านเลขที่ หมู่ ซอย ถนน
        tumbol: '',
        amphoe: '',
        province: '',
        zipcode: ''
    })

    // Parse existing address on mount
    useEffect(() => {
        if (data.address && !addrParts.details) {
            // Attempt simple parsing if editing existing data
            const parts = data.address.split(' ต.')
            if (parts.length > 1) {
                setAddrParts(prev => ({ ...prev, details: parts[0] }))
            } else {
                setAddrParts(prev => ({ ...prev, details: data.address }))
            }
        }
    }, [])

    const handleAddressSelect = (addressObj) => {
        const newParts = {
            ...addrParts,
            tumbol: addressObj.district,
            amphoe: addressObj.amphoe,
            province: addressObj.province,
            zipcode: addressObj.zipcode
        }
        setAddrParts(newParts)
        // Combine into standard string format for compatibility
        const fullAddr = `${newParts.details} ต.${newParts.tumbol} อ.${newParts.amphoe} จ.${newParts.province} ${newParts.zipcode}`.trim()
        onChange({ address: fullAddr })
    }

    const handleDetailsChange = (e) => {
        const d = e.target.value
        setAddrParts(p => ({ ...p, details: d }))
        const fullAddr = `${d} ต.${addrParts.tumbol} อ.${addrParts.amphoe} จ.${addrParts.province} ${addrParts.zipcode}`.trim()
        onChange({ address: fullAddr.replace(/ต. อ. จ. /g, '') }) // clean if empty
    }

    const handleThaiAddrChange = (field) => (e) => {
        const val = e.target.value
        setAddrParts(p => ({ ...p, [field]: val }))
        // Not calling onChange yet, wait for user to select from dropdown to get full string
    }

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
                {/* Address Group */}
                <div className="md:col-span-2 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 mb-2">
                    <label className="block text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                        ที่อยู่ปัจจุบัน <span className="text-danger">*</span>
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">บ้านเลขที่ / หมู่ / ซอย / ถนน</label>
                            <input
                                type="text"
                                placeholder="เช่น 123/4 ม.1 ซ.สายใจ"
                                value={addrParts.details}
                                onChange={handleDetailsChange}
                                className={inputClass('address')}
                            />
                        </div>
                        <div className="relative z-[60]">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">ตำบล / แขวง</label>
                            <InputThaiAddress.District
                                value={addrParts.tumbol}
                                onChange={handleThaiAddrChange('tumbol')}
                                onSelect={handleAddressSelect}
                                styleProps={{ className: inputClass('address') }}
                            />
                        </div>
                        <div className="relative z-[50]">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">อำเภอ / เขต</label>
                            <InputThaiAddress.Amphoe
                                value={addrParts.amphoe}
                                onChange={handleThaiAddrChange('amphoe')}
                                onSelect={handleAddressSelect}
                                styleProps={{ className: inputClass('address') }}
                            />
                        </div>
                        <div className="relative z-[40]">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">จังหวัด</label>
                            <InputThaiAddress.Province
                                value={addrParts.province}
                                onChange={handleThaiAddrChange('province')}
                                onSelect={handleAddressSelect}
                                styleProps={{ className: inputClass('address') }}
                            />
                        </div>
                        <div className="relative z-[30]">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">รหัสไปรษณีย์</label>
                            <InputThaiAddress.Zipcode
                                value={addrParts.zipcode}
                                onChange={handleThaiAddrChange('zipcode')}
                                onSelect={handleAddressSelect}
                                styleProps={{ className: inputClass('address') }}
                            />
                        </div>
                    </div>
                    {errors?.address && <p className="text-danger text-sm mt-3">กรุณาระบุที่อยู่ให้ครบถ้วน</p>}
                </div>
            </div>
        </div>
    )
}
