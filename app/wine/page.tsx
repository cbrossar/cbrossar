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

    const totalPages = await fetchWinesPageCount(
        query,
        currentCountryCode,
        currentRegionId,
    );

    const currency_map: Record<string, string> = {
        USD: "$",
        EUR: "€",
    };

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <Search placeholder="Search Wines" />
                </div>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        minWidth: "900px",
                        borderCollapse: "separate",
                        borderSpacing: "0 8px",
                    }}
                >
                    <TableHeader
                        headers={[
                            "Name",
                            "Winery",
                            "Region",
                            "Country",
                            "Acidity",
                            "Intensity",
                            "Sweet",
                            "Tannin",
                            "Price",
                            "Ratings",
                            "Score",
                        ]}
                        sortBy={sortBy}
                    />
                    <tbody>
                        {wines.map((wine, index) => (
                            <tr key={index}>
                                <td
                                    style={{
                                        padding: "0 4px",
                                        minWidth: "150px",
                                    }}
                                >
                                    {wine.name}
                                </td>
                                <td
                                    style={{
                                        padding: "0 4px",
                                        minWidth: "120px",
                                    }}
                                >
                                    {wine.winery_name}
                                </td>
                                <td
                                    style={{
                                        padding: "0 4px",
                                        minWidth: "100px",
                                    }}
                                >
                                    {wine.region_name}
                                </td>
                                <td style={{ padding: "0 4px" }}>
                                    {wine.country_code?.toUpperCase() || ""}
                                </td>

                                <td style={{ padding: "0 4px" }}>
                                    {wine.acidity
                                        ? wine.acidity.toFixed(2)
                                        : ""}
                                </td>
                                <td style={{ padding: "0 4px" }}>
                                    {wine.intensity
                                        ? wine.intensity.toFixed(2)
                                        : ""}
                                </td>
                                <td style={{ padding: "0 4px" }}>
                                    {wine.sweetness
                                        ? wine.sweetness.toFixed(2)
                                        : ""}
                                </td>
                                <td style={{ padding: "0 4px" }}>
                                    {wine.tannin ? wine.tannin.toFixed(2) : ""}
                                </td>
                                <td style={{ padding: "0 4px" }}>
                                    {currency_map[wine.currency_code || ""]}
                                    {wine.price}
                                </td>
                                <td style={{ padding: "0 4px" }}>
                                    {wine.ratings_count}
                                </td>
                                <td style={{ padding: "0 4px" }}>
                                    {wine.ratings_average}
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
