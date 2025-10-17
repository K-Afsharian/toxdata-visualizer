// src/components/charts/RenderSingleChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
  Label,
} from "recharts";
import {
  DataRow,
  RegressionLineDataPoint,
  SimplifiedChartConfig,
} from "../../interfaces";
import {
  percentageDisplayColumns,
  colorPalette,
  lineStylePalette,
  shapePalette,
  CHART_MARGINS,
} from "../../utils/constants";
import { getUniqueValues } from "../../utils/dataUtils";
import {
  generalNumericTickFormatter,
  percentageTickFormatter,
  getAxisLabelText,
  parseCombinedGroupName,
} from "../../utils/chartUtils";
import { CustomTooltip } from "./CustomTooltip";

interface RenderSingleChartProps {
  dataForPlot: DataRow[];
  regressionLinesForPlot?: RegressionLineDataPoint[][];
  chartKeySuffix: string | number;
  currentGlobalYAxisDomain: [number | "auto", number | "auto"];
  currentGlobalXAxisDomain: [number | "auto", number | "auto"];
  height?: number;
  chartConfig: SimplifiedChartConfig;
  chartType: "scatter" | "line";
  numericalColumnsForAxes: (keyof DataRow)[];
  categoricalColumnsForAxes: (keyof DataRow)[];
  differentiateBySex: boolean;
}

