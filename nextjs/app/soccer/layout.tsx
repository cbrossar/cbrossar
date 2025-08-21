"use client";
import Link from "next/link";
import styles from "./styles.module.css";
import { usePathname } from "next/navigation";

export default function SoccerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isFantasyPremPlayers = pathname.includes("fantasy-prem/players");
    const isFantasyPremTeam = pathname.includes("fantasy-prem/team");
    const isFixtures = pathname.includes("fantasy-prem/fixtures");

    return (
        <div>
            <nav className={styles.navBar}>
                <Link
                    href="/soccer/fantasy-prem/players"
                    className={
                        isFantasyPremPlayers
                            ? styles.navLinkActive
                            : styles.navLink
                    }
                >
                    Players
                </Link>
                <span className={styles.navDot}>•</span>
                <Link
                    href="/soccer/fantasy-prem/team"
                    className={
                        isFantasyPremTeam
                            ? styles.navLinkActive
                            : styles.navLink
                    }
                >
                    Team
                </Link>
                <span className={styles.navDot}>•</span>
                <Link
                    href="/soccer/fantasy-prem/fixtures"
                    className={
                        isFixtures ? styles.navLinkActive : styles.navLink
                    }
                >
                    Fixtures
                </Link>
            </nav>
            {children}
        </div>
    );
}
