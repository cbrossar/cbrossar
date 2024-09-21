"use client";
import { MdSync } from "react-icons/md";


export default function RefreshButton() {
    const handleRefresh = async () => {
        try {
            const response = await fetch('/api/fantasy-prem', {
                method: 'GET',
            });
            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Failed to refresh data');
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
        console.log('Refresh button clicked');
    };

    return (
        <button onClick={handleRefresh}>
            <MdSync size={24} />
        </button>
    )
}
