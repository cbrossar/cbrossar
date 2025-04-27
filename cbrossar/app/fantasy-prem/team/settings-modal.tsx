"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCog } from "react-icons/fa"; // Import the gear icon from react-icons
import BudgetSlider from "./budget-slider";
import FormationSelect from "./formation-select";
import CostToggle from "./cost-toggle";
import GameweekToggle from "./gameweek-toggle";
import styles from "./modal.module.css"; // Add your modal styles here

type PointsView = "all" | "current" | "last5";

export default function SettingsModal() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Modal state based on URL parameter
    const isModalOpenParam = searchParams.get("modalOpen") === "true";
    const [isModalOpen, setIsModalOpen] = useState(isModalOpenParam);

    const budgetParam = Number(searchParams.get("budget")) || 80;
    const [budget, setBudget] = useState(budgetParam);

    const formationParam = searchParams.get("formation") || "1-3-5-2";
    const [formation, setFormation] = useState(formationParam);

    const pointsViewParam = (searchParams.get("pointsView") as PointsView) || "all";
    const [pointsView, setPointsView] = useState<PointsView>(pointsViewParam);

    const isNowCostParam = searchParams.get("isNowCost") === "true";
    const [isNowCost, setIsNowCost] = useState(isNowCostParam);

    // Update the URL param when modal state changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (isModalOpen) {
            params.set("modalOpen", "true");
        } else {
            params.delete("modalOpen");
        }
        if (budget) {
            params.set("budget", budget.toString());
        } else {
            params.delete("budget");
        }
        if (formation) {
            params.set("formation", formation);
        } else {
            params.delete("formation");
        }
        if (isNowCost) {
            params.set("isNowCost", "true");
        } else {
            params.delete("isNowCost");
        }
        if (pointsView) {
            params.set("pointsView", pointsView);
        } else {
            params.delete("pointsView");
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, [
        isModalOpen,
        budget,
        formation,
        isNowCost,
        pointsView,
        searchParams,
        pathname,
        router,
    ]);

    return (
        <>
            <button
                className={styles.gearButton}
                onClick={() => setIsModalOpen(true)}
            >
                <FaCog size={24} />
            </button>

            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <button
                            className={styles.closeButton}
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✖️
                        </button>
                        <div className={styles.config}>
                            <BudgetSlider
                                min={0}
                                max={100}
                                budget={budget}
                                setBudget={setBudget}
                            />
                        </div>
                        <div className={styles.config}>
                            <FormationSelect
                                formation={formation}
                                setFormation={setFormation}
                            />
                        </div>
                        <div className={styles.config}>
                            <CostToggle
                                isNowCost={isNowCost}
                                setIsNowCost={setIsNowCost}
                            />
                        </div>
                        <div className={styles.config}>
                            <GameweekToggle
                                pointsView={pointsView}
                                setPointsView={setPointsView}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
