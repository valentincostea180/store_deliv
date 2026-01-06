import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface DropzoneProps {
  onUploadSuccess?: (filename: string) => void;
  onUploadError?: (error: string) => void;
  onFileUpload?: (file: File) => void;
  heading: string;
  uploadType: "photo";
}

export default function Dropzone({
  onUploadSuccess,
  onUploadError,
  onFileUpload,
  heading,
  uploadType,
}: DropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // If onFileUpload is provided, use it instead of the default upload logic
      if (onFileUpload) {
        onFileUpload(file);
        return;
      }

      // Default upload logic
      setUploading(true);
      setProgress(0);

      const formData = new FormData();

      // Server expects the field name to be "file" for both endpoints
      formData.append("file", file);

      // Determine the correct endpoint based on uploadType
      const endpoint = "http://localhost:5000/upload";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Upload failed with status ${response.status}`
          );
        }

        const result = await response.json();
        onUploadSuccess?.(result.filename);
      } catch (error) {
        console.error("Upload error:", error);
        onUploadError?.(
          error instanceof Error ? error.message : "Upload failed"
        );
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onUploadSuccess, onUploadError, uploadType, onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
  });

  return (
    <div className="dropzone-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""} ${
          uploading ? "uploading" : ""
        }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="upload-progress">
            <p>Uploading... {progress}%</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : isDragActive ? (
          <p>Drop the JPG file here...</p>
        ) : (
          <div className="dropzone-box">
            <p className="dropzone-heading" style={{ textAlign: "center" }}>
              {heading}
            </p>
            <p className="dropzone-instruction">Click to select an JPG file.</p>
          </div>
        )}
      </div>
    </div>
  );
}
