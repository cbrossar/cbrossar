import { SpotifyRelease } from "@/app/lib/definitions";
import { getDaysAgo } from "@/app/lib/utils";
import Image from "next/image";
import Link from "next/link";
import ReleaseTypeSelect from "./ReleaseTypeSelect";

interface LatestReleasesProps {
    releases: SpotifyRelease[];
    className?: string;
    gridClassName?: string;
}

export default function LatestReleases({ releases, className = "", gridClassName = "" }: LatestReleasesProps) {
    return (
        <div className={`w-full lg:w-2/3 lg:pr-6 order-2 lg:order-1 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Latest Releases
                </h2>
                <ReleaseTypeSelect />
            </div>
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${gridClassName}`}>
                {releases.slice(0, 15).map((release) => (
                    <Link
                        key={release.id}
                        href={release.spotify_url}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                        <div className="relative">
                            <Image
                                src={release.image_url}
                                alt={`${release.name} by ${release.artist_name}`}
                                width={200}
                                height={200}
                                className="w-full aspect-square object-cover rounded-lg"
                            />
                        </div>
                        <div className="mt-3">
                            <h3 className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">
                                {release.name}
                            </h3>
                            <p className="text-gray-600 text-xs mb-2">
                                {release.artist_name}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-xs">
                                    {getDaysAgo(release.release_date)}
                                </span>
                                <div className="flex gap-1">
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                        {release.album_type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
