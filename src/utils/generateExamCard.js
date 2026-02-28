import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Generate Exam ID Card PDF using html2canvas for 100% Thai glyph accuracy.
 * Renders an off-screen HTML element to canvas, then embeds in PDF.
 */
export async function generateExamCard(cardElement, application) {
    if (!cardElement) {
        console.error('Card element not found')
        return
    }

    try {
        // Capture the HTML element as a canvas
        const canvas = await html2canvas(cardElement, {
            scale: 3, // High DPI for crisp output
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
        })

        // Calculate PDF dimensions from canvas aspect ratio
        const imgWidth = 140 // mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [imgHeight + 10, imgWidth + 10],
        })

        // Add the canvas image to PDF
        const imgData = canvas.toDataURL('image/png', 1.0)
        doc.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight)

        // --- Watermark ---
        doc.saveGraphicsState()
        doc.setGState(new doc.GState({ opacity: 0.15 }))
        doc.setTextColor(150, 150, 150)

        // Load Thai font or fallback to basic font (jsPDF doesn't natively support Thai without custom VFS)
        // Since it's just a simple watermark, we'll use english timestamp + simple thai if it renders, otherwise it might look like squares.
        // Actually, jsPDF standard fonts DO NOT support Thai characters and setting a custom VFS is complex.
        // I'll create a simple English timestamp watermark instead to guarantee it works.
        const dateStr = new Date().toLocaleString('th-TH')
        doc.setFontSize(30)
        doc.text(`Uthai Thani Municipality - ${dateStr}`, imgWidth / 2, imgHeight / 2, {
            align: 'center',
            angle: 30
        })
        doc.restoreGraphicsState()

        // Save
        const name = application.full_name || 'applicant'
        const examNum = application.exam_number || '0000'
        doc.save(`บัตรประจำตัวสอบ_${examNum}_${name}.pdf`)

        return true
    } catch (err) {
        console.error('PDF generation error:', err)
        return false
    }
}
