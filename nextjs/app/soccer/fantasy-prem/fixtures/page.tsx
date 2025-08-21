import {
    fetchCurrentFantasySeason,
    fetchFantasyFixtures,
    fetchFantasyTeams,
} from "@/app/data/fantasy";
import {
    FantasyFixture,
    FantasySeason,
    FantasyTeam,
} from "@/app/lib/definitions";
import GameweekRangeSelect from "./gameweek-range-select";
import Image from "next/image";

export default async function Page({
    searchParams,
}: {
    searchParams?: {
        startGameweek?: string;
        endGameweek?: string;
    };
}) {
    const currentSeason = (await fetchCurrentFantasySeason()) as FantasySeason;
    const teams = (await fetchFantasyTeams()) as FantasyTeam[];
    const fixtures = (await fetchFantasyFixtures(
        currentSeason.id.toString(),
    )) as FantasyFixture[];

    // Find the first gameweek that is not finished
    const defaultStartGameweek =
        fixtures
            .filter((fixture) => !fixture.finished)
            .sort((a, b) => a.event - b.event)[0]?.event || 1;

    const defaultEndGameweek = Math.min(defaultStartGameweek + 3, 38);

    // Filter fixtures for the selected gameweek range
    const startGameweek = searchParams?.startGameweek
        ? parseInt(searchParams.startGameweek)
        : defaultStartGameweek;
    const endGameweek = searchParams?.endGameweek
        ? parseInt(searchParams.endGameweek)
        : defaultEndGameweek;
    const relevantFixtures = fixtures.filter(
        (fixture) =>
            fixture.event >= startGameweek && fixture.event <= endGameweek,
    );

    // Create a map of team ID to team name for easy lookup
    const teamMap = new Map(teams.map((team) => [team.id, team]));

    // Calculate difficulty scores for each team
    const teamDifficulties = teams.map((team) => {
        let totalDifficulty = 0;
        const gameweekFixtures: {
            [key: number]: {
                opponent: string;
                difficulty: number;
                isHome: boolean;
            };
        } = {};

        // Find fixtures for this team
        relevantFixtures.forEach((fixture) => {
            if (fixture.team_h_id === team.id) {
                // Home fixture
                const difficulty = fixture.team_h_difficulty;
                totalDifficulty += difficulty;
                gameweekFixtures[fixture.event] = {
                    opponent: teamMap.get(fixture.team_a_id)?.name || "Unknown",
                    difficulty,
                    isHome: true,
                };
            } else if (fixture.team_a_id === team.id) {
                // Away fixture
                const difficulty = fixture.team_a_difficulty;
                totalDifficulty += difficulty;
                gameweekFixtures[fixture.event] = {
                    opponent: teamMap.get(fixture.team_h_id)?.name || "Unknown",
                    difficulty,
                    isHome: false,
                };
            }
        });

        return {
            team,
            totalDifficulty,
            gameweekFixtures,
        };
    });

    // Sort teams by total difficulty (easiest first)
    teamDifficulties.sort((a, b) => a.totalDifficulty - b.totalDifficulty);

    // Calculate ranks considering ties
    const teamRanks = teamDifficulties.map((teamData, index) => {
        let rank = index + 1;
        if (index > 0) {
            const previousTeam = teamDifficulties[index - 1];
            if (teamData.totalDifficulty === previousTeam.totalDifficulty) {
                // Find the first team with this difficulty score
                rank =
                    teamDifficulties.findIndex(
                        (t) => t.totalDifficulty === teamData.totalDifficulty,
                    ) + 1;
            }
        }
        return { ...teamData, rank };
    });

    // Helper function to get difficulty color
    const getDifficultyColor = (difficulty: number) => {
        if (difficulty <= 2) return "bg-green-200";
        if (difficulty <= 3) return "bg-yellow-200";
        return "bg-red-200";
    };

    // Helper function to get team abbreviation
    const getTeamAbbreviation = (teamName: string) => {
        const words = teamName.split(" ");
        if (words.length === 1) return teamName.substring(0, 3).toUpperCase();
        if (words.length === 2)
            return (words[0][0] + words[1][0] + words[1][1]).toUpperCase();
        return words
            .map((word) => word[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">Fixture Difficulty Table</h1>
                <GameweekRangeSelect
                    defaultStartGameweek={defaultStartGameweek}
                    defaultEndGameweek={defaultEndGameweek}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-sm sm:text-base">
                                Team
                            </th>
                            <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-sm sm:text-base">
                                Rank
                            </th>
                            {Array.from(
                                { length: endGameweek - startGameweek + 1 },
                                (_, i) => (
                                    <th
                                        key={startGameweek + i}
                                        className="border border-gray-300 px-1 sm:px-4 py-2 text-center text-xs sm:text-base"
                                    >
                                        GW {startGameweek + i}
                                    </th>
                                ),
                            )}
                            <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-sm sm:text-base">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamRanks.map((teamData) => (
                            <tr
                                key={teamData.team.id}
                                className="hover:bg-gray-50"
                            >
                                <td className="border border-gray-300 px-2 sm:px-4 py-2 font-medium text-sm sm:text-base">
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={`/fantasy-prem/${teamData.team.image_filename}`}
                                            alt={`${teamData.team.name} logo`}
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                        {teamData.team.name}
                                    </div>
                                </td>
                                <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-sm sm:text-base">
                                    {teamData.rank}
                                </td>
                                {Array.from(
                                    { length: endGameweek - startGameweek + 1 },
                                    (_, i) => {
                                        const gameweek = startGameweek + i;
                                        const fixture =
                                            teamData.gameweekFixtures[gameweek];
                                        if (!fixture) {
                                            return (
                                                <td
                                                    key={gameweek}
                                                    className="border border-gray-300 px-1 sm:px-4 py-2 text-center text-gray-400 text-xs sm:text-sm"
                                                >
                                                    -
                                                </td>
                                            );
                                        }

                                        const teamAbbr = getTeamAbbreviation(
                                            fixture.opponent,
                                        );
                                        const isHome = fixture.isHome;
                                        const displayName = isHome
                                            ? teamAbbr
                                            : teamAbbr.toLowerCase();

                                        return (
                                            <td
                                                key={gameweek}
                                                className={`border border-gray-300 px-1 sm:px-4 py-2 text-center text-xs sm:text-sm ${getDifficultyColor(fixture.difficulty)}`}
                                                title={`${fixture.opponent} (${fixture.isHome ? "H" : "A"}) - Difficulty: ${fixture.difficulty}`}
                                            >
                                                {displayName}
                                            </td>
                                        );
                                    },
                                )}
                                <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center font-medium text-sm sm:text-base">
                                    {teamData.totalDifficulty}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 text-sm text-gray-600">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <p>
                        <strong>Difficulty Scale:</strong> 1-2 (Green) = Easy, 3
                        (Yellow) = Medium, 4-5 (Red) = Hard
                    </p>
                    <p>
                        <strong>Format:</strong> UPPERCASE = Home, lowercase =
                        Away
                    </p>
                </div>
            </div>
        </div>
    );
}
