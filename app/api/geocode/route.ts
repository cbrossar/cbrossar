export const dynamic = "force-dynamic"; // static by default, unless reading the request
import { Client } from "@googlemaps/google-maps-services-js";

const API_KEY = process.env.GEOCODING_API_KEY;

export async function GET(request: Request) {
    const client = new Client({});

    const region = "Douro";

    try {
        const response = await client.geocode({
            params: {
                address: region,
                components: {
                    country: "pt", // Restrict to Portugal
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
        return Response.json({ error: "Geocoding failed", details: error });
    }
}
