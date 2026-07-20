import type { User } from "../user/user";

export interface Submission {
  id: string;
  value: string;
  user: User;
  lobbyId: string;
}
