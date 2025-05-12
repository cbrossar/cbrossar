"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FantasyPosition, FantasyTeam } from "@/app/lib/definitions";

interface TableHeaderProps {
    headers: string[];
    sortBy: string;
    teams: FantasyTeam[];
    positions: FantasyPosition[];
}

export const headerToColumnMap: Record<string, string> = {
    Player: "second_name",
    Team: "team",
    Pos: "element_type",
    Cost: "now_cost",
    Point: "total_points",
    Min: "minutes",
    Goal: "goals_scored",
    Assist: "assists",
    Clean: "clean_sheets",
    xG: "expected_goals",
    xA: "expected_assists",
    "Pts-5": "last_5_points",
    "Fdr-5": "fdr_5",
    "Tf Gw": "transfers_in_event",
    "Tf Idx": "transfer_index",
};

export const headerToTooltipMap: Record<string, string> = {
    "Fdr-5": "The sum Fixture Difficulty Rating for the next 5 games",
    "Tf Gw": "The number of transfers in for the current gameweek",
    "Tf Idx": "Weighted score of data in this table",
};

export default function TableHeader({
    headers,
    sortBy,
    teams,
    positions,
}: TableHeaderProps) {
    // State for team and position selects
    const [isTeamSelectOpen, setIsTeamSelectOpen] = useState(false);
    const [isPosSelectOpen, setIsPosSelectOpen] = useState(false);

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

    // Handle team selection
    const handleTeamSelect = (teamId: string) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("page", "1");
        if (teamId) {
            params.set("team", teamId);
        } else {
            params.delete("team");
        }
        replace(`${pathname}?${params.toString()}`);
        setIsTeamSelectOpen(false);
    };

    // Handle position selection
    const handlePosSelect = (posId: string) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("page", "1");
        if (posId) {
            params.set("pos", posId);
        } else {
            params.delete("pos");
        }
        replace(`${pathname}?${params.toString()}`);
        setIsPosSelectOpen(false);
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

    // Get current team and position IDs from URL parameters
    const currentTeamId = searchParams.get("team") || "";
    const currentPosId = searchParams.get("pos") || "";

    // Define a fixed height for the table header cells
    const thStyle = { height: "50px", verticalAlign: "middle" };

    // Define styles for the Select components to prevent height change
    const selectStyle = {
        width: "100%",
        "& .MuiSelect-select": {
            padding: "0 !important",
            minHeight: "unset",
            display: "flex",
            alignItems: "center",
        },
        "& .MuiInputBase-root": {
            padding: "0",
        },
        "& .MuiSelect-icon": {
            display: "none",
        },
        fontSize: "inherit",
        lineHeight: "normal",
    };

    return (
        <thead>
            <tr>
                {headers.map((header) => {
                    if (header === "Team") {
                        return (
                            <th
                                key={header}
                                style={{
                                    ...thStyle,
                                    cursor: "pointer",
                                    position: "relative",
                                }}
                            >
                                {isTeamSelectOpen ? (
                                    <Select
                                        value={currentTeamId}
                                        onChange={(e) =>
                                            handleTeamSelect(
                                                e.target.value as string,
                                            )
                                        }
                                        onClose={() =>
                                            setIsTeamSelectOpen(false)
                                        }
                                        open={isTeamSelectOpen}
                                        autoFocus
                                        variant="standard"
                                        sx={selectStyle}
                                        MenuProps={{
                                            anchorOrigin: {
                                                vertical: "bottom",
                                                horizontal: "left",
                                            },
                                            transformOrigin: {
                                                vertical: "top",
                                                horizontal: "left",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>All Teams</em>
                                        </MenuItem>
                                        {teams.map((team) => (
                                            <MenuItem
                                                key={team.id}
                                                value={team.id.toString()}
                                            >
                                                {team.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            height: "100%",
                                        }}
                                    >
                                        <Tooltip
                                            onClick={() =>
                                                setIsTeamSelectOpen(true)
                                            }
                                            title={
                                                headerToTooltipMap[header] || ""
                                            }
                                            enterTouchDelay={0}
                                            leaveTouchDelay={1500}
                                        >
                                            <span>{header}</span>
                                        </Tooltip>
                                    </div>
                                )}
                            </th>
                        );
                    } else if (header === "Pos") {
                        return (
                            <th
                                key={header}
                                style={{
                                    ...thStyle,
                                    cursor: "pointer",
                                    position: "relative",
                                }}
                            >
                                {isPosSelectOpen ? (
                                    <Select
                                        value={currentPosId}
                                        onChange={(e) =>
                                            handlePosSelect(
                                                e.target.value as string,
                                            )
                                        }
                                        onClose={() =>
                                            setIsPosSelectOpen(false)
                                        }
                                        open={isPosSelectOpen}
                                        autoFocus
                                        variant="standard"
                                        sx={selectStyle}
                                        MenuProps={{
                                            anchorOrigin: {
                                                vertical: "bottom",
                                                horizontal: "left",
                                            },
                                            transformOrigin: {
                                                vertical: "top",
                                                horizontal: "left",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>All Positions</em>
                                        </MenuItem>
                                        {positions.map((pos) => (
                                            <MenuItem
                                                key={pos.id}
                                                value={pos.id}
                                            >
                                                {pos.singular_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            height: "100%",
                                        }}
                                    >
                                        <Tooltip
                                            onClick={() =>
                                                setIsPosSelectOpen(true)
                                            }
                                            title={
                                                headerToTooltipMap[header] || ""
                                            }
                                            enterTouchDelay={0}
                                            leaveTouchDelay={1500}
                                        >
                                            <span>{header}</span>
                                        </Tooltip>
                                    </div>
                                )}
                            </th>
                        );
                    } else {
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
                    }
                })}
            </tr>
        </thead>
    );
}
