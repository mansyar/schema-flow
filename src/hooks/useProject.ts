import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useCallback } from "react";
import { TableWithColumns } from "../../convex/types";

import { mockTables as initialMockTables } from "../lib/mockData";

const isE2E =
  typeof window !== "undefined" &&
  ((import.meta as any).env?.VITE_E2E_MOCK === "true" ||
    window.location.search.includes("e2e_mock=true"));

export function useProject(projectId: string) {
  // Skip the real query in E2E mode
  const realTables = useQuery(
    api.tables.listByProject,
    isE2E ? "skip" : { projectId: projectId as Id<"projects"> }
  );

  const [e2eTables, setE2ETables] =
    useState<TableWithColumns[]>(initialMockTables);

  const tables = isE2E ? e2eTables : realTables;

  const realCreateTable = useMutation(api.tables.create);
  const realUpdateTable = useMutation(api.tables.update);
  const realDeleteTable = useMutation(api.tables.deleteTable);

  const realCreateColumn = useMutation(api.columns.create);
  const realUpdateColumn = useMutation(api.columns.update);
  const realDeleteColumn = useMutation(api.columns.deleteColumn);
  const realReorderColumns = useMutation(api.columns.reorder);

  const createTable = useCallback(
    async (args: any) => {
      if (isE2E) {
        const newTable: TableWithColumns = {
          _id: `table_${Date.now()}` as any,
          _creationTime: Date.now(),
          name: args.name,
          projectId: args.projectId,
          positionX: args.positionX,
          positionY: args.positionY,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          columns: [],
        };
        setE2ETables((prev) => [...prev, newTable]);
        return newTable._id;
      }
      return realCreateTable(args);
    },
    [isE2E, realCreateTable]
  );

  const updateTable = useCallback(
    async (args: any) => {
      if (isE2E) {
        setE2ETables((prev) =>
          prev.map((t) => (t._id === args.id ? { ...t, ...args } : t))
        );
        return args.id;
      }
      return realUpdateTable(args);
    },
    [isE2E, realUpdateTable]
  );

  const deleteTable = useCallback(
    async (args: any) => {
      if (isE2E) {
        setE2ETables((prev) => prev.filter((t) => t._id !== args.id));
        return args.id;
      }
      return realDeleteTable(args);
    },
    [isE2E, realDeleteTable]
  );

  const createColumn = useCallback(
    async (args: any) => {
      if (isE2E) {
        setE2ETables((prev) =>
          prev.map((t) =>
            t._id === args.tableId
              ? {
                  ...t,
                  columns: [
                    ...t.columns,
                    {
                      _id: `col_${Date.now()}` as any,
                      _creationTime: Date.now(),
                      name: args.name,
                      tableId: args.tableId,
                      dataType: args.dataType,
                      typeCategory: args.typeCategory,
                      isPrimaryKey: args.isPrimaryKey,
                      isNullable: args.isNullable,
                      isUnique: args.isUnique,
                      order: args.order,
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    },
                  ],
                }
              : t
          )
        );
        return "mock-col-id" as any;
      }
      return realCreateColumn(args);
    },
    [isE2E, realCreateColumn]
  );

  const updateColumn = useCallback(
    async (args: any) => {
      if (isE2E) {
        setE2ETables((prev) =>
          prev.map((t) => ({
            ...t,
            columns: t.columns.map((c) =>
              c._id === args.id ? { ...c, ...args } : c
            ),
          }))
        );
        return args.id;
      }
      return realUpdateColumn(args);
    },
    [isE2E, realUpdateColumn]
  );

  const deleteColumn = useCallback(
    async (args: any) => {
      if (isE2E) {
        setE2ETables((prev) =>
          prev.map((t) => ({
            ...t,
            columns: t.columns.filter((c) => c._id !== args.id),
          }))
        );
        return args.id;
      }
      return realDeleteColumn(args);
    },
    [isE2E, realDeleteColumn]
  );

  const reorderColumns = useCallback(
    async (args: any) => {
      if (isE2E) {
        setE2ETables((prev) =>
          prev.map((t) =>
            t._id === args.tableId
              ? {
                  ...t,
                  columns: args.columnIds
                    .map((id: string, index: number) => {
                      const col = t.columns.find((c) => c._id === id);
                      return col ? { ...col, order: index } : col;
                    })
                    .filter(Boolean),
                }
              : t
          )
        );
        return args.tableId;
      }
      return realReorderColumns(args);
    },
    [isE2E, realReorderColumns]
  );

  return {
    tables,
    loading: tables === undefined,
    mutations: {
      createTable,
      updateTable,
      deleteTable,
      createColumn,
      updateColumn,
      deleteColumn,
      reorderColumns,
    },
  };
}
