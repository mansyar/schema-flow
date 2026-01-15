# Development Roadmap: SchemaFlow

> **Methodology:** Test-Driven Development (TDD)  
> **Last Updated:** 2026-01-15  
> **Related Docs:** [PRD.md](./PRD.md) | [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)

---

## TDD Workflow

For each feature, follow this cycle:

```
1. RED    → Write failing test(s) first
2. GREEN  → Write minimal code to pass
3. REFACTOR → Clean up while keeping tests green
```

### Test Stack

| Type        | Tool                  | Location              |
| ----------- | --------------------- | --------------------- |
| Unit        | Vitest                | `src/**/*.test.ts`    |
| Component   | React Testing Library | `src/**/*.test.tsx`   |
| Integration | Vitest + Convex Test  | `convex/**/*.test.ts` |
| E2E         | Playwright            | `e2e/**/*.spec.ts`    |

---

## Phase 1: Foundation ✅

**Duration:** Week 1  
**Status:** Completed (2026-01-15)  
**Goal:** Project scaffolding with all tooling configured and verified via tests.

### Tasks

| #   | Task                               | Test First                  | Status |
| --- | ---------------------------------- | --------------------------- | ------ |
| 1.1 | Initialize TanStack Start with Bun | Verify `bun run dev` starts | ✅     |
| 1.2 | Configure Tailwind CSS + shadcn/ui | Visual regression baseline  | ✅     |
| 1.3 | Set up Convex + schema             | Schema validation tests     | ✅     |
| 1.4 | Implement Convex-Auth              | Auth flow E2E test          | ✅     |
| 1.5 | Create base layout components      | Component render tests      | ✅     |
| 1.6 | Configure Vitest + Playwright      | Test runner verification    | ✅     |

### Acceptance Criteria

- [x] `bun run dev` starts dev server without errors
- [x] `bun run build` completes successfully
- [x] `bun run test` passes all tests
- [x] `bun run lint` has zero errors
- [x] Tailwind classes render correctly
- [x] shadcn/ui Button component works
- [x] Convex connects and syncs
- [x] User can sign in/out

### Test Strategy

```typescript
// tests/setup.test.ts
describe("Project Setup", () => {
  it("should have Convex client configured", () => {
    expect(convexClient).toBeDefined();
  });
});

// src/components/ui/Button.test.tsx
describe("Button", () => {
  it("renders with correct variant styles", () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-accent-blue");
  });
});

// e2e/auth.spec.ts
test("user can sign in and see dashboard", async ({ page }) => {
  await page.goto("/auth/login");
  await page.click('[data-testid="google-signin"]');
  // ... mock OAuth flow
  await expect(page).toHaveURL("/dashboard");
});
```

### Definition of Done

- All tests pass
- CI pipeline green
- No TypeScript errors
- README updated with setup instructions

---

## Phase 2: Canvas Core

**Duration:** Week 2  
**Goal:** Functional React Flow canvas with table CRUD operations.

### Tasks

| #   | Task                       | Test First                      |
| --- | -------------------------- | ------------------------------- |
| 2.1 | Integrate React Flow       | Canvas renders without errors   |
| 2.2 | Create TableNode component | Props render correctly          |
| 2.3 | Implement table mutations  | `tables.create` mutation test   |
| 2.4 | Implement column mutations | `columns.create` mutation test  |
| 2.5 | Connect canvas to Convex   | Real-time sync integration test |
| 2.6 | URL viewport state         | Search params sync test         |

### Acceptance Criteria

- [ ] Empty canvas renders with React Flow
- [ ] User can add a new table via toolbar
- [ ] Table node displays name and columns
- [ ] User can edit table name inline
- [ ] User can add/edit/delete columns
- [ ] Changes persist to Convex
- [ ] URL updates on pan/zoom
- [ ] Refresh preserves viewport position

### Test Strategy

