// src/hooks/useFileHandling.ts
import { useState, useCallback } from "react";
import Papa from "papaparse";
import { DataRow, SimplifiedChartConfig } from "../interfaces";
import { toNumberOrNull, identifyColumnTypes } from "../utils/dataUtils";
import { CSV_COLUMN_MAP } from "../utils/constants";

interface UseFileHandlingResult {
  rawData: DataRow[];
  columnNames: string[];
  numericalColumnsForAxes: (keyof DataRow)[];
  categoricalColumnsForAxes: (keyof DataRow)[];
  chartConfig: SimplifiedChartConfig;
  setChartConfig: React.Dispatch<React.SetStateAction<SimplifiedChartConfig>>;
  isLoading: boolean;
  error: string | null;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetData: () => void;
}

export const useFileHandling = (): UseFileHandlingResult => {
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [numericalColumnsForAxes, setNumericalColumnsForAxes] = useState<
    (keyof DataRow)[]
  >([]);
  const [categoricalColumnsForAxes, setCategoricalColumnsForAxes] = useState<
    (keyof DataRow)[]
  >([]);
  const [chartConfig, setChartConfig] = useState<SimplifiedChartConfig>({
    xAxis: "",
    yAxis: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetData = useCallback(() => {
    setRawData([]);
    setColumnNames([]);
    setNumericalColumnsForAxes([]);
    setCategoricalColumnsForAxes([]);
    setChartConfig({ xAxis: "", yAxis: "" });
    setIsLoading(false);
    setError(null);
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      resetData(); // Reset everything before new upload

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(
              `Error parsing CSV: ${results.errors
                .map((e) => e.message)
                .join(", ")}`
            );
            setIsLoading(false);
            return;
          }

          const headersFromCSV = results.meta.fields;
          if (!headersFromCSV) {
            setError("Could not detect headers in CSV.");
            setIsLoading(false);
            return;
          }
          setColumnNames(headersFromCSV);

          const mappedData = results.data.map((csvRow: any) => {
            const row: Partial<DataRow> = {};
            for (const originalKey in CSV_COLUMN_MAP) {
              const internalKey = CSV_COLUMN_MAP[originalKey];
              const value = csvRow[originalKey];
              if (
                typeof value === "string" &&
                ["Species", "Sex", "TK", "Report_id", "Time_days"].includes(
                  originalKey
                )
              ) {
                (row as any)[internalKey] = value.trim();
              } else {
                (row as any)[internalKey] = toNumberOrNull(value);
              }
            }
            // Handle any other columns not explicitly mapped but present in CSV
            headersFromCSV.forEach((header) => {
              if (!Object.keys(CSV_COLUMN_MAP).includes(header)) {
                (row as any)[header as keyof DataRow] =
                  toNumberOrNull(csvRow[header]) ?? csvRow[header];
              }
            });
            return row as DataRow;
          });

          const validData = mappedData.filter(
            (r) => r.TK && r.TK.trim() !== "" && r.Time !== null
          );
          setRawData(validData);

          if (validData.length > 0) {
            const identifiedTypes = identifyColumnTypes(
              validData,
              Object.keys(validData[0]) as (keyof DataRow)[]
            );
            setNumericalColumnsForAxes(identifiedTypes.numerical);
            setCategoricalColumnsForAxes(identifiedTypes.categorical);

            const defaultX =
              identifiedTypes.numerical.find((col) => col === "Dose_mg_kg") ||
              identifiedTypes.numerical[0] ||
              "";
            const defaultY =
              identifiedTypes.numerical.find(
                (col) => col === "Mean_Cmax_ng_ml"
              ) ||
              identifiedTypes.numerical.find((col) =>
                percentageDisplayColumns.includes(col)
              ) ||
              (identifiedTypes.numerical.length > 1
                ? identifiedTypes.numerical[1]
                : "") ||
              "";

            setChartConfig({
              xAxis: defaultX as keyof DataRow,
              yAxis: defaultY as keyof DataRow,
            });
          } else {
            setNumericalColumnsForAxes([]);
            setCategoricalColumnsForAxes([]);
          }
          setIsLoading(false);
        },
        error: (err) => {
          setError(`File parsing error: ${err?.message || "Unknown error"}`);
          setIsLoading(false);
        },
      });
    },
    [resetData]
  );

  return {
    rawData,
    columnNames,
    numericalColumnsForAxes,
    categoricalColumnsForAxes,
    chartConfig,
    setChartConfig,
    isLoading,
    error,
    handleFileUpload,
    resetData,
  };
};
