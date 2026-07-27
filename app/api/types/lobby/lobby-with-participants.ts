import type { LobbyPhase } from "../enums/lobby-phase";
import type { Genre } from "../genre/genre";
import type { Participation } from "../participation";

export interface LobbyWithParticipants {
  id: string;
  name: string;
  genre: Genre;
  ownerId: string;
  participantLimit: number;
  participants: Participation[];
  createdAt: string;
  startedAt?: string;
  submissionTimeLimit: string;
  phase: LobbyPhase;
}
