import { fetchCurrentFantasySeasons, fetchFantasyFixtures, fetchFantasyTeams } from "@/app/data/fantasy";
import { FantasyFixture, FantasySeason, FantasyTeam } from "@/app/lib/definitions";
import NumMatchesSelect from "./num-matches-select";

export default async function Page() {
    const currentSeason = (await fetchCurrentFantasySeasons()) as FantasySeason;
    const teams = (await fetchFantasyTeams()) as FantasyTeam[];
    const fixtures = (await fetchFantasyFixtures(currentSeason.id.toString())) as FantasyFixture[];

    // Filter fixtures for first 3 gameweeks
    const relevantFixtures = fixtures.filter(fixture => fixture.event >= 1 && fixture.event <= 3);
    
    // Create a map of team ID to team name for easy lookup
    const teamMap = new Map(teams.map(team => [team.id, team]));
    
    // Calculate difficulty scores for each team
    const teamDifficulties = teams.map(team => {
        let totalDifficulty = 0;
        const gameweekFixtures: { [key: number]: { opponent: string, difficulty: number, isHome: boolean } } = {};
        
        // Find fixtures for this team
        relevantFixtures.forEach(fixture => {
            if (fixture.team_h_id === team.id) {
                // Home fixture
                const difficulty = fixture.team_h_difficulty;
                totalDifficulty += difficulty;
                gameweekFixtures[fixture.event] = {
                    opponent: teamMap.get(fixture.team_a_id)?.name || 'Unknown',
                    difficulty,
                    isHome: true
                };
            } else if (fixture.team_a_id === team.id) {
                // Away fixture
                const difficulty = fixture.team_a_difficulty;
                totalDifficulty += difficulty;
                gameweekFixtures[fixture.event] = {
                    opponent: teamMap.get(fixture.team_h_id)?.name || 'Unknown',
                    difficulty,
                    isHome: false
                };
            }
        });
        
        return {
            team,
            totalDifficulty,
            gameweekFixtures
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
                rank = teamDifficulties.findIndex(t => t.totalDifficulty === teamData.totalDifficulty) + 1;
            }
        }
        return { ...teamData, rank };
    });
    
    // Helper function to get difficulty color
    const getDifficultyColor = (difficulty: number) => {
        if (difficulty <= 2) return 'bg-green-200';
        if (difficulty <= 3) return 'bg-yellow-200';
        return 'bg-red-200';
    };
    
    // Helper function to get team abbreviation
    const getTeamAbbreviation = (teamName: string) => {
        const words = teamName.split(' ');
        if (words.length === 1) return teamName.substring(0, 3).toUpperCase();
        if (words.length === 2) return (words[0][0] + words[1][0] + words[1][1]).toUpperCase();
        return words.map(word => word[0]).join('').toUpperCase();
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Fixture Difficulty Table</h1>
                <NumMatchesSelect />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Team</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Rank</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">GW 1</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">GW 2</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">GW 3</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamRanks.map((teamData) => (
                            <tr key={teamData.team.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2 font-medium">
                                    {teamData.team.name}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    {teamData.rank}
                                </td>
                                {[1, 2, 3].map(gameweek => {
                                    const fixture = teamData.gameweekFixtures[gameweek];
                                    if (!fixture) {
                                        return (
                                            <td key={gameweek} className="border border-gray-300 px-4 py-2 text-center text-gray-400">
                                                -
                                            </td>
                                        );
                                    }
                                    
                                    const teamAbbr = getTeamAbbreviation(fixture.opponent);
                                    const isHome = fixture.isHome;
                                    const displayName = isHome ? teamAbbr : teamAbbr.toLowerCase();
                                    
                                    return (
                                        <td 
                                            key={gameweek} 
                                            className={`border border-gray-300 px-4 py-2 text-center ${getDifficultyColor(fixture.difficulty)}`}
                                            title={`${fixture.opponent} (${fixture.isHome ? 'H' : 'A'}) - Difficulty: ${fixture.difficulty}`}
                                        >
                                            {displayName}
                                        </td>
                                    );
                                })}
                                <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                                    {teamData.totalDifficulty}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
                <p><strong>Difficulty Scale:</strong> 1-2 (Green) = Easy, 3 (Yellow) = Medium, 4-5 (Red) = Hard</p>
                <p><strong>Format:</strong> UPPERCASE = Home fixture, lowercase = Away fixture</p>
            </div>
        </div>
    );
}