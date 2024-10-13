"use client";

import { useState, useEffect } from "react";
import EyeToggle from "@/app/wine/eye-toggle";
import Select from "react-select";
import styles from "./styles.module.css";
import { Region, Wine } from "@/app/lib/definitions";

export default function Page({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { isHidden?: string };
}) {
    const id = params.id;
    const [wine, setWine] = useState<Wine | null>(null);
    const [regions, setRegions] = useState<Region[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [region_dict, setRegionDict] = useState<{
        value: string;
        label: string;
    }>();
    const [acidity, setAcidity] = useState(2.5);
    const [sweetness, setSweetness] = useState(2.5);
    const [tannins, setTannins] = useState(2.5);
    const [cost, setCost] = useState("");
    const [rating, setRating] = useState(2.5);
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        fetch("/api/wine-quiz?id=" + id)
            .then((res) => res.json())
            .then((data) => {
                setWine(data.wine);
                setRegions(data.regions);
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading || !wine) {
        return <></>;
    }

    const isHidden = searchParams.isHidden === "true";

    const regionOptions = regions.map((region) => ({
        value: region.id.toString(),
        label: region.name,
    }));

    const calculateScore = () => {
        let score = 100; // Start with a perfect score

        // Calculate score for acidity
        const acidityDiff = Math.abs((wine.acidity || 0) - acidity);
        score -= Math.min(acidityDiff * 5, 10);

        // Calculate score for sweetness
        const sweetnessDiff = Math.abs((wine.sweetness || 0) - sweetness);
        score -= Math.min(sweetnessDiff * 5, 10);

        // Calculate score for tannins
        const tanninsDiff = Math.abs((wine.tannin || 0) - tannins);
        score -= Math.min(tanninsDiff * 5, 10);

        // Calculate score for cost
        const costDiff = Math.abs(wine.price) - (parseFloat(cost) || 0);
        score -= Math.min(costDiff * 5, 10);

        // Calculate score for rating
        const ratingDiff = Math.abs((wine.ratings_average || 0) - rating);
        score -= Math.min(ratingDiff * 5, 10);

        // Check if the region is correct
        if (region_dict && region_dict.value !== wine.region_id.toString()) {
            const selectedRegion = regions.find(r => r.id.toString() === region_dict.value);
            const wineRegion = regions.find(r => r.id === wine.region_id);
            if (selectedRegion && wineRegion && selectedRegion.country_code === wineRegion.country_code) {
                score -= 5;
            } else {
                score -= 10;
            }
        }

        // Ensure the score doesn't go below 0
        return Math.max(0, Math.round(score));
    };

    const handleComplete = () => {
        setCompleted(true);
        const score = calculateScore();
        setScore(score);
    };

    return (
        <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: "10px", right: "10px" }}>
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

            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <label htmlFor="region-select" style={{ marginBottom: "10px" }}>
                    Select the Region:
                </label>
                <Select
                    id="region-select"
                    options={regionOptions}
                    placeholder="Napa Valley"
                    value={region_dict}
                    onChange={(selectedOption) =>
                        setRegionDict(
                            selectedOption as { value: string; label: string },
                        )
                    }
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            width: "200px",
                        }),
                    }}
                />
            </div>

            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <label
                    htmlFor="acidity-slider"
                    style={{ marginBottom: "10px" }}
                >
                    Guess the Acidity (0-5):
                </label>
                <input
                    type="range"
                    id="acidity-slider"
                    min="0"
                    max="5"
                    step="0.1"
                    value={acidity}
                    onChange={(e) => setAcidity(Number(e.target.value))}
                    style={{ width: "200px" }}
                />
                <output htmlFor="acidity-slider" style={{ marginTop: "5px" }}>
                    {acidity}
                </output>
            </div>
            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <label
                    htmlFor="sweetness-slider"
                    style={{ marginBottom: "10px" }}
                >
                    Guess the Sweetness (0-5):
                </label>
                <input
                    type="range"
                    id="sweetness-slider"
                    min="0"
                    max="5"
                    step="0.1"
                    value={sweetness}
                    onChange={(e) => setSweetness(Number(e.target.value))}
                    style={{ width: "200px" }}
                />
                <output htmlFor="sweetness-slider" style={{ marginTop: "5px" }}>
                    {sweetness}
                </output>
            </div>
            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <label
                    htmlFor="tannins-slider"
                    style={{ marginBottom: "10px" }}
                >
                    Guess the Tannins (0-5):
                </label>
                <input
                    type="range"
                    id="tannins-slider"
                    min="0"
                    max="5"
                    step="0.1"
                    value={tannins}
                    onChange={(e) => setTannins(Number(e.target.value))}
                    style={{ width: "200px" }}
                />
                <output htmlFor="tannins-slider" style={{ marginTop: "5px" }}>
                    {tannins}
                </output>
            </div>
            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <label htmlFor="cost-input" style={{ marginBottom: "10px" }}>
                    Guess the Cost:
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "5px" }}>
                        {wine.currency_code === "USD" ? "$" : "€"}
                    </span>
                    <input
                        type="text"
                        id="cost-input"
                        placeholder="19.99"
                        style={{ padding: "5px", width: "80px" }}
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                    />
                </div>
            </div>
            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <label htmlFor="rating-slider" style={{ marginBottom: "10px" }}>
                    Guess the Rating:
                </label>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                    }}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            style={{
                                position: "relative",
                                fontSize: "24px",
                                marginRight: "5px",
                            }}
                        >
                            <span
                                style={{
                                    color: "gold",
                                    position: "absolute",
                                    overflow: "hidden",
                                    width: `${Math.min(100, Math.max(0, (rating - star + 1) * 100))}%`,
                                }}
                            >
                                ★
                            </span>
                            <span style={{ color: "gray" }}>★</span>
                        </span>
                    ))}
                    <input
                        type="range"
                        id="rating-slider"
                        min="0"
                        max="5"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                        }}
                    />
                </div>
                <output htmlFor="rating-slider">{rating}</output>
            </div>

            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                {!completed ? (
                    <button
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginBottom: "30px",
                        }}
                        onClick={handleComplete}
                    >
                        Complete
                    </button>
                ) : (
                    <div
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#4CAF50",
                            marginBottom: "30px",
                        }}
                    >
                        Score: {score}
                    </div>
                )}
            </div>
        </div>
    );
}
