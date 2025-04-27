export const dynamic = "force-dynamic"; // static by default, unless reading the request

import { createDoomsdayAttempt, fetchDoomsdayStats } from "@/app/data/doomsday";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const attempt = await createDoomsdayAttempt(
            body.correct,
            body.time_taken_ms,
        );
        return new Response(JSON.stringify(attempt), {
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        return new Response("Failed to fetch teams", { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        return new Response(JSON.stringify(await fetchDoomsdayStats()), {
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        return new Response("Failed to fetch doomsday stats", { status: 500 });
    }
}
