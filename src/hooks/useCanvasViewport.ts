import { useCallback, useRef } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useOnViewportChange, type Viewport } from "@xyflow/react";
import { CanvasSearch } from "../routes/project.$projectId";

export function useCanvasViewport() {
  const search = useSearch({ from: "/project/$projectId" }) as CanvasSearch;
  const navigate = useNavigate();
  const isUpdatingFromUrl = useRef(false);

  // Sync React Flow viewport changes to URL
  useOnViewportChange({
    onEnd: (viewport: Viewport) => {
      if (isUpdatingFromUrl.current) {
        isUpdatingFromUrl.current = false;
        return;
      }

      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          x: Math.round(viewport.x),
          y: Math.round(viewport.y),
          zoom: parseFloat(viewport.zoom.toFixed(2)),
        }),
        replace: true,
      });
    },
  });

  const setActiveTable = useCallback(
    (tableId: string | undefined) => {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          activeTable: tableId,
        }),
        replace: true,
      });
    },
    [navigate]
  );

  const setPanel = useCallback(
    (panel: CanvasSearch["panel"]) => {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          panel,
        }),
        replace: true,
      });
    },
    [navigate]
  );

  return {
    viewport: { x: search.x, y: search.y, zoom: search.zoom },
    activeTable: search.activeTable,
    panel: search.panel,
    setActiveTable,
    setPanel,
  };
}
