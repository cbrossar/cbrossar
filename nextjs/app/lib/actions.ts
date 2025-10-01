"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { searchAlbum } from "./spotify";

const FormSchema = z.object({
    id: z.string(),
    album: z.string(),
    artist: z.string(),
    rating: z.coerce
        .number()
        .min(0, { message: "Rating should be at least 0." })
        .max(10, { message: "Rating should not exceed 10." })
        .refine((value) => Number(value.toFixed(1)) === value, {
            message: "Rating should have only one decimal place.",
            path: ["rating"],
        }),
    review: z.string(),
    name: z.string(),
    spotify_album_id: z.string(),
    image_file: z.instanceof(File),
});

const CreateMusicReview = FormSchema.omit({ id: true, spotify_album_id: true });
const UpdateMusicReview = FormSchema.omit({ id: true });

export type State = {
    errors?: {
        rating?: string[];
    };
    message?: string | null;
};

export async function createMusicReview(prevState: State, formData: FormData) {
    const validatedFields = CreateMusicReview.safeParse({
        album: formData.get("album"),
        artist: formData.get("artist"),
        rating: formData.get("rating"),
        review: formData.get("review"),
        name: formData.get("name"),
        image_file: formData.get("image_file"),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Music Review.",
        };
    }

    // Prepare data for insertion into the database
    const { album, artist, rating, review, name, image_file } =
        validatedFields.data;

    // Upload the image to the Blob Storage
    if (image_file.size === 0) {
        return {
            message: "Image File Missing. Failed to Create Music Review.",
        };
    }

    const image_url = await uploadFile(image_file);

    if (!image_url) {
        return {
            message: "Image Upload Failed. Failed to Create Music Review.",
        };
    }

    // Get spotify album id
    const spotifyResults = await searchAlbum(album);
    const spotify_album_id = !!spotifyResults.length
        ? spotifyResults[0].id
        : "";

    try {
        const existingReview = await sql`
            SELECT id FROM music_reviews 
            WHERE album = ${album} 
            AND artist = ${artist} 
            AND rating = ${rating}
            AND name = ${name}
            LIMIT 1
        `;

        if (existingReview.rows.length > 0) {
            // Record with the same album, artist, and rating already exists
            throw new Error(
                "A review with this album, artist, and rating already exists.",
            );
        }

        const result = await sql`
            INSERT INTO music_reviews (album, artist, rating, review, name, spotify_album_id, image_url)
            VALUES (${album}, ${artist}, ${rating}, ${review}, ${name}, ${spotify_album_id}, ${image_url})
            RETURNING id
        `;

        const id = result.rows[0]["id"];

        // send email
        const email = "cole.brossart@gmail.com";
        const subject = "New Music Review";
        const text = `A new music review has been added by ${name}. Album: ${album}, Artist: ${artist}, Rating: ${rating}, \nLink: https://cbrossar.com/music/${id}`;

        const res = await fetch(
            process.env.NEXT_PUBLIC_BASE_URL + "/api/send-email",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, subject, text }),
            },
        );

        const emailResult = await res.json();
        console.log(emailResult);
    } catch (error) {
        return {
            message: "Database Error: Failed to Create Music Review.",
        };
    }

    revalidatePath("/music");
    redirect("/music");
}

export async function updateMusicReview(
    id: string,
    prevState: State,
    formData: FormData,
) {
    const validatedFields = UpdateMusicReview.safeParse({
        album: formData.get("album"),
        artist: formData.get("artist"),
        rating: formData.get("rating"),
        review: formData.get("review"),
        name: formData.get("name"),
        spotify_album_id: formData.get("spotify_album_id"),
        image_file: formData.get("image_file"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Update Music Review.",
        };
    }

    const {
        album,
        artist,
        rating,
        review,
        name,
        spotify_album_id,
        image_file,
    } = validatedFields.data;

    let image_url = null;

    if (image_file.size > 0) {
        image_url = await uploadFile(image_file);

        if (!image_url) {
            return {
                message: "Image Upload Failed. Failed to Update Music Review.",
            };
        }
    }

    try {
        if (image_url === null) {
            await sql`
                UPDATE music_reviews
                SET album = ${album}, artist = ${artist}, rating = ${rating}, review = ${review}, name = ${name}, spotify_album_id = ${spotify_album_id}
                WHERE id = ${id}
            `;
        } else {
            await sql`
                UPDATE music_reviews
                SET album = ${album}, artist = ${artist}, rating = ${rating}, review = ${review}, name = ${name}, spotify_album_id = ${spotify_album_id}, image_url = ${image_url}
                WHERE id = ${id}
            `;
        }
    } catch (error) {
        return {
            message: "Database Error: Failed to Update Music Review.",
        };
    }

    revalidatePath(`/music/${id}`);
    redirect(`/music/${id}`);
}

async function uploadFile(file: File) {
    const response = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + "/api/upload",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
            }),
        },
    );

    const { url, fields, key } = await response.json();

    console.log(key);

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        // @ts-ignore
        formData.append(key, value);
    });
    formData.append("file", file);

    const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
    });

    if (uploadResponse.ok) {
        const bucketName = process.env.AWS_BUCKET_NAME;
        const s3Url = `https://${bucketName}.s3.amazonaws.com/${key}`;

        console.log("Upload successful!", s3Url);
        return s3Url;
    } else {
        console.error("Upload failed!");
        return null;
    }
}
