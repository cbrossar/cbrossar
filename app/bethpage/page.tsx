"use client";
import { useEffect, useState } from "react";
import { fetchBethpage } from "../lib/data";
import { BookingData } from "../lib/definitions";
import styles from "./styles.module.css"; // Import CSS module for styling

const BethpageBookingPage = () => {
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState<BookingData>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                if (typeof window !== "undefined") {
                    const data = await fetchBethpage();
                    setBookingData(data);
                }
            } catch (error) {
                setError(
                    "Error fetching booking data. Please try again later.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, []);

    if (loading) {
        return <p className={styles.loading}>Loading...</p>; // Apply loading style
    }

    if (error) {
        return <p className={styles.error}>{error}</p>; // Apply error style
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>
                Bethpage Golf Course Booking Information
            </h1>
            {Object.keys(bookingData).map((courseName) => (
                <div key={courseName} className={styles.courseContainer}>
                    <h3 className={styles.courseName}>{courseName}</h3>
                    {Object.keys(bookingData[courseName]).map((date) => (
                        <div key={date} className={styles.dateContainer}>
                            <h4 className={styles.date}>{date}</h4>
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
