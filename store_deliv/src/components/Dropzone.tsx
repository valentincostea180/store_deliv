import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ProgressBar } from "react-bootstrap";

interface DropzoneProps {
  onUpload: (url: string) => void;
  heading: string;
  uploadType: "photo";
}

export default function Dropzone({
  heading,
  uploadType,
  onUpload,
}: DropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // reset/start upload
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      const endpoint = "http://localhost:5000/upload";

      // progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100,
          );
          setProgress(percentComplete);
          console.log(`Upload progress: ${percentComplete}%`);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.url) {
              console.log("Upload successful, URL:", result.url);
              onUpload(result.url);
            } else {
              console.error("No URL in response:", result);
            }
          } catch (error) {
            console.error("Error parsing response:", error);
            alert("Failed to process server response.");
          }
        } else {
          console.error("Upload failed with status:", xhr.status);
          try {
            const errorData = JSON.parse(xhr.responseText);
            alert(
              errorData.message || `Upload failed with status ${xhr.status}`,
            );
          } catch {
            alert(`Upload failed with status ${xhr.status}`);
          }
        }
        setUploading(false);
        setProgress(0);
      });

      xhr.addEventListener("error", () => {
        console.error("Upload error: Network error");
        alert("Network error. Please check your connection.");
        setUploading(false);
        setProgress(0);
      });

      xhr.addEventListener("timeout", () => {
        console.error("Upload error: Timeout");
        alert("Upload timed out. Please try again.");
        setUploading(false);
        setProgress(0);
      });

      xhr.open("POST", endpoint);
      xhr.timeout = 60000; // 60 second timeout
      xhr.send(formData);
    },
    [uploadType, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
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
            <ProgressBar
              now={progress}
              label={`${progress}%`}
              animated
              striped
              style={{ width: "100%" }}
            />
            <p style={{ marginTop: "10px", fontSize: "14px" }}>
              Uploading... {progress}%
            </p>
          </div>
        ) : isDragActive ? (
          <div className="dropzone-box">
            <p>Drop the image file here...</p>
          </div>
        ) : (
          <div className="dropzone-box">
            <p className="dropzone-heading" style={{ textAlign: "center" }}>
              {heading}
            </p>
            <p className="dropzone-instruction" style={{ textAlign: "center" }}>
              Click to select an image file (JPG or PNG)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
