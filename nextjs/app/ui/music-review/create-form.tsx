"use client";

import { createMusicReview } from "@/app/lib/actions";
import { useFormState } from "react-dom";
import { Button } from "@/app/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";

interface AlbumSearchResult {
    id: string;
    album: string;
    artist: string;
    releaseGroupId: string;
    date?: string;
    country?: string;
    primaryType?: string;
    secondaryTypes?: string[];
}

interface ArtistSearchResult {
    id: string;
    name: string;
    sortName: string;
    country?: string;
    beginArea?: string;
    lifeSpan?: {
        begin?: string;
        end?: string;
    };
}

export default function Form() {
    const initialState = { message: "", errors: {} };
    const [state, dispatch] = useFormState(createMusicReview, initialState);

    // State for artist search
    const [artistQuery, setArtistQuery] = useState("");
    const [artistSearchResults, setArtistSearchResults] = useState<
        ArtistSearchResult[]
    >([]);
    const [showArtistDropdown, setShowArtistDropdown] = useState(false);
    const [selectedArtist, setSelectedArtist] =
        useState<ArtistSearchResult | null>(null);
    const [isSearchingArtist, setIsSearchingArtist] = useState(false);
    const artistDropdownRef = useRef<HTMLDivElement>(null);
    const artistInputRef = useRef<HTMLInputElement>(null);

    // State for album search
    const [albumQuery, setAlbumQuery] = useState("");
    const [albumSearchResults, setAlbumSearchResults] = useState<
        AlbumSearchResult[]
    >([]);
    const [allArtistAlbums, setAllArtistAlbums] = useState<AlbumSearchResult[]>(
        [],
    );
    const [showAlbumDropdown, setShowAlbumDropdown] = useState(false);
    const [selectedAlbum, setSelectedAlbum] =
        useState<AlbumSearchResult | null>(null);
    const [isSearchingAlbum, setIsSearchingAlbum] = useState(false);
    const albumDropdownRef = useRef<HTMLDivElement>(null);
    const albumInputRef = useRef<HTMLInputElement>(null);

    // Search functions
    const searchArtists = useCallback(async (query: string) => {
        if (query.length < 2) {
            setArtistSearchResults([]);
            setShowArtistDropdown(false);
            return;
        }

        setIsSearchingArtist(true);
        try {
            const response = await fetch(
                `/api/musicbrainz?q=${encodeURIComponent(query)}&type=artist`,
            );
            if (response.ok) {
                const data = await response.json();
                setArtistSearchResults(data.artists || []);
                setShowArtistDropdown(true);
            }
        } catch (error) {
            console.error("Artist search error:", error);
            setArtistSearchResults([]);
        } finally {
            setIsSearchingArtist(false);
        }
    }, []);

    // Fetch all albums from selected artist
    const fetchAllArtistAlbums = useCallback(
        async (artist: ArtistSearchResult) => {
            setIsSearchingAlbum(true);
            try {
                const url = `/api/musicbrainz?q=&artist=${encodeURIComponent(artist.name)}&artistId=${encodeURIComponent(artist.id)}`;

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    console.log("All artist albums:", data);
                    const allAlbums = data.albums || [];
                    setAllArtistAlbums(allAlbums);

                    // Filter out albums with secondary types immediately
                    const mainAlbums = allAlbums.filter(
                        (album: AlbumSearchResult) =>
                            !album.secondaryTypes ||
                            album.secondaryTypes.length === 0,
                    );
                    setAlbumSearchResults(mainAlbums);
                    // Don't show dropdown automatically - let user click album field
                }
            } catch (error) {
                console.error("Error fetching artist albums:", error);
                setAllArtistAlbums([]);
                setAlbumSearchResults([]);
            } finally {
                setIsSearchingAlbum(false);
            }
        },
        [],
    );

    // Client-side album filtering
    const filterAlbums = useCallback(
        (query: string) => {
            // First filter out albums with secondary types (Remix, Live, etc.)
            const mainAlbums = allArtistAlbums.filter(
                (album) =>
                    !album.secondaryTypes || album.secondaryTypes.length === 0,
            );

            console.log("All albums:", allArtistAlbums.length);
            console.log("Main albums (no secondary types):", mainAlbums.length);
            console.log(
                "Albums with secondary types:",
                allArtistAlbums.filter(
                    (album) =>
                        album.secondaryTypes && album.secondaryTypes.length > 0,
                ),
            );

            if (!query.trim()) {
                // Show all main albums if no query
                setAlbumSearchResults(mainAlbums);
            } else {
                // Filter main albums by query
                const filtered = mainAlbums.filter((album) =>
                    album.album.toLowerCase().includes(query.toLowerCase()),
                );
                setAlbumSearchResults(filtered);
            }
            setShowAlbumDropdown(true);
        },
        [allArtistAlbums],
    );

    const searchAlbums = useCallback(
        (query: string) => {
            // Only search for albums if an artist is selected
            if (!selectedArtist) {
                setAlbumSearchResults([]);
                setShowAlbumDropdown(false);
                return;
            }

            // Use client-side filtering
            filterAlbums(query);
        },
        [selectedArtist, filterAlbums],
    );

    // Debounced search effects
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Only search if we have a query and either no artist selected or query doesn't match selected artist
            if (
                artistQuery &&
                (!selectedArtist || artistQuery !== selectedArtist.name)
            ) {
                searchArtists(artistQuery);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [artistQuery, searchArtists, selectedArtist]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Only search if no album selected or query doesn't match selected album
            if (!selectedAlbum || albumQuery !== selectedAlbum.album) {
                searchAlbums(albumQuery);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [albumQuery, searchAlbums, selectedAlbum]);

    // Handle artist selection
    const handleArtistSelect = (artist: ArtistSearchResult) => {
        setSelectedArtist(artist);
        setArtistQuery(artist.name);
        setShowArtistDropdown(false);

        // Clear album selection when artist changes
        setSelectedAlbum(null);
        setAlbumQuery("");
        const albumInput = document.getElementById("album") as HTMLInputElement;
        if (albumInput) {
            albumInput.value = "";
        }

        // Fetch all albums from the selected artist
        fetchAllArtistAlbums(artist);
    };

    // Handle album selection
    const handleAlbumSelect = (album: AlbumSearchResult) => {
        setSelectedAlbum(album);
        setAlbumQuery(album.album);
        setShowAlbumDropdown(false);
    };

    // Handle artist input change
    const handleArtistInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value;
        setArtistQuery(value);

        // Clear selection if user is typing
        if (selectedArtist && value !== selectedArtist.name) {
            setSelectedArtist(null);
            // Also clear album selection and cached albums
            setSelectedAlbum(null);
            setAlbumQuery("");
            setAllArtistAlbums([]);
            setAlbumSearchResults([]);
            const albumInput = document.getElementById(
                "album",
            ) as HTMLInputElement;
            if (albumInput) {
                albumInput.value = "";
            }
        }
    };

    // Handle album input change
    const handleAlbumInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Don't allow changes if no artist is selected
        if (!selectedArtist) {
            return;
        }

        const value = e.target.value;
        setAlbumQuery(value);

        // Clear selection if user is typing
        if (selectedAlbum && value !== selectedAlbum.album) {
            setSelectedAlbum(null);
        }
    };

    // Handle album input click/focus
    const handleAlbumInputClick = () => {
        if (selectedArtist && albumSearchResults.length > 0) {
            setShowAlbumDropdown(true);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                artistDropdownRef.current &&
                !artistDropdownRef.current.contains(event.target as Node)
            ) {
                setShowArtistDropdown(false);
            }
            if (
                albumDropdownRef.current &&
                !albumDropdownRef.current.contains(event.target as Node)
            ) {
                setShowAlbumDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <form action={dispatch}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {/* Artist name */}
                <div className="mb-4">
                    <label
                        htmlFor="artist"
                        className="mb-2 block text-sm font-medium"
                    >
                        Artist
                    </label>
                    <div className="relative" ref={artistDropdownRef}>
                        <input
                            ref={artistInputRef}
                            id="artist"
                            name="artist"
                            type="text"
                            placeholder="Search for artist..."
                            value={artistQuery}
                            onChange={handleArtistInputChange}
                            className="block w-full rounded-md border border-gray-200 p-2 text-sm"
                            aria-describedby="artist-error"
                            autoComplete="off"
                        />
                        {isSearchingArtist && (
                            <div className="absolute right-2 top-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            </div>
                        )}
                        {showArtistDropdown &&
                            artistSearchResults.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                                    {artistSearchResults.map((artist) => (
                                        <div
                                            key={artist.id}
                                            className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                                            onClick={() =>
                                                handleArtistSelect(artist)
                                            }
                                        >
                                            <div className="font-medium">
                                                {artist.name}
                                            </div>
                                            {artist.beginArea && (
                                                <div className="text-gray-600">
                                                    {artist.beginArea}
                                                </div>
                                            )}
                                            {artist.country && (
                                                <div className="text-xs text-gray-500">
                                                    {artist.country}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                    <div
                        id="artist-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.artist &&
                            state.errors.artist.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Album name */}
                <div className="mb-4">
                    <label
                        htmlFor="album"
                        className="mb-2 block text-sm font-medium"
                    >
                        Album
                    </label>
                    <div className="relative" ref={albumDropdownRef}>
                        <input
                            ref={albumInputRef}
                            id="album"
                            name="album"
                            type="text"
                            placeholder={
                                selectedArtist
                                    ? `Search for albums by ${selectedArtist.name}...`
                                    : "Select an artist first to search albums"
                            }
                            value={albumQuery}
                            onChange={handleAlbumInputChange}
                            onClick={handleAlbumInputClick}
                            className="block w-full rounded-md border border-gray-200 p-2 text-sm"
                            aria-describedby="album-error"
                            autoComplete="off"
                            disabled={!selectedArtist}
                        />
                        {isSearchingAlbum && (
                            <div className="absolute right-2 top-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            </div>
                        )}
                        {showAlbumDropdown && albumSearchResults.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                                {albumSearchResults.map((album) => (
                                    <div
                                        key={album.id}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                                        onClick={() => handleAlbumSelect(album)}
                                    >
                                        <div className="font-medium">
                                            {album.album}
                                        </div>
                                        <div className="text-gray-600">
                                            {album.artist}
                                        </div>
                                        {album.date && (
                                            <div className="text-xs text-gray-500">
                                                {album.date}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div id="album-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.album &&
                            state.errors.album.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Rating */}
                <div className="mb-4">
                    <label
                        htmlFor="rating"
                        className="mb-2 block text-sm font-medium"
                    >
                        Rating (0.0 - 10.0)
                    </label>
                    <input
                        id="rating"
                        name="rating"
                        type="float"
                        placeholder="Enter rating"
                        className="block w-full rounded-md border border-gray-200 p-2 text-sm"
                        aria-describedby="rating-error"
                    />
                    <div
                        id="rating-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.rating &&
                            state.errors.rating.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Review */}
                <div className="mb-4">
                    <label
                        htmlFor="review"
                        className="mb-2 block text-sm font-medium"
                    >
                        Review
                    </label>
                    <textarea
                        id="review"
                        name="review"
                        placeholder="Live with the album for at least a week. Share your thoughts!"
                        className="block w-full rounded-md border border-gray-200 p-2 text-sm"
                        aria-describedby="review-error"
                        rows={5}
                    />
                    <div
                        id="review-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.review &&
                            state.errors.review.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Your first name */}
                <div className="mb-4">
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium"
                    >
                        Your First Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your first name"
                        className="block w-full rounded-md border border-gray-200 p-2 text-sm"
                        aria-describedby="name-error"
                    />
                    <div id="name-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.name &&
                            state.errors.name.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Image file */}
                <div className="mb-4">
                    <label
                        htmlFor="image_file"
                        className="mb-2 block text-sm font-medium"
                    >
                        Image (Square - 1:1 Aspect Ratio)
                    </label>
                    <input
                        id="image_file"
                        name="image_file"
                        type="file"
                        className="block w-full rounded-md border border-gray-200 p-2 text-sm"
                        aria-describedby="image_file-error"
                    />
                    <div
                        id="image_file-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.image_file &&
                            state.errors.image_file.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                <div id="error-message" aria-live="polite" aria-atomic="true">
                    {state.message && (
                        <p className="mt-2 text-sm text-red-500">
                            {state.message}
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Button type="submit">Create Music Review</Button>
            </div>
        </form>
    );
}
