import {
    FantasyPlayer,
    FantasyPosition,
    FantasyTeam,
} from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";

export async function upsertFantasyPlayer(player: FantasyPlayer) {
    try {
        await sql`
            INSERT INTO fantasy_players (id, first_name, second_name, team, element_type, cost_change_start, now_cost, total_points, event_points, minutes, goals_scored, assists, clean_sheets, expected_goals, expected_assists, transfers_in, transfers_in_event, fdr_5, transfer_index)
            VALUES (${player.id}, ${player.first_name}, ${player.second_name}, ${player.team}, ${player.element_type}, ${player.cost_change_start}, ${player.now_cost}, ${player.total_points}, ${player.event_points}, ${player.minutes}, ${player.goals_scored}, ${player.assists}, ${player.clean_sheets}, ${player.expected_goals}, ${player.expected_assists}, ${player.transfers_in}, ${player.transfers_in_event}, ${player.fdr_5}, ${player.transfer_index})
            ON CONFLICT (id) DO UPDATE SET
                first_name = ${player.first_name},
                second_name = ${player.second_name},
                team = ${player.team},
                element_type = ${player.element_type},
                cost_change_start = ${player.cost_change_start},
                now_cost = ${player.now_cost},
                total_points = ${player.total_points},
                event_points = ${player.event_points},
                minutes = ${player.minutes},
                goals_scored = ${player.goals_scored},
                assists = ${player.assists},
                clean_sheets = ${player.clean_sheets},
                expected_goals = ${player.expected_goals},
                expected_assists = ${player.expected_assists},
                transfers_in = ${player.transfers_in},
                transfers_in_event = ${player.transfers_in_event},
                fdr_5 = ${player.fdr_5},
                transfer_index = ${player.transfer_index}
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to upsert fantasy player.");
    }
}

export async function fetchFantasyMaxStats() {
    try {
        const response = await sql`
            SELECT
                MAX(total_points) as points_max,
                MAX(now_cost) as cost_max,
                MAX(goals_scored) as goals_max,
                MAX(assists) as assists_max,
                MAX(clean_sheets) as clean_max,
                MAX(expected_goals) as xG_max,
                MAX(expected_assists) as xA_max,
                MAX(minutes) as mins_max,
                MAX(fdr_5) as fdr_5_max
            FROM fantasy_players
        `;
        return response.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch fantasy max stats.");
    }
}
export async function upsertFantasyPosition(position: FantasyPosition) {
    try {
        await sql`
            INSERT INTO fantasy_positions (id, singular_name, squad_min_play, squad_max_play)
            VALUES (${position.id}, ${position.singular_name}, ${position.squad_min_play}, ${position.squad_max_play})
            ON CONFLICT (id) DO UPDATE SET
                singular_name = ${position.singular_name},
                squad_min_play = ${position.squad_min_play},
                squad_max_play = ${position.squad_max_play}
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to upsert fantasy position.");
    }
}

