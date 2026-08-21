import JSZip from "jszip";
import { useCallback, useMemo } from "react";
import { CgSoftwareDownload, CgTrash } from "react-icons/cg";
import {
  useCreateSubmission,
  useDeleteSubmission,
  useUploadUrl,
} from "~/api/submission";
import type { Sound } from "~/api/types/sound";
import { ActionButton } from "~/components/action-button";
import { FileDropzone } from "~/components/file-dropzone";
import { AudioPlayer } from "~/components/lazy-audio-player";

import { Button } from "~/components/ui/button";
import { useCountdown } from "~/hooks/use-countdown";
import { validateAudioFile } from "~/lib/audio";
import {
  playNotificationSound,
  sendBrowserNotification,
} from "~/lib/notification";
import { toastError } from "~/lib/toast";
import { uploadFile } from "~/lib/upload";
import { useLobbyStore } from "~/stores/lobby";
import { useUserStore } from "~/stores/user";

export function Submitting() {
  const lobby = useLobbyStore((s) => s.lobby);
  const setLobby = useLobbyStore((s) => s.setLobby);
  const connection = useLobbyStore((s) => s.connection);
  const user = useUserStore((s) => s.user);
  const participation = lobby?.participants.find((p) => p.user.id === user?.id);
  const getUploadUrlMutation = useUploadUrl();
  const createSubmissionMutation = useCreateSubmission();
  const deleteSubmissionMutation = useDeleteSubmission();
  const mySubmission = lobby?.submissions?.find(
    (s) => s.participationId === participation?.id,
  );

  const { minutes, seconds } = useCountdown(
    lobby?.submissionTime ?? "00:00:00",
    lobby?.submissionStartedAt,
    (timeLeft) => {
      if (timeLeft === 10) {
        playNotificationSound("warning");
      } else if (!timeLeft) {
        playNotificationSound("alert");
        sendBrowserNotification("Time's up! Return to Beatok to vote!");
      }
    },
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

  const handleUpload = useCallback(
    async (file: File, onProgress: (progress: number) => void) => {
      const validation = await validateAudioFile(file);
      if (!validation.valid || validation.durationSeconds === 0) {
        const errorMsg = validation.error || "Failed to read audio file metadata.";
        toastError(errorMsg);
        throw new Error(errorMsg);
      }

      try {
        const fileExtension = file.name.split(".").pop() ?? "";
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
      } catch (err) {
        toastError(err);
        throw err;
      }
    },
    [getUploadUrlMutation, createSubmissionMutation, lobby],
  );

  const handleDeleteSubmission = useCallback(() => {
    if (!mySubmission) return;
    deleteSubmissionMutation.mutate(mySubmission.id, {
      onSuccess: () => {
        setLobby((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            submissions: prev.submissions?.filter(
              (s) => s.id !== mySubmission.id,
            ),
          };
        });
      },
      onError: (err) => {
        toastError(err);
      },
    });
  }, [deleteSubmissionMutation, mySubmission, setLobby]);

  const handleDownload = useCallback(
    async (e: React.MouseEvent, sound: Sound) => {
      e.preventDefault();
      const url = sound.value;
      const extension = url.split(".").pop()?.split("?")[0] ?? "wav";
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          const data: { message: string } | undefined = await response
            .json()
            .catch(() => {});
          throw new Error(data?.message ?? "Failed to download file");
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${sound.name}-${sound.id}.${extension}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        toastError(error);
      }
    },
    [],
  );

  const onDownloadZip = useCallback(async () => {
    if (!lobby) return;
    const zip = new JSZip();

    const promises = lobby.sounds.map(async (sound) => {
      try {
        const response = await fetch(sound.value);
        const blob = await response.blob();
        const extension = sound.value.split(".").pop()?.split("?")[0] ?? "wav";
        zip.file(`${sound.name}-${sound.id}.${extension}`, blob);
      } catch (err) {
        toastError("Failed to fetch sound:", err);
      }
    });

    await Promise.all(promises);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beatok-lobby-${lobby.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [lobby]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wider text-center">
        {minutes}:{seconds}
      </div>

      <div className="bg-muted p-4 rounded border border-muted-border">
        <div className="flex justify-between items-center mb-4">
          {groupedCategories.length > 0 && (
            <Button
              onClick={onDownloadZip}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-white hover:bg-gray-200   border-none font-semibold"
            >
              <CgSoftwareDownload size={18} /> Download All (ZIP)
            </Button>
          )}
        </div>
        <div className="gap-4">
          {groupedCategories.map((gc) => (
            <div key={gc.category.id}>
              <span className="font-semibold text-sm">{gc.category.name}</span>
              <ul className="text-xs text-gray-300 flex flex-col gap-1 w-full">
                {gc.sounds.map((s) => (
                  <li key={s.id} className="flex items-center w-full">
                    <div className="flex items-center gap-2 w-full">
                      <AudioPlayer src={s.value} className="flex-1 min-w-0" />
                      <Button
                        className="shrink-0"
                        onClick={(e: React.MouseEvent) => handleDownload(e, s)}
                        title="Download"
                      >
                        <CgSoftwareDownload />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted p-4 rounded border border-muted-border flex flex-col items-center">
        <h3 className="font-bold mb-2 text-center">Submit Your Beat</h3>
        {mySubmission ? (
          <div className="flex flex-col gap-4">
            <AudioPlayer src={mySubmission.value} />
            <ActionButton
              onClick={handleDeleteSubmission}
              pending={deleteSubmissionMutation.isPending}
              className="flex items-center justify-center gap-2"
            >
              <CgTrash /> Delete Submission
            </ActionButton>
          </div>
        ) : createSubmissionMutation.isSuccess ? (
          <div className="text-green-400 font-semibold text-center py-4">
            Submission registered!
          </div>
        ) : (
          <FileDropzone
            label="Click or drag your beat here"
            maxFiles={1}
            onUpload={handleUpload}
          />
        )}
      </div>
    </div>
  );
}
