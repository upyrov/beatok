import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { useStore } from "zustand";
import { ensureAnonymouslySignedIn } from "~/hooks/use-auth";
import { auth } from "~/lib/firebase";
import { LobbyContext, createLobbyStore } from "~/stores/lobby";

export const handle = { sitemap: () => [] };

export default function Layout() {
  const context = useOutletContext();

  const [store] = useState(() => createLobbyStore());
  const setConnection = useStore(store, (s) => s.setConnection);

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

        connection.on("Error", (errorDto: { message: string }) => {});

        if (isActive) {
          newConnection = connection;
          setConnection(connection);
        } else {
          connection.stop();
        }
      } catch (error) {}
    }

    getHubConnection();

    return () => {
      isActive = false;
      newConnection?.stop();
    };
  }, [setConnection]);

  return (
    <LobbyContext value={store}>
      <Outlet context={context} />
    </LobbyContext>
  );
}
