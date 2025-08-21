import { fetchCurrentFantasySeasons, fetchFantasyFixtures, fetchFantasyTeams } from "@/app/data/fantasy";
import { FantasyFixture, FantasySeason, FantasyTeam } from "@/app/lib/definitions";

export default async function Page() {
    const currentSeason = (await fetchCurrentFantasySeasons()) as FantasySeason;
    const teams = (await fetchFantasyTeams()) as FantasyTeam[];
    const fixtures = (await fetchFantasyFixtures(currentSeason.id.toString())) as FantasyFixture[];

    // lets create a fixture difficulty table

    return <div>{JSON.stringify(fixtures)}</div>;
}