export interface MediaItem {
  id: string;
  type: "photo" | "video";
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
  tags?: string[];
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  itemCount: number;
  createdAt: string;
  items?: MediaItem[];
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
}

export type MediaFilter = "all" | "photo" | "video";
