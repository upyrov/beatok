import { useState, useRef, useEffect } from "react";
import type { RandomCategory } from "~/api/types/category/random-category";
import { useUploadUrl, useCreateSubmission } from "~/api/submissions";
import { MUSIC_FILE_ACCEPT, validateAudioFile } from "~/lib/audio";
import { handleDownload } from "~/lib/download";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import { LoadingButton } from "~/components/loading";

interface SubmissionProps {
  lobbyId: string;
  randomCategories: RandomCategory[];
  timeLimit: string;
  startedAt?: string;
}

export function Submission({
  lobbyId,
  randomCategories,
  timeLimit,
  startedAt,
}: SubmissionProps) {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedSeconds = timeLimit
    .split(":")
    .reduce((acc, time) => 60 * acc + +time, 0);
  const startTime = startedAt ? new Date(startedAt).getTime() : Date.now();
  const endTime = startTime + parsedSeconds * 1000;

  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.floor((endTime - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, timeLeft]);

  const mins = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  const getUploadUrlMutation = useUploadUrl();
  const createSubmissionMutation = useCreateSubmission();

  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload() {
    if (!fileToUpload) return;
    const validation = await validateAudioFile(fileToUpload);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    try {
      setIsUploading(true);
      const durationSeconds = validation.durationSeconds;
      const fileExtension = fileToUpload.name.split(".").pop() || "";
      const uploadData = await getUploadUrlMutation.mutateAsync({
        extension: fileExtension,
        contentType: fileToUpload.type,
      });

      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileToUpload.type },
        body: fileToUpload,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");

      await createSubmissionMutation.mutateAsync({
        lobbyId,
        value: uploadData.fileKey,
        durationSeconds,
      });

      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Submission failed", err);
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
        {mins}:{secs}
      </div>

      <div className="bg-white/5 p-4 rounded border border-white/10">
        <h3 className="font-bold mb-4">Required Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {randomCategories.map((rc) => (
            <div
              key={rc.id}
              className="bg-white/10 p-3 rounded flex flex-col gap-2"
            >
              <span className="font-semibold text-sm">{rc.name}</span>
              <ul className="text-xs text-gray-300 flex flex-col gap-1">
                {rc.sounds.map((s) => (
                  <li key={s.id} className="flex justify-between items-center">
                    <span className="truncate pr-2">{s.value}</span>
                    <div className="flex items-center gap-2">
                      <audio controls src={s.value} className="h-8 flex-1" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDownload(s.value, `sound-${s.id}.wav`);
                        }}
                        className="text-xs bg-blue-600/50 hover:bg-blue-600 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                      >
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded border border-white/10">
        <h3 className="font-bold mb-2">Submit Your Beat</h3>
        {createSubmissionMutation.isSuccess || isUploading ? (
          <div className="text-green-400 font-semibold text-center py-4">
            Submission registered!
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept={MUSIC_FILE_ACCEPT}
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                if (!file) {
                  setFileToUpload(null);
                  return;
                }
                const validation = await validateAudioFile(file);
                if (!validation.valid) {
                  alert(validation.error);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  setFileToUpload(null);
                  return;
                }
                setFileToUpload(file);
              }}
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors"
            />
            <MutationBoundary mutation={getUploadUrlMutation}>
              <MutationBoundary mutation={createSubmissionMutation}>
                <LoadingButton
                  onClick={handleFileUpload}
                  disabled={!fileToUpload}
                  isPending={
                    getUploadUrlMutation.isPending ||
                    createSubmissionMutation.isPending
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-semibold"
                >
                  Upload Submission
                </LoadingButton>
              </MutationBoundary>
            </MutationBoundary>
          </div>
        )}
      </div>
    </div>
  );
}
