const { db } = require("@vercel/postgres");

async function seedMusicReviews(client) {
    try {
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        // Create the "music_reviews" table if it doesn't exist
        const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS music_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    album VARCHAR(255) NOT NULL,
    date DATE NOT NULL
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
