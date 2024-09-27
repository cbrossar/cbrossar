import { sql } from "@vercel/postgres";
import {
    MusicReview,
    Match,
    Team,
    FantasyPlayer,
    FantasyPosition,
} from "./definitions";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchMusicReviews() {
    // Add noStore() here to prevent the response from being cached.
    // This is equivalent to in fetch(..., {cache: 'no-store'}).
    noStore();

    try {
        const data =
            await sql<MusicReview>`SELECT * FROM music_reviews ORDER BY created DESC`;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch music reviews data.");
    }
}

export async function fetchMusicReviewById(id: string) {
    noStore();

    try {
        const data =
            await sql<MusicReview>`SELECT * FROM music_reviews WHERE id = ${id}`;
        return data.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch music review data.");
    }
}

export async function fetchTeams() {
    noStore();

    try {
        const data = await sql<Team>`SELECT * FROM teams`;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch teams data.");
    }
}

export async function fetchSpursMatches(count: number) {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id = (SELECT id FROM teams WHERE name = 'Tottenham Hotspur FC')
            OR away_team_id = (SELECT id FROM teams WHERE name = 'Tottenham Hotspur FC')
            ORDER BY date DESC limit ${count}
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch Spurs matches data.");
    }
}

export async function fetchMyMatches(count: number) {
    noStore();

    try {
        const data = await sql<Match>`
            SELECT * FROM matches
            WHERE home_team_id in (SELECT id FROM teams WHERE name = 'Werder Beermen' OR name = 'Brooklyn Hove Albion') 
            OR away_team_id in (SELECT id FROM teams WHERE name = 'Werder Beermen'  OR name = 'Brooklyn Hove Albion')
            ORDER BY date DESC limit ${count}
        `;
        return data.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch my matches data.");
    }
}

export async function createMatch(
    homeTeamName: string,
    awayTeamName: string,
    homeScore: number,
    awayScore: number,
    date: string,
) {
    console.log("Attempt to create match.");
    try {
        const existingMatch = await sql`
            SELECT id FROM matches
            WHERE home_team_id = (SELECT id FROM teams WHERE name = ${homeTeamName})
            AND away_team_id = (SELECT id FROM teams WHERE name = ${awayTeamName})
            AND home_score = ${homeScore}
            AND away_score = ${awayScore}
            AND date = ${date}
        `;

        console.log("Existing match:", existingMatch);

        if (existingMatch.rows.length === 0) {
            await sql`
                INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date)
                VALUES (
                    (SELECT id FROM teams WHERE name = ${homeTeamName}),
                    (SELECT id FROM teams WHERE name = ${awayTeamName}),
                    ${homeScore},
                    ${awayScore},
                    ${date}
                )
            `;
        }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create match.");
    }
}

export async function createTeam(name: string) {
    try {
        await sql`
            INSERT INTO teams (name)
            VALUES (${name})
            ON CONFLICT (name) DO NOTHING
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create team.");
    }
}

export async function createMatchUpdate(success: boolean) {
    try {
        await sql`
            INSERT INTO match_updates (success)
            VALUES (${success})
        `;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create match update.");
    }
}

export async function fetchBethpage() {
    try {
        const response = await fetch("/api/bethpage");
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error("Failed to fetch booking data");
    }
}

export async function fetchLTrainTimes() {
    try {
        const response = await fetch("/api/ltrain");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch L train times data");
    }
}

export async function createDoomsdayAttempt(
    correct: boolean,
    time_taken_ms: number,
) {
    try {
        // Get the most recent attempt
        const mostRecentAttempt = await sql`
            SELECT * FROM doomsday_attempt ORDER BY created DESC LIMIT 1
        `;

        let streak = 1;

        if (mostRecentAttempt.rows.length > 0 && correct) {
            const lastAttempt = mostRecentAttempt.rows[0];
            streak = lastAttempt.streak + 1;
        } else if (!correct) {
            streak = 0;
        }

        await sql`
            INSERT INTO doomsday_attempt (correct, time_taken_ms, streak)
            VALUES (${correct}, ${time_taken_ms}, ${streak})
        `;

        return {
            correct,
            time_taken_ms,
            streak,
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create doomsday attempt.");
    }
}

export async function fetchDoomsdayStats() {
    try {
        const currentStreak = await sql`
            SELECT streak FROM doomsday_attempt ORDER BY created DESC LIMIT 1
        `;

        const highestStreak = await sql`
            SELECT MAX(streak) as highest_streak FROM doomsday_attempt
        `;

        const fastestTime = await sql`
            SELECT MIN(time_taken_ms) as fastest_time FROM doomsday_attempt WHERE correct = true
        `;

        const totalAttempts = await sql`
            SELECT COUNT(*) as total_attempts FROM doomsday_attempt
        `;

        const totalCorrect = await sql`
            SELECT COUNT(*) as total_correct FROM doomsday_attempt WHERE correct = true
        `;

        const under10s = await sql`
            SELECT COUNT(*) as under_10s FROM doomsday_attempt WHERE time_taken_ms < 10000
        `;

        return {
            currentStreak: Number(currentStreak.rows[0].streak),
            highestStreak: Number(highestStreak.rows[0].highest_streak),
            fastestTime: Number(fastestTime.rows[0].fastest_time),
            totalAttempts: Number(totalAttempts.rows[0].total_attempts),
            totalCorrect: Number(totalCorrect.rows[0].total_correct),
            under10s: Number(under10s.rows[0].under_10s),
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch doomsday highest streak.");
    }
}

export async function upsertFantasyPlayer(player: FantasyPlayer) {
    try {
        await sql`
            INSERT INTO fantasy_players (id, first_name, second_name, element_type, cost_change_start, now_cost, total_points, event_points, minutes, goals_scored, assists, clean_sheets, expected_goals, expected_assists, transfers_in, transfers_in_event, fdr_5, transfer_index)
            VALUES (${player.id}, ${player.first_name}, ${player.second_name}, ${player.element_type}, ${player.cost_change_start}, ${player.now_cost}, ${player.total_points}, ${player.event_points}, ${player.minutes}, ${player.goals_scored}, ${player.assists}, ${player.clean_sheets}, ${player.expected_goals}, ${player.expected_assists}, ${player.transfers_in}, ${player.transfers_in_event}, ${player.fdr_5}, ${player.transfer_index})
            ON CONFLICT (id) DO UPDATE SET
                first_name = ${player.first_name},
                second_name = ${player.second_name},
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

const ITEMS_PER_PAGE = 10;

export async function fetchPlayersCount(query: string) {
    try {
        noStore();
        const count = await sql`
            SELECT COUNT(*) FROM fantasy_players
            WHERE
                first_name ILIKE ${`%${query}%`} OR
                second_name ILIKE ${`%${query}%`}
        `;
        const totalPages = Math.ceil(
            Number(count.rows[0].count) / ITEMS_PER_PAGE,
        );
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch top transfers in.");
    }
}

export async function fetchFantasyPlayersFiltered(
    query: string,
    currentPage: number,
    sortBy: string,
    sortOrder: string,
) {
    try {
        noStore();
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;

        const response = await sql.query(`
            SELECT * FROM fantasy_players 
            WHERE
                first_name ILIKE '%${query}%' OR
                second_name ILIKE '%${query}%'
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `);

        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch top transfers in.");
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

