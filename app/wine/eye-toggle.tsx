"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
export default function EyeToggle() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const isHidden = searchParams.get("isHidden") === "true";

    const handleClick = () => {
        const params = new URLSearchParams(searchParams as any);
        params.set("isHidden", isHidden ? "false" : "true");
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div onClick={handleClick}>
            {isHidden ? (
                <EyeSlashIcon className="h-6 w-6" />
            ) : (
                <EyeIcon className="h-6 w-6" />
            )}
        </div>
    );
}
