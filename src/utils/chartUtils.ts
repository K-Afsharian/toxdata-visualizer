// src/utils/chartUtils.ts
import { DataRow, SimplifiedChartConfig } from "../interfaces";
import { percentageDisplayColumns } from "./constants";

export const generalNumericTickFormatter = (value: any): string => {
  if (typeof value === "number" && !isNaN(value)) {
    if (Number.isInteger(value)) return value.toString();
    const absValue = Math.abs(value);
    if (absValue > 0 && absValue < 0.01) return value.toExponential(1);
    if (absValue > 0 && absValue < 1)
      return parseFloat(value.toPrecision(2)).toString();
    const fixed2 = value.toFixed(2);
    if (fixed2.endsWith(".00")) return String(Math.round(value));
    const fixed1 = value.toFixed(1);
    if (fixed1.endsWith(".0")) return String(Math.round(value));
    return fixed2;
  }
  return String(value);
};

export const percentageTickFormatter = (value: any) =>
  typeof value === "number" && !isNaN(value)
    ? `${(value * 100).toFixed(0)}%`
    : value;

export const getAxisLabelText = (
  key: keyof DataRow | "",
  isPctColumnList: (keyof DataRow)[]
) => {
  if (!key) return "";
  const isPct = isPctColumnList.includes(key as keyof DataRow);
  return `${String(key)}${isPct ? " (%)" : ""}`;
};

export const parseCombinedGroupName = (
  combinedName: string,
  differentiateBySex: boolean
): { primary: string; secondary?: string } => {
  const parts = combinedName.split(" - ");
  if (parts.length > 1 && differentiateBySex) {
    return {
      primary: parts.slice(0, -1).join(" - "),
      secondary: parts.slice(-1)[0],
    };
  }
  return { primary: combinedName };
};
