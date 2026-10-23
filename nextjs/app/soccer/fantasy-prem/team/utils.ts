import { FantasyPlayer } from "@/app/lib/definitions";

type FantasyTeamResult = {
    team: FantasyPlayer[];
    totalPoints: number;
    totalCost: number;
};

// Finds the highest-scoring lineup that fits the budget, with exactly
// formation[i] players from position i + 1 (ties go to the cheaper lineup).
// Costs are whole numbers (tenths of £1m), so instead of trying every
// combination this solves it exactly as a knapsack over total cost.
export function maximizeFantasyTeam(
    playersByPosition: Record<number, FantasyPlayer[]>,
    budget: number,
    formation: number[],
    isNowCost: boolean,
    pointsColumn: string,
): FantasyTeamResult {
    const noTeam = { team: [], totalPoints: 0, totalCost: 0 };
    const maxCost = Math.floor(budget);
    if (
        !(maxCost >= 0) ||
        formation.length !== 4 ||
        formation.some((count) => !Number.isInteger(count) || count < 0)
    ) {
        return noTeam;
    }

    const getCost = (player: FantasyPlayer) =>
        isNowCost
            ? player.now_cost
            : player.now_cost - player.cost_change_start;
    const getPoints = (player: FantasyPlayer) =>
        pointsColumn === "current"
            ? player.event_points
            : pointsColumn === "last5"
              ? player.last_5_points
              : player.total_points;

    const positions = formation.map((count, i) =>
        bestByCost(
            playersByPosition[i + 1] ?? [],
            count,
            maxCost,
            getCost,
            getPoints,
        ),
    );

    // Add positions one at a time: combined[c] is the most points from the
    // positions so far at a total cost of exactly c.
    let combined = positions[0].points;
    const splits: Int32Array[] = [];
    for (let i = 1; i < positions.length; i++) {
        const next = new Float64Array(maxCost + 1).fill(-Infinity);
        const split = new Int32Array(maxCost + 1);
        const position = positions[i].points;
        for (let a = 0; a <= maxCost; a++) {
            if (combined[a] === -Infinity) continue;
            for (let b = 0; a + b <= maxCost; b++) {
                const total = combined[a] + position[b];
                if (total > next[a + b]) {
                    next[a + b] = total;
                    split[a + b] = b;
                }
            }
        }
        combined = next;
        splits.push(split);
    }

    let bestCost = -1;
    for (let c = 0; c <= maxCost; c++) {
        if (
            combined[c] !== -Infinity &&
            (bestCost === -1 || combined[c] > combined[bestCost])
        ) {
            bestCost = c;
        }
    }
    if (bestCost === -1) {
        return noTeam;
    }

    const team: FantasyPlayer[] = [];
    let cost = bestCost;
    for (let i = positions.length - 1; i > 0; i--) {
        const positionCost = splits[i - 1][cost];
        team.push(...positions[i].pick(positionCost));
        cost -= positionCost;
    }
    team.push(...positions[0].pick(cost));
    team.sort(
        (a, b) =>
            a.element_type - b.element_type || getPoints(b) - getPoints(a),
    );

    return { team, totalPoints: combined[bestCost], totalCost: bestCost };
}

// For one position: points[c] is the most points from exactly `count` players
// costing exactly c in total (-Infinity if impossible), and pick(c) returns
// those players.
function bestByCost(
    players: FantasyPlayer[],
    count: number,
    maxCost: number,
    getCost: (player: FantasyPlayer) => number,
    getPoints: (player: FantasyPlayer) => number,
) {
    const affordable = players.filter(
        (player) => getCost(player) >= 0 && getCost(player) <= maxCost,
    );
    // A player is never needed if `count` others are at least as good and no
    // more expensive (ties broken by id), so drop them up front.
    const beats = (a: FantasyPlayer, b: FantasyPlayer) =>
        getCost(a) <= getCost(b) &&
        getPoints(a) >= getPoints(b) &&
        (getCost(a) < getCost(b) || getPoints(a) > getPoints(b) || a.id < b.id);
    const candidates = affordable.filter(
        (player) =>
            affordable.filter(
                (other) => other !== player && beats(other, player),
            ).length < count,
    );

    const width = maxCost + 1;
    const best = new Float64Array((count + 1) * width).fill(-Infinity);
    best[0] = 0;
    // took[i][n][c]: whether candidate i improved the best n-player lineup at cost c.
    const took = new Uint8Array(candidates.length * (count + 1) * width);
    candidates.forEach((player, i) => {
        const cost = getCost(player);
        const points = getPoints(player);
        for (let n = Math.min(count, i + 1); n >= 1; n--) {
            for (let c = maxCost; c >= cost; c--) {
                const total = best[(n - 1) * width + c - cost] + points;
                if (total > best[n * width + c]) {
                    best[n * width + c] = total;
                    took[(i * (count + 1) + n) * width + c] = 1;
                }
            }
        }
    });

    const pick = (totalCost: number) => {
        const picked: FantasyPlayer[] = [];
        let n = count;
        let c = totalCost;
        for (let i = candidates.length - 1; i >= 0 && n > 0; i--) {
            if (took[(i * (count + 1) + n) * width + c]) {
                picked.push(candidates[i]);
                c -= getCost(candidates[i]);
                n--;
            }
        }
        return picked;
    };

    return { points: best.subarray(count * width), pick };
}
