import { TableWithColumns } from "../../convex/types";

export const mockTables: TableWithColumns[] = [
  {
    _id: "table_users" as any,
    _creationTime: Date.now(),
    name: "users",
    projectId: "project1" as any,
    positionX: 100,
    positionY: 100,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    columns: [
      {
        _id: "col_id" as any,
        _creationTime: Date.now(),
        name: "id",
        tableId: "table_users" as any,
        dataType: "uuid",
        typeCategory: "uuid",
        isPrimaryKey: true,
        isNullable: false,
        isUnique: true,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
  },
];
