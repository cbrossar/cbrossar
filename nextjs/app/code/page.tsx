import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

export default function Page() {
    return (
        <div className={styles.grid}>
            <div className={styles.item}>
                <Link href="https://github.com/cbrossar">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/github.png"
                            width={200}
                            height={200}
                            alt="Github"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Github</div>
            </div>
            <div className={styles.item}>
                <Link href="https://www.remesh.ai/">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/remesh.png"
                            width={130}
                            height={130}
                            alt="Remesh"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Remesh</div>
            </div>
            <div className={styles.item}>
                <Link href="soccer/fantasy-prem/players">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/fantasy-prem.png"
                            width={200}
                            height={200}
                            alt="Fantasy Premier League"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Fantasy Prem</div>
            </div>
            <div className={styles.item}>
                <Link href="bethpage">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/bethpage.jpeg"
                            width={200}
                            height={200}
                            alt="bethpage"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Bethpage</div>
            </div>
            <div className={styles.item}>
                <Link href="ltrain">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/L-train.png"
                            width={200}
                            height={200}
                            alt="L Train"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>L Train</div>
            </div>
            <div className={styles.item}>
                <Link href="wine">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/wine.png"
                            width={200}
                            height={200}
                            alt="Wine"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Wine</div>
            </div>
            <div className={styles.item}>
                <Link href="10k">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/10k.jpeg"
                            width={200}
                            height={200}
                            alt="10k"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>10,000th Day</div>
            </div>
            <div className={styles.item}>
                <Link href="/code/maxaer.jar">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/maxaer.png"
                            width={200}
                            height={200}
                            alt="Maxaer"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Maxaer</div>
            </div>
            <div className={styles.item}>
                <Link href="https://bracket-game.web.app/">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/bracket.png"
                            width={200}
                            height={200}
                            alt="Bracket Game"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Bracket Game</div>
            </div>
            <div className={styles.item}>
                <Link href="doomsday">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/doomsday.png"
                            width={200}
                            height={200}
                            alt="Doomsday"
                            priority
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Doomsday</div>
            </div>
        </div>
    );
}
