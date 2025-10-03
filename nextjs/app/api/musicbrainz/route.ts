import { NextRequest, NextResponse } from "next/server";

interface MusicBrainzReleaseGroup {
    id: string;
    title: string;
    "artist-credit": Array<{
        name: string;
        artist: {
            id: string;
            name: string;
        };
    }>;
    "primary-type"?: string;
    "secondary-types"?: string[];
    "first-release-date"?: string;
}

interface MusicBrainzResponse {
    "release-groups": MusicBrainzReleaseGroup[];
}

interface MusicBrainzArtist {
    id: string;
    name: string;
    "sort-name": string;
    country?: string;
    "begin-area"?: {
        name: string;
    };
    "life-span"?: {
        begin?: string;
        end?: string;
    };
}

interface MusicBrainzArtistResponse {
    artists: MusicBrainzArtist[];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "release"; // "release" or "artist"
    const artist = searchParams.get("artist"); // For filtering releases by artist
    const artistId = searchParams.get("artistId"); // Artist ID for more precise filtering

    if (!query && type !== "release") {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 },
        );
    }

    try {
        if (type === "artist") {
            // Search for artists
            const baseUrl = "https://musicbrainz.org/ws/2/artist";
            const params = new URLSearchParams({
                query: `artist:${query}*`,
                fmt: "json",
                limit: "10",
            });

            const response = await fetch(`${baseUrl}?${params}`, {
                headers: {
                    "User-Agent": "cbrossar/1.0 (cole.brossart@gmail.com)",
                },
            });

            if (!response.ok) {
                throw new Error(`MusicBrainz API error: ${response.status}`);
            }

            const data: MusicBrainzArtistResponse = await response.json();

            const artists = data.artists.map((artist) => ({
                id: artist.id,
                name: artist.name,
                sortName: artist["sort-name"],
                country: artist.country,
                beginArea: artist["begin-area"]?.name,
                lifeSpan: artist["life-span"],
            }));

            return NextResponse.json({ artists });
        } else {
            // Search for release groups (full albums, not singles)
            const baseUrl = "https://musicbrainz.org/ws/2/release-group";
            let searchQuery;

            // If artist is provided, filter release groups by that artist
            if (artist || artistId) {
                const artistFilter = artistId
                    ? `arid:${artistId}`
                    : `artist:${artist}`;
                if (query) {
                    searchQuery = `${artistFilter} AND releasegroup:${query}* AND primarytype:Album`;
                } else {
                    searchQuery = `${artistFilter} AND primarytype:Album`;
                }
            } else {
                searchQuery = `releasegroup:${query}* AND primarytype:Album`;
            }

            const params = new URLSearchParams({
                query: searchQuery,
                fmt: "json",
                limit: (artist || artistId) && !query ? "25" : "10", // Show more albums when browsing all from an artist
                inc: "artist-credits",
            });

            const response = await fetch(`${baseUrl}?${params}`, {
                headers: {
                    "User-Agent": "cbrossar/1.0 (cole.brossart@gmail.com)",
                },
            });

            if (!response.ok) {
                throw new Error(`MusicBrainz API error: ${response.status}`);
            }

            const data: MusicBrainzResponse = await response.json();

            // Transform the data to include both album and artist information
            const albums = data["release-groups"].map((releaseGroup) => ({
                id: releaseGroup.id,
                album: releaseGroup.title,
                artist: releaseGroup["artist-credit"]
                    .map((ac) => ac.name)
                    .join(", "),
                releaseGroupId: releaseGroup.id,
                date: releaseGroup["first-release-date"],
                primaryType: releaseGroup["primary-type"],
                secondaryTypes: releaseGroup["secondary-types"],
            }));

            return NextResponse.json({ albums });
        }
    } catch (error) {
        console.error("MusicBrainz search error:", error);
        return NextResponse.json(
            { error: "Failed to search MusicBrainz" },
            { status: 500 },
        );
    }
}
