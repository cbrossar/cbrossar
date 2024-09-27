import {
    fetchFantasyPlayersFiltered,
    fetchFantasyPositions,
    fetchPlayersCount,
} from "@/app/lib/data";
import { FantasyPlayer, FantasyPosition } from "@/app/lib/definitions";
import Link from "next/link";
import Pagination from "./pagination";
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
    };
}) {
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const sortBy = searchParams?.sortby || "transfer_index"; // Default sort
    const sortOrder = sortBy.startsWith("-") ? "ASC" : "DESC";
    const sortByColumn = sortBy.replace("-", "");

    const topTransfers = (await fetchFantasyPlayersFiltered(
        query,
        currentPage,
        sortByColumn,
        sortOrder,
    )) as FantasyPlayer[];
    const totalPages = await fetchPlayersCount(query);
    const positions = (await fetchFantasyPositions()) as FantasyPosition[];

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
                <table style={{ minWidth: "1000px" }}>
                    <TableHeader
                        headers={[
                            "Player",
                            "Cost",
                            "Points",
                            "Mins",
                            "Goals",
                            "Assists",
                            "Cleans",
                            "xG",
                            "xA",
                            "FDR-5",
                            "Transfer In Rd",
                            "Transfer Index",
                        ]}
                        sortBy={sortBy} // Pass the current sortBy param
                    />
                    <tbody>
                        {topTransfers.map((player, index) => (
                            <tr key={index}>
                                <td>
                                    {player.first_name} {player.second_name} (
                                    {positionNameMap[player.element_type][0]})
                                </td>
                                <td>{(player.now_cost / 10).toFixed(1)}m</td>
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