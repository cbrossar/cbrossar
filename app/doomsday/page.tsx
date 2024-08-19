"use client";
import { useState, useEffect } from "react";
import styles from "./styles.module.css";

export default function Page() {
    // Generate a random date in 1900s or 2000s
    const generateRandomDate = () => {
        const century = Math.random() < 0.5 ? 1900 : 2000;
        const year = Math.floor(Math.random() * 100);
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28);
        return new Date(century + year, month, day);
    };

    const [date, setDate] = useState<Date | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);

    const dateString = date && date.toISOString().split("T")[0];
    const correctDay =
        date && date.toLocaleDateString("en-US", { weekday: "long" });

    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    useEffect(() => {
        setDate(generateRandomDate());
    }, []);

    const handleClick = (day: string) => {
        setSelectedDay(day);
        setIsCorrect(day === correctDay);
    };

    return (
        <div className={styles.container}>
            <div className={styles.dateWrapper}>
                <h1 className={styles.date}>{dateString}</h1>
            </div>
            <div className={styles.grid}>
                {DAYS.map((day) => (
                    <div
                        key={day}
                        className={`${styles.button} ${
                            selectedDay === day
                                ? isCorrect
                                    ? styles.correct
                                    : styles.incorrect
                                : ""
                        } ${day === "Sunday" ? styles.sunday : ""}`}
                        onClick={() => handleClick(day)}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}
