import axios from "axios";
import cheerio from "cheerio";
import { createMatch, createTeam, createMatchUpdate } from "@/app/lib/data";

export default async function updateBeermenMatches() {
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
            await createTeam(homeTeamName);
            await createTeam(awayTeamName);
            await createMatch(
                homeTeamName,
                awayTeamName,
                homeScore,
                awayScore,
                matchDate,
            );
        }

        await createMatchUpdate(true);

    } catch (error) {
        await createMatchUpdate(false);
        return new Response("Failed to crawl the webpage.", { status: 500 });
    }
}