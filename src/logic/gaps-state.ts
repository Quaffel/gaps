import { Board, boardsEqual, withCardsSwapped } from "../board";
import { Card } from "../cards";
import { GameRules, Move } from "../game";
import { getSeedOfBoard } from "../seed";
import { State } from "./solver/state";

export class GapsBoardState implements State<Board<Card | null>, Move> {
    rules: GameRules;
    board: Board<Card | null>;

    constructor(rules: GameRules, board: Board<Card | null>) {
        this.rules = rules;
        this.board = board;
    }

    get(): Board<Card | null> {
        return this.board;
    }

    getPossibleActions(): Move[] {
        return this.rules.getPossibleMoves(this.board);
    }

    withActionApplied(action: Move): State<Board<Card | null>, Move> {
        return new GapsBoardState(this.rules, withCardsSwapped(this.board, action.from, action.to));
    }

    isSolved(): boolean {
        return this.rules.isSolved(this.board);
    }

    getScore(normalize: boolean = true): number {
        return this.rules.getScore(this.board, normalize);
    }

    equals(other: State<Board<Card | null>, Move>): boolean {
        return boardsEqual(this.get(), other.get());
    }

    hash(): string {
        // TODO: Use more lightweight hash
        return getSeedOfBoard(this.board);
    }
}
