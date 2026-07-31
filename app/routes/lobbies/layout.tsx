import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { RealtimeContext } from "~/contexts";
import { Outlet, useOutletContext } from "react-router";

export default function Layout() {
  const context = useOutletContext();

  const [connection, setConnection] = useState<HubConnection | null>(null);

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
    <RealtimeContext value={{ connection }}>
      <Outlet context={context} />
    </RealtimeContext>
  );
}
