import type { LobbyState } from "./enums";
import type { Genre } from "./genre";
import type { LobbyPlaybackItem } from "./lobby-playback-item";
import type { Participation } from "./participation";
import type { SoundWithCategory } from "./sound";
import type { Submission } from "./submission";
import type { User } from "./user";

export interface CreateLobby {
  name: string;
  participantLimit: number;
  submissionTime: string;
  genreId: string;
}

export interface DetailedLobby {
  id: string;
  name: string;
  participantLimit: number;
  state: LobbyState;

  submissionTime: string;
  votingTime: string;

  createdAt: string;
  submissionStartedAt: string;
  votingStartedAt: string;
  endedAt: string;

  genre: Genre;
  ownerId: string;
  participants: Participation[];
  sounds: SoundWithCategory[];
  submissions: Submission[];
  winningSubmissionId: string | null;
  currentPlaybackItem?: LobbyPlaybackItem;
}

export interface Lobby {
  id: string;
  name: string;
  participantCount: number;
  participantLimit: number;
  submissionTime: string;
  createdAt: string;
  genre: Genre;
  owner: User;
  isJoined: boolean;
}

export interface LobbyFilter {
  name?: string | null;
  genreId?: string | null;
}

export interface ArchivedLobby {
  id: string;
  name: string;

  genre: Genre;

  participantCount: number;
  isWinner: boolean;

  createdAt: string;
  submissionStartedAt: string;
  votingStartedAt: string;
  endedAt: string;
}
