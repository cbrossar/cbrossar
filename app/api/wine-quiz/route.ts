import { createWineQuiz } from "@/app/data/wine";

export async function POST(req: Request) {
    const wineQuiz = await req.json();
    try {
        const result = await createWineQuiz(wineQuiz);
        return Response.json(result);
    } catch (error) {
        console.error("Error creating wine quiz:", error);
        return Response.json(
            { error: "Failed to create wine quiz" },
            { status: 500 },
        );
    }
}
