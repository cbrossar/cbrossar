import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: NextRequest) {
    const wineId = "8811516";
    const vintageYear = "2020";
    const pageNumber = "1";

    if (!wineId || !vintageYear) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 },
        );
    }

    const headers = {
        "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
    };

    const vivinoUrl = `https://www.vivino.com/api/wines/${wineId}/reviews?per_page=1&year=${vintageYear}&page=${pageNumber}`;

    try {
        const response = await fetch(vivinoUrl, { headers });
        if (!response.ok) {
            throw new Error("Failed to fetch data from Vivino API");
        }
        const apiData = await response.json();
        return NextResponse.json(apiData);
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json(
            { error: "Failed to fetch data" },
            { status: 500 },
        );
    }
}
