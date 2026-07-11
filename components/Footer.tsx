import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.text}>
          © {new Date().getFullYear()} BellaOS – Photo &amp; Video Platform
        </p>
        <p className={styles.sub}>Built with Next.js</p>
      </div>
    </footer>
  );
}
