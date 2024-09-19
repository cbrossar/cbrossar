"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BudgetSlider from "./budget-slider";
import FormationSelect from "./formation-select";
import CostToggle from "./cost-toggle";
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
                ⚙️
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
                        <BudgetSlider min={0} max={100} />
                        <FormationSelect />
                        <CostToggle />
                    </div>
                </div>
            )}
        </>
    );
}
