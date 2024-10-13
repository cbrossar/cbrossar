export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: Request) {

    const wineId = "8811516";
    const vintageYear = "2020";
    const pageNumber = "4";
    const wineryId = "89393";
    const countryCode = "us";
    const regionId = "94";

    const vivinoReviewsUrl = `https://www.vivino.com/api/wines/8811516/reviews?per_page=1&year=2020&page=1`;
    const vivinoCountriesUrl = `https://www.vivino.com/api/countries`;
    const vivinoExploreUrl = `https://www.vivino.com/api/explore/explore?country_code=FR&currency_code=EUR&min_rating=3&price_range_min=7&price_range_max=20&order_by=price&order=asc`;
    const vivinoWineryUrl = `https://www.vivino.com/api/wineries/8811516/wines`;
    const vivinoTastesUrl = `https://www.vivino.com/api/wines/${wineId}/tastes`;
    const vivinoPricesUrl = `https://www.vivino.com/api/prices`;
    const vivinoGrapesUrl = `https://www.vivino.com/api/grapes`;
    const vivinoRegionsUrl = `https://www.vivino.com/api/regions`;
    const vivinoExploreWineTypeUrl =
    "https://www.vivino.com/api/explore/explore?wine_type_ids[]=2&country_code=US&min_rating=3&order_by=price&order=desc";
    const vivinoExploreRegionUrl =
    `https://www.vivino.com/api/explore/explore?region_ids[]=${regionId}&country_code=${countryCode}&order_by=price&order=desc&page=${pageNumber}`;

    const response = await fetch(vivinoExploreRegionUrl);
    const data = await response.json();
    return Response.json(data);
}
