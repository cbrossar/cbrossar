"use client";

import { createMusicReview } from "@/app/lib/actions";
import { useFormState } from "react-dom";

export default function Form() {
    const initialState = { message: "", errors: {} };
    const [state, dispatch] = useFormState(createMusicReview, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {/* Album name */}
                <div className="mb-4">
                    <label
                        htmlFor="album"
                        className="mb-2 block text-sm font-medium"
                    >
                        Album
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
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Artist name */}
                <div className="mb-4">
                    <label
                        htmlFor="artist"
                        className="mb-2 block text-sm font-medium"
                    >
                        Artist
                    </label>
                    <input
                        id="artist"
                        name="artist"
                        type="text"
                        placeholder="Enter artist name"
                        className="block w-full rounded-md border border-gray-200 py-2 text-sm"
                        aria-describedby="artist-error"
                    />
                    <div
                        id="artist-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.artist &&
                            state.errors.artist.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Rating */}
                <div className="mb-4">
                    <label
                        htmlFor="rating"
                        className="mb-2 block text-sm font-medium"
                    >
                        Rating
                    </label>
                    <input
                        id="rating"
                        name="rating"
                        type="float"
                        placeholder="Enter rating"
                        className="block w-full rounded-md border border-gray-200 py-2 text-sm"
                        aria-describedby="rating-error"
                    />
                    <div
                        id="rating-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.rating &&
                            state.errors.rating.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Image file */}
                <div className="mb-4">
                    <label
                        htmlFor="image_file"
                        className="mb-2 block text-sm font-medium"
                    >
                        Image
                    </label>
                    <input
                        id="image_file"
                        name="image_file"
                        type="file"
                        className="block w-full rounded-md border border-gray-200 py-2 text-sm"
                        aria-describedby="image_file-error"
                    />
                    <div
                        id="image_file-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.image_file &&
                            state.errors.image_file.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                <div id="error-message" aria-live="polite" aria-atomic="true">
                    {state.message && (
                        <p className="mt-2 text-sm text-red-500">
                            {state.message}
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button type="submit">Create Music Review</button>
            </div>
        </form>
    );
}