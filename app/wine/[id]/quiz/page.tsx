import EyeToggle from "@/app/wine/eye-toggle";
import Spinner from "@/app/ui/spinner";
import { Region, Wine } from "@/app/lib/definitions";
import { fetchWineById, fetchRegions } from "@/app/data/wine";
import WineQuizForm from "./wine-quiz-form";

export default async function Page({ params, searchParams }: any) {
    const id = params.id;

    const wine: Wine = await fetchWineById(id);
    const regions: Region[] = await fetchRegions();

    if (!wine) {
        return <Spinner />;
    }

    const isHidden = searchParams.isHidden === "true";

    return (
        <div className="relative">
            <div className="absolute top-2.5 right-2.5">
                <EyeToggle />
            </div>
            <div>
                <h1 className="text-center text-2xl">Wine Quiz</h1>
                <div className="flex justify-center mt-2.5">
                    {isHidden ? (
                        <>
                            <span>{wine.winery_name}</span>{" "}
                            <span>{wine.name}</span>
                        </>
                    ) : (
                        <>
                            {wine.winery_name} {wine.name}
                        </>
                    )}
                </div>
            </div>
            <WineQuizForm wine={wine} regions={regions} />
        </div>
    );
}
