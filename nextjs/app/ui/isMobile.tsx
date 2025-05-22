"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import useWindowWidth from "../lib/useWindowWidth";

export default function IsMobile() {
    const pathname = usePathname();
    const { replace } = useRouter();
    const searchParams = useSearchParams();
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 500;

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (isMobile) {
            params.set("isMobile", "true");
        } else {
            params.delete("isMobile");
        }

        replace(`${pathname}?${params.toString()}`);
    }, [isMobile, pathname, replace, searchParams]);

    return null;
}
