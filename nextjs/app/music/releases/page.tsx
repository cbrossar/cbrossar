import { fetchSpotifyReleases, fetchMusicbrainzReleases } from "@/app/data/music";
import LatestReleases from "./LatestReleases";
import UpcomingReleases from "./UpcomingReleases";

export default async function Page() {
    const spotifyReleases = await fetchSpotifyReleases();
    const musicbrainzReleases = await fetchMusicbrainzReleases();

    if (!spotifyReleases || !musicbrainzReleases) {
        return <div className="text-gray-900">Failed to load releases</div>;
    }

    return (
        <div className="min-h-screen bg-white p-2">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    <LatestReleases releases={spotifyReleases} />
                    <UpcomingReleases releases={musicbrainzReleases} />
                </div>
            </div>
        </div>
    );
}
