"use client";

import { useState, useEffect } from "react";
import EyeToggle from "@/app/wine/eye-toggle";
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
    const [acidity, setAcidity] = useState(2.5);
    const [sweetness, setSweetness] = useState(2.5);
    const [tannins, setTannins] = useState(2.5);
    const [cost, setCost] = useState("");
    const [rating, setRating] = useState(2.5);

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

    // TODO: Add share link to copy url

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
                <input
                    type="text"
                    id="region-select"
                    list="region-options"
                    placeholder="Napa Valley"
                    style={{ padding: "5px", width: "200px" }}
                    onFocus={(e) => {
                        if ('ontouchstart' in window) {
                            e.target.setAttribute('list', 'region-options');
                        }
                    }}
                    onBlur={(e) => {
                        if ('ontouchstart' in window) {
                            e.target.removeAttribute('list');
                        }
                    }}
                />
                <datalist id="region-options">
                    {regions.map((region) => (
                        <option key={region.id} value={region.name} />
                    ))}
                </datalist>
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
                <output
                    htmlFor="rating-slider"
                >
                    {rating}
                </output>
            </div>
        </div>
    );
}
