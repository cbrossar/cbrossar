import { useEffect, useState } from "react";

const useLTrainTimes = () => {
    const [lTrainTimes, setLTrainTimes] = useState<{ [key: string]: string[] }>(
        {},
    );
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/ltrain");
                const times = await response.json();
                setLTrainTimes(times);
            } catch (error) {
                setError(
                    "Error fetching L train times. Please try again later.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { lTrainTimes, error, isLoading };
};

export default useLTrainTimes;
