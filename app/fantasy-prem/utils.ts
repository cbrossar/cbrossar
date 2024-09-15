import { FantasyPlayer, FantasyPosition } from "../lib/definitions";

export function maximizeFantasyTeam(
    players: FantasyPlayer[],
    positions: FantasyPosition[],
    budget: number,
    formation: number[],
): { team: FantasyPlayer[]; totalPoints: number; totalCost: number } {
    // Sort players by their position (element_type)
    const playersByPosition: Record<number, FantasyPlayer[]> = {};
    positions.forEach((pos) => {
        playersByPosition[pos.id] = players
            .filter((p) => p.element_type === pos.id)
            .sort((a, b) => b.total_points - a.total_points) // Sort by total points, descending
            .slice(0, 10); // Limit to top 10 players per position
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

    console.log(goalieCombinations.length);
    console.log(defenderCombinations.length);
    console.log(midfielderCombinations.length);
    console.log(forwardCombinations.length);

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
                        (acc, player) => acc + player.now_cost,
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