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
                name VARCHAR(255) NOT NULL,
                image_filename VARCHAR(255),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // create Match table with id, home_team_id fk, away_team_id fk, home_team_goals, away_team_goals, date, and created timestamp
        const createMatchesTable = await client.sql`
            CREATE TABLE IF NOT EXISTS matches (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                home_team_id UUID NOT NULL,
                away_team_id UUID NOT NULL,
                home_team_goals INT NOT NULL,
                away_team_goals INT NOT NULL,
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

        return {
            createTeamsTable,
            createMatchesTable,
            createMatchUpdatesTable,
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
