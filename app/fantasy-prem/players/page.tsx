import {
    fetchFantasyPlayersFiltered,
    fetchFantasyPositions,
    fetchFantasyTeams,
    fetchPlayersCount,
} from "@/app/lib/data";
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
    };
}) {
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const sortBy = searchParams?.sortby || "transfer_index"; // Default sort
    const sortOrder = sortBy.startsWith("-") ? "ASC" : "DESC";
    const sortByColumn = sortBy.replace("-", "");
    const currentTeamId = searchParams?.team || "";
    const currentPosId = searchParams?.pos || "";

    const topTransfers = (await fetchFantasyPlayersFiltered(
        query,
        currentPage,
        sortByColumn,
        sortOrder,
        currentTeamId,
        currentPosId,
    )) as FantasyPlayer[];
    const totalPages = await fetchPlayersCount(
        query,
        currentTeamId,
        currentPosId,
    );
    const positions = (await fetchFantasyPositions()) as FantasyPosition[];
    const teams = (await fetchFantasyTeams()) as FantasyTeam[];

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
                    <div className={styles.optimalTeamButton}>
                        <Link href="/fantasy-prem/team">Team</Link>
                    </div>
                    <RefreshButton />
                </div>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "900px" }}>
                    <TableHeader
                        headers={[
                            "Player",
                            "Team",
                            "Pos",
                            "Cost",
                            "Point",
                            "Min",
                            "Goal",
                            "Assist",
                            "Clean",
                            "xG",
                            "xA",
                            "FDR-5",
                            "TF Gw",
                            "TF Idx",
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
                                        href={`/fantasy-prem/players?query=${encodeURIComponent(
                                            player.second_name,
                                        )}`}
                                    >
                                        {player.first_name} {player.second_name}
                                    </Link>
                                </td>
                                <td>
                                    <Image
                                        src={`/fantasy-prem/${teamsById[player.team].image_filename}`}
                                        alt={teamsById[player.team].name}
                                        width={30} // Adjust width
                                        height={30} // Adjust height
                                        style={{ objectFit: "contain" }} // Ensure it fits nicely
                                    />
                                </td>
                                <td>
                                    {positionNameMap[player.element_type][0]}
                                </td>
                                <td>{(player.now_cost / 10).toFixed(1)}</td>
                                <td>{player.total_points}</td>
                                <td>{player.minutes}</td>
                                <td>{player.goals_scored}</td>
                                <td>{player.assists}</td>
                                <td>{player.clean_sheets}</td>
                                <td>{player.expected_goals}</td>
                                <td>{player.expected_assists}</td>
                                <td>{player.fdr_5}</td>
                                <td>{player.transfers_in_event}</td>
                                <td>
                                    {(
                                        (player.transfer_index || 0) * 100
                                    ).toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.pagination}>
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}
