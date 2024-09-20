import {
    fetchTopTranfersIn,
    fetchFantasyPositions,
    fetchPlayersCount,
} from "@/app/lib/data";
import { FantasyPlayer, FantasyPosition } from "@/app/lib/definitions";
import Link from "next/link";
import Pagination from "./pagination";
import styles from "./styles.module.css";

export default async function Page({
    searchParams,
}: {
    searchParams?: { page?: string };
}) {
    const currentPage = Number(searchParams?.page) || 1;
    const topTransfers = (await fetchTopTranfersIn(
        currentPage,
    )) as FantasyPlayer[];
    const totalPages = await fetchPlayersCount();
    const positions = (await fetchFantasyPositions()) as FantasyPosition[];

    const positionNameMap = positions.reduce(
        (acc, position) => {
            acc[position.id] = position.singular_name;
            return acc;
        },
        {} as Record<number, string>,
    );

    console.log(topTransfers[0])

    return (
        <div>
            <div className={styles.header}>
                <h1>Top Transfers</h1>
                <div className={styles.optimalTeamButton}>
                <Link href="/fantasy-prem">
                    Optimal Team
                </Link>
            </div>
        </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "1000px" }}>
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Cost</th>
                            <th>Points</th>
                            <th>Mins</th>
                            <th>Goals</th>
                            <th>Assists</th>
                            <th>Clean</th>
                            <th>xG</th>
                            <th>xA</th>
                            <th>Next 5 FDR</th>
                            <th>Transfer In Rd</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topTransfers.map((player, index) => (
                            <tr key={index}>
                                <td>
                                    {player.first_name} {player.second_name}
                                </td>
                                <td>{positionNameMap[player.element_type]}</td>
                                <td>{(player.now_cost / 10).toFixed(1)}m</td>
                                <td>{player.total_points}</td>
                                <td>{player.minutes}</td>
                                <td>{player.goals_scored}</td>
                                <td>{player.assists}</td>
                                <td>{player.clean_sheets}</td>
                                <td>{player.expected_goals}</td>
                                <td>{player.expected_assists}</td>
                                <td>0</td>
                                <td>{player.transfers_in_event}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination totalPages={totalPages} />
        </div>
    );
}
