import type { HubConnection } from "@microsoft/signalr";
import { createContext } from "react";

export interface IRealtimeContext {
  connection: HubConnection | null;
}

export const RealtimeContext = createContext<IRealtimeContext>({
  connection: null,
});
