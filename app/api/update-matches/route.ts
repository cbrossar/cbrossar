export const dynamic = "force-dynamic"; // static by default, unless reading the request

import axios from "axios";
import cheerio from "cheerio";
import { createMatch } from "@/app/lib/data";
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

        const scheduleMatches = $(".schedule-match").toArray();

        for (const element of scheduleMatches) {
            const matchDate = $(element).attr("data-date") ?? "";
            const awayScore = parseInt(
                $(element).attr("data-away_score") ?? "0",
                10,
            );
            const homeScore = parseInt(
                $(element).attr("data-home_score") ?? "0",
                10,
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
            await createTeam(client, homeTeamName);
            await createTeam(client, awayTeamName);
            createMatch(
                homeTeamName,
                awayTeamName,
                homeScore,
                awayScore,
                matchDate,
            );

            console.log("Attempted to create match.");
        }

        await createMatchUpdate(client, true);

        await client.end();

        // Send back the extracted data as a response
        return new Response("Successfully crawled the webpage.");
    } catch (error) {
        await createMatchUpdate(client, false);
        await client.end();
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
