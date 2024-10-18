import Link from "next/link";
import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import TableHeader from "@/app/wine/table-header";
import { fetchWinesFiltered, fetchWinesPageCount } from "@/app/data/wine";
import { Wine } from "@/app/lib/definitions";
import EyeToggle from "@/app/wine/eye-toggle";
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
        isHidden?: string;
    };
}) {
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const sortBy = searchParams?.sortby || "ratings_average"; // Default sort
    const sortOrder = sortBy.startsWith("-") ? "ASC" : "DESC";
    const sortByColumn = sortBy.replace("-", "");
    const currentCountryCode = searchParams?.country || "";
    const currentRegionId = searchParams?.region || "";
    const isHidden = searchParams?.isHidden === "true";
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
                <EyeToggle />
            </div>
            <p className="text-gray-500 text-sm mt-4">Tap wine name to start quiz. Tap eye to hide details.</p>
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
                            "Ctry",
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
                        {wines.map((wine) => (
                            <tr key={wine.id}>
                                <td
                                    style={{
                                        padding: "0 4px",
                                        minWidth: "150px",
                                    }}
                                >
                                    <Link
                                        href={`/wine/${wine.id}/quiz${isHidden ? "?isHidden=true" : ""}`}
                                    >
                                        <div
                                            style={{
                                                maxHeight: "2.8em",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                            }}
                                        >
                                            {wine.name}
                                        </div>
                                    </Link>
                                </td>
                                <td
                                    style={{
                                        padding: "0 4px",
                                        minWidth: "120px",
                                    }}
                                >
                                    <div className={styles.twoLineClamp}>
                                        {wine.winery_name}
                                    </div>
                                </td>
                                <td
                                    style={{
                                        padding: "0 4px",
                                        minWidth: "100px",
                                    }}
                                >
                                    <div
                                        className={`${styles.twoLineClamp} ${isHidden ? styles.hidden : ""}`}
                                    >
                                        {wine.region_name}
                                    </div>
                                </td>
                                <td
                                    className={isHidden ? styles.hidden : ""}
                                    style={{ padding: "0 4px" }}
                                >
                                    {wine.country_code?.toUpperCase() || ""}
                                </td>

                                <td
                                    className={isHidden ? styles.hidden : ""}
                                    style={{ padding: "0 4px" }}
                                >
                                    {wine.acidity
                                        ? wine.acidity.toFixed(2)
                                        : ""}
                                </td>
                                <td
                                    className={isHidden ? styles.hidden : ""}
                                    style={{ padding: "0 4px" }}
                                >
                                    {wine.intensity
                                        ? wine.intensity.toFixed(2)
                                        : ""}
                                </td>
                                <td
                                    className={isHidden ? styles.hidden : ""}
                                    style={{ padding: "0 4px" }}
                                >
                                    {wine.sweetness
                                        ? wine.sweetness.toFixed(2)
                                        : ""}
                                </td>
                                <td
                                    className={isHidden ? styles.hidden : ""}
                                    style={{ padding: "0 4px" }}
                                >
                                    {wine.tannin ? wine.tannin.toFixed(2) : ""}
                                </td>
                                <td
                                    className={isHidden ? styles.hidden : ""}
                                    style={{ padding: "0 4px" }}
                                >
                                    {currency_map[wine.currency_code || ""]}
                                    {wine.price}
                                </td>
                                <td
                                    className={isHidden ? styles.hidden : ""}
                                    style={{ padding: "0 4px" }}
                                >
                                    {wine.ratings_count}
                                </td>
                                <td
                                    className={isHidden ? styles.hidden : ""}
                                    style={{ padding: "0 4px" }}
                                >
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
