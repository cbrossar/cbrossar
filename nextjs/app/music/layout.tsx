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
    const isReviews = pathname.includes("music/reviews");
    const isReleases = pathname.includes("music/releases");

    return (
        <div>
            <nav className={styles.navBar}>
                <Link
                    href="/music/reviews"
                    className={
                        isReviews
                            ? styles.navLinkActive
                            : styles.navLink
                    }
                >
                    Reviews
                </Link>
                <span className={styles.navDot}>•</span>
                <Link
                    href="/music/releases"
                    className={
                        isReleases
                            ? styles.navLinkActive
                            : styles.navLink
                    }
                >
                    Releases
                </Link>
            </nav>
            {children}
        </div>
    );
}
