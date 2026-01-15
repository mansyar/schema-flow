import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedProject = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      ownerId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return projectId;
  },
});
