export interface CategoryUpdate {
  name?: string;
  randomSoundsCount?: number;
}

export interface Category {
  id: string;
  name: string;
  randomSoundsCount: number;
}

export interface CreateCategory {
  name: string;
  kitId: string;
  randomSoundsCount: number;
}
