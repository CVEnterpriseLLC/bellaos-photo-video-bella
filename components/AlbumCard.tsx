import Image from "next/image";
import Link from "next/link";
import type { Album } from "@/types";
import styles from "./AlbumCard.module.css";

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/albums/${album.id}`} className={styles.card}>
      <div className={styles.cover}>
        {album.coverUrl ? (
          <Image
            src={album.coverUrl}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>✦</div>
        )}
        <span className={styles.count}>{album.itemCount} items</span>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{album.title}</h3>
        {album.description && (
          <p className={styles.description}>{album.description}</p>
        )}
      </div>
    </Link>
  );
}
