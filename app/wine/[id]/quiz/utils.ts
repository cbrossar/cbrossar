import haversine from "haversine-distance";
import { Region, Wine } from "@/app/lib/definitions";

export const calculateScore = (
    wine: Wine,
    region: Region,
    acidity: number,
    sweetness: number,
    tannins: number,
    cost: string,
    rating: number,
    selectedCountryCode: string,
    selectedRegionId: string,
    regions: Region[],
) => {
    let score = 0;
    let countryScore = 0;
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

    if (actualCost < 50) {
        costScore = Math.round(Math.max(0, 15 - Math.min(costDiff / 3, 15)));
    } else if (actualCost < 100) {
        costScore = Math.round(Math.max(0, 15 - Math.min(costDiff / 5, 15)));
    } else {
        costScore = Math.round(Math.max(0, 15 - Math.min(costDiff / 10, 15)));
    }
    score += costScore;

    // Calculate score for rating
    const ratingDiff = Math.abs(
        (Number(wine.ratings_average?.toFixed(1)) || 0) - rating,
    );
    ratingScore = Math.round(Math.max(0, 15 - Math.min(ratingDiff * 5, 15)));
    score += ratingScore;

    if (selectedCountryCode == wine.country_code) {
        countryScore = 10;
    }

    let distance = 0;

    // Calculate score for region
    if (selectedRegionId) {
        const selectedRegion = regions.find(
            (r) => r.id.toString() === selectedRegionId,
        );
        if (region.id === selectedRegion?.id) {
            regionScore = 15;
        } else {
            const correctLat = region.latitude || 0;
            const correctLong = region.longitude || 0;
            const selectedLat = selectedRegion?.latitude || 0;
            const selectedLong = selectedRegion?.longitude || 0;
            distance = haversine(
                { lat: correctLat, lng: correctLong },
                { lat: selectedLat, lng: selectedLong },
            );
            regionScore = Math.round(
                Math.max(0, 15 - Math.min(distance / 80000, 15)),
            );
        }
    }
    score += regionScore;

    const tooltipText = `
        Country points: ${countryScore}/10
        Region points: ${regionScore}/15    
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
