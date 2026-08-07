import { HubConnectionState } from "@microsoft/signalr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { use, useCallback, useEffect, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { queryKeys } from "~/api/query-keys";
import { LobbyState } from "~/api/types/enums/lobby-state";
import type { DetailedLobby } from "~/api/types/lobby/detailed-lobby";
import type { Me } from "~/api/types/user/me";
import { ActionButton } from "~/components/action-button";
import { Fallback } from "~/components/fallback";
import { Chat } from "~/components/lobby/chat";
import { End } from "~/components/lobby/end";
import { ParticipantList } from "~/components/lobby/participant-list";
import { Submitting } from "~/components/lobby/submitting";
import { Voting } from "~/components/lobby/voting";
import { Waiting } from "~/components/lobby/waiting";
import { LobbyContext } from "~/contexts";

export default function Lobby() {
  const { connection, lobby, setLobby } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();

  const { id } = useParams();
  const queryClient = useQueryClient();

  const joinAttemptId = useRef<string | null>(null);

  const navigate = useNavigate();

  const joinMutation = useMutation({
    mutationFn() {
      return connection?.state !== HubConnectionState.Connected
        ? Promise.reject(new Error("Connection is not established"))
        : connection.invoke<DetailedLobby>("Join", id);
    },
    retry: 5,
    retryDelay: 1000,
    onSuccess(lobby) {
      if (lobby) {
        setLobby(lobby);
        queryClient.setQueryData(queryKeys.lobbies.detail(lobby.id), lobby);
      }
    },
    onError(error) {
      console.error(error);
    },
  });
  const leaveMutation = useMutation({
    mutationFn() {
      return connection!.invoke("Leave", id);
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.list({}) });
      navigate("/");
    },
    onError(error) {
      console.error(error);
    },
  });

  const handleLeave = useCallback(
    () => leaveMutation.mutate(),
    [leaveMutation.mutate],
  );

  useEffect(() => {
    if (user && connection && id && !lobby && joinAttemptId.current !== id) {
      joinAttemptId.current = id;
      joinMutation.mutate();
    }
  }, [user, connection, id, lobby, joinMutation.mutate]);

  useEffect(() => {
    if (!user || !connection) return;

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
  }, [user, connection, setLobby]);

  const StateView =
    lobby &&
    {
      [LobbyState.Waiting]: Waiting,
      [LobbyState.Submitting]: Submitting,
      [LobbyState.Voting]: Voting,
      [LobbyState.Ended]: End,
    }[lobby.state];

  return (
    <main className="container mx-auto p-4 max-w-7xl flex-1 w-full flex gap-8">
      {!lobby ? (
        <Fallback className="m-auto" />
      ) : (
        <>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{lobby.name}</h1>
              <ActionButton
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? <Fallback /> : "Leave"}
              </ActionButton>
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
        </>
      )}
    </main>
  );
}
