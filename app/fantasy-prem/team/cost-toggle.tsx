"use client";

export default function CostToggle({
    isNowCost,
    setIsNowCost,
}: {
    isNowCost: boolean;
    setIsNowCost: (isNowCost: boolean) => void;
}) {
    const handleToggle = () => {
        setIsNowCost(!isNowCost);
    };

    return (
        <div className="cost-toggle-container">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={isNowCost}
                    onChange={handleToggle}
                />
                <span className="slider"></span>
            </label>
            <div className="cost-display">
                {isNowCost ? "Now Cost" : "Original Cost"}
            </div>
            <style jsx>{`
                .cost-toggle-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.4s;
                    border-radius: 34px;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }

                input:checked + .slider {
                    background-color: #4caf50;
                }

                input:checked + .slider:before {
                    transform: translateX(26px);
                }
            `}</style>
        </div>
    );
}