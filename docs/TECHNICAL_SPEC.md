# Technical Specification: SchemaFlow

> **Version:** 1.0.0  
> **Last Updated:** 2026-01-15  
> **Related Document:** [PRD.md](./PRD.md)

---

## 1. Tech Stack

| Layer                | Technology        | Purpose                                       |
| -------------------- | ----------------- | --------------------------------------------- |
| **Framework**        | TanStack Start    | Full-stack React framework with SSR/streaming |
| **Router**           | TanStack Router   | Type-safe routing with search params          |
| **Database/Backend** | Convex            | Real-time database + serverless functions     |
| **Authentication**   | Convex-Auth       | Built-in auth with Convex                     |
| **Visual Canvas**    | React Flow        | Node-based diagram editor                     |
| **Styling**          | Tailwind CSS      | Utility-first CSS                             |
| **Components**       | shadcn/ui         | Accessible, customizable UI components        |
| **Deployment**       | Docker on Coolify | Self-hosted container platform                |

---

## 2. System Architecture

### 2.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  React Flow │  │  shadcn/ui  │  │  TanStack Router    │  │
│  │  (Canvas)   │  │  (UI)       │  │  (Navigation)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
│                  ┌───────▼───────┐                          │
│                  │ Convex Client │                          │
│                  │ (Real-time)   │                          │
│                  └───────────────┘                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                      Convex Backend                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Mutations  │  │  Queries    │  │  Convex-Auth        │  │
│  │  (Write)    │  │  (Read)     │  │  (Authentication)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
│                  ┌───────▼───────┐                          │
│                  │ Convex DB     │                          │
│                  │ (Storage)     │                          │
│                  └───────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    TanStack Start Server                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Server Functions (SQL Parser, Code Generation)         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

1. **User Action** → React Flow event (drag, click, type)
2. **Optimistic Update** → Local state updates immediately
3. **Mutation** → Convex mutation sent to backend
4. **Persistence** → Convex DB stores the change
5. **Broadcast** → Convex subscription pushes to all connected clients
6. **UI Sync** → All clients render the updated state

### 2.3 Code Generation Flow

1. **Trigger** → User views code panel or requests export
2. **Query** → Fetch current schema state from Convex
3. **Server Function** → TanStack Start server function generates code
4. **Streaming** → Large schemas stream progressively to client
5. **Display** → Syntax-highlighted code rendered in panel

---

## 3. Database Schema (Convex)

### 3.1 Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   users     │───┬───│  collaborators   │───────│  projects   │
└─────────────┘   │   └──────────────────┘       └─────────────┘
                  │                                     │
                  │   ┌──────────────────┐              │
                  └───│    presence      │──────────────┤
                      └──────────────────┘              │
                                                        │
                  ┌──────────────────┐                  │
                  │    snapshots     │──────────────────┤
                  └──────────────────┘                  │
                                                        │
                  ┌──────────────────┐                  │
                  │    enumTypes     │──────────────────┤
                  └──────────────────┘                  │
                                                        │
┌─────────────┐   ┌──────────────────┐                  │
│   columns   │───│     tables       │──────────────────┤
└─────────────┘   └──────────────────┘                  │
                          │                             │
                          │   ┌──────────────────┐      │
                          └───│  relationships   │──────┘
                              └──────────────────┘
