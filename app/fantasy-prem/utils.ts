import { FantasyPlayer, FantasyPosition } from "../lib/definitions";

export function maximizeFantasyTeam(
    players: FantasyPlayer[],
    positions: FantasyPosition[],
    budget: number,
    formation: number[],
): { team: FantasyPlayer[]; totalPoints: number; totalCost: number } {

    // TODO: Can optimize by limmiting by position (fewer goalies, more mids)
    // Also can query for this stuff directly 

    // Sort players by their position (element_type)
    const playersByPosition: Record<number, FantasyPlayer[]> = {};
    positions.forEach((pos) => {
        playersByPosition[pos.id] = players
            .filter((p) => p.element_type === pos.id)
            .sort((a, b) => b.total_points - a.total_points) // Sort by total points, descending
            .slice(0, 8); // Limit to top 8 players per position
    });

    // Define the specific formation

    const goalies = playersByPosition[1];
    const defenders = playersByPosition[2];
    const midfielders = playersByPosition[3];
    const forwards = playersByPosition[4];

    const goalieCombinations = getCombinations(goalies, formation[0]);
    const defenderCombinations = getCombinations(defenders, formation[1]);
    const midfielderCombinations = getCombinations(midfielders, formation[2]);
    const forwardCombinations = getCombinations(forwards, formation[3]);

    const teamCombinations = [];
    for (const goalies of goalieCombinations) {
        for (const defenders of defenderCombinations) {
            for (const midfielders of midfielderCombinations) {
                for (const forwards of forwardCombinations) {
                    const team = [
                        ...goalies,
                        ...defenders,
                        ...midfielders,
                        ...forwards,
                    ];
                    const totalCost = team.reduce(
                        (acc, player) =>
                            acc + player.now_cost - player.cost_change_start,
                        0,
                    );
                    if (totalCost <= budget) {
                        const totalPoints = team.reduce(
                            (acc, player) => acc + player.total_points,
                            0,
                        );
                        teamCombinations.push({ team, totalPoints, totalCost });
                    }
                }
            }
        }
    }

    if (teamCombinations.length == 0) {
        return { team: [], totalPoints: 0, totalCost: 0 };
    }

    teamCombinations.sort((a, b) => b.totalPoints - a.totalPoints);
    return teamCombinations[0];
}

function getCombinations<T>(arr: T[], count: number): T[][] {
    const result: T[][] = [];

    function combine(start: number, current: T[]): void {
        if (current.length === count) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            combine(i + 1, current);
            current.pop();
        }
    }

    combine(0, []);
    return result;
}
