import { Grape, Country } from "@/app/lib/definitions";
import { createGrapes, createCountries } from "@/app/lib/data";

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

    console.log(data["countries"][0]);

    const countries: Country[] = data["countries"].map((country: any) => ({
        id: country["id"],
        name: country["name"],
        wines_count: country["wines_count"],
        wineries_count: country["wineries_count"],
        grape1_id: country["most_used_grapes"][0]["id"],
        grape2_id: country["most_used_grapes"][1]["id"],
        grape3_id: country["most_used_grapes"][2]["id"],
    }));

    console.log(countries.length);

    // await createCountries(countries);
}

export async function store_regions() {
    const vivinoRegionsUrl = `https://www.vivino.com/api/regions`;
    const response = await fetch(vivinoRegionsUrl, { headers });
    const data = await response.json();
    console.log(data["regions"].length);
}

export async function explore_wines(
    wine_type_id: number,
    country_code: string,
    region_id: number,
    price_range_min: number,
    price_range_max: number,
) {
    const page = 1;
    const per_page = 50;
    const vivinoExploreWineTypeUrl = `https://www.vivino.com/api/explore/explore?wine_type_ids[]=${wine_type_id}&country_code=${country_code}&region_ids[]=${region_id}&price_range_min=${price_range_min}&price_range_max=${price_range_max}&page=${page}&per_page=${per_page}`;
    const response = await fetch(vivinoExploreWineTypeUrl, { headers });
    const data = await response.json();

    const num_records_matched = data["explore_vintage"]["records_matched"];
    const num_pages = Math.ceil(num_records_matched / per_page);

    for (let page = 1; page <= num_pages; page++) {
        const vivinoExploreWineTypeUrl = `https://www.vivino.com/api/explore/explore?wine_type_ids[]=${wine_type_id}&country_code=${country_code}&region_ids[]=${region_id}&price_range_min=${price_range_min}&price_range_max=${price_range_max}&page=${page}&per_page=${per_page}`;
        const response = await fetch(vivinoExploreWineTypeUrl, { headers });
        const data = await response.json();
        console.log(data["explore_vintage"]["matches"].length);
    }
}
