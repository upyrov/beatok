import type { Genre } from "../genre/genre";

export interface Kit {
  id: string;
  name: string;
  genres: Genre[];
}
