import { use, useEffect, useState } from "react";
import { useParams } from "react-router";
import { RealtimeContext } from "~/contexts";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import { useJoinLobby } from "~/api/lobbies";

export default function Lobby() {
  const { id } = useParams();
  const { connection, isConnected } = use(RealtimeContext);
  const [lobby, setLobby] = useState<LobbyWithParticipants | null>(null);
  const joinLobby = useJoinLobby();

  useEffect(() => {
    if (isConnected && connection && id) {
      joinLobby
        .mutateAsync(id)
        .catch((err) => {
          console.error("Failed to join via API (might already be joined):", err);
        })
        .then(() => connection.invoke<LobbyWithParticipants>("Join", id))
        .then((joinedLobby) => {
          if (joinedLobby) {
            console.log(`Joined lobby ${id}`);
            setLobby(joinedLobby);
          }
        })
        .catch((err) => console.error("Failed to join lobby realtime:", err));
    }
  }, [isConnected, connection, id]);

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-7xl min-h-screen">
      {!lobby ? (
        <p>Joining lobby...</p>
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{lobby.name}</h1>
          <div className="flex gap-8">
            <div>
              <p className="font-semibold">Host</p>
              <p>{lobby.owner.name}</p>
            </div>
            <div>
              <p className="font-semibold">Genre</p>
              <p>{lobby.genre.name}</p>
            </div>
            <div>
              <p className="font-semibold">Players</p>
              <p>{lobby.participants.length} / {lobby.participantLimit}</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="font-semibold">Created</p>
              <p>{dateFormatter.format(new Date(lobby.createdAt))}</p>
            </div>
            <div>
              <p className="font-semibold">Submission Deadline</p>
              <p>{dateFormatter.format(new Date(lobby.submissionTimeLimit))}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Participants</h2>
            <ul className="flex flex-col gap-2">
              {lobby.participants.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
