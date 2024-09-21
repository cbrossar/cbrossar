export const dynamic = "force-dynamic"; // static by default, unless reading the request

import updateBeermenMatches from "./update-beermen-matches";
import { updateHotspurMatches } from "./update-hotspur-mtaches";

export async function GET(request: Request) {
    updateBeermenMatches();
    updateHotspurMatches();

    // Send back the extracted data as a response
    return new Response("Successfully crawled the webpage.");
}
