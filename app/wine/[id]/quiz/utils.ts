import { Region, Wine } from "@/app/lib/definitions";

export const calculateScore = (
    wine: Wine,
    acidity: number,
    sweetness: number,
    tannins: number,
    cost: string,
    rating: number,
    region_dict: any,
    regions: Region[],
) => {
    let score = 100; // Start with a perfect score

    // Calculate score for acidity
    const acidityDiff = Math.abs(
        (Number(wine.acidity?.toFixed(1)) || 0) - acidity,
    );
    score -= Math.min(acidityDiff * 5, 15);

    // Calculate score for sweetness
    const sweetnessDiff = Math.abs(
        (Number(wine.sweetness?.toFixed(1)) || 0) - sweetness,
    );
    score -= Math.min(sweetnessDiff * 5, 15);

    // Calculate score for tannins
    const tanninsDiff = Math.abs(
        (Number(wine.tannin?.toFixed(1)) || 0) - tannins,
    );
    score -= Math.min(tanninsDiff * 5, 15);

    // Calculate score for cost
    const costDiff = Math.abs(wine.price - (parseFloat(cost) || 0));
    score -= Math.min(costDiff * 5, 15);

    // Calculate score for rating
    const ratingDiff = Math.abs(
        (Number(wine.ratings_average?.toFixed(1)) || 0) - rating,
    );
    score -= Math.min(ratingDiff * 5, 15);

    console.error(region_dict);
    console.error(wine.region_id);

    if (!region_dict) {
        score -= 25;
    }

    if (region_dict && region_dict.value !== wine.region_id.toString()) {
        console.error("Region is incorrect");
        const selectedRegion = regions.find(
            (r) => r.id.toString() === region_dict.value,
        );
        const wineRegion = regions.find((r) => r.id === wine.region_id);
        if (
            selectedRegion &&
            wineRegion &&
            selectedRegion.country_code === wineRegion.country_code
        ) {
            score -= 10;
        } else {
            score -= 20;
        }
    }

    // Ensure the score doesn't go below 0
    return Math.max(0, Math.round(score));
};
