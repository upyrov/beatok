import type { User } from "./user";

export interface Comment {
	id: string;
	author: User;
	content: string;
	createdAt: string;
}

export interface CreateComment {
	content: string;
}
