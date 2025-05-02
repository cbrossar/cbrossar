"use client";

type PointsView = "all" | "current" | "last5";

export default function GameweekToggle({
    pointsView,
    setPointsView,
}: {
    pointsView: PointsView;
    setPointsView: (view: PointsView) => void;
}) {
    return (
        <div className="gameweek-toggle-container">
            <div className="radio-group">
                <label className="radio-label">
                    <input
                        type="radio"
                        name="points-view"
                        value="all"
                        checked={pointsView === "all"}
                        onChange={(e) =>
                            setPointsView(e.target.value as PointsView)
                        }
                    />
                    <span>All</span>
                </label>
                <label className="radio-label">
                    <input
                        type="radio"
                        name="points-view"
                        value="current"
                        checked={pointsView === "current"}
                        onChange={(e) =>
                            setPointsView(e.target.value as PointsView)
                        }
                    />
                    <span>Current</span>
                </label>
                <label className="radio-label">
                    <input
                        type="radio"
                        name="points-view"
                        value="last5"
                        checked={pointsView === "last5"}
                        onChange={(e) =>
                            setPointsView(e.target.value as PointsView)
                        }
                    />
                    <span>Last 5</span>
                </label>
            </div>
            <style jsx>{`
                .gameweek-toggle-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .radio-group {
                    display: flex;
                    gap: 20px;
                }

                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .radio-label input[type="radio"] {
                    cursor: pointer;
                }

                .radio-label span {
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
}
