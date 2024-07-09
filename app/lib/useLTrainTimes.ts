import { useEffect, useState } from "react";
import { fetchLTrainTimes } from "@/app/lib/data";

const useLTrainTimes = () => {
    const [lTrainTimes, setLTrainTimes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const times = await fetchLTrainTimes();
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