export async function upsertFantasyTeam(team: FantasyTeam) {
    try {
        await sql`
            INSERT INTO fantasy_teams (id, name)
            VALUES (${team.id}, ${team.name})
            ON CONFLICT (id) DO UPDATE SET
                name = ${team.name}
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to upsert fantasy team.");
    }
}

export async function fetchFantasyPlayers() {
    noStore();
    try {
        const response = await sql`
            SELECT * FROM fantasy_players
        `;
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch fantasy players.");
    }
}

export async function fetchFantasyPositions() {
    try {
        const response = await sql`
            SELECT * FROM fantasy_positions
        `;
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch fantasy positions.");
    }
}

export async function fetchFantasyTeams() {
    try {
        const response = await sql`
            SELECT * FROM fantasy_teams
            ORDER BY name
        `;
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch fantasy teams.");
    }
}

export async function fetchPlayersByPositionAll(
    numGoalies: number,
    numDefenders: number,
    numMidfielders: number,
    numForwards: number,
) {
    noStore();
    try {
        const goalkeepers = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 1 ORDER BY total_points DESC LIMIT ${numGoalies}
        `;

        const defenders = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 2 ORDER BY total_points DESC LIMIT ${numDefenders}
        `;

        const midfielders = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 3 ORDER BY total_points DESC LIMIT ${numMidfielders}
        `;

        const forwards = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 4 ORDER BY total_points DESC LIMIT ${numForwards}
        `;

        return {
            1: goalkeepers.rows as FantasyPlayer[],
            2: defenders.rows as FantasyPlayer[],
            3: midfielders.rows as FantasyPlayer[],
            4: forwards.rows as FantasyPlayer[],
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch players by position.");
    }
}

export async function fetchPlayersByPositionCurrent(
    numGoalies: number,
    numDefenders: number,
    numMidfielders: number,
    numForwards: number,
) {
    noStore();
    try {
        const goalkeepers = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 1 ORDER BY event_points DESC LIMIT ${numGoalies}
        `;

        const defenders = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 2 ORDER BY event_points DESC LIMIT ${numDefenders}
        `;

        const midfielders = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 3 ORDER BY event_points DESC LIMIT ${numMidfielders}
        `;

        const forwards = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 4 ORDER BY event_points DESC LIMIT ${numForwards}
        `;

        return {
            1: goalkeepers.rows as FantasyPlayer[],
            2: defenders.rows as FantasyPlayer[],
            3: midfielders.rows as FantasyPlayer[],
            4: forwards.rows as FantasyPlayer[],
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch players by position.");
    }
}

export async function fetchPlayersByPositionLast5(
    numGoalies: number,
    numDefenders: number,
    numMidfielders: number,
    numForwards: number,
) {
    noStore();
    try {
        const goalkeepers = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 1 ORDER BY last_5_points DESC LIMIT ${numGoalies}
        `;

        const defenders = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 2 ORDER BY last_5_points DESC LIMIT ${numDefenders}
        `;

        const midfielders = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 3 ORDER BY last_5_points DESC LIMIT ${numMidfielders}
        `;

        const forwards = await sql`
            SELECT * FROM fantasy_players WHERE element_type = 4 ORDER BY last_5_points DESC LIMIT ${numForwards}
        `;

        return {
            1: goalkeepers.rows as FantasyPlayer[],
            2: defenders.rows as FantasyPlayer[],
            3: midfielders.rows as FantasyPlayer[],
            4: forwards.rows as FantasyPlayer[],
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch players by position.");
    }
}

export const ITEMS_PER_PAGE = 10;

export async function fetchPlayersCount(
    query: string,
    currentTeamId: string,
    currentPosId: string,
) {
    try {
        noStore();

        // Initialize arrays for dynamic query construction
        let whereClauses = [];
        let queryParams: (string | number)[] = [];
        let paramIndex = 1;

        // Add search conditions for player names
        if (query) {
            whereClauses.push(
                `(first_name ILIKE $${paramIndex} OR second_name ILIKE $${paramIndex})`,
            );
            queryParams.push(`%${query}%`);
            paramIndex++;
        }

        // Add filter condition for team ID
        if (currentTeamId) {
            whereClauses.push(`team = $${paramIndex}`);
            queryParams.push(Number(currentTeamId));
            paramIndex++;
        }

        // Add filter condition for position ID
        if (currentPosId) {
            whereClauses.push(`element_type = $${paramIndex}`);
            queryParams.push(Number(currentPosId));
            paramIndex++;
        }

        // Construct the WHERE clause
        let whereClause = "";
        if (whereClauses.length > 0) {
            whereClause = `WHERE ${whereClauses.join(" AND ")}`;
        }

        // Final SQL query
        const sqlQuery = `
            SELECT COUNT(*) FROM fantasy_players
            ${whereClause}
        `;

        // Execute the query with parameterized values
        const result = await sql.query(sqlQuery, queryParams);

        const totalCount = Number(result.rows[0].count);
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch player count.");
    }
}

export async function fetchFantasyPlayersFiltered(
    query: string,
    currentPage: number,
    sortBy: string,
    sortOrder: string,
    currentTeamId: string,
    currentPosId: string,
) {
    try {
        noStore();
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;

        // Initialize arrays for dynamic query construction
        let whereClauses = [];
        let queryParams: (string | number)[] = [];
        let paramIndex = 1;

        // Add search conditions for player names
        if (query) {
            whereClauses.push(
                `(first_name ILIKE $${paramIndex} OR second_name ILIKE $${paramIndex})`,
            );
            queryParams.push(`%${query}%`);
            paramIndex++;
        }

        // Add filter condition for team ID
        if (currentTeamId) {
            whereClauses.push(`team = $${paramIndex}`);
            queryParams.push(Number(currentTeamId));
            paramIndex++;
        }

        // Add filter condition for position ID
        if (currentPosId) {
            whereClauses.push(`element_type = $${paramIndex}`);
            queryParams.push(Number(currentPosId));
            paramIndex++;
        }

        // Construct the WHERE clause
        let whereClause = "";
        if (whereClauses.length > 0) {
            whereClause = `WHERE ${whereClauses.join(" AND ")}`;
        }

        // Sanitize sortBy and sortOrder to prevent SQL injection
        const allowedSortColumns = [
            "second_name",
            "now_cost",
            "total_points",
            "minutes",
            "goals_scored",
            "assists",
            "clean_sheets",
            "expected_goals",
            "expected_assists",
            "fdr_5",
            "transfers_in_event",
            "transfer_index",
        ];
        const allowedSortOrders = ["ASC", "DESC"];

        if (!allowedSortColumns.includes(sortBy)) {
            throw new Error("Invalid sortBy column");
        }

        if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
            throw new Error("Invalid sortOrder");
        }

        // Construct the ORDER BY clause
        const orderByClause = `${sortBy} ${sortOrder.toUpperCase()}, transfer_index ${sortOrder.toUpperCase()}`;

        // Final SQL query
        const sqlQuery = `
            SELECT * FROM fantasy_players
            ${whereClause}
            ORDER BY ${orderByClause}
            LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;

        // Execute the query with parameterized values
        const response = await sql.query(sqlQuery, queryParams);

        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch fantasy players.");
    }
}

export async function updateFantasyPlayerData(
    id: number,
    fdr_5: number,
    transferIndex: number,
) {
    try {
        await sql`
            UPDATE fantasy_players
            SET fdr_5 = ${fdr_5}, transfer_index = ${transferIndex}
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to update player data.");
    }
}

export async function fetchFantasyPremLatestUpdatedTime() {
    try {
        const response = await sql`
            SELECT updated FROM fantasy_prem_updates ORDER BY updated DESC LIMIT 1
        `;
        return response.rows[0].updated;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch latest fantasy prem update.");
    }
}