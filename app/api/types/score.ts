export interface CreateScore {
	value: number;
	submissionId: string;
}

export interface ScoreUpdate {
	value: number;
}

export interface Score {
	id: string;
	value: string;
	participationId: string;
	submissionId: string;
}
