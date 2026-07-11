import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MediaGrid from "@/components/MediaGrid";
import { sampleVideos } from "@/lib/data";
import styles from "./page.module.css";

export const metadata = {
  title: "Videos – BellaOS",
};

export default function VideosPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Videos</h1>
          <p className={styles.pageSubtitle}>
            Your video collection in one place.
          </p>
          <MediaGrid items={sampleVideos} showFilter={false} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
