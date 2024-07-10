import { fetchMusicReviewById } from "@/app/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    const review = await fetchMusicReviewById(id);
    if (!review) {
        notFound();
    }

    const reviewDate = new Date(review.created).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/New_York",
    });

    const spotify_album_link = "https://open.spotify.com/album/";

    return (
        <div>
            <div className={styles.wrapper}>
                <div className={styles.image}>
                    <Link href={spotify_album_link + review.spotify_album_id}>
                        <Image
                            src={review.image_url}
                            width={500}
                            height={500}
                            alt={`Photo ${review.id}`}
                        />
                        <p className="text-gray-500 text-sm mt-4">
                            Click to open in Spotify.
                        </p>
                    </Link>
                </div>
                <div className={styles.details}>
                    <h1 className={styles.album}>{review.album}</h1>
                    <h2 className={styles.artist}> By {review.artist}</h2>

                    <div className={styles.circle}>
                        <div className={styles.rating}>
                            {review.rating.toFixed(1)}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.review}>
                <p className={styles.reviewText}>
                    {review.review.split("\n").map((line, index) => (
                        <span key={index}>
                            {line}
                            <br />
                        </span>
                    ))}
                </p>
                <p className={styles.reviewedBy}>
                    - {review.name}, {reviewDate}
                </p>
            </div>
        </div>
    );
}
