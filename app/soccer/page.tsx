import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

export default function Page() {
    return (
        <div>
            <div className={styles.grid}>
                <div className={styles.imageWrapper}>
                    <Link href="https://register.ilovenysoccer.com/team/342/werder-beermen">
                        <Image
                            src="/soccer/werder-beermen-logo.png"
                            width={500}
                            height={500}
                            alt="Werder Beermen"
                        />
                    </Link>
                </div>
                <div className={styles.imageWrapper}>
                    <Link href="https://gothamsoccer.com/newyorkcity">
                        <Image
                            src="/soccer/gotham-logo.png"
                            width={500}
                            height={500}
                            alt="Gotham"
                        />
                    </Link>
                </div>
                <div className={styles.imageWrapper}>
                    <Link href="https://sfelitemetro.com/">
                        <Image
                            src="/soccer/metro-logo.png"
                            width={500}
                            height={500}
                            alt="Metro"
                        />
                    </Link>
                </div>
                <div className={styles.imageWrapper}>
                    <Link href="https://uscmenssoccer.wordpress.com/">
                        <Image
                            src="/soccer/usc-mens-soccer-logo.png"
                            width={500}
                            height={500}
                            alt="USC Mens Soccer"
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}
