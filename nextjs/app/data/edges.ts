import { EdgeOutcome, EdgeScan } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchLatestEdgeScan() {
    noStore();

    try {
        const data = await sql<EdgeScan>`
            SELECT * FROM edge_scans ORDER BY created DESC LIMIT 1
        `;
        return data.rows[0] ?? null;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch latest edge scan.");
    }
}

export async function fetchEdgeOutcomes(scanId: string) {
    noStore();

    try {
        const data = await sql<EdgeOutcome>`
            SELECT * FROM edge_outcomes
            WHERE scan_id = ${scanId}
            ORDER BY is_live DESC, commence_time, game, team
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch edge outcomes.");
    }
}

export async function fetchEdgeCreditsRemaining() {
    noStore();

    try {
        const data = await sql<{ credits_remaining: number }>`
            SELECT credits_remaining FROM edge_scans
            WHERE credits_remaining IS NOT NULL
            ORDER BY created DESC LIMIT 1
        `;
        return data.rows[0]?.credits_remaining ?? null;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch edge scan credits.");
    }
}
