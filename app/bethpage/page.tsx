"use client";
import { useEffect, useState } from "react";
import { BookingData } from "@/app/lib/definitions";
import styles from "./styles.module.css"; // Import CSS module for styling

const BethpageBookingPage = () => {
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState<BookingData>({});
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setProgress(0);
        try {
            const response = await fetch("/api/bethpage");
            const data = await response.json();
            setBookingData(data);
        } catch (error) {
            setError("Error fetching booking data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setProgress((prevProgress) => {
                    const newProgress = prevProgress + 0.5; // Increment progress for 20 seconds
                    if (newProgress >= 100) {
                        clearInterval(interval);
                    }
                    return newProgress;
                });
            }, 100);
        }
    }, [loading]);

    const handleRefresh = () => {
        fetchData();
    };

    const getFormattedDate = (dateString: string) => {
        const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];

        const [month, day, year] = dateString.split("-");
        const formattedDate = `${year}-${month}-${day}`;
        const date = new Date(formattedDate);
        return `${month}-${day} (` + daysOfWeek[date.getUTCDay()] + `)`;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loading}>Loading...</p>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progress}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return <p className={styles.error}>{error}</p>; // Apply error style
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>
                Bethpage Golf Course Booking Information
            </h1>
            <button onClick={handleRefresh} className={styles.refreshButton}>
                Refresh
            </button>
            {Object.keys(bookingData).map((courseName) => (
                <div key={courseName} className={styles.courseContainer}>
                    <h3 className={styles.courseName}>{courseName}</h3>
                    {Object.keys(bookingData[courseName]).map((date) => (
                        <div key={date} className={styles.dateContainer}>
                            <h4 className={styles.date}>
                                {getFormattedDate(date)}
                            </h4>
                            {bookingData[courseName][date].length > 0 ? (
                                <ul className={styles.bookingList}>
                                    {bookingData[courseName][date].map(
                                        (booking) => (
                                            <li
                                                key={`${booking.time}-${booking.holes}-${booking.players}`}
                                                className={styles.bookingItem}
                                            >
                                                <strong>Time:</strong>{" "}
                                                {booking.time},{" "}
                                                <strong>Holes:</strong>{" "}
                                                {booking.holes},{" "}
                                                <strong>Players:</strong>{" "}
                                                {booking.players}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            ) : (
                                <p className={styles.noBooking}>
                                    No bookings available for this date.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default BethpageBookingPage;
