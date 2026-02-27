import * as XLSX from 'xlsx'

/**
 * Export applicant data to Excel (.xlsx)
 * @param {Array} applications - Array of application objects
 * @param {Array} positions - Array of position objects for lookup
 * @param {string} filterLabel - Label for the current filter (e.g. "ทั้งหมด")
 */
export function exportToExcel(applications, positions, filterLabel = 'ทั้งหมด') {
    const posMap = new Map(positions.map(p => [p.id, p]))

    const statusLabels = {
        pending: 'รอตรวจสอบ',
        approved: 'อนุมัติ',
        rejected: 'ไม่อนุมัติ',
    }

    // Prepare data rows
    const rows = applications.map((app, idx) => {
        const pos = posMap.get(app.position_id)
        return {
            'ลำดับ': idx + 1,
            'ชื่อ-สกุล': app.full_name,
            'เลขบัตรประชาชน': app.citizen_id,
            'ตำแหน่ง': pos?.title || '-',
            'สังกัด': pos?.department || '-',
            'วุฒิการศึกษา': app.education_level || '-',
            'สถาบัน': app.institution || '-',
            'สาขาวิชา': app.major || '-',
            'GPA': app.gpa || '-',
            'โทรศัพท์': app.phone || '-',
            'อีเมล': app.email || '-',
            'สถานะ': statusLabels[app.status] || app.status,
            'เลขประจำตัวสอบ': app.exam_number || '-',
            'วันที่สมัคร': app.created_at
                ? new Date(app.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                })
                : '-',
        }
    })

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(rows)

    // Set column widths
    ws['!cols'] = [
        { wch: 6 },   // ลำดับ
        { wch: 24 },  // ชื่อ-สกุล
        { wch: 16 },  // เลขบัตร
        { wch: 22 },  // ตำแหน่ง
        { wch: 22 },  // สังกัด
        { wch: 14 },  // วุฒิ
        { wch: 20 },  // สถาบัน
        { wch: 18 },  // สาขา
        { wch: 6 },   // GPA
        { wch: 14 },  // โทร
        { wch: 22 },  // อีเมล
        { wch: 12 },  // สถานะ
        { wch: 14 },  // เลขสอบ
        { wch: 18 },  // วันที่
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อผู้สมัคร')

    // Generate filename with date
    const dateStr = new Date().toLocaleDateString('th-TH').replace(/\//g, '-')
    XLSX.writeFile(wb, `รายชื่อผู้สมัคร_${filterLabel}_${dateStr}.xlsx`)
}
