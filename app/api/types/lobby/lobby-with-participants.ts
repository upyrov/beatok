import type { LobbyState } from "../enums/lobby-state";
import type { Genre } from "../genre/genre";
import type { Participation } from "../participation";
import type { SoundWithCategory } from "../sound/sound-with-category";
import type { Submission } from "../submission/submission";

export interface LobbyWithParticipants {
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
}
