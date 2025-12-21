import { BarChart2, BookOpen, Home, Settings, Terminal } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

const navigation = [
  { name: "Dashboard", href: "/home", icon: Home, protected: true },
  { name: "Learning", href: "/learning", icon: BookOpen, protected: false },
  { name: "Simulator", href: "/simulator", icon: Terminal, protected: true },
  { name: "Backtesting", href: "/backtest", icon: BarChart2, protected: true },
  { name: "Settings", href: "/settings", icon: Settings, protected: true },
]

export function Sidebar() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Filter navigation based on authentication
  const visibleNavigation = navigation.filter(item => 
    !item.protected || isAuthenticated
  )

  return (
    <div className="flex w-64 flex-col border-r bg-card min-h-screen">
      <div className="flex-1 space-y-1 p-4">
        {visibleNavigation.map((item) => (
          <Button
            key={item.name}
            variant={location.pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              location.pathname === item.href && "bg-secondary"
            )}
            asChild
          >
            <Link to={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
