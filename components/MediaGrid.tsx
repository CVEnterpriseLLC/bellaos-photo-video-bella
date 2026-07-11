"use client";

import { useState } from "react";
import Image from "next/image";
import type { MediaItem, MediaFilter } from "@/types";
import { formatDate, formatDuration } from "@/lib/data";
import styles from "./MediaGrid.module.css";

interface MediaGridProps {
  items: MediaItem[];
  showFilter?: boolean;
}

export default function MediaGrid({ items, showFilter = true }: MediaGridProps) {
  const [filter, setFilter] = useState<MediaFilter>("all");

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div>
      {showFilter && (
        <div className={styles.filters}>
          {(["all", "photo", "video"] as MediaFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ""}`}
            >
              {f === "all" ? "All" : f === "photo" ? "Photos" : "Videos"}
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {filtered.map((item) => (
          <article key={item.id} className={styles.card}>
            <div className={styles.media}>
              {item.type === "photo" ? (
                <Image
                  src={item.thumbnailUrl ?? item.url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={styles.image}
                />
              ) : (
                <>
                  <Image
                    src={item.thumbnailUrl ?? "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.image}
                  />
                  <span className={styles.videoBadge}>
                    ▶ {item.duration ? formatDuration(item.duration) : "Video"}
                  </span>
                </>
              )}
            </div>
            <div className={styles.info}>
              <h3 className={styles.title}>{item.title}</h3>
              {item.description && (
                <p className={styles.description}>{item.description}</p>
              )}
              <time className={styles.date}>{formatDate(item.createdAt)}</time>
              {item.tags && item.tags.length > 0 && (
                <div className={styles.tags}>
                  {item.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <p>No {filter === "all" ? "media" : filter + "s"} found.</p>
        </div>
      )}
    </div>
  );
}
