import { sendEmail } from "./utils";

export async function POST(request: Request) {
    const { email, subject, text } = await request.json();

    return await sendEmail(email, subject, text);
}
