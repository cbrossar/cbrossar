import Form from "@/app/ui/music-review/edit-form";
import { fetchMusicReviewById } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    const musicReview = await fetchMusicReviewById(id);
    if (!musicReview) {
        notFound();
    }
    return (
        <main>
            <Form musicReview={musicReview} />
        </main>
    );
}
