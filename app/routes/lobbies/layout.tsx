import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import type { DetailedLobby } from "~/api/types/lobby/detailed-lobby";
import { LobbyContext } from "~/contexts";
import { auth } from "~/lib/firebase";

export default function Layout() {
  const context = useOutletContext();

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lobby, setLobby] = useState<DetailedLobby | null>(null);

  useEffect(() => {
    let isActive = true;
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/lobby`, {
        withCredentials: true,
        accessTokenFactory: async () => {
          await auth.authStateReady();
          return auth.currentUser?.getIdToken() ?? "";
        },
      })
      .configureLogging(LogLevel.Warning)
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
