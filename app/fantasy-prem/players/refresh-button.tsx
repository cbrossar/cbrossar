"use client";
import { useState } from "react";
import { MdSync } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip";
import styles from "./RefreshButton.module.css"; // CSS module for styling

export default function RefreshButton() {
    const [isSpinning, setIsSpinning] = useState(false);

    const handleRefresh = async () => {
        setIsSpinning(true);
        try {
            const response = await fetch("/api/fantasy-prem", {
                method: "GET",
            });
            if (response.ok) {
                window.location.reload();
            } else {
                console.error("Failed to refresh data");
            }
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setIsSpinning(false); // Stop spinning after the action is complete
        }
    };

    return (
        <Tooltip
            title="Updated stats are available every 30 minutes"
            enterTouchDelay={0} // Show tooltip immediately on touch
            leaveTouchDelay={1500} // Keep tooltip open for a while after touch ends
        >
            <button onClick={handleRefresh}>
                <MdSync size={24} className={isSpinning ? styles.spin : ""} />
            </button>
        </Tooltip>
    );
}
