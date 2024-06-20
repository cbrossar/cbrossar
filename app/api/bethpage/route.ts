export const maxDuration = 60;

import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";

export const dynamic = "force-dynamic";

async function getBrowser() {
    if (process.env.VERCEL_ENV === "prod") {
        const executablePath = await chromium.executablePath();

        const browser = await puppeteerCore.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: chromium.headless,
        });
        return browser;
    } else {
        const browser = await puppeteer.launch();
        return browser;
    }
}
export async function GET(request: Request) {
    try {
        const bethpage_url =
            "https://foreupsoftware.com/index.php/booking/19765/2431#/teetimes";

        // const browser = await puppeteer.launch({ headless: true });
        const browser = await getBrowser();

        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        );

        // Navigate to the login page
        await page.goto(bethpage_url); // Replace with actual login URL

        // Click the "Resident" button
        await page.waitForSelector(
            ".booking-classes .btn-primary:nth-of-type(1)",
        );
        await page.click(".booking-classes .btn-primary:nth-of-type(1)");

        // Wait for the login button to be available and then click it
        await page.waitForSelector(".btn.btn-lg.btn-primary.login");
        await page.click(".btn.btn-lg.btn-primary.login");

        // Wait for the login form to appear
        await page.waitForSelector("#login_email"); // Wait for the email field to be available

        // Enter login credentials
        await page.type("#login_email", process.env.BETHPAGE_EMAIL as string); // Replace with your email
        await page.type(
            "#login_password",
            process.env.BETHPAGE_PASSWORD as string,
        ); // Replace with your password
        await page.click(".modal-content .btn.btn-primary.login");

        await page.waitForSelector("#schedule_select");

        // Select the desired option (Bethpage Blue Course)
        await page.select("#schedule_select", "2433");

        await page.waitForSelector(".time-tile .time-summary");

        // Extract the text content of all booking labels with class .booking-start-time-label
        // @ts-ignore
        const bookingTimes = await page.$$eval(
            ".booking-start-time-label",
            (elements: Element[]) =>
                elements.map((element) => (element as HTMLElement).innerText),
        );

        await browser.close();

        // Send back the extracted data as a response
        return new Response(JSON.stringify(bookingTimes), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response("Failed to crawl the webpage.", { status: 500 });
    }
}
