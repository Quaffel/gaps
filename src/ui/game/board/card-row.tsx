import { Card } from "../../../cards";
import { CardSpotState, CardTile } from "./card";

import "./card-row.css"

export type Row = Array<CardSpotState>;

export function CardRow({
    cards,
    onCardSelect
}: {
    cards: Row,
    onCardSelect?: (card: Card | null, cardIdx: number) => void
}): JSX.Element {
    return <div className="card-row">
        {cards.map((it, idx) => <CardTile
            key={idx}
            spotState={it}
            onSelect={() => onCardSelect?.(it.card, idx)} />)}
    </div>
}
