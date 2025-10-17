// src/components/controls/ChartConfigControls.tsx
import React from "react";
import { DataRow, SimplifiedChartConfig } from "../../interfaces";
import { getAxisLabelText } from "../../utils/chartUtils";
import { percentageDisplayColumns } from "../../utils/constants";

interface ChartConfigControlsProps {
  chartConfig: SimplifiedChartConfig;
  onChartConfigChange: (
    configName: keyof SimplifiedChartConfig,
    value: string
  ) => void;
  numericalColumnsForAxes: (keyof DataRow)[];
  categoricalColumnsForAxes: (keyof DataRow)[];
  chartType: "scatter" | "line";
  onChartTypeChange: (type: "scatter" | "line") => void;
  differentiateBySex: boolean;
  onToggleDifferentiateBySex: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  sexDifferentiationPossible: boolean;
}

export const ChartConfigControls: React.FC<ChartConfigControlsProps> = ({
  chartConfig,
  onChartConfigChange,
  numericalColumnsForAxes,
  categoricalColumnsForAxes,
  chartType,
  onChartTypeChange,
  differentiateBySex,
  onToggleDifferentiateBySex,
  sexDifferentiationPossible,
}) => {
  return (
    <div className="controls-section chart-config">
      <h2>Configure Charts (Applied within each Time plot)</h2>
      <div className="filter-group">
        <div className="filter-item">
          <label htmlFor="chart-type">Chart Type:</label>
          <select
            id="chart-type"
            value={chartType}
            onChange={(e) =>
              onChartTypeChange(e.target.value as "scatter" | "line")
            }
          >
            <option value="scatter">Scatter Plot</option>
            <option value="line">Regression Curves</option>
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="x-axis-select">X-Axis:</label>
          <select
            id="x-axis-select"
            value={String(chartConfig.xAxis)}
            onChange={(e) => onChartConfigChange("xAxis", e.target.value)}
          >
            <option value="">Select X-Axis</option>
            {numericalColumnsForAxes.map((col) => (
              <option key={String(col)} value={String(col)}>
                {" "}
                {getAxisLabelText(col, percentageDisplayColumns)}{" "}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="y-axis-select">Y-Axis (Numerical):</label>
          <select
            id="y-axis-select"
            value={String(chartConfig.yAxis)}
            onChange={(e) => onChartConfigChange("yAxis", e.target.value)}
          >
            <option value="">Select Y-Axis</option>
            {numericalColumnsForAxes.map((col) => (
              <option key={String(col)} value={String(col)}>
                {" "}
                {getAxisLabelText(col, percentageDisplayColumns)}{" "}
              </option>
            ))}
          </select>
        </div>
        {categoricalColumnsForAxes.includes("Sex") && (
          <div className="filter-item" style={{ alignItems: "center" }}>
            <input
              type="checkbox"
              id="differentiate-by-sex-checkbox"
              checked={differentiateBySex}
              onChange={onToggleDifferentiateBySex}
              disabled={!sexDifferentiationPossible}
              style={{ marginRight: "5px" }}
            />
            <label
              htmlFor="differentiate-by-sex-checkbox"
              title={
                !sexDifferentiationPossible
                  ? "Requires multiple sex values in filtered data"
                  : ""
              }
            >
              {" "}
              Differentiate by Sex{" "}
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
