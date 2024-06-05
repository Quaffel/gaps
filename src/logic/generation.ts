import { Board, BoardDimensions, filterBoard, swapCardsAt } from "../board";
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

export function generateShuffledBoard(dimensions: BoardDimensions, n: number = 100, seed: number = 42): Board<Card | null> {
    // TODO: Extend to only generate valid/solvable boards
    let board = generateSolvedBoard(dimensions);
    const random = new PseudoRandom(seed);

    for (let i = 0; i < n; i++) {
        const gapsPositions = filterBoard(board, (card) => card == null);
        const nonGapCardsPositions = filterBoard(board, (card) => card != null);
        const pickedGapIndex = random.nextInt(gapsPositions.length);
        const pickedCardIndex = random.nextInt(nonGapCardsPositions.length);
        const selectedGap = gapsPositions[pickedGapIndex];
        const selectedCard = nonGapCardsPositions[pickedCardIndex];
        const move = {
            from: selectedCard.position,
            to: selectedGap.position
        };
        swapCardsAt(board, move.from, move.to);
    }

    return board;
}
