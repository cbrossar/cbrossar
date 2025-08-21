"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface GameweekRangeSelectProps {
    defaultStartGameweek: number;
    defaultEndGameweek: number;
}

export default function GameweekRangeSelect({ defaultStartGameweek, defaultEndGameweek }: GameweekRangeSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const currentStartGameweek = parseInt(searchParams.get('startGameweek') || defaultStartGameweek.toString());
    const currentEndGameweek = parseInt(searchParams.get('endGameweek') || defaultEndGameweek.toString());
    
    const [startGameweek, setStartGameweek] = useState(currentStartGameweek);
    const [endGameweek, setEndGameweek] = useState(currentEndGameweek);
    const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setStartGameweek(currentStartGameweek);
        setEndGameweek(currentEndGameweek);
    }, [currentStartGameweek, currentEndGameweek]);

    const handleMouseDown = (handle: 'start' | 'end') => {
        setIsDragging(handle);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, x / width));
        const value = Math.round(percentage * 37) + 1; // 1 to 38

        if (isDragging === 'start') {
            const newStart = Math.min(value, endGameweek - 1);
            setStartGameweek(newStart);
        } else {
            const newEnd = Math.max(value, startGameweek + 1);
            setEndGameweek(newEnd);
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            const params = new URLSearchParams(searchParams.toString());
            
            if (startGameweek !== defaultStartGameweek) {
                params.set('startGameweek', startGameweek.toString());
            } else {
                params.delete('startGameweek');
            }
            
            if (endGameweek !== Math.min(defaultStartGameweek + 2, 38)) {
                params.set('endGameweek', endGameweek.toString());
            } else {
                params.delete('endGameweek');
            }
            
            router.push(`/soccer/fantasy-prem/fixtures?${params.toString()}`);
        }
        setIsDragging(null);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, startGameweek, endGameweek]);

    const startPosition = ((startGameweek - 1) / 37) * 100;
    const endPosition = ((endGameweek - 1) / 37) * 100;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Gameweek Range:</span>
                <span className="text-sm font-mono">
                    {startGameweek} - {endGameweek}
                </span>
            </div>
            
            <div className="relative w-48 h-6">
                <div
                    ref={sliderRef}
                    className="absolute w-full h-2 bg-gray-300 rounded-full top-1/2 transform -translate-y-1/2"
                >
                    {/* Selected range track */}
                    <div
                        className="absolute h-2 bg-blue-500 rounded-full"
                        style={{
                            left: `${startPosition}%`,
                            width: `${endPosition - startPosition}%`
                        }}
                    />
                    
                    {/* Start handle */}
                    <div
                        className={`absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow cursor-pointer transform -translate-y-1/2 top-1/2 ${
                            isDragging === 'start' ? 'z-10' : ''
                        }`}
                        style={{ left: `${startPosition}%` }}
                        onMouseDown={() => handleMouseDown('start')}
                    />
                    
                    {/* End handle */}
                    <div
                        className={`absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow cursor-pointer transform -translate-y-1/2 top-1/2 ${
                            isDragging === 'end' ? 'z-10' : ''
                        }`}
                        style={{ left: `${endPosition}%` }}
                        onMouseDown={() => handleMouseDown('end')}
                    />
                </div>
            </div>
        </div>
    );
}