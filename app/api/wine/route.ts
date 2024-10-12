export const maxDuration = 60;

export const dynamic = "force-dynamic"; // static by default, unless reading the request

import {
    store_grapes,
    store_countries,
    store_regions,
    fetchExploreWineNumRecordsMatched,
    explore_wines,
} from "./utils";
import { fetchRegions, fetchWineries, fetchWines } from "@/app/lib/data";

export async function GET(request: Request) {
    try {
        // await store_grapes();
        // await store_countries();
        // await store_regions();

        const { searchParams } = new URL(request.url);
        const param_red_wine_id = parseInt(searchParams.get("wine_type_id") ?? "1");
        const param_country_code = searchParams.get("country_code") || null;
        const param_region_id = parseInt(searchParams.get("region_id") ?? "") || null;

        if (!param_country_code) {
            return Response.json(
                { error: "Country code is required" },
                { status: 400 },
            );
        }

        const country_codes = [param_country_code];

        const wineries = await fetchWineries();
        const wines = await fetchWines();

        const seen_wineries: Set<number> = new Set(
            wineries.map((winery) => winery.id),
        );
        const seen_wines: Set<number> = new Set(wines.map((wine) => wine.id));

        const priceRanges = [
            [0, 10],
            [10, 15],
            [15, 20],
            [20, 30],
            [30, 40],
            [40, 50],
            [50, 70],
            [70, 90],
            [90, 120],
            [120, 200],
            [200, 500],
            [500, 100000],
        ];

        for (const country_code of country_codes) {
            const regions = await fetchRegions(country_code, param_region_id);
            let index = 1;

            for (const region of regions) {
                console.log(`Region ${index}: ${region.name}`);
                index++;

                const price_min = priceRanges[0][0];
                const price_max = priceRanges[priceRanges.length - 1][1];

                try {
                    const num_records_matched =
                        await fetchExploreWineNumRecordsMatched(
                            param_red_wine_id,
                            param_country_code,
                            region.id,
                            price_min,
                            price_max,
                        );

                    if (num_records_matched < 3000) {
                        await explore_wines(
                            param_red_wine_id,
                            param_country_code,
                            region.id,
                            price_min,
                            price_max,
                            seen_wineries,
                            seen_wines,
                            num_records_matched,
                        );

                        continue;
                    }

                    for (const [
                        price_range_min,
                        price_range_max,
                    ] of priceRanges) {
                        const num_records_matched =
                            await fetchExploreWineNumRecordsMatched(
                                param_red_wine_id,
                                param_country_code,
                                region.id,
                                price_range_min,
                                price_range_max,
                            );

                        await explore_wines(
                            param_red_wine_id,
                            param_country_code,
                            region.id,
                            price_range_min,
                            price_range_max,
                            seen_wineries,
                            seen_wines,
                            num_records_matched,
                        );
                    }
                } catch (error) {
                    if (
                        error instanceof Error &&
                        error.message.includes("Too many requests")
                    ) {
                        console.error("Rate limit exceeded. Waiting 10 seconds before retrying...");
                        // await new Promise(resolve => setTimeout(resolve, 10000));
                        return Response.json(
                            { error: "Rate limit exceeded" },
                            { status: 429 },
                        );
                    }
                    console.error("Error fetching wines:", error);
                    console.error(
                        "Params: ",
                        param_country_code,
                        region.id,
                        price_min,
                        price_max,
                    );
                }
            }
        }

        return Response.json({ message: "Success" });
    } catch (error) {
        const errorResponse = {
            error: "Failed to fetch data",
            ...(error instanceof SyntaxError ? { message: error.message } :
               error instanceof Error && "cause" in error ? { cause: error.cause } :
               {})
        };

        return Response.json(errorResponse, { status: 500 });
    }
}
