import {
    upsertFantasyPlayer,
} from "@/app/lib/data";
import { FantasyPlayer } from "@/app/lib/definitions";
import { calculateTransferIndex } from "./utils";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: Request) {
    try {
        const res = await fetch(
            "https://fantasy.premierleague.com/api/bootstrap-static/"
        );
        const data = await res.json();

        let currentWeek = 1;
        let events = data.events;

        events.forEach(function (element: any) {
            if (element.finished === true) {
                currentWeek = element.id;
            }
        });

        // upsert all player data using upsertFantasyPlayer
        let players = data.elements;
        for (let i = 0; i < players.length; i++) {
            const element = players[i];

            try {
                const playerRes = await fetch(
                    `https://fantasy.premierleague.com/api/element-summary/${element.id}/`
                );

                // Check if the response is not ok (non-200 status)
                if (!playerRes.ok) {
                    console.error(
                        `Error fetching player data for ${element.id}: ${playerRes.statusText}`
                    );
                    continue; // Skip to the next player if there's an error
                }

                // Parse player data as JSON
                const playerData = await playerRes.json();
                
                // Process player data
                const fdr_5 = playerData.fixtures
                    .slice(0, 5)
                    .map((fixture: any) => fixture.difficulty)
                    .reduce((a: any, b: any) => a + b, 0);

                const transferIndex = calculateTransferIndex(element, {
                    fdr_5: fdr_5,
                });

                let player: FantasyPlayer = {
                    id: element.id,
                    first_name: element.first_name,
                    second_name: element.second_name,
                    element_type: element.element_type,
                    cost_change_start: element.cost_change_start,
                    now_cost: element.now_cost,
                    total_points: element.total_points,
                    event_points: element.event_points,
                    minutes: element.minutes,
                    goals_scored: element.goals_scored,
                    assists: element.assists,
                    clean_sheets: element.clean_sheets,
                    expected_goals: element.expected_goals,
                    expected_assists: element.expected_assists,
                    transfers_in: element.transfers_in,
                    transfers_in_event: element.transfers_in_event,
                    fdr_5: fdr_5,
                    transfer_index: transferIndex,
                };

                // Upsert player data
                upsertFantasyPlayer(player);

            } catch (error) {
                console.error(
                    `Error processing player with ID ${element.id}:`,
                    error
                );
                continue; // Skip to the next player
            }

            // Delay for 1 milliseconds every 100 players to avoid rate limiting
            if (i > 0 && i % 100 === 0) {
                await delay(1);
            }
        }

        return new Response(
            "Fantasy data updated for gameweek " + currentWeek,
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching bootstrap-static data:", error);
        return new Response("Error fetching data", { status: 500 });
    }
}
