// src/components/App.tsx
import React, { useState } from "react";
import { DataRow, RegressionLineDataPoint } from "../interfaces";
import { useFileHandling } from "./hooks/useFileHandling"; // Changed from ../hooks
import { useChartData } from "./hooks/useChartData"; // Changed from ../hooks
import { useChartDomains } from "./hooks/useChartDomains"; // Changed from ../hooks

// Components
import { FileUploader } from "./components/controls/FileUploader"; // Changed from ./controls
import { FilterControls } from "./components/controls/FilterControls"; // Changed from ./controls
import { ChartConfigControls } from "./components/controls/ChartConfigControls"; // Changed from ./controls
import { ChartContainer } from "./components/charts/ChartContainer"; // Changed from ./charts
import { Modal } from "./components/layout/Modal"; // Changed from ./layout
import { RenderSingleChart } from "./components/charts/RenderSingleChart"; // Changed from ./charts
import { getAxisLabelText } from "./utils/chartUtils";
import { percentageDisplayColumns, CSV_COLUMN_MAP } from "./utils/constants";

const App: React.FC = () => {
  // --- Hooks for managing application state and logic ---
  const {
    rawData,
    columnNames,
    numericalColumnsForAxes,
    categoricalColumnsForAxes,
    chartConfig,
    setChartConfig,
    isLoading,
    error,
    handleFileUpload,
  } = useFileHandling();

  const {
    filteredData,
    filters,
    setFilters,
    differentiateBySex,
    setDifferentiateBySex,
    chartType,
    setChartType,
    regressionLinesDataByTime,
    selectedTimePoints,
    setSelectedTimePoints,
    uniqueTimePointsAll,
    sexDifferentiationPossible,
  } = useChartData({
    rawData,
    chartConfig,
    numericalColumnsForAxes,
    categoricalColumnsForAxes,
  });

  const { yAxisGlobalDomain, xAxisGlobalDomain } = useChartDomains({
    filteredData,
    chartConfig,
    numericalColumnsForAxes,
  });

  // --- Local state for expanded chart modal ---
  const [expandedChartData, setExpandedChartData] = useState<{
    timePoint: number | string;
    dataForPlot: DataRow[];
    regressionLinesForPlot?: RegressionLineDataPoint[][];
  } | null>(null);

  // --- Handlers ---
  const handleFilterChange = (filterName: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleChartConfigChange = (
    configName: keyof typeof chartConfig, // Use typeof chartConfig for stricter typing
    value: string
  ) => {
    setChartConfig((prev) => ({
      ...prev,
      [configName]: value as keyof DataRow,
    }));
  };

  const handleToggleDifferentiateBySex = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDifferentiateBySex(event.target.checked);
  };

  const handleExpandChart = (
    timePoint: number | string,
    dataForPlot: DataRow[],
    regressionLinesForPlot?: RegressionLineDataPoint[][]
  ) => {
    setExpandedChartData({ timePoint, dataForPlot, regressionLinesForPlot });
  };

  const handleTimePointSelectionChange = (timePoint: number | string) => {
    setSelectedTimePoints((prevSelected) =>
      prevSelected.includes(timePoint)
        ? prevSelected.filter((tp) => tp !== timePoint)
        : [...prevSelected, timePoint].sort(
            (a, b) => (a as number) - (b as number)
          )
    );
  };

  return (
    <div className="container">
      <h1>Dynamic Data Visualizer</h1>

      <FileUploader
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
        error={error}
      />

      {rawData.length > 0 && (
        <>
          <FilterControls
            rawData={rawData}
            filters={filters}
            onFilterChange={handleFilterChange}
            uniqueTimePointsAll={uniqueTimePointsAll}
            selectedTimePoints={selectedTimePoints}
            onTimePointSelectionChange={handleTimePointSelectionChange}
            filteredDataLength={filteredData.length}
          />

          <ChartConfigControls
            chartConfig={chartConfig}
            onChartConfigChange={handleChartConfigChange}
            numericalColumnsForAxes={numericalColumnsForAxes}
            categoricalColumnsForAxes={categoricalColumnsForAxes}
            chartType={chartType}
            onChartTypeChange={setChartType}
            differentiateBySex={differentiateBySex}
            onToggleDifferentiateBySex={handleToggleDifferentiateBySex}
            sexDifferentiationPossible={sexDifferentiationPossible}
          />

          <ChartContainer
            filteredData={filteredData}
            selectedTimePoints={selectedTimePoints}
            chartConfig={chartConfig}
            chartType={chartType}
            regressionLinesDataByTime={regressionLinesDataByTime}
            yAxisGlobalDomain={yAxisGlobalDomain}
            xAxisGlobalDomain={xAxisGlobalDomain}
            numericalColumnsForAxes={numericalColumnsForAxes}
            categoricalColumnsForAxes={categoricalColumnsForAxes}
            differentiateBySex={differentiateBySex}
            onExpandChart={handleExpandChart}
            rawDataLength={rawData.length}
          />

          <div className="table-section">
            <h2>
              {" "}
              Filtered Data (All Time Points - {filteredData.length} rows){" "}
            </h2>
            {filteredData.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {columnNames.map((colName) => (
                        <th key={colName}>{colName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr key={String(index) + (row.TK || `row-${index}`)}>
                        {columnNames.map((colName) => {
                          let dV;
                          // Map original CSV header names to internal DataRow keys for display
                          const internalKey = Object.keys(CSV_COLUMN_MAP).find(
                            (key) => CSV_COLUMN_MAP[key] === colName
                          )
                            ? CSV_COLUMN_MAP[colName]
                            : (colName as keyof DataRow); // Fallback for unmapped headers
                          dV = row[internalKey];

                          return (
                            <td key={colName}>
                              {" "}
                              {dV === null || dV === undefined
                                ? "N/A"
                                : String(dV)}{" "}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              rawData.length > 0 && (
                <p>No data matches the current filter selection.</p>
              )
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={!!expandedChartData}
        onClose={() => setExpandedChartData(null)}
        title={
          expandedChartData
            ? `Chart for Time: ${
                expandedChartData.timePoint
              } (days) - ${getAxisLabelText(
                chartConfig.yAxis,
                percentageDisplayColumns
              )} vs ${getAxisLabelText(
                chartConfig.xAxis,
                percentageDisplayColumns
              )}`
            : ""
        }
      >
        {expandedChartData && (
          <RenderSingleChart
            dataForPlot={expandedChartData.dataForPlot}
            regressionLinesForPlot={expandedChartData.regressionLinesForPlot}
            chartKeySuffix={`expanded-${expandedChartData.timePoint}`}
            currentGlobalYAxisDomain={yAxisGlobalDomain}
            currentGlobalXAxisDomain={xAxisGlobalDomain}
            height={550}
            chartConfig={chartConfig}
            chartType={chartType}
            numericalColumnsForAxes={numericalColumnsForAxes}
            categoricalColumnsForAxes={categoricalColumnsForAxes}
            differentiateBySex={differentiateBySex}
          />
        )}
      </Modal>
    </div>
  );
};

export default App;
