import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { LobbyContext } from "~/contexts";
import { Outlet, useOutletContext } from "react-router";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";

export default function Layout() {
  const context = useOutletContext();

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lobby, setLobby] = useState<LobbyWithParticipants | null>(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/lobby`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => setConnection(newConnection))
      .catch((err) => console.error("Realtime connection failed: ", err));

    return () => {
      newConnection.stop();
    };
  }, []);

  return (
    <LobbyContext value={{ connection, lobby, setLobby }}>
      <Outlet context={context} />
    </LobbyContext>
  );
}
