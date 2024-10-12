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
        const red_wine_id = parseInt(searchParams.get("wine_type_id") ?? "1");
        const country_code = searchParams.get("country_code") || null;

        if (!country_code) {
            return Response.json(
                { error: "Country code is required" },
                { status: 400 },
            );
        }

        const country_codes = [country_code];

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
            const regions = await fetchRegions(country_code);
            let index = 1;

            for (const region of regions) {
                console.log(`Region ${index}: ${region.name}`);
                index++;

                const price_min = priceRanges[0][0];
                const price_max = priceRanges[priceRanges.length - 1][1];

                try {
                    const num_records_matched =
                        await fetchExploreWineNumRecordsMatched(
                            red_wine_id,
                            country_code,
                            region.id,
                            price_min,
                            price_max,
                        );

                    if (num_records_matched < 3000) {
                        await explore_wines(
                            red_wine_id,
                            country_code,
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
                                red_wine_id,
                                country_code,
                                region.id,
                                price_range_min,
                                price_range_max,
                            );

                        await explore_wines(
                            red_wine_id,
                            country_code,
                            region.id,
                            price_range_min,
                            price_range_max,
                            seen_wineries,
                            seen_wines,
                            num_records_matched,
                        );
                    }
                } catch (error) {
                    console.error("Error fetching wines:", error);
                    console.error(
                        "Params: ",
                        country_code,
                        region.id,
                        price_min,
                        price_max,
                    );
                }
            }
        }

        return Response.json({ message: "Success" });
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error("Full error message:", error.message);
        }
        if (error instanceof Error && "cause" in error) {
            console.error("Error cause:", error.cause);
        }

        return Response.json(
            { error: "Failed to fetch data" },
            { status: 500 },
        );
    }
}
