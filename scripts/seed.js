const { db } = require("@vercel/postgres");

async function seedMusicReviews(client) {
    try {
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        // Create the "music_reviews" table if it doesn't exist
        const createMusicReviewsTable = await client.sql`
            CREATE TABLE IF NOT EXISTS music_reviews (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            album VARCHAR(255) NOT NULL,
            artist VARCHAR(255) NOT NULL,
            rating FLOAT NOT NULL,
            review TEXT NOT NULL,
            name VARCHAR(255) NOT NULL,
            image_url VARCHAR(255) NOT NULL,
            created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        console.log(`Created "music_reviews" table`);

        return {
            createMusicReviewsTable,
        };
    } catch (error) {
        console.error("Error seeding music reviews:", error);
        throw error;
    }
}

async function seedSoccerStats(client) {
    try {
        // create team table with id, name, image_filename, and created timestamp
        const createTeamsTable = await client.sql`
            CREATE TABLE IF NOT EXISTS teams (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                image_filename VARCHAR(255),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // create Match table with id, home_team_id fk, away_team_id fk, home_score, away_score, date, and created timestamp
        const createMatchesTable = await client.sql`
            CREATE TABLE IF NOT EXISTS matches (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                home_team_id UUID NOT NULL,
                away_team_id UUID NOT NULL,
                home_score INT NOT NULL,
                away_score INT NOT NULL,
                date DATE NOT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (home_team_id) REFERENCES teams(id),
                FOREIGN KEY (away_team_id) REFERENCES teams(id)
            );
        `;

        // create MatchUpdate table with id, optional match id success boolean, and created timestamp
        const createMatchUpdatesTable = await client.sql`       
            CREATE TABLE IF NOT EXISTS match_updates (  
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                match_id UUID,
                success BOOLEAN NOT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (match_id) REFERENCES matches(id)
            );
        `;
        console.log(`Created "teams", "matches", and "match_updates" tables`);

        // create teams for werder beermen, brooklyn hove albion, and all premier league teams such as tottenham, arsenal, chelsea, etc.
        const createTeams = await client.sql`
            INSERT INTO teams (name, image_filename) VALUES ('Werder Beermen', 'werder-beermen.png');
            INSERT INTO teams (name, image_filename) VALUES ('Brooklyn Hove Albion', 'brooklyn-hove-albion.png');
            INSERT INTO teams (name, image_filename) VALUES ('Tottenham', 'tottenham.png');
            INSERT INTO teams (name, image_filename) VALUES ('Arsenal', 'arsenal.png');
            INSERT INTO teams (name, image_filename) VALUES ('Chelsea', 'chelsea.png');
            INSERT INTO teams (name, image_filename) VALUES ('Manchester United', 'manchester-united.png');
            INSERT INTO teams (name, image_filename) VALUES ('Manchester City', 'manchester-city.png');
            INSERT INTO teams (name, image_filename) VALUES ('Liverpool', 'liverpool.png');
            INSERT INTO teams (name, image_filename) VALUES ('Leicester City', 'leicester-city.png');
            INSERT INTO teams (name, image_filename) VALUES ('West Ham United', 'west-ham-united.png');
            INSERT INTO teams (name, image_filename) VALUES ('Everton', 'everton.png');
            INSERT INTO teams (name, image_filename) VALUES ('Aston Villa', 'aston-villa.png');
            INSERT INTO teams (name, image_filename) VALUES ('Leeds United', 'leeds-united.png');
            INSERT INTO teams (name, image_filename) VALUES ('Wolverhampton', 'wolverhampton.png');
            INSERT INTO teams (name, image_filename) VALUES ('Crystal Palace', 'crystal-palace.png');
            INSERT INTO teams (name, image_filename) VALUES ('Southampton', 'southampton.png');
            INSERT INTO teams (name, image_filename) VALUES ('Burnley', 'burnley.png');
            INSERT INTO teams (name, image_filename) VALUES ('Brighton', 'brighton.png');
            INSERT INTO teams (name, image_filename) VALUES ('Fulham', 'fulham.png');
            INSERT INTO teams (name, image_filename) VALUES ('Newcastle United', 'newcastle-united.png');
            INSERT INTO teams (name, image_filename) VALUES ('Sheffield United', 'sheffield-united.png');
            INSERT INTO teams (name, image_filename) VALUES ('Brentford', 'brentford.png');
            INSERT INTO teams (name, image_filename) VALUES ('Nottingham Forest', 'nottingham-forest.png');
            INSERT INTO teams (name, image_filename) VALUES ('Ipswich Town', 'ipswich-town.png');
        `;

        console.log(`Inserted teams into "teams" table`);

        // insert into matches the last 5 tottenham games
        const createMatches = await client.sql`
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Sheffield United'),
                (SELECT id FROM teams WHERE name = 'Tottenham'),
                0, 3, '2024-5-19'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Tottenham'),
                (SELECT id FROM teams WHERE name = 'Manchester City'),
                2, 0, '2024-5-14'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Tottenham'),
                (SELECT id FROM teams WHERE name = 'Burnley'),
                2, 1, '2024-5-11'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Liverpool'),
                (SELECT id FROM teams WHERE name = 'Tottenham'),
                4, 2, '2024-5-5'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Chelsea'),
                (SELECT id FROM teams WHERE name = 'Tottenham'),
                2, 0, '2024-5-2'
            );
        `;

        return {
            createTeamsTable,
            createMatchesTable,
            createMatchUpdatesTable,
            createTeams,
            createMatches,
        };
    } catch (error) {
        console.error("Error seeding soccer stats:", error);
        throw error;
    }
}

async function main() {
    const client = await db.connect();

    await seedMusicReviews(client);
    await seedSoccerStats(client);

    await client.end();
}

main().catch((err) => {
    console.error(
        "An error occurred while attempting to seed the database:",
        err,
    );
});
