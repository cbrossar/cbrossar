"use client";
import { format, parse } from "date-fns";
import useLTrainTimes from "@/app/lib/useLTrainTimes";
import Tooltip from "@mui/material/Tooltip";
import styles from "./styles.module.css";

export default function Page() {
    const { lTrainTimes, error, isLoading } = useLTrainTimes();

    const calculateTimeUntil = (trainTime: string) => {
        const now = new Date();
        const today = format(now, "yyyy-MM-dd");
        const trainDatetime = parse(
            `${today} ${trainTime}`,
            "yyyy-MM-dd h:mm:ss aa",
            new Date(),
        );

        const minutesUntil = Math.round(
            (trainDatetime.getTime() - now.getTime()) / 60000,
        );
        return { minutesUntil, trainDatetime };
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
            <h1 className="text-3xl font-bold mb-6">L Train</h1>
            <h2 className="text-xl mb-6 text-center">
                Bedford Ave - Manhattan Bound
            </h2>
            <ul className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
                {lTrainTimes.slice(0, 8).map((time, i) => {
                    const { minutesUntil, trainDatetime } =
                        calculateTimeUntil(time);
                    const fullTime = format(trainDatetime, "hh:mm:ss aa");
                    const minTime = format(trainDatetime, "h:mm");
                    return (
                        <li
                            key={i}
                            className="border-b last:border-b-0 py-2 text-gray-800 text-center"
                        >
                            <Tooltip
                                title={fullTime}
                                enterTouchDelay={0} // Show tooltip immediately on touch
                                leaveTouchDelay={1500} // Keep tooltip open for a while after touch ends
                            >
                                <span>
                                    {minTime} (~{minutesUntil} min)
                                </span>
                            </Tooltip>
                        </li>
                    );
                })}
            </ul>
            <p className="text-gray-500 text-sm mt-4">
                Tap or hover to see the time in seconds.
            </p>
        </div>
    );
}
