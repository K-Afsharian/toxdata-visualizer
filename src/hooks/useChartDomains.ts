// src/hooks/useChartDomains.ts
import { useState, useEffect } from "react";
import { DataRow, SimplifiedChartConfig } from "../interfaces";
import { percentageDisplayColumns } from "../utils/constants";

interface UseChartDomainsProps {
  filteredData: DataRow[];
  chartConfig: SimplifiedChartConfig;
  numericalColumnsForAxes: (keyof DataRow)[];
}

interface UseChartDomainsResult {
  yAxisGlobalDomain: [number | "auto", number | "auto"];
  xAxisGlobalDomain: [number | "auto", number | "auto"];
}

export const useChartDomains = ({
  filteredData,
  chartConfig,
  numericalColumnsForAxes,
}: UseChartDomainsProps): UseChartDomainsResult => {
  const [yAxisGlobalDomain, setYAxisGlobalDomain] = useState<
    [number | "auto", number | "auto"]
  >(["auto", "auto"]);
  const [xAxisGlobalDomain, setXAxisGlobalDomain] = useState<
    [number | "auto", number | "auto"]
  >(["auto", "auto"]);

  useEffect(() => {
    if (
      !filteredData.length ||
      !chartConfig.xAxis ||
      !numericalColumnsForAxes.includes(chartConfig.xAxis as any)
    ) {
      setXAxisGlobalDomain(["auto", "auto"]);
      return;
    }
    const xAxisKey = chartConfig.xAxis as keyof DataRow;
    const isPct = percentageDisplayColumns.includes(xAxisKey);

    if (isPct) {
      setXAxisGlobalDomain([0, 1]);
      return;
    }

    let minX: number = Infinity,
      maxX: number = -Infinity,
      foundNumericX = false;

    filteredData.forEach((row) => {
      const val = row[xAxisKey];
      if (typeof val === "number" && !isNaN(val)) {
        minX = Math.min(minX, val);
        maxX = Math.max(maxX, val);
        foundNumericX = true;
      }
    });

    if (foundNumericX && minX !== Infinity && maxX !== -Infinity) {
      let domainStart = minX,
        domainEnd = maxX;
      if (minX === maxX) {
        const delta = Math.max(Math.abs(minX * 0.1), 0.1);
        domainStart = minX - delta;
        domainEnd = maxX + delta;
      } else {
        const padding = (maxX - minX) * 0.05;
        domainStart = minX - padding;
        domainEnd = maxX + padding;
      }
      if (minX >= 0 && domainStart < 0) {
        if (maxX > 0 || (minX === 0 && maxX === 0)) domainStart = 0;
      }
      if (minX === 0 && maxX === 0 && domainStart === 0 && domainEnd === 0)
        domainEnd = 0.1;
      if (domainStart >= domainEnd)
        domainEnd = domainStart + Math.max(Math.abs(domainStart * 0.1), 0.1);
      setXAxisGlobalDomain([domainStart, domainEnd]);
    } else {
      setXAxisGlobalDomain(["auto", "auto"]);
    }
  }, [filteredData, chartConfig.xAxis, numericalColumnsForAxes]);

  useEffect(() => {
    if (
      !filteredData.length ||
      !chartConfig.yAxis ||
      !numericalColumnsForAxes.includes(chartConfig.yAxis as any)
    ) {
      setYAxisGlobalDomain(["auto", "auto"]);
      return;
    }
    const yAxisKey = chartConfig.yAxis as keyof DataRow;
    const isPct = percentageDisplayColumns.includes(yAxisKey);
    if (isPct) {
      setYAxisGlobalDomain([0, 1]);
      return;
    }
    let minY: number = Infinity,
      maxY: number = -Infinity,
      foundNumericY = false;
    filteredData.forEach((row) => {
      const val = row[yAxisKey];
      if (typeof val === "number" && !isNaN(val)) {
        minY = Math.min(minY, val);
        maxY = Math.max(maxY, val);
        foundNumericY = true;
      }
    });
    if (foundNumericY && minY !== Infinity && maxY !== -Infinity) {
      let domainStart = minY,
        domainEnd = maxY;
      if (minY === maxY) {
        const delta = Math.max(Math.abs(minY * 0.1), 0.1);
        domainStart = minY - delta;
        domainEnd = maxY + delta;
      } else {
        const padding = (maxY - minY) * 0.05;
        domainStart = minY - padding;
        domainEnd = maxY + padding;
      }
      if (minY >= 0 && domainStart < 0) {
        if (maxY > 0 || (minY === 0 && maxY === 0)) domainStart = 0;
      }
      if (minY === 0 && maxY === 0 && domainStart === 0 && domainEnd === 0)
        domainEnd = 0.1;
      if (domainStart >= domainEnd)
        domainEnd = domainStart + Math.max(Math.abs(domainStart * 0.1), 0.1);
      setYAxisGlobalDomain([domainStart, domainEnd]);
    } else {
      setYAxisGlobalDomain(["auto", "auto"]);
    }
  }, [filteredData, chartConfig.yAxis, numericalColumnsForAxes]);

  return { yAxisGlobalDomain, xAxisGlobalDomain };
};
