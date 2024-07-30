export const dynamic = "force-dynamic"; // static by default, unless reading the request
import * as protobuf from "protobufjs";

const MTA_API_URL =
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l";

export async function GET(request: Request) {
    try {
        const response = await fetch(MTA_API_URL);

        const buffer = await response.arrayBuffer();

        // Update next.config.js outputFileTracingIncludes to include proto file
        const root = await protobuf.load("app/api/ltrain/gtfs-realtime.proto");
        const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

        const message = FeedMessage.decode(new Uint8Array(buffer));
        const object = FeedMessage.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
        });

        const trainStopIds = ["L03N", "L03S", "L06N", "L06S", "L08N", "L08S"];

        const trainTimes: { [key: string]: string[] } = {};
        for (const stopId of trainStopIds) {
            trainTimes[stopId] = [];
        }

        object.entity.forEach((entity: any) => {
            if (entity.tripUpdate) {
                entity.tripUpdate.stopTimeUpdate.forEach(
                    (stopTimeUpdate: any) => {
                        if (trainStopIds.includes(stopTimeUpdate.stopId) && stopTimeUpdate.departure) {

                            const departureTime = new Date(
                                stopTimeUpdate.departure.time * 1000,
                            );
                            const formattedDateTime =
                                departureTime.toLocaleString("en-US", {
                                    timeZone: "America/New_York",
                                });
                            trainTimes[stopTimeUpdate.stopId].push(
                                formattedDateTime,
                            );
                        }
                    },
                );
            }
        });

        return new Response(JSON.stringify(trainTimes));
    } catch (error) {
        console.error("Failed to fetch MTA feed:", error);
        return new Response("Failed");
    }
}
