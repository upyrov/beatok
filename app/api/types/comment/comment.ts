import type { User } from "../user/user";

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}
