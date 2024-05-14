"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";

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
    image_file: z.instanceof(File),
});

const CreateMusicReview = FormSchema.omit({ id: true, created: true });

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
    console.log(validatedFields);
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
    const blob = await put(image_file.name, image_file, {
        access: "public",
    });

    const created = new Date().toISOString().split("T")[0];
    try {
        await sql`
        INSERT INTO music_reviews (album, artist, rating, review, name, image_url)
        VALUES (${album}, ${artist}, ${rating}, ${review}, ${name}, ${blob.url})
      `;
    } catch (error) {
        return {
            message: "Database Error: Failed to Create Music Review.",
        };
    }
    revalidatePath("/music");
    redirect("/music");
}
