import {
    MusicbrainzRelease,
    MusicReview,
    SpotifyRelease,
} from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchMusicReviews(query: string) {
    // Prevent the response from being cached
    noStore();

    try {
        // Build the SQL query dynamically based on the existence of a query
        const data = query
            ? await sql<MusicReview>`
                    SELECT * FROM music_reviews
                    WHERE artist ILIKE '%' || ${query} || '%'
                    OR album ILIKE '%' || ${query} || '%'
                    ORDER BY created DESC
                `
            : await sql<MusicReview>`
                    SELECT * FROM music_reviews
                    ORDER BY created DESC
                `;

        return data.rows;
    } catch (error) {
        console.error(
            "Database error: Failed to fetch music reviews data.",
            error,
        );
        return null;
    }
}

export async function fetchMusicReviewById(id: string) {
    noStore();

    try {
        const data =
            await sql<MusicReview>`SELECT * FROM music_reviews WHERE id = ${id}`;
        return data.rows[0];
    } catch (error) {
        console.error(
            "Database error: Failed to fetch music review data.",
            error,
        );
        return null;
    }
}

export async function fetchSpotifyReleases() {
    noStore();

    try {
        const data =
            await sql<SpotifyRelease>`SELECT * FROM spotify_releases ORDER BY release_date DESC`;
        return data.rows;
    } catch (error) {
        console.error(
            "Database error: Failed to fetch spotify releases.",
            error,
        );
        return null;
    }
}

export async function fetchMusicbrainzReleases() {
    noStore();

    try {
        const data =
            await sql<MusicbrainzRelease>`SELECT * FROM musicbrainz_releases WHERE release_date > CURRENT_DATE ORDER BY release_date ASC LIMIT 10`;
        return data.rows;
    } catch (error) {
        console.error(
            "Database error: Failed to fetch musicbrainz releases.",
            error,
        );
        return null;
    }
}
