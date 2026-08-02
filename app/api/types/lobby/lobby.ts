import type { Genre } from "../genre/genre";
import type { User } from "../user/user";

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
