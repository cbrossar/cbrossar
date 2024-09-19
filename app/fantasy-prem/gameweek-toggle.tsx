"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function GameweekToggle() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Get initial isNowCost state from URL or default to false (original cost)
    const isCurrentGameweekParam =
        searchParams.get("isCurrentGameweek") === "true";
    const [isCurrentGameweek, setIsCurrentGameweek] = useState(
        isCurrentGameweekParam,
    );

    const handleToggle = () => {
        const newIsCurrentGameweek = !isCurrentGameweek;
        setIsCurrentGameweek(newIsCurrentGameweek);

        // Update the URL param when the toggle state changes
        const params = new URLSearchParams(searchParams);
        params.set("isCurrentGameweek", newIsCurrentGameweek.toString());
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="cost-toggle-container">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={isCurrentGameweek}
                    onChange={handleToggle}
                />
                <span className="slider"></span>
            </label>
            <div className="cost-display">
                {isCurrentGameweek ? "Current Gameweek" : "All Gameweeks"}
            </div>
            <style jsx>{`
                .cost-toggle-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.4s;
                    border-radius: 34px;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }

                input:checked + .slider {
                    background-color: #4caf50;
                }

                input:checked + .slider:before {
                    transform: translateX(26px);
                }
            `}</style>
        </div>
    );
}
