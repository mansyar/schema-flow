/** @vitest-environment node */
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("tables", () => {
  test("creates a table", async () => {
    const t = convexTest(schema);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "test@example.com" });
    });
    const user = { subject: userId };

    const projectId = await t
      .withIdentity(user)
      .mutation(api.projects.create, { name: "Test Project" });

    const tableId = await t.withIdentity(user).mutation(api.tables.create, {
      projectId,
      name: "users",
      positionX: 100,
      positionY: 100,
    });

    const tables = await t
      .withIdentity(user)
      .query(api.tables.listByProject, { projectId });
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe("users");
  });

  test("updates a table", async () => {
    const t = convexTest(schema);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "test@example.com" });
    });
    const user = { subject: userId };
    const projectId = await t
      .withIdentity(user)
      .mutation(api.projects.create, { name: "Test Project" });
    const tableId = await t.withIdentity(user).mutation(api.tables.create, {
      projectId,
      name: "users",
      positionX: 100,
      positionY: 100,
    });

    await t.withIdentity(user).mutation(api.tables.update, {
      id: tableId,
      name: "user_profiles",
      positionX: 200,
    });

    const table = await t
      .withIdentity(user)
      .query(api.tables.getById, { id: tableId });
    expect(table?.name).toBe("user_profiles");
    expect(table?.positionX).toBe(200);
    expect(table?.positionY).toBe(100);
  });

  test("deletes a table", async () => {
    const t = convexTest(schema);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "test@example.com" });
    });
    const user = { subject: userId };
    const projectId = await t
      .withIdentity(user)
      .mutation(api.projects.create, { name: "Test Project" });
    const tableId = await t.withIdentity(user).mutation(api.tables.create, {
      projectId,
      name: "users",
      positionX: 100,
      positionY: 100,
    });

    await t
      .withIdentity(user)
      .mutation(api.tables.deleteTable, { id: tableId });

    const tables = await t
      .withIdentity(user)
      .query(api.tables.listByProject, { projectId });
    expect(tables).toHaveLength(0);
  });

  test("rejects unauthorized table creation", async () => {
    const t = convexTest(schema);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "owner@example.com" });
    });
    const projectId = await t
      .withIdentity({ subject: userId })
      .mutation(api.projects.create, { name: "Test Project" });

    // No identity
    await expect(
      t.mutation(api.tables.create, {
        projectId,
        name: "users",
        positionX: 0,
        positionY: 0,
      })
    ).rejects.toThrow("Unauthorized");

    // Different user
    const otherUserId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "other@example.com" });
    });
    await expect(
      t.withIdentity({ subject: otherUserId }).mutation(api.tables.create, {
        projectId,
        name: "users",
        positionX: 0,
        positionY: 0,
      })
    ).rejects.toThrow("Unauthorized");
  });
});
