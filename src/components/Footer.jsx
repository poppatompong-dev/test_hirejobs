import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="mt-auto py-8 bg-white dark:bg-[#151f1a] border-t border-gray-200 dark:border-[#1e2a24]">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        ออกแบบและพัฒนาระบบโดย{' '}
                        <span className="font-semibold text-primary">นักวิชาการคอมพิวเตอร์</span> และ{' '}
                        <span className="font-semibold text-primary">นักทรัพยากรบุคคล</span>
                    </p>
                    <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
                    <a
                        href="https://www.uthaicity.go.th/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors hover:underline flex items-center gap-1"
                    >
                        เทศบาลเมืองอุทัยธานี
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    )
}
