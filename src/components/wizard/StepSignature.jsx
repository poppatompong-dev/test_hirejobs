import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Eraser, PenTool } from 'lucide-react'

export default function StepSignature({ data, onChange, errors }) {
    const sigCanvas = useRef(null)

    // Load existing signature on mount if present
    useEffect(() => {
        if (data.signature && sigCanvas.current) {
            // Slight delay to ensure canvas is ready
            setTimeout(() => {
                sigCanvas.current.fromDataURL(data.signature)
            }, 100)
        }
    }, [])

    const clear = () => {
        sigCanvas.current.clear()
        onChange({ signature: null })
    }

    const saveSignature = () => {
        if (sigCanvas.current.isEmpty()) {
            onChange({ signature: null })
            return
        }
        // Save as base64 PNG
        onChange({ signature: sigCanvas.current.getTrimmedCanvas().toDataURL('image/png') })
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <PenTool className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">ลายมือชื่อผู้สมัคร</h3>
                <p className="text-gray-500 mt-2">กรุณาลงลายมือชื่อของท่านให้ชัดเจน เพื่อใช้แนบท้ายใบสมัคร</p>
            </div>

            <div className={`border-2 rounded-2xl overflow-hidden bg-white relative max-w-2xl mx-auto
                ${errors?.signature ? 'border-danger' : 'border-gray-200 focus-within:border-primary'}`}>

                {/* Signature Canvas */}
                <div className="w-full h-64 cursor-crosshair touch-none" onMouseUp={saveSignature} onTouchEnd={saveSignature}>
                    <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{ className: 'w-full h-full' }}
                        backgroundColor="rgba(255,255,255,1)"
                    />
                </div>

                {/* Clear Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        type="button"
                        onClick={clear}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100/80 backdrop-blur rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors"
                    >
                        <Eraser className="w-4 h-4" />
                        ล้างลายเซ็น
                    </button>
                </div>

                {/* Visual Guide Line */}
                <div className="absolute bottom-16 left-12 right-12 border-b-2 border-dashed border-gray-300 pointer-events-none opacity-50"></div>
                <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                    <span className="text-gray-400 text-sm font-medium">ลงชื่อตรงนี้</span>
                </div>
            </div>

            {errors?.signature && (
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-danger text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                        กรุณาลงลายมือชื่อก่อนดำเนินการต่อ
                    </p>
                </div>
            )}
        </div>
    )
}
