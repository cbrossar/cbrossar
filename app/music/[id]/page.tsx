import { fetchMusicReviewById } from "@/app/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import styles from "./styles.module.css";

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    const review = await fetchMusicReviewById(id);
    if (!review) {
        notFound();
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.image}>
                <Image
                    src={review.image_url}
                    width={500}
                    height={500}
                    alt={`Photo ${review.id}`}
                />
            </div>
            <div className={styles.details}>
                <h1 className={styles.album}>{review.album}</h1>
                <h2 className={styles.artist}> By {review.artist}</h2>
                <p className={styles.review}>{review.review}</p>
                <p className={styles.reviewedBy}>- {review.name}</p>
                <div className={styles.circle}>
                    <div className={styles.rating}>
                        {review.rating.toFixed(1)}
                    </div>
                </div>
            </div>
        </div>
    );
}
