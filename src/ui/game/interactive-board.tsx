import React from "react";
import { CardPosition } from "../../board";
import { Card } from "../../cards";
import { GameRules, Move } from "../../game";
import { BoardState, Highlight, HighlightedBoard } from "./board/board";

export function InteractiveBoard({
    board,
    rules,
    onMove,
}: {
    board: BoardState,
    rules: GameRules,
    onMove(move: Move): void,
}): JSX.Element {
    const [selection, setSelection] = React.useState<{
        cardPosition: CardPosition,
        candidateMoves: Array<Move>,
    } | null>(null);

    const possibleMoves = React.useMemo<Array<Move>>(() => {
        return rules.getPossibleMoves(board);
    }, [rules, board]);

    function isSelected(card: CardPosition) {
        return selection?.cardPosition.row === card.row && selection.cardPosition.column === card.column;
    }

    function handleCardSelection(_card: Card | null, cardPosition: CardPosition) {
        if (selection != null) {
            if (isSelected(cardPosition)) {
                // The selected card was selected again, meaning that it should be de-selected.
                setSelection(null);
                return;
            }

            const selectedCandidateMove = selection.candidateMoves.find(
                it => it.to.row === cardPosition.row && it.to.column === cardPosition.column);

            // There is no valid move with the selected card as the "to" card. We therefore ignore the event.
            // We keep the selection though as the user might want to try another target card.
            if (selectedCandidateMove === undefined)
                return;

            // The selected move is valid and thus needs to be reported.
            // We reset the selection such that the next move can be performed.
            // The result of the move will be reflected in the game state, which is managed by the parent component.
            onMove(selectedCandidateMove);
            setSelection(null);
            return;
        }

        const possibleMovesWithSelectedCard = possibleMoves.filter(
            it => it.from.row === cardPosition.row && it.from.column === cardPosition.column);

        // There is no valid move with the selected card as the "from" card. We therefore ignore the event.
        if (possibleMovesWithSelectedCard.length === 0)
            return;

        setSelection({
            cardPosition,
            candidateMoves: possibleMovesWithSelectedCard,
        });
    }

    const highlights = React.useMemo<Array<Highlight>>(() => {
        if (selection === null) {
            return possibleMoves.map(it => ({
                spot: it.from,
                highlight: "selection-candidate",
            }));
        }

        return [
            {
                spot: selection.cardPosition,
                highlight: "selection"
            },
            ...selection.candidateMoves.map(it => ({
                spot: it.to,
                highlight: "swap-candidate" as const,
            }))
        ]
    }, [possibleMoves, selection]);

    return <HighlightedBoard
        state={board}
        highlights={highlights}
        onCardSelect={(card, row, column) => handleCardSelection(card, { row, column })} />
}
