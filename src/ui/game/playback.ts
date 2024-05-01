import { Board } from "../../board";
import { Card } from "../../cards";
import { Move } from "../../game";
import { assertType } from "../../util/types";

export type MoveIndex = 'initial' | 'final' | number;

export interface PlaybackState {
    moveIndex: MoveIndex,
}

export function getHighlightedMove(moves: Array<Move>, playbackState: PlaybackState): Move | null {
    const moveIndex = playbackState.moveIndex;

    if (moveIndex === 'initial' || moveIndex === 'final') return null;
    return moves[moveIndex];
}

export function getBoardAtMove(
    initialBoard: Board<Card | null>,
    swaps: Array<Move>,
    playbackState: PlaybackState,
): Board<Card | null> {
    const moveIndex = playbackState.moveIndex;

    const board = structuredClone(initialBoard);
    if (moveIndex === 'initial') return board;

    function performSwap(swapIdx: number) {
        const swap = swaps[swapIdx];

        const fromCard = board[swap.from.row][swap.from.column];
        const toCard = board[swap.to.row][swap.to.column];

        board[swap.from.row][swap.from.column] = toCard;
        board[swap.to.row][swap.to.column] = fromCard;
    }

    const displayedSwapIdx = typeof moveIndex === 'number'
        ? moveIndex
        : (() => {
            assertType<'final'>(moveIndex);
            return swaps.length;
        })();

    for (let swapIdx = 0; swapIdx < displayedSwapIdx; swapIdx++) {
        performSwap(swapIdx);
    }

    return board;
}
