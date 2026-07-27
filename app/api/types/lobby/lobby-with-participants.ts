import type { LobbyState } from "../enums/lobby-state";
import type { Genre } from "../genre/genre";
import type { Participation } from "../participation";

export interface LobbyWithParticipants {
  id: string;
  name: string;
  participantLimit: number;
  submissionTime: string;
  state: LobbyState;

  createdAt: string;
  submissionStartedAt: string;
  votingStartedAt: string;
  endedAt: string;

  genre: Genre;
  ownerId: string;
  participants: Participation[];
}
