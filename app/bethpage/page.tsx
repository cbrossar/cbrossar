"use client";
import { useEffect, useState } from "react";
import styles from "./styles.module.css"; // Import CSS module for styling

interface BookingData {
    [courseName: string]: {
        [date: string]: {
            time: string;
            holes: number;
            people: number;
        }[];
    };
}

const BethpageBookingPage = () => {
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState<BookingData>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                const response = await fetch("/api/bethpage");
                const data = await response.json();
                if (data) {
                    setBookingData(data);
                } else {
                    throw new Error("Failed to fetch booking data");
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
                                                key={`${booking.time}-${booking.holes}-${booking.people}`}
                                                className={styles.bookingItem}
                                            >
                                                <strong>Time:</strong>{" "}
                                                {booking.time},{" "}
                                                <strong>Holes:</strong>{" "}
                                                {booking.holes},{" "}
                                                <strong>People:</strong>{" "}
                                                {booking.people}
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
