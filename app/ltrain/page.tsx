"use client";
import useLTrainTimes from "@/app/lib/useLTrainTimes";

export default function Page() {
    const { lTrainTimes, error } = useLTrainTimes();

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">L Train Times</h1>
            <ul className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
                {lTrainTimes.map((time, i) => (
                    <li
                        key={i}
                        className="border-b last:border-b-0 py-2 text-gray-800 text-center"
                    >
                        {time}
                    </li>
                ))}
            </ul>
        </div>
    );
}
