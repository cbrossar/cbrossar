export type MusicReview = {
    id: string;
    album: string;
    artist: string;
    rating: number;
    review: string;
    name: string;
    spotify_album_id: string;
    image_url: string;
    created: string;
};

export type Match = {
    id: string;
    home_team_id: string;
    away_team_id: string;
    home_score: number;
    away_score: number;
    date: string;
};

export type Team = {
    id: string;
    name: string;
    image_filename: string;
};

export interface BookingData {
    [courseName: string]: {
        [date: string]: {
            time: string;
            holes: number;
            players: number;
        }[];
    };
}

export interface FantasyPlayer {
    id: number;
    first_name: string;
    second_name: string;
    team: number;
    element_type: number;
    cost_change_start: number;
    now_cost: number;
    total_points: number;
    event_points: number;
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    expected_goals: number;
    expected_assists: number;
    transfers_in: number;
    transfers_in_event: number;
    fdr_5?: number;
    transfer_index?: number;
}

export interface FantasyPosition {
    id: number;
    singular_name: string;
    squad_min_play: number;
    squad_max_play: number;
}

export interface FantasyTeam {
    id: number;
    name: string;
    image_filename?: string;
}

export interface Grape {
    id: number;
    name: string;
}

export interface Country {
    code: string;
    name: string;
    wines_count: number;
    wineries_count: number;
    grape1_id: number | null;
    grape2_id: number | null;
    grape3_id: number | null;
}

export interface Region {
    id: number;
    name: string;
    country_code: string;
}

export interface Winery {
    id: number;
    name: string;
}

export interface Wine {
    id: number;
    name: string;
    region_id: number;
    winery_id: number;
    ratings_count: number | null;
    ratings_average: number | null;
    acidity: number | null;
    intensity: number | null;
    sweetness: number | null;
    region_name?: string | null;
    winery_name?: string | null;
    country_code?: string | null;
}
