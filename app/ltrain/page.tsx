"use client";
import { format, parse } from "date-fns";
import useLTrainTimes from "@/app/lib/useLTrainTimes";
import styles from "./styles.module.css";

export default function Page() {
    const { lTrainTimes, error, isLoading } = useLTrainTimes();

    const calculateTimeUntil = (trainTime: string) => {
        const now = new Date();
        const today = format(now, "yyyy-MM-dd");
        const trainDate = parse(
            `${today} ${trainTime}`,
            "yyyy-MM-dd h:mm:ss aa",
            new Date(),
        );

        if (isNaN(trainDate)) {
            return "Invalid time format";
        }

        const minutesUntil = Math.round(
            (trainDate.getTime() - now.getTime()) / 60000,
        );
        return `~${minutesUntil} min`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center h-screen">
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">L Train Bedford N Times</h1>
            <ul className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
                {lTrainTimes.map((time, i) => (
                    <li
                        key={i}
                        className="border-b last:border-b-0 py-2 text-gray-800 text-center"
                    >
                        {time} ({calculateTimeUntil(time)})
                    </li>
                ))}
            </ul>
        </div>
    );
}
