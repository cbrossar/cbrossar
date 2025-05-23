"use client";
import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Tooltip from "@mui/material/Tooltip";
import SuspenseBoundary from "@/app/lib/suspense";
import Spinner from "@/app/ui/spinner";
import useLTrainTimes from "./useLTrainTimes";

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
    const stationParam = params.get("station");

    useEffect(() => {
        if (stationParam) {
            setSelectedOption(stationParam);
        }
    }, [stationParam]);

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
        return <Spinner />;
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
            <div className="flex items-center rounded-lg px-6 py-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-400 mr-4">
                    <span className="text-white text-3xl font-bold translate-y-[-1px]">
                        L
                    </span>
                </div>
                <span className="text-black text-3xl font-bold">Trains</span>
            </div>
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

            {/* Check if filteredTimes is empty */}
            {filteredTimes.length === 0 ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg w-full max-w-md text-center">
                    <h2 className="text-xl font-semibold mb-2">
                        Service Alert
                    </h2>
                    <p>
                        The L Train is currently down. Please check back later.
                    </p>
                </div>
            ) : (
                <>
                    <ul className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
                        {filteredTimes.slice(0, 8).map((time, i) => {
                            const { minutesUntil, trainDatetime } =
                                calculateTimeUntil(time);
                            if (minutesUntil < 0) return null; // Skip times with negative minutesUntil
                            const fullTime = format(
                                trainDatetime,
                                "hh:mm:ss aa",
                            );
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
                </>
            )}
        </div>
    );
}
