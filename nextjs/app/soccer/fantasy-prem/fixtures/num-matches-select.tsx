"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function NumMatchesSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const currentNumMatches = searchParams.get('numMatches') || '3';

    const handleNumMatchesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedNumMatches = event.target.value;
        const params = new URLSearchParams(searchParams.toString());
        
        if (selectedNumMatches && selectedNumMatches !== '3') {
            params.set('numMatches', selectedNumMatches);
        } else {
            params.delete('numMatches');
        }
        
        router.push(`/soccer/fantasy-prem/fixtures?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="numMatches" className="text-sm font-medium">
                Number of Matches:
            </label>
            <select
                id="numMatches"
                value={currentNumMatches}
                onChange={handleNumMatchesChange}
                className="border border-gray-300 rounded-md p-1"
            >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
            </select>
        </div>
    );
}