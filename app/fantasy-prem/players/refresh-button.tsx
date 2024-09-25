"use client";
import { MdSync } from "react-icons/md";

export default function RefreshButton() {
    const handleRefresh = async () => {
        try {
            const response = await fetch("/api/fantasy-prem", {
                method: "GET",
            });
            if (response.ok) {
                // TODO: is this necessary?
                window.location.reload();
            } else {
                console.error("Failed to refresh data");
            }
        } catch (error) {
            console.error("Error refreshing data:", error);
        }
    };

    return (
        <button onClick={handleRefresh}>
            <MdSync size={24} />
        </button>
    );
}
