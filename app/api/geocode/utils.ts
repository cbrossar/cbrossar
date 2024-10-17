import { Region } from "@/app/lib/definitions";
import { Client } from "@googlemaps/google-maps-services-js";

const API_KEY = process.env.GEOCODING_API_KEY;

export async function geocodeRegion(
    client: Client,
    region: Region,
    country_code: string,
) {
    try {
        const response = await client.geocode({
            params: {
                address: region.name,
                components: {
                    country: country_code,
                },
                key: API_KEY || "",
            },
            timeout: 1000, // Optional timeout in milliseconds
        });

        // Check if results were found
        if (response.data.results.length === 0) {
            return Response.json({ error: "No results found" });
        }

        // Get the first result's latitude and longitude
        const location = response.data.results[0].geometry.location;
        return Response.json({
            latitude: location.lat,
            longitude: location.lng,
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Geocoding failed", details: error });
    }
}