export const RenderSingleChart: React.FC<RenderSingleChartProps> = ({
  dataForPlot,
  regressionLinesForPlot,
  chartKeySuffix,
  currentGlobalYAxisDomain,
  currentGlobalXAxisDomain,
  height = 300,
  chartConfig,
  chartType,
  numericalColumnsForAxes,
  categoricalColumnsForAxes,
  differentiateBySex,
}) => {
  if (!chartConfig.xAxis || !chartConfig.yAxis)
    return <p>Please select X and Y axis.</p>;

  const xAxisKey = chartConfig.xAxis as keyof DataRow;
  const yAxisKey = chartConfig.yAxis as keyof DataRow;
  const xAxisIsNum = numericalColumnsForAxes.includes(xAxisKey as any);
  const yAxisIsNum = numericalColumnsForAxes.includes(yAxisKey as any);
  const xAxisIsPct = xAxisIsNum && percentageDisplayColumns.includes(xAxisKey);
  const yAxisIsPct = yAxisIsNum && percentageDisplayColumns.includes(yAxisKey);

  const finalXAxisDomain = xAxisIsPct
    ? [0, 1]
    : xAxisIsNum &&
      currentGlobalXAxisDomain[0] !== "auto" &&
      currentGlobalXAxisDomain[1] !== "auto"
    ? currentGlobalXAxisDomain
    : ["auto", "auto"];

  const finalYAxisDomain = yAxisIsPct
    ? [0, 1]
    : yAxisIsNum &&
      currentGlobalYAxisDomain[0] !== "auto" &&
      currentGlobalYAxisDomain[1] !== "auto"
    ? currentGlobalYAxisDomain
    : ["auto", "auto"];

  if (chartType !== "line" && dataForPlot.length === 0)
    return <p>No data for this combination.</p>;

  if (
    chartType === "line" &&
    (!regressionLinesForPlot ||
      regressionLinesForPlot.length === 0 ||
      !regressionLinesForPlot.some((arr) => arr.length > 0))
  ) {
    let hasDataButNotEnough = false;
    const uniqueSpeciesTime = getUniqueValues("Species", dataForPlot);
    const baseGroupsTime =
      uniqueSpeciesTime.length > 0 ? uniqueSpeciesTime : ["Overall"];
    for (const speciesOrOverall of baseGroupsTime) {
      const dataForPrimary =
        speciesOrOverall === "Overall"
          ? dataForPlot
          : dataForPlot.filter((d) => String(d.Species) === speciesOrOverall);
      if (differentiateBySex && categoricalColumnsForAxes.includes("Sex")) {
        const sexesInPrimary = getUniqueValues("Sex", dataForPrimary);
        if (sexesInPrimary.length > 1) {
          for (const sex of sexesInPrimary) {
            if (
              dataForPrimary.filter((d) => String(d.Sex) === sex).length > 0 &&
              dataForPrimary.filter((d) => String(d.Sex) === sex).length < 3
            )
              hasDataButNotEnough = true;
          }
        } else if (dataForPrimary.length > 0 && dataForPrimary.length < 3)
          hasDataButNotEnough = true;
      } else if (dataForPrimary.length > 0 && dataForPrimary.length < 3)
        hasDataButNotEnough = true;
    }

    if (hasDataButNotEnough) {
      return (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Not enough data (min 3 points per group) for regression.
        </p>
      );
    }
    return (
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Regression lines could not be generated. Ensure X/Y axes are numerical
        and groups have sufficient data.
      </p>
    );
  }

  const allSpeciesInCurrentPlot = getUniqueValues("Species", dataForPlot);
  const allSexesInCurrentPlot = getUniqueValues("Sex", dataForPlot);

  const chartBody: React.ReactElement | null = (() => {
    if (chartType === "scatter") {
      return (
        <ScatterChart margin={CHART_MARGINS}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type={xAxisIsNum ? "number" : "category"}
            dataKey={xAxisKey}
            name={String(xAxisKey)}
            tickFormatter={
              xAxisIsPct
                ? percentageTickFormatter
                : xAxisIsNum
                ? generalNumericTickFormatter
                : undefined
            }
            domain={finalXAxisDomain as any}
            height={50}
            allowDuplicatedCategory={xAxisIsNum ? true : false}
          >
            <Label
              value={getAxisLabelText(xAxisKey, percentageDisplayColumns)}
              offset={5}
              position="insideBottom"
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey={yAxisKey}
            name={String(yAxisKey)}
            tickFormatter={
              yAxisIsPct ? percentageTickFormatter : generalNumericTickFormatter
            }
            domain={finalYAxisDomain as any}
            tickCount={yAxisIsPct ? 6 : 7}
            width={70}
          >
            <Label
              value={getAxisLabelText(yAxisKey, percentageDisplayColumns)}
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle" }}
              offset={-10}
            />
          </YAxis>
          <ZAxis type="number" range={[60, 60]} />
          <Tooltip
            content={
              <CustomTooltip
                chartType={chartType}
                xAxisKey={xAxisKey}
                yAxisKey={yAxisKey}
                xAxisIsNum={xAxisIsNum}
                yAxisIsNum={yAxisIsNum}
              />
            }
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: "20px" }}
          />
          {(() => {
            const scatterElements: JSX.Element[] = [];
            if (allSpeciesInCurrentPlot.length > 0) {
              allSpeciesInCurrentPlot.forEach((species, speciesIndex) => {
                const speciesData = dataForPlot.filter(
                  (d) => String(d.Species) === species
                );
                const speciesColor =
                  colorPalette[speciesIndex % colorPalette.length];
                if (differentiateBySex && allSexesInCurrentPlot.length > 1) {
                  allSexesInCurrentPlot.forEach((sex, sexIndex) => {
                    const speciesSexData = speciesData.filter(
                      (d) => String(d.Sex) === sex
                    );
                    if (speciesSexData.length > 0) {
                      scatterElements.push(
                        <Scatter
                          key={`${species}-${sex}-${chartKeySuffix}`}
                          name={`${species} - ${sex}`}
                          data={speciesSexData}
                          fill={speciesColor}
                          shape={shapePalette[sexIndex % shapePalette.length]}
                        />
                      );
                    }
                  });
                } else {
                  scatterElements.push(
                    <Scatter
                      key={`${species}-${chartKeySuffix}`}
                      name={species}
                      data={speciesData}
                      fill={speciesColor}
                      shape="circle"
                    />
                  );
                }
              });
            } else {
              // No species differentiation or no species data
              if (differentiateBySex && allSexesInCurrentPlot.length > 1) {
                allSexesInCurrentPlot.forEach((sex, sexIndex) => {
                  const sexData = dataForPlot.filter(
                    (d) => String(d.Sex) === sex
                  );
                  if (sexData.length > 0) {
                    scatterElements.push(
                      <Scatter
                        key={`Overall-${sex}-${chartKeySuffix}`}
                        name={sex}
                        data={sexData}
                        fill={colorPalette[0]}
                        shape={shapePalette[sexIndex % shapePalette.length]}
                      />
                    );
                  }
                });
              } else {
                scatterElements.push(
                  <Scatter
                    key={`Overall-Data-${chartKeySuffix}`}
                    name={"Data"}
                    data={dataForPlot}
                    fill={colorPalette[0]}
                    shape="circle"
                  />
                );
              }
            }
            return scatterElements;
          })()}
        </ScatterChart>
      );
    }

    if (
      chartType === "line" &&
      regressionLinesForPlot &&
      regressionLinesForPlot.some((arr) => arr.length > 0)
    ) {
      return (
        <LineChart margin={CHART_MARGINS}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={String(xAxisKey)}
            tickFormatter={
              xAxisIsPct ? percentageTickFormatter : generalNumericTickFormatter
            }
            domain={finalXAxisDomain as any}
            height={50}
            allowDuplicatedCategory
          >
            <Label
              value={getAxisLabelText(xAxisKey, percentageDisplayColumns)}
              offset={5}
              position="insideBottom"
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            name={String(yAxisKey)}
            tickFormatter={
              yAxisIsPct ? percentageTickFormatter : generalNumericTickFormatter
            }
            domain={finalYAxisDomain as any}
            tickCount={yAxisIsPct ? 6 : 7}
            width={70}
          >
            <Label
              value={getAxisLabelText(yAxisKey, percentageDisplayColumns)}
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle" }}
              offset={-10}
            />
          </YAxis>
          <Tooltip
            content={
              <CustomTooltip
                chartType={chartType}
                xAxisKey={xAxisKey}
                yAxisKey={yAxisKey}
                xAxisIsNum={xAxisIsNum}
                yAxisIsNum={yAxisIsNum}
              />
            }
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: "20px" }}
          />
          {regressionLinesForPlot.map((lineSegments, segIndex) => {
            if (!lineSegments || lineSegments.length === 0) return null;
            const groupName = lineSegments[0].group;
            const parsedName = parseCombinedGroupName(
              groupName,
              differentiateBySex
            );
            const primaryGroupForColor = parsedName.primary || "Overall";
            const secondaryGroupForStyle = parsedName.secondary;
            let colorIndex =
              allSpeciesInCurrentPlot.indexOf(primaryGroupForColor);
            if (
              primaryGroupForColor === "Overall" &&
              allSpeciesInCurrentPlot.length > 0 &&
              !allSpeciesInCurrentPlot.includes("Overall")
            ) {
              colorIndex = 0;
            } else if (
              colorIndex === -1 &&
              primaryGroupForColor === "Overall"
            ) {
              colorIndex = 0;
            } else if (colorIndex === -1) {
              colorIndex = segIndex % colorPalette.length; // Fallback
            }
            let styleIndex = -1;
            if (secondaryGroupForStyle && allSexesInCurrentPlot.length > 1) {
              styleIndex = allSexesInCurrentPlot.indexOf(
                secondaryGroupForStyle
              );
            }
            const color = colorPalette[colorIndex % colorPalette.length];
            const strokeDash =
              styleIndex !== -1 && differentiateBySex
                ? lineStylePalette[styleIndex % lineStylePalette.length]
                : null;
            return (
              <Line
                key={`${groupName}-${chartKeySuffix}-${segIndex}`}
                type="monotone"
                data={lineSegments}
                dataKey="y"
                name={groupName}
                stroke={color}
                strokeDasharray={strokeDash || undefined}
                dot={false}
                strokeWidth={2}
                connectNulls
              />
            );
          })}
        </LineChart>
      );
    }
    // nothing to render
    return null;
  })();

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chartBody}
    </ResponsiveContainer>
  );
};
