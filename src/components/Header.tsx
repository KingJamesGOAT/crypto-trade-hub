import { useState } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionClock } from "@/components/SessionClock";
import { LoginModal } from "@/components/LoginModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { username, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-4 mr-4">
          <Link
            to="/home"
            className="text-lg font-bold tracking-tight hidden md:inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 hover:opacity-80 transition-opacity"
          >
            CryptoTradeHub
          </Link>
          <div className="hidden lg:block h-6 w-px bg-white/10" />
          <SessionClock />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!isAuthenticated ? (
              <>
                <Button variant="default" onClick={() => setIsLoginOpen(true)}>
                  Login
                </Button>
                <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 rounded-md hidden sm:inline-block">
                  Admin Active
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      Logged in as {username}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500 focus:text-red-500"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
