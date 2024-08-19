export const dynamic = "force-dynamic"; // static by default, unless reading the request

import { fetchTeams } from "@/app/lib/data";

export async function GET(request: Request) {
    try {
        return new Response(JSON.stringify(await fetchTeams()), {   
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        return new Response("Failed to fetch teams", { status: 500 });
    }
}
