/**
 * LINE Notify utility
 * 
 * LINE Notify requires a server-side token. For production, use Supabase Edge Functions.
 * This utility provides the interface for triggering notifications.
 * 
 * Setup:
 * 1. Go to https://notify-bot.line.me/
 * 2. Create a token for your LINE group
 * 3. Set the token in the LINE_NOTIFY_TOKEN below or in env vars
 */

const LINE_NOTIFY_PROXY = '' // Set to your CORS proxy or Supabase Edge Function URL

/**
 * Send a LINE Notify message
 * @param {string} message - The message to send
 * @param {string} token - LINE Notify token (optional, uses default if not provided)
 */
export async function sendLineNotify(message, token) {
    if (!LINE_NOTIFY_PROXY) {
        console.log('[LINE Notify] Proxy URL not configured. Message:', message)
        return { success: false, reason: 'proxy_not_configured' }
    }

    try {
        const response = await fetch(LINE_NOTIFY_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, token }),
        })

        if (response.ok) {
            return { success: true }
        } else {
            console.error('[LINE Notify] Error:', response.status)
            return { success: false, reason: 'api_error' }
        }
    } catch (err) {
        console.error('[LINE Notify] Network error:', err)
        return { success: false, reason: 'network_error' }
    }
}

/**
 * Format status change notification message
 */
export function formatStatusMessage(application, newStatus, position) {
    const statusLabels = {
        approved: '✅ อนุมัติแล้ว',
        rejected: '❌ ไม่อนุมัติ',
    }

    const lines = [
        '🏛️ เทศบาลเมืองอุทัยธานี',
        '━━━━━━━━━━━━━━',
        `📋 แจ้งผลการสมัคร`,
        `👤 ${application.full_name}`,
        `💼 ตำแหน่ง: ${position?.title || '-'}`,
        `📊 สถานะ: ${statusLabels[newStatus] || newStatus}`,
    ]

    if (newStatus === 'approved' && application.exam_number) {
        lines.push(`🎫 เลขประจำตัวสอบ: ${application.exam_number}`)
    }

    lines.push('━━━━━━━━━━━━━━')
    lines.push(`⏰ ${new Date().toLocaleString('th-TH')}`)

    return '\n' + lines.join('\n')
}
