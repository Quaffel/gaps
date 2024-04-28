import React from "react";
import { Board, withCardsSwapped } from "../../../board";
import { Card } from "../../../cards";
import { GameRules, Move } from "../../../game";
import { solitaireGapsRules } from "../../../logic/rules";
import { InteractiveBoard } from "../../game/interactive-board";
import { StatisticsBar } from "../../game/statistics-bar";
import { Pane } from "./common";

export interface InteractivePaneState {
    currentBoard: Board<Card | null>,
}

export function InteractiveGamePane({
    rules,
    state,
    onStateChange,
}: {
    rules: GameRules,
    state: InteractivePaneState,
    onStateChange: (state: InteractivePaneState) => void,
}) {
    // Informs this component that the user would like to perform a swap (i.e., they selected a second card).
    // Note that while the UI code ensures that a card is not swapped with itself, it does not ensure consistency
    // with 'requestSwapCandidates'. That is, this function is also called for cards that have not previously
    // been reported as candidates.
    function handleMove(move: Move): void {
        const boardWithMoveApplied = withCardsSwapped(state.currentBoard, move.from, move.to);
        onStateChange({
            currentBoard: boardWithMoveApplied,
        });
    }

    const statistics = React.useMemo(() => {
        return {
            score: rules.getScore(state.currentBoard),
        }
    }, [rules, state.currentBoard]);

    return <>
        <StatisticsBar statistics={statistics} />
        <InteractiveBoard board={state.currentBoard} rules={solitaireGapsRules} onMove={handleMove} />
    </>
}

function buildDefaultState(initialBoard: Board<Card | null>): InteractivePaneState {
    return {
        currentBoard: initialBoard,
    }
}

export const interactiveGamePane: Pane<InteractivePaneState> = {
    deriveBoard(state: InteractivePaneState): Board<Card | null> {
        return state.currentBoard;
    },

    buildDefaultState,

    render: InteractiveGamePane,
}
