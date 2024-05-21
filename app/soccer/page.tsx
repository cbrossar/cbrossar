import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

export default function Page() {
    return (
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
    );
}
