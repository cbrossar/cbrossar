'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

 
const FormSchema = z.object({
  id: z.string(),
  album: z.string({
    invalid_type_error: 'Please enter an album name.',
  }),
  date: z.string(),
});
 
const CreateMusicReview = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    album?: string[];
  };
  message?: string | null;
};

export async function createMusicReview(prevState: State, formData: FormData) {
    const validatedFields = CreateMusicReview.safeParse({
      album: formData.get('album'),
    });
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Music Review.',
      };
    }
    // Prepare data for insertion into the database
    const { album } = validatedFields.data;
    const date = new Date().toISOString().split('T')[0];
    try {
      await sql`
        INSERT INTO MusicReviews (album, date)
        VALUES (${album}, ${date})
      `;
    }
    catch (error) {
      return {
        message: 'Database Error: Failed to Create Music Review.',
      };
    }
    revalidatePath('/music');
    redirect('/music');
  }