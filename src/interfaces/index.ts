// src/interfaces/index.ts

export interface DataRow {
  TK: string;
  Time: number | null;
  Species: string;
  Sex: string;
  Dietary_conc_ppm: number | null;
  Dose_mg_kg: number | null;
  Mean_Cmax_ng_ml: number | null;
  Reduced_bw: number | null;
  Hunched_posture: number | null;
  Vocalizations_SNO: number | null;
  Vocalization_inc: number | null;
  Activity: number | null;
  Tremors: number | null;
  Abnormal_gait: number | null;
  Abnormal_breathing: number | null;
  // Add other potential columns here if they appear in your CSV
  [key: string]: any; // Allow indexing with string for dynamic access
}

export interface Filters {
  Species?: string[];
  Sex?: string[];
  // Add other filterable columns here
}

export interface RegressionLineDataPoint {
  x: number;
  y: number;
  group: string;
}

export interface SimplifiedChartConfig {
  xAxis: keyof DataRow | "";
  yAxis: keyof DataRow | "";
}

export interface QuadraticRegressionResult {
  a: number;
  b: number;
  c: number;
  predict: (x: number) => number;
}
