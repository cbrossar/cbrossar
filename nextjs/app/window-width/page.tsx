"use client";
import useWindowWidth from "../lib/useWindowWidth";

export default function Page() {
    const windowWidth = useWindowWidth();

    return (
        <div>
            <div>window width: {windowWidth}</div>
        </div>
    );
}
