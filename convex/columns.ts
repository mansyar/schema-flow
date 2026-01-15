import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const create = mutation({
  args: {
    tableId: v.id("tables"),
    name: v.string(),
    dataType: v.string(),
    typeCategory: v.union(
      v.literal("boolean"),
      v.literal("array"),
      v.literal("numeric"),
      v.literal("text"),
      v.literal("datetime"),
      v.literal("json"),
      v.literal("uuid"),
      v.literal("enum"),
      v.literal("other")
    ),
    isPrimaryKey: v.boolean(),
    isNullable: v.boolean(),
    isUnique: v.boolean(),
    order: v.number(),
    defaultValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Table not found");

    // Check project access
    const project = await ctx.db.get(table.projectId);
    if (!project || project.ownerId !== userId) throw new Error("Unauthorized");

    const columnId = await ctx.db.insert("columns", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return columnId;
  },
});

export const update = mutation({
  args: {
    id: v.id("columns"),
    name: v.optional(v.string()),
    dataType: v.optional(v.string()),
    typeCategory: v.optional(
      v.union(
        v.literal("boolean"),
        v.literal("array"),
        v.literal("numeric"),
        v.literal("text"),
        v.literal("datetime"),
        v.literal("json"),
        v.literal("uuid"),
        v.literal("enum"),
        v.literal("other")
      )
    ),
    isPrimaryKey: v.optional(v.boolean()),
    isNullable: v.optional(v.boolean()),
    isUnique: v.optional(v.boolean()),
    order: v.optional(v.number()),
    defaultValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const column = await ctx.db.get(args.id);
    if (!column) throw new Error("Column not found");

    const table = await ctx.db.get(column.tableId);
    if (!table) throw new Error("Table not found");

    const project = await ctx.db.get(table.projectId);
    if (!project || project.ownerId !== userId) throw new Error("Unauthorized");

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteColumn = mutation({
  args: { id: v.id("columns") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const column = await ctx.db.get(args.id);
    if (!column) throw new Error("Column not found");

    const table = await ctx.db.get(column.tableId);
    if (!table) throw new Error("Table not found");

    const project = await ctx.db.get(table.projectId);
    if (!project || project.ownerId !== userId) throw new Error("Unauthorized");

    // Check for foreign key relationships (both as source and target)
    const asTarget = await ctx.db
      .query("relationships")
      .withIndex("by_target_column", (q) => q.eq("targetColumnId", args.id))
      .collect();

    if (asTarget.length > 0) {
      throw new Error("Cannot delete column that is target of a relationship");
    }

    const asSource = await ctx.db
      .query("relationships")
      .withIndex("by_source_column", (q) => q.eq("sourceColumnId", args.id))
      .collect();

    if (asSource.length > 0) {
      throw new Error("Cannot delete column that is source of a relationship");
    }

    await ctx.db.delete(args.id);
  },
});

export const listByTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const table = await ctx.db.get(args.tableId);
    if (!table) return [];

    const project = await ctx.db.get(table.projectId);
    if (!project || project.ownerId !== userId) return [];

    const columns = await ctx.db
      .query("columns")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    return columns.sort((a, b) => a.order - b.order);
  },
});

export const reorder = mutation({
  args: {
    tableId: v.id("tables"),
    columnIds: v.array(v.id("columns")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Table not found");

    const project = await ctx.db.get(table.projectId);
    if (!project || project.ownerId !== userId) throw new Error("Unauthorized");

    for (let i = 0; i < args.columnIds.length; i++) {
      await ctx.db.patch(args.columnIds[i], {
        order: i,
        updatedAt: Date.now(),
      });
    }
  },
});
