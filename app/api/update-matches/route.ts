export const dynamic = "force-dynamic"; // static by default, unless reading the request

import axios from "axios";
import cheerio from "cheerio";
import { createTeam, createMatch, createMatchUpdate } from "@/app/lib/data";

export async function GET(request: Request) {
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
            createTeam(homeTeamName);
            createTeam(awayTeamName);
            createMatch(
                homeTeamName,
                awayTeamName,
                homeScore,
                awayScore,
                matchDate,
            );

            console.log("Attempted to create match.");
        });
        createMatchUpdate(true);

        // Send back the extracted data as a response
        return new Response("Successfully crawled the webpage.");
    } catch (error) {
        createMatchUpdate(false);
        return new Response("Failed to crawl the webpage.", { status: 500 });
    }
}
