import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import { RealtimeContext } from "./contexts";
import { Outlet } from "react-router";

export default function Layout() {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/lobby`)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;
    connection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log("Lobby Connected!");
      })
      .catch((err) => console.error("Lobby connection failed: ", err));

    return () => {
      connectionRef.current?.stop();
    };
  }, []);

  return (
    <RealtimeContext value={{ connection: connectionRef.current, isConnected }}>
      <Outlet />
    </RealtimeContext>
  );
}
