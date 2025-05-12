import {
    fetchFantasyTeams,
    fetchPlayersByPositionAll,
    fetchPlayersByPositionCurrent,
    fetchPlayersByPositionLast5,
} from "@/app/data/fantasy";
import Link from "next/link";
import Image from "next/image";
import { maximizeFantasyTeam } from "./utils";
import styles from "./styles.module.css"; // Import the CSS module for styles
import SettingsModal from "./settings-modal"; // Import the modal component
import { FantasyTeam } from "@/app/lib/definitions";

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        budget?: string;
        formation?: string;
        isNowCost?: string;
        pointsView?: string;
    };
}) {
    const budget = Number(searchParams?.budget || "80") * 10;

    const formation = searchParams?.formation || "1-3-5-2"; // 1 goalie, 3 defenders, 5 midfielders, 2 forwards

    const formationArray = formation.split("-").map(Number);

    const isNowCost = searchParams?.isNowCost !== "false";

    const pointsView = searchParams?.pointsView || "current";

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

    const playersByPositionLast5 = await fetchPlayersByPositionLast5(
        numGoalies,
        numDefenders,
        numMidfielders,
        numForwards,
    );

    const playersByPosition =
        pointsView === "current"
            ? playersByPositionCurrent
            : pointsView === "last5"
              ? playersByPositionLast5
              : playersByPositionAll;

    const optimalTeam = maximizeFantasyTeam(
        playersByPosition,
        budget,
        formationArray,
        isNowCost,
        pointsView,
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
                    <SettingsModal />
                </div>
            </div>
            <div className={styles.lineup}>
                {/* Goalkeepers */}
                <div className={styles.row}>
                    <h3>Goalkeeper</h3>
                    <div className={styles.players}>
                        {goalkeepers.map((player) => (
                            <Link
                                key={player.id}
                                href={`/soccer/fantasy-prem/players?query=${encodeURIComponent(
                                    player.second_name,
                                )}`}
                            >
                                <div className={styles.player}>
                                    <div className={styles.playerInfo}>
                                        <div className={styles.playerNameLogo}>
                                            <span className={styles.playerName}>
                                                {player.first_name}{" "}
                                                {player.second_name}
                                            </span>
                                            <Image
                                                src={`/fantasy-prem/${teamsById[player.team].image_filename}`}
                                                alt={
                                                    teamsById[player.team].name
                                                }
                                                width={30}
                                                height={30}
                                                style={{ objectFit: "contain" }}
                                            />
                                        </div>
                                        <span className={styles.points}>
                                            Points:{" "}
                                            {pointsView === "current"
                                                ? player.event_points
                                                : pointsView === "last5"
                                                  ? player.last_5_points
                                                  : player.total_points}
                                        </span>
                                        <span className={styles.cost}>
                                            Cost: £
                                            {(
                                                (isNowCost
                                                    ? player.now_cost
                                                    : player.now_cost -
                                                      player.cost_change_start) /
                                                10
                                            ).toFixed(1)}
                                            m
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Defenders */}
                <div className={styles.row}>
                    <h3>Defenders</h3>
                    <div className={styles.players}>
                        {defenders.map((player) => (
                            <Link
                                key={player.id}
                                href={`/soccer/fantasy-prem/players?query=${encodeURIComponent(
                                    player.second_name,
                                )}`}
                            >
                                <div className={styles.player}>
                                    <div className={styles.playerInfo}>
                                        <div className={styles.playerNameLogo}>
                                            <span className={styles.playerName}>
                                                {player.first_name}{" "}
                                                {player.second_name}
                                            </span>
                                            <Image
                                                src={`/fantasy-prem/${teamsById[player.team].image_filename}`}
                                                alt={
                                                    teamsById[player.team].name
                                                }
                                                width={30}
                                                height={30}
                                                style={{ objectFit: "contain" }}
                                            />
                                        </div>
                                        <span className={styles.points}>
                                            Points:{" "}
                                            {pointsView === "current"
                                                ? player.event_points
                                                : pointsView === "last5"
                                                  ? player.last_5_points
                                                  : player.total_points}
                                        </span>
                                        <span className={styles.cost}>
                                            Cost: £
                                            {(
                                                (isNowCost
                                                    ? player.now_cost
                                                    : player.now_cost -
                                                      player.cost_change_start) /
                                                10
                                            ).toFixed(1)}
                                            m
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Midfielders */}
                <div className={styles.row}>
                    <h3>Midfielders</h3>
                    <div className={styles.players}>
                        {midfielders.map((player) => (
                            <Link
                                key={player.id}
                                href={`/soccer/fantasy-prem/players?query=${encodeURIComponent(
                                    player.second_name,
                                )}`}
                            >
                                <div className={styles.player}>
                                    <div className={styles.playerInfo}>
                                        <div className={styles.playerNameLogo}>
                                            <span className={styles.playerName}>
                                                {player.first_name}{" "}
                                                {player.second_name}
                                            </span>
                                            <Image
                                                src={`/fantasy-prem/${teamsById[player.team].image_filename}`}
                                                alt={
                                                    teamsById[player.team].name
                                                }
                                                width={30}
                                                height={30}
                                                style={{ objectFit: "contain" }}
                                            />
                                        </div>
                                        <span className={styles.points}>
                                            Points:{" "}
                                            {pointsView === "current"
                                                ? player.event_points
                                                : pointsView === "last5"
                                                  ? player.last_5_points
                                                  : player.total_points}
                                        </span>
                                        <span className={styles.cost}>
                                            Cost: £
                                            {(
                                                (isNowCost
                                                    ? player.now_cost
                                                    : player.now_cost -
                                                      player.cost_change_start) /
                                                10
                                            ).toFixed(1)}
                                            m
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Forwards */}
                <div className={styles.row}>
                    <h3>Forwards</h3>
                    <div className={styles.players}>
                        {forwards.map((player) => (
                            <Link
                                key={player.id}
                                href={`/soccer/fantasy-prem/players?query=${encodeURIComponent(
                                    player.second_name,
                                )}`}
                            >
                                <div className={styles.player}>
                                    <div className={styles.playerInfo}>
                                        <div className={styles.playerNameLogo}>
                                            <span className={styles.playerName}>
                                                {player.first_name}{" "}
                                                {player.second_name}
                                            </span>
                                            <Image
                                                src={`/fantasy-prem/${teamsById[player.team].image_filename}`}
                                                alt={
                                                    teamsById[player.team].name
                                                }
                                                width={30}
                                                height={30}
                                                style={{ objectFit: "contain" }}
                                            />
                                        </div>
                                        <span className={styles.points}>
                                            Points:{" "}
                                            {pointsView === "current"
                                                ? player.event_points
                                                : pointsView === "last5"
                                                  ? player.last_5_points
                                                  : player.total_points}
                                        </span>
                                        <span className={styles.cost}>
                                            Cost: £
                                            {(
                                                (isNowCost
                                                    ? player.now_cost
                                                    : player.now_cost -
                                                      player.cost_change_start) /
                                                10
                                            ).toFixed(1)}
                                            m
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
