import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import { createMatch, createTeam, createMatchUpdate } from "@/app/lib/data";

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
        const browser = await puppeteer.launch({ headless: true });
        return browser;
    }
}

export default async function updateGarnetMatches() {
    try {
        const browser = await getBrowser();
        const page = await browser.newPage();

        // Set user agent
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        );

        const summer2024url =
            "https://metrosoccerny.leagueapps.com/leagues/4299649/teams/6931712";
        // Navigate to the URL and wait for the page to load
        await page.goto(summer2024url, { waitUntil: "networkidle2" });

        // Wait for the iframe to load
        await page.waitForSelector("iframe#monolith-iframe");

        // Get the iframe element
        const iframeElement: any = await page.$("iframe#monolith-iframe");

        // Switch context to the iframe
        const iframe = await iframeElement.contentFrame();

        // Wait for the schedule-game elements to appear inside the iframe
        await iframe.waitForSelector(".schedule-game");

        // Scrape the matches inside the iframe
        const matches = await iframe.$$eval(
            ".schedule-game",
            (elements: any) => {
                return elements
                    .map((element: any) => {
                        const matchDate =
                            element
                                .querySelector(".sched-start-date .date")
                                ?.textContent?.trim() || "";
                        const matchTime =
                            element
                                .querySelector(".sched-start-date .time")
                                ?.textContent?.trim() || "";

                        const dateParts = matchDate.split(", ")[1];
                        const fullDateStr = `${dateParts} ${new Date().getFullYear()} ${matchTime}`; // Add current year
                        const fullDate = new Date(fullDateStr).toISOString();

                        const opposingTeamName =
                            element
                                .querySelector("h3.event-team a:first-child")
                                ?.textContent?.trim() || "";
                        const vsText =
                            element
                                .querySelector("h3.event-team")
                                ?.textContent?.trim() || "";
                        const isHome = vsText?.includes("(H)");
                        const homeTeamName = isHome
                            ? "Garnet United"
                            : opposingTeamName;
                        const awayTeamName = isHome
                            ? opposingTeamName
                            : "Garnet United";

                        // Substring to remove W/L from the score
                        let scoreText: string =
                            element
                                .querySelector(".team-result")
                                ?.textContent?.trim() || "";

                        // if starts with W or L, remove it
                        if (
                            scoreText.startsWith("W") ||
                            scoreText.startsWith("L")
                        ) {
                            scoreText = scoreText.substring(1);
                        }

                        if (scoreText) {
                            const [homeScore, awayScore] = scoreText
                                .split("-")
                                .map((score: string) =>
                                    parseInt(score.trim(), 10),
                                );

                            return {
                                fullDate,
                                homeTeamName,
                                awayTeamName,
                                homeScore,
                                awayScore,
                                scoreText,
                            };
                        }

                        // Return null if no score is found
                        return null;
                    })
                    .filter((match: any) => match !== null); // Filter out matches without a score
            },
        );

        // Iterate over the matches and create them
        for (const match of matches) {
            if (match.homeTeamName && match.awayTeamName) {
                await createTeam(match.homeTeamName);
                await createTeam(match.awayTeamName);
                await createMatch(
                    match.homeTeamName,
                    match.awayTeamName,
                    match.homeScore,
                    match.awayScore,
                    match.fullDate,
                );
            }
        }

        // Update the match process status to true if successful
        await createMatchUpdate(true);

        // Close the browser
        await browser.close();
    } catch (error) {
        // If an error occurs, log it and mark update as failed
        await createMatchUpdate(false);
        console.error("Failed to fetch garnet matches", error);
    }
}
