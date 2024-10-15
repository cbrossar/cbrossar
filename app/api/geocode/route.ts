export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: Request) {

    const API_KEY = process.env.GEOCODING_API_KEY;
    const url = "https://maps.googleapis.com/maps/api/geocode/json?address=Douro&components=country:PT&key=" + API_KEY;
    const response = await fetch(url);
    const data = await response.json();
    return Response.json(data);
}
