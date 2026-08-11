import type { Category } from "./category";

export interface CreateSound {
  name: string;
  value: string;
  categoryId: string;
}

export interface SoundUpdate {
  name: string;
  value: string;
}

export interface SoundUpload {
  uploadUrl: string;
  fileKey: string;
}

export interface SoundWithCategory {
  id: string;
  name: string;
  value: string;
  category: Category;
}

export interface Sound {
  id: string;
  name: string;
  value: string;
}