```

### 3.2 Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USERS
  // ============================================
  users: defineTable({
    // Convex-Auth managed fields
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    // Metadata
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // ============================================
  // PROJECTS
  // ============================================
  projects: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    // Share link for read-only access (UUID)
    shareLink: v.optional(v.string()),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_share_link", ["shareLink"]),

  // ============================================
  // COLLABORATORS (Project Members)
  // ============================================
  collaborators: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("editor"), v.literal("viewer")),
    invitedAt: v.number(),
    invitedBy: v.id("users"),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_user", ["projectId", "userId"]),

  // ============================================
  // TABLES (Canvas Nodes)
  // ============================================
  tables: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    // Canvas position
    positionX: v.number(),
    positionY: v.number(),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  // ============================================
  // COLUMNS (Table Fields)
  // ============================================
  columns: defineTable({
    tableId: v.id("tables"),
    name: v.string(),
    // Data type (e.g., "uuid", "text", "integer[]", "my_enum")
    dataType: v.string(),
    // Type category for UI grouping
    typeCategory: v.union(
      v.literal("numeric"),
      v.literal("text"),
      v.literal("boolean"),
      v.literal("datetime"),
      v.literal("json"),
      v.literal("uuid"),
      v.literal("array"),
      v.literal("enum"),
      v.literal("other")
    ),
    // Constraints
    isPrimaryKey: v.boolean(),
    isNullable: v.boolean(),
    isUnique: v.boolean(),
    defaultValue: v.optional(v.string()),
    // For array types, the base type
    arrayBaseType: v.optional(v.string()),
    // For enum types, reference to enumTypes
    enumTypeId: v.optional(v.id("enumTypes")),
    // Ordering within table
    order: v.number(),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_table", ["tableId"])
    .index("by_table_order", ["tableId", "order"]),

  // ============================================
  // RELATIONSHIPS (Foreign Keys / Edges)
  // ============================================
  relationships: defineTable({
    projectId: v.id("projects"),
    // Source (child) side
    sourceTableId: v.id("tables"),
    sourceColumnId: v.id("columns"),
    // Target (parent) side
    targetTableId: v.id("tables"),
    targetColumnId: v.id("columns"),
    // Relationship type
    relationType: v.union(
      v.literal("one-to-one"),
      v.literal("one-to-many"),
      v.literal("many-to-many")
    ),
    // For many-to-many, auto-generated junction table
    junctionTableId: v.optional(v.id("tables")),
    // Timestamps
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_source_table", ["sourceTableId"])
    .index("by_target_table", ["targetTableId"]),

  // ============================================
  // ENUM TYPES (Custom PostgreSQL Enums)
  // ============================================
  enumTypes: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    values: v.array(v.string()),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_name", ["projectId", "name"]),

  // ============================================
  // SNAPSHOTS (Version History)
  // ============================================
  snapshots: defineTable({
    projectId: v.id("projects"),
    // Snapshot metadata
    description: v.string(),
    // Full schema state as JSON
    data: v.string(),
    // Who created this snapshot
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_created", ["projectId", "createdAt"]),

  // ============================================
  // PRESENCE (Live Cursors)
  // ============================================
  presence: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    // Cursor position on canvas
    cursorX: v.number(),
    cursorY: v.number(),
    // Viewport (for showing what others are looking at)
    viewportX: v.optional(v.number()),
    viewportY: v.optional(v.number()),
    viewportZoom: v.optional(v.number()),
    // Last activity timestamp
    lastSeen: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user_project", ["userId", "projectId"]),

  // ============================================
  // UNDO HISTORY (Per-User Action Stack)
  // ============================================
  undoHistory: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    // Action type for undo/redo
    actionType: v.string(),
    // Before state (for undo)
    beforeState: v.string(),
    // After state (for redo)
    afterState: v.string(),
    // Position in undo stack
    position: v.number(),
    createdAt: v.number(),
  })
    .index("by_project_user", ["projectId", "userId"])
    .index("by_project_user_position", ["projectId", "userId", "position"]),
});
```

### 3.3 Type Definitions

```typescript
// convex/types.ts
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
export interface TableNode {
  id: string;
  type: "tableNode";
  position: { x: number; y: number };
  data: TableWithColumns;
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  data: Relationship;
}
```

---

## 4. API Reference

### 4.1 Mutations

#### Projects

| Function                     | Parameters         | Description                   |
| ---------------------------- | ------------------ | ----------------------------- |
| `projects.create`            | `{ name: string }` | Create new project            |
| `projects.update`            | `{ id, name }`     | Update project name           |
| `projects.delete`            | `{ id }`           | Delete project and all data   |
| `projects.generateShareLink` | `{ id }`           | Generate read-only share UUID |
| `projects.revokeShareLink`   | `{ id }`           | Remove share link             |

#### Tables

| Function           | Parameters                                  | Description              |
| ------------------ | ------------------------------------------- | ------------------------ |
| `tables.create`    | `{ projectId, name, positionX, positionY }` | Add table                |
| `tables.update`    | `{ id, name?, positionX?, positionY? }`     | Update table             |
| `tables.delete`    | `{ id }`                                    | Remove table and columns |
| `tables.duplicate` | `{ id, offsetX, offsetY }`                  | Copy table               |

#### Columns

| Function          | Parameters                         | Description     |
| ----------------- | ---------------------------------- | --------------- |
| `columns.create`  | `{ tableId, name, dataType, ... }` | Add column      |
| `columns.update`  | `{ id, name?, dataType?, ... }`    | Update column   |
| `columns.delete`  | `{ id }`                           | Remove column   |
| `columns.reorder` | `{ tableId, columnIds: string[] }` | Reorder columns |

