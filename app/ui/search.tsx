"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

export default function Search({
    placeholder,
    shouldSetPage = true, // New boolean prop to control the 'page' param
}: {
    placeholder: string;
    shouldSetPage?: boolean; // New boolean prop
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const query = searchParams.get("query") || "";
    const [searchTerm, setSearchTerm] = useState(query);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (shouldSetPage) {
            params.set("page", "1");
        }

        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }

        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleClearSearch = () => {
        setSearchTerm("");
        handleSearch("");
    };

    useEffect(() => {
        setSearchTerm(query);
    }, [query]);

    return (
        <div className="relative flex flex-1 flex-shrink-0">
            <label htmlFor="search" className="sr-only">
                Search
            </label>
            <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 pr-10 text-base outline-2 placeholder:text-gray-500"
                placeholder={placeholder}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                }}
                value={searchTerm}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />

            {searchTerm && (
                <button
                    type="button"
                    className="absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 hover:text-gray-900 focus:outline-none"
                    onClick={handleClearSearch}
                >
                    <XMarkIcon className="h-full w-full" />
                </button>
            )}
        </div>
    );
}
