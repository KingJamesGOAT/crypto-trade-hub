import { BarChart2, BookOpen, Home, Settings, Terminal, Newspaper } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

const navigation = [
  { name: "Dashboard", href: "/home", icon: Home, protected: true },
  { name: "Learning", href: "/learning", icon: BookOpen, protected: false },
  { name: "Simulator", href: "/simulator", icon: Terminal, protected: true },
  { name: "Backtesting", href: "/backtest", icon: BarChart2, protected: true },
  { name: "News", href: "/news", icon: Newspaper, protected: true },
  { name: "Settings", href: "/settings", icon: Settings, protected: true },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Filter navigation based on authentication
  const visibleNavigation = navigation.filter(item => 
    !item.protected || isAuthenticated
  )

  return (
    <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />
        )}

        <div className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out md:static md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
           <div className="flex h-16 items-center px-6 border-b md:hidden">
                <span className="text-lg font-bold">Menu</span>
           </div>
           
           <div className="flex-1 space-y-1 p-4 overflow-y-auto">
                {visibleNavigation.map((item) => (
                <Button
                    key={item.name}
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-secondary"
                    )}
                    asChild
                    onClick={() => {
                        // Close menu on mobile when a link is clicked
                        if (window.innerWidth < 768) onClose()
                    }}
                >
                    <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                    </Link>
                </Button>
                ))}
            </div>
        </div>
    </>
  )
}
