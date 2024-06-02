import Image from "next/image";
import Link from "next/link";
import { fetchMusicReviews } from "@/app/lib/data";
import Search from "../ui/search";
import styles from "./styles.module.css";

export default async function Page() {
    const musicReviews = await fetchMusicReviews();

    return (
        <div>
            <div className={styles.grid}>
                {musicReviews.map((review, i) => (
                    <div key={i}>
                        <div className={styles.imageWrapper}>
                            <Link href={`/music/${review.id}`}>
                                <Image
                                    src={review.image_url}
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
                        <p>{review.album}</p>
                        <p>{review.artist}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
