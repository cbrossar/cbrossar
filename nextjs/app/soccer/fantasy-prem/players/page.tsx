import {
    fetchFantasyPlayersFiltered,
    fetchFantasyPositions,
    fetchFantasyTeams,
    fetchPlayersCount,
    fetchFantasyPremLatestUpdatedTime,
    fetchFantasySeasons,
} from "@/app/data/fantasy";
import {
    FantasyPlayer,
    FantasyPosition,
    FantasyTeam,
} from "@/app/lib/definitions";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import TableHeader from "./table-header";
import styles from "./styles.module.css";
import RefreshButton from "./refresh-button";

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        query?: string;
        page?: string;
        sortby?: string;
        team?: string;
        pos?: string;
        season?: string;
    };
}) {
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const sortBy = searchParams?.sortby || "last_5_points"; // Default sort
    const sortOrder = sortBy.startsWith("-") ? "ASC" : "DESC";
    const sortByColumn = sortBy.replace("-", "");
    const currentTeamId = searchParams?.team || "";
    const currentPosId = searchParams?.pos || "";
    const season = searchParams?.season || "";

    let seasonId = "";
    if (season) {
        const seasonData = await fetchFantasySeasons(season);
        seasonId = seasonData.id;
    }

    const topTransfers = (await fetchFantasyPlayersFiltered(
        query,
        currentPage,
        sortByColumn,
        sortOrder,
        currentTeamId,
        currentPosId,
        seasonId,
    )) as FantasyPlayer[] | null;

    if (topTransfers === null) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded">
                    Error: Unable to fetch players. Please try again later.
                </div>
            </div>
        );
    }

    const totalPages = await fetchPlayersCount(
        query,
        currentTeamId,
        currentPosId,
    );
    const positions = (await fetchFantasyPositions()) as FantasyPosition[];
    const teams = (await fetchFantasyTeams()) as FantasyTeam[];
    const latestUpdate = await fetchFantasyPremLatestUpdatedTime();
    const teamsById = teams.reduce(
        (acc, team) => {
            acc[team.id] = {
                name: team.name,
                image_filename: team.image_filename || "",
            };
            return acc;
        },
        {} as Record<number, { name: string; image_filename: string }>,
    );

    const positionNameMap = positions.reduce(
        (acc, position) => {
            acc[position.id] = position.singular_name;
            return acc;
        },
        {} as Record<number, string>,
    );

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <Search placeholder="Search Players" />
                </div>
                <div className={styles.topRightCorner}>
                    <RefreshButton latestUpdate={latestUpdate} />
                </div>
            </div>
            {topTransfers.length === 0 ? (
                <div className="flex items-center justify-center">
                    <div className="text-gray-600 text-sm font-medium bg-gray-50 px-4 py-3 rounded">
                        No players found.
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles.table}>
                            <TableHeader
                                headers={[
                                    "Player",
                                    "Team",
                                    "Pos",
                                    "Cost",
                                    "Point",
                                    "P/C",
                                    "Min",
                                    "Goal",
                                    "Assist",
                                    "Clean",
                                    "xG",
                                    "xA",
                                    "Fdr-5",
                                    "Tf Gw",
                                    "Pts-5",
                                ]}
                                sortBy={sortBy}
                                teams={teams}
                                positions={positions}
                            />
                            <tbody>
                                {topTransfers.map((player, index) => (
                                    <tr key={index}>
                                        <td>
                                            <Link
                                                key={player.id}
                                                href={`/soccer/fantasy-prem/players?query=${encodeURIComponent(
                                                    player.second_name,
                                                )}`}
                                            >
                                                {`${player.first_name} ${player.second_name}`
                                                    .length > 25
                                                    ? `${`${player.first_name} ${player.second_name}`.slice(0, 11)}...${`${player.first_name} ${player.second_name}`.slice(-11)}`
                                                    : `${player.first_name} ${player.second_name}`}
                                            </Link>
                                        </td>
                                        <td>
                                            <Image
                                                src={`/fantasy-prem/${teamsById[player.team].image_filename}`}
                                                alt={
                                                    teamsById[player.team].name
                                                }
                                                width={30} // Adjust width
                                                height={30} // Adjust height
                                                style={{ objectFit: "contain" }} // Ensure it fits nicely
                                            />
                                        </td>
                                        <td>
                                            {
                                                positionNameMap[
                                                    player.element_type
                                                ][0]
                                            }
                                        </td>
                                        <td>
                                            {(player.now_cost / 10).toFixed(1)}
                                        </td>
                                        <td>{player.total_points}</td>
                                        <td>
                                            {player.pts_per_cost?.toFixed(1)}
                                        </td>
                                        <td>{player.minutes}</td>
                                        <td>{player.goals_scored}</td>
                                        <td>{player.assists}</td>
                                        <td>{player.clean_sheets}</td>
                                        <td>
                                            {player.expected_goals.toFixed(1)}
                                        </td>
                                        <td>
                                            {player.expected_assists.toFixed(1)}
                                        </td>
                                        <td>{player.fdr_5}</td>
                                        <td>{player.transfers_in_event}</td>
                                        <td>{player.last_5_points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.pagination}>
                        <Pagination totalPages={totalPages} />
                    </div>
                </>
            )}
        </div>
    );
}
