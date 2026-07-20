import { LobbyPhase } from "../enums/lobby-phase";

export interface Lobby {
  id: string;
  name: string;
  genreId: string;
  participantLimit: number;
  phase: LobbyPhase;
  createdAt: string;
  submissionTimeLimit: string;
  ownerId: string;
}
