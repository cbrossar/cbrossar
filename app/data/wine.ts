import { sql } from "@vercel/postgres";
import { Country, Grape, Region, Wine, Winery } from "@/app/lib/definitions";
import { unstable_noStore as noStore } from "next/cache";
import { ITEMS_PER_PAGE } from "./fantasy";

export async function createGrapes(grapes: Grape[]) {
    try {
        for (const grape of grapes) {
            await sql`
                INSERT INTO vivino_grapes (id, name)
                VALUES (${grape.id}, ${grape.name})
                ON CONFLICT (id) DO UPDATE SET name = ${grape.name}
            `;
        }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create grapes.");
    }
}
export async function fetchGrapes() {
    try {
        const response = await sql`SELECT * FROM vivino_grapes`;
        return response.rows as Grape[];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch grapes.");
    }
}

export async function createCountries(countries: Country[]) {
    try {
        for (const country of countries) {
            await sql`
                INSERT INTO vivino_countries (code, name, wines_count, wineries_count, grape1_id, grape2_id, grape3_id)
                VALUES (${country.code}, ${country.name}, ${country.wines_count}, ${country.wineries_count}, ${country.grape1_id}, ${country.grape2_id}, ${country.grape3_id})
                ON CONFLICT (code) DO UPDATE SET name = ${country.name}, wines_count = ${country.wines_count}, wineries_count = ${country.wineries_count}, grape1_id = ${country.grape1_id}, grape2_id = ${country.grape2_id}, grape3_id = ${country.grape3_id}
            `;
        }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create countries.");
    }
}

export async function fetchCountries() {
    try {
        const response = await sql`SELECT * FROM vivino_countries`;
        return response.rows as Country[];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch countries.");
    }
}

export async function createRegions(regions: Region[]) {
    try {
        for (const region of regions) {
            await sql`INSERT INTO vivino_regions (id, name, country_code) VALUES (${region.id}, ${region.name}, ${region.country_code}) ON CONFLICT (id) DO UPDATE SET name = ${region.name}`;
        }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create regions.");
    }
}

export async function fetchRegions(
    country_code: string | null = null,
    region_id: number | null = null,
) {
    noStore();
    try {
        if (region_id) {
            const response =
                await sql`SELECT * FROM vivino_regions WHERE id = ${region_id}`;
            return response.rows as Region[];
        }

        const response = await sql`
            SELECT vr.*
            FROM vivino_regions vr
            LEFT JOIN vivino_wines vw ON vr.id = vw.region_id
            WHERE vr.country_code = ${country_code}
            AND vw.id IS NULL
        `;
        return response.rows as Region[];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch regions.");
    }
}

export async function fetchRegionsWithoutGeocode(country_code: string) {
    noStore();
    try {
        const response = await sql`
            SELECT vr.*
            FROM vivino_regions vr
            WHERE vr.country_code = ${country_code}
            AND vr.latitude IS NULL
            AND vr.longitude IS NULL
        `;
        return response.rows as Region[];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch regions.");
    }
}

export async function fetchTopRegions(country_code: string | null = null) {
    noStore();
    try {
        const response = await sql`
            SELECT vr.*
            FROM vivino_regions vr
            JOIN (
                SELECT region_id, COUNT(*) as wine_count
                FROM vivino_wines
                GROUP BY region_id
                HAVING COUNT(*) >= 10
            ) wc ON vr.id = wc.region_id
            WHERE vr.country_code = ${country_code}
            ORDER BY vr.name
        `;
        return response.rows as Region[];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch regions.");
    }
}

export async function updateRegionGeocode(
    region_id: number,
    latitude: number,
    longitude: number,
) {
    try {
        await sql`UPDATE vivino_regions SET latitude = ${latitude}, longitude = ${longitude} WHERE id = ${region_id}`;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to update region geocode.");
    }
}

export async function createWineries(wineries: Winery[]) {
    try {
        for (const winery of wineries) {
            await sql`INSERT INTO vivino_wineries (id, name) VALUES (${winery.id}, ${winery.name}) ON CONFLICT (id) DO UPDATE SET name = ${winery.name}`;
        }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create wineries.");
    }
}

export async function fetchWineries() {
    try {
        const response = await sql`SELECT * FROM vivino_wineries`;
        return response.rows as Winery[];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch wineries.");
    }
}
export async function createWines(wines: Wine[]) {
    try {
        for (const wine of wines) {
            await sql`INSERT INTO vivino_wines (id, name, region_id, winery_id, ratings_count, ratings_average, acidity, intensity, sweetness, tannin, currency_code, price) VALUES (${wine.id}, ${wine.name}, ${wine.region_id}, ${wine.winery_id}, ${wine.ratings_count}, ${wine.ratings_average}, ${wine.acidity}, ${wine.intensity}, ${wine.sweetness}, ${wine.tannin}, ${wine.currency_code}, ${wine.price}) ON CONFLICT (id) DO UPDATE SET name = ${wine.name}, region_id = ${wine.region_id}, winery_id = ${wine.winery_id}, ratings_count = ${wine.ratings_count}, ratings_average = ${wine.ratings_average}, acidity = ${wine.acidity}, intensity = ${wine.intensity}, sweetness = ${wine.sweetness}, tannin = ${wine.tannin}, currency_code = ${wine.currency_code}, price = ${wine.price}`;
        }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create wines.");
    }
}

