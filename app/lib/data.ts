import { sql } from "@vercel/postgres";
import { MusicReview, Match, Team } from "./definitions";
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

export async function fetchTeams() {
    noStore();

    try {
        const data = await sql<Team>`SELECT * FROM teams`;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch teams data.");
    }
}

export async function fetchSpursMatches() {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id = (SELECT id FROM teams WHERE name = 'Tottenham')
            OR away_team_id = (SELECT id FROM teams WHERE name = 'Tottenham')
            ORDER BY date ASC limit 5
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch Spurs matches data.");
    }
}

export async function fetchMyMatches() {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id in (SELECT id FROM teams WHERE name = 'Werder Beermen' OR name = 'Brooklyn Hove Albion') 
            OR away_team_id in (SELECT id FROM teams WHERE name = 'Werder Beermen'  OR name = 'Brooklyn Hove Albion')
            ORDER BY date ASC limit 5
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch my matches data.");
    }
}
