import haversine from "haversine-distance";
import { Region, Wine } from "@/app/lib/definitions";

export const calculateScore = (
    wine: Wine,
    acidity: number,
    sweetness: number,
    tannins: number,
    cost: string,
    rating: number,
    selectedRegionDict: any,
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
    tanninsScore = Math.round(Math.max(0, 15 - Math.min(tanninsDiff * 5, 15)));
    score += tanninsScore;

    // Calculate score for cost
    const actualCost = wine.price;
    const guessedCost = parseFloat(cost) || 0;
    const costDiff = Math.abs(actualCost - guessedCost);

    // Calculate log difference
    const logDiff = Math.log10(costDiff + 1); // Add 1 to avoid log(0)

    // Scale to 15-point system
    costScore = Math.round(Math.max(0, 15 - Math.min(logDiff * 5, 15))); // Multiplied by 3 to scale appropriately
    score += costScore;

    // Calculate score for rating
    const ratingDiff = Math.abs(
        (Number(wine.ratings_average?.toFixed(1)) || 0) - rating,
    );
    ratingScore = Math.round(Math.max(0, 15 - Math.min(ratingDiff * 5, 15)));
    score += ratingScore;

    let distance = 0;

    // Calculate score for region
    if (selectedRegionDict) {
        const correctRegion = regions.find(
            (r) => r.id.toString() === wine.region_id.toString(),
        );
        const selectedRegion = regions.find(
            (r) => r.id.toString() === selectedRegionDict.value,
        );
        if (correctRegion?.id === selectedRegion?.id) {
            regionScore = 25;
        } else {
            const correctLat = correctRegion?.latitude || 0;
            const correctLong = correctRegion?.longitude || 0;
            const selectedLat = selectedRegion?.latitude || 0;
            const selectedLong = selectedRegion?.longitude || 0;
            const distance = haversine(
                { lat: correctLat, lng: correctLong },
                { lat: selectedLat, lng: selectedLong },
            );

            regionScore = Math.round(
                Math.max(0, 25 - Math.min(distance / 20000, 25)),
            );
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
        distance: distance,
    };
};
