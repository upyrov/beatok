import type { HubConnection } from "@microsoft/signalr";
import { createContext } from "react";
import type { LobbyWithParticipants } from "./api/types/lobby/lobby-with-participants";

export interface ILobbyContext {
  lobby: LobbyWithParticipants | null;
  setLobby: React.Dispatch<React.SetStateAction<LobbyWithParticipants | null>>;
  connection: HubConnection | null;
}

export const LobbyContext = createContext<ILobbyContext>({
  lobby: null,
  setLobby: () => {},
  connection: null,
});
