import { fetchFantasyPlayers, fetchFantasyPositions } from "@/app/lib/data";
import { FantasyPlayer, FantasyPosition } from "../lib/definitions";
import { maximizeFantasyTeam } from "./utils";

export default async function Page() {
    const players: FantasyPlayer[] = await fetchFantasyPlayers() as FantasyPlayer[];
    const positions: FantasyPosition[] = await fetchFantasyPositions() as FantasyPosition[];

    const budget = 800;
    const formation = [1, 3, 5, 2]; // 1 goalie, 3 defenders, 5 midfielders, 2 forwards

    const optimalTeam = maximizeFantasyTeam(
        players,
        positions,
        budget,
        formation,
    );

    const goalkeepers = optimalTeam.team.filter(
        (player) => player.element_type === 1,
    );

    const defenders = optimalTeam.team.filter(
        (player) => player.element_type === 2,
    );
    const midfielders = optimalTeam.team.filter(
        (player) => player.element_type === 3,
    );

    const forwards = optimalTeam.team.filter(
        (player) => player.element_type === 4,
    );

    return (
        <div>
            <h1>Fantasy Premier League</h1>
            <h2>Optimal Team</h2>
            <h3>Total Points: {optimalTeam.totalPoints}</h3>
            <h3>Total Cost: £{(optimalTeam.totalCost / 10).toFixed(1)}m</h3>
            <h3>Goalkeepers</h3>
            <ul>
                {goalkeepers.map((player) => (
                    <li key={player.id}>
                        {player.first_name} {player.second_name}
                    </li>
                ))}
            </ul>
            <h3>Defenders</h3>
            <ul>
                {defenders.map((player) => (
                    <li key={player.id}>
                        {player.first_name} {player.second_name}
                    </li>
                ))}
            </ul>
            <h3>Midfielders</h3>
            <ul>
                {midfielders.map((player) => (
                    <li key={player.id}>
                        {player.first_name} {player.second_name}
                    </li>
                ))}
            </ul>
            <h3>Forwards</h3>
            <ul>
                {forwards.map((player) => (
                    <li key={player.id}>
                        {player.first_name} {player.second_name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
