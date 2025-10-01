import { createWineQuiz, fetchWineById } from "@/app/data/wine";
import { sendEmail } from "@/app/api/send-email/utils";

export async function POST(req: Request) {
    // Retrieve the client IP address
    const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";

    const wineQuiz = await req.json();
    try {
        const result = await createWineQuiz(wineQuiz, clientIp);
        const wine = await fetchWineById(wineQuiz.wine_id);
        await sendEmail(
            "cole.brossart@gmail.com",
            "New Wine Quiz",
            `Wine: ${wine.winery_name}, ${wine.name}\nScore: ${wineQuiz.score}`,
        );
        return Response.json(result);
    } catch (error) {
        console.error("Error creating wine quiz:", error);
        return Response.json(
            { error: "Failed to create wine quiz" },
            { status: 500 },
        );
    }
}
