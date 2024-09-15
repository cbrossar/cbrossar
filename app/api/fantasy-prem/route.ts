import { upsertFantasyPlayer, upsertFantasyPosition } from "@/app/lib/data";
import { FantasyPlayer, FantasyPosition } from "@/app/lib/definitions";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: Request) {
    try {
        const res = await fetch(
            "https://fantasy.premierleague.com/api/bootstrap-static/",
        );
        const data = await res.json();

        let currentWeek = 1;
        let events = data.events;

        events.forEach(function (element: any) {
            if (element.finished === true) {
                currentWeek = element.id;
            }
        });

        // upsert all fantasy positions
        let positions = data.element_types;
        positions.forEach(async function (element: any) {
            let position: FantasyPosition = {
                id: element.id,
                singular_name: element.singular_name,
                squad_min_play: element.squad_min_play,
                squad_max_play: element.squad_max_play,
            };

            upsertFantasyPosition(position);
        });

        // upsert all player data using upsertFantasyPlayer
        let players = data.elements;
        players.forEach(async function (element: any) {
            let player: FantasyPlayer = {
                id: element.id,
                first_name: element.first_name,
                second_name: element.second_name,
                element_type: element.element_type,
                cost_change_start: element.cost_change_start,
                now_cost: element.now_cost,
                total_points: element.total_points,
                event_points: element.event_points,
            };

            upsertFantasyPlayer(player);
        });

        return new Response(
            "Fantasy data updated for gameweek " + currentWeek,
            { status: 200 },
        );
    } catch (error) {
        return new Response("Error fetching data", { status: 500 });
    }
}
