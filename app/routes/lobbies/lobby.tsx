import { HubConnectionState } from "@microsoft/signalr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { queryKeys } from "~/api/query-keys";
import { LobbyState } from "~/api/types/enums";
import type { DetailedLobby } from "~/api/types/lobby";
import type { Me, RatingChange } from "~/api/types/user";
import { ActionButton } from "~/components/action-button";
import { Chat } from "~/components/lobby/chat";
import { End } from "~/components/lobby/end";
import { ParticipantList } from "~/components/lobby/participant-list";
import { Submitting } from "~/components/lobby/submitting";
import { Voting } from "~/components/lobby/voting";
import { Waiting } from "~/components/lobby/waiting";
import { LobbyContext } from "~/contexts";
import type { Route } from "./+types/lobby";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Lobby" },
    {
      name: "description",
      content: "Join the beat battle and compete or vote for the best beats.",
    },
  ];
}

export default function Lobby() {
  const { connection, lobby, setLobby } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();

  const { id } = useParams();
  const queryClient = useQueryClient();

  const [ratingChanges, setRatingChanges] = useState<RatingChange[]>([]);

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

      import("~/lib/notification").then((m) =>
        m.requestNotificationPermission(),
      );
    }
  }, [user, connection, id, lobby, joinMutation.mutate]);

  useEffect(() => {
    if (!user || !connection) return;

    function handleEnded(
      submissionId: string | null,
      ratingChangesData: RatingChange[],
    ) {
      setRatingChanges(ratingChangesData);
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
    <main className="container mx-auto p-4 max-w-7xl flex-1 w-full flex flex-col lg:flex-row gap-8">
      {!lobby ? (
        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Column 1: Info and Participants */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="system-skeleton w-48 h-8 rounded-lg" />
              <div className="system-skeleton w-24 h-10 rounded-lg" />
            </div>
            <div className="flex gap-8 mt-2">
              <div className="flex flex-col gap-2">
                <div className="system-skeleton w-16 h-5 rounded" />
                <div className="system-skeleton w-24 h-5 rounded" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="system-skeleton w-16 h-5 rounded" />
                <div className="system-skeleton w-12 h-5 rounded" />
              </div>
            </div>
            <div className="flex flex-col gap-8 mt-2">
              <div className="flex flex-col gap-2">
                <div className="system-skeleton w-32 h-5 rounded" />
                <div className="system-skeleton w-20 h-5 rounded" />
              </div>
            </div>
            <div className="bg-muted border border-muted-border rounded-xl p-4 mt-2">
              <div className="system-skeleton w-32 h-6 rounded mb-4" />
              <ul className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="system-skeleton w-8 h-8 rounded-full" />
                    <div className="system-skeleton w-24 h-5 rounded" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2: State View */}
          <div className="flex-1">
            <div className="system-skeleton w-full h-125 rounded-xl" />
          </div>

          {/* Column 3: Chat */}
          <div className="flex-1 flex flex-col border border-muted-border rounded-xl bg-muted overflow-hidden h-150 shrink-0">
            <div className="p-4 border-b border-muted-border">
              <div className="system-skeleton w-16 h-6 rounded" />
            </div>
            <div className="flex-1 p-4 flex flex-col gap-4 justify-end">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="system-skeleton w-8 h-8 rounded-full shrink-0" />
                  <div className="system-skeleton w-full h-12 rounded" />
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-muted-border flex gap-2">
              <div className="system-skeleton flex-1 h-10 rounded" />
              <div className="system-skeleton w-16 h-10 rounded" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{lobby.name}</h1>
              <ActionButton
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
                pending={leaveMutation.isPending}
              >
                Leave
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

            <ParticipantList ratingChanges={ratingChanges} />
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
