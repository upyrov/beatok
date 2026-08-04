import type { ActivityDay } from "./activity-day";
import type { User } from "./user";

export interface Profile extends User {
  activity: ActivityDay[];
  availableYears: number[];
}
