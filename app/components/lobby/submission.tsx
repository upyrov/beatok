import { useState, useEffect, use, useMemo, useCallback } from "react";
import { useCountdown } from "~/hooks/use-countdown";
import { useForm } from "@tanstack/react-form";
import { useDropzone } from "react-dropzone";
import { RealtimeContext } from "~/contexts";
import type { SoundWithCategory } from "~/api/types/sound/sound-with-category";
import type { Category } from "~/api/types/category/category";
import { useUploadUrl, useCreateSubmission } from "~/api/submissions";
import { validateAudioFile } from "~/lib/audio";
import { handleDownload } from "~/lib/download";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import type { Submission as SubmissionType } from "~/api/types/submission/submission";
import { LobbyState } from "~/api/types/enums/lobby-state";

interface SubmissionProps {
  lobbyId: string;
  sounds: SoundWithCategory[];
  timeLimit: string;
  startedAt?: string;
  setLobby: React.Dispatch<React.SetStateAction<LobbyWithParticipants | null>>;
}

export function Submission({
  lobbyId,
  sounds,
  timeLimit,
  startedAt,
  setLobby,
}: SubmissionProps) {
  const { connection } = use(RealtimeContext);
  const getUploadUrlMutation = useUploadUrl();
  const createSubmissionMutation = useCreateSubmission();

  const { minutes, seconds } = useCountdown(timeLimit, startedAt);

  const groupedCategories = useMemo(() => {
    const soundsByCategoryId = Object.groupBy(
      sounds.filter((s) => s.category),
      (s) => s.category.id,
    );
    return Object.values(soundsByCategoryId).map((group) => ({
      category: group![0].category,
      sounds: group!,
    }));
  }, [sounds]);

  const form = useForm({
    defaultValues: { file: null as File | null },
    onSubmit: async ({ value }) => {
      if (value.file) {
        await processFile(value.file);
      }
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
      "audio/flac": [".flac"],
      "audio/ogg": [".ogg"],
      "audio/mp4": [".m4a"],
      "audio/aac": [".aac"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        form.setFieldValue("file", acceptedFiles[0]);
        form.handleSubmit();
      }
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!connection) return;

    function handleVotingStarted(
      votingTime: string,
      votingSubmissions: SubmissionType[],
    ) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          state: LobbyState.Voting,
          votingTime: votingTime,
          votingStartedAt: new Date().toISOString(),
          submissions: votingSubmissions,
        };
      });
    }

    connection.on("VotingStarted", handleVotingStarted);
    return () => {
      connection.off("VotingStarted", handleVotingStarted);
    };
  }, [connection, setLobby]);

  const handleFileUpload = useCallback(
    async (file: File, durationSeconds: number) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        const fileExtension = file.name.split(".").pop() || "";
        const uploadData = await getUploadUrlMutation.mutateAsync({
          extension: fileExtension,
          contentType: file.type,
        });

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Failed to upload: ${xhr.statusText}`));
            }
          });
          xhr.addEventListener("error", () =>
            reject(new Error("Network Error")),
          );

          xhr.open("PUT", uploadData.uploadUrl, true);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setUploadProgress(100);

        await createSubmissionMutation.mutateAsync({
          lobbyId,
          value: uploadData.fileKey,
          durationSeconds,
        });

        form.reset();
      } catch (err) {
        console.error("Submission failed", err);
      } finally {
        setIsUploading(false);
      }
    },
    [getUploadUrlMutation, createSubmissionMutation, lobbyId, form],
  );

  const processFile = useCallback(
    async (file: File) => {
      const validation = await validateAudioFile(file);
      if (!validation.valid) {
        alert(validation.error);
        form.reset();
        return;
      }
      await handleFileUpload(file, validation.durationSeconds);
    },
    [form, handleFileUpload],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
        {minutes}:{seconds}
      </div>

      <div className="bg-white/5 p-4 rounded border border-white/10">
        <h3 className="font-bold mb-4">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {groupedCategories.map((gc) => (
            <div
              key={gc.category.id}
              className="bg-white/10 p-3 rounded flex flex-col gap-2"
            >
              <span className="font-semibold text-sm">{gc.category.name}</span>
              <ul className="text-xs text-gray-300 flex flex-col gap-1">
                {gc.sounds.map((s) => (
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
        {createSubmissionMutation.isSuccess ? (
          <div className="text-green-400 font-semibold text-center py-4">
            Submission registered!
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-4 py-4 w-full">
            <div className="w-full max-w-md bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              {getUploadUrlMutation.isPending
                ? "Preparing upload..."
                : createSubmissionMutation.isPending
                  ? "Finalizing submission..."
                  : `${uploadProgress}%`}
            </p>
          </div>
        ) : (
          <MutationBoundary mutation={getUploadUrlMutation}>
            <MutationBoundary mutation={createSubmissionMutation}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isDragActive
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/20 hover:border-white/40 hover:bg-white/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  <p className="font-semibold mb-2 text-grey-600">
                    Click or drag your beat here
                  </p>
                </div>
              </form>
            </MutationBoundary>
          </MutationBoundary>
        )}
      </div>
    </div>
  );
}