```typescript
// convex/tables.test.ts
describe('tables mutations', () => {
  it('creates a table with valid data', async () => {
    const id = await ctx.mutation(api.tables.create, {
      projectId, name: 'users', positionX: 0, positionY: 0
    });
    expect(id).toBeDefined();
    const table = await ctx.query(api.tables.getById, { id });
    expect(table.name).toBe('users');
  });

  it('rejects table creation without auth', async () => {
    await expect(
      unauthCtx.mutation(api.tables.create, { ... })
    ).rejects.toThrow('Unauthorized');
  });
});

// src/components/canvas/TableNode.test.tsx
describe('TableNode', () => {
  it('displays table name', () => {
    render(<TableNode data={{ table: mockTable, columns: [] }} />);
    expect(screen.getByText('users')).toBeInTheDocument();
  });

  it('shows column list', () => {
    render(<TableNode data={{ table: mockTable, columns: mockColumns }} />);
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('uuid')).toBeInTheDocument();
  });

  it('calls onColumnAdd when add button clicked', async () => {
    const onAdd = vi.fn();
    render(<TableNode data={{ ..., onColumnAdd: onAdd }} />);
    await userEvent.click(screen.getByLabelText('Add column'));
    expect(onAdd).toHaveBeenCalled();
  });
});

// e2e/canvas.spec.ts
test('user can create and edit a table', async ({ page }) => {
  await page.goto('/project/test-project');
  await page.click('[data-testid="add-table-btn"]');
  await expect(page.locator('[data-testid="table-node"]')).toBeVisible();
  await page.dblclick('[data-testid="table-name"]');
  await page.fill('[data-testid="table-name-input"]', 'users');
  await page.press('[data-testid="table-name-input"]', 'Enter');
  await expect(page.locator('[data-testid="table-name"]')).toHaveText('users');
});
```

### Definition of Done

- 90%+ test coverage on table/column mutations
- Component tests for TableNode
- E2E test for table creation flow
- No console errors in browser

---

## Phase 3: Relationships

**Duration:** Week 3  
**Goal:** Visual relationship creation with auto-FK generation.

### Tasks

| #   | Task                              | Test First                      |
| --- | --------------------------------- | ------------------------------- |
| 3.1 | Create RelationshipEdge component | Edge renders between nodes      |
| 3.2 | Implement edge connection handler | Connection creates relationship |
| 3.3 | Relationship type selector        | Modal/dropdown selection test   |
| 3.4 | Auto-generate FK column           | FK column created on connect    |
| 3.5 | Crow's foot notation              | Visual indicator renders        |
| 3.6 | Delete relationship               | Edge deletion test              |

### Acceptance Criteria

- [ ] User can drag from table handle to create edge
- [ ] Connection modal prompts for relationship type
- [ ] 1:N creates FK column in source table
- [ ] N:M creates junction table automatically
- [ ] Edge displays cardinality notation
- [ ] Deleting edge removes FK column (with confirmation)

### Test Strategy

```typescript
// convex/relationships.test.ts
describe("relationships mutations", () => {
  it("creates FK column on one-to-many relationship", async () => {
    await ctx.mutation(api.relationships.create, {
      sourceTableId: postsId,
      targetTableId: usersId,
      relationType: "one-to-many",
    });
    const columns = await ctx.query(api.columns.listByTable, {
      tableId: postsId,
    });
    const fkColumn = columns.find((c) => c.name === "user_id");
    expect(fkColumn).toBeDefined();
    expect(fkColumn.dataType).toBe("uuid");
  });

  it("creates junction table for many-to-many", async () => {
    await ctx.mutation(api.relationships.create, {
      sourceTableId: postsId,
      targetTableId: tagsId,
      relationType: "many-to-many",
    });
    const tables = await ctx.query(api.tables.listByProject, { projectId });
    expect(tables.find((t) => t.name === "posts_tags")).toBeDefined();
  });
});

// src/components/canvas/RelationshipEdge.test.tsx
describe("RelationshipEdge", () => {
  it("displays crow foot for one-to-many", () => {
    render(<RelationshipEdge data={{ relationType: "one-to-many" }} />);
    expect(screen.getByTestId("crowfoot-many")).toBeInTheDocument();
  });
});
```

### Definition of Done

- All relationship types working
- Auto-FK generation tested
- Edge visual tests passing
- No orphaned FK columns on delete

---

## Phase 4: Code Generation

**Duration:** Week 4  
**Goal:** Generate valid Drizzle, Prisma, and SQL code from schema.

### Tasks

| #   | Task                      | Test First               |
| --- | ------------------------- | ------------------------ |
| 4.1 | Create Drizzle generator  | Output matches snapshot  |
| 4.2 | Create Prisma generator   | Output matches snapshot  |
| 4.3 | Create SQL generator      | Output is valid DDL      |
| 4.4 | Build CodePanel component | Tabs switch correctly    |
| 4.5 | Implement copy/download   | Clipboard/file tests     |
| 4.6 | Streaming SSR for code    | Progressive loading test |

### Acceptance Criteria

- [ ] Drizzle output is syntactically valid TypeScript
- [ ] Prisma output passes `prisma validate`
- [ ] SQL output executes in PostgreSQL
- [ ] Code updates live as schema changes
- [ ] Copy button copies to clipboard
- [ ] Download saves correct file type

