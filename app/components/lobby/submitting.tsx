import { use, useMemo, useEffect } from "react";
import { useCountdown } from "~/hooks/use-countdown";
import { FileDropzone } from "~/components/file-dropzone";
import { AudioPlayer } from "~/components/audio-player";
import { RealtimeContext } from "~/contexts";
import { useUploadUrl, useCreateSubmission } from "~/api/submissions";
import { validateAudioFile } from "~/lib/audio";
import { uploadFile } from "~/lib/upload";
import { handleDownload } from "~/lib/download";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import type { Me } from "~/api/types/user/me";
import type { Submission as SubmissionType } from "~/api/types/submission/submission";
import { LobbyState } from "~/api/types/enums/lobby-state";
import { useOutletContext } from "react-router";
import { LobbyContext } from "~/contexts";

export function Submitting() {
  const { lobby, setLobby } = use(LobbyContext);
  const { connection } = use(RealtimeContext);
  const { user } = useOutletContext<{ user: Me | null }>();
  const participation = lobby?.participants.find((p) => p.user.id === user?.id);
  const getUploadUrlMutation = useUploadUrl();
  const createSubmissionMutation = useCreateSubmission();

  const { minutes, seconds } = useCountdown(
    lobby?.submissionTime ?? "00:00:00",
    lobby?.submissionStartedAt,
  );

  const groupedCategories = useMemo(() => {
    if (!lobby) return [];
    const soundsByCategoryId = Object.groupBy(
      lobby.sounds.filter((s) => s.category),
      (s) => s.category.id,
    );
    return Object.values(soundsByCategoryId).map((group) => ({
      category: group![0].category,
      sounds: group!,
    }));
  }, [lobby]);

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
          submissions: prev.submissions?.length
            ? prev.submissions
            : votingSubmissions,
        };
      });
    }

    connection.on("VotingStarted", handleVotingStarted);
    return () => {
      connection.off("VotingStarted", handleVotingStarted);
    };
  }, [connection, setLobby]);

  async function handleUpload(
    file: File,
    onProgress: (progress: number) => void,
  ) {
    const validation = await validateAudioFile(file);
    if (!validation.valid) throw new Error(validation.error);

    const fileExtension = file.name.split(".").pop() || "";
    const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
      extension: fileExtension,
      contentType: file.type,
    });

    await uploadFile(file, uploadUrl, onProgress);

    if (!lobby) return;
    await createSubmissionMutation.mutateAsync({
      lobbyId: lobby.id,
      value: fileKey,
      durationSeconds: validation.durationSeconds,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
        {minutes}:{seconds}
      </div>

      <div className="bg-white/5 p-4 rounded border border-white/10">
        <h3 className="font-bold mb-4">Categories</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      <AudioPlayer src={s.value} className="flex-1" />
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
        {lobby?.submissions.some(
          (s) => s.participationId === participation?.id,
        ) || createSubmissionMutation.isSuccess ? (
          <div className="text-green-400 font-semibold text-center py-4">
            Submission registered!
          </div>
        ) : (
          <MutationBoundary mutation={getUploadUrlMutation}>
            <MutationBoundary mutation={createSubmissionMutation}>
              <FileDropzone
                label="Click or drag your beat here"
                maxFiles={1}
                onUpload={handleUpload}
              />
            </MutationBoundary>
          </MutationBoundary>
        )}
      </div>
    </div>
  );
}
