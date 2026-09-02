import type { Score } from "./score";
import type { User } from "./user";

export interface Participation {
	id: string;
	isConnected: boolean;
	user: User;
	scores?: Score[];
}
