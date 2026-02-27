export default function StepEducation({ data, onChange, errors }) {
    const inputClass = (field) =>
        `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors?.[field]
            ? 'border-danger bg-red-50'
            : 'border-gray-200 focus:border-primary bg-white'
        }`

    const educationLevels = [
        'ต่ำกว่าปริญญาตรี',
        'ปริญญาตรี',
        'ปริญญาโท',
        'ปริญญาเอก',
    ]

    const disabilityTypes = [
        { value: '', label: 'ไม่มี' },
        { value: 'visual', label: 'พิการทางการมองเห็น' },
        { value: 'hearing', label: 'พิการทางการได้ยิน' },
        { value: 'mobility', label: 'พิการทางการเคลื่อนไหวหรือทางร่างกาย' },
        { value: 'mental', label: 'พิการทางจิตใจ หรือพฤติกรรม' },
        { value: 'intellectual', label: 'พิการทางสติปัญญา' },
        { value: 'learning', label: 'พิการทางการเรียนรู้' },
        { value: 'autism', label: 'พิการทางออทิสติก' },
    ]

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">วุฒิการศึกษาและทักษะ</h3>
                <p className="text-gray-500 mt-2">กรอกข้อมูลการศึกษาและประสบการณ์</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Education Level */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        ระดับการศึกษา <span className="text-danger">*</span>
                    </label>
                    <select
                        value={data.education_level || ''}
                        onChange={(e) => onChange({ education_level: e.target.value })}
                        className={inputClass('education_level')}
                    >
                        <option value="">-- เลือกระดับการศึกษา --</option>
                        {educationLevels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                {/* Institution */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        สถาบันการศึกษา <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="ชื่อมหาวิทยาลัย/สถานศึกษา"
                        value={data.institution || ''}
                        onChange={(e) => onChange({ institution: e.target.value })}
                        className={inputClass('institution')}
                    />
                </div>

                {/* Major */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        สาขาวิชา/วิชาเอก
                    </label>
                    <input
                        type="text"
                        placeholder="สาขาวิชาที่จบ"
                        value={data.major || ''}
                        onChange={(e) => onChange({ major: e.target.value })}
                        className={inputClass('major')}
                    />
                </div>

                {/* GPA */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">คะแนนเฉลี่ยสะสม (GPA)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        placeholder="เช่น 3.25"
                        value={data.gpa || ''}
                        onChange={(e) => onChange({ gpa: e.target.value })}
                        className={inputClass('gpa')}
                    />
                </div>

                {/* Graduation Date */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">สำเร็จการศึกษาเมื่อ</label>
                    <input
                        type="text"
                        placeholder="เช่น พ.ศ. 2565"
                        value={data.graduation_date || ''}
                        onChange={(e) => onChange({ graduation_date: e.target.value })}
                        className={inputClass('graduation_date')}
                    />
                </div>

                {/* Current Occupation */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">อาชีพปัจจุบัน</label>
                    <input
                        type="text"
                        placeholder="เช่น พนักงานบริษัท"
                        value={data.current_occupation || ''}
                        onChange={(e) => onChange({ current_occupation: e.target.value })}
                        className={inputClass('current_occupation')}
                    />
                </div>

                {/* Work Place */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">สถานที่ทำงาน/ปฏิบัติงาน</label>
                    <input
                        type="text"
                        placeholder="ชื่อหน่วยงาน/บริษัท อำเภอ จังหวัด"
                        value={data.work_place || ''}
                        onChange={(e) => onChange({ work_place: e.target.value })}
                        className={inputClass('work_place')}
                    />
                </div>

                {/* Disability */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        ประเภทความพิการ (กรณีเป็นผู้พิการ)
                    </label>
                    <select
                        value={data.disability_type || ''}
                        onChange={(e) => onChange({ disability_type: e.target.value })}
                        className={inputClass('disability_type')}
                    >
                        {disabilityTypes.map((dt) => (
                            <option key={dt.value} value={dt.value}>{dt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Skills */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ทักษะพิเศษ/ความสามารถ</label>
                    <textarea
                        rows={3}
                        placeholder="เช่น ทักษะคอมพิวเตอร์ ภาษาต่างประเทศ ใบขับขี่ ฯลฯ"
                        value={data.skills || ''}
                        onChange={(e) => onChange({ skills: e.target.value })}
                        className={inputClass('skills')}
                    />
                </div>
            </div>
        </div>
    )
}
