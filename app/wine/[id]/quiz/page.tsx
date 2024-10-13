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

    useEffect(() => {
        fetch("/api/wine-quiz?id=" + id)
            .then((res) => res.json())
            .then((data) => {
                setWine(data.wine);
                setRegions(data.regions);
            });
    }, [id]);

    if (!wine) {
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
                    defaultValue="2.5"
                    style={{ width: "200px" }}
                />
                <output htmlFor="acidity-slider" style={{ marginTop: "5px" }}>
                    2.5
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
                    defaultValue="2.5"
                    style={{ width: "200px" }}
                />
                <output htmlFor="sweetness-slider" style={{ marginTop: "5px" }}>
                    2.5
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
                    defaultValue="2.5"
                    style={{ width: "200px" }}
                />
                <output htmlFor="tannins-slider" style={{ marginTop: "5px" }}>
                    2.5
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
                        type="number"
                        id="cost-input"
                        min="0"
                        step="0.01"
                        placeholder="Enter cost"
                        style={{ padding: "5px", width: "180px" }}
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
                <input
                    type="range"
                    id="rating-slider"
                    min="0"
                    max="5"
                    step="0.1"
                    defaultValue="2.5"
                    style={{ width: "200px" }}
                />
                <div
                    style={{
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
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
                                    width: `${Math.min(100, Math.max(0, (2.5 - star + 1) * 100))}%`,
                                }}
                            >
                                ★
                            </span>
                            <span style={{ color: "gray" }}>★</span>
                        </span>
                    ))}
                    <output
                        htmlFor="rating-slider"
                        style={{ marginLeft: "10px" }}
                    >
                        2.5
                    </output>
                </div>
            </div>
        </div>
    );
}
