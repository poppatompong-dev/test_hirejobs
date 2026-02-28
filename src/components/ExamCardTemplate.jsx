import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

/**
 * Exam Card Template — matches the reference layout from:
 * "บัตรประจำตัวผู้สมัครเข้ารับการเลือกสรรเป็นพนักงานจ้าง เทศบาลเมืองอุทัยธานี"
 * 
 * Rendered as HTML/CSS for html2canvas capture → pixel-perfect Thai text in PDF.
 */
export default function ExamCardTemplate({ application, position, onReady }) {
    const cardRef = useRef(null)
    const [qrDataUrl, setQrDataUrl] = useState('')

    useEffect(() => {
        const verifyUrl = `https://invodjsmbhipvxpgfjdw.supabase.co/verify/${application.id}`
        QRCode.toDataURL(verifyUrl, {
            width: 140,
            margin: 1,
            color: { dark: '#00843D', light: '#FFFFFF' },
        }).then(url => {
            setQrDataUrl(url)
            setTimeout(() => {
                if (onReady && cardRef.current) onReady(cardRef.current)
            }, 500)
        })
    }, [application.id, onReady])

    const isMission = position?.title?.includes('ตามภารกิจ')
    const examDigits = (application.exam_number || '0000').split('')

    return (
        <div
            ref={cardRef}
            style={{
                width: '600px',
                minHeight: '380px',
                fontFamily: "'Sarabun', sans-serif",
                background: '#fff',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid #00843D',
                borderRadius: '10px',
                color: '#222',
                fontSize: '13px',
                lineHeight: '1.7',
            }}
        >
            {/* ─── Header with green background ─── */}
            <div style={{
                background: 'linear-gradient(135deg, #00843D 0%, #00A84D 100%)',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '2px solid #006B31',
            }}>
                {/* Municipal seal */}
                <img
                    src="/logo.png"
                    alt="ตราเทศบาล"
                    style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.5)',
                        background: '#fff',
                        padding: '2px',
                    }}
                    crossOrigin="anonymous"
                />
                {/* Garuda */}
                <img
                    src="/garuda.webp"
                    alt="ตราครุฑ"
                    style={{
                        width: '34px',
                        height: '34px',
                        objectFit: 'contain',
                    }}
                    crossOrigin="anonymous"
                />
                <div style={{ flex: 1 }}>
                    <div style={{
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 700,
                        lineHeight: 1.4,
                    }}>
                        บัตรประจำตัวผู้สมัครเข้ารับการเลือกสรรเป็นพนักงานจ้าง
                    </div>
                    <div style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '12px',
                        fontWeight: 400,
                    }}>
                        เทศบาลเมืองอุทัยธานี จังหวัดอุทัยธานี
                    </div>
                </div>
            </div>

            {/* ─── Body ─── */}
            <div style={{ padding: '14px 18px 10px', display: 'flex', gap: '16px' }}>
                {/* Left column: Info */}
                <div style={{ flex: 1 }}>
                    {/* Exam number row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>เลขประจำตัวสอบ</span>
                        <div style={{ display: 'flex', gap: '3px' }}>
                            {examDigits.map((d, i) => (
                                <div key={i} style={{
                                    width: '28px',
                                    height: '30px',
                                    border: '2px solid #00843D',
                                    borderRadius: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#00843D',
                                    backgroundColor: '#E8F5EF',
                                    fontFamily: "'Sarabun', monospace",
                                }}>{d}</div>
                            ))}
                        </div>
                    </div>

                    {/* Employee type checkboxes */}
                    <div style={{ display: 'flex', gap: '18px', marginBottom: '8px', fontSize: '12.5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{
                                width: '15px',
                                height: '15px',
                                border: '1.5px solid #444',
                                borderRadius: '3px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: isMission ? '#00843D' : 'transparent',
                                backgroundColor: isMission ? '#E8F5EF' : '#fff',
                            }}>{isMission ? '✓' : ''}</span>
                            พนักงานจ้างตามภารกิจ
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{
                                width: '15px',
                                height: '15px',
                                border: '1.5px solid #444',
                                borderRadius: '3px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: !isMission ? '#00843D' : 'transparent',
                                backgroundColor: !isMission ? '#E8F5EF' : '#fff',
                            }}>{!isMission ? '✓' : ''}</span>
                            พนักงานจ้างทั่วไป
                        </label>
                    </div>

                    {/* Position */}
                    <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 400 }}>สมัครสอบตำแหน่ง </span>
                        <span style={{
                            fontWeight: 700,
                            borderBottom: '1px dotted #999',
                            paddingBottom: '1px',
                            minWidth: '160px',
                            display: 'inline-block',
                        }}>
                            {position?.title || '............................'}
                        </span>
                    </div>

                    {/* Department */}
                    <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 400 }}>สังกัด </span>
                        <span style={{
                            fontWeight: 700,
                            borderBottom: '1px dotted #999',
                            paddingBottom: '1px',
                            minWidth: '180px',
                            display: 'inline-block',
                        }}>
                            {position?.department || '............................'}
                        </span>
                    </div>

                    {/* Name */}
                    <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 400 }}>ชื่อ-สกุล </span>
                        <span style={{
                            fontWeight: 700,
                            borderBottom: '1px dotted #999',
                            paddingBottom: '1px',
                            minWidth: '200px',
                            display: 'inline-block',
                            fontSize: '14px',
                        }}>
                            {application.full_name || '............................'}
                        </span>
                    </div>

                    {/* Citizen ID boxes */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <span style={{ fontWeight: 400, fontSize: '12px' }}>เลขประจำตัวประชาชน</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {(application.citizen_id || '0000000000000').split('').map((d, i) => (
                                <div key={i} style={{
                                    width: '20px',
                                    height: '22px',
                                    border: '1px solid #888',
                                    borderRadius: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#333',
                                    backgroundColor: '#FAFAFA',
                                    fontFamily: "'Sarabun', monospace",
                                }}>{d}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column: Photo + QR */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {/* Photo */}
                    <div style={{
                        width: '90px',
                        height: '110px',
                        border: '1.5px solid #999',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fafafa',
                        overflow: 'hidden',
                    }}>
                        {application.photoUrl ? (
                            <img
                                src={application.photoUrl}
                                alt="photo"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#aaa', fontSize: '9px', lineHeight: 1.4, padding: '4px' }}>
                                ติดรูปถ่าย<br />ขนาด ๑ นิ้ว<br />(ถ่ายไม่เกิน<br />๖ เดือน)
                            </div>
                        )}
                    </div>

                    {/* QR Code */}
                    {qrDataUrl && (
                        <div style={{ textAlign: 'center' }}>
                            <img src={qrDataUrl} alt="QR" style={{ width: '60px', height: '60px', borderRadius: '4px' }} />
                            <div style={{ fontSize: '7px', color: '#999', marginTop: '1px' }}>สแกนตรวจสอบ</div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Footer: Signature area ─── */}
            <div style={{
                borderTop: '1.5px solid #E0E0E0',
                margin: '0 18px',
                padding: '12px 0 14px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#555',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '4px', letterSpacing: '1px' }}>............................................</div>
                    <div>เจ้าหน้าที่ออกบัตร</div>
                </div>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    {application.signature ? (
                        <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)' }}>
                            <img src={application.signature} alt="signature" style={{ height: '35px', objectFit: 'contain' }} crossOrigin="anonymous" />
                        </div>
                    ) : null}
                    <div style={{ marginBottom: '4px', letterSpacing: '1px', color: application.signature ? 'transparent' : 'inherit' }}>
                        ............................................
                    </div>
                    <div>ลายมือชื่อผู้สมัครสอบ</div>
                </div>
            </div>

            {/* Subtle watermark */}
            <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '8px',
                fontSize: '7px',
                color: '#ccc',
            }}>
                ออกโดยระบบรับสมัครงานออนไลน์ เทศบาลเมืองอุทัยธานี
            </div>
        </div>
    )
}
