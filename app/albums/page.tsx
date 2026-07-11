import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AlbumCard from "@/components/AlbumCard";
import { sampleAlbums } from "@/lib/data";
import styles from "./page.module.css";

export const metadata = {
  title: "Albums – BellaOS",
};

export default function AlbumsPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Albums</h1>
          <p className={styles.pageSubtitle}>
            Organized collections of your best memories.
          </p>
          <div className={styles.grid}>
            {sampleAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
