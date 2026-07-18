import type { HubConnection } from "@microsoft/signalr";
import { createContext } from "react";

interface IRealtimeContext {
  connection: HubConnection | null;
  isConnected: boolean;
}

export const RealtimeContext = createContext<IRealtimeContext>({
  connection: null,
  isConnected: false,
});