### Test Strategy

```typescript
// src/lib/code-generators/drizzle.test.ts
describe("Drizzle Generator", () => {
  it("generates valid table definition", () => {
    const schema = {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", dataType: "uuid", isPrimaryKey: true },
            { name: "email", dataType: "text", isUnique: true },
          ],
        },
      ],
      relationships: [],
    };
    const code = generateDrizzle(schema);
    expect(code).toContain("export const users = pgTable('users'");
    expect(code).toContain(".primaryKey()");
    expect(code).toContain(".unique()");
  });

  it("generates relationship imports", () => {
    const schema = {
      /* with relationships */
    };
    const code = generateDrizzle(schema);
    expect(code).toContain("import { relations }");
  });

  // Snapshot test
  it("matches expected output", () => {
    expect(generateDrizzle(complexSchema)).toMatchSnapshot();
  });
});

// src/lib/code-generators/sql.test.ts
describe("SQL Generator", () => {
  it("generates valid CREATE TABLE", () => {
    const sql = generateSql(schema);
    // Actually validate SQL syntax
    expect(() => parser.parse(sql)).not.toThrow();
  });
});
```

### Definition of Done

- Snapshot tests for all generators
- SQL validated against parser
- CodePanel component fully tested
- Download creates valid files

---

## Phase 5: SQL Import

**Duration:** Week 5  
**Goal:** Parse and import valid PostgreSQL DDL with error feedback.

### Tasks

| #   | Task               | Test First                 |
| --- | ------------------ | -------------------------- |
| 5.1 | Build SQL parser   | Parse valid CREATE TABLE   |
| 5.2 | Handle constraints | PK, FK, UNIQUE extraction  |
| 5.3 | Handle enums       | CREATE TYPE parsing        |
| 5.4 | Error detection    | Invalid SQL returns errors |
| 5.5 | Import modal UI    | Modal interaction test     |
| 5.6 | Error highlighting | UI shows error location    |

### Acceptance Criteria

- [ ] Valid SQL creates tables on canvas
- [ ] Foreign keys create relationships
- [ ] Enums create enumTypes entries
- [ ] Invalid SQL shows line-specific errors
- [ ] Partial import works (valid tables only)
- [ ] User can fix errors and retry

### Test Strategy

```typescript
// src/lib/sql-parser.test.ts
describe("SQL Parser", () => {
  it("parses simple CREATE TABLE", () => {
    const result = parseSql(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL UNIQUE
      );
    `);
    expect(result.tables).toHaveLength(1);
    expect(result.tables[0].name).toBe("users");
    expect(result.tables[0].columns).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it("extracts foreign key relationships", () => {
    const result = parseSql(`
      CREATE TABLE posts (
        id UUID PRIMARY KEY,
        author_id UUID REFERENCES users(id)
      );
    `);
    expect(result.relationships).toHaveLength(1);
    expect(result.relationships[0].targetTable).toBe("users");
  });

  it("returns error with line number for invalid SQL", () => {
    const result = parseSql(`
      CREATE TABLE users (
        id INVALID_TYPE
      );
    `);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].line).toBe(3);
    expect(result.errors[0].message).toContain("Unknown type");
  });

  it("handles partial success", () => {
    const result = parseSql(`
      CREATE TABLE valid_table (id UUID);
      CREATE TABLE invalid (bad BAD_TYPE);
    `);
    expect(result.tables).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });
});
```

### Definition of Done

- Parser handles 90%+ of common DDL patterns
- Errors include line/column info
- Import modal E2E tested
- Edge cases documented

---

## Phase 6: Collaboration

**Duration:** Week 6  
**Goal:** Real-time sync and live cursors for multiple users.

### Tasks

| #   | Task                  | Test First               |
| --- | --------------------- | ------------------------ |
| 6.1 | Presence subscription | Users appear when online |
| 6.2 | Cursor position sync  | Cursor updates broadcast |
| 6.3 | Cursor component      | Renders with name label  |
| 6.4 | Active users display  | Header shows avatars     |
| 6.5 | Conflict handling     | LWW behavior test        |
| 6.6 | Connection status     | Offline indicator        |

### Acceptance Criteria

- [ ] Online users appear in header
- [ ] Live cursors move smoothly
- [ ] Cursor shows username
- [ ] Changes sync within 200ms
- [ ] Simultaneous edits don't crash
- [ ] Offline state shown to user

### Test Strategy

```typescript
// convex/presence.test.ts
describe("presence", () => {
  it("updates cursor position", async () => {
    await ctx.mutation(api.presence.update, {
      projectId,
      cursorX: 100,
      cursorY: 200,
    });
    const presence = await ctx.query(api.presence.listByProject, { projectId });
    expect(presence[0].cursorX).toBe(100);
  });

  it("marks user offline after timeout", async () => {
    // Set lastSeen to 60 seconds ago
    await ctx.mutation(api.presence.update, {
      projectId,
      cursorX: 0,
      cursorY: 0,
    });
    // Simulate time passing
    vi.advanceTimersByTime(60000);
    const online = await ctx.query(api.presence.listActiveByProject, {
      projectId,
    });
    expect(online).toHaveLength(0);
  });
});

