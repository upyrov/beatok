export interface ActivityDay {
	date: string;
	count: number;
}

export interface Picture {
	url: string;
	key: string;
}

export interface Me {
	id: string;
	name: string;
	rating: number | null;
	picture: Picture | null;
	isAnonymous: boolean;
}

export interface PictureUpload {
	uploadUrl: string;
	fileKey: string;
}

export interface Profile extends User {
	activity: ActivityDay[];
	availableYears: number[];
	wins: number;
	winRate: number;
}

export interface RatingChange {
	userId: string;
	ratingChange: number;
}

export interface Signin {
	email: string;
	password: string;
}

export interface Signup {
	name: string;
	email: string;
	password: string;
}

export interface UserUpdate {
	name?: string;
	pictureKey?: string | null;
}

export interface User {
	id: string;
	name: string | null;
	rating: number;
	picture: Picture | null;
}

export interface LeaderboardUser extends User {
	wins: number;
}
