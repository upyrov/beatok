import { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RealtimeContext, LobbyContext } from "~/contexts";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import { LoadingFallback } from "~/components/loading";
import {
  ParticipantList,
  Chat,
  Waiting,
  Submitting,
  Voting,
  End,
} from "~/components/lobby";
import { LobbyState } from "~/api/types/enums/lobby-state";
import { queryKeys } from "~/api/query-keys";

export default function Lobby() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { connection } = use(RealtimeContext);

  const [lobby, setLobby] = useState<LobbyWithParticipants | null>(null);

  const joinMutation = useMutation({
    mutationFn() {
      return connection!.invoke<LobbyWithParticipants>("Join", id);
    },
    retry: 5,
    retryDelay: 1000,
    onSuccess(lobby) {
      if (lobby) {
        setLobby(lobby);
        queryClient.setQueryData(queryKeys.lobbies.detail(lobby.id), lobby);
      }
    },
    onError(err) {
      console.error(err);
    },
  });

  const navigate = useNavigate();

  const leaveMutation = useMutation({
    mutationFn() {
      return connection!.invoke("Leave", id);
    },
    onSuccess() {
      navigate("/");
    },
    onError(err) {
      console.error(err);
    },
  });

  useEffect(() => {
    if (connection && id && !lobby) {
      joinMutation.mutate();
    }
  }, [connection, id, lobby]);

  useEffect(() => {
    if (!connection) return;

    function handleEnded(submissionId: string | null) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          state: LobbyState.Ended,
          winningSubmissionId: prev.winningSubmissionId ?? submissionId,
        };
      });
    }

    connection.on("Ended", handleEnded);
    return () => {
      connection.off("Ended", handleEnded);
    };
  }, [connection, setLobby]);

  const StateView =
    lobby &&
    {
      [LobbyState.Waiting]: Waiting,
      [LobbyState.Submitting]: Submitting,
      [LobbyState.Voting]: Voting,
      [LobbyState.Ended]: End,
    }[lobby.state];

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-7xl flex-1 w-full flex gap-8">
      {!lobby ? (
        <LoadingFallback className="m-auto" />
      ) : (
        <LobbyContext value={{ lobby, setLobby }}>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{lobby.name}</h1>
              <button
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {leaveMutation.isPending ? <LoadingFallback /> : "Leave"}
              </button>
            </div>
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
              <p>{lobby.submissionTime}</p>
            </div>

            <ParticipantList />
          </div>

          <div className="flex-1">{StateView && <StateView />}</div>

          <div className="flex-1">
            <Chat />
          </div>
        </LobbyContext>
      )}
    </main>
  );
}
