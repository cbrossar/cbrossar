import { MusicReview } from "@/app/lib/definitions";
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
