"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCog } from "react-icons/fa"; // Import the gear icon from react-icons
import BudgetSlider from "./budget-slider";
import FormationSelect from "./formation-select";
import CostToggle from "./cost-toggle";
import GameweekToggle from "./gameweek-toggle";
import styles from "./modal.module.css"; // Add your modal styles here

export default function SettingsModal() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Modal state based on URL parameter
    const isModalOpenParam = searchParams.get("modalOpen") === "true";
    const [isModalOpen, setIsModalOpen] = useState(isModalOpenParam);

    // Update the URL param when modal state changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (isModalOpen) {
            params.set("modalOpen", "true");
        } else {
            params.delete("modalOpen");
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, [isModalOpen, searchParams, pathname, router]);

    return (
        <>
            {/* Gear icon to trigger the modal */}
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
                            <BudgetSlider min={0} max={100} />
                        </div>
                        <div className={styles.config}>
                            <FormationSelect />
                        </div>
                        <div className={styles.config}>
                            <CostToggle />
                        </div>
                        <div className={styles.config}>
                            <GameweekToggle />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
