import Link from "next/link";
import styles from "./styles.module.css";

export default function SoccerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className={styles.navBar}>
        <Link href="/soccer/my-teams" className={styles.navLink}>
          My Teams
        </Link>
        <span className={styles.navDot}>•</span>
        <Link href="/soccer/fantasy-prem/players" className={styles.navLink}>
          Fantasy Players
        </Link>
        <span className={styles.navDot}>•</span>
        <Link href="/soccer/fantasy-prem/team" className={styles.navLink}>
          Fantasy Team
        </Link>
      </nav>
      {children}
    </div>
  );
}