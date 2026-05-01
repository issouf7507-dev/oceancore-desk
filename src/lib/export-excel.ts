import * as XLSX from "xlsx";

export interface ExportColumn<T> {
  header: string;
  key: keyof T;
  format?: (val: any) => string | number;
}

export function exportToExcel<T extends object>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName = "Données",
) {
  const rows = data.map((row) =>
    Object.fromEntries(
      columns.map(({ header, key, format }) => [
        header,
        format ? format(row[key]) : row[key],
      ]),
    ),
  );

  const ws = XLSX.utils.json_to_sheet(rows);

  // Largeur auto des colonnes
  const colWidths = columns.map(({ header }) => ({
    wch: Math.max(header.length + 4, 16),
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
