import type { User } from "./user/user";
import type { Score } from "./score/score";

export interface Participation {
  id: string;
  isConnected: boolean;
  user: User;
  scores?: Score[];
}
