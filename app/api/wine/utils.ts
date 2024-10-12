import { Grape, Country, Region, Winery, Wine } from "@/app/lib/definitions";
import {
    createGrapes,
    createCountries,
    createRegions,
    createWineries,
    createWines,
} from "@/app/lib/data";
import { exit } from "process";

const headers = {
    "User-Agent":
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
};

export async function store_grapes() {
    const vivinoGrapesUrl = `https://www.vivino.com/api/grapes`;
    const response = await fetch(vivinoGrapesUrl, { headers });
    const data = await response.json();

    const grapes: Grape[] = data["grapes"].map((grape: any) => ({
        id: grape["id"],
        name: grape["name"],
    }));

    await createGrapes(grapes);
}

export async function store_countries() {
    const vivinoCountriesUrl = `https://www.vivino.com/api/countries`;
    const response = await fetch(vivinoCountriesUrl, { headers });
    const data = await response.json();

    const countries: Country[] = data["countries"].map((country: any) => ({
        code: country["code"],
        name: country["name"],
        wines_count: country["wines_count"],
        wineries_count: country["wineries_count"],
        grape1_id: country["most_used_grapes"][0]?.["id"] || null,
        grape2_id: country["most_used_grapes"][1]?.["id"] || null,
        grape3_id: country["most_used_grapes"][2]?.["id"] || null,
    }));

    await createCountries(countries);
}

export async function store_regions() {
    const vivinoRegionsUrl = `https://www.vivino.com/api/regions`;
    const response = await fetch(vivinoRegionsUrl, { headers });
    const data = await response.json();

    const regions: Region[] = data["regions"].map((region: any) => ({
        id: region["id"],
        name: region["name"],
        country_code: region["country"]["code"],
    }));

    await createRegions(regions);
}

export async function explore_wines(
    wine_type_id: number,
    country_code: string,
    region_id: number,
    price_range_min: number,
    price_range_max: number,
    seen_wineries: Set<number>,
    seen_wines: Set<number>,
    num_records_matched: number,
) {
    const wineries: Winery[] = [];
    const wines: Wine[] = [];

    const per_page = 50;
    const num_pages = Math.ceil(num_records_matched / per_page);

    for (let page = 1; page <= num_pages; page++) {
        const vivinoExploreWineTypeUrl = `https://www.vivino.com/api/explore/explore?wine_type_ids[]=${wine_type_id}&country_code=${country_code}&region_ids[]=${region_id}&price_range_min=${price_range_min}&price_range_max=${price_range_max}&page=${page}&per_page=${per_page}`;
        const response = await fetch(vivinoExploreWineTypeUrl, { headers });
        const data = await response.json();

        data["explore_vintage"]["matches"].forEach((match: any) => {
            const price = match["price"];
            const vintage = match["vintage"];
            const wine = vintage["wine"];
            const winery = wine["winery"];

            if (!seen_wineries.has(winery["id"])) {
                seen_wineries.add(winery["id"]);
                wineries.push({
                    id: winery["id"],
                    name: winery["name"],
                });
            }

            if (!seen_wines.has(wine["id"])) {
                seen_wines.add(wine["id"]);
                wines.push({
                    id: wine["id"],
                    name: wine["name"],
                    region_id: wine["region"]["id"],
                    winery_id: winery["id"],
                    currency_code: price["currency"]["code"],
                    price: price["amount"],
                    ratings_count:
                        vintage["statistics"]?.["wine_ratings_count"] || null,
                    ratings_average:
                        vintage["statistics"]?.["wine_ratings_average"] || null,
                    acidity: wine["taste"]?.["structure"]?.["acidity"] || null,
                    intensity:
                        wine["taste"]?.["structure"]?.["intensity"] || null,
                    sweetness:
                        wine["taste"]?.["structure"]?.["sweetness"] || null,
                    tannin: wine["taste"]?.["structure"]?.["tannin"] || null,
                });
            }
        });
    }

    if (wineries.length > 0) {
        console.log(`Creating ${wineries.length} new wineries`);
        await createWineries(wineries);
    }
    if (wines.length > 0) {
        console.log(`Creating ${wines.length} new wines`);
        await createWines(wines);
    }
}

export async function fetchExploreWineNumRecordsMatched(
    wine_type_id: number,
    country_code: string,
    region_id: number,
    price_range_min: number,
    price_range_max: number,
) {
    const vivinoExploreWineTypeUrl = `https://www.vivino.com/api/explore/explore?wine_type_ids[]=${wine_type_id}&country_code=${country_code}&region_ids[]=${region_id}&price_range_min=${price_range_min}&price_range_max=${price_range_max}&page=1&per_page=1`;
    const response = await fetch(vivinoExploreWineTypeUrl, { headers });
    if (!response.ok) {
        if (response.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const num_records_matched = data["explore_vintage"]["records_matched"];
    if (num_records_matched > 3000) {
        console.log("num_records_matched", num_records_matched);
        console.log(
            "params",
            wine_type_id,
            country_code,
            region_id,
            price_range_min,
            price_range_max,
        );
    }
    return num_records_matched;
}
