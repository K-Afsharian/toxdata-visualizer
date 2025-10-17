// src/utils/dataUtils.ts
import { DataRow, Filters } from "../interfaces";

export const toNumberOrNull = (
  value: string | number | null | undefined
): number | null => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === "" ||
    String(value).toLowerCase() === "n/a"
  )
    return null;
  const num = parseFloat(String(value));
  return isNaN(num) ? null : num;
};

export const getUniqueValues = (
  key: keyof DataRow,
  data: DataRow[]
): string[] => {
  if (!data.length || !key || (data.length > 0 && !(key in data[0]))) return [];
  return Array.from(new Set(data.map((row) => String(row[key] ?? "").trim())))
    .filter((value) => value !== "")
    .sort((a, b) => a.localeCompare(b));
};

export const applyFiltersToData = (
  data: DataRow[],
  filters: Filters
): DataRow[] => {
  let filtered = [...data];
  if (filters.Species && filters.Species.length > 0) {
    filtered = filtered.filter((row) => filters.Species!.includes(row.Species));
  }
  if (filters.Sex && filters.Sex.length > 0) {
    filtered = filtered.filter(
      (row) => row.Sex && filters.Sex!.includes(row.Sex)
    );
  }
  return filtered;
};

export const identifyColumnTypes = (
  data: DataRow[],
  dataKeys: (keyof DataRow)[]
): { numerical: (keyof DataRow)[]; categorical: (keyof DataRow)[] } => {
  if (data.length === 0) {
    return { numerical: [], categorical: [] };
  }
  const sample = data[0];
  const numCols: (keyof DataRow)[] = [];
  const catCols: (keyof DataRow)[] = [];

  dataKeys.forEach((key) => {
    if (key in sample) {
      const value = sample[key];
      if (typeof value === "number" && !isNaN(value)) {
        numCols.push(key);
      } else if (typeof value === "string") {
        if (["Species", "Sex", "TK"].includes(String(key))) {
          catCols.push(key);
        } else {
          const uniqueValues = new Set(data.map((d) => String(d[key]))).size;
          if (uniqueValues <= 15 || uniqueValues / data.length < 0.3) {
            catCols.push(key);
          }
        }
      }
    }
  });

  const filteredNumCols = numCols.filter((col) => col !== "Time");
  const filteredCatCols = catCols.filter((col) => col !== "Time");

  return { numerical: filteredNumCols, categorical: filteredCatCols };
};
