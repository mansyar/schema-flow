import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Column, TableNodeData } from "../../../convex/types";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { ColumnRow } from "./ColumnRow";
import { cn } from "../../lib/utils";

export const TableNode = memo(
  ({ data, selected }: NodeProps & { data: TableNodeData }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tableName, setTableName] = useState(data.table.name);

    const handleNameBlur = () => {
      setIsEditingName(false);
      if (tableName !== data.table.name) {
        data.onTableUpdate({ name: tableName });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleNameBlur();
      }
      if (e.key === "Escape") {
        setTableName(data.table.name);
        setIsEditingName(false);
      }
    };

    return (
      <div
        className={cn(
          "min-w-[240px] rounded-lg border-2 bg-secondary shadow-lg transition-all",
          selected
            ? "border-accent-blue ring-2 ring-accent-blue/20"
            : "border-border"
        )}
      >
        {/* Handles for connections */}
        <Handle
          type="target"
          position={Position.Top}
          className="bg-accent-blue!"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="bg-accent-blue!"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="bg-accent-blue!"
        />
        <Handle
          type="target"
          position={Position.Right}
          className="bg-accent-blue!"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-3">
          {isEditingName ? (
            <input
              autoFocus
              className="w-full bg-background px-1 py-0.5 text-sm font-semibold outline-none ring-1 ring-accent-blue"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <h3
              className="cursor-text text-sm font-semibold text-primary"
              onDoubleClick={() => setIsEditingName(true)}
            >
              {data.table.name}
            </h3>
          )}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => data.onTableDelete()}
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Columns */}
        <div className="flex flex-col py-1">
          {data.columns.map((column) => (
            <ColumnRow
              key={column._id}
              column={column}
              onUpdate={(updates: Partial<Column>) =>
                data.onColumnUpdate(column._id, updates)
              }
              onDelete={() => data.onColumnDelete(column._id)}
            />
          ))}
        </div>

        {/* Footer / Add Column */}
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-xs text-muted-foreground hover:text-primary"
            onClick={() => data.onColumnAdd()}
          >
            <Plus className="h-3.5 w-3.5" />
            Add column
          </Button>
        </div>
      </div>
    );
  }
);

TableNode.displayName = "TableNode";
