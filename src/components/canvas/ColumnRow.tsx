import { memo, useState } from "react";
import { Column } from "../../../convex/types";
import { Key, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface ColumnRowProps {
  column: Column;
  onUpdate: (updates: Partial<Column>) => void;
  onDelete: () => void;
}

export const ColumnRow = memo(
  ({ column, onUpdate, onDelete }: ColumnRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(column.name);

    const handleBlur = () => {
      setIsEditing(false);
      if (name !== column.name) {
        onUpdate({ name });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleBlur();
      if (e.key === "Escape") {
        setName(column.name);
        setIsEditing(false);
      }
    };

    return (
      <div
        data-testid="column-row"
        className="group flex items-center justify-between px-3 py-1.5 hover:bg-bg-tertiary"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {column.isPrimaryKey && (
            <Key className="h-3 w-3 text-accent-yellow shrink-0" />
          )}
          {/* We'll add FK icon logic in Phase 3 */}

          {isEditing ? (
            <input
              autoFocus
              className="min-w-0 bg-background px-1 text-xs outline-none ring-1 ring-accent-blue"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <span
              className="truncate text-xs text-primary cursor-text"
              onDoubleClick={() => setIsEditing(true)}
            >
              {column.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase text-muted-foreground">
            {column.dataType}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete()}
          >
            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </div>
    );
  }
);

ColumnRow.displayName = "ColumnRow";
