import { useEffect, useRef } from 'react'

/**
 * Application Form Template — matches the reference layout for Thai government applications
 * Rendered as HTML/CSS for html2canvas capture → pixel-perfect Thai text in PDF.
 */
export default function ApplicationFormTemplate({ application, position, onReady }) {
    const formRef = useRef(null)

    useEffect(() => {
        // Wait for images and layout to render
        const timer = setTimeout(() => {
            if (onReady && formRef.current) onReady(formRef.current)
        }, 800)
        return () => clearTimeout(timer)
    }, [application, onReady])

    const dateStr = new Date(application.created_at || Date.now()).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div
            ref={formRef}
            style={{
                width: '794px', // A4 width at 96 DPI
                minHeight: '1123px', // A4 height at 96 DPI
                fontFamily: "'Sarabun', sans-serif",
                background: '#fff',
                position: 'relative',
                padding: '40px 50px',
                color: '#000',
                fontSize: '14px',
                lineHeight: '1.8',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '100px', textAlign: 'center' }}>
                    <img src="/garuda.webp" alt="ครุฑ" style={{ width: '60px', height: '60px', objectFit: 'contain' }} crossOrigin="anonymous" />
                </div>
                <div style={{ flex: 1, textAlign: 'center', paddingTop: '10px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>ใบสมัครเข้ารับการสรรหาและเลือกสรรเป็นพนักงานจ้าง</h2>
                    <p style={{ margin: '5px 0 0', fontSize: '16px' }}>เทศบาลเมืองอุทัยธานี อำเภอเมืองอุทัยธานี จังหวัดอุทัยธานี</p>
                </div>
                <div style={{ width: '130px', height: '160px', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px', textAlign: 'center' }}>
                    {application.photoUrl ? (
                        <img src={application.photoUrl} alt="รูปถ่าย" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                    ) : (
                        <div>รูปถ่าย<br />ขนาด 1 นิ้ว</div>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <p style={{ margin: 0 }}>เขียนที่ <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>ระบบรับสมัครงานออนไลน์ เทศบาลเมืองอุทัยธานี</span></p>
                <p style={{ margin: '5px 0 0' }}>วันที่ <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{dateStr}</span></p>
            </div>

            {/* Application Data */}
            <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>1. ชื่อ-สกุล (ผู้สมัคร) </span>
                <span style={{ borderBottom: '1px dotted #000', padding: '0 10px', display: 'inline-block', minWidth: '300px' }}>{application.full_name || '-'}</span>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>2. สมัครเพื่อรับการเลือกสรรเป็นพนักงานจ้างในตำแหน่ง </span>
                <span style={{ borderBottom: '1px dotted #000', padding: '0 10px', display: 'inline-block', minWidth: '250px' }}>{position?.title || '-'}</span>
            </div>
            <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>สังกัด (กอง/สำนัก) </span>
                <span style={{ borderBottom: '1px dotted #000', padding: '0 10px', display: 'inline-block', minWidth: '250px' }}>{position?.department || '-'}</span>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <div>
                    <span style={{ fontWeight: 'bold' }}>3. วัน/เดือน/ปีเกิด </span>
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.birth_date || '-'}</span>
                </div>
                <div>
                    <span style={{ fontWeight: 'bold' }}>เลขประจำตัวประชาชน </span>
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 10px', fontFamily: 'monospace', letterSpacing: '1px' }}>{application.citizen_id || '-'}</span>
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>4. ภูมิลำเนา (ที่อยู่ปัจจุบันที่สามารถติดต่อได้) </span>
                <span style={{ borderBottom: '1px dotted #000', padding: '0 10px', display: 'inline-block', width: '100%', marginTop: '5px' }}>{application.address || '-'}</span>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <div>
                    <span style={{ fontWeight: 'bold' }}>โทรศัพท์ </span>
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.phone || '-'}</span>
                </div>
                <div>
                    <span style={{ fontWeight: 'bold' }}>อีเมล </span>
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.email || '-'}</span>
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>5. ประวัติการศึกษา </span>
            </div>
            <div style={{ marginBottom: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ marginBottom: '5px' }}>
                    <span>- วุฒิการศึกษา </span>
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.education_level || '-'}</span>
                </div>
                <div style={{ marginBottom: '5px' }}>
                    <span>- สถาบันการศึกษา </span>
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.institution || '-'}</span>
                </div>
                <div style={{ marginBottom: '5px' }}>
                    <span>- สาขาวิชา </span>
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.major || '-'}</span>
                </div>
                <div style={{ marginBottom: '5px' }}>
                    <span>- เกรดเฉลี่ย (GPA) </span>
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.gpa || '-'}</span>
                </div>
            </div>

            <div style={{ marginBottom: '15px', marginTop: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>6. อาชีพในปัจจุบัน </span>
                <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.current_occupation || '-'}</span>
                <span style={{ marginLeft: '15px', fontWeight: 'bold' }}>สถานที่ทำงาน </span>
                <span style={{ borderBottom: '1px dotted #000', padding: '0 10px' }}>{application.work_place || '-'}</span>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>7. ทักษะและความสามารถพิเศษ </span>
                <span style={{ borderBottom: '1px dotted #000', padding: '0 10px', display: 'inline-block', width: '100%', marginTop: '5px' }}>{application.skills || '-'}</span>
            </div>

            <div style={{ marginBottom: '30px', marginTop: '30px' }}>
                <p style={{ textIndent: '40px', margin: 0 }}>ข้าพเจ้าขอรับรองว่าข้อความดังกล่าวข้างต้นเป็นความจริงทุกประการ หากปรากฏว่าข้อความดั่งกล่าวไม่เป็นความจริง หรือข้าพเจ้าขาดคุณสมบัติในการสมัครเข้ารับการเลือกสรร ข้าพเจ้ายินยอมให้ตัดสิทธิ์การสอบ หรือออกจากงานโดยไม่มีเงื่อนไขใดๆ ทั้งสิ้น</p>
            </div>

            {/* Signature Area */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '50px' }}>
                <div style={{ textAlign: 'center', width: '300px' }}>
                    <p style={{ margin: '0 0 5px' }}>(ลงชื่อ)</p>
                    <div style={{ position: 'relative', height: '40px' }}>
                        {application.signature ? (
                            <img src={application.signature} alt="ลายเซ็น" style={{ height: '50px', objectFit: 'contain', position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)' }} crossOrigin="anonymous" />
                        ) : null}
                    </div>
                    <p style={{ borderBottom: '1px dotted #000', margin: '0 0 5px' }}></p>
                    <p style={{ margin: 0 }}>( {application.full_name || '...........................................'} )</p>
                    <p style={{ margin: 0 }}>ผู้สมัครสอบ</p>
                </div>
            </div>

            {/* Footer watermark */}
            <div style={{ position: 'absolute', bottom: '30px', left: '50px', fontSize: '10px', color: '#999' }}>
                * เอกสารฉบับนี้พิมพ์จากระบบรับสมัครงานออนไลน์ เทศบาลเมืองอุทัยธานี ({application.id})
            </div>
        </div>
    )
}
