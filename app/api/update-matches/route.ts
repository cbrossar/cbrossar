export const dynamic = "force-dynamic"; // static by default, unless reading the request

import axios from "axios";
import cheerio from "cheerio";
const { db } = require("@vercel/postgres");

export async function GET(request: Request) {
    const client = await db.connect();

    try {
        const url =
            "https://register.ilovenysoccer.com/team/342/werder-beermen";

        // Make a GET request to the specified URL
        const response = await axios.get(url);

        // Load the HTML content into Cheerio
        const $ = cheerio.load(response.data);

        if (!$) {
            return new Response("Failed to load the webpage", { status: 500 });
        }

        // Iterate over each .schedule-match element
        $(".schedule-match").each((index, element) => {
            const matchDate = $(element).attr("data-date") ?? "";
            const awayScore = parseInt(
                $(element).attr("data-away_score") ?? "0",
                0,
            );
            const homeScore = parseInt(
                $(element).attr("data-home_score") ?? "0",
                0,
            );

            console.log(matchDate, homeScore, awayScore);

            // Extract home and away team names
            const homeTeamName = $(element)
                .find(".home-team .match-team")
                .text()
                .trim();
            const awayTeamName = $(element)
                .find(".away-team .match-team")
                .text()
                .trim();

            console.log(homeTeamName, awayTeamName);

            // create team if not exists
            createTeam(client, homeTeamName);
            createTeam(client, awayTeamName);
            createMatch(
                client,
                homeTeamName,
                awayTeamName,
                homeScore,
                awayScore,
                matchDate,
            );

            console.log("Attempted to create match.");
        });
        createMatchUpdate(client, true);

        // Send back the extracted data as a response
        return new Response("Successfully crawled the webpage.");
    } catch (error) {
        createMatchUpdate(client, false);
        return new Response("Failed to crawl the webpage.", { status: 500 });
    }
}

async function createTeam(client: { sql: any }, name: string) {
    try {
        await client.sql`
            INSERT INTO teams (name)
            VALUES (${name})
            ON CONFLICT (name) DO NOTHING
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create team.");
    }
}

async function createMatch(
    client: { sql: any },
    homeTeamName: string,
    awayTeamName: string,
    homeScore: number,
    awayScore: number,
    date: string,
) {
    console.log("Attempt to create match.");
    try {
        const existingMatch = await client.sql`
            SELECT id FROM matches
            WHERE home_team_id = (SELECT id FROM teams WHERE name = ${homeTeamName})
            AND away_team_id = (SELECT id FROM teams WHERE name = ${awayTeamName})
            AND home_score = ${homeScore}
            AND away_score = ${awayScore}
            AND date = ${date}
        `;

        console.log("Existing match:", existingMatch);

        if (existingMatch.rows.length === 0) {
            console.log("Creating new match.");
            await client.sql`
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

async function createMatchUpdate(client: { sql: any }, success: boolean) {
    try {
        await client.sql`
            INSERT INTO match_updates (success)
            VALUES (${success})
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create match update.");
    }
}
