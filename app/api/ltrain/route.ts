export const dynamic = "force-dynamic"; // static by default, unless reading the request

import * as protobuf from "protobufjs";

const MTA_API_URL =
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l";

export async function GET(request: Request) {
    try {
        const response = await fetch(MTA_API_URL);

        const buffer = await response.arrayBuffer();
        const localPrefix = process.env.VERCEL_ENV === "prod" ? process.cwd() : "public";
        const root = await protobuf.load(localPrefix + "/ltrain/gtfs-realtime.proto");
        const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

        const message = FeedMessage.decode(new Uint8Array(buffer));
        const object = FeedMessage.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
        });

        const bedfordNorthbound: string[] = [];

        object.entity.forEach((entity: any) => {
            if (entity.tripUpdate) {
                entity.tripUpdate.stopTimeUpdate.forEach(
                    (stopTimeUpdate: any) => {
                        if (stopTimeUpdate.stopId === "L08N") {
                            const departureTime = new Date(
                                stopTimeUpdate.departure.time * 1000,
                            );
                            const formattedTime =
                                departureTime.toLocaleTimeString("en-US", {
                                    timeZone: "America/New_York",
                                });
                            bedfordNorthbound.push(formattedTime);
                        }
                    },
                );
            }
        });

        const responseDict = {
            bedfordNorthbound,
        };
        return new Response(JSON.stringify(responseDict));
    } catch (error) {
        console.error("Failed to fetch MTA feed:", error);
        return new Response("Failed");
    }
}
