export const dynamic = "force-dynamic"; // static by default, unless reading the request
import { Client } from "@googlemaps/google-maps-services-js";
import { geocodeBackfill, fixRegionGeocode } from "./utils";

export async function GET(request: Request) {
    try {
        const client = new Client({});

        return Response.json({ message: "Geocoding complete" });
    } catch (error) {
        console.error("Error geocoding regions:", error);
        return Response.json({ error: "Geocoding failed", details: error });
    }
}
