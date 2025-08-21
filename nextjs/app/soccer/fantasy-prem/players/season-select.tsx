"use client";

import { FantasySeason } from "@/app/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";

export default function SeasonSelect({
    seasons,
    currentSeason,
}: {
    seasons: FantasySeason[];
    currentSeason: FantasySeason;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSeasonFromUrl = searchParams.get("season")
        ? decodeURIComponent(searchParams.get("season")!)
        : currentSeason.name;

    const handleSeasonChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const selectedSeasonName = event.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (selectedSeasonName) {
            params.set("season", encodeURIComponent(selectedSeasonName));
        } else {
            params.delete("season");
        }

        // Reset to page 1 when changing season
        params.delete("page");

        router.push(`/soccer/fantasy-prem/players?${params.toString()}`);
    };

    return (
        <div>
            <select value={currentSeasonFromUrl} onChange={handleSeasonChange}>
                {seasons.map((season) => (
                    <option key={season.id} value={season.name}>
                        {season.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
