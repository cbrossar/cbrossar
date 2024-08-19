"use client";
import { useState, useEffect, useRef } from "react";
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
    const [highestStreak, setHighestStreak] = useState<number>(0);
    const [fastestTime, setFastestTime] = useState<number>(0);
    const [totalAttempts, setTotalAttempts] = useState<number>(0);
    const [totalCorrect, setTotalCorrect] = useState<number>(0);

    const startTimeRef = useRef<number | null>(null); // Ref to store the start time of the guess

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
        fetch("/api/doomsday")
            .then((res) => res.json())
            .then((data) => {
                setHighestStreak(data.highestStreak);
                setFastestTime(data.fastestTime);
                setTotalAttempts(data.totalAttempts);
                setTotalCorrect(data.totalCorrect);
            });
    }, []);

    const handleClick = (day: string) => {
        if (startTimeRef.current === null) return; // Prevent clicks before the timer starts

        const endTime = performance.now(); // Get the end time
        const timeTakenMs = endTime - startTimeRef.current; // Calculate the time taken in milliseconds

        setSelectedDay(day);
        const isCorrect = day === correctDay;
        setIsCorrect(isCorrect);

        fetch("/api/doomsday", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                correct: isCorrect,
                time_taken_ms: timeTakenMs,
            }),
        });

        // Update the timer for the next guess
        startTimeRef.current = performance.now(); // Reset start time for the next guess
    };

    useEffect(() => {
        // Initialize the timer when the date is set
        if (date) {
            startTimeRef.current = performance.now();
        }
    }, [date]);

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
            <div className={styles.highestStreak}>
                <h2>Highest Streak: {highestStreak}</h2>
                <h2>Fastest Time: {fastestTime / 1000}s</h2>
                <h2>Total Correct: {totalCorrect}</h2>
                <h2>Total Attempts: {totalAttempts}</h2>
            </div>
        </div>
    );
}
