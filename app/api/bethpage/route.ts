import puppeteer from "puppeteer";

export async function GET(request: Request) {
    try {
        const bethpage_url =
            "https://foreupsoftware.com/index.php/booking/19765/2431#/teetimes";

        const browser = await puppeteer.launch({ headless: false }); // Set headless: true for production
        const page = await browser.newPage();

        // Navigate to the login page
        await page.goto(bethpage_url); // Replace with actual login URL

        // Click the "Resident" button
        await page.click(".booking-classes .btn-primary:nth-of-type(1)");

        // Wait for the login button to be available and then click it
        await page.waitForSelector(".btn.btn-lg.btn-primary.login");
        await page.click(".btn.btn-lg.btn-primary.login");

        // Wait for the login form to appear
        await page.waitForSelector("#login_email"); // Wait for the email field to be available

        // Enter login credentials
        await page.type("#login_email", process.env.BETHPAGE_EMAIL); // Replace with your email
        await page.type("#login_password", process.env.BETHPAGE_PASSWORD); // Replace with your password
        await page.click(".modal-content .btn.btn-primary.login");

        await page.waitForSelector("#schedule_select");

        // Select the desired option (Bethpage Blue Course)
        await page.select("#schedule_select", "2433");

        await page.waitForSelector(".time-tile .time-summary");

        // Extract the text content of all booking labels with class .booking-start-time-label
        const bookingLabels = await page.$$eval(
            ".booking-start-time-label",
            (elements) => elements.map((element) => element.textContent.trim()),
        );

        await browser.close();

        // Send back the extracted data as a response
        return new Response(JSON.stringify(bookingLabels), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response("Failed to crawl the webpage.", { status: 500 });
    }
}
