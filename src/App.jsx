import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ConsentPage from './pages/ConsentPage'
import ApplicationWizard from './pages/ApplicationWizard'
import ApplicationSuccess from './pages/ApplicationSuccess'
import CheckStatus from './pages/CheckStatus'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/consent" element={<ConsentPage />} />
                <Route path="/apply" element={<ApplicationWizard />} />
                <Route path="/success" element={<ApplicationSuccess />} />
                <Route path="/check-status" element={<CheckStatus />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
