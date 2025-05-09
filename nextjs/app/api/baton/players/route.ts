export const maxDuration = 60;
export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: Request) {

    const BATON_URL = process.env.BATON_URL

    const response = await fetch(`${BATON_URL}/players`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json()

    return new Response(JSON.stringify(data))
}
