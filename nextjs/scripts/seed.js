const { db } = require("@vercel/postgres");

async function main() {
    const client = await db.connect();

    // await seedMusicReviews(client);
    // await seedDoomsdayAttempts(client);
    // await seedSoccerStats(client);
    // await seedWine(client);
    await seedFantasyPremierLeagueStats(client);
    // await seedRedditSpurs(client);
    await client.end();
}

main().catch((err) => {
    console.error(
        "An error occurred while attempting to seed the database:",
        err,
    );
});

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
        const createEplTeams = await client.sql`
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

        const createMyTeams = await client.sql`
            INSERT INTO teams (name, image_filename) VALUES ('Werder Beermen', 'werder-beermen.png');
            INSERT INTO teams (name, image_filename) VALUES ('Brooklyn Hove Albion', 'brooklyn-hove-albion.png');
            INSERT INTO teams (name) VALUES ('Brooklyn Blinders');
            INSERT INTO teams (name) VALUES ('Pint men');
            INSERT INTO teams (name) VALUES ('West Brooklyn Albion F.C.');
            INSERT INTO teams (name) VALUES ('Brooklyn Hungarians');
            INSERT INTO teams (name) VALUES ('FC Ginga');
        `;

        console.log(`Inserted teams into "teams" table`);

        // insert into matches the last 5 tottenham games
        const createSpursMatches = await client.sql`
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Sheffield United'),
                (SELECT id FROM teams WHERE name = 'Tottenham'),
                0, 3, '2024-5-19'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Tottenham'),
                (SELECT id FROM teams WHERE name = 'Manchester City'),
                0, 2, '2024-5-14'
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

        const createMyMatches = await client.sql`   
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Brooklyn Blinders'),
                (SELECT id FROM teams WHERE name = 'Werder Beermen'),
                4, 5, '2024-5-16'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Werder Beermen'),
                (SELECT id FROM teams WHERE name = 'Pint men'),
                6, 1, '2024-5-9'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'West Brooklyn Albion F.C.'),
                (SELECT id FROM teams WHERE name = 'Werder Beermen'),
                1, 4, '2024-5-2'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'Werder Beermen'),
                (SELECT id FROM teams WHERE name = 'Brooklyn Hungarians'),
                4, 4, '2024-4-25'
            );
            INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, date) VALUES (
                (SELECT id FROM teams WHERE name = 'FC Ginga'),
                (SELECT id FROM teams WHERE name = 'Brooklyn Hove Albion'),
                3, 2, '2024-5-19'
            );
        `;

        return {
            createTeamsTable,
            createMatchesTable,
            createMatchUpdatesTable,
            createEplTeams,
            createMyTeams,
            createSpursMatches,
            createMyMatches,
        };
    } catch (error) {
        console.error("Error seeding soccer stats:", error);
        throw error;
    }
}

