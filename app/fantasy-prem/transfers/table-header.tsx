"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; // Import arrow icons

interface TableHeaderProps {
    headers: string[];
    sortBy: string;
}

export const headerToColumnMap: Record<string, string | null> = {
    Player: "second_name",
    Cost: "now_cost",
    Points: "total_points",
    Mins: "minutes",
    Goals: "goals_scored",
    Assists: "assists",
    Clean: "clean_sheets",
    xG: "expected_goals",
    xA: "expected_assists",
    "FDR-5": null,
    "Transfer In Rd": "transfers_in_event",
    "Transfer Index": null,
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
                        style={{ cursor: "pointer" }}
                    >
                        <div
                            className="header-container"
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <span>{header}</span>
                            <span style={{ marginLeft: "5px" }}>
                                {getSortIcon(header)}
                            </span>
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
    );
}
