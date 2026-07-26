import { use, useEffect, useState, useRef } from "react";
import { useParams, useOutletContext } from "react-router";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useMutation } from "@tanstack/react-query";
import { RealtimeContext } from "~/contexts";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import { useJoinLobby, useStartLobby } from "~/api/lobbies";
import { LobbyPhase } from "~/api/types/enums/lobby-phase";
import type { User } from "~/api/types/user/user";
import { useUploadUrl, useCreateSubmission } from "~/api/submissions";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import { LoadingButton, LoadingFallback } from "~/components/loading";
import type { Score } from "~/api/types/score/score";
import type { RandomCategory } from "~/api/types/category/random-category";
import type { Submission } from "~/api/types/submission/submission";
import { MUSIC_FILE_ACCEPT, validateAudioFile } from "~/lib/audio";

interface Message {
  content: string;
  sender: User;
}

export default function Lobby() {
  const { id } = useParams();

  const { connection } = use(RealtimeContext);
  const { user } = useOutletContext<{ user: User | null }>();

  const [lobby, setLobby] = useState<LobbyWithParticipants | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [randomCategories, setRandomCategories] = useState<RandomCategory[]>(
    [],
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [winningSubmission, setWinningSubmission] = useState<Submission | null>(
    null,
  );
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const joinLobbyMutation = useJoinLobby();
  const startLobbyMutation = useStartLobby();
  const createSubmissionMutation = useCreateSubmission();
  const getUploadUrlMutation = useUploadUrl();
  const joinRealtimeMutation = useMutation({
    mutationFn: async () => {
      if (!connection) throw new Error("No connection");
      return await connection.invoke<LobbyWithParticipants>("Join", id);
    },
    retry: 100,
    retryDelay: 1000,
    onSuccess: (joinedLobby) => {
      if (joinedLobby) {
        console.log("Joined lobby:");
        console.log(joinedLobby);
        setLobby(joinedLobby);
      }
    },
    onError: (err) => {
      console.error(
        "Failed to join lobby realtime after multiple attempts.",
        err,
      );
    },
  });

  useEffect(() => {
    if (connection && id && !lobby) {
      joinLobbyMutation
        .mutateAsync(id)
        .then(() => joinRealtimeMutation.mutate())
        .catch((err) => console.error("Failed to join lobby: ", err));
    }
  }, [connection, id, lobby]);

  useEffect(() => {
    if (connection) {
      function handleParticipantJoined(user: User) {
        setLobby((prev) =>
          prev ? { ...prev, participants: [...prev.participants, user] } : prev,
        );
      }

      function handleParticipantRejoined(user: User) {
        setLobby((prev) => {
          if (!prev) return prev;

          if (prev.participants.find((p) => p.id === user.id)) return prev;
          return { ...prev, participants: [...prev.participants, user] };
        });
      }

      function handleParticipantLeft(user: User) {
        setLobby((prev) =>
          prev
            ? {
                ...prev,
                participants: prev.participants.filter((p) => p.id !== user.id),
              }
            : prev,
        );
      }

      function handleOwnerChanged(ownerId: string) {
        setLobby((prev) => {
          if (!prev) return prev;
          const newOwner =
            prev.participants.find((p) => p.id === ownerId) || prev.owner;
          return { ...prev, owner: newOwner };
        });
      }

      function handleMessageReceived(content: string, sender: User) {
        setMessages((prev) => [...prev, { content, sender }]);
      }

      function handleStarted(categories: RandomCategory[]) {
        setLobby((prev) =>
          prev ? { ...prev, phase: LobbyPhase.Submission } : prev,
        );
        setRandomCategories(categories);
      }

      function handleSubmissionRegistered(submission: Submission) {
        console.log("Submission registered:", submission);
      }

      function handleVotingStarted(votingSubmissions: Submission[]) {
        setLobby((prev) =>
          prev ? { ...prev, phase: LobbyPhase.Voting } : prev,
        );
        setSubmissions(votingSubmissions);
      }

      function handleVoteRegistered(score: Score) {
        console.log("Vote registered:", score);
      }

      function handleEnded(wId: string | null, submission: Submission | null) {
        setLobby((prev) => (prev ? { ...prev, phase: LobbyPhase.End } : prev));
        setWinnerId(wId);
        setWinningSubmission(submission);
      }

      connection.on("ParticipantJoined", handleParticipantJoined);
      connection.on("ParticipantRejoined", handleParticipantRejoined);
      connection.on("ParticipantLeft", handleParticipantLeft);
      connection.on("OwnerChanged", handleOwnerChanged);
      connection.on("MessageReceived", handleMessageReceived);
      connection.on("Started", handleStarted);
      connection.on("SubmissionRegistered", handleSubmissionRegistered);
      connection.on("VotingStarted", handleVotingStarted);
      connection.on("VoteRegistered", handleVoteRegistered);
      connection.on("Ended", handleEnded);

      return () => {
        connection.off("ParticipantJoined", handleParticipantJoined);
        connection.off("ParticipantRejoined", handleParticipantRejoined);
        connection.off("ParticipantLeft", handleParticipantLeft);
        connection.off("OwnerChanged", handleOwnerChanged);
        connection.off("MessageReceived", handleMessageReceived);
        connection.off("Started", handleStarted);
        connection.off("SubmissionRegistered", handleSubmissionRegistered);
        connection.off("VotingStarted", handleVotingStarted);
        connection.off("VoteRegistered", handleVoteRegistered);
        connection.off("Ended", handleEnded);
      };
    }
  }, [connection]);

  const chatForm = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      if (!connection) return;
      try {
        await connection.invoke("SendMessage", id, value.content);
        chatForm.reset();
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
  });

  async function handleFileUpload() {
    if (!fileToUpload || !id) return;
    const validation = await validateAudioFile(fileToUpload);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    try {
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
        lobbyId: id,
        value: uploadData.fileKey,
        durationSeconds,
      });

      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Submission failed", err);
    }
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-7xl min-h-screen flex gap-8">
      {!lobby ? (
        <LoadingFallback className="m-auto" />
      ) : (
        <>
          <div className="flex flex-col gap-4 flex-1">
            <h1 className="text-2xl font-bold">{lobby.name}</h1>
            <div className="flex gap-8">
              <div>
                <p className="font-semibold">Genre</p>
                <p>{lobby.genre.name}</p>
              </div>
              <div>
                <p className="font-semibold">Players</p>
                <p>
                  {lobby.participants.length} / {lobby.participantLimit}
                </p>
              </div>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="font-semibold">Created</p>
                <p>{dateFormatter.format(new Date(lobby.createdAt))}</p>
              </div>
              <div>
                <p className="font-semibold">Submission Deadline</p>
                <p>{lobby.submissionTimeLimit}</p>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-8">
              {lobby.phase === LobbyPhase.NotStarted && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Lobby Not Started</h2>
                  {user?.id === lobby.owner.id ? (
                    <MutationBoundary mutation={startLobbyMutation}>
                      <LoadingButton
                        onClick={() => id && startLobbyMutation.mutate(id)}
                        isPending={startLobbyMutation.isPending}
                        pendingText="Starting..."
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold"
                      >
                        Start Lobby
                      </LoadingButton>
                    </MutationBoundary>
                  ) : (
                    <p className="text-gray-400">
                      Waiting for host to start...
                    </p>
                  )}
                </div>
              )}

              {lobby.phase === LobbyPhase.Submission && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Submission Phase</h2>

                  <div className="bg-white/5 p-4 rounded border border-white/10">
                    <h3 className="font-bold mb-2">Random Kit</h3>
                    <div className="flex flex-wrap gap-4">
                      {randomCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className="bg-black/20 p-2 rounded text-sm"
                        >
                          <span className="font-semibold text-blue-400">
                            {cat.name}
                          </span>
                          <ul className="mt-1 pl-4 list-disc text-gray-300">
                            {cat.sounds.map((s) => (
                              <li
                                key={s.id}
                                className="flex flex-col gap-2 mb-3 bg-black/20 p-2 rounded"
                              >
                                <span className="text-xs text-gray-400 break-all">
                                  {s.value}
                                </span>
                                <div className="flex justify-between items-center gap-4">
                                  <audio
                                    controls
                                    src={s.value}
                                    className="h-8 flex-1"
                                  />
                                  <a
                                    href={s.value}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs bg-blue-600/50 hover:bg-blue-600 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                                  >
                                    Download
                                  </a>
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
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
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
                            pendingText="Uploading..."
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-semibold"
                          >
                            Upload Submission
                          </LoadingButton>
                        </MutationBoundary>
                      </MutationBoundary>
                    </div>
                  </div>
                </div>
              )}

              {lobby.phase === LobbyPhase.Voting && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Voting Phase</h2>
                  <ul className="space-y-2">
                    {submissions.map((sub) => (
                      <li
                        key={sub.id}
                        className="bg-white/5 p-3 rounded flex justify-between items-center"
                      >
                        <span>Submission by User {sub.userId}</span>
                        <span className="text-sm text-gray-400">
                          File: {sub.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!submissions.length && (
                    <p className="text-gray-400">No submissions to vote on.</p>
                  )}
                </div>
              )}

              {lobby.phase === LobbyPhase.End && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Lobby Ended</h2>
                  <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                    <h3 className="font-bold text-blue-400 text-lg mb-2">
                      Winner!
                    </h3>
                    {winnerId ? (
                      <div>
                        <p>User ID: {winnerId}</p>
                        {winningSubmission && (
                          <p className="text-sm text-gray-300 mt-1">
                            Winning track: {winningSubmission.value}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p>No winner could be determined.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Participants</h2>
              <ul className="flex flex-col gap-2">
                {lobby.participants.map((p) => (
                  <li key={p.id}>
                    {p.name}{" "}
                    {p.id === lobby.owner.id && (
                      <span className="text-gray-400 text-sm">(Owner)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-80 flex flex-col border border-white/10 rounded-xl bg-white/5 overflow-hidden h-150">
            <div className="p-4 border-b border-white/10 font-bold">
              Lobby Chat
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {messages.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="font-bold text-gray-300">
                    {m.sender.name}:{" "}
                  </span>
                  <span className="text-gray-100">{m.content}</span>
                </div>
              ))}
              {!messages.length && (
                <p className="text-gray-500 text-sm italic">No messages yet.</p>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                chatForm.handleSubmit();
              }}
              className="p-4 border-t border-white/10 flex gap-2"
            >
              <chatForm.Field
                name="content"
                validators={{
                  onChange: type("string > 0"),
                }}
                children={(field) => (
                  <input
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Say something..."
                    className="flex-1 bg-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                )}
              />
              <chatForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                )}
              />
            </form>
          </div>
        </>
      )}
    </main>
  );
}
