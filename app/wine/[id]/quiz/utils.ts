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
    let score = 0; // Start with zero score
    let regionScore = 0;
    let acidityScore = 0;
    let sweetnessScore = 0;
    let tanninsScore = 0;
    let costScore = 0;
    let ratingScore = 0;

    // Calculate score for acidity
    const acidityDiff = Math.abs(
        (Number(wine.acidity?.toFixed(1)) || 0) - acidity,
    );
    acidityScore = Math.round(Math.max(0, 15 - Math.min(acidityDiff * 5, 15)));
    score += acidityScore;

    // Calculate score for sweetness
    const sweetnessDiff = Math.abs(
        (Number(wine.sweetness?.toFixed(1)) || 0) - sweetness,
    );
    sweetnessScore = Math.round(
        Math.max(0, 15 - Math.min(sweetnessDiff * 5, 15)),
    );
    score += sweetnessScore;

    // Calculate score for tannins
    const tanninsDiff = Math.abs(
        (Number(wine.tannin?.toFixed(1)) || 0) - tannins,
    );
    console.log("tanninsDiff", tanninsDiff);
    tanninsScore = Math.round(Math.max(0, 15 - Math.min(tanninsDiff * 5, 15)));
    score += tanninsScore;

    // Calculate score for cost
    const costDiff = Math.abs(wine.price - (parseFloat(cost) || 0));
    costScore = Math.round(Math.max(0, 15 - Math.min(costDiff * 5, 15)));
    score += costScore;

    // Calculate score for rating
    const ratingDiff = Math.abs(
        (Number(wine.ratings_average?.toFixed(1)) || 0) - rating,
    );
    ratingScore = Math.round(Math.max(0, 15 - Math.min(ratingDiff * 5, 15)));
    score += ratingScore;

    // Calculate score for region
    if (region_dict) {
        if (region_dict.value === wine.region_id.toString()) {
            regionScore = 25;
        } else {
            const selectedRegion = regions.find(
                (r) => r.id.toString() === region_dict.value,
            );
            const wineRegion = regions.find((r) => r.id === wine.region_id);
            if (
                selectedRegion &&
                wineRegion &&
                selectedRegion.country_code === wineRegion.country_code
            ) {
                regionScore = 15;
            } else {
                regionScore = 5;
            }
        }
    }
    score += regionScore;

    const tooltipText = `
        Region points: ${regionScore}/25
        Acidity points: ${acidityScore}/15
        Sweetness points: ${sweetnessScore}/15
        Tannins points: ${tanninsScore}/15
        Cost points: ${costScore}/15
        Rating points: ${ratingScore}/15
    `.trim();

    return {
        score: Math.round(score),
        tooltipText,
    };
};
