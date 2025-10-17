// src/utils/constants.ts
import { DataRow } from "../interfaces";

export const percentageDisplayColumns: (keyof DataRow)[] = [
  "Reduced_bw",
  "Hunched_posture",
  "Vocalizations_SNO",
  "Vocalization_inc",
  "Activity",
  "Tremors",
  "Abnormal_gait",
  "Abnormal_breathing",
];

export const colorPalette = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#0088FE",
  "#A569BD",
  "#F1948A",
  "#48C9B0",
  "#FAD7A0",
  "#5DADE2",
  "#EB984E",
  "#D2B4DE",
];

export const lineStylePalette = [
  null,
  "5 5",
  "10 2",
  "1 5",
  "15 5 5 5",
  "5 10",
];

export const shapePalette: (
  | "circle"
  | "cross"
  | "diamond"
  | "square"
  | "star"
  | "triangle"
  | "wye"
)[] = ["circle", "cross", "diamond", "square", "star", "triangle", "wye"];

export const CHART_MARGINS = { top: 20, right: 30, left: 25, bottom: 35 };

export const CSV_COLUMN_MAP: { [original: string]: keyof DataRow } = {
  Report_id: "TK",
  Time_days: "Time",
  Species: "Species",
  Sex: "Sex",
  Dietary_conc_ppm: "Dietary_conc_ppm",
  Dose_mg_kg: "Dose_mg_kg",
  Mean_Cmax_ng_ml: "Mean_Cmax_ng_ml",
  Reduced_bw: "Reduced_bw",
  Hunched_posture: "Hunched_posture",
  Vocalizations_SNO: "Vocalizations_SNO",
  Vocalization_inc: "Vocalization_inc",
  Activity: "Activity",
  Tremors: "Tremors",
  Abnormal_gait: "Abnormal_gait",
  Abnormal_breathing: "Abnormal_breathing",
};
