export const maxDuration = 60;
export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function POST(request: Request) {
    const BATON_URL = process.env.BATON_URL;

    try {
        const response = await fetch(`${BATON_URL}/edge-scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: response.status });
    } catch (error) {
        console.error("Error running edge scan:", error);
        return new Response(JSON.stringify({ error: "Edge scan failed" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
