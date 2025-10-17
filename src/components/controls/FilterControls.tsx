// src/components/controls/FilterControls.tsx
import React from "react";
import { DataRow, Filters } from "../../interfaces";
import { getUniqueValues } from "../../utils/dataUtils";

interface FilterControlsProps {
  rawData: DataRow[];
  filters: Filters;
  onFilterChange: (filterName: keyof Filters, value: any) => void;
  uniqueTimePointsAll: (number | string)[];
  selectedTimePoints: (number | string)[];
  onTimePointSelectionChange: (timePoint: number | string) => void;
  filteredDataLength: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  rawData,
  filters,
  onFilterChange,
  uniqueTimePointsAll,
  selectedTimePoints,
  onTimePointSelectionChange,
}) => {
  return (
    <div className="controls-section filters">
      <h2>Filter Data (Applied to all charts)</h2>
      <div className="filter-group">
        <div className="filter-item">
          <label htmlFor="species-filter">Species:</label>
          <select
            id="species-filter"
            multiple
            value={filters.Species || []}
            onChange={(e) =>
              onFilterChange(
                "Species",
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            style={{ height: "100px" }}
          >
            {getUniqueValues("Species", rawData).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="sex-filter">Sex:</label>
          <select
            id="sex-filter"
            multiple
            value={filters.Sex || []}
            onChange={(e) =>
              onFilterChange(
                "Sex",
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            style={{ height: "70px" }}
          >
            {getUniqueValues("Sex", rawData).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      {uniqueTimePointsAll.length > 0 && (
        <div className="filter-item" style={{ marginTop: "15px" }}>
          <label>Select Time Points (days) to Display:</label>
          <div
            className="time-point-checkboxes"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 15px",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "4px",
              marginTop: "5px",
            }}
          >
            {uniqueTimePointsAll.map((tp) => (
              <div
                key={tp}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  id={`time-filter-${tp}`}
                  value={tp}
                  checked={selectedTimePoints.includes(tp)}
                  onChange={() => onTimePointSelectionChange(tp)}
                  style={{ marginRight: "5px" }}
                />
                <label htmlFor={`time-filter-${tp}`}>{tp}</label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
