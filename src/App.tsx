import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { SimulatorProvider } from "@/context/SimulatorContext"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { Layout } from "@/components/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Home } from "@/pages/Home"
import { Learning } from "@/pages/Learning"
import { News } from "@/pages/News"
import { Simulator } from "@/pages/Simulator"
import { Settings } from "@/pages/Settings"
import { Backtest } from "@/pages/Backtest"

import { useAuth } from "@/context/AuthContext"

function RootRedirect() {
  const { isAuthenticated, username } = useAuth()
  return (
    <Navigate 
      to={isAuthenticated && username === 'blackswan' ? "/simulator" : "/learning"} 
      replace 
    />
  )
}

import { NewsProvider } from "@/context/NewsContext"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <SimulatorProvider>
          <NewsProvider>
            <Router basename={import.meta.env.BASE_URL}>
            <Layout>
              <Routes>
                {/* Public route */}
                
                {/* Protected routes */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
                <Route path="/backtest" element={<ProtectedRoute><Backtest /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                
                {/* Redirect root based on role */}
                <Route path="/" element={<RootRedirect />} />
              </Routes>
            </Layout>
            <Toaster />
          </Router>
          </NewsProvider>
        </SimulatorProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
