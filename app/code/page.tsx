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
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Github</div>
            </div>
            <div className={styles.item}>
                <Link href="https://www.remesh.ai/">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/remesh.jpeg"
                            width={200}
                            height={200}
                            alt="Remesh"
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Remesh</div>
            </div>
            <div className={styles.item}>
                <Link href="https://drive.google.com/file/d/0B_un9hwZtr98cUJrLUY5XzBTOVE/view?resourcekey=0-KZFLd5dJLt9tSxrqM_tW0Q">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/maxaer.png"
                            width={200}
                            height={200}
                            alt="Maxaer"
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Maxaer</div>
            </div>
            <div className={styles.item}>
                <Link href="10k">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/10k.jpeg"
                            width={200}
                            height={200}
                            alt="10k"
                        />
                    </div>
                </Link>
                <div className={styles.caption}>10,000th Day</div>
            </div>
            <div className={styles.item}>
                <Link href="https://bracket-game.web.app/">
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/code/bracket.png"
                            width={200}
                            height={200}
                            alt="Bracket Game"
                        />
                    </div>
                </Link>
                <div className={styles.caption}>Bracket Game</div>
            </div>
        </div>
    );
}
