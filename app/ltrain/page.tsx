"use client";
import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import useLTrainTimes from "@/app/lib/useLTrainTimes";
import Tooltip from "@mui/material/Tooltip";
import styles from "./styles.module.css";
import SuspenseBoundary from "../lib/suspense"; // Update the path

export default function Page() {
    return (
        <SuspenseBoundary>
            <LTrain />
        </SuspenseBoundary>
    );
}

function LTrain() {
    const { lTrainTimes, error, isLoading } = useLTrainTimes();
    const [selectedOption, setSelectedOption] = useState("L08N");

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const params = new URLSearchParams(searchParams);

    useEffect(() => {
        const stationParam = params.get("station");
        if (stationParam) {
            setSelectedOption(stationParam);
        }
    }, []);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(e.target.value);
        params.set("station", e.target.value);
        replace(`${pathname}?${params.toString()}`);
    };

    const calculateTimeUntil = (trainTime: string) => {
        // Parse train time as EST
        const trainDatetimeEST = parse(
            trainTime,
            "M/d/yyyy, h:mm:ss aa",
            new Date(),
        );

        const nowEST = new Date();
        formatInTimeZone(nowEST, "America/New_York", "yyyy-MM-dd h:mm:ss aa");

        // Calculate minutes until train
        const minutesUntil = Math.round(
            (trainDatetimeEST.getTime() - nowEST.getTime()) / 60000,
        );

        return { minutesUntil, trainDatetime: trainDatetimeEST };
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

    const stationKeyToName: { [key: string]: string } = {
        L08N: "Bedford Ave - Manhattan Bound",
        L08S: "Bedford Ave - Brooklyn Bound",
        L06N: "Union Square - Manhattan Bound",
        L06S: "Union Square - Brooklyn Bound",
        L03N: "1st Ave - Manhattan Bound",
        L03S: "1st Ave - Brooklyn Bound",
    };

    const filteredTimes = lTrainTimes[selectedOption] || [];

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">L Train</h1>
            <select
                value={selectedOption}
                onChange={handleSelectChange}
                className="mb-6 p-2 border rounded"
            >
                {Object.keys(stationKeyToName).map((stationKey) => (
                    <option key={stationKey} value={stationKey}>
                        {stationKeyToName[stationKey]}
                    </option>
                ))}
            </select>
            <ul className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
                {filteredTimes.slice(0, 8).map((time, i) => {
                    const { minutesUntil, trainDatetime } =
                        calculateTimeUntil(time);
                    if (minutesUntil < 0) return null; // Skip times with negative minutesUntil
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