// e2e/collaboration.spec.ts
test("two users see each other cursors", async ({ browser }) => {
  const user1 = await browser.newPage();
  const user2 = await browser.newPage();
  await user1.goto("/project/shared");
  await user2.goto("/project/shared");

  await user1.mouse.move(200, 300);
  await expect(user2.locator('[data-testid="remote-cursor"]')).toBeVisible();
});
```

### Definition of Done

- Multi-user E2E test passing
- Cursor latency < 200ms
- Graceful offline handling
- No race conditions in sync

---

## Phase 7: Version History

**Duration:** Week 7 (Days 1-3)  
**Goal:** Auto-snapshots and restore functionality.

### Tasks

| #   | Task                   | Test First               |
| --- | ---------------------- | ------------------------ |
| 7.1 | Snapshot mutation      | Creates JSON snapshot    |
| 7.2 | Auto-snapshot triggers | Snapshot on table create |
| 7.3 | History panel UI       | List renders correctly   |
| 7.4 | Snapshot preview       | Read-only view works     |
| 7.5 | Restore mutation       | State restored correctly |
| 7.6 | Retention limit        | Old snapshots pruned     |

### Acceptance Criteria

- [ ] Snapshot created on table/relationship changes
- [ ] History panel shows last 20 snapshots
- [ ] User can preview any snapshot
- [ ] Restore replaces current state
- [ ] Snapshots older than 20 are deleted

### Test Strategy

```typescript
// convex/snapshots.test.ts
describe("snapshots", () => {
  it("creates snapshot with full schema state", async () => {
    await ctx.mutation(api.snapshots.create, {
      projectId,
      description: "Test",
    });
    const snapshots = await ctx.query(api.snapshots.listByProject, {
      projectId,
    });
    const data = JSON.parse(snapshots[0].data);
    expect(data.tables).toBeDefined();
    expect(data.relationships).toBeDefined();
  });

  it("limits to 20 snapshots", async () => {
    for (let i = 0; i < 25; i++) {
      await ctx.mutation(api.snapshots.create, {
        projectId,
        description: `V${i}`,
      });
    }
    const snapshots = await ctx.query(api.snapshots.listByProject, {
      projectId,
    });
    expect(snapshots).toHaveLength(20);
  });

  it("restores schema state", async () => {
    // ... create snapshot, make changes, restore
    await ctx.mutation(api.snapshots.restore, { id: snapshotId });
    const tables = await ctx.query(api.tables.listByProject, { projectId });
    expect(tables).toHaveLength(originalCount);
  });
});
```

---

## Phase 8: Undo/Redo

**Duration:** Week 7 (Days 4-5)  
**Goal:** Per-user action history with keyboard shortcuts.

### Tasks

| #   | Task               | Test First                  |
| --- | ------------------ | --------------------------- |
| 8.1 | Action recording   | Mutations logged to history |
| 8.2 | Undo mutation      | Reverts last action         |
| 8.3 | Redo mutation      | Re-applies undone action    |
| 8.4 | Keyboard shortcuts | Ctrl+Z/Y triggers           |
| 8.5 | UI indicators      | Undo/redo buttons state     |

### Acceptance Criteria

- [ ] Table creation can be undone
- [ ] Column edit can be undone
- [ ] Redo works after undo
- [ ] Ctrl+Z/Shift+Z work
- [ ] Buttons disabled when stack empty

### Test Strategy

```typescript
// hooks/useUndoRedo.test.ts
describe("useUndoRedo", () => {
  it("undoes table creation", async () => {
    const { result } = renderHook(() => useUndoRedo(projectId));
    await act(() =>
      result.current.recordAction("table.create", {
        before: null,
        after: table,
      })
    );
    await act(() => result.current.undo());
    // Table should be deleted
  });

  it("redo after undo restores state", async () => {
    // ... undo, then redo
    expect(currentTables).toContainEqual(table);
  });
});

