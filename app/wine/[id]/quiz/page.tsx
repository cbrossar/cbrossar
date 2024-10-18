import EyeToggle from "@/app/wine/eye-toggle";
import { Region, Wine, Country } from "@/app/lib/definitions";
import {
    fetchWineById,
    fetchTopRegions,
    fetchCountriesWithWines,
    fetchRegionById,
} from "@/app/data/wine";
import { notFound } from "next/navigation";
import styles from "./styles.module.css";
import WineQuizForm from "./wine-quiz-form";

export default async function Page({ params, searchParams }: any) {
    const id = params.id;
    const country = searchParams.country;
    const wine: Wine = await fetchWineById(id);
    const region: Region = await fetchRegionById(wine.region_id);
    const regions: Region[] = await fetchTopRegions(country);
    const countries: Country[] = await fetchCountriesWithWines();

    if (!wine) {
        return notFound();
    }

    const isHidden = searchParams.isHidden === "true";

    return (
        <div className="relative">
            <div className="absolute top-2.5 right-2.5">
                <EyeToggle />
            </div>
            <div>
                <h1 className={styles.title}>Wine Quiz</h1>
                <div className={styles.wineName}>
                    {isHidden ? (
                        <>
                            <span className={styles.hidden}>
                                {wine.winery_name}
                            </span>{" "}
                            <span className={styles.hidden}>{wine.name}</span>
                        </>
                    ) : (
                        <>
                            {wine.winery_name} {wine.name}
                        </>
                    )}
                </div>
            </div>
            <WineQuizForm
                wine={wine}
                region={region}
                regions={regions}
                countries={countries}
            />
        </div>
    );
}
