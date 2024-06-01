import React from "react";
import { Board } from "../../board";
import { Card } from "../../cards";
import { Move } from "../../game";
import { Highlight, HighlightedBoard } from "./board/board";

export function PlaybackBoard({
    board,
    highlightedMove,
}: {
    board: Board<Card | null>,
    highlightedMove: Move | null,
}) {
    const highlights = React.useMemo<Array<Highlight>>(() => {
        if (highlightedMove === null) return [];

        return [{
            spot: highlightedMove.from,
            highlight: "selection",
        }, {
            spot: highlightedMove.to,
            highlight: "swap-candidate",
        }];
    }, [highlightedMove]);

    return <HighlightedBoard
        state={board}
        highlights={highlights}
        // ignore card selections during playback
        onCardSelect={undefined} />
}
