import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import { RealtimeContext } from "./realtime-context";
import { Outlet } from "react-router";

export default function RealtimeLayout() {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_API_BASE_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;
    connection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log("Realtime Connected!");
      })
      .catch((err) => console.error("Realtime Connection failed: ", err));

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
