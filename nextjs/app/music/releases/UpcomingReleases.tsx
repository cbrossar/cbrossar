import { MusicbrainzRelease } from "@/app/lib/definitions";
import { getUpcomingDays } from "@/app/lib/utils";
import Image from "next/image";

interface UpcomingReleasesProps {
    releases: MusicbrainzRelease[];
}

export default function UpcomingReleases({ releases }: UpcomingReleasesProps) {
    return (
        <div className="w-full lg:w-1/3 order-1 lg:order-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Upcoming Next
            </h2>
            <div className="space-y-4">
                {releases.map((release) => (
                    <div
                        key={release.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex gap-3 items-start">
                            <div className="w-15 h-15 flex-shrink-0">
                                {release.image_url ? (
                                    <Image
                                        src={release.image_url}
                                        alt={`${release.title} by ${release.artist_name}`}
                                        width={60}
                                        height={60}
                                        className="w-full h-full aspect-square object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">
                                            No Image
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">
                                    {release.title}
                                </h3>
                                <p className="text-gray-600 text-xs mb-2">
                                    {release.artist_name}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs">
                                        {getUpcomingDays(release.release_date)}
                                    </span>
                                    <div className="flex items-center text-gray-500 text-xs">
                                        <span className="mr-1">
                                            {new Date(
                                                release.release_date,
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
