# PRD: SchemaFlow — Collaborative Visual Database Architect

> **Version:** 1.0.0  
> **Last Updated:** 2026-01-15  
> **Status:** Draft  
> **Technical Spec:** [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)

---

## 1. Executive Summary

**SchemaFlow** is a real-time, collaborative tool for designing PostgreSQL databases visually. It bridges the gap between whiteboard-style schema design and production-ready code by generating Drizzle ORM and Prisma schema code directly from an interactive canvas.

### Value Proposition

- **For small development teams (2-5)** who need to collaboratively design database schemas
- **Unlike** traditional ERD tools that output static diagrams
- **SchemaFlow** provides live ORM code generation, real-time collaboration, and SQL import/export

---

## 2. Problem Statement

### Current Pain Points

1. **Disconnect between design and implementation:** Teams sketch schemas on whiteboards or Figma, then manually translate to code
2. **No real-time collaboration:** Most DB design tools are single-user or require complex setup
3. **ORM code is tedious:** Writing Drizzle or Prisma schemas by hand is error-prone and repetitive
4. **SQL import friction:** Existing databases can't easily be visualized for refactoring

### Solution

A web-based visual editor that:

- Lets teams design schemas together in real-time
- Generates production-ready ORM code instantly
- Imports existing SQL to bootstrap projects

---

## 3. Target Audience

### Primary Users: Small Development Teams (2-5 developers)

- Startup engineering teams
- Freelancers collaborating with clients
- Students working on group projects

### User Personas

#### Persona 1: "Alex the Tech Lead"

- **Goal:** Design initial schema architecture
- **Behavior:** Creates project, invites team, establishes core tables
- **Success:** Exports Drizzle code directly into the codebase

#### Persona 2: "Sam the Junior Developer"

- **Goal:** Understand and contribute to data model
- **Behavior:** Joins shared canvas, adds tables, asks questions via comments
- **Success:** Uses generated Prisma schema for their ORM preference

#### Persona 3: "Jordan the Reviewer"

- **Goal:** Review schema design without editing
- **Behavior:** Opens read-only share link, examines structure
- **Success:** Provides feedback via external channels (Slack, email)

---

## 4. Core Features

### 4.1 Visual Schema Designer (Canvas)

#### Interactive Canvas

- Drag-and-drop table nodes
- Pan, zoom, and mini-map navigation
- Grid snapping for alignment

#### Table Editor

Each table displays:

- Editable table name
- Column list with name, type, and constraints
- Visual indicators for Primary Key (🔑) and Foreign Key (🔗)
- Add/remove column controls

#### PostgreSQL Type Support

| Category      | Types                                                                |
| ------------- | -------------------------------------------------------------------- |
| **Numeric**   | `integer`, `bigint`, `serial`, `decimal`, `real`, `double precision` |
| **Text**      | `text`, `varchar(n)`, `char(n)`                                      |
| **Boolean**   | `boolean`                                                            |
| **Date/Time** | `timestamp`, `timestamptz`, `date`, `time`, `interval`               |
| **JSON**      | `json`, `jsonb`                                                      |
| **UUID**      | `uuid`                                                               |
| **Arrays**    | `integer[]`, `text[]`, etc.                                          |
| **Enums**     | User-defined enum types                                              |

#### Visual Relationships

- Draw edges between tables to create relationships
- Relationship types: One-to-One, One-to-Many, Many-to-Many
- Auto-generate Foreign Key columns when relationship is created
- Crow's foot notation for cardinality visualization

---

### 4.2 SQL Import (Reverse Engineering)

#### Import Flow

1. Click "Import SQL" button
2. Paste `CREATE TABLE` statements into modal
3. Parser validates and highlights errors inline
4. Successfully parsed tables appear on canvas

#### Error Handling

- **Inline highlighting:** Show which line/character failed
- **Friendly messages:** e.g., "Unknown type 'varchar2'. Did you mean 'varchar'?"
- **Partial import:** Valid tables import even if others fail

#### Supported SQL Syntax

```sql
CREATE TABLE table_name (
  column_name data_type [constraints],
  PRIMARY KEY (column),
  FOREIGN KEY (column) REFERENCES other_table(column),
  UNIQUE (column)
);

CREATE TYPE enum_name AS ENUM ('value1', 'value2');
```

---

