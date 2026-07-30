import { useEffect, use } from "react";
import { RealtimeContext } from "~/contexts";
import { useOutletContext } from "react-router";
import type { User } from "~/api/types/user/user";
import { LobbyContext } from "~/contexts";

export function ParticipantList() {
  const { lobby, setLobby } = use(LobbyContext);
  const { connection } = use(RealtimeContext);
  const { user } = useOutletContext<{ user: User | null }>();

  useEffect(() => {
    if (!connection) return;

    function handleParticipantConnected(userId: string) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user.id === userId ? { ...p, isConnected: true } : p,
          ),
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

    connection.on("ParticipantRejoined", handleParticipantConnected);
    connection.on("ParticipantLeft", handleParticipantLeft);

    return () => {
      connection.off("ParticipantRejoined", handleParticipantConnected);
      connection.off("ParticipantLeft", handleParticipantLeft);
    };
  }, [connection, setLobby]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Participants</h2>
      <ul className="flex flex-col gap-2">
        {lobby?.participants.map((p) => (
          <li key={p.id}>
            {p.user.name}{" "}
            {!p.isConnected && (
              <span className="text-gray-400 text-sm">(Disconnected)</span>
            )}
            {p.user.id === lobby.ownerId && (
              <span className="text-gray-400 text-sm">(Owner)</span>
            )}
            {p.user.id === user?.id && (
              <span className="text-gray-400 text-sm">(You)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
