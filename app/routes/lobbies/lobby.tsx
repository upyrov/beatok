import { useMutation, useQueryClient } from "@tanstack/react-query";
import { use, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { queryKeys } from "~/api/query-keys";
import { LobbyState } from "~/api/types/enums/lobby-state";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import type { Me } from "~/api/types/user/me";
import { Fallback } from "~/components/fallback";
import { Chat } from "~/components/lobby/chat";
import { End } from "~/components/lobby/end";
import { ParticipantList } from "~/components/lobby/participant-list";
import { Submitting } from "~/components/lobby/submitting";
import { Voting } from "~/components/lobby/voting";
import { Waiting } from "~/components/lobby/waiting";
import { LobbyContext } from "~/contexts";

export default function Lobby() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { connection, lobby, setLobby } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();

  if (!user) {
    return (
      <main className="container mx-auto p-4 md:p-8 max-w-7xl flex-1 w-full flex gap-8">
        <span>You need to have cookies enabled to join the lobby</span>
      </main>
    );
  }

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
    onError(error) {
      console.error(error);
    },
  });

  const navigate = useNavigate();

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
    [leaveMutation],
  );

  useEffect(() => {
    if (connection && id && !lobby) {
      joinMutation.mutate();
    }
  }, [connection, id, lobby, joinMutation]);

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
        <Fallback className="m-auto" />
      ) : (
        <>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{lobby.name}</h1>
              <button
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {leaveMutation.isPending ? <Fallback /> : "Leave"}
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
        </>
      )}
    </main>
  );
}
