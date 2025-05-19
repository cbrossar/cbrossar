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
    const isMyTeams = pathname.includes("my-teams");

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
                    Fantasy Players
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
                    Fantasy Team
                </Link>
                <span className={styles.navDot}>•</span>
                <Link
                    href="/soccer/my-teams"
                    className={
                        isMyTeams ? styles.navLinkActive : styles.navLink
                    }
                >
                    My Teams
                </Link>
            </nav>
            {children}
        </div>
    );
}
