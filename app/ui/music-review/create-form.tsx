'use client';

import { createMusicReview } from '@/app/lib/actions';
import { useFormState } from 'react-dom';

export default function Form() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createMusicReview, initialState);
  console.log(state);
  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        
        {/* Album name */}
        <div className="mb-4">
            <label htmlFor="album" className="mb-2 block text-sm font-medium">
                Album Name
            </label>
            <input
                id="album"
                name="album"
                type="text"
                placeholder="Enter album name"
                className="block w-full rounded-md border border-gray-200 py-2 text-sm"
                aria-describedby="album-error"
            />
            <div id="album-error" aria-live="polite" aria-atomic="true">
                {state.errors?.album &&
                state.errors.album.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                    </p>
                ))}
            </div>
        </div>


        <div id="error-message" aria-live="polite" aria-atomic="true">
              {state.message && (
                <p className="mt-2 text-sm text-red-500">{state.message}</p>
              )}
            </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="submit">Create Music Review</button>
      </div>
    </form>
  );
}
