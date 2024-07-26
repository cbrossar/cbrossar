import Image from "next/image";
import Link from "next/link";
import Tooltip from "@mui/material/Tooltip";
import { fetchSpursMatches, fetchMyMatches, fetchTeams } from "@/app/lib/data";
import styles from "./styles.module.css";
import { Team } from "../lib/definitions";

const SPURS = "Tottenham Hotspur FC";

export default async function Page() {
    const teams = await fetchTeams();
    const teamNameMap = teams.reduce(
        (acc: { [key: string]: string }, team: Team) => {
            acc[team.id] = team.name;
            return acc;
        },
        {},
    );
    const formTeamNames = ["Werder Beermen", SPURS];
    const formTeams = formTeamNames.map((name) =>
        teams.find((team: Team) => team.name === name),
    );
    const numMatches = 5;
    const spursMatches = await fetchSpursMatches(numMatches);
    const myMatches = await fetchMyMatches(numMatches);

    return (
        <div className={styles.centerContainer}>
            <div className={styles.formSection}>
                <>
                    <div className={styles.formHeader}>Current Form</div>
                    {formTeams.map((team) => {
                        if (!team) {
                            return null;
                        }
                        const matches =
                            team.name === SPURS ? spursMatches : myMatches;
                        const teamName =
                            team.name === SPURS
                                ? team.name.slice(0, -11)
                                : team.name;

                        return (
                            <div key={team.id} className={styles.formRow}>
                                <div className={styles.formImageWrapper}>
                                    <Image
                                        src={`/soccer/${team.image_filename}`}
                                        width={30}
                                        height={30}
                                        alt={team.name}
                                    />
                                </div>
                                <div className={styles.formTeam}>
                                    {teamName}
                                </div>
                                <div className={styles.resultRow}>
                                    {matches.reverse().map((match, idx) => {
                                        const isHome =
                                            teamNameMap[match.home_team_id] ===
                                            team.name;
                                        const isWin = isHome
                                            ? match.home_score >
                                              match.away_score
                                            : match.away_score >
                                              match.home_score;
                                        const isDraw =
                                            match.home_score ===
                                            match.away_score;
                                        const isLoss = isHome
                                            ? match.home_score <
                                              match.away_score
                                            : match.away_score <
                                              match.home_score;
                                        // Just show month and day
                                        const matchDate = new Date(
                                            match.date,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        });
                                        const homeTeamName = teamNameMap[
                                            match.home_team_id
                                        ].endsWith(" FC")
                                            ? teamNameMap[
                                                  match.home_team_id
                                              ].slice(0, -3)
                                            : teamNameMap[match.home_team_id];
                                        const awayTeamName = teamNameMap[
                                            match.away_team_id
                                        ].endsWith(" FC")
                                            ? teamNameMap[
                                                  match.away_team_id
                                              ].slice(0, -3)
                                            : teamNameMap[match.away_team_id];
                                        const tooltip = `${matchDate}: ${homeTeamName} ${match.home_score} - ${match.away_score} ${awayTeamName}`;
                                        return (
                                            <div key={match.id}>
                                                <Tooltip
                                                    title={tooltip}
                                                    enterTouchDelay={0} // Show tooltip immediately on touch
                                                    leaveTouchDelay={1500} // Keep tooltip open for a while after touch ends
                                                >
                                                    <div
                                                        key={match.id}
                                                        className={styles.box}
                                                    >
                                                        {isWin && (
                                                            <div
                                                                className={
                                                                    styles.w
                                                                }
                                                            >
                                                                W
                                                            </div>
                                                        )}
                                                        {isDraw && (
                                                            <div
                                                                className={
                                                                    styles.d
                                                                }
                                                            >
                                                                D
                                                            </div>
                                                        )}
                                                        {isLoss && (
                                                            <div
                                                                className={
                                                                    styles.l
                                                                }
                                                            >
                                                                L
                                                            </div>
                                                        )}
                                                        {idx ===
                                                            numMatches - 1 &&
                                                            isWin && (
                                                                <div
                                                                    className={
                                                                        styles.wLine
                                                                    }
                                                                ></div>
                                                            )}
                                                        {idx ===
                                                            numMatches - 1 &&
                                                            isDraw && (
                                                                <div
                                                                    className={
                                                                        styles.dLine
                                                                    }
                                                                ></div>
                                                            )}
                                                        {idx ===
                                                            numMatches - 1 &&
                                                            isLoss && (
                                                                <div
                                                                    className={
                                                                        styles.lLine
                                                                    }
                                                                ></div>
                                                            )}
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    <p className="text-gray-500 text-sm mt-4 text-center">
                        Tap or hover to see the match info.
                    </p>
                </>
            </div>

            <div className={styles.grid}>
                <div className={styles.item}>
                    <Link href="https://register.ilovenysoccer.com/team/342/werder-beermen">
                        <div className={styles.imageWrapper}>
                            <Image
                                src="/soccer/werder-beermen.png"
                                width={200}
                                height={200}
                                alt="Werder Beermen"
                            />
                        </div>
                    </Link>
                    <div className={styles.caption}>Werder Beermen</div>
                </div>
                <div className={styles.item}>
                    <Link href="https://gothamsoccer.com/newyorkcity">
                        <div className={styles.imageWrapper}>
                            <Image
                                src="/soccer/gotham.png"
                                width={200}
                                height={200}
                                alt="Gotham"
                            />
                        </div>
                    </Link>
                    <div className={styles.caption}>Brooklyn Hove Albion</div>
                </div>
                <div className={styles.item}>
                    <Link href="https://sfelitemetro.com/">
                        <div className={styles.imageWrapper}>
                            <Image
                                src="/soccer/metro.png"
                                width={200}
                                height={200}
                                alt="Metro"
                            />
                        </div>
                    </Link>
                    <div className={styles.caption}>SF Metropolitan FC</div>
                </div>
                <div className={styles.item}>
                    <Link href="https://uscmenssoccer.wordpress.com/">
                        <div className={styles.imageWrapper}>
                            <Image
                                src="/soccer/usc-mens-soccer.png"
                                width={200}
                                height={200}
                                alt="USC Mens Soccer"
                            />
                        </div>
                    </Link>
                    <div className={styles.caption}>USC Men&apos;s Soccer</div>
                </div>
            </div>
        </div>
    );
}
