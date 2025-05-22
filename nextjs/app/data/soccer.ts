import { Match, Team } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";
import { SPURS, WERDER_BEERMEN, GARNET_UNITED } from "../lib/constants";

export async function fetchTeams() {
    noStore();

    try {
        const data = await sql<Team>`SELECT * FROM teams`;
        return data.rows;
    } catch (error) {
        console.error("Failed to fetch teams data. Database Error:", error);
        return null;
    }
}
export async function fetchSpursMatches(count: number) {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id = (SELECT id FROM teams WHERE name = ${SPURS})
            OR away_team_id = (SELECT id FROM teams WHERE name = ${SPURS})
            ORDER BY date DESC limit ${count}
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch Spurs matches data.");
    }
}

export async function fetchWerderMatches(count: number) {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id in (SELECT id FROM teams WHERE name = ${WERDER_BEERMEN}) 
            OR away_team_id in (SELECT id FROM teams WHERE name = ${WERDER_BEERMEN})
            ORDER BY date DESC limit ${count}
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch my matches data.");
    }
}

export async function fetchGarnetMatches(count: number) {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id in (SELECT id FROM teams WHERE name = ${GARNET_UNITED}) 
            OR away_team_id in (SELECT id FROM teams WHERE name = ${GARNET_UNITED})
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
    try {
        const existingMatch = await sql`
            SELECT id FROM matches
            WHERE home_team_id = (SELECT id FROM teams WHERE name = ${homeTeamName})
            AND away_team_id = (SELECT id FROM teams WHERE name = ${awayTeamName})
            AND home_score = ${homeScore}
            AND away_score = ${awayScore}
            AND date = ${date}
        `;

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
