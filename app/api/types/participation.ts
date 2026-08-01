import type { Score } from "./score/score";
import type { User } from "./user/user";

export interface Participation {
  id: string;
  isConnected: boolean;
  user: User;
  scores?: Score[];
}