#### Relationships

| Function               | Parameters                                                                       | Description         |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------- |
| `relationships.create` | `{ sourceTableId, sourceColumnId, targetTableId, targetColumnId, relationType }` | Create FK           |
| `relationships.update` | `{ id, relationType }`                                                           | Change type         |
| `relationships.delete` | `{ id }`                                                                         | Remove relationship |

#### Collaboration

| Function                   | Parameters                   | Description         |
| -------------------------- | ---------------------------- | ------------------- |
| `collaborators.invite`     | `{ projectId, email, role }` | Invite by email     |
| `collaborators.updateRole` | `{ id, role }`               | Change permissions  |
| `collaborators.remove`     | `{ id }`                     | Remove collaborator |

#### Presence

| Function          | Parameters                             | Description          |
| ----------------- | -------------------------------------- | -------------------- |
| `presence.update` | `{ projectId, cursorX, cursorY, ... }` | Update cursor        |
| `presence.leave`  | `{ projectId }`                        | Mark user as offline |

#### Snapshots

| Function            | Parameters                   | Description           |
| ------------------- | ---------------------------- | --------------------- |
| `snapshots.create`  | `{ projectId, description }` | Save version          |
| `snapshots.restore` | `{ id }`                     | Restore from snapshot |
| `snapshots.delete`  | `{ id }`                     | Delete snapshot       |

### 4.2 Queries

| Function                      | Parameters      | Description                     |
| ----------------------------- | --------------- | ------------------------------- |
| `projects.list`               | `{}`            | Get user's projects             |
| `projects.getById`            | `{ id }`        | Get project (with access check) |
| `projects.getByShareLink`     | `{ shareLink }` | Get via share link              |
| `tables.listByProject`        | `{ projectId }` | Get all tables                  |
| `columns.listByTable`         | `{ tableId }`   | Get columns                     |
| `relationships.listByProject` | `{ projectId }` | Get relationships               |
| `enumTypes.listByProject`     | `{ projectId }` | Get enum types                  |
| `snapshots.listByProject`     | `{ projectId }` | Get version history             |
| `presence.listByProject`      | `{ projectId }` | Get active cursors              |
| `collaborators.listByProject` | `{ projectId }` | Get team members                |

### 4.3 Server Functions (TanStack Start)

| Function          | Input                           | Output                                      |
| ----------------- | ------------------------------- | ------------------------------------------- |
| `parseSql`        | `{ sql: string }`               | `{ tables: Table[], errors: ParseError[] }` |
| `generateDrizzle` | `{ schema: ProjectWithTables }` | `{ code: string }`                          |
| `generatePrisma`  | `{ schema: ProjectWithTables }` | `{ code: string }`                          |
| `generateSql`     | `{ schema: ProjectWithTables }` | `{ code: string }`                          |

---

## 5. URL State Management

### 5.1 Search Parameters Schema

```typescript
// Route: /project/$projectId
import { z } from "zod";

export const canvasSearchSchema = z.object({
  // Viewport position
  x: z.number().optional().default(0),
  y: z.number().optional().default(0),
  zoom: z.number().min(0.1).max(3).optional().default(1),

  // Selection state
  activeTable: z.string().optional(),

  // Panel state
  panel: z.enum(["drizzle", "prisma", "sql", "history"]).optional(),
  panelOpen: z.boolean().optional().default(true),
});

export type CanvasSearch = z.infer<typeof canvasSearchSchema>;
```

### 5.2 URL Examples

```
# Default view
/project/abc123

# Zoomed in on a specific area
/project/abc123?x=450&y=120&zoom=1.5

# With table selected and Drizzle panel open
/project/abc123?x=450&y=120&zoom=1.5&activeTable=def456&panel=drizzle

# Viewing history
/project/abc123?panel=history&panelOpen=true
```

---

## 6. Component Architecture

### 6.1 Directory Structure

