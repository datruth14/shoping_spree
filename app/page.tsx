import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.logoContainer}>
          <span className={styles.logo}>🛒</span>
        </div>
        <h1 className={styles.title}>Shopping Spree</h1>
        <p className={styles.subtitle}>
          Match products, earn coins, and unlock amazing rewards in this addictive puzzle game!
        </p>
        <Link href="/home" className={styles.playButton}>
          <span className={styles.playIcon}>🎮</span>
          Play Now
        </Link>

        <div className={styles.scrollIndicator}>
          <span className={styles.scrollIcon}>⬇️</span>
        </div>
      </section>

      {/* How to Play Section */}
      <section className={styles.rulesSection}>
        <h2 className={styles.sectionTitle}>📖 How to Play</h2>
        <div className={styles.rulesGrid}>
          <div className={styles.ruleCard}>
            <span className={styles.ruleIcon}>👆</span>
            <h3 className={styles.ruleTitle}>Select & Swap</h3>
            <p className={styles.ruleDescription}>
              Tap on any product tile to select it, then tap another tile to swap their positions.
              Create matches to score points!
            </p>
          </div>

          <div className={styles.ruleCard}>
            <span className={styles.ruleIcon}>🔗</span>
            <h3 className={styles.ruleTitle}>Match 3 or More</h3>
            <p className={styles.ruleDescription}>
              Line up 3 or more identical products horizontally or vertically to make them disappear
              and earn points.
            </p>
          </div>

          <div className={styles.ruleCard}>
            <span className={styles.ruleIcon}>⚡</span>
            <h3 className={styles.ruleTitle}>Special Combos</h3>
            <p className={styles.ruleDescription}>
              Match 4 products to create a striped tile that clears an entire row or column!
              Match 5 for a powerful wrapped tile!
            </p>
          </div>

          <div className={styles.ruleCard}>
            <span className={styles.ruleIcon}>🎯</span>
            <h3 className={styles.ruleTitle}>Limited Moves</h3>
            <p className={styles.ruleDescription}>
              You have 30 moves to score as high as possible. Plan your swaps wisely to maximize
              your points!
            </p>
          </div>

          <div className={styles.ruleCard}>
            <span className={styles.ruleIcon}>📅</span>
            <h3 className={styles.ruleTitle}>Daily Earning</h3>
            <p className={styles.ruleDescription}>
              Play daily to earn coins. Every match adds to your balance that you can spend
              in the store!
            </p>
          </div>

          <div className={styles.ruleCard}>
            <span className={styles.ruleIcon}>🏆</span>
            <h3 className={styles.ruleTitle}>Weekly Challenge</h3>
            <p className={styles.ruleDescription}>
              Compete in the weekly challenge to beat your high score and unlock exclusive
              rewards!
            </p>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>🎁 Products to Match</h2>
        <div className={styles.productsGrid}>
          <div className={styles.productCard}>
            <Image
              src="/assets/phone.jpg"
              alt="Phone"
              width={80}
              height={80}
              className={styles.productImage}
            />
            <p className={styles.productName}>Phone</p>
          </div>
          <div className={styles.productCard}>
            <Image
              src="/assets/tv.jpg"
              alt="TV"
              width={80}
              height={80}
              className={styles.productImage}
            />
            <p className={styles.productName}>TV</p>
          </div>
          <div className={styles.productCard}>
            <Image
              src="/assets/watch.jpg"
              alt="Watch"
              width={80}
              height={80}
              className={styles.productImage}
            />
            <p className={styles.productName}>Watch</p>
          </div>
          <div className={styles.productCard}>
            <Image
              src="/assets/earbuds.jpg"
              alt="Earbuds"
              width={80}
              height={80}
              className={styles.productImage}
            />
            <p className={styles.productName}>Earbuds</p>
          </div>
          <div className={styles.productCard}>
            <Image
              src="/assets/ovaltine.jpg"
              alt="Ovaltine"
              width={80}
              height={80}
              className={styles.productImage}
            />
            <p className={styles.productName}>Ovaltine</p>
          </div>
          <div className={styles.productCard}>
            <Image
              src="/assets/milk.jpg"
              alt="Milk"
              width={80}
              height={80}
              className={styles.productImage}
            />
            <p className={styles.productName}>Milk</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to Start Your Shopping Spree?</h2>
        <Link href="/home" className={styles.ctaButton}>
          🚀 Start Playing
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Shopping Spree. Match, Earn, Win!</p>
      </footer>
    </div>
  );
}
