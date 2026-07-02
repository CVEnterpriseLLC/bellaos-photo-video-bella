import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>✦</span>
          BellaOS
        </Link>
        <ul className={styles.links}>
          <li>
            <Link href="/" className={styles.link}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/gallery" className={styles.link}>
              Gallery
            </Link>
          </li>
          <li>
            <Link href="/albums" className={styles.link}>
              Albums
            </Link>
          </li>
          <li>
            <Link href="/videos" className={styles.link}>
              Videos
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