export async function fetchWines() {
    try {
        const response = await sql`SELECT * FROM vivino_wines`;
        return response.rows as Wine[];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch wines.");
    }
}
export async function fetchWinesFiltered(
    query: string,
    currentPage: number,
    sortBy: string,
    sortOrder: string,
    currentCountryCode: string,
    currentRegionId: string,
) {
    try {
        noStore();
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;

        // Initialize arrays for dynamic query construction
        let whereClauses = [];
        let queryParams: (string | number)[] = [];
        let paramIndex = 1;

        // Add search conditions for wine names
        if (query) {
            whereClauses.push(
                `(vivino_wines.name ILIKE $${paramIndex}) OR (vivino_wineries.name ILIKE $${paramIndex}) OR (vivino_regions.name ILIKE $${paramIndex})`,
            );
            queryParams.push(`%${query}%`);
            paramIndex++;
        }

        if (currentCountryCode) {
            whereClauses.push(`vivino_countries.code = $${paramIndex}`);
            queryParams.push(currentCountryCode);
            paramIndex++;
        }

        if (currentRegionId) {
            whereClauses.push(`vivino_regions.id = $${paramIndex}`);
            queryParams.push(currentRegionId);
            paramIndex++;
        }

        // Construct the WHERE clause
        let whereClause = "";
        if (whereClauses.length > 0) {
            whereClause = `WHERE ${whereClauses.join(" AND ")}`;
        }

        const sqlQuery = `
            SELECT vivino_wines.*, vivino_regions.name AS region_name, vivino_wineries.name AS winery_name, vivino_countries.code AS country_code
            FROM vivino_wines
            LEFT JOIN vivino_regions ON vivino_wines.region_id = vivino_regions.id
            LEFT JOIN vivino_wineries ON vivino_wines.winery_id = vivino_wineries.id
            LEFT JOIN vivino_countries ON vivino_regions.country_code = vivino_countries.code
            ${whereClause}
            ORDER BY 
                CASE 
                    WHEN vivino_wines.${sortBy} IS NULL THEN 1 
                    ELSE 0 
                END,
                ${sortBy} ${sortOrder}
            LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;

        const response = await sql.query(sqlQuery, queryParams);
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch wines.");
    }
}

export async function fetchWinesPageCount(
    query: string,
    currentCountryCode: string,
    currentRegionId: string,
) {
    try {
        noStore();

        let whereClauses = [];
        let queryParams: (string | number)[] = [];
        let paramIndex = 1;

        // Add search conditions for wine names
        if (query) {
            whereClauses.push(
                `(vivino_wines.name ILIKE $${paramIndex}) OR (vivino_wineries.name ILIKE $${paramIndex}) OR (vivino_regions.name ILIKE $${paramIndex})`,
            );
            queryParams.push(`%${query}%`);
            paramIndex++;
        }

        if (currentCountryCode) {
            whereClauses.push(`vivino_countries.code = $${paramIndex}`);
            queryParams.push(currentCountryCode);
            paramIndex++;
        }

        if (currentRegionId) {
            whereClauses.push(`vivino_regions.id = $${paramIndex}`);
            queryParams.push(currentRegionId);
            paramIndex++;
        }

        // Construct the WHERE clause
        let whereClause = "";
        if (whereClauses.length > 0) {
            whereClause = `WHERE ${whereClauses.join(" AND ")}`;
        }

        const sqlQuery = `
            SELECT COUNT(*) FROM vivino_wines
            LEFT JOIN vivino_regions ON vivino_wines.region_id = vivino_regions.id
            LEFT JOIN vivino_wineries ON vivino_wines.winery_id = vivino_wineries.id
            ${whereClause}
        `;

        const result = await sql.query(sqlQuery, queryParams);
        const totalCount = Number(result.rows[0].count);
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch wines count.");
    }
}

export async function fetchWineQuizData() {
    console.log("fetching wine quiz data for");
    const id = "1";
    const response = await fetch(`/api/wine-quiz?id=${id}`);
    return response.json();
}

export async function fetchWineById(id: string) {
    const response = await sql`
        SELECT v.*, r.name AS region_name, r.country_code, w.name AS winery_name
        FROM vivino_wines v
        LEFT JOIN vivino_regions r ON v.region_id = r.id
        LEFT JOIN vivino_wineries w ON v.winery_id = w.id
        WHERE v.id = ${id}
    `;
    return response.rows[0] as Wine;
}

export async function fetchCountriesWithWines() {
    const response = await sql`
        SELECT DISTINCT vc.*
        FROM vivino_countries vc
        JOIN vivino_regions vr ON vc.code = vr.country_code
        JOIN vivino_wines vw ON vr.id = vw.region_id
    `;
    return response.rows as Country[];
}
