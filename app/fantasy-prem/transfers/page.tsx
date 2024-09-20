import {
    fetchTopTranfersIn,
    fetchFantasyPositions,
    fetchPlayersCount,
} from "@/app/lib/data";
import { FantasyPlayer, FantasyPosition } from "@/app/lib/definitions";
import Pagination from "./pagination";

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        page?: string;
    };
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

    return (
        <div>
            <h1>Top Transfers</h1>
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Position</th>
                        <th>Now Cost</th>
                        <th>Total Points</th>
                        <th>Minutes</th>
                        <th>Goals Scored</th>
                        <th>Assists</th>
                        <th>Clean Sheets</th>
                        <th>Expected Goals</th>
                        <th>Expected Assists</th>
                        <th>Transfers In</th>
                        <th>Transfers In (Round)</th>
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
                            <td>{player.transfers_in}</td>
                            <td>{player.transfers_in_event}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination totalPages={totalPages} />
        </div>
    );
}
