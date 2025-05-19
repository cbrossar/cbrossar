export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: Request) {
    const BATON_URL = process.env.BATON_URL;

    try {
        const response = await fetch(`${BATON_URL}`);

        if (!response.ok) {
            if (response.status === 429) {
                // Rate limit status code
                return new Response(
                    JSON.stringify({
                        error: "Rate limit exceeded. Please try again later.",
                    }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    },
                );
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data));
    } catch (error) {
        console.error("Error fetching from Baton:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
