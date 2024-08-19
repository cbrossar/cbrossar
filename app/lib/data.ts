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

export async function fetchSpursMatches(count: number) {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id = (SELECT id FROM teams WHERE name = 'Tottenham Hotspur FC')
            OR away_team_id = (SELECT id FROM teams WHERE name = 'Tottenham Hotspur FC')
            ORDER BY date DESC limit ${count}
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch Spurs matches data.");
    }
}

export async function fetchMyMatches(count: number) {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id in (SELECT id FROM teams WHERE name = 'Werder Beermen' OR name = 'Brooklyn Hove Albion') 
            OR away_team_id in (SELECT id FROM teams WHERE name = 'Werder Beermen'  OR name = 'Brooklyn Hove Albion')
            ORDER BY date DESC limit ${count}
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch my matches data.");
    }
}

export async function createMatch(
    homeTeamName: string,
    awayTeamName: string,
    homeScore: number,
    awayScore: number,
    date: string,
) {
    console.log("Attempt to create match.");
    try {
        const existingMatch = await sql`
            SELECT id FROM matches
            WHERE home_team_id = (SELECT id FROM teams WHERE name = ${homeTeamName})
            AND away_team_id = (SELECT id FROM teams WHERE name = ${awayTeamName})
            AND home_score = ${homeScore}
            AND away_score = ${awayScore}
            AND date = ${date}
        `;

        console.log("Existing match:", existingMatch);

        if (existingMatch.rows.length === 0) {
            await sql`
                INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date)
                VALUES (
                    (SELECT id FROM teams WHERE name = ${homeTeamName}),
                    (SELECT id FROM teams WHERE name = ${awayTeamName}),
                    ${homeScore},
                    ${awayScore},
                    ${date}
                )
            `;
        }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create match.");
    }
}

export async function createTeam(name: string) {
    try {
        await sql`
            INSERT INTO teams (name)
            VALUES (${name})
            ON CONFLICT (name) DO NOTHING
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create team.");
    }
}

export async function createMatchUpdate(success: boolean) {
    try {
        await sql`
            INSERT INTO match_updates (success)
            VALUES (${success})
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create match update.");
    }
}

export async function fetchBethpage() {
    try {
        const response = await fetch("/api/bethpage");
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error("Failed to fetch booking data");
    }
}

export async function fetchLTrainTimes() {
    try {
        const response = await fetch("/api/ltrain");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch L train times data");
    }
}

export async function createDoomsdayAttempt(
    correct: boolean,
    time_taken_ms: number,
) {
    try {
        // Get the most recent attempt
        const mostRecentAttempt = await sql`
            SELECT * FROM doomsday_attempt ORDER BY created DESC LIMIT 1
        `;

        let streak = 1;

        if (mostRecentAttempt.rows.length > 0 && correct) {
            const lastAttempt = mostRecentAttempt.rows[0];
            streak = lastAttempt.streak + 1;
        } else if (!correct) {
            streak = 0;
        }

        await sql`
            INSERT INTO doomsday_attempt (correct, time_taken_ms, streak)
            VALUES (${correct}, ${time_taken_ms}, ${streak})
        `;

        return {
            correct,
            time_taken_ms,
            streak,
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create doomsday attempt.");
    }
}

export async function fetchDoomsdayStats() {
    try {
        const currentStreak = await sql`
            SELECT streak FROM doomsday_attempt ORDER BY created DESC LIMIT 1
        `;

        const highestStreak = await sql`
            SELECT MAX(streak) as highest_streak FROM doomsday_attempt
        `;

        const fastestTime = await sql`
            SELECT MIN(time_taken_ms) as fastest_time FROM doomsday_attempt WHERE correct = true
        `;

        const totalAttempts = await sql`
            SELECT COUNT(*) as total_attempts FROM doomsday_attempt
        `;

        const totalCorrect = await sql`
            SELECT COUNT(*) as total_correct FROM doomsday_attempt WHERE correct = true
        `;

        return {
            currentStreak: currentStreak.rows[0].streak,
            highestStreak: highestStreak.rows[0].highest_streak,
            fastestTime: fastestTime.rows[0].fastest_time,
            totalAttempts: totalAttempts.rows[0].total_attempts,
            totalCorrect: totalCorrect.rows[0].total_correct,
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch doomsday highest streak.");
    }
}
