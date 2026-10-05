import {
    fetchEdgeCreditsRemaining,
    fetchEdgeOutcomes,
    fetchLatestEdgeScan,
} from "@/app/data/edges";
import { EdgeOutcome } from "@/app/lib/definitions";
import RefreshButton from "./refresh-button";
import styles from "./styles.module.css";

const THRESHOLD = 0.02;

function pct(x: number | null) {
    if (x === null) return "";
    return `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}%`;
}

function cents(x: number | null) {
    return x === null ? "–" : `${Math.round(x * 100)}¢`;
}

function american(x: number | null) {
    if (x === null) return "–";
    return x > 0 ? `+${x}` : `${x}`;
}

function bestBet(o: EdgeOutcome) {
    const name = o.team === "Draw" ? "the draw" : o.team;
    const options = [
        { edge: o.edge_a, text: `FanDuel: ${name} at ${american(o.fd_odds)}` },
        {
            edge: o.edge_b_yes,
            text: `Kalshi: YES ${name} at ${cents(o.kalshi_ask)}`,
        },
        {
            edge: o.edge_b_no,
            text: `Kalshi: NO ${name} at ${cents(o.kalshi_no_ask)}`,
        },
    ].filter((opt) => opt.edge !== null) as { edge: number; text: string }[];
    const best = options.sort((a, b) => b.edge - a.edge)[0];
    return best && best.edge > THRESHOLD ? best : null;
}

function EdgeCell({ value }: { value: number | null }) {
    const good = value !== null && value > THRESHOLD;
    return <td className={good ? styles.good : styles.edge}>{pct(value)}</td>;
}

export default async function Page() {
    const scan = await fetchLatestEdgeScan();
    const outcomes = scan ? await fetchEdgeOutcomes(scan.id) : [];
    const creditsRemaining = await fetchEdgeCreditsRemaining();

    const games = new Map<string, EdgeOutcome[]>();
    for (const o of outcomes) {
        games.set(o.game, [...(games.get(o.game) ?? []), o]);
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edge Scanner</h1>
            <p className={styles.subtitle}>
                Kalshi vs FanDuel moneylines for NFL and Premier League games
                that are live or start in the next 24 hours.
            </p>

            <div className={styles.status}>
                <RefreshButton lastRefreshed={scan?.created ?? null} />
                <span>
                    {scan ? `${scan.games} games` : ""}
                    {creditsRemaining !== null &&
                        ` · ${creditsRemaining} Odds API credits left`}
                </span>
            </div>

            {scan && games.size === 0 && (
                <p className={styles.empty}>
                    No games live or starting in the next 24 hours.
                </p>
            )}

            {games.size > 0 && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Outcome</th>
                                <th>Kalshi</th>
                                <th>FanDuel</th>
                                <th>FD fair</th>
                                <th>FanDuel bet</th>
                                <th>Kalshi YES</th>
                                <th>Kalshi NO</th>
                                <th>Best bet</th>
                            </tr>
                        </thead>
                        {Array.from(games.entries()).map(([game, rows]) => (
                            <tbody key={game}>
                                <tr className={styles.gameRow}>
                                    <td colSpan={8}>
                                        {game}
                                        {rows[0].is_live && (
                                            <span className={styles.live}>
                                                LIVE
                                            </span>
                                        )}
                                    </td>
                                </tr>
                                {rows.map((o) => {
                                    const bet = bestBet(o);
                                    return (
                                        <tr key={o.id}>
                                            <td>{o.team}</td>
                                            <td>
                                                {cents(o.kalshi_bid)} /{" "}
                                                {cents(o.kalshi_ask)}
                                            </td>
                                            <td>{american(o.fd_odds)}</td>
                                            <td>
                                                {o.fd_fair_prob === null
                                                    ? "–"
                                                    : `${(o.fd_fair_prob * 100).toFixed(1)}%`}
                                            </td>
                                            <EdgeCell value={o.edge_a} />
                                            <EdgeCell value={o.edge_b_yes} />
                                            <EdgeCell value={o.edge_b_no} />
                                            <td
                                                className={
                                                    bet
                                                        ? styles.good
                                                        : styles.edge
                                                }
                                            >
                                                {bet ? bet.text : "No edge"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        ))}
                    </table>
                </div>
            )}

            <p className={styles.footnote}>
                Edges are expected return per $1. FanDuel bet uses the Kalshi
                mid as the true chance; Kalshi YES / NO use FanDuel&apos;s
                de-vigged chance against the Kalshi ask plus fee. Green means
                above 2%. Splitting FanDuel&apos;s margin evenly overstates
                underdogs and draws, so treat longshot signals with caution.
            </p>
        </div>
    );
}
