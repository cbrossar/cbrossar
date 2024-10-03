import axios from "axios";
import { createMatch, createTeam, createMatchUpdate } from "@/app/lib/data";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const TEAM_ID = "73"; // Tottenham Hotspur's team ID in Football-Data.org

export default async function updateHotspurMatches() {
    try {
        console.log("Updating Hotspur matches...");
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

        console.log("After response");

        const fixtures = response.data.matches;

        console.log("Fixture length", fixtures.length);

        for (const fixture of fixtures) {
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
    } catch (error) {
        await createMatchUpdate(false);
        console.error("Failed to update Hotspur matches", error);
    }
}