### 4.3 Real-Time Collaboration

#### Live Sync

- Changes appear instantly for all connected users
- Optimistic updates for responsive UX
- Conflict resolution: Last-Write-Wins at field level

#### Live Cursors

- See other users' cursor positions on canvas (Figma-style)
- Cursor labels show username
- Online user avatars in header

---

### 4.4 Code Export

#### Live Code Preview

Collapsible side panel with tabs:

1. **Drizzle ORM** — TypeScript schema
2. **Prisma** — `.prisma` schema
3. **Raw SQL** — PostgreSQL DDL

#### Features

- Syntax highlighting (dark theme)
- Copy to clipboard
- Download as file (`.ts`, `.prisma`, `.sql`)

#### Example Output (Drizzle)

```typescript
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

### 4.5 Project Management

#### Project CRUD

- Create new project with name
- Rename and delete projects
- Duplicate project

#### Sharing

| Access Type      | Method           | Permissions           |
| ---------------- | ---------------- | --------------------- |
| **Collaborator** | Email invite     | Full edit access      |
| **Viewer**       | Share link (URL) | Read-only, can export |

---

### 4.6 Version History

#### Auto-Snapshots

Automatically saved when:

- Table is created or deleted
- Relationship is created or deleted
- Manual "Save Version" action

#### History Panel

- View list of snapshots with timestamps
- Preview any snapshot (read-only)
- Restore to previous version

#### Limits

- Retain last **20 snapshots** per project

---

### 4.7 Undo/Redo

#### Supported Actions

- Add/remove table
- Add/remove column
- Edit column properties
- Add/remove relationship
- Move table position

#### Keyboard Shortcuts

- `Ctrl/Cmd + Z` — Undo
- `Ctrl/Cmd + Shift + Z` — Redo

---

## 5. User Experience

### 5.1 Key User Flows

#### Flow 1: New Project from Scratch

```
1. User signs in
2. Clicks "New Project" → enters name
3. Empty canvas opens
4. User drags to create tables
5. User connects tables to create relationships
6. Code panel shows live generated code
7. User exports Drizzle schema to clipboard
```

#### Flow 2: Import Existing Database

```
1. User opens existing project (or creates new)
2. Clicks "Import SQL"
3. Pastes CREATE TABLE statements
4. Parser validates → shows errors if any
5. Valid tables appear on canvas
6. User adjusts positions and relationships
```

#### Flow 3: Team Collaboration

```
1. Owner invites team member via email
2. Team member receives invite, signs in
3. Both see each other's cursors
4. Changes sync instantly
5. Team discusses via external tool (Slack)
```

#### Flow 4: Share for Review

```
1. Owner clicks "Share"
2. Generates read-only link
3. Sends link to reviewer
4. Reviewer opens link (no sign-in required)
5. Reviewer views schema and exports code
```

### 5.2 Page Structure

| Route                        | Purpose                   |
| ---------------------------- | ------------------------- |
| `/`                          | Landing page (marketing)  |
| `/dashboard`                 | User's project list       |
| `/project/:id`               | Canvas editor             |
| `/project/:id?panel=history` | Canvas with history panel |
| `/auth/login`                | Sign in page              |

### 5.3 URL State Management

Canvas state is stored in URL search params:

```
/project/abc123?x=450&y=120&zoom=1.5&activeTable=def456&panel=drizzle
```

**Benefits:**

- Shareable links preserve exact view
- Browser back/forward navigates viewport
- Page refresh maintains state

---

## 6. Design & Aesthetics

### 6.1 Visual Style

- **Theme:** Developer-focused dark mode
- **Aesthetic:** Clean, professional, GitHub-inspired
- **Typography:** Inter for UI, JetBrains Mono for code

### 6.2 Responsive Behavior

| Breakpoint              | Behavior                           |
| ----------------------- | ---------------------------------- |
| **Desktop (≥1024px)**   | Full canvas + side panels          |
| **Tablet (768-1023px)** | Collapsible panels, touch-friendly |
| **Mobile (<768px)**     | Read-only view, code export focus  |

---

## 7. Constraints & Limits

### 7.1 Product Limits

| Limit                         | Value          |
| ----------------------------- | -------------- |
| Max tables per project        | 50             |
| Max columns per table         | 100            |
| Max collaborators per project | 5              |
| Max projects per user (free)  | 10             |
| Snapshot retention            | 20 per project |

### 7.2 Technical Constraints

- **Database dialect:** PostgreSQL only (MVP)
- **Connectivity:** Online-only (real-time sync required)
- **Browser support:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 8. Success Metrics

### 8.1 Adoption Metrics

| Metric                   | Target (Month 1) |
| ------------------------ | ---------------- |
| Projects created         | 50+              |
| Users signed up          | 100+             |
| Teams (2+ collaborators) | 10+              |

### 8.2 Engagement Metrics

| Metric                   | Target       |
| ------------------------ | ------------ |
| Avg session duration     | > 10 minutes |
| Code exports per project | 2+           |
| Return visitors (7-day)  | 30%          |

### 8.3 Quality Metrics

| Metric                     | Target  |
| -------------------------- | ------- |
| Canvas interaction latency | < 50ms  |
| Real-time sync latency     | < 200ms |
| Error rate                 | < 1%    |

---

## 9. Deployment Strategy

### 9.1 Anonymous Sandbox + Authentication

| State             | Capabilities                       |
| ----------------- | ---------------------------------- |
| **Anonymous**     | Try sandbox canvas (not saved)     |
| **Authenticated** | Save projects, collaborate, export |

### 9.2 Infrastructure

- **Frontend:** Docker container on Coolify
- **Backend:** Convex Cloud
- **Auth:** Convex-Auth

---

## 10. Development Phases

### Phase 1: Foundation (Week 1)

- Project initialization (TanStack Start)
- Styling setup (Tailwind + shadcn/ui)
- Convex database schema
- Authentication (Convex-Auth)
- Basic layout (dashboard, canvas shell)

### Phase 2: Canvas Core (Week 2)

- React Flow integration
- Table node component
- Table CRUD operations
- Column CRUD operations
- Viewport state in URL

### Phase 3: Relationships (Week 3)

- Edge drawing between tables
- Relationship type selection
- Auto FK column generation
- Visual cardinality indicators

### Phase 4: Code Generation (Week 4)

- Drizzle ORM generator
- Prisma schema generator
- Raw SQL generator
- Code preview panel

### Phase 5: SQL Import (Week 5)

- SQL parser implementation
- Error highlighting
- Import modal UI

### Phase 6: Collaboration (Week 6)

- Real-time sync
- Presence system
- Live cursors

### Phase 7: Version History (Week 7)

- Auto-snapshots
- History panel
- Restore functionality

### Phase 8: Polish & Deploy (Week 8)

- Undo/redo
- Sharing features
- Responsive design
- Docker setup
- Coolify deployment

---

## 11. Future Considerations (Post-MVP)

| Feature                   | Priority | Description                                 |
| ------------------------- | -------- | ------------------------------------------- |
| **Multi-dialect support** | High     | MySQL, SQLite                               |
| **AI schema generation**  | Medium   | "Generate a schema for an e-commerce app"   |
| **Migration diffs**       | Medium   | Compare versions, generate ALTER statements |
| **Offline mode**          | Low      | IndexedDB sync                              |
| **Team workspaces**       | Low      | Organization-level management               |
| **Schema templates**      | Low      | Pre-built starters (SaaS, blog, etc.)       |

---

## 12. Appendix

### A. Competitive Analysis

| Tool              | Strengths              | Weaknesses                         |
| ----------------- | ---------------------- | ---------------------------------- |
| **dbdiagram.io**  | Simple DSL, fast       | No real-time collab, no ORM export |
| **DrawSQL**       | Nice UI, team features | Paid, no Drizzle support           |
| **Prisma Studio** | Prisma integration     | Not for design, read-only          |
| **pgModeler**     | Full-featured          | Desktop app, steep learning curve  |

**SchemaFlow Differentiation:**

- Real-time collaboration (like Figma)
- Both Drizzle AND Prisma export
- SQL import with error feedback
- URL-shareable canvas state

### B. Glossary

| Term         | Definition                              |
| ------------ | --------------------------------------- |
| **Canvas**   | The visual workspace for schema design  |
| **Node**     | A table element on the canvas           |
| **Edge**     | A line connecting tables (relationship) |
| **Snapshot** | A saved version of the schema           |
| **Presence** | Awareness of other users' activity      |

---

_End of PRD_
