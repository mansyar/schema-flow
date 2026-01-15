import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    positionX: v.number(),
    positionY: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check project access
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Unauthorized");
    }

    const tableId = await ctx.db.insert("tables", {
      projectId: args.projectId,
      name: args.name,
      positionX: args.positionX,
      positionY: args.positionY,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return tableId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tables"),
    name: v.optional(v.string()),
    positionX: v.optional(v.number()),
    positionY: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const table = await ctx.db.get(args.id);
    if (!table) {
      throw new Error("Table not found");
    }

    // Check project access
    const project = await ctx.db.get(table.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };
    if (args.name !== undefined) updates.name = args.name;
    if (args.positionX !== undefined) updates.positionX = args.positionX;
    if (args.positionY !== undefined) updates.positionY = args.positionY;

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteTable = mutation({
  args: { id: v.id("tables") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const table = await ctx.db.get(args.id);
    if (!table) {
      throw new Error("Table not found");
    }

    // Check project access
    const project = await ctx.db.get(table.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Unauthorized");
    }

    // Cascade delete columns
    const columns = await ctx.db
      .query("columns")
      .withIndex("by_table", (q) => q.eq("tableId", args.id))
      .collect();

    for (const column of columns) {
      await ctx.db.delete(column._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      return [];
    }

    const tables = await ctx.db
      .query("tables")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const tablesWithColumns = await Promise.all(
      tables.map(async (table) => {
        const columns = await ctx.db
          .query("columns")
          .withIndex("by_table", (q) => q.eq("tableId", table._id))
          .collect();
        return {
          ...table,
          columns: columns.sort((a, b) => a.order - b.order),
        };
      })
    );

    return tablesWithColumns;
  },
});

export const getById = query({
  args: { id: v.id("tables") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const table = await ctx.db.get(args.id);
    if (!table) return null;

    const project = await ctx.db.get(table.projectId);
    if (!project || project.ownerId !== userId) {
      return null;
    }

    return table;
  },
});