// e2e/undo.spec.ts
test("Ctrl+Z undoes last action", async ({ page }) => {
  await page.goto("/project/test");
  await page.click('[data-testid="add-table-btn"]');
  await expect(page.locator('[data-testid="table-node"]')).toHaveCount(1);
  await page.keyboard.press("Control+z");
  await expect(page.locator('[data-testid="table-node"]')).toHaveCount(0);
});
```

---

## Phase 9: Sharing & Permissions

**Duration:** Week 8 (Days 1-3)  
**Goal:** Email invites and public share links.

### Tasks

| #   | Task                         | Test First              |
| --- | ---------------------------- | ----------------------- |
| 9.1 | Collaborator invite mutation | Adds user to project    |
| 9.2 | Share link generation        | UUID link created       |
| 9.3 | Permission checks            | Editor vs viewer access |
| 9.4 | Share modal UI               | Modal interactions test |
| 9.5 | Invite email (optional)      | Email sent on invite    |

### Acceptance Criteria

- [ ] Owner can invite by email
- [ ] Editor can edit, viewer cannot
- [ ] Share link grants read-only access
- [ ] Share link can be revoked
- [ ] Unauthorized access blocked

### Test Strategy

```typescript
// convex/collaborators.test.ts
describe('permissions', () => {
  it('editor can create tables', async () => {
    const editorCtx = createContext({ userId: editorId });
    await expect(
      editorCtx.mutation(api.tables.create, { projectId, ... })
    ).resolves.toBeDefined();
  });

  it('viewer cannot create tables', async () => {
    const viewerCtx = createContext({ userId: viewerId });
    await expect(
      viewerCtx.mutation(api.tables.create, { projectId, ... })
    ).rejects.toThrow('Permission denied');
  });

  it('share link grants read-only', async () => {
    const anonCtx = createContext({ shareLink: 'abc-123' });
    await expect(anonCtx.query(api.projects.getByShareLink, { shareLink })).resolves.toBeDefined();
    await expect(anonCtx.mutation(api.tables.create, { ... })).rejects.toThrow();
  });
});
```

---

## Phase 10: Polish & Deploy

**Duration:** Week 8 (Days 4-5)  
**Goal:** Production-ready deployment with final polish.

### Tasks

| #    | Task                    | Test                   |
| ---- | ----------------------- | ---------------------- |
| 10.1 | Responsive design fixes | Visual regression      |
| 10.2 | Error boundary UI       | Graceful error display |
| 10.3 | Loading states          | Skeleton screens       |
| 10.4 | Performance audit       | Lighthouse score       |
| 10.5 | Docker build            | Container runs         |
| 10.6 | Coolify deployment      | Production accessible  |
| 10.7 | README & docs           | Setup guide complete   |

### Acceptance Criteria

- [ ] Mobile view is usable
- [ ] Errors show friendly messages
- [ ] Page load < 2s
- [ ] Lighthouse performance > 80
- [ ] Docker image builds < 5 min
- [ ] Production URL accessible
- [ ] README has full setup guide

### Deployment Checklist

```
[ ] Environment variables configured in Coolify
[ ] Convex production deployment created
[ ] Auth providers configured (Google, GitHub)
[ ] Docker image pushed to registry
[ ] Health check endpoint responding
[ ] SSL certificate valid
[ ] Monitoring/alerting set up
```

---

## Test Coverage Targets

| Phase            | Unit | Component | Integration | E2E        |
| ---------------- | ---- | --------- | ----------- | ---------- |
| 1 Foundation     | 80%  | 100%      | 90%         | 2 tests    |
| 2 Canvas         | 90%  | 95%       | 90%         | 3 tests    |
| 3 Relationships  | 95%  | 90%       | 95%         | 2 tests    |
| 4 Code Gen       | 100% | 90%       | N/A         | 1 test     |
| 5 SQL Import     | 95%  | 85%       | N/A         | 2 tests    |
| 6 Collaboration  | 80%  | 80%       | 95%         | 2 tests    |
| 7-8 History/Undo | 90%  | 85%       | 90%         | 2 tests    |
| 9 Sharing        | 95%  | 80%       | 95%         | 2 tests    |
| 10 Polish        | N/A  | N/A       | N/A         | Full suite |

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml (or equivalent for your CI)
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint
      - run: bun run type-check
      - run: bun run test
      - run: bun run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: ${{ github.ref == 'refs/heads/main' }}
```

---

_End of Roadmap_
