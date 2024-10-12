import { fetchWineById } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    const wine = await fetchWineById(id);
    if (!wine) {
        notFound();
    }
    return (
        <div>
            <h1>{wine.name}</h1>
        </div>
    );
}
