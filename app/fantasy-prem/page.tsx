import { fetchFantasyPlayers, fetchFantasyPositions } from "@/app/lib/data";
import { FantasyPlayer, FantasyPosition } from "../lib/definitions";
import { maximizeFantasyTeam } from "./utils";
import styles from "./styles.module.css"; // Import the CSS module for styles

export default async function Page() {
    const players: FantasyPlayer[] =
        (await fetchFantasyPlayers()) as FantasyPlayer[];
    const positions: FantasyPosition[] =
        (await fetchFantasyPositions()) as FantasyPosition[];

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
        <div className={styles.container}>
            <h1 className={styles.title}>Fantasy Premier League</h1>
            <h2 className={styles.subtitle}>Optimal Team</h2>
            <div className={styles.stats}>
                <h3>Total Points: {optimalTeam.totalPoints}</h3>
                <h3>Total Cost: £{(optimalTeam.totalCost / 10).toFixed(1)}m</h3>
            </div>
            <div className={styles.lineup}>
                <div className={styles.row}>
                    <h3>Goalkeeper</h3>
                    <div className={styles.players}>
                        {goalkeepers.map((player) => (
                            <div key={player.id} className={styles.player}>
                                <div className={styles.playerInfo}>
                                    <span>
                                        {player.first_name} {player.second_name}
                                    </span>
                                    <span className={styles.points}>
                                        Points: {player.total_points}
                                    </span>
                                    <span className={styles.cost}>
                                        Cost: £
                                        {(player.now_cost / 10).toFixed(1)}m
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.row}>
                    <h3>Defenders</h3>
                    <div className={styles.players}>
                        {defenders.map((player) => (
                            <div key={player.id} className={styles.player}>
                                <div className={styles.playerInfo}>
                                    <span>
                                        {player.first_name} {player.second_name}
                                    </span>
                                    <span className={styles.points}>
                                        Points: {player.total_points}
                                    </span>
                                    <span className={styles.cost}>
                                        Cost: £
                                        {(player.now_cost / 10).toFixed(1)}m
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.row}>
                    <h3>Midfielders</h3>
                    <div className={styles.players}>
                        {midfielders.map((player) => (
                            <div key={player.id} className={styles.player}>
                                <div className={styles.playerInfo}>
                                    <span>
                                        {player.first_name} {player.second_name}
                                    </span>
                                    <span className={styles.points}>
                                        Points: {player.total_points}
                                    </span>
                                    <span className={styles.cost}>
                                        Cost: £
                                        {(player.now_cost / 10).toFixed(1)}m
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.row}>
                    <h3>Forwards</h3>
                    <div className={styles.players}>
                        {forwards.map((player) => (
                            <div key={player.id} className={styles.player}>
                                <div className={styles.playerInfo}>
                                    <span>
                                        {player.first_name} {player.second_name}
                                    </span>
                                    <span className={styles.points}>
                                        Points: {player.total_points}
                                    </span>
                                    <span className={styles.cost}>
                                        Cost: £
                                        {(player.now_cost / 10).toFixed(1)}m
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
