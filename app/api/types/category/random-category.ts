import type { Sound } from "../sound/sound";

export interface RandomCategory {
  id: string;
  name: string;
  sounds: Sound[];
}
