import { sql } from "@vercel/postgres";

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

        const under10s = await sql`
            SELECT COUNT(*) as under_10s FROM doomsday_attempt WHERE time_taken_ms < 10000
        `;

        return {
            currentStreak: Number(currentStreak.rows[0].streak),
            highestStreak: Number(highestStreak.rows[0].highest_streak),
            fastestTime: Number(fastestTime.rows[0].fastest_time),
            totalAttempts: Number(totalAttempts.rows[0].total_attempts),
            totalCorrect: Number(totalCorrect.rows[0].total_correct),
            under10s: Number(under10s.rows[0].under_10s),
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch doomsday highest streak.");
    }
}
