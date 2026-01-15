import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  Layout,
  Plus,
  Search,
  Table as TableIcon,
  Sparkles,
} from "lucide-react";
import { SignInButton } from "@/components/auth/SignInButton";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <Authenticated>
        <Dashboard />
      </Authenticated>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium">
          <Sparkles className="size-4" />
          <span>The next generation of database design</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-tertiary">
          Collaborative Database <br />
          <span className="text-accent-blue font-black italic">Architect</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          Design, visualize, and collaborate on your PostgreSQL schemas in
          real-time. Export clean SQL, manage undo history, and sync with your
          team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignInButton />
          <Button
            variant="outline"
            size="lg"
            className="px-8 border-border hover:bg-bg-tertiary"
          >
            View Sample Project
          </Button>
        </div>
      </div>

      <div className="mt-20 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Layout,
            title: "Visual Designer",
            desc: "Drag-and-drop table nodes and define relationships with ease.",
          },
          {
            icon: TableIcon,
            title: "SQL Generation",
            desc: "Export production-ready PostgreSQL queries in one click.",
          },
          {
            icon: Search,
            title: "Smart Search",
            desc: "Find tables and columns instantly in complex schemas.",
          },
        ].map((feat, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl bg-bg-secondary border border-border/50 hover:border-accent-blue/30 transition-all text-left group"
          >
            <div className="p-3 w-fit rounded-xl bg-bg-tertiary mb-4 group-hover:bg-accent-blue/10 transition-colors">
              <feat.icon className="size-6 text-accent-blue" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {feat.title}
            </h3>
            <p className="text-text-secondary leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Manage your database projects</p>
        </div>
        <Button className="gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white shadow-lg shadow-accent-blue/20">
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      {/* Empty State / Projects List Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-full py-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-bg-secondary/50">
          <div className="p-4 rounded-full bg-bg-tertiary mb-4">
            <Plus className="size-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            No projects yet
          </h3>
          <p className="text-text-secondary mb-6">
            Create your first schema to get started
          </p>
          <Button variant="outline" className="border-border">
            Import SQL File
          </Button>
        </div>
      </div>
    </div>
  );
}
