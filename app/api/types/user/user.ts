import type { UserRole } from "../enums/user-role";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
