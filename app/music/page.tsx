import Image from "next/image";
import Link from "next/link";
import { fetchMusicReviews } from "@/app/lib/data";
import styles from "./styles.module.css";

export default async function Page() {
    const musicReviews = await fetchMusicReviews();

    return (
        <div>
            <div className={styles.grid}>
                {musicReviews.map((review, i) => (
                    <div key={i}>
                        <div className={styles.imageWrapper}>
                            <Link href="/">
                                <Image
                                    src={"/flower-boy.jpg"}
                                    width={500}
                                    height={500}
                                    alt={`Photo ${i}`}
                                />
                                <div className={styles.imageText}>
                                    <div className={styles.circle}>
                                        <div className={styles.rating}>
                                            {review.rating.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <p>{review.artist}</p>
                        <p>{review.album}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