```
src/
├── routes/
│   ├── __root.tsx              # Root layout
│   ├── index.tsx               # Landing page
│   ├── dashboard.tsx           # Project list
│   ├── project/
│   │   └── $projectId.tsx      # Canvas editor
│   └── auth/
│       ├── login.tsx
│       └── callback.tsx
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── canvas/
│   │   ├── Canvas.tsx          # React Flow wrapper
│   │   ├── TableNode.tsx       # Custom table node
│   │   ├── ColumnRow.tsx       # Column editor row
│   │   ├── RelationshipEdge.tsx # Custom edge
│   │   └── Toolbar.tsx         # Canvas toolbar
│   ├── panels/
│   │   ├── CodePanel.tsx       # Code preview
│   │   ├── HistoryPanel.tsx    # Version history
│   │   └── PresencePanel.tsx   # Active users
│   ├── modals/
│   │   ├── ImportSqlModal.tsx
│   │   ├── ShareModal.tsx
│   │   └── ConfirmDeleteModal.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── convex.ts               # Convex client setup
│   ├── sql-parser.ts           # SQL parsing utilities
│   ├── code-generators/
│   │   ├── drizzle.ts
│   │   ├── prisma.ts
│   │   └── sql.ts
│   └── utils.ts
├── hooks/
│   ├── useProject.ts           # Project data hook
│   ├── usePresence.ts          # Presence management
│   ├── useUndoRedo.ts          # Undo/redo state
│   └── useCanvasState.ts       # Canvas viewport sync
└── styles/
    └── globals.css             # Tailwind + custom styles
```

### 6.2 Key Component Interfaces

```typescript
// TableNode.tsx
interface TableNodeProps {
  id: string;
  data: {
    table: Table;
    columns: Column[];
    isSelected: boolean;
    onColumnAdd: () => void;
    onColumnUpdate: (columnId: string, updates: Partial<Column>) => void;
    onColumnDelete: (columnId: string) => void;
    onTableUpdate: (updates: Partial<Table>) => void;
    onTableDelete: () => void;
  };
}

// CodePanel.tsx
interface CodePanelProps {
  schema: ProjectWithTables;
  activeTab: "drizzle" | "prisma" | "sql";
  onTabChange: (tab: string) => void;
  onCopy: () => void;
  onDownload: () => void;
}

// Canvas.tsx
interface CanvasProps {
  projectId: string;
  initialNodes: TableNode[];
  initialEdges: RelationshipEdge[];
  presence: Presence[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
}
```

---

## 7. Design System

### 7.1 Color Palette

```css
:root {
  /* Background */
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --bg-elevated: #30363d;

  /* Text */
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-tertiary: #6e7681;

  /* Accent Colors */
  --accent-blue: #58a6ff;
  --accent-green: #3fb950;
  --accent-purple: #a371f7;
  --accent-yellow: #d29922;
  --accent-red: #f85149;
  --accent-orange: #db6d28;
  --accent-pink: #db61a2;

  /* Syntax Highlighting */
  --syntax-keyword: #ff7b72;
  --syntax-string: #a5d6ff;
  --syntax-number: #79c0ff;
  --syntax-comment: #8b949e;
  --syntax-type: #7ee787;

  /* Borders */
  --border-default: #30363d;
  --border-muted: #21262d;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}
```

### 7.2 Typography

```css
:root {
  /* Font Families */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Font Sizes */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### 7.3 Spacing Scale

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
}
```

---

## 8. Keyboard Shortcuts

| Shortcut               | Action                 | Context             |
| ---------------------- | ---------------------- | ------------------- |
| `Ctrl/Cmd + Z`         | Undo                   | Canvas              |
| `Ctrl/Cmd + Shift + Z` | Redo                   | Canvas              |
| `Ctrl/Cmd + S`         | Save snapshot          | Canvas              |
| `Ctrl/Cmd + C`         | Copy table             | Table selected      |
| `Ctrl/Cmd + V`         | Paste table            | Canvas              |
| `Delete` / `Backspace` | Delete selected        | Table/edge selected |
| `Escape`               | Deselect / Close modal | Any                 |
| `Tab`                  | Next column            | Editing table       |
| `Shift + Tab`          | Previous column        | Editing table       |
| `Enter`                | Confirm edit           | Editing field       |
| `+` / `=`              | Zoom in                | Canvas              |
| `-`                    | Zoom out               | Canvas              |
| `0`                    | Reset zoom             | Canvas              |
| `F`                    | Fit to view            | Canvas              |

---

## 9. Performance Considerations

### 9.1 Limits & Thresholds

| Metric                   | Limit          | Rationale                         |
| ------------------------ | -------------- | --------------------------------- |
| Max tables per project   | 50             | React Flow performance degrades   |
| Max columns per table    | 100            | UI becomes unwieldy               |
| Max collaborators        | 5              | Convex subscription costs         |
| Max projects per user    | 10             | Storage costs (free tier)         |
| Snapshot retention       | 20 per project | Storage optimization              |
| Undo history depth       | 50 actions     | Memory management                 |
| Presence update interval | 100ms          | Balance responsiveness vs. writes |
| Presence timeout         | 30 seconds     | Consider user offline             |

