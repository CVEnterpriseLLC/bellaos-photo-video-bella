import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MediaGrid from "@/components/MediaGrid";
import { samplePhotos, sampleVideos } from "@/lib/data";
import { getAllMedia } from "@/lib/utils";
import styles from "./page.module.css";

export const metadata = {
  title: "Gallery – BellaOS",
};

export default function GalleryPage() {
  const allMedia = getAllMedia(samplePhotos, sampleVideos);

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Gallery</h1>
          <p className={styles.pageSubtitle}>
            Browse all photos and videos in your collection.
          </p>
          <MediaGrid items={allMedia} showFilter />
        </div>
      </main>
      <Footer />
    </div>
  );
}
