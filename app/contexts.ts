import type { HubConnection } from "@microsoft/signalr";
import { createContext } from "react";
import type { LobbyWithParticipants } from "./api/types/lobby/lobby-with-participants";

export interface IRealtimeContext {
  connection: HubConnection | null;
}

export const RealtimeContext = createContext<IRealtimeContext>({
  connection: null,
});

export interface ILobbyContext {
  lobby: LobbyWithParticipants | null;
  setLobby: React.Dispatch<React.SetStateAction<LobbyWithParticipants | null>>;
}

export const LobbyContext = createContext<ILobbyContext>({
  lobby: null,
  setLobby: () => {},
});
