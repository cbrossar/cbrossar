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
