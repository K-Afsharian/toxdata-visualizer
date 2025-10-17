// src/components/controls/FileUploader.tsx
import React from "react";

interface FileUploaderProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  isLoading,
  error,
}) => {
  return (
    <div className="controls-section file-uploader">
      <h2>Upload Data</h2>
      <label htmlFor="csv-upload">Upload CSV File:</label>
      <input
        type="file"
        id="csv-upload"
        accept=".csv"
        onChange={onFileUpload}
      />
      {isLoading && <p className="loading-message">Loading data...</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
