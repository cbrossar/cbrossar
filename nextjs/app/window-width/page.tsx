"use client";
import useWindowWidth from "../lib/useWindowWidth";
import IsMobile from "../ui/isMobile";

export default function Page() {
    const windowWidth = useWindowWidth();

    return (
        <div>
            <div>window width: {windowWidth}</div>
            <IsMobile />
        </div>
    );
}
