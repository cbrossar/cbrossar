api_url = 'https://www.vivino.com/api/explore/explore'
for country in ['ar', 'pt', 'cl', 'at', 'au', 'es', 'de', 'us', 'it', 'fr']:
payload = {
"country_code": country.upper(),
"currency_code":"USD",
"grape_filter":"varietal",
"min_rating":1,
"min_ratings_count":100,
"order_by":"ratings_count",
"order":"desc",
"page": '1',
"price_range_max": price_range_max,
"price_range_min": price_range_min}

const wineId = "8811516";
const vintageYear = "2020";
const pageNumber = "1";
const wineryId = "89393";

const vivinoReviewsUrl = `https://www.vivino.com/api/wines/${wineId}/reviews?per_page=1&year=${vintageYear}&page=${pageNumber}`;
const vivinoCountriesUrl = `https://www.vivino.com/api/countries`;
const vivinoExploreUrl = `https://www.vivino.com/api/explore/explore?country_code=FR&currency_code=EUR&min_rating=3&price_range_min=7&price_range_max=20&order_by=price&order=asc`;
const vivinoWineryUrl = `https://www.vivino.com/api/wineries/${wineryId}/wines`;
const vivinoTastesUrl = `https://www.vivino.com/api/wines/${wineId}/tastes`;
const vivinoPricesUrl = `https://www.vivino.com/api/prices`;
const vivinoGrapesUrl = `https://www.vivino.com/api/grapes`;
const vivinoRegionsUrl = `https://www.vivino.com/api/regions`;
const vivinoExploreWineTypeUrl =
"https://www.vivino.com/api/explore/explore?wine_type_ids[]=2&country_code=US&min_rating=3&order_by=price&order=desc";
const vivinoExploreRegionUrl =
"https://www.vivino.com/api/explore/explore?region_ids[]=2849&country_code=it&min_rating=3&order_by=price&order=desc";

/\*

Get grapes (start with red)

Get countries (start with US, France, Italy)

Get regions

Get wines

Explore each country by rating

Started filtering by vintage age, grapes, countries, and more.

What filters do I see work

-   country_code
-   region
-   wine_type_ids (red: 1, white: 2, rose: 3, sparkling: 4)
-   price_range_min, price_range_max (0-5, 5-10, 10-15, 15-20, 20-30, 30-50, 50-100, 100-200, 200-500, 500-1000, 1000-5000)
-   page 1-80
-   per_page 25? 50?

Bulk insert data into database?

Data tables

Wine

-   id
-   vivino_wine_id
-   name
-   country
-   region
-   taste?
-   ratings count
-   ratings average
-   acidity
-   intensity
-   sweetness
-   tannin

Winery

-   id
-   vivino_winery_id
-   name

Grapes

-   id
-   vivino_grape_id
-   name

Country

-   id
-   vivino_country_id
-   name
-   wines_count
-   wineries_count
-   grape1_id
-   grape2_id
-   grape3_id

Region

-   id
-   vivino_region_id
-   name
-   country_id
