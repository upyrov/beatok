import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import type { DetailedLobby } from "~/api/types/lobby";
import { LobbyContext } from "~/contexts";
import { ensureAnonymouslySignedIn } from "~/hooks/use-auth";
import { auth } from "~/lib/firebase";

export const handle = { sitemap: () => [] };

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

        connection.on("Error", (errorDto: { message: string }) => {
          window.dispatchEvent(
            new CustomEvent("globalerror", { detail: errorDto.message }),
          );
        });

        if (isActive) {
          newConnection = connection;
          setConnection(connection);
        } else {
          connection.stop();
        }
      } catch (error) {
        window.dispatchEvent(
          new CustomEvent("globalerror", {
            detail:
              error instanceof Error
                ? error.message
                : "Socket connection failed",
          }),
        );
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
