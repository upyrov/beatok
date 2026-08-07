import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { ensureAnonymouslySignedIn } from "~/api/auth";
import type { DetailedLobby } from "~/api/types/lobby/detailed-lobby";
import { LobbyContext } from "~/contexts";
import { auth } from "~/lib/firebase";

export default function Layout() {
  const context = useOutletContext();

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lobby, setLobby] = useState<DetailedLobby | null>(null);

  useEffect(() => {
    let isActive = true;
    let newConnection: HubConnection | null = null;

    async function getHubConnection() {
      await auth.authStateReady();
      await ensureAnonymouslySignedIn();

      if (!isActive) return;

      const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_BASE_URL}/lobby`, {
          withCredentials: true,
          accessTokenFactory: () => auth.currentUser?.getIdToken() ?? "",
        })
        .configureLogging(LogLevel.Warning)
        .withAutomaticReconnect()
        .build();

      try {
        await connection.start();

        if (isActive) {
          newConnection = connection;
          setConnection(connection);
        } else {
          connection.stop();
        }
      } catch (error) {
        console.error(error);
      }
    }

    getHubConnection();

    return () => {
      isActive = false;
      newConnection?.stop();
    };
  }, []);

  return (
    <LobbyContext value={{ lobby, setLobby, connection }}>
      <Outlet context={context} />
    </LobbyContext>
  );
}
