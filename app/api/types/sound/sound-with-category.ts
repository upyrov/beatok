import type { Category } from "../category/category";

export interface SoundWithCategory {
  id: string;
  name: string;
  value: string;
  category: Category;
}
