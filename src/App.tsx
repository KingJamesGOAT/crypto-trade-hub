import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { SimulatorProvider } from "@/context/SimulatorContext"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { Layout } from "@/components/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Home } from "@/pages/Home"
import { Learning } from "@/pages/Learning"
import { Simulator } from "@/pages/Simulator"
import { Settings } from "@/pages/Settings"
import { Backtest } from "@/pages/Backtest"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <SimulatorProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public route */}
                <Route path="/learning" element={<Learning />} />
                
                {/* Protected routes */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
                <Route path="/backtest" element={<ProtectedRoute><Backtest /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                
                {/* Redirect root to learning */}
                <Route path="/" element={<Navigate to="/learning" replace />} />
              </Routes>
            </Layout>
            <Toaster />
          </Router>
        </SimulatorProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
