import { LobbyPhase } from "../enums/lobby-phase";
import type { Genre } from "../genre/genre";
import type { User } from "../user/user";

export interface Lobby {
  id: string;
  name: string;
  genre: Genre;
  owner: User;
  participantLimit: number;
  participantCount: number;
  createdAt: string;
  startedAt?: string;
  submissionTimeLimit: string;
}
