/** @vitest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import { TableNode } from "./TableNode";
import { describe, it, expect, vi } from "vitest";
import { TableNodeData } from "../../../convex/types";

// Mock React Flow components and hooks
vi.mock("@xyflow/react", () => ({
  Handle: ({ children }: any) => <div data-testid="handle">{children}</div>,
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right",
  },
}));

// Mock ColumnRow to simplify testing TableNode
vi.mock("./ColumnRow", () => ({
  ColumnRow: ({ column }: any) => (
    <div data-testid="column-row">{column.name}</div>
  ),
}));

describe("TableNode component", () => {
  const mockData: TableNodeData = {
    table: {
      _id: "table1" as any,
      _creationTime: 123,
      name: "users",
      projectId: "project1" as any,
      positionX: 100,
      positionY: 100,
      createdAt: 123,
      updatedAt: 123,
    },
    columns: [
      {
        _id: "col1" as any,
        _creationTime: 123,
        name: "id",
        tableId: "table1" as any,
        dataType: "uuid",
        typeCategory: "uuid",
        isPrimaryKey: true,
        isNullable: false,
        isUnique: true,
        order: 0,
        createdAt: 123,
        updatedAt: 123,
      },
    ],
    isSelected: false,
    onColumnAdd: vi.fn(),
    onColumnUpdate: vi.fn(),
    onColumnDelete: vi.fn(),
    onTableUpdate: vi.fn(),
    onTableDelete: vi.fn(),
  };

  const nodeProps = {
    id: "node1",
    type: "tableNode",
    selected: false,
    zIndex: 0,
    isConnectable: true,
    xPos: 100,
    yPos: 100,
    dragging: false,
    data: mockData,
  };

  it("renders table name and columns", () => {
    render(<TableNode {...(nodeProps as any)} />);
    expect(screen.getByText("users")).toBeInTheDocument();
    expect(screen.getByText("id")).toBeInTheDocument();
  });

  it("calls onTableDelete when delete button is clicked", () => {
    render(<TableNode {...(nodeProps as any)} />);
    // There are two buttons in the header: trash and more
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // Trash icon button
    expect(mockData.onTableDelete).toHaveBeenCalled();
  });

  it("enters edit mode on table name double click", () => {
    render(<TableNode {...(nodeProps as any)} />);
    const nameElement = screen.getByText("users");
    fireEvent.doubleClick(nameElement);

    const input = screen.getByDisplayValue("users");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "new_users" } });
    fireEvent.blur(input);

    expect(mockData.onTableUpdate).toHaveBeenCalledWith({ name: "new_users" });
  });

  it("calls onColumnAdd when 'Add column' button is clicked", () => {
    render(<TableNode {...(nodeProps as any)} />);
    const addButton = screen.getByText(/Add column/i);
    fireEvent.click(addButton);
    expect(mockData.onColumnAdd).toHaveBeenCalled();
  });
});
