import { sql } from "@vercel/postgres";
import { MusicReview } from "./definitions";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchMusicReviews() {
    // Add noStore() here to prevent the response from being cached.
    // This is equivalent to in fetch(..., {cache: 'no-store'}).
    noStore();

    try {
        const data =
            await sql<MusicReview>`SELECT * FROM music_reviews ORDER BY created DESC`;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch music reviews data.");
    }
}

export async function fetchMusicReviewById(id: string) {
    noStore();

    try {
        const data =
            await sql<MusicReview>`SELECT * FROM music_reviews WHERE id = ${id}`;
        return data.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch music review data.");
    }
}

export async function fetchMatches() {
    noStore();

    try {
        const data = await sql`SELECT * FROM matches ORDER BY date DESC`;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch Spurs matches data.");
    }
}
