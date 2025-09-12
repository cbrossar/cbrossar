"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ReleaseTypeSelect() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const selectedType = searchParams.get("type") || "";

    return (
        <select
            value={selectedType}
            onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                    params.set("type", e.target.value);
                } else {
                    params.delete("type");
                }
                router.push(`?${params.toString()}`);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
            <option value="">All Types</option>
            <option value="album">Albums</option>
            <option value="single">Singles</option>
        </select>
    );
}
