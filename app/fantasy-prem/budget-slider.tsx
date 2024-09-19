"use client";

export default function BudgetSlider({
    min,
    max,
    budget,
    setBudget,
}: {
    min: number;
    max: number;
    budget: number;
    setBudget: (budget: number) => void;
}) {
    return (
        <div className="budget-slider-container">
            <label htmlFor="budget-slider" className="sr-only">
                Budget
            </label>
            <input
                id="budget-slider"
                type="range"
                min={min}
                max={max}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="budget-slider"
            />
            <div className="budget-display">Budget: £{budget}m</div>
        </div>
    );
}
