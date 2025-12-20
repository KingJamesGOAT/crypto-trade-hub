import { BarChart2, BookOpen, Home, Settings, Terminal } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Learning", href: "/learning", icon: BookOpen },
  { name: "Simulator", href: "/simulator", icon: Terminal },
  { name: "Backtesting", href: "/backtest", icon: BarChart2 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex w-64 flex-col border-r bg-card h-[calc(100vh-4rem)]">
      <div className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
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
