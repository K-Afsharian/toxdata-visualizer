// src/components/charts/ChartContainer.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  DataRow,
  RegressionLineDataPoint,
  SimplifiedChartConfig,
} from "../../interfaces";
import { RenderSingleChart } from "./RenderSingleChart";
import { getUniqueValues } from "../../utils/dataUtils";

interface ChartContainerProps {
  filteredData: DataRow[];
  selectedTimePoints: (number | string)[];
  chartConfig: SimplifiedChartConfig;
  chartType: "scatter" | "line";
  regressionLinesDataByTime: Record<
    string | number,
    RegressionLineDataPoint[][]
  >;
  yAxisGlobalDomain: [number | "auto", number | "auto"];
  xAxisGlobalDomain: [number | "auto", number | "auto"];
  numericalColumnsForAxes: (keyof DataRow)[];
  categoricalColumnsForAxes: (keyof DataRow)[];
  differentiateBySex: boolean;
  onExpandChart: (
    timePoint: number | string,
    dataForPlot: DataRow[],
    regressionLinesForPlot?: RegressionLineDataPoint[][]
  ) => void;
  rawDataLength: number; // To check if any data is loaded at all
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  filteredData,
  selectedTimePoints,
  chartConfig,
  chartType,
  regressionLinesDataByTime,
  yAxisGlobalDomain,
  xAxisGlobalDomain,
  numericalColumnsForAxes,
  categoricalColumnsForAxes,
  differentiateBySex,
  onExpandChart,
  rawDataLength,
}) => {
  const chartsContainerRef = useRef<HTMLDivElement>(null);
  const [
    shouldDisplayOverallNoChartsMessage,
    setShouldDisplayOverallNoChartsMessage,
  ] = useState(false);

  useEffect(() => {
    if (rawDataLength > 0 && chartConfig.xAxis && chartConfig.yAxis) {
      if (filteredData.length === 0) {
        setShouldDisplayOverallNoChartsMessage(true);
        return;
      }
      if (selectedTimePoints.length === 0) {
        setShouldDisplayOverallNoChartsMessage(true);
        return;
      }

      const anyChartSuccessfullyRenders = selectedTimePoints.some(
        (timePoint) => {
          const dataForTimePoint = filteredData.filter(
            (d) => d.Time === timePoint
          );

          if (chartType === "line") {
            const regressionLinesForThisTime =
              regressionLinesDataByTime[timePoint as number];
            // Check if there are any valid regression lines for this time point
            return (
              regressionLinesForThisTime &&
              regressionLinesForThisTime.length > 0 &&
              regressionLinesForThisTime.some((arr) => arr.length > 0)
            );
          } else {
            // Scatter chart
            return dataForTimePoint.length > 0;
          }
        }
      );
      setShouldDisplayOverallNoChartsMessage(!anyChartSuccessfullyRenders);
    } else {
      setShouldDisplayOverallNoChartsMessage(false);
    }
  }, [
    rawDataLength,
    filteredData,
    selectedTimePoints,
    chartConfig,
    chartType,
    regressionLinesDataByTime,
  ]);

  return (
    <div className="chart-section">
      <h2>Visualizations by Time Point</h2>
      {selectedTimePoints.length === 0 &&
        filteredData.length > 0 &&
        rawDataLength > 0 && (
          <p>
            {" "}
            No distinct time points selected for faceting, or no time points
            match current filters.{" "}
          </p>
        )}
      {filteredData.length === 0 && rawDataLength > 0 && (
        <p>No data matches the current filter selection.</p>
      )}
      <div ref={chartsContainerRef} className="charts-container">
        {selectedTimePoints.map((timePoint) => {
          const dataForTimePoint = filteredData.filter(
            (d) => d.Time === timePoint
          );
          const regressionLinesForThisTime =
            chartType === "line"
              ? regressionLinesDataByTime[timePoint as number]
              : undefined;

          // Determine if this specific time point chart should be rendered
          let showTimePointChart = false;
          if (chartType === "scatter" && dataForTimePoint.length > 0) {
            showTimePointChart = true;
          } else if (chartType === "line") {
            // For line charts, we only need to check if regression lines were successfully generated
            // The RenderSingleChart will handle the "not enough data" message if regression fails
            if (chartConfig.xAxis && chartConfig.yAxis) {
              showTimePointChart = true;
            }
          }

          if (showTimePointChart) {
            return (
              <div key={timePoint} className="time-chart-container">
                <div className="chart-header">
                  <h4>Time: {timePoint} (days)</h4>
                  <button
                    className="expand-chart-button"
                    onClick={() =>
                      onExpandChart(
                        timePoint,
                        dataForTimePoint,
                        regressionLinesForThisTime
                      )
                    }
                    title="Expand chart"
                    disabled={!chartConfig.xAxis || !chartConfig.yAxis}
                  >
                    {" "}
                    Expand ↗{" "}
                  </button>
                </div>
                <RenderSingleChart
                  dataForPlot={dataForTimePoint}
                  regressionLinesForPlot={regressionLinesForThisTime}
                  chartKeySuffix={String(timePoint)}
                  currentGlobalYAxisDomain={yAxisGlobalDomain}
                  currentGlobalXAxisDomain={xAxisGlobalDomain}
                  height={300}
                  chartConfig={chartConfig}
                  chartType={chartType}
                  numericalColumnsForAxes={numericalColumnsForAxes}
                  categoricalColumnsForAxes={categoricalColumnsForAxes}
                  differentiateBySex={differentiateBySex}
                />
              </div>
            );
          }
          return null;
        })}
        {shouldDisplayOverallNoChartsMessage && (
          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              width: "100%",
            }}
          >
            {" "}
            No charts to display for any selected time point with the current
            settings and data. Please check axis selections and filters.{" "}
          </p>
        )}
      </div>
    </div>
  );
};
