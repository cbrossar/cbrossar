"use client";

import { createMusicReview } from "@/app/lib/actions";
import { useFormState } from "react-dom";
import { Button } from "@/app/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

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
    const [highlightedArtistIndex, setHighlightedArtistIndex] = useState(-1);

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
    const [highlightedAlbumIndex, setHighlightedAlbumIndex] = useState(-1);

    // Cover art state
    const [coverArtUrl, setCoverArtUrl] = useState<string | null>(null);
    const [isLoadingCoverArt, setIsLoadingCoverArt] = useState(false);
    const [useCoverArt, setUseCoverArt] = useState(false);

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

    // Fetch cover art for selected album
    const fetchCoverArt = useCallback(async (releaseId: string) => {
        setIsLoadingCoverArt(true);
        try {
            const response = await fetch(`/api/musicbrainz/cover-art?releaseGroupId=${encodeURIComponent(releaseId)}`);
            if (response.ok) {
                const data = await response.json();
                setCoverArtUrl(data.coverArtUrl);
            } else {
                setCoverArtUrl(null);
            }
        } catch (error) {
            console.error("Error fetching cover art:", error);
            setCoverArtUrl(null);
        } finally {
            setIsLoadingCoverArt(false);
        }
    }, []);

    // Client-side album filtering
    const filterAlbums = useCallback(
        (query: string) => {
            // First filter out albums with secondary types (Remix, Live, etc.)
            const mainAlbums = allArtistAlbums.filter(
                (album) =>
                    !album.secondaryTypes || album.secondaryTypes.length === 0,
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
        setHighlightedArtistIndex(-1);

        // Clear album selection when artist changes
        setSelectedAlbum(null);
        setAlbumQuery("");
        setShowAlbumDropdown(false);
        setHighlightedAlbumIndex(-1);
        setCoverArtUrl(null);
        setUseCoverArt(false);
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
        setHighlightedAlbumIndex(-1);

        // Fetch cover art if we have a release group ID
        if (album.releaseGroupId) {
            fetchCoverArt(album.releaseGroupId);
        } else {
            setCoverArtUrl(null);
        }
    };

    // Handle artist input change
    const handleArtistInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value;
        setArtistQuery(value);
        setHighlightedArtistIndex(-1);

        // Clear selection if user is typing
        if (selectedArtist && value !== selectedArtist.name) {
            setSelectedArtist(null);
            setSelectedAlbum(null);
            setAlbumQuery("");
            setShowAlbumDropdown(false);
            setCoverArtUrl(null);
            setUseCoverArt(false);
            setAllArtistAlbums([]);
            setAlbumSearchResults([]);
            const albumInput = document.getElementById("album") as HTMLInputElement;
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
        setHighlightedAlbumIndex(-1);

        // Clear selection if user is typing
        if (selectedAlbum && value !== selectedAlbum.album) {
            setSelectedAlbum(null);
            setCoverArtUrl(null);
            setUseCoverArt(false);
        }
    };

    // Simple keyboard navigation
    const handleArtistKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showArtistDropdown || artistSearchResults.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedArtistIndex(prev => 
                    prev < artistSearchResults.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedArtistIndex(prev => 
                    prev > 0 ? prev - 1 : artistSearchResults.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedArtistIndex >= 0) {
                    handleArtistSelect(artistSearchResults[highlightedArtistIndex]);
                }
                break;
            case "Escape":
                setShowArtistDropdown(false);
                setHighlightedArtistIndex(-1);
                break;
        }
    };

    const handleAlbumKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showAlbumDropdown || albumSearchResults.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedAlbumIndex(prev => 
                    prev < albumSearchResults.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedAlbumIndex(prev => 
                    prev > 0 ? prev - 1 : albumSearchResults.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedAlbumIndex >= 0) {
                    handleAlbumSelect(albumSearchResults[highlightedAlbumIndex]);
                }
                break;
            case "Escape":
                setShowAlbumDropdown(false);
                setHighlightedAlbumIndex(-1);
                break;
        }
    };

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-dropdown]')) {
                setShowArtistDropdown(false);
                setShowAlbumDropdown(false);
                setHighlightedArtistIndex(-1);
                setHighlightedAlbumIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
                    <div className="relative" data-dropdown>
                        <input
                            id="artist"
                            name="artist"
                            type="text"
                            placeholder="Search for artist..."
                            value={artistQuery}
                            onChange={handleArtistInputChange}
                            onKeyDown={handleArtistKeyDown}
                            className="block w-full rounded-md border border-gray-200 p-2 text-sm"
                            aria-describedby="artist-error"
                            autoComplete="off"
                        />
                        {isSearchingArtist && (
                            <div className="absolute right-2 top-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            </div>
                        )}
                        {showArtistDropdown && artistSearchResults.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                                {artistSearchResults.map((artist, index) => (
                                    <div
                                        key={artist.id}
                                        className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                                            index === highlightedArtistIndex ? "bg-blue-100" : ""
                                        }`}
                                        onClick={() => handleArtistSelect(artist)}
                                    >
                                        <div className="font-medium">{artist.name}</div>
                                        {artist.beginArea && (
                                            <div className="text-gray-600">{artist.beginArea}</div>
                                        )}
                                        {artist.country && (
                                            <div className="text-xs text-gray-500">{artist.country}</div>
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
                    <div className="relative" data-dropdown>
                        <input
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
                            onKeyDown={handleAlbumKeyDown}
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
                                {albumSearchResults.map((album, index) => (
                                    <div
                                        key={album.id}
                                        className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                                            index === highlightedAlbumIndex ? "bg-blue-100" : ""
                                        }`}
                                        onClick={() => handleAlbumSelect(album)}
                                    >
                                        <div className="font-medium">{album.album}</div>
                                        <div className="text-gray-600">{album.artist}</div>
                                        {album.date && (
                                            <div className="text-xs text-gray-500">{album.date}</div>
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

                {/* Cover Art */}
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">
                        Album Cover Image (Square - 1:1 Aspect Ratio)
                    </label>
                    <p className="mb-3 text-sm text-gray-600">
                        Upload an image file or use the cover art found from MusicBrainz.
                    </p>
                    
                    {/* Cover art preview */}
                    {coverArtUrl && (
                        <div className="mb-4">
                            <div className="flex items-center gap-4">
                                <Image
                                    src={coverArtUrl}
                                    alt={`${selectedAlbum?.album} cover art`}
                                    width={96}
                                    height={96}
                                    className="rounded-md object-cover border border-gray-200"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Cover art found for this album
                                    </p>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={useCoverArt}
                                            onChange={(e) => setUseCoverArt(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Use this cover art</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoadingCoverArt && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            Loading cover art...
                        </div>
                    )}

                    {/* File upload */}
                    <div className={coverArtUrl && useCoverArt ? "opacity-50" : ""}>
                        <label
                            htmlFor="image_file"
                            className="mb-2 block text-sm font-medium"
                        >
                            Upload Image File
                        </label>
                        <input
                            id="image_file"
                            name="image_file"
                            type="file"
                            accept="image/*"
                            disabled={!!(coverArtUrl && useCoverArt)}
                            className="block w-full rounded-md border border-gray-200 p-2 text-sm"
                            aria-describedby="image_file-error"
                        />
                        {coverArtUrl && useCoverArt && (
                            <p className="mt-1 text-xs text-gray-500">
                                Using cover art from MusicBrainz
                            </p>
                        )}
                    </div>

                    {/* Hidden field for cover art URL */}
                    {coverArtUrl && useCoverArt && (
                        <input
                            type="hidden"
                            name="image_url"
                            value={coverArtUrl}
                        />
                    )}
                    
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
