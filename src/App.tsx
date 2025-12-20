import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { SimulatorProvider } from "@/context/SimulatorContext"
import { Toaster } from "@/components/ui/toaster"
import { Layout } from "@/components/Layout"
import { Home } from "@/pages/Home"
import { Learning } from "@/pages/Learning"
import { Simulator } from "@/pages/Simulator"


import { Settings } from "@/pages/Settings"
import { Backtest } from "@/pages/Backtest"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SimulatorProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/backtest" element={<Backtest />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </SimulatorProvider>
    </ThemeProvider>
  )
}

export default App
