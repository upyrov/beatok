import { use, useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { RealtimeContext } from "~/contexts";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import { useJoinLobby } from "~/api/lobbies";
import { LobbyPhase } from "~/api/types/enums/lobby-phase";
import type { User } from "~/api/types/user/user";
import { LoadingFallback } from "~/components/loading";
import type { RandomCategory } from "~/api/types/category/random-category";
import type { Submission as SubmissionType } from "~/api/types/submission/submission";
import {
  Chat,
  Participants,
  Waiting,
  Submission,
  Voting,
  End,
} from "~/components/lobby";

export default function Lobby() {
  const { id } = useParams();

  const { connection } = use(RealtimeContext);
  const { user } = useOutletContext<{ user: User | null }>();

  const [lobby, setLobby] = useState<LobbyWithParticipants | null>(null);
  const [randomCategories, setRandomCategories] = useState<RandomCategory[]>(
    [],
  );
  const [submissions, setSubmissions] = useState<SubmissionType[]>([]);
  const [winningSubmission, setWinningSubmission] =
    useState<SubmissionType | null>(null);

  const joinLobbyMutation = useJoinLobby();
  const joinRealtimeMutation = useMutation({
    async mutationFn() {
      if (!connection) throw new Error("No connection");
      return await connection.invoke<LobbyWithParticipants>("Join", id);
    },
    retry: 100,
    retryDelay: 1000,
    onSuccess(joinedLobby) {
      if (joinedLobby) {
        setLobby(joinedLobby);
      }
    },
    onError(err) {
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
      function handleParticipantJoined(userId: string) {
        if (!lobby) return;
        const existingUser = lobby.participants.find((p) => p.id === userId);
        if (existingUser) return;

        setLobby((prev) =>
          prev
            ? {
                ...prev,
                participants: [...prev.participants, existingUser!],
              }
            : prev,
        );
      }

      function handleParticipantRejoined(userId: string) {}

      function handleParticipantLeft(userId: string) {
        setLobby((prev) =>
          prev
            ? {
                ...prev,
                participants: prev.participants.filter((p) => p.id !== userId),
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

      function handleStarted(categories: RandomCategory[]) {
        setLobby((prev) =>
          prev
            ? {
                ...prev,
                phase: LobbyPhase.Submission,
                startedAt: new Date().toISOString(),
              }
            : prev,
        );
        setRandomCategories(categories);
      }

      function handleVotingStarted(votingSubmissions: SubmissionType[]) {
        setLobby((prev) =>
          prev ? { ...prev, phase: LobbyPhase.Voting } : prev,
        );
        setSubmissions(votingSubmissions);
      }

      function handleEnded(submission: SubmissionType | null) {
        setLobby((prev) => (prev ? { ...prev, phase: LobbyPhase.End } : prev));
        setWinningSubmission(submission);
      }

      connection.on("ParticipantJoined", handleParticipantJoined);
      connection.on("ParticipantRejoined", handleParticipantRejoined);
      connection.on("ParticipantLeft", handleParticipantLeft);
      connection.on("OwnerChanged", handleOwnerChanged);
      connection.on("Started", handleStarted);
      connection.on("VotingStarted", handleVotingStarted);
      connection.on("Ended", handleEnded);

      return () => {
        connection.off("ParticipantJoined", handleParticipantJoined);
        connection.off("ParticipantRejoined", handleParticipantRejoined);
        connection.off("ParticipantLeft", handleParticipantLeft);
        connection.off("OwnerChanged", handleOwnerChanged);
        connection.off("Started", handleStarted);
        connection.off("VotingStarted", handleVotingStarted);
        connection.off("Ended", handleEnded);
      };
    }
  }, [connection]);

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
                <Waiting
                  lobbyId={lobby.id}
                  isOwner={user?.id === lobby.owner.id}
                />
              )}
              {lobby.phase === LobbyPhase.Submission && (
                <Submission
                  lobbyId={lobby.id}
                  randomCategories={randomCategories}
                  timeLimit={lobby.submissionTimeLimit}
                  startedAt={lobby.startedAt}
                />
              )}
              {lobby.phase === LobbyPhase.Voting && (
                <Voting
                  lobbyId={lobby.id}
                  submissions={submissions}
                  currentUserId={user?.id}
                />
              )}
              {lobby.phase === LobbyPhase.End && (
                <End winningSubmission={winningSubmission} />
              )}
            </div>

            <Participants
              participants={lobby.participants}
              ownerId={lobby.owner.id}
            />
          </div>

          <Chat
            participants={lobby.participants}
            connection={connection}
            lobbyId={lobby.id}
          />
        </>
      )}
    </main>
  );
}
