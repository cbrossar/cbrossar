import nodemailer from "nodemailer";

export async function sendEmail(email: string, subject: string, text: string) {
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        service: "Gmail", // You can use any service
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password or app-specific password
        },
    });

    try {
        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
        });

        return Response.json({ message: "Email sent", info });
    } catch (error) {
        return Response.json({ message: "Error sending email", error });
    }
}
