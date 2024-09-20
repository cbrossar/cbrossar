import { fetchTopTranfersIn } from "@/app/lib/data";

export default async function Page() {

    const numPlayers = 100;
    const topTransfers = await fetchTopTranfersIn(numPlayers);

    return (
        <div>
            <h1>Hello, World!</h1>
        </div>
    )
}