import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Layout,
  Plus,
  Search,
  Table as TableIcon,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import { SignInButton } from "@/components/auth/SignInButton";
import { useState } from "react";

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
  const projects = useQuery(api.projects.listByOwner);
  const createProject = useMutation(api.projects.create);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      await createProject({ name: `Project ${(projects?.length || 0) + 1}` });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Manage your database projects</p>
        </div>
        <Button
          onClick={handleCreateProject}
          disabled={isCreating}
          className="gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white shadow-lg shadow-accent-blue/20"
        >
          <Plus className="size-4" />
          {isCreating ? "Creating..." : "New Project"}
        </Button>
      </div>

      {projects === undefined ? (
        <div className="text-text-secondary animate-pulse">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
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
            <Button
              onClick={handleCreateProject}
              className="bg-accent-blue hover:bg-accent-blue/90"
            >
              Create First Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project._id}
              to="/project/$projectId"
              params={{ projectId: project._id }}
              className="p-6 rounded-xl bg-bg-secondary border border-border hover:border-accent-blue/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-bg-tertiary group-hover:bg-accent-blue/10 transition-colors">
                  <FolderOpen className="size-5 text-accent-blue" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-accent-blue transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-text-tertiary">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
