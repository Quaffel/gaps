import { VerticalBar } from "../common/vertical-bar";

export interface GameStatistics {
    score: number
}

export function StatisticsBar({
    statistics,
}: {
    statistics: GameStatistics,
}): JSX.Element {
    return <VerticalBar>
        <div>
            <label>Play yourself</label>
        </div>
        <div>
            <strong>Score:</strong> {statistics.score.toFixed(2)}
        </div>
    </VerticalBar>;
}
