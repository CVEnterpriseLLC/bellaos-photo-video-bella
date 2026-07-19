import type { MediaItem, Album } from "@/types";

export const samplePhotos: MediaItem[] = [
  {
    id: "photo-1",
    type: "photo",
    title: "Golden Hour",
    description: "Sunset over the mountains",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    width: 800,
    height: 600,
    createdAt: "2024-03-15T18:30:00Z",
    tags: ["nature", "sunset", "mountains"],
  },
  {
    id: "photo-2",
    type: "photo",
    title: "City Lights",
    description: "Night skyline reflection",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
    width: 800,
    height: 533,
    createdAt: "2024-02-20T21:00:00Z",
    tags: ["city", "night", "lights"],
  },
  {
    id: "photo-3",
    type: "photo",
    title: "Ocean Serenity",
    description: "Calm waves at dawn",
    url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400",
    width: 800,
    height: 600,
    createdAt: "2024-01-10T06:15:00Z",
    tags: ["ocean", "dawn", "peaceful"],
  },
  {
    id: "photo-4",
    type: "photo",
    title: "Forest Path",
    description: "A walk through ancient trees",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400",
    width: 800,
    height: 1200,
    createdAt: "2024-04-05T11:00:00Z",
    tags: ["forest", "nature", "trees"],
  },
];

export const sampleVideos: MediaItem[] = [
  {
    id: "video-1",
    type: "video",
    title: "Timelapse Sunrise",
    description: "4K timelapse of sunrise over the Pacific",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400",
    duration: 30,
    createdAt: "2024-03-01T05:45:00Z",
    tags: ["timelapse", "sunrise", "4k"],
  },
  {
    id: "video-2",
    type: "video",
    title: "Waterfall Journey",
    description: "Exploring hidden waterfalls in the rainforest",
    url: "https://www.w3schools.com/html/movie.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400",
    duration: 45,
    createdAt: "2024-02-14T14:00:00Z",
    tags: ["waterfall", "rainforest", "adventure"],
  },
];

export const sampleAlbums: Album[] = [
  {
    id: "album-1",
    title: "Nature Collection",
    description: "Best nature shots from 2024",
    coverUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    itemCount: 24,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "album-2",
    title: "Urban Exploration",
    description: "City architecture and street photography",
    coverUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
    itemCount: 18,
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "album-3",
    title: "Ocean & Beach",
    description: "Coastal moments and seascapes",
    coverUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400",
    itemCount: 31,
    createdAt: "2024-03-01T00:00:00Z",
  },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
