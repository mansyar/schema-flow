import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "../components/canvas/Canvas";
import { z } from "zod";

const canvasSearchSchema = z.object({
  x: z.number().optional().catch(0),
  y: z.number().optional().catch(0),
  zoom: z.number().optional().catch(1),
  activeTable: z.string().optional(),
  panel: z.enum(["table", "schema", "history"]).optional(),
});

export type CanvasSearch = z.infer<typeof canvasSearchSchema>;

export const Route = createFileRoute("/project/$projectId")({
  validateSearch: (search) => canvasSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
      <Canvas />
    </div>
  );
}
