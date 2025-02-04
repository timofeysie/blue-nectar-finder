import { User, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: any | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

const UserMenu = ({ user, onLogin, onRegister, onLogout }: UserMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {user && <span className="text-sm">{user.email}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          <>
            <DropdownMenuItem disabled>
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={onLogin}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRegister}>
              <UserPlus className="mr-2 h-4 w-4" />
              Register
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;