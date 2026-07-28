import type { Category } from "../category/category";

export interface SoundWithCategory {
  id: string;
  value: string;
  category: Category;
}
