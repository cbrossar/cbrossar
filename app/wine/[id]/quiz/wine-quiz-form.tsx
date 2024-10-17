"use client";

import { useState } from "react";
import Select from "react-select";
import Tooltip from "@mui/material/Tooltip";
import { Region, Wine } from "@/app/lib/definitions";
import { useRouter, usePathname } from "next/navigation";
import { calculateScore } from "./utils";

export default function WineQuizForm({
    wine,
    regions,
}: {
    wine: Wine;
    regions: Region[];
}) {
    const [selectedRegion, setSelectedRegion] = useState<{
        value: string;
        label: string;
    }>();
    const [acidity, setAcidity] = useState(2.5);
    const [sweetness, setSweetness] = useState(2.5);
    const [tannins, setTannins] = useState(2.5);
    const [cost, setCost] = useState("");
    const [rating, setRating] = useState(2.5);
    const [completed, setCompleted] = useState(false);

    const pathname = usePathname();
    const { replace } = useRouter();

    const handleComplete = () => {
        setCompleted(true);
        replace(`${pathname}?isHidden=false`);
    };

    let regionOptions = regions.map((region) => ({
        value: region.id.toString(),
        label: region.name,
    }));

    if (
        !regionOptions.some(
            (region) => region.value === wine.region_id.toString(),
        )
    ) {
        regionOptions.push({
            value: wine.region_id.toString(),
            label: wine.region_name || "",
        });
    }

    const { score, tooltipText, distance } = calculateScore(
        wine,
        acidity,
        sweetness,
        tannins,
        cost,
        rating,
        selectedRegion,
        regions,
    );

    return (
        <form>
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
                    placeholder="Type to search..."
                    value={selectedRegion}
                    onChange={(selectedOption) =>
                        setSelectedRegion(
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
            {completed && wine.region_name == selectedRegion?.label && (
                <div
                    style={{
                        marginTop: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "green",
                    }}
                >
                    <p>
                        <span style={{ fontSize: "1.5em", marginRight: "5px" }}>
                            ✓
                        </span>
                        {wine.region_name}
                    </p>
                </div>
            )}
            {completed && wine.region_name != selectedRegion?.label && (
                <div
                    style={{
                        marginTop: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "red",
                    }}
                >
                    <p>
                        <span style={{ fontSize: "1em", marginRight: "5px" }}>
                            ✕
                        </span>
                        {distance > 0 && (
                            <span>
                                {wine.region_name} (
                                {Math.round(distance / 1000)} km away)
                            </span>
                        )}
                        {distance == 0 && <span>{wine.region_name}</span>}
                    </p>
                </div>
            )}

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
                    {completed && wine ? (
                        acidity.toFixed(1) ===
                        (wine.acidity || 0).toFixed(1) ? (
                            <span style={{ color: "green" }}>
                                <span
                                    style={{
                                        fontSize: "1.5em",
                                        marginRight: "5px",
                                    }}
                                >
                                    ✓
                                </span>
                                {acidity.toFixed(1)}
                            </span>
                        ) : (
                            <>
                                <span
                                    style={{
                                        color: "red",
                                        textDecoration: "line-through",
                                    }}
                                >
                                    {acidity.toFixed(1)}
                                </span>{" "}
                                <span style={{ color: "green" }}>
                                    {(wine.acidity || 0).toFixed(1)}
                                </span>
                            </>
                        )
                    ) : (
                        acidity.toFixed(1)
                    )}
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
                    {completed && wine ? (
                        sweetness.toFixed(1) ===
                        (wine.sweetness || 0).toFixed(1) ? (
                            <span style={{ color: "green" }}>
                                <span
                                    style={{
                                        fontSize: "1.5em",
                                        marginRight: "5px",
                                    }}
                                >
                                    ✓
                                </span>
                                {sweetness.toFixed(1)}
                            </span>
                        ) : (
                            <>
                                <span
                                    style={{
                                        color: "red",
                                        textDecoration: "line-through",
                                    }}
                                >
                                    {sweetness.toFixed(1)}
                                </span>{" "}
                                <span style={{ color: "green" }}>
                                    {(wine.sweetness || 0).toFixed(1)}
                                </span>
                            </>
                        )
                    ) : (
                        sweetness.toFixed(1)
                    )}
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
                    {completed && wine ? (
                        tannins.toFixed(1) === (wine.tannin || 0).toFixed(1) ? (
                            <span style={{ color: "green" }}>
                                <span
                                    style={{
                                        fontSize: "1.5em",
                                        marginRight: "5px",
                                    }}
                                >
                                    ✓
                                </span>
                                {tannins.toFixed(1)}
                            </span>
                        ) : (
                            <>
                                <span
                                    style={{
                                        color: "red",
                                        textDecoration: "line-through",
                                    }}
                                >
                                    {tannins.toFixed(1)}
                                </span>{" "}
                                <span style={{ color: "green" }}>
                                    {(wine.tannin || 0).toFixed(1)}
                                </span>
                            </>
                        )
                    ) : (
                        tannins.toFixed(1)
                    )}
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
                    {!completed && (
                        <>
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
                        </>
                    )}
                    {completed &&
                        wine &&
                        (Number(cost) == (wine.price || 0) ? (
                            <span style={{ color: "green" }}>
                                <span
                                    style={{
                                        fontSize: "1.5em",
                                        marginRight: "5px",
                                    }}
                                >
                                    ✓
                                </span>
                                <span style={{ marginRight: "5px" }}>
                                    {wine.currency_code === "USD" ? "$" : "€"}
                                </span>
                                <span> {cost} </span>
                            </span>
                        ) : (
                            <>
                                <span style={{ marginRight: "5px" }}>
                                    {wine.currency_code === "USD" ? "$" : "€"}
                                </span>
                                <span
                                    style={{
                                        color: "red",
                                        textDecoration: "line-through",
                                        marginRight: "5px",
                                    }}
                                >
                                    {cost || 0}
                                </span>{" "}
                                <span style={{ color: "green" }}>
                                    {wine.price || 0}
                                </span>
                            </>
                        ))}
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
                <output htmlFor="rating-slider">
                    {completed && wine ? (
                        rating == wine.ratings_average ? (
                            <span style={{ color: "green" }}>
                                <span
                                    style={{
                                        fontSize: "1.5em",
                                        marginRight: "5px",
                                    }}
                                >
                                    ✓
                                </span>
                                {rating.toFixed(1)}
                            </span>
                        ) : (
                            <>
                                <span
                                    style={{
                                        color: "red",
                                        textDecoration: "line-through",
                                    }}
                                >
                                    {rating.toFixed(1)}
                                </span>{" "}
                                <span style={{ color: "green" }}>
                                    {(wine.ratings_average || 0).toFixed(1)}
                                </span>
                            </>
                        )
                    ) : (
                        rating.toFixed(1)
                    )}
                </output>
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
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <div>Score: {score}</div>
                            <div
                                style={{
                                    whiteSpace: "pre-line",
                                    marginTop: "10px",
                                    fontSize: "14px",
                                    textAlign: "left",
                                }}
                            >
                                {tooltipText}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
