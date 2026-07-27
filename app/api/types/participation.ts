import type { User } from "./user/user";

export interface Participation {
  id: string;
  isConnected: boolean;
  user: User;
}
