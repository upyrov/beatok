import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import { LobbyContext } from "~/contexts";

export default function Layout() {
  const context = useOutletContext();

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lobby, setLobby] = useState<LobbyWithParticipants | null>(null);

  useEffect(() => {
    let isActive = true;
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/lobby`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => {
        if (isActive) {
          setConnection(newConnection);
        } else {
          newConnection.stop();
        }
      })
      .catch((error) => console.error(error));

    return () => {
      isActive = false;
      newConnection.stop();
    };
  }, []);

  return (
    <LobbyContext value={{ lobby, setLobby, connection }}>
      <Outlet context={context} />
    </LobbyContext>
  );
}
