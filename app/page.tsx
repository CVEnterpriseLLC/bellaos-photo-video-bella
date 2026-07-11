import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MediaGrid from "@/components/MediaGrid";
import AlbumCard from "@/components/AlbumCard";
import { samplePhotos, sampleVideos, sampleAlbums } from "@/lib/data";
import { getAllMedia } from "@/lib/utils";
import styles from "./page.module.css";

export default function HomePage() {
  const allMedia = getAllMedia(samplePhotos, sampleVideos);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroAccent}>✦</span> BellaOS
            </h1>
            <p className={styles.heroSubtitle}>
              Capture, curate, and share your most beautiful moments.
              <br />
              Your personal photo &amp; video platform.
            </p>
          </div>
        </section>

        <div className={styles.container}>
          {/* Recent Media */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Media</h2>
            <MediaGrid items={allMedia} showFilter />
          </section>

          {/* Albums */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Albums</h2>
            <div className={styles.albumGrid}>
              {sampleAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
