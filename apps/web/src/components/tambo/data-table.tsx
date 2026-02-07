"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTable } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type Column = {
  key?: string | null;
  label?: string | null;
  align?: "left" | "center" | "right" | string | null;
};

type CellValue = string | number | boolean | null | undefined;

type Row = {
  cells?: CellValue[];
};

type DataTableProps = {
  title?: string;
  columns?: Column[];
  rows?: Row[];
  maxRows?: number;
};

export default function DataTable({ title, columns, rows, maxRows = 10 }: DataTableProps) {
  const displayRows = rows?.slice(0, maxRows) ?? [];
  const hasMore = (rows?.length ?? 0) > maxRows;

  const getAlignment = (align?: string | null) => {
    // Handle invalid or missing align values gracefully
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left"; // Default for "left", null, undefined, or any invalid value
  };

  const formatCellValue = (value: CellValue): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") {
      // Format numbers with reasonable precision
      if (Number.isInteger(value)) return value.toLocaleString();
      return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    return String(value);
  };

  return (
    <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconTable className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title ?? "Data Table"}</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {rows?.length ?? 0} row{(rows?.length ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {columns && columns.length > 0 && displayRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {columns.map((col, index) => (
                    <th
                      key={col.key ?? index}
                      className={cn(
                        "py-2 px-3 font-medium text-muted-foreground uppercase text-xs tracking-wide",
                        getAlignment(col.align),
                      )}
                    >
                      {col.label ?? col.key ?? `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={col.key ?? colIndex}
                        className={cn("py-2 px-3", getAlignment(col.align))}
                      >
                        {formatCellValue(row.cells?.[colIndex])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMore && (
              <div className="text-center py-3 text-sm text-muted-foreground border-t border-border/30">
                Showing {maxRows} of {rows?.length} rows
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <IconTable className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
