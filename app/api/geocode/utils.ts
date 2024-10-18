import { Client } from "@googlemaps/google-maps-services-js";
import { Region } from "@/app/lib/definitions";
import {
    fetchRegionsWithoutGeocode,
    updateRegionGeocode,
    fetchRegionById,
} from "@/app/data/wine";

const API_KEY = process.env.GEOCODING_API_KEY;


export async function geocodeBackfill(client: Client) {
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
}


export async function geocodeRegion(
    client: Client,
    region: Region,
    country_code: string,
    address_override?: string,
) {
    try {
        const response = await client.geocode({
            params: {
                address: address_override || region.name,
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


export async function fixRegionGeocode(client: Client, region_id: number, address_override: string) {
    const region = await fetchRegionById(region_id);

    const response = await geocodeRegion(client, region, region.country_code, address_override);
    if (response.ok) {
        const { latitude, longitude } = await response.json();
        await updateRegionGeocode(region.id, latitude, longitude);
    }
}
