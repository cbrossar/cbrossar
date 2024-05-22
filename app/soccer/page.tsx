import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

export default function Page() {
    const my_matches = [
        {
            id: "1",
            home_team_id: "me",
            away_team_id: "you",
            home_score: 3,
            away_score: 0,
        },
        {
            id: "2",
            home_team_id: "me",
            away_team_id: "you",
            home_score: 0,
            away_score: 1,
        },
        {
            id: "3",
            home_team_id: "me",
            away_team_id: "you",
            home_score: 3,
            away_score: 2,
        },
        {
            id: "4",
            home_team_id: "me",
            away_team_id: "you",
            home_score: 1,
            away_score: 2,
        },
        {
            id: "5",
            home_team_id: "me",
            away_team_id: "you",
            home_score: 1,
            away_score: 2,
        },
    ];

    return (
        <div>
            <div className={styles.formSection}>
                <div className={styles.formHeader}>Form</div>
                <div className={styles.formRow}>
                    <div className={styles.formImageWrapper}>
                        <Image
                            src="/soccer/werder-beermen-logo.png"
                            width={30}
                            height={30}
                            alt="Werder Beermen"
                        />
                    </div>
                    <div className={styles.formTeam}>Cole</div>
                    <div className={styles.resultRow}>
                        {my_matches.map((match, idx) => {
                            const isWin = match.home_score > match.away_score;
                            const isDraw =
                                match.home_score === match.away_score;
                            const isLoss = match.home_score < match.away_score;
                            return (
                                <div key={match.id} className={styles.box}>
                                    {isWin && <div className={styles.w}>W</div>}
                                    {isDraw && (
                                        <div className={styles.d}>D</div>
                                    )}
                                    {isLoss && (
                                        <div className={styles.l}>L</div>
                                    )}
                                    {idx === 4 && isWin && (
                                        <div className={styles.wLine}></div>
                                    )}
                                    {idx === 4 && isDraw && (
                                        <div className={styles.dLine}></div>
                                    )}
                                    {idx === 4 && isLoss && (
                                        <div className={styles.lLine}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formImageWrapper}>
                        <Image
                            src="/soccer/tottenham-logo.png"
                            width={30}
                            height={30}
                            alt="Tottenham"
                        />
                    </div>
                    <div className={styles.formTeam}>Tottenham</div>
                    <div className={styles.resultRow}>
                        {my_matches.reverse().map((match, idx) => {
                            const isWin = match.home_score > match.away_score;
                            const isDraw =
                                match.home_score === match.away_score;
                            const isLoss = match.home_score < match.away_score;
                            return (
                                <div key={match.id} className={styles.box}>
                                    {isWin && <div className={styles.w}>W</div>}
                                    {isDraw && (
                                        <div className={styles.d}>D</div>
                                    )}
                                    {isLoss && (
                                        <div className={styles.l}>L</div>
                                    )}
                                    {idx === 4 && isWin && (
                                        <div className={styles.wLine}></div>
                                    )}
                                    {idx === 4 && isDraw && (
                                        <div className={styles.dLine}></div>
                                    )}
                                    {idx === 4 && isLoss && (
                                        <div className={styles.lLine}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.item}>
                    <Link href="https://register.ilovenysoccer.com/team/342/werder-beermen">
                        <div className={styles.imageWrapper}>
                            <Image
                                src="/soccer/werder-beermen-logo.png"
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
                                src="/soccer/gotham-logo.png"
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
                                src="/soccer/metro-logo.png"
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
                                src="/soccer/usc-mens-soccer-logo.png"
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
