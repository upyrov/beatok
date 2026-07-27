import { use, useEffect, useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router";
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

  const navigate = useNavigate();

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
    mutationFn() {
      if (!connection) throw new Error("No connection");
      return connection.invoke<LobbyWithParticipants>("Join", id);
    },
    retry: 5,
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
        .catch(() => navigate("/"));
    }
  }, [connection, id, lobby]);

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
            <div className="flex flex-col gap-8">
              <p className="font-semibold">Submission Time</p>
              <p>{lobby.submissionTimeLimit}</p>
            </div>

            <Participants
              participants={lobby.participants}
              ownerId={lobby.ownerId}
              userId={user?.id ?? ""}
              setLobby={setLobby}
            />
          </div>

          <div className="flex-1">
            {lobby.phase === LobbyPhase.NotStarted && (
              <Waiting
                lobbyId={lobby.id}
                isOwner={user?.id === lobby.ownerId}
                participants={lobby.participants}
                setLobby={setLobby}
                setRandomCategories={setRandomCategories}
              />
            )}
            {lobby.phase === LobbyPhase.Submission && (
              <Submission
                lobbyId={lobby.id}
                randomCategories={randomCategories}
                timeLimit={lobby.submissionTimeLimit}
                startedAt={lobby.startedAt}
                setLobby={setLobby}
                setSubmissions={setSubmissions}
              />
            )}
            {lobby.phase === LobbyPhase.Voting && (
              <Voting
                lobbyId={lobby.id}
                submissions={submissions}
                currentUserId={user?.id}
                setLobby={setLobby}
                setWinningSubmission={setWinningSubmission}
              />
            )}
            {lobby.phase === LobbyPhase.End && (
              <End winningSubmission={winningSubmission} />
            )}
          </div>

          <div className="flex-1">
            <Chat participants={lobby.participants} lobbyId={lobby.id} />
          </div>
        </>
      )}
    </main>
  );
}
