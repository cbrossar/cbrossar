import {
    fetchSpotifyReleases,
    fetchMusicbrainzReleases,
} from "@/app/data/music";
import LatestReleases from "./LatestReleases";
import UpcomingReleases from "./UpcomingReleases";

interface PageProps {
    searchParams: { type?: string };
}

export default async function Page({ searchParams }: PageProps) {
    const spotifyReleases = await fetchSpotifyReleases();
    const musicbrainzReleases = await fetchMusicbrainzReleases();

    if (!spotifyReleases || !musicbrainzReleases) {
        return <div className="text-gray-900">Failed to load releases</div>;
    }

    // Filter releases based on search params
    const filteredReleases = searchParams.type
        ? spotifyReleases.filter(
              (release) =>
                  release.album_type?.toLowerCase() ===
                  searchParams.type!.toLowerCase(),
          )
        : spotifyReleases;

    return (
        <div className="min-h-screen bg-white p-2">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    <LatestReleases 
                        releases={filteredReleases} 
                        className={musicbrainzReleases.length === 0 ? "lg:w-full lg:pr-0" : ""}
                        gridClassName={musicbrainzReleases.length === 0 ? "lg:grid-cols-4" : ""}
                    />
                    {musicbrainzReleases.length > 0 && (
                        <UpcomingReleases releases={musicbrainzReleases} />
                    )}
                </div>
            </div>
        </div>
    );
}
