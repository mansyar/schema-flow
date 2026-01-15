/** @vitest-environment node */
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("columns", () => {
  test("creates a column", async () => {
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
      positionX: 0,
      positionY: 0,
    });

    const columnId = await t.withIdentity(user).mutation(api.columns.create, {
      tableId,
      name: "id",
      dataType: "uuid",
      typeCategory: "uuid",
      isPrimaryKey: true,
      isNullable: false,
      isUnique: true,
      order: 0,
    });

    const columns = await t
      .withIdentity(user)
      .query(api.columns.listByTable, { tableId });
    expect(columns).toHaveLength(1);
    expect(columns[0].name).toBe("id");
  });

  test("updates a column", async () => {
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
      positionX: 0,
      positionY: 0,
    });
    const columnId = await t.withIdentity(user).mutation(api.columns.create, {
      tableId,
      name: "id",
      dataType: "uuid",
      typeCategory: "uuid",
      isPrimaryKey: true,
      isNullable: false,
      isUnique: true,
      order: 0,
    });

    await t.withIdentity(user).mutation(api.columns.update, {
      id: columnId,
      name: "uid",
      isNullable: true,
    });

    const column = await t.run(async (ctx) => {
      return await ctx.db.get(columnId);
    });
    expect(column?.name).toBe("uid");
    expect(column?.isNullable).toBe(true);
  });

  test("reorders columns", async () => {
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
      positionX: 0,
      positionY: 0,
    });

    const c1 = await t.withIdentity(user).mutation(api.columns.create, {
      tableId,
      name: "c1",
      dataType: "text",
      typeCategory: "text",
      isPrimaryKey: false,
      isNullable: true,
      isUnique: false,
      order: 0,
    });
    const c2 = await t.withIdentity(user).mutation(api.columns.create, {
      tableId,
      name: "c2",
      dataType: "text",
      typeCategory: "text",
      isPrimaryKey: false,
      isNullable: true,
      isUnique: false,
      order: 1,
    });

    await t.withIdentity(user).mutation(api.columns.reorder, {
      tableId,
      columnIds: [c2, c1],
    });

    const columns = await t
      .withIdentity(user)
      .query(api.columns.listByTable, { tableId });
    expect(columns[0]._id).toBe(c2);
    expect(columns[0].order).toBe(0);
    expect(columns[1]._id).toBe(c1);
    expect(columns[1].order).toBe(1);
  });

  test("rejects unauthorized column operations", async () => {
    const t = convexTest(schema);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "owner@example.com" });
    });
    const owner = { subject: userId };
    const projectId = await t
      .withIdentity(owner)
      .mutation(api.projects.create, { name: "Test Project" });
    const tableId = await t.withIdentity(owner).mutation(api.tables.create, {
      projectId,
      name: "users",
      positionX: 0,
      positionY: 0,
    });

    const otherUserId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "other@example.com" });
    });
    const otherUser = { subject: otherUserId };

    // Create column by non-owner
    await expect(
      t.withIdentity(otherUser).mutation(api.columns.create, {
        tableId,
        name: "id",
        dataType: "text",
        typeCategory: "text",
        isPrimaryKey: false,
        isNullable: true,
        isUnique: false,
        order: 0,
      })
    ).rejects.toThrow("Unauthorized");
  });
});
