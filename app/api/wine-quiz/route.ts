import { createWineQuiz, fetchWineById } from "@/app/data/wine";
import { sendEmail } from "@/app/api/send-email/utils";

export async function POST(req: Request) {
    const wineQuiz = await req.json();
    try {
        const result = await createWineQuiz(wineQuiz);
        const wine = await fetchWineById(wineQuiz.wine_id);
        await sendEmail(
            process.env.EMAIL_USER as string,
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
