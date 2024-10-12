"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Tooltip from "@mui/material/Tooltip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

interface TableHeaderProps {
    headers: string[];
    sortBy: string;
}

export const headerToColumnMap: Record<string, string> = {
    Name: "name",
    Region: "region_id",
    Winery: "winery_id",
    Ratings: "ratings_count",
    Score: "ratings_average",
    Acidity: "acidity",
    Intensity: "intensity",
    Sweet: "sweetness",
    Tannin: "tannin",
    Price: "price",
};

export const headerToTooltipMap: Record<string, string> = {};

export default function TableHeader({ headers, sortBy }: TableHeaderProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSort = (header: string) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("page", "1");

        const column = headerToColumnMap[header];
        if (!column) {
            return;
        }

        if (sortBy === column) {
            params.set("sortby", `-${column}`);
        } else {
            params.set("sortby", column);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const getSortIcon = (header: string) => {
        const column = headerToColumnMap[header];
        if (!column || !sortBy) return null;

        if (sortBy === column) {
            return <FaArrowDown />;
        } else if (sortBy === `-${column}`) {
            return <FaArrowUp />;
        }
        return null;
    };

    // Define a fixed height for the table header cells
    const thStyle = { height: "50px", verticalAlign: "middle" };

    return (
        <thead>
            <tr>
                {headers.map((header) => {
                    return (
                        <th
                            key={header}
                            onClick={() => handleSort(header)}
                            style={{
                                ...thStyle,
                                cursor: "pointer",
                                position: "relative",
                            }}
                        >
                            <Tooltip
                                title={headerToTooltipMap[header] || ""}
                                enterTouchDelay={0}
                                leaveTouchDelay={1500}
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
                    );
                })}
            </tr>
        </thead>
    );
}