async function seedDoomsdayAttempts(client) {
    try {
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        // Create the "doomsday_attempt" table if it doesn't exist
        const createDoomsdayTable = await client.sql`
            CREATE TABLE IF NOT EXISTS doomsday_attempt (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            correct BOOLEAN NOT NULL,
            time_taken_ms FLOAT NOT NULL,
            streak INT NOT NULL,
            created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        console.log(`Created "doomsday_attempt" table`);

        return {
            createDoomsdayTable,
        };
    } catch (error) {
        console.error("Error seeding doomsday attempts:", error);
        throw error;
    }
}

async function seedFantasyPremierLeagueStats(client) {
    try {
        // Create the "fantasy_positions" table if it doesn't exist
        const createFantasyPositionsTable = await client.sql`
            CREATE TABLE IF NOT EXISTS fantasy_positions (
            id INT PRIMARY KEY,
            singular_name VARCHAR(255) NOT NULL,
            squad_min_play INT NOT NULL,
            squad_max_play INT NOT NULL
        );
        `;
        console.log(`Created "fantasy_positions" table`);

        // Create the "fantasy_teams" table if it doesn't exist
        const createFantasyTeamsTable = await client.sql`
            CREATE TABLE IF NOT EXISTS fantasy_teams (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            fpl_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            image_filename VARCHAR(255)
        );
        `;

        console.log(`Created "fantasy_teams" table`);

        // Create the "fantasy_players" table if it doesn't exist
        const createFantasyPlayersTable = await client.sql`
            CREATE TABLE IF NOT EXISTS fantasy_players (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            fpl_id INT NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            second_name VARCHAR(255) NOT NULL,
            team INT NOT NULL,
            element_type INT NOT NULL,
            cost_change_start FLOAT NOT NULL,
            now_cost FLOAT NOT NULL,
            total_points INT NOT NULL,
            event_points INT NOT NULL,
            last_5_points INT NOT NULL,
            minutes INT NOT NULL,
            goals_scored INT NOT NULL,
            assists INT NOT NULL,
            clean_sheets INT NOT NULL,
            expected_goals FLOAT NOT NULL,
            expected_assists FLOAT NOT NULL,
            transfers_in INT NOT NULL,
            transfers_in_event INT NOT NULL,
            fdr_5 INT,
            transfer_index FLOAT,
            FOREIGN KEY (element_type) REFERENCES fantasy_positions(id),
            FOREIGN KEY (team) REFERENCES fantasy_teams(id)
        );
        `;
        console.log(`Created "fantasy_players" table`);

        // Create the "fantasy_seasons" table if it doesn't exist
        const createFantasySeasonsTable = await client.sql`
            CREATE TABLE IF NOT EXISTS fantasy_seasons (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL
        );
        `;
        console.log(`Created "fantasy_seasons" table`);

        // Create the "fantasy_gameweeks" table if it doesn't exist
        const createFantasyPlayerGameweeksTable = await client.sql`
            CREATE TABLE IF NOT EXISTS fantasy_player_gameweeks (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            player_id INT NOT NULL,
            season_id UUID NOT NULL,
            round INT NOT NULL,
            fixture INT NOT NULL,
            opponent_team INT NOT NULL,
            total_points INT NOT NULL,
            minutes INT NOT NULL,
            goals_scored INT NOT NULL,
            assists INT NOT NULL,
            clean_sheets INT NOT NULL,
            bonus INT NOT NULL,
            expected_goals FLOAT NOT NULL,
            expected_assists FLOAT NOT NULL,
            transfers_in INT NOT NULL,
            transfers_out INT NOT NULL,
            FOREIGN KEY (player_id) REFERENCES fantasy_players(id),
            FOREIGN KEY (season_id) REFERENCES fantasy_seasons(id),
            UNIQUE (player_id, season_id, round, fixture, opponent_team)
        );
        `;
        console.log(`Created "fantasy_player_gameweeks" table`);

        // Create the "fantasy_prem_updates" table if it doesn't exist
        const createFantasyPremUpdatesTable = await client.sql`
            CREATE TABLE IF NOT EXISTS fantasy_prem_updates (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        console.log(`Created "fantasy_prem_updates" table`);

        // Create the "fantasy_prem_fixtures" table if it doesn't exist
        const createFantasyPremFixturesTable = await client.sql`
            CREATE TABLE IF NOT EXISTS fantasy_prem_fixtures (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                event INT,
                finished BOOLEAN,
                finished_provisional BOOLEAN,
                fpl_id INT,
                kickoff_time TIMESTAMPTZ,
                minutes INT,
                provisional_start_time BOOLEAN,
                started BOOLEAN,
                team_a_difficulty INT,
                team_a_id UUID,
                team_a_score INT,
                team_h_difficulty INT,
                team_h_id UUID,
                team_h_score INT,
                season_id UUID,
                FOREIGN KEY (team_a_id) REFERENCES fantasy_teams(id),
                FOREIGN KEY (team_h_id) REFERENCES fantasy_teams(id),
                FOREIGN KEY (season_id) REFERENCES fantasy_seasons(id),
                UNIQUE (fpl_id, season_id)
            );
        `;
        console.log(`Created "fantasy_prem_fixtures" table`);

        return {
            createFantasyPositionsTable,
            createFantasyTeamsTable,
            createFantasyPlayersTable,
            createFantasySeasonsTable,
            createFantasyPlayerGameweeksTable,
            createFantasyPremUpdatesTable,
            createFantasyPremFixturesTable,
        };
    } catch (error) {
        console.error("Error seeding fantasy premier league stats:", error);
        throw error;
    }
}

async function seedWine(client) {
    try {
        const createGrapesTable = await client.sql`
            CREATE TABLE IF NOT EXISTS vivino_grapes (
                id INT NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `;

        console.log(`Created "grapes" table`);

        const createCountriesTable = await client.sql`
            CREATE TABLE IF NOT EXISTS vivino_countries (
                code VARCHAR(4) NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                wines_count INT NOT NULL,
                wineries_count INT NOT NULL,
                grape1_id INT,
                grape2_id INT,
                grape3_id INT,
                FOREIGN KEY (grape1_id) REFERENCES vivino_grapes(id),
                FOREIGN KEY (grape2_id) REFERENCES vivino_grapes(id),
                FOREIGN KEY (grape3_id) REFERENCES vivino_grapes(id)
            );
        `;

        console.log(`Created "countries" table`);

        const createRegionsTable = await client.sql`
            CREATE TABLE IF NOT EXISTS vivino_regions (
                id INT NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                country_code VARCHAR(4) NOT NULL,
                latitude FLOAT,
                longitude FLOAT,
                FOREIGN KEY (country_code) REFERENCES vivino_countries(code)
            );
        `;

        console.log(`Created "regions" table`);

        const createWineriesTable = await client.sql`
            CREATE TABLE IF NOT EXISTS vivino_wineries (
                id INT NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `;

        console.log(`Created "wineries" table`);

        const createWinesTable = await client.sql`
            CREATE TABLE IF NOT EXISTS vivino_wines (
                id INT NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                region_id INT NOT NULL,
                winery_id INT NOT NULL,
                currency_code VARCHAR(4) NOT NULL,
                price FLOAT NOT NULL,
                ratings_count INT,
                ratings_average FLOAT,
                acidity FLOAT,
                intensity FLOAT,
                sweetness FLOAT,
                tannin FLOAT,
                FOREIGN KEY (region_id) REFERENCES vivino_regions(id),
                FOREIGN KEY (winery_id) REFERENCES vivino_wineries(id)
            );
        `;

        console.log(`Created "wines" table`);

        const createWineQuizTable = await client.sql`
            CREATE TABLE IF NOT EXISTS wine_quiz (
                id SERIAL PRIMARY KEY,
                ip_address VARCHAR(255) NOT NULL,
                wine_id INT NOT NULL,
                country_code VARCHAR(4),
                region_id INT,
                acidity FLOAT,
                intensity FLOAT,
                sweetness FLOAT,
                tannin FLOAT,
                cost FLOAT,
                rating FLOAT,
                country_score FLOAT,
                region_score FLOAT,
                acidity_score FLOAT,
                sweetness_score FLOAT,
                tannin_score FLOAT,
                cost_score FLOAT,
                rating_score FLOAT,
                score FLOAT,
                FOREIGN KEY (wine_id) REFERENCES vivino_wines(id)
            );
        `;

        console.log(`Created "wine_quiz" table`);

        return {
            createGrapesTable,
            createCountriesTable,
            createRegionsTable,
            createWineriesTable,
            createWinesTable,
            createWineQuizTable,
        };
    } catch (error) {
        console.error("Error seeding wine:", error);
        throw error;
    }
}

async function seedRedditSpurs(client) {
    try {
        const createRedditSpursTable = await client.sql`
            CREATE TABLE IF NOT EXISTS reddit_spurs (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                reddit_id VARCHAR(255) NOT NULL,
                title VARCHAR(512) NOT NULL,
                author VARCHAR(255) NOT NULL,
                created_date TIMESTAMP NOT NULL,
                url VARCHAR(255) NOT NULL,
                permalink VARCHAR(255) NOT NULL
            );
        `;

        console.log(`Created "reddit_spurs" table`);

        return {
            createRedditSpursTable,
        };
    } catch (error) {
        console.error("Error seeding reddit spurs:", error);
        throw error;
    }
}
