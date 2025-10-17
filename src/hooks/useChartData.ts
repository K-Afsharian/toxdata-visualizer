// src/hooks/useChartData.ts
import { useState, useEffect, useCallback } from "react";
import {
  DataRow,
  Filters,
  SimplifiedChartConfig,
  RegressionLineDataPoint,
} from "../interfaces";
import { getUniqueValues, applyFiltersToData } from "../utils/dataUtils";
import { calculateQuadraticRegression } from "../utils/mathUtils";
import { percentageDisplayColumns } from "../utils/constants";

interface UseChartDataProps {
  rawData: DataRow[];
  chartConfig: SimplifiedChartConfig;
  numericalColumnsForAxes: (keyof DataRow)[];
  categoricalColumnsForAxes: (keyof DataRow)[];
}

interface UseChartDataResult {
  filteredData: DataRow[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  differentiateBySex: boolean;
  setDifferentiateBySex: React.Dispatch<React.SetStateAction<boolean>>;
  chartType: "scatter" | "line";
  setChartType: React.Dispatch<React.SetStateAction<"scatter" | "line">>;
  regressionLinesDataByTime: Record<
    string | number,
    RegressionLineDataPoint[][]
  >;
  selectedTimePoints: (number | string)[];
  setSelectedTimePoints: React.Dispatch<
    React.SetStateAction<(number | string)[]>
  >;
  uniqueTimePointsAll: (number | string)[];
  sexDifferentiationPossible: boolean;
}

export const useChartData = ({
  rawData,
  chartConfig,
  numericalColumnsForAxes,
  categoricalColumnsForAxes,
}: UseChartDataProps): UseChartDataResult => {
  const [filters, setFilters] = useState<Filters>({});
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [differentiateBySex, setDifferentiateBySex] = useState<boolean>(false);
  const [chartType, setChartType] = useState<"scatter" | "line">("scatter");
  const [regressionLinesDataByTime, setRegressionLinesDataByTime] = useState<
    Record<string | number, RegressionLineDataPoint[][]>
  >({});
  const [selectedTimePoints, setSelectedTimePoints] = useState<
    (number | string)[]
  >([]);

  // Apply filters whenever rawData or filters change
  useEffect(() => {
    setFilteredData(applyFiltersToData(rawData, filters));
  }, [rawData, filters]);

  // Update selected time points when filtered data changes
  useEffect(() => {
    const allTimes = Array.from(new Set(filteredData.map((d) => d.Time)))
      .filter((t) => t !== null && t !== undefined)
      .sort((a, b) => (a as number) - (b as number)) as (number | string)[];
    setSelectedTimePoints(allTimes);
  }, [filteredData]);

  // Calculate regression lines
  useEffect(() => {
    if (chartType !== "line" || !chartConfig.xAxis || !chartConfig.yAxis) {
      setRegressionLinesDataByTime({});
      return;
    }
    const newRegDataByTime: Record<
      string | number,
      RegressionLineDataPoint[][]
    > = {};
    const xAxisKey = chartConfig.xAxis as keyof DataRow;
    const yAxisKey = chartConfig.yAxis as keyof DataRow;

    if (
      !numericalColumnsForAxes.includes(xAxisKey as any) ||
      !numericalColumnsForAxes.includes(yAxisKey as any)
    ) {
      setRegressionLinesDataByTime({});
      return;
    }

    const uniqueTimesInData = Array.from(
      new Set(filteredData.map((d) => d.Time))
    ).filter((t) => t !== null && t !== undefined) as number[];
    uniqueTimesInData.sort((a, b) => a - b);

    for (const time of uniqueTimesInData) {
      const dataForTime = filteredData.filter((d) => d.Time === time);
      if (dataForTime.length === 0) continue;

      const currentRegressionLinesForTime: RegressionLineDataPoint[][] = [];
      const uniqueSpeciesInTime = getUniqueValues("Species", dataForTime);

      const baseGroups =
        uniqueSpeciesInTime.length > 0 ? uniqueSpeciesInTime : ["Overall"];

      for (const speciesOrOverall of baseGroups) {
        const dataForSpeciesGroup =
          speciesOrOverall === "Overall"
            ? dataForTime
            : dataForTime.filter((d) => String(d.Species) === speciesOrOverall);

        if (differentiateBySex && categoricalColumnsForAxes.includes("Sex")) {
          const uniqueSexesInGroup = getUniqueValues(
            "Sex",
            dataForSpeciesGroup
          );
          if (uniqueSexesInGroup.length > 1) {
            for (const sex of uniqueSexesInGroup) {
              const dataForSexGroup = dataForSpeciesGroup.filter(
                (d) => String(d.Sex) === sex
              );
              const groupName = `${
                speciesOrOverall === "Overall" ? "" : speciesOrOverall + " - "
              }${sex}`;
              const points: { x: number; y: number }[] = [];
              let minX = Infinity,
                maxX = -Infinity;
              dataForSexGroup.forEach((row) => {
                const xVal = row[xAxisKey],
                  yVal = row[yAxisKey];
                if (
                  typeof xVal === "number" &&
                  typeof yVal === "number" &&
                  !isNaN(xVal) &&
                  !isNaN(yVal)
                ) {
                  points.push({ x: xVal, y: yVal });
                  minX = Math.min(minX, xVal);
                  maxX = Math.max(maxX, xVal);
                }
              });
              if (
                points.length >= 3 &&
                minX !== Infinity &&
                maxX !== -Infinity
              ) {
                const regression = calculateQuadraticRegression(points);
                if (regression) {
                  const linePoints: RegressionLineDataPoint[] = [];
                  const numCurvePoints =
                    minX === maxX && points.length >= 3 ? 1 : 30;
                  const step =
                    numCurvePoints > 1
                      ? (maxX - minX) / (numCurvePoints - 1)
                      : 0;
                  for (let i = 0; i < numCurvePoints; i++) {
                    const currentX =
                      numCurvePoints > 1 && maxX > minX
                        ? minX + i * step
                        : points[0]?.x ?? 0;
                    linePoints.push({
                      x: currentX,
                      y: regression.predict(currentX),
                      group: groupName,
                    });
                  }
                  if (
                    numCurvePoints > 1 &&
                    maxX > minX &&
                    linePoints.length > 0 &&
                    linePoints[linePoints.length - 1].x !== maxX
                  ) {
                    linePoints[linePoints.length - 1] = {
                      x: maxX,
                      y: regression.predict(maxX),
                      group: groupName,
                    };
                  } else if (numCurvePoints === 1 && linePoints.length > 0) {
                    linePoints[0].y = regression.predict(linePoints[0].x);
                  }
                  if (linePoints.length > 0)
                    currentRegressionLinesForTime.push(linePoints);
                }
              }
            }
          } else {
            // Not differentiating by sex OR only one sex present in the species group
            const groupName = speciesOrOverall;
            const points: { x: number; y: number }[] = [];
            let minX = Infinity,
              maxX = -Infinity;
            dataForSpeciesGroup.forEach((row) => {
              const xVal = row[xAxisKey],
                yVal = row[yAxisKey];
              if (
                typeof xVal === "number" &&
                typeof yVal === "number" &&
                !isNaN(xVal) &&
                !isNaN(yVal)
              ) {
                points.push({ x: xVal, y: yVal });
                minX = Math.min(minX, xVal);
                maxX = Math.max(maxX, xVal);
              }
            });
            if (points.length >= 3 && minX !== Infinity && maxX !== -Infinity) {
              const regression = calculateQuadraticRegression(points);
              if (regression) {
                const linePoints: RegressionLineDataPoint[] = [];
                const numCurvePoints =
                  minX === maxX && points.length >= 3 ? 1 : 30;
                const step =
                  numCurvePoints > 1 ? (maxX - minX) / (numCurvePoints - 1) : 0;
                for (let i = 0; i < numCurvePoints; i++) {
                  const currentX =
                    numCurvePoints > 1 && maxX > minX
                      ? minX + i * step
                      : points[0]?.x ?? 0;
                  linePoints.push({
                    x: currentX,
                    y: regression.predict(currentX),
                    group: groupName,
                  });
                }
                if (
                  numCurvePoints > 1 &&
                  maxX > minX &&
                  linePoints.length > 0 &&
                  linePoints[linePoints.length - 1].x !== maxX
                ) {
                  linePoints[linePoints.length - 1] = {
                    x: maxX,
                    y: regression.predict(maxX),
                    group: groupName,
                  };
                } else if (numCurvePoints === 1 && linePoints.length > 0) {
                  linePoints[0].y = regression.predict(linePoints[0].x);
                }
                if (linePoints.length > 0)
                  currentRegressionLinesForTime.push(linePoints);
              }
            }
          }
        } else {
          // No "Sex" column or not differentiating
          const groupName = speciesOrOverall;
          const points: { x: number; y: number }[] = [];
          let minX = Infinity,
            maxX = -Infinity;
          dataForSpeciesGroup.forEach((row) => {
            const xVal = row[xAxisKey],
              yVal = row[yAxisKey];
            if (
              typeof xVal === "number" &&
              typeof yVal === "number" &&
              !isNaN(xVal) &&
              !isNaN(yVal)
            ) {
              points.push({ x: xVal, y: yVal });
              minX = Math.min(minX, xVal);
              maxX = Math.max(maxX, xVal);
            }
          });
          if (points.length >= 3 && minX !== Infinity && maxX !== -Infinity) {
            const regression = calculateQuadraticRegression(points);
            if (regression) {
              const linePoints: RegressionLineDataPoint[] = [];
              const numCurvePoints =
                minX === maxX && points.length >= 3 ? 1 : 30;
              const step =
                numCurvePoints > 1 ? (maxX - minX) / (numCurvePoints - 1) : 0;
              for (let i = 0; i < numCurvePoints; i++) {
                const currentX =
                  numCurvePoints > 1 && maxX > minX
                    ? minX + i * step
                    : points[0]?.x ?? 0;
                linePoints.push({
                  x: currentX,
                  y: regression.predict(currentX),
                  group: groupName,
                });
              }
              if (
                numCurvePoints > 1 &&
                maxX > minX &&
                linePoints.length > 0 &&
                linePoints[linePoints.length - 1].x !== maxX
              ) {
                linePoints[linePoints.length - 1] = {
                  x: maxX,
                  y: regression.predict(maxX),
                  group: groupName,
                };
              } else if (numCurvePoints === 1 && linePoints.length > 0) {
                linePoints[0].y = regression.predict(linePoints[0].x);
              }
              if (linePoints.length > 0)
                currentRegressionLinesForTime.push(linePoints);
            }
          }
        }
      }
      if (currentRegressionLinesForTime.length > 0) {
        newRegDataByTime[time] = currentRegressionLinesForTime;
      }
    }
    setRegressionLinesDataByTime(newRegDataByTime);
  }, [
    filteredData,
    chartConfig.xAxis,
    chartConfig.yAxis,
    chartType,
    numericalColumnsForAxes,
    differentiateBySex,
    categoricalColumnsForAxes,
  ]);

  const uniqueTimePointsAll = Array.from(new Set(rawData.map((d) => d.Time)))
    .filter((t) => t !== null && t !== undefined)
    .sort((a, b) => (a as number) - (b as number)) as (number | string)[];

  const sexDifferentiationPossible =
    categoricalColumnsForAxes.includes("Sex") &&
    getUniqueValues("Sex", filteredData).length > 1;

  return {
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
  };
};
