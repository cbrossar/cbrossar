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
    const [currentStreak, setCurrentStreak] = useState<number>(0);
    const [highestStreak, setHighestStreak] = useState<number>(0);
    const [fastestTime, setFastestTime] = useState<number>(0);
    const [totalAttempts, setTotalAttempts] = useState<number>(0);
    const [totalCorrect, setTotalCorrect] = useState<number>(0);
    const [under10s, setUnder10s] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [showStats, setShowStats] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null); // New state for the message
    const stats = {
        currentStreak,
        currentTime,
        highestStreak,
        fastestTime,
        totalCorrect,
        totalAttempts,
        under10s,
    };

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

    const handleContinue = () => {
        setDate(generateRandomDate());
        setSelectedDay(null);
        setIsCorrect(false);
        startTimeRef.current = null; // Reset the timer
        setMessage(null); // Reset the message when continuing
    };

    const startTimeRef = useRef<number | null>(null); // Ref to store the start time of the guess

    useEffect(() => {
        setDate(generateRandomDate());
        fetch("/api/doomsday")
            .then((res) => res.json())
            .then((data) => {
                setCurrentStreak(data.currentStreak);
                setHighestStreak(data.highestStreak);
                setFastestTime(data.fastestTime);
                setTotalAttempts(data.totalAttempts);
                setTotalCorrect(data.totalCorrect);
                setUnder10s(data.under10s);
            });
    }, []);

    const handleClick = (day: string) => {
        if (startTimeRef.current === null || selectedDay !== null) return; // Prevent clicks before the timer starts

        const endTime = performance.now(); // Get the end time
        const timeTakenMs = endTime - startTimeRef.current; // Calculate the time taken in milliseconds

        setSelectedDay(day);
        const isCorrect = day === correctDay;
        setIsCorrect(isCorrect);

        const res = fetch("/api/doomsday", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                correct: isCorrect,
                time_taken_ms: timeTakenMs,
            }),
        });

        res.then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    setCurrentStreak(data.streak);
                    setTotalAttempts(totalAttempts + 1);
                    setCurrentTime(data.time_taken_ms);
                    if (isCorrect) {
                        setTotalCorrect(totalCorrect + 1);
                        if (data.streak > highestStreak) {
                            setHighestStreak(data.streak);
                        }
                        if (data.time_taken_ms < fastestTime) {
                            setFastestTime(data.time_taken_ms);
                            setMessage("New fastest time!"); // Set the message
                            setShowStats(true); // Show the stats modal
                        }
                    }
                });
            }
        });
    };

    useEffect(() => {
        // Initialize the timer when the date is set
        if (date) {
            startTimeRef.current = performance.now();
        }
    }, [date]);

    return (
        <div className={styles.container}>
            <div className={styles.highScore}>High Score: {highestStreak}</div>
            <div className={styles.currentScore}>Score: {currentStreak}</div>
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
                        } ${
                            selectedDay !== null && day === correctDay
                                ? styles.correct
                                : ""
                        } ${day === "Sunday" ? styles.sunday : ""}`}
                        onClick={() => handleClick(day)}
                    >
                        {day}
                    </div>
                ))}
            </div>
            <button
                className={styles.statsButton}
                onClick={() => setShowStats(true)}
            >
                Stats
            </button>
            <StatsModal
                show={showStats}
                onClose={() => setShowStats(false)}
                stats={stats}
                message={message} // Pass the message to the modal
            />
            <button className={styles.continueButton} onClick={handleContinue}>
                Next
            </button>
        </div>
    );
}

interface Props {
    show: boolean;
    onClose: () => void;
    stats: {
        currentStreak: number;
        currentTime: number;
        highestStreak: number;
        fastestTime: number;
        totalCorrect: number;
        totalAttempts: number;
        under10s: number;
    };
    message: string | null;
}

function StatsModal({ show, onClose, stats, message }: Props) {
    const handleClickOutside = (event: any) => {
        if (event.target.className.includes(styles.modalOverlay)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    if (!show) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2>Statistics</h2>
                {message && <h3 className={styles.bold}>{message}</h3>}
                <h3>Current Score: {stats.currentStreak}</h3>
                <h3>Current Time: {(stats.currentTime / 1000).toFixed(1)}s</h3>
                <h3>Highest Score: {stats.highestStreak}</h3>
                <h3>Fastest Time: {(stats.fastestTime / 1000).toFixed(1)}s</h3>
                <h3>
                    Correct:{" "}
                    {((stats.totalCorrect / stats.totalAttempts) * 100).toFixed(
                        1,
                    )}
                    %
                </h3>
                <h3>
                    Under 10s:{" "}
                    {((stats.under10s / stats.totalCorrect) * 100).toFixed(1)}%
                </h3>
                <h3>Total Attempts: {stats.totalAttempts}</h3>
            </div>
        </div>
    );
}
