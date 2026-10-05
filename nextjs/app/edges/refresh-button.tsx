"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdSync } from "react-icons/md";
import styles from "./styles.module.css";

export default function RefreshButton({
    lastRefreshed,
}: {
    lastRefreshed: Date | null;
}) {
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState("");
    const [lastRefreshedText, setLastRefreshedText] = useState("");

    // Format on the client so the time is in the viewer's timezone
    useEffect(() => {
        setLastRefreshedText(
            lastRefreshed
                ? new Date(lastRefreshed).toLocaleString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                  })
                : "Never",
        );
    }, [lastRefreshed]);

    const handleRefresh = async () => {
        setIsScanning(true);
        setError("");
        try {
            const response = await fetch("/api/baton/edge-scan", {
                method: "POST",
            });
            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.detail || data.error || "Scan failed");
            }
        } catch (error) {
            console.error("Error running edge scan:", error);
            setError("Scan failed");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className={styles.refresh}>
            <span>
                Last refreshed <strong>{lastRefreshedText}</strong>
            </span>
            <button
                onClick={handleRefresh}
                disabled={isScanning}
                className={styles.refreshButton}
            >
                <MdSync size={18} className={isScanning ? styles.spin : ""} />
                {isScanning ? "Scanning…" : "Refresh"}
            </button>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
