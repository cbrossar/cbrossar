const { db } = require("@vercel/postgres");

async function seedMusicReviews(client) {
    try {
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        // Create the "music_reviews" table if it doesn't exist
        const createTable = await client.sql`
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
            createTable,
        };
    } catch (error) {
        console.error("Error seeding music reviews:", error);
        throw error;
    }
}

async function main() {
    const client = await db.connect();

    await seedMusicReviews(client);

    await client.end();
}

main().catch((err) => {
    console.error(
        "An error occurred while attempting to seed the database:",
        err,
    );
});
