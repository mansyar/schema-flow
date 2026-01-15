import { Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Layout } from "lucide-react";
import { SignInButton } from "./auth/SignInButton";
import { UserMenu } from "./auth/UserMenu";

export default function Header() {
  return (
    <header className="px-6 py-4 flex items-center justify-between bg-bg-secondary border-b border-border shadow-md">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-accent-blue/10 rounded-lg group-hover:bg-accent-blue/20 transition-colors">
            <Layout className="size-6 text-accent-blue" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-blue to-accent-purple">
            SchemaFlow
          </span>
        </Link>
        <nav className="ml-8 hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-text-secondary hover:text-text-primary transition-colors font-medium text-sm"
            activeProps={{ className: "text-accent-blue font-semibold" }}
          >
            Dashboard
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
        <Authenticated>
          <UserMenu />
        </Authenticated>
      </div>
    </header>
  );
}
