import type { HubConnection } from "@microsoft/signalr";
import { createContext } from "react";
import type { DetailedLobby } from "./api/types/lobby/detailed-lobby";

export interface ILobbyContext {
  lobby: DetailedLobby | null;
  setLobby: React.Dispatch<React.SetStateAction<DetailedLobby | null>>;
  connection: HubConnection | null;
}

export const LobbyContext = createContext<ILobbyContext>({
  lobby: null,
  setLobby: () => {},
  connection: null,
});
