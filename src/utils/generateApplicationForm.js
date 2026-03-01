import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Generate Application Form PDF using html2canvas for 100% Thai glyph accuracy.
 * Renders an off-screen HTML element to canvas, then embeds in A4 PDF.
 */
export async function generateApplicationForm(formElement, application) {
    if (!formElement) {
        console.error('Form element not found')
        return
    }

    try {
        const canvas = await html2canvas(formElement, {
            scale: 2, // High DPI for crisp output on A4
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
        })

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        })

        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 0

        doc.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        // Add new pages if the content is longer than one A4 page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            doc.addPage()
            doc.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
        }

        const name = application.full_name || 'applicant'
        doc.save(`ใบสมัคร_${name}.pdf`)

        return true
    } catch (err) {
        console.error('PDF generation error:', err)
        return false
    }
}
