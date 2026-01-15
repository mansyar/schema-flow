import { Plus, Minus, Maximize } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { Button } from "../ui/button";

interface ToolbarProps {
  onAddTable: () => void;
}

export function Toolbar({ onAddTable }: ToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-lg border border-border bg-background/80 p-1 backdrop-blur-sm shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddTable}
        className="h-9 w-9"
        id="toolbar-add-table"
        title="Add Table"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => zoomIn()}
        className="h-9 w-9"
        title="Zoom In"
      >
        <Plus className="h-4 w-4 text-muted-foreground" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => zoomOut()}
        className="h-9 w-9"
        title="Zoom Out"
      >
        <Minus className="h-4 w-4 text-muted-foreground" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => fitView()}
        className="h-9 w-9"
        title="Fit View"
      >
        <Maximize className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