### 9.2 Optimization Strategies

1. **Virtualization:** Only render visible table nodes on large canvases
2. **Debouncing:** Debounce position updates during drag (200ms)
3. **Batching:** Batch multiple column updates into single mutation
4. **Memoization:** Memoize code generation results
5. **Lazy Loading:** Load code panel content on-demand
6. **Compression:** Compress snapshot data before storage

---

## 10. Security

### 10.1 Authentication Flow

```
1. User clicks "Sign In"
2. Convex-Auth redirects to provider (Google, GitHub, etc.)
3. User authenticates with provider
4. Convex-Auth creates session
5. Client receives auth token
6. All subsequent requests include auth header
```

### 10.2 Authorization Rules

| Resource             | Owner | Collaborator (Editor) | Collaborator (Viewer) | Share Link | Anonymous |
| -------------------- | ----- | --------------------- | --------------------- | ---------- | --------- |
| View project         | ✅    | ✅                    | ✅                    | ✅         | ❌        |
| Edit tables          | ✅    | ✅                    | ❌                    | ❌         | ❌        |
| Delete project       | ✅    | ❌                    | ❌                    | ❌         | ❌        |
| Invite collaborators | ✅    | ❌                    | ❌                    | ❌         | ❌        |
| Export code          | ✅    | ✅                    | ✅                    | ✅         | ❌        |
| Create snapshot      | ✅    | ✅                    | ❌                    | ❌         | ❌        |

### 10.3 Rate Limiting

| Action           | Limit | Window     |
| ---------------- | ----- | ---------- |
| Mutations (all)  | 100   | Per minute |
| Project creation | 10    | Per hour   |
| Invite emails    | 20    | Per hour   |
| Code exports     | 50    | Per hour   |

---

## 11. Deployment

### 11.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### 11.2 Docker Compose (for Coolify)

```yaml
# docker-compose.yml
version: "3.8"

services:
  schemaflow:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - CONVEX_DEPLOYMENT=${CONVEX_DEPLOYMENT}
      - NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 11.3 Environment Variables

| Variable                 | Required | Description            |
| ------------------------ | -------- | ---------------------- |
| `CONVEX_DEPLOYMENT`      | Yes      | Convex deployment name |
| `NEXT_PUBLIC_CONVEX_URL` | Yes      | Convex public URL      |
| `AUTH_SECRET`            | Yes      | Secret for Convex-Auth |
| `AUTH_GITHUB_ID`         | No       | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET`     | No       | GitHub OAuth secret    |
| `AUTH_GOOGLE_ID`         | No       | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET`     | No       | Google OAuth secret    |

---

## 12. Testing Strategy

### 12.1 Test Types

| Type            | Tool                  | Coverage Target       |
| --------------- | --------------------- | --------------------- |
| Unit Tests      | Vitest                | 80% for utilities     |
| Component Tests | React Testing Library | Key components        |
| E2E Tests       | Playwright            | Critical user flows   |
| API Tests       | Convex test utilities | All mutations/queries |

### 12.2 Critical Test Cases

1. **Project CRUD:** Create, rename, delete project
2. **Table Operations:** Add, edit, delete, drag tables
3. **Column Operations:** Add, edit, reorder, delete columns
4. **Relationships:** Create 1:1, 1:N, N:M relationships
5. **SQL Import:** Parse valid SQL, handle errors gracefully
6. **Code Export:** Generate valid Drizzle, Prisma, SQL
7. **Collaboration:** Real-time sync between two clients
8. **Auth:** Sign in, sign out, permission checks
9. **Undo/Redo:** Undo table creation, redo column edit

---

## 13. Monitoring & Observability

### 13.1 Metrics to Track

| Metric         | Tool                       | Purpose             |
| -------------- | -------------------------- | ------------------- |
| Page load time | Vercel Analytics / Coolify | Performance         |
| API latency    | Convex Dashboard           | Backend performance |
| Error rate     | Sentry                     | Reliability         |
| Active users   | PostHog                    | Engagement          |
| Feature usage  | PostHog                    | Product analytics   |

### 13.2 Health Check Endpoint

```typescript
// /api/health
export async function GET() {
  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

---

_End of Technical Specification_
