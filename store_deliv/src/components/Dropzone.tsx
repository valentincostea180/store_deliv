import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface DropzoneProps {
  onUpload: (url: string) => void;
  heading: string;
  uploadType: "photo";
}

export default function Dropzone({ heading, uploadType }: DropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Default upload logic
      setUploading(true);
      setProgress(0);

      const formData = new FormData();

      formData.append("file", file);
      const endpoint = "http://localhost:5000/upload";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Upload failed with status ${response.status}`,
          );
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [uploadType],
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
