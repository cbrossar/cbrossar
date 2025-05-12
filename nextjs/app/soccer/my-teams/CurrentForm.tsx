import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";
import styles from "../styles.module.css";
import { Team, Match } from "../../lib/definitions";
import { SPURS, WERDER_BEERMEN } from "../../lib/constants";

type CurrentFormProps = {
    formTeams: (Team | undefined)[];
    spursMatches: Match[];
    werderMatches: Match[];
    garnetMatches: Match[];
    teamNameMap: { [key: string]: string };
    numMatches: number;
};

function CurrentForm(props: CurrentFormProps) {
    const {
        formTeams,
        spursMatches,
        werderMatches,
        garnetMatches,
        teamNameMap,
        numMatches,
    } = props;
    return (
        <>
            <div className={styles.formHeader}>Current Form</div>
            {formTeams.map((team) => {
                if (!team) {
                    return null;
                }
                const matches =
                    team.name === SPURS
                        ? spursMatches
                        : team.name === WERDER_BEERMEN
                          ? werderMatches
                          : garnetMatches;
                const teamName =
                    team.name === SPURS ? team.name.slice(0, -11) : team.name;

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
                        <div className={styles.formTeam}>{teamName}</div>
                        <div className={styles.resultRow}>
                            {matches.reverse().map((match, idx) => {
                                const isHome =
                                    teamNameMap[match.home_team_id] ===
                                    team.name;
                                const isWin = isHome
                                    ? match.home_score > match.away_score
                                    : match.away_score > match.home_score;
                                const isDraw =
                                    match.home_score === match.away_score;
                                const isLoss = isHome
                                    ? match.home_score < match.away_score
                                    : match.away_score < match.home_score;
                                const matchDate = new Date(
                                    match.date,
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                                const homeTeamName = teamNameMap[
                                    match.home_team_id
                                ].endsWith(" FC")
                                    ? teamNameMap[match.home_team_id].slice(
                                          0,
                                          -3,
                                      )
                                    : teamNameMap[match.home_team_id];
                                const awayTeamName = teamNameMap[
                                    match.away_team_id
                                ].endsWith(" FC")
                                    ? teamNameMap[match.away_team_id].slice(
                                          0,
                                          -3,
                                      )
                                    : teamNameMap[match.away_team_id];
                                const tooltip = `${matchDate}: ${homeTeamName} ${match.home_score} - ${match.away_score} ${awayTeamName}`;
                                return (
                                    <div key={match.id}>
                                        <Tooltip
                                            title={tooltip}
                                            enterTouchDelay={0}
                                            leaveTouchDelay={1500}
                                        >
                                            <div
                                                key={match.id}
                                                className={styles.box}
                                            >
                                                {isWin && (
                                                    <div className={styles.w}>
                                                        W
                                                    </div>
                                                )}
                                                {isDraw && (
                                                    <div className={styles.d}>
                                                        D
                                                    </div>
                                                )}
                                                {isLoss && (
                                                    <div className={styles.l}>
                                                        L
                                                    </div>
                                                )}
                                                {idx === numMatches - 1 &&
                                                    isWin && (
                                                        <div
                                                            className={
                                                                styles.wLine
                                                            }
                                                        ></div>
                                                    )}
                                                {idx === numMatches - 1 &&
                                                    isDraw && (
                                                        <div
                                                            className={
                                                                styles.dLine
                                                            }
                                                        ></div>
                                                    )}
                                                {idx === numMatches - 1 &&
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
    );
}

export default CurrentForm;
