import Image from "next/image";
import Link from "next/link";
import CurrentForm from "./CurrentForm";
import {
    fetchTeams,
    fetchSpursMatches,
    fetchWerderMatches,
    fetchGarnetMatches,
} from "@/app/data/soccer";
import styles from "../styles.module.css";
import { Team } from "../../lib/definitions";
import { SPURS, WERDER_BEERMEN, GARNET_UNITED } from "../../lib/constants";

export default async function Page() {
    const teams = await fetchTeams();
    const teamNameMap = teams.reduce(
        (acc: { [key: string]: string }, team: Team) => {
            acc[team.id] = team.name;
            return acc;
        },
        {},
    );
    const formTeamNames = [WERDER_BEERMEN, GARNET_UNITED, SPURS];
    const formTeams = formTeamNames.map((name) =>
        teams.find((team: Team) => team.name === name),
    );
    const numMatches = 5;
    const spursMatches = await fetchSpursMatches(numMatches);
    const werderMatches = await fetchWerderMatches(numMatches);
    const garnetMatches = await fetchGarnetMatches(numMatches);

    return (
        <div className={styles.centerContainer}>
            <div className={styles.formSection}>
                <CurrentForm
                    formTeams={formTeams}
                    spursMatches={spursMatches}
                    werderMatches={werderMatches}
                    garnetMatches={garnetMatches}
                    teamNameMap={teamNameMap}
                    numMatches={numMatches}
                />
            </div>

            <div className={styles.grid}>
                <div className={styles.item}>
                    <Link href="https://register.ilovenysoccer.com/team/342/werder-beermen">
                        <div className={styles.imageWrapper}>
                            <Image
                                src="/soccer/werder-beermen.png"
                                width={200}
                                height={200}
                                alt={WERDER_BEERMEN}
                            />
                        </div>
                    </Link>
                    <div className={styles.caption}>Werder Beermen</div>
                </div>
                <div className={styles.item}>
                    <Link href="https://metrosoccerny.leagueapps.com/leagues/4374844/teams/7033425">
                        <div className={styles.imageWrapper}>
                            <Image
                                src="/soccer/swathmore.png"
                                width={200}
                                height={200}
                                alt="Swathmore"
                            />
                        </div>
                    </Link>
                    <div className={styles.caption}>Garnet United</div>
                </div>
                <div className={styles.item}>
                    <Link href="fantasy-prem/players">
                        <div className={styles.imageWrapper}>
                            <Image
                                src="/code/fantasy-prem.png"
                                width={200}
                                height={200}
                                alt="Fantasy Premier League"
                            />
                        </div>
                    </Link>
                    <div className={styles.caption}>Fantasy Prem</div>
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
