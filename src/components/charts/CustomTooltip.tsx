// src/components/charts/CustomTooltip.tsx
import React from "react";
import { DataRow } from "../../interfaces";
import { percentageDisplayColumns } from "../../utils/constants";
import {
  percentageTickFormatter,
  generalNumericTickFormatter,
  getAxisLabelText,
} from "../../utils/chartUtils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  chartType: "scatter" | "line";
  xAxisKey: keyof DataRow;
  yAxisKey: keyof DataRow;
  xAxisIsNum: boolean;
  yAxisIsNum: boolean;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  chartType,
  xAxisKey,
  yAxisKey,
  xAxisIsNum,
  yAxisIsNum,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;
  const seriesName = payload[0].name || point?.group || "Data";
  let xVal,
    yVal,
    groupValDisplay = seriesName,
    tkVal,
    doseVal,
    speciesVal,
    sexVal;

  if (chartType === "line") {
    xVal = label;
    yVal = payload[0].value;
  } else {
    xVal = point?.[xAxisKey];
    yVal = point?.[yAxisKey];
    tkVal = point?.TK;
    doseVal = point?.Dose_mg_kg;
    speciesVal = point?.Species;
    sexVal = point?.Sex;
  }

  const xAxisIsPct = percentageDisplayColumns.includes(xAxisKey);
  const yAxisIsPct = percentageDisplayColumns.includes(yAxisKey);

  const fX =
    xAxisIsPct && typeof xVal === "number"
      ? percentageTickFormatter(xVal)
      : xAxisIsNum && typeof xVal === "number"
      ? generalNumericTickFormatter(xVal)
      : String(xVal);
  const fY =
    yAxisIsPct && typeof yVal === "number"
      ? percentageTickFormatter(yVal)
      : yAxisIsNum && typeof yVal === "number"
      ? generalNumericTickFormatter(yVal)
      : String(yVal);

  return (
    <div
      className="recharts-tooltip-wrapper"
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "4px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <p
        className="tooltip-label"
        style={{
          color:
            payload[0].color || payload[0].stroke || payload[0].payload?.fill,
          fontWeight: "bold",
        }}
      >
        {String(groupValDisplay)}
      </p>
      <p className="tooltip-item">{`${getAxisLabelText(
        xAxisKey,
        percentageDisplayColumns
      )}: ${fX}`}</p>
      <p className="tooltip-item">{`${getAxisLabelText(
        yAxisKey,
        percentageDisplayColumns
      )}: ${fY}`}</p>
      {chartType !== "line" && tkVal && (
        <p className="tooltip-item">{`Report ID (TK): ${tkVal}`}</p>
      )}
      {chartType !== "line" && speciesVal && (
        <p className="tooltip-item">{`Species: ${speciesVal}`}</p>
      )}
      {chartType !== "line" && sexVal && (
        <p className="tooltip-item">{`Sex: ${sexVal}`}</p>
      )}
      {chartType !== "line" && doseVal !== null && doseVal !== undefined && (
        <p className="tooltip-item">{`Dose (mg/kg): ${doseVal}`}</p>
      )}
    </div>
  );
};
