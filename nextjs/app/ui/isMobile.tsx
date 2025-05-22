"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import useWindowWidth from "../lib/useWindowWidth";

export default function IsMobile() {
    const pathname = usePathname();
    const { replace } = useRouter();
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams.toString());

    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 500;
    
    if(isMobile) {
        params.set("isMobile", isMobile.toString())
        replace(`${pathname}?${params.toString()}`);
    }
    else {
        params.delete("isMobile")
        replace(`${pathname}?${params.toString()}`);
    }
    return null;
}
