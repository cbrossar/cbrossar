export const dynamic = "force-dynamic"; // static by default, unless reading the request
import { Client } from "@googlemaps/google-maps-services-js";
import { fetchRegionById, updateRegionGeocode } from "@/app/data/wine";
import { geocodeRegion } from "./utils";

export async function GET(request: Request) {
    try {
        const client = new Client({});

        const region_id = 88;
        const country_code = 'us';
        const address_override = "Stags Leap Winery, Napa Valley, CA";

        const region = await fetchRegionById(region_id);
        const response = await geocodeRegion(client, region, country_code, address_override);
        if (response.ok) {
            const { latitude, longitude } = await response.json();
            await updateRegionGeocode(region.id, latitude, longitude);
        }
        return Response.json({ message: "Geocoding complete" });
        
    } catch (error) {
        console.error("Error geocoding regions:", error);
        return Response.json({ error: "Geocoding failed", details: error });
    }
}
