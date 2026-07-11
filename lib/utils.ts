import type { MediaItem } from "@/types";

export function getAllMedia(
  photos: MediaItem[],
  videos: MediaItem[]
): MediaItem[] {
  return [...photos, ...videos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function filterByTag(items: MediaItem[], tag: string): MediaItem[] {
  return items.filter((item) => item.tags?.includes(tag));
}

export function getUniqueTags(items: MediaItem[]): string[] {
  const tags = new Set<string>();
  items.forEach((item) => item.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}
