import { Board, CardPosition } from "./board";
import { Card } from "./cards";

export interface Move {
    from: CardPosition,
    to: CardPosition,
}

export interface GameRules {
    getScore(board: Board<Card | null>, normalize: boolean): number;

    getPossibleMoves(board: Board<Card | null>): Array<Move>;

    isSolved(board: Board<Card | null>): boolean;
}
