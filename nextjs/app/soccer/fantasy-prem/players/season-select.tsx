import { FantasySeason } from "@/app/lib/definitions";

export default function SeasonSelect({ seasons, currentSeason }: { seasons: FantasySeason[], currentSeason: FantasySeason }) {
    return (
        <div>
            <select>
                {seasons.map((season) => (
                    <option key={season.id} value={season.name} selected={season.id === currentSeason.id}>{season.name}</option>
                ))}
            </select>
        </div>
    );
}