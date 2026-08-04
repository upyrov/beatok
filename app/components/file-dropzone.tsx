import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export interface UploadState {
  id: string;
  file: File;
  progress: number;
  status: "preparing" | "uploading" | "finalizing" | "success" | "error";
  error?: string;
}

interface FileDropzoneProps {
  label?: string;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  onUpload?: (
    file: File,
    onProgress: (progress: number) => void,
  ) => Promise<void>;
}

export function FileDropzone({
  label = "Click or drag your file here",
  accept = {
    "audio/mpeg": [".mp3"],
    "audio/wav": [".wav"],
    "audio/flac": [".flac"],
    "audio/ogg": [".ogg"],
    "audio/mp4": [".m4a"],
    "audio/aac": [".aac"],
  },
  maxFiles = 1,
  onUpload,
}: FileDropzoneProps) {
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const processUpload = useCallback(
    async (upload: UploadState) => {
      if (!onUpload) return;

      const updateUpload = (updates: Partial<UploadState>) => {
        setUploads((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, ...updates } : u)),
        );
      };

      try {
        updateUpload({ status: "uploading", progress: 0 });

        await onUpload(upload.file, (progress) => {
          updateUpload({
            progress,
            status: progress === 100 ? "finalizing" : "uploading",
          });
        });

        updateUpload({ status: "success" });

        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.id !== upload.id));
        }, 3000);
      } catch (error) {
        console.error(error);
        updateUpload({ status: "error", error: (error as Error).message });
      }
    },
    [onUpload],
  );

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (!onUpload) return;

      const newUploads = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: "preparing" as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      for (const upload of newUploads) {
        void processUpload(upload);
      }
    },
    [onUpload, processUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFilesSelected(acceptedFiles);
      }
    },
  });

  const showDropzone = maxFiles > 1 || !uploads.length;

  return (
    <div className="flex flex-col gap-2 w-full">
      {showDropzone && (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isDragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-white/20 hover:border-white/40 hover:bg-white/5"
          }`}
        >
          <input {...getInputProps()} />
          <p className="font-semibold mb-2 text-gray-400">{label}</p>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 w-full">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-white/5 border border-white/10 p-3 rounded-lg flex flex-col gap-2 w-full"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium truncate mr-2">
                  {upload.file.name}
                </span>
                <span
                  className={`text-xs font-semibold shrink-0 ${
                    upload.status === "error"
                      ? "text-red-400"
                      : upload.status === "success"
                        ? "text-green-400"
                        : "text-blue-400"
                  }`}
                >
                  {upload.status === "error"
                    ? "Error"
                    : upload.status === "success"
                      ? "Done"
                      : upload.status === "preparing"
                        ? "Preparing..."
                        : upload.status === "uploading"
                          ? `${upload.progress}%`
                          : "Finalizing..."}
                </span>
              </div>

              {upload.status !== "success" && upload.status !== "error" && (
                <progress
                  value={upload.progress}
                  max="100"
                  className="w-full h-2 rounded-full overflow-hidden appearance-none bg-white/10 [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500 transition-all duration-200"
                />
              )}
              {upload.status === "error" && (
                <p className="text-xs text-red-400">{upload.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
