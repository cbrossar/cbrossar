export const dynamic = "force-dynamic"; // static by default, unless reading the request

import {
    store_grapes,
    store_countries,
    store_regions,
    explore_wines,
} from "./utils";
import { fetchRegions } from "@/app/lib/data";

export async function GET(request: Request) {
    try {
        // await store_grapes();
        // await store_countries();
        // await store_regions();

        const red_wine_id = 1;
        // const country_codes = ["us", "fr", "it", "es", "pt"];

        const country_codes = ["us"];

        const priceRanges = [
            [0, 5],
            [5, 10],
            [10, 15],
            [15, 20],
            [20, 30],
            [30, 50],
            [50, 100],
            [100, 200],
            [200, 500],
            [500, 1000],
            [1000, 5000],
        ];

        for (const country_code of country_codes) {
            const regions = await fetchRegions(country_code);
            for (const region of regions) {
                for (const [price_range_min, price_range_max] of priceRanges) {
                    await explore_wines(
                        red_wine_id,
                        country_code,
                        region.id,
                        price_range_min,
                        price_range_max,
                    );
                }
            }
        }

        return Response.json({ message: "Success" });
    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json(
            { error: "Failed to fetch data" },
            { status: 500 },
        );
    }
}
