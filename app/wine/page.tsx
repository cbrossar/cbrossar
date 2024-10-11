import { fetchWinesFiltered, fetchWinesPageCount } from "@/app/lib/data";
import { Wine } from "@/app/lib/definitions";
import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import TableHeader from "@/app/wine/table-header";
import styles from "./styles.module.css";

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        query?: string;
        page?: string;
        sortby?: string;
        country?: string;
        region?: string;
    };
}) {
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const sortBy = searchParams?.sortby || "ratings_average"; // Default sort
    const sortOrder = sortBy.startsWith("-") ? "ASC" : "DESC";
    const sortByColumn = sortBy.replace("-", "");
    const currentCountryCode = searchParams?.country || "";
    const currentRegionId = searchParams?.region || "";

    const wines = (await fetchWinesFiltered(
        query,
        currentPage,
        sortByColumn,
        sortOrder,
        currentCountryCode,
        currentRegionId,
    )) as Wine[];

    console.log(wines[0]);

    const totalPages = await fetchWinesPageCount(
        query,
        currentCountryCode,
        currentRegionId,
    );

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <Search placeholder="Search Wines" query={query} />
                </div>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "900px" }}>
                    <TableHeader
                        headers={[
                            "Name",
                            "Region",
                            "Winery",
                            "Ratings Count",
                            "Ratings Average",
                            "Acidity",
                            "Intensity",
                            "Sweetness",
                        ]}
                        sortBy={sortBy}
                    />
                    <tbody>
                        {wines.map((wine, index) => (
                            <tr key={index}>
                                <td>{wine.name}</td>
                                <td>{wine.region_name}</td>
                                <td>{wine.winery_name}</td>
                                <td>{wine.ratings_count}</td>
                                <td>
                                    {wine.ratings_average
                                        ? wine.ratings_average.toFixed(2)
                                        : ""}
                                </td>
                                <td>
                                    {wine.acidity
                                        ? wine.acidity.toFixed(2)
                                        : ""}
                                </td>
                                <td>
                                    {wine.intensity
                                        ? wine.intensity.toFixed(2)
                                        : ""}
                                </td>
                                <td>
                                    {wine.sweetness
                                        ? wine.sweetness.toFixed(2)
                                        : ""}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.pagination}>
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}
