import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const { signOut } = useAuthActions();

  return (
    <Button
      variant="ghost"
      onClick={() => void signOut()}
      className="flex items-center gap-2 hover:bg-bg-tertiary"
    >
      <User className="size-4" />
      Sign Out
      <LogOut className="size-4 ml-2" />
    </Button>
  );
}
