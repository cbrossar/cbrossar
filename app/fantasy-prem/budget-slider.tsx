"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

export default function BudgetSlider({
    min,
    max,
}: {
    min: number;
    max: number;
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Get initial budget from the URL or fallback to a default value (e.g., 80)
    const initialBudget = Number(searchParams.get("budget")) || 80;
    const [budget, setBudget] = useState(initialBudget);

    const handleBudgetChange = useDebouncedCallback((newBudget) => {
        const params = new URLSearchParams(searchParams);
        if (newBudget) {
            params.set("budget", newBudget.toString());
        } else {
            params.delete("budget");
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    useEffect(() => {
        handleBudgetChange(budget); // Update URL params when budget changes
    }, [budget]);

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
