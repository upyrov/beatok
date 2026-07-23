import type { LobbyPhase } from "../enums/lobby-phase";
import type { Genre } from "../genre/genre";
import type { User } from "../user/user";

export interface LobbyWithParticipants {
  id: string;
  name: string;
  genre: Genre;
  owner: User;
  participantLimit: number;
  participants: User[];
  createdAt: string;
  submissionTimeLimit: string;
  phase: LobbyPhase;
}
