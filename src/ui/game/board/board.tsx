import React from "react";
import { Card } from "../../../cards";
import { Board, CardPosition, Row } from "../../../board";
import { CardSpotState } from "./card";
import { CardRow } from "./card-row";

import "./board.css";

export type BoardState = Board<Card | null>;

export function PlainBoard({
    rows,
    onCardSelect
}: {
    rows: Array<Row<CardSpotState>>,
    onCardSelect?: (card: Card | null, row: number, column: number) => void
}): JSX.Element {
    return <div className="board">
        {rows.map((it, rowIdx) => <CardRow
            key={rowIdx}
            cards={it}
            onCardSelect={(card, columnIdx) => onCardSelect?.(card, rowIdx, columnIdx)} />)}
    </div>
}

export interface Highlight {
    spot: CardPosition
    highlight: CardSpotState["highlight"]
}

export function HighlightedBoard({
    state,
    highlights,
    onCardSelect
}: {
    state: BoardState,
    highlights: Array<Highlight>,
    onCardSelect?: (card: Card | null, row: number, column: number) => void
}): JSX.Element {
    for (let it of highlights) {
        if (it.spot.row < 0 || it.spot.row >= state.length)
            throw new Error("highlight row idx is out of bounds");

        const row = state[it.spot.row];
        if (it.spot.column < 0 || it.spot.column >= row.length)
            throw new Error("highlight column idx is out of bounds");
    }

    const cardState = React.useMemo<Board<CardSpotState>>(() => state.map(
        (row, rowIdx) => row.map((card, cardIdx) => {
            const highlight = highlights.find(it => it.spot.row === rowIdx && it.spot.column === cardIdx)?.highlight;

            return {
                card,
                highlight: highlight ?? "none"
            };
        })
    ), [state, highlights]);

    return <PlainBoard rows={cardState} onCardSelect={onCardSelect} />
}
