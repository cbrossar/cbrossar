import Image from "next/image";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { fetchMusicReviews } from "@/app/data/music";
import Search from "@/app/ui/search";
import styles from "./styles.module.css";

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        query?: string;
    };
}) {
    const query = searchParams?.query || "";

    const musicReviews = await fetchMusicReviews(query);

    if (musicReviews === null) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded">
                    Error: Unable to fetch music reviews. Please try again
                    later.
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <Search
                        placeholder="Search Reviews"
                        shouldSetPage={false}
                    />
                </div>
                <div className={styles.topRightCorner}>
                    <Link href="/music/create" className={styles.addButton}>
                        <PlusIcon className="h-5 w-5" />
                    </Link>
                </div>
            </div>
            {musicReviews.length === 0 ? (
                <div className="flex items-center justify-center">
                    <div className="text-gray-600 text-sm font-medium bg-gray-50 px-4 py-3 rounded">
                        No music reviews found.
                    </div>
                </div>
            ) : (
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
                            <h3 className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">
                                {review.album}
                            </h3>
                            <p className="text-gray-600 text-xs mb-2">
                                {review.artist}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
