"use client";

import { useState, useEffect } from "react";
import EyeToggle from "@/app/wine/eye-toggle";
import Select from "react-select";
import styles from "./styles.module.css";
import { Region, Wine } from "@/app/lib/definitions";
import { usePathname, useRouter } from "next/navigation";
import { calculateScore } from "./utils";
import Spinner from "@/app/ui/spinner";

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

    const pathname = usePathname();
    const { replace } = useRouter();

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
        return <Spinner />;
    }

    const isHidden = searchParams.isHidden === "true";

    const regionOptions = regions.map((region) => ({
        value: region.id.toString(),
        label: region.name,
    }));

    const handleComplete = () => {
        setCompleted(true);
        const score = calculateScore(
            wine,
            acidity,
            sweetness,
            tannins,
            cost,
            rating,
            region_dict,
            regions,
        );
        setScore(score);
        const params = new URLSearchParams(searchParams as any);
        params.set("isHidden", "false");
        replace(`${pathname}?${params.toString()}`);
    };

    const regionName = regions.find((r) => r.id === wine.region_id)?.name;
    const milesAway = 10;

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
            {completed && regionName == region_dict?.label && (
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
                        {regionName}
                    </p>
                </div>
            )}
            {completed && regionName != region_dict?.label && (
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
                        {regionName} ({milesAway} mi away)
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
                            </span>
                        ) : (
                            <>
                                <span style={{ color: "green" }}>
                                    {(wine.price || 0).toFixed(2)}
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
                        }}
                    >
                        Score: {score}
                    </div>
                )}
            </div>
        </div>
    );
}
