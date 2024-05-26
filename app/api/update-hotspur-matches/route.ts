export const dynamic = "force-dynamic"; // static by default, unless reading the request

import axios from "axios";
import { createMatch, createTeam, createMatchUpdate } from "@/app/lib/data";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const TEAM_ID = "73"; // Tottenham Hotspur's team ID in Football-Data.org

export async function GET(request: Request) {
    try {
        const response = await axios.get(
            `https://api.football-data.org/v2/teams/${TEAM_ID}/matches`,
            {
                headers: {
                    "X-Auth-Token": API_KEY,
                },
            },
        );

        const fixtures = response.data.matches;

        for (const fixture of fixtures) {
            const homeTeamName = fixture.homeTeam.name;
            const awayTeamName = fixture.awayTeam.name;
            const awayScore = fixture.score.fullTime.awayTeam;
            const homeScore = fixture.score.fullTime.homeTeam;
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
