import { Board, BoardDimensions, swapCardsAt } from "../board";
import { Card, RANKS, SUITS } from "../cards";
import { PseudoRandom } from "./pseudo-random";

export function generateSolvedBoard(dimensions: BoardDimensions): Board<Card | null> {
    if (isNaN(dimensions.rows) || isNaN(dimensions.columns))
        throw new Error("dimensions must be not NaN");
    if (dimensions.rows < 0 || dimensions.columns < 0)
        throw new Error("dimensions must be non-negative");
    if (dimensions.rows > SUITS.length || dimensions.columns > RANKS.length)
        throw new Error("specified dimensions must be in bounds of the available ranks and suits");

    return SUITS.slice(0, dimensions.rows).map(suit => {
        return [
            ...RANKS.slice(0, dimensions.columns - 1),
            null,
        ].map(rank => rank !== null ? { suit, rank } : null);
    });
}

export function generateShuffledBoard(dimensions: BoardDimensions, seed: number = 42): Board<Card | null> {
    // TODO: Extend to only generate valid/solvable boards
    const board = generateSolvedBoard(dimensions);
    const random = new PseudoRandom(seed);

    for (let columnIdx = 0; columnIdx < dimensions.columns; columnIdx++) {
        for (let rowIdx = 0; rowIdx < dimensions.rows; rowIdx++) {
            let randomColumnIdx = random.nextInt(dimensions.columns);
            let randomRowIdx = random.nextInt(dimensions.rows);

            swapCardsAt(board, { row: rowIdx, column: columnIdx }, { row: randomRowIdx, column: randomColumnIdx });
        }
    }

    return board;
}
