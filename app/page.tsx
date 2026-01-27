import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Shopping Spree</h1>

      <div className={styles.buttonGroup}>
        <Link href="/game?mode=daily" className={styles.menuButton}>
          Daily Earning
        </Link>
        <Link href="/game?mode=weekly" className={styles.menuButton}>
          Weekly Challenge
        </Link>
        <Link href="/store" className={styles.menuButton}>
          My Store
        </Link>
      </div>
    </div>
  );
}
