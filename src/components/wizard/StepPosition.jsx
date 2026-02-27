import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function StepPosition({ data, onChange }) {
    const [positions, setPositions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPositions() {
            const { data: posData } = await supabase
                .from('positions')
                .select('*')
                .order('department')
            if (posData) setPositions(posData)
            setLoading(false)
        }
        fetchPositions()
    }, [])

    // Group positions by department
    const grouped = positions.reduce((acc, pos) => {
        if (!acc[pos.department]) acc[pos.department] = []
        acc[pos.department].push(pos)
        return acc
    }, {})

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">เลือกตำแหน่งที่ต้องการสมัคร</h3>
                <p className="text-gray-500 mt-2">กรุณาเลือกตำแหน่งงานที่ท่านสนใจ</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([dept, posItems]) => (
                        <div key={dept}>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full" />
                                {dept}
                            </h4>
                            <div className="grid gap-3">
                                {posItems.map((pos) => (
                                    <label
                                        key={pos.id}
                                        className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${data.position_id === pos.id
                                                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                                : 'border-gray-200 hover:border-primary/40 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${data.position_id === pos.id
                                                    ? 'border-primary bg-primary'
                                                    : 'border-gray-300'
                                                }`}>
                                                {data.position_id === pos.id && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                            <input
                                                type="radio"
                                                name="position_id"
                                                value={pos.id}
                                                checked={data.position_id === pos.id}
                                                onChange={(e) => onChange({ position_id: e.target.value })}
                                                className="sr-only"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-800">{pos.title}</p>
                                                <p className="text-sm text-gray-500">{pos.department}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
