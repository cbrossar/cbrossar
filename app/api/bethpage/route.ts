export const maxDuration = 60;

import puppeteerCore from "puppeteer-core";
import puppeteer, { Page } from "puppeteer";
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

        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        );

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
        await page.waitForSelector("#login_email");

        // Enter login credentials
        await page.type("#login_email", process.env.BETHPAGE_EMAIL as string); // Replace with your email
        await page.type(
            "#login_password",
            process.env.BETHPAGE_PASSWORD as string,
        ); // Replace with your password

        await page.click(".modal-content .btn.btn-primary.login");

        await page.waitForSelector("#date-menu");

        // Define the dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const weekAhead = new Date(today);
        weekAhead.setDate(today.getDate() + 7);

        const formattedTomorrow = `${(tomorrow.getMonth() + 1).toString().padStart(2, "0")}-${tomorrow.getDate().toString().padStart(2, "0")}-${tomorrow.getFullYear()}`;
        const formattedWeekAhead = `${(weekAhead.getMonth() + 1).toString().padStart(2, "0")}-${weekAhead.getDate().toString().padStart(2, "0")}-${weekAhead.getFullYear()}`;

        const responseDict: Record<string, any> = {};

        const courses = [
            { name: "Bethpage Black", value: "2431" },
            { name: "Bethpage Blue", value: "2433" },
        ];

        for (const course of courses) {
            // Switch to the desired course
            await page.select("#schedule_select", course.value);

            // Extract booking times for tomorrow
            await extractBookingInfo(
                page,
                formattedTomorrow,
                course,
                responseDict,
            );

            // Extract booking times for a week ahead
            await extractBookingInfo(
                page,
                formattedWeekAhead,
                course,
                responseDict,
            );
        }

        await browser.close();

        // Send back the extracted data as a response
        return new Response(JSON.stringify(responseDict), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response("Failed to crawl the webpage.", { status: 500 });
    }
}

// Define the Course type
type Course = {
    name: string;
    value: string;
};

interface BookingInfo {
    time: string;
    holes: number;
    players: number;
}

// Define the ResponseDict type
type ResponseDict = {
    [key: string]: {
        [date: string]: BookingInfo[];
    };
};

// Helper function to extract booking times, holes, and players
async function extractBookingInfo(
    page: any,
    date: string,
    course: Course,
    responseDict: ResponseDict,
): Promise<void> {
    await page.select("#date-menu", date);
    await page.waitForSelector(".loading-wrapper.loading", {
        hidden: true,
    });

    const bookingInfoList: BookingInfo[] = await page.$$eval(
        ".time-summary",
        (elements: Element[]) =>
            elements.map((element) => {
                const timeElement = element.querySelector(
                    ".booking-start-time-label",
                ) as HTMLElement;
                const holesElement = element.querySelector(
                    ".booking-slot-holes span",
                ) as HTMLElement;
                const playersElement = element.querySelector(
                    ".booking-slot-players span",
                ) as HTMLElement;

                return {
                    time: timeElement.innerText.trim(),
                    holes: parseInt(holesElement.innerText),
                    players: parseInt(playersElement.innerText),
                };
            }),
    );

    responseDict[course.name] = responseDict[course.name] || {};
    responseDict[course.name][date] = bookingInfoList;
}
