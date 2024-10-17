export const dynamic = "force-dynamic"; // static by default, unless reading the request
import { Client } from "@googlemaps/google-maps-services-js";
import {
    fetchRegionsWithoutGeocode,
    updateRegionGeocode,
} from "@/app/data/wine";
import { geocodeRegion } from "./utils";

export async function GET(request: Request) {
    try {
        const client = new Client({});

        const country_codes = ["us", "it", "fr", "es", "pt"];

        for (const country_code of country_codes) {
            const regions = await fetchRegionsWithoutGeocode(country_code);
            console.log("num regions", regions.length);

            for (const region of regions) {
                const response = await geocodeRegion(
                    client,
                    region,
                    country_code,
                );
                if (response.ok) {
                    const { latitude, longitude } = await response.json();
                    await updateRegionGeocode(region.id, latitude, longitude);
                }
            }
        }

        return Response.json({ message: "Geocoding complete" });
    } catch (error) {
        console.error("Error geocoding regions:", error);
        return Response.json({ error: "Geocoding failed", details: error });
    }
}
