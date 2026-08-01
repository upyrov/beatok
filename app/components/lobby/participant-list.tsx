import { use, useEffect } from "react";
import { useOutletContext } from "react-router";
import type { Participation } from "~/api/types/participation";
import type { Me } from "~/api/types/user/me";
import { UserCard } from "~/components/user-card";
import { LobbyContext } from "~/contexts";

export function ParticipantList() {
  const { lobby, setLobby, connection } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();

  useEffect(() => {
    if (!connection) return;

    function handleParticipantJoined(p: Participation) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: [...prev.participants, p],
        };
      });
    }

    function handleParticipantLeft(userId: string) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.filter((p) => p.user.id !== userId),
        };
      });
    }

    connection.on("ParticipantJoined", handleParticipantJoined);
    connection.on("ParticipantLeft", handleParticipantLeft);

    return () => {
      connection.off("ParticipantJoined", handleParticipantJoined);
      connection.off("ParticipantLeft", handleParticipantLeft);
    };
  }, [connection, setLobby]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Participants</h2>
      <ul className="flex flex-col gap-2">
        {lobby?.participants.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <UserCard user={p.user} size="sm" />
            <div className="flex gap-1 text-sm">
              {!p.isConnected && (
                <span className="text-gray-400">(Disconnected)</span>
              )}
              {p.user.id === lobby.ownerId && (
                <span className="text-gray-400">(Owner)</span>
              )}
              {p.user.id === user?.id && (
                <span className="text-gray-400">(You)</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
