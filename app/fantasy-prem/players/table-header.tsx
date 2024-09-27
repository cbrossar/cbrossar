"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; // Import arrow icons
import Tooltip from "@mui/material/Tooltip";

interface TableHeaderProps {
    headers: string[];
    sortBy: string;
}

export const headerToColumnMap: Record<string, string> = {
    Player: "second_name",
    Cost: "now_cost",
    Points: "total_points",
    Mins: "minutes",
    Goals: "goals_scored",
    Assists: "assists",
    Cleans: "clean_sheets",
    xG: "expected_goals",
    xA: "expected_assists",
    "FDR-5": "fdr_5",
    "Transfer In Rd": "transfers_in_event",
    "Transfer Index": "transfer_index",
};

export const headerToTooltipMap: Record<string, string> = {
    "FDR-5": "The sum Fixture Difficulty Rating for the next 5 games",
    "Transfer In Rd": "The number of transfers in for the current round",
    "Transfer Index": "Weighted alculation of columns in this table",
};

export default function TableHeader({ headers, sortBy }: TableHeaderProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSort = (header: string) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("page", "1"); // Reset to page 1 when sorting

        const column = headerToColumnMap[header];
        if (!column) {
            return;
        }

        if (sortBy === column) {
            params.set("sortby", `-${column}`); // Toggle to descending if already sorted ascending
        } else {
            params.set("sortby", column); // Set ascending order
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const getSortIcon = (header: string) => {
        const column = headerToColumnMap[header];
        if (!column || !sortBy) return null;

        // Check if current column is being sorted
        if (sortBy === column) {
            return <FaArrowDown />; // Ascending sort
        } else if (sortBy === `-${column}`) {
            return <FaArrowUp />; // Descending sort
        }
        return null;
    };

    return (
        <thead>
            <tr>
                {headers.map((header) => (
                    <th
                        key={header}
                        onClick={() => handleSort(header)}
                        style={{ cursor: "pointer", position: "relative" }}
                    >
                        <Tooltip
                            title={headerToTooltipMap[header] || ""}
                            enterTouchDelay={0} // Show tooltip immediately on touch
                            leaveTouchDelay={1500} // Keep tooltip open for a while after touch ends
                        >
                            <div
                                className="header-container"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <span>{header}</span>
                                <span style={{ marginLeft: "5px" }}>
                                    {getSortIcon(header)}
                                </span>
                            </div>
                        </Tooltip>
                    </th>
                ))}
            </tr>
        </thead>
    );
}
