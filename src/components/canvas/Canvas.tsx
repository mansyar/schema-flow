import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useParams } from "@tanstack/react-router";

import "@xyflow/react/dist/style.css";
import { TableNode } from "./TableNode";
import { Toolbar } from "./Toolbar";
import { useCanvasViewport } from "../../hooks/useCanvasViewport";
import { useProject } from "../../hooks/useProject";
import {
  TableWithColumns,
  Column,
  Table,
  ProjectId,
} from "../../../convex/types";
import { Id } from "../../../convex/_generated/dataModel";

const nodeTypes = {
  tableNode: TableNode,
};

// Inner component that uses React Flow hooks (must be inside ReactFlowProvider)
function CanvasInner() {
  const { projectId } = useParams({ from: "/project/$projectId" });
  const { tables, loading, mutations } = useProject(projectId);
  const { viewport, setActiveTable } = useCanvasViewport();
  const { setViewport, screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Use ref to avoid stale closures while preventing infinite loops
  const mutationsRef = useRef(mutations);
  mutationsRef.current = mutations;

  // Map Convex tables to React Flow nodes
  useEffect(() => {
    if (!tables) return;

    const newNodes: Node[] = (tables as TableWithColumns[]).map((table) => ({
      id: table._id,
      type: "tableNode",
      position: { x: table.positionX, y: table.positionY },
      data: {
        table,
        columns: table.columns,
        isSelected: false,
        onColumnAdd: () =>
          mutationsRef.current.createColumn({
            tableId: table._id,
            name: "new_column",
            dataType: "text",
            typeCategory: "text",
            isPrimaryKey: false,
            isNullable: true,
            isUnique: false,
            order: table.columns.length,
          }),
        onColumnUpdate: (columnId: string, updates: Partial<Column>) =>
          mutationsRef.current.updateColumn({
            id: columnId as Id<"columns">,
            ...updates,
          }),
        onColumnDelete: (columnId: string) =>
          mutationsRef.current.deleteColumn({ id: columnId as Id<"columns"> }),
        onTableUpdate: (updates: Partial<Table>) =>
          mutationsRef.current.updateTable({ id: table._id, ...updates }),
        onTableDelete: () =>
          mutationsRef.current.deleteTable({ id: table._id }),
      },
    }));

    setNodes(newNodes);
  }, [tables, setNodes]);

  // Initialize viewport from URL
  useEffect(() => {
    if (viewport.x !== undefined && viewport.y !== undefined) {
      setViewport(
        { x: viewport.x, y: viewport.y, zoom: viewport.zoom || 1 },
        { duration: 0 }
      );
    }
  }, [setViewport]); // Run once on mount

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setActiveTable(node.id);
    },
    [setActiveTable]
  );

  const onPaneClick = useCallback(() => {
    setActiveTable(undefined);
  }, [setActiveTable]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      mutations.updateTable({
        id: node.id as Id<"tables">,
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
      });
    },
    [mutations]
  );

  const handleAddTable = useCallback(() => {
    // Add table at center of viewport or specific offset
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    mutations.createTable({
      projectId: projectId as ProjectId,
      name: `table_${(tables?.length || 0) + 1}`,
      positionX: Math.round(center.x),
      positionY: Math.round(center.y),
    });
  }, [projectId, tables?.length, mutations, screenToFlowPosition]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse text-sm">
          Loading schema...
        </div>
      </div>
    );
  }

  return (
    <>
      {(import.meta as any).env.VITE_E2E_MOCK === "true" && (
        <div className="absolute top-4 right-4 z-50 rounded bg-red-500/20 px-2 py-1 text-[10px] font-bold text-red-500 border border-red-500/50 backdrop-blur-sm">
          E2E MOCK MODE
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <Toolbar onAddTable={handleAddTable} />
    </>
  );
}

// Outer component that provides the ReactFlowProvider context
export function Canvas() {
  return (
    <div
      data-testid="canvas-root"
      className="w-full h-full bg-background relative"
    >
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
