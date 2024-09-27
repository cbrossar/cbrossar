import {
    fetchPlayersByPositionAll,
    fetchPlayersByPositionCurrent,
} from "@/app/lib/data";
import Link from "next/link";
import { maximizeFantasyTeam } from "./utils";
import styles from "./styles.module.css"; // Import the CSS module for styles
import SettingsModal from "./settings-modal"; // Import the modal component

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        budget?: string;
        formation?: string;
        isNowCost?: string;
        isCurrentGameweek?: string;
    };
}) {
    const budget = Number(searchParams?.budget || "80") * 10;

    const formation = searchParams?.formation || "1-3-5-2"; // 1 goalie, 3 defenders, 5 midfielders, 2 forwards

    const formationArray = formation.split("-").map(Number);

    const isNowCost = searchParams?.isNowCost === "true" || false;

    const isCurrentGameweek =
        searchParams?.isCurrentGameweek === "true" || false;

    const numGoalies = 4;
    const numDefenders = 8;
    const numMidfielders = 9;
    const numForwards = 7;

    const playersByPositionAll = await fetchPlayersByPositionAll(
        numGoalies,
        numDefenders,
        numMidfielders,
        numForwards,
    );

    const playersByPositionCurrent = await fetchPlayersByPositionCurrent(
        numGoalies,
        numDefenders,
        numMidfielders,
        numForwards,
    );

    const playersByPosition = isCurrentGameweek
        ? playersByPositionCurrent
        : playersByPositionAll;

    const optimalTeam = maximizeFantasyTeam(
        playersByPosition,
        budget,
        formationArray,
        isNowCost,
        isCurrentGameweek,
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
            <div className={styles.header}>
                <div className={styles.stats}>
                    <h3>Total Points: {optimalTeam.totalPoints}</h3>
                    <h3>
                        Total Cost: £{(optimalTeam.totalCost / 10).toFixed(1)}m
                    </h3>
                </div>
                <div className={styles.topRightCorner}>
                    <div className={styles.topTransfersButton}>
                        <Link href="/fantasy-prem/players">Players</Link>
                    </div>
                    <SettingsModal />
                </div>
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
                                        Points:{" "}
                                        {isCurrentGameweek
                                            ? player.event_points
                                            : player.total_points}
                                    </span>
                                    <span className={styles.cost}>
                                        Cost: £
                                        {(
                                            (isNowCost
                                                ? player.now_cost
                                                : player.now_cost -
                                                  player.cost_change_start) / 10
                                        ).toFixed(1)}
                                        m
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
                                        Points:{" "}
                                        {isCurrentGameweek
                                            ? player.event_points
                                            : player.total_points}
                                    </span>
                                    <span className={styles.cost}>
                                        Cost: £
                                        {(
                                            (isNowCost
                                                ? player.now_cost
                                                : player.now_cost -
                                                  player.cost_change_start) / 10
                                        ).toFixed(1)}
                                        m
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
                                        Points:{" "}
                                        {isCurrentGameweek
                                            ? player.event_points
                                            : player.total_points}
                                    </span>
                                    <span className={styles.cost}>
                                        Cost: £
                                        {(
                                            (isNowCost
                                                ? player.now_cost
                                                : player.now_cost -
                                                  player.cost_change_start) / 10
                                        ).toFixed(1)}
                                        m
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
                                        Points:{" "}
                                        {isCurrentGameweek
                                            ? player.event_points
                                            : player.total_points}
                                    </span>
                                    <span className={styles.cost}>
                                        Cost: £
                                        {(
                                            (isNowCost
                                                ? player.now_cost
                                                : player.now_cost -
                                                  player.cost_change_start) / 10
                                        ).toFixed(1)}
                                        m
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