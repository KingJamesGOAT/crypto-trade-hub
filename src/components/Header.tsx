import { Moon, Sun, User, Search, LogOut, LogIn, Menu } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useGlossary } from "./GlossaryModal"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { LoginModal } from "./LoginModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
    onMenuToggle: () => void
    onDesktopToggle?: () => void
    onMenuHover?: () => void
    onMenuLeave?: () => void
}

export function Header({ onMenuToggle, onDesktopToggle, onMenuHover, onMenuLeave }: HeaderProps) {
  const { setTheme, theme } = useTheme()
  const { openGlossary } = useGlossary()
  const { isAuthenticated, username, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <header className="border-b bg-card w-full">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onMouseEnter={onMenuHover} // Trigger sidebar peek on hover
            onMouseLeave={onMenuLeave} // Handle mouse leave
            onClick={() => {
                if (window.innerWidth >= 768) {
                   onDesktopToggle?.()
                } else {
                   onMenuToggle()
                }
            }}
        >
            <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent truncate">
          CryptoTradeHub
        </h1>
        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-2 text-muted-foreground w-64 justify-between"
            onClick={openGlossary}
          >
            <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Glossary...
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button
             variant="ghost"
             size="icon"
             className="md:hidden"
             onClick={openGlossary}
          >
             <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {isAuthenticated ? (
                  <img 
                    src={`${import.meta.env.BASE_URL}blackswan-logo.jpg`}
                    alt="Black Swan" 
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>Logged in as {username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Not logged in</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowLoginModal(true)} className="cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    Admin Login
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </header>
  )
}
