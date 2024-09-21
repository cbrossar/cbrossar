import axios from "axios";
import { createMatch, createTeam, createMatchUpdate } from "@/app/lib/data";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const TEAM_ID = "73"; // Tottenham Hotspur's team ID in Football-Data.org

export async function updateHotspurMatches() {
    try {
        // 3 weeks ago
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 21);
        const dateFromString = dateFrom.toISOString().split("T")[0];

        // today
        const dateTo = new Date();
        const dateToString = dateTo.toISOString().split("T")[0];

        const response = await axios.get(
            `https://api.football-data.org/v4/teams/${TEAM_ID}/matches?dateFrom=${dateFromString}&dateTo=${dateToString}`,
            {
                headers: {
                    "X-Auth-Token": API_KEY,
                },
            },
        );

        const fixtures = response.data.matches;

        for (const fixture of fixtures) {
            console.log(fixture);
            const homeTeamName = fixture.homeTeam.name;
            const awayTeamName = fixture.awayTeam.name;
            const awayScore = fixture.score.fullTime.away;
            const homeScore = fixture.score.fullTime.home;
            const matchDate = fixture.utcDate;

            console.log(
                matchDate,
                homeTeamName,
                awayTeamName,
                homeScore,
                awayScore,
            );

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

        // Send back the extracted data as a response
        return new Response("Successfully fetched spurs matches.");
    } catch (error) {
        await createMatchUpdate(false);
        return new Response("Failed to fetch spurs matches.", { status: 500 });
    }
}