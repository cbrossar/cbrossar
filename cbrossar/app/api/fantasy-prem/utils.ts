import { upsertFantasyPosition, upsertFantasyTeam } from "@/app/data/fantasy";
import {
    FantasyPlayer,
    FantasyPosition,
    FantasyTeam,
} from "@/app/lib/definitions";

export function normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

export function calculateTransferIndex(player: FantasyPlayer, stats: any) {
    const minMaxValues = {
        points: { min: 0, max: stats.maxStats.points_max },
        cost: { min: 0, max: stats.maxStats.cost_max },
        goals: { min: 0, max: stats.maxStats.goals_max },
        assists: { min: 0, max: stats.maxStats.assists_max },
        clean: { min: 0, max: stats.maxStats.clean_max },
        xG: { min: 0, max: stats.maxStats.xg_max },
        xA: { min: 0, max: stats.maxStats.xa_max },
        mins: { min: 0, max: stats.maxStats.mins_max },
        fdr_5: { min: 0, max: stats.maxStats.fdr_5_max },
    };

    // Set position-specific weights
    let weights;
    switch (player.element_type) {
        case 1: // Goalkeepers
            weights = {
                points: 0.4,
                cost: 0.2,
                clean: 0.15,
                mins: 0.1,
                fdr_5: 0.15,
                xG: 0.0,
                xA: 0.0,
                goals: 0.0,
                assists: 0.0,
            };
            break;
        case 2: // Defenders
            weights = {
                points: 0.4,
                cost: 0.2,
                clean: 0.1,
                goals: 0.025,
                assists: 0.025,
                xG: 0.025,
                xA: 0.025,
                mins: 0.1,
                fdr_5: 0.1,
            };
            break;
        case 3: // Midfielders
            weights = {
                points: 0.3,
                cost: 0.2,
                goals: 0.1,
                assists: 0.1,
                xG: 0.075,
                xA: 0.075,
                mins: 0.05,
                fdr_5: 0.1,
                clean: 0.0,
            };
            break;
        case 4: // Forwards
            weights = {
                points: 0.3,
                cost: 0.2,
                goals: 0.1,
                assists: 0.1,
                xG: 0.075,
                xA: 0.075,
                mins: 0.05,
                fdr_5: 0.1,
                clean: 0.0,
            };
            break;
        default:
            weights = {
                points: 0.3,
                cost: 0.2,
                goals: 0.1,
                assists: 0.1,
                xG: 0.075,
                xA: 0.075,
                mins: 0.05,
                fdr_5: 0.1,
                clean: 0.0,
            };
    }

    // Normalize each stat
    const normPoints = normalize(
        player.total_points,
        minMaxValues.points.min,
        minMaxValues.points.max,
    );
    const normCost = normalize(
        minMaxValues.cost.max - player.now_cost,
        minMaxValues.cost.min,
        minMaxValues.cost.max,
    );

    // Ensure minimum value of 1 for xG and xA to avoid over-inflation
    const adjustedXG = Math.max(player.expected_goals, 1);
    const adjustedXA = Math.max(player.expected_assists, 1);

    // Calculate goal ratio and assist ratio
    const normGoalRatio = Math.min(player.goals_scored / adjustedXG, 2);
    const normAssistRatio = Math.min(player.assists / adjustedXA, 2);

    // Normalize goal ratio and assist ratio
    const normGoals = normalize(
        player.goals_scored,
        minMaxValues.goals.min,
        minMaxValues.goals.max,
    );
    const normAssists = normalize(
        player.assists,
        minMaxValues.assists.min,
        minMaxValues.assists.max,
    );

    const normClean = normalize(
        player.clean_sheets,
        minMaxValues.clean.min,
        minMaxValues.clean.max,
    );
    // const normXG = normalize(
    //     adjustedXG,
    //     minMaxValues.xG.min,
    //     minMaxValues.xG.max,
    // );
    // const normXA = normalize(
    //     adjustedXA,
    //     minMaxValues.xA.min,
    //     minMaxValues.xA.max,
    // );
    const normMins = normalize(
        player.minutes,
        minMaxValues.mins.min,
        minMaxValues.mins.max,
    );
    const normfdr_5 = normalize(
        minMaxValues.fdr_5.max - stats.fdr_5,
        minMaxValues.fdr_5.min,
        minMaxValues.fdr_5.max,
    );

    // Calculate transfer index
    const transferIndex =
        weights.points * normPoints +
        weights.cost * normCost +
        weights.goals * normGoals +
        weights.assists * normAssists +
        weights.clean * normClean +
        weights.xG * normGoalRatio +
        weights.xA * normAssistRatio +
        weights.mins * normMins +
        weights.fdr_5 * normfdr_5;

    return transferIndex;
}

export function upsertFantasyPositions(positions: any) {

    // Use in fantasy prem route:
    // let positions = data.element_types;
    // upsertFantasyPositions(positions);

    positions.forEach(async function (element: any) {
        let position: FantasyPosition = {
            id: element.id,
            singular_name: element.singular_name,
            squad_min_play: element.squad_min_play,
            squad_max_play: element.squad_max_play,
        };

        upsertFantasyPosition(position);
    });
}

export function upsertFantasyTeams(teams: any) {
    teams.forEach(async function (element: any) {
        let team: FantasyTeam = {
            id: element.id,
            name: element.name,
        };

        upsertFantasyTeam(team);
    });
}
