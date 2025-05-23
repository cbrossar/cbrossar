import { FantasyPlayer } from "@/app/lib/definitions";

export function maximizeFantasyTeam(
    playersByPosition: Record<number, FantasyPlayer[]>,
    budget: number,
    formation: number[],
    isNowCost: boolean,
    pointsColumn: string,
): { team: FantasyPlayer[]; totalPoints: number; totalCost: number } {
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
                            acc +
                            (isNowCost
                                ? player.now_cost
                                : player.now_cost - player.cost_change_start),
                        0,
                    );
                    if (totalCost <= budget) {
                        const totalPoints = team.reduce(
                            (acc, player) =>
                                acc +
                                (pointsColumn === "current"
                                    ? player.event_points
                                    : pointsColumn === "last5"
                                      ? player.last_5_points
                                      : player.total_points),
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

    teamCombinations.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
        }
        return a.totalCost - b.totalCost;
    });
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
