import { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { RealtimeContext, LobbyContext } from "~/contexts";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import { useJoinLobby } from "~/api/lobbies";
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

export default function Lobby() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { connection } = use(RealtimeContext);

  const [lobby, setLobby] = useState<LobbyWithParticipants | null>(null);

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
      console.error(err);
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

  const StateView =
    lobby &&
    {
      [LobbyState.Waiting]: Waiting,
      [LobbyState.Submitting]: Submitting,
      [LobbyState.Voting]: Voting,
      [LobbyState.Ended]: End,
    }[lobby.state];

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-7xl min-h-screen flex gap-8">
      {!lobby ? (
        <LoadingFallback className="m-auto" />
      ) : (
        <LobbyContext value={{ lobby, setLobby }}>
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
