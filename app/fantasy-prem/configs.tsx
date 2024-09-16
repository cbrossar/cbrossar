"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

export function BudgetSlider({ min, max }: { min: number; max: number }) {
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

export function FormationSelect() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Define available formations
    const formations = [
        { label: "1-3-5-2", value: "1-3-5-2" },
        { label: "1-4-4-2", value: "1-4-4-2" },
        { label: "1-3-4-3", value: "1-3-4-3" },
        { label: "2-5-5-3", value: "2-5-5-3" },
    ];

    // Get initial formation from the URL or fallback to a default value (e.g., "1-3-5-2")
    const initialFormation = searchParams.get("formation") || "1-3-5-2";
    const [formation, setFormation] = useState(initialFormation);

    const handleFormationChange = (newFormation: string) => {
        const params = new URLSearchParams(searchParams);
        if (newFormation) {
            params.set("formation", newFormation);
        } else {
            params.delete("formation");
        }
        replace(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        handleFormationChange(formation); // Update URL params when formation changes
    }, [formation]);

    return (
        <div className="formation-select-container">
            <label htmlFor="formation-select" className="sr-only">
                Formation
            </label>
            <select
                id="formation-select"
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="formation-select"
            >
                {formations.map((formation) => (
                    <option key={formation.value} value={formation.value}>
                        {formation.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
