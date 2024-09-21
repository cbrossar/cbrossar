import {
    fetchTopTranfersIn,
    fetchFantasyPositions,
    fetchPlayersCount,
} from "@/app/lib/data";
import { FantasyPlayer, FantasyPosition } from "@/app/lib/definitions";
import Link from "next/link";
import { FaCog } from "react-icons/fa"; // Import the gear icon from react-icons
import Pagination from "./pagination";
import Search from "@/app/ui/search";
import styles from "./styles.module.css";
import { calculateTransferIndex } from "./utils";
import RefreshButton from "./refresh-button";

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const topTransfers = (await fetchTopTranfersIn(
        query,
        currentPage,
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

    let playerDataMap = new Map();
    for (const player of topTransfers) {
        const res = await fetch(
            `https://fantasy.premierleague.com/api/element-summary/${player.id}/`,
        );
        const playerData = await res.json();
        const next5FDR = playerData.fixtures
            .slice(0, 5)
            .map((fixture: any) => fixture.difficulty)
            .reduce((a: any, b: any) => a + b, 0);
        const transferIndex = calculateTransferIndex(player, {
            FDR5: next5FDR,
        });

        playerDataMap.set(player.id, {
            "FDR-5": next5FDR,
            transferIndex: transferIndex,
        });
    }

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <Search placeholder="Top Transfers" />
                </div>
                <div className={styles.topRightCorner}>
                    <div className={styles.optimalTeamButton}>
                        <Link href="/fantasy-prem">Optimal Team</Link>
                    </div>
                    <RefreshButton />
                </div>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "1000px" }}>
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Cost</th>
                            <th>Points</th>
                            <th>Mins</th>
                            <th>Goals</th>
                            <th>Assists</th>
                            <th>Clean</th>
                            <th>xG</th>
                            <th>xA</th>
                            <th>FDR-5</th>
                            <th>Transfer In Rd ↓</th>
                            <th>Transfer Index</th>
                        </tr>
                    </thead>
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
                                <td>{playerDataMap.get(player.id)["FDR-5"]}</td>
                                <td>{player.transfers_in_event}</td>
                                <td>
                                    {(
                                        playerDataMap.get(player.id)[
                                            "transferIndex"
                                        ] * 100
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
