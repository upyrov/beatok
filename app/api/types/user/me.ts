import type { UserRole } from "../enums/user-role";

export interface Me {
  id: string;
  name: string;
  role: UserRole;
  rating: number;
  picture: string | null;
}
