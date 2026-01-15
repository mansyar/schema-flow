import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

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
    .index("by_target_table", ["targetTableId"])
    .index("by_source_column", ["sourceColumnId"])
    .index("by_target_column", ["targetColumnId"]),

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
