export const dynamic = "force-dynamic"; // static by default, unless reading the request

import { fetchWineById, fetchRegions } from "@/app/data/wine";

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get("id");
    if (!id) {
        return Response.json({ error: "No id provided" }, { status: 400 });
    }
    const wine = await fetchWineById(id);
    const regions = await fetchRegions();
    return Response.json({ wine, regions });
}
