import { Doc, Id } from "./_generated/dataModel";

// Document types
export type User = Doc<"users">;
export type Project = Doc<"projects">;
export type Collaborator = Doc<"collaborators">;
export type Table = Doc<"tables">;
export type Column = Doc<"columns">;
export type Relationship = Doc<"relationships">;
export type EnumType = Doc<"enumTypes">;
export type Snapshot = Doc<"snapshots">;
export type Presence = Doc<"presence">;

// ID types
export type UserId = Id<"users">;
export type ProjectId = Id<"projects">;
export type TableId = Id<"tables">;
export type ColumnId = Id<"columns">;
export type RelationshipId = Id<"relationships">;
export type EnumTypeId = Id<"enumTypes">;

// Composite types for API responses
export interface ProjectWithTables extends Project {
  tables: TableWithColumns[];
  relationships: Relationship[];
  enumTypes: EnumType[];
}

export interface TableWithColumns extends Table {
  columns: Column[];
}

// Canvas types (for React Flow)
export interface TableNodeData {
  table: Table;
  columns: Column[];
  isSelected: boolean;
  onColumnAdd: () => void;
  onColumnUpdate: (columnId: string, updates: Partial<Column>) => void;
  onColumnDelete: (columnId: string) => void;
  onTableUpdate: (updates: Partial<Table>) => void;
  onTableDelete: () => void;
}

export interface RelationshipEdgeData {
  relationship: Relationship;
}
