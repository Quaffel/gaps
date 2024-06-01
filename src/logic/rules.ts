import { Board, CardPosition, filterBoard, getCardAt, getColumnCount, getRowCount } from "../board";
import { Card, RANKS, getRankCardinality, getSuitCardinality } from "../cards";
import { GameRules, Move } from "../game";


export function findGaps(board: Board<Card | null>, width: number = 1): Array<CardPosition> {
    // TODO: Give helper functions more sensible names. 
    //       Present chain of filter and map does not make sense at first glance.
    let gaps = filterBoard(board, it => it === null).map(it => it.position);

    for (let currentWidth = 1; currentWidth < width; currentWidth++) {
        gaps = gaps.filter(it => {
            const previousColumn = it.column - 1;
            if (previousColumn < 0) return false;

            const precedingCard = getCardAt(board, { column: previousColumn, row: it.row })
            return precedingCard === null;
        })
    }

    return gaps;
}

/**
 * @returns an array of all dead gaps. A gap is dead if it needs to be filled (i.e., it is not the last card
 * in the row) but there is no card that can fill it (i.e., its predecessor is of the suit"s highest rank).
 * it is not the last card in the row and the preceding card is of the suit"s highest rank.
 */
export function getDeadGaps(board: Board<Card | null>): Array<CardPosition> {
    return findGaps(board).filter(gap => {
        const previousColumn = gap.column - 1;
        if (previousColumn < 0) return false;

        const lastCardInRow = gap.column === getColumnCount(board) - 1;
        if (lastCardInRow) return false;

        const precedingCard = getCardAt(board, { row: gap.row, column: previousColumn });
        if (precedingCard === null) return false;

        const highestPossibleRank = RANKS.at(-1)!;
        return precedingCard.rank === highestPossibleRank;
    });
}

function findCandidateGapsFor(board: Board<Card | null>, cardPosition: CardPosition): Array<CardPosition> {
    const card = getCardAt(board, cardPosition);

    // Gaps cannot be moved; cards can only be moved into gaps.
    if (card === null) {
        return [];
    }

    const gaps = findGaps(board);

    return gaps.filter(gap => {
        const previousColumn = gap.column - 1;

        // If the gap is at the top or left edge of the board, it can be swapped with any card.
        if (previousColumn < 0) {
            return true;
        }

        const previousCard = getCardAt(board, { row: gap.row, column: previousColumn });

        // The gap is preceded by another gap. We may only fill the preceding gap.
        if (previousCard === null) {
            return false;
        }

        return (
            getRankCardinality(previousCard.rank) + 1 === getRankCardinality(card.rank) &&
            previousCard.suit === card?.suit
        );
    });
}

/**
 * @returns an approximate list of correctly placed cards.
 *  It is approximate in that it does not know which row will ultimately contain which suit.
 */
export function findCorrectlyPlacedCards(board: Board<Card | null>): Array<CardPosition> {
    function isCardInCorrectColumn(card: Card | null, column: number): boolean {
        if (card === null) return column === getColumnCount(board) - 1;

        return card.rank === RANKS[column];
    }

    const correctlyPlacedCards = board.reduce<CardPosition[][]>((acc, row, rowIdx) => {
        // nested array
        // first dimension:  suit
        // second dimension: list of cards that are correctly placed if that row were of the respective suit
        const resRow = row.reduce<CardPosition[][]>((acc, card, columnIdx) => {
            if (isCardInCorrectColumn(card, columnIdx)) {
                const cardPosition = { row: rowIdx, column: columnIdx };
                let addTo = acc.length - 1;
                if (card !== null) {
                    addTo = getSuitCardinality(card.suit);
                }
                acc[addTo] = [...acc[addTo], cardPosition];
            }
            return acc;
        }, Array(getRowCount(board) + 1).fill([]));

        // find suit for which the largest amount of cards is correctly placed
        const lengths = resRow.map(arr => arr.length);

        const argMax = lengths.reduce((acc, val, idx) => {
            if (val > lengths[acc]) {
                return idx;
            }
            return acc;
        }, 0);

        // Stores all cards that are in the correct column.
        // It overrides any other constellation determined in any other row that maximizes the same suit.
        // This addresses situations in which two rows maximize the same suit - only one of them will be considered,
        // meaning that all other cards are considered misplaced.
        // This has a caveat though: If two rows optimize for the same color, one of them will eventually cover
        // a different suit, e.g., the second-most present card. We completely discard one of the conflicting rows
        // though, which keeps the number of correctly placed cards artificially low.
        acc[argMax] = resRow.flat();

        return acc;
    }, Array(getRowCount(board) + 1).fill([]));

    return correctlyPlacedCards.flat();
}

export function isSolved(board: Board<Card | null>): boolean {
    return findCorrectlyPlacedCards(board).length === getRowCount(board) * getColumnCount(board);
}

export function getScore(board: Board<Card | null>): number {
    if (isSolved(board)) {
        return 1;
    }

    const size = getRowCount(board) * getColumnCount(board);

    let possibleGaps = findGaps(board).length;
    if (possibleGaps > 4) {
        possibleGaps = 4;
    }

    const functions = [
        findCorrectlyPlacedCards(board).length / size,
        possibleGaps / 4,
        (4 - getDeadGaps(board).length) / 4,
    ]
    const weights = [3, 10, 1];
    const weightsSum = weights.reduce((acc, val) => acc + val, 0);
    const score = functions.reduce((acc, val, idx) => acc + val * weights[idx], 0);

    return score / weightsSum;
    
    // if (isSolved(board)) {
    //     return 1;
    // }

    // const size = getRowCount(board) * getColumnCount(board);

    // const metrics = [
    //     findCorrectlyPlacedCards(board).length / size,
    //     (4 - getDeadGaps(board).length) / 4,
    //     (3 - findGaps(board, 2).length) / 3,
    //     (getPossibleMoves(board).length / size),
    // ]

    // const weights = [5, 3, 2, 1];
    // const weightsSum = weights.reduce((acc, val) => acc + val, 0);

    // return metrics.reduce((acc, val, idx) => acc + val * weights[idx], 0) / weightsSum;
}

export function getPossibleMoves(board: Board<Card | null>): Array<Move> {
    // TODO: Try to use flatmap instead
    const moveableCards = board.reduce<Move[]>((acc, row, rowIdx) => {
        return row.reduce<Move[]>((acc, card, columnIdx) => {
            if (card === null) {
                return acc;
            }

            const cardPosition = { row: rowIdx, column: columnIdx };
            const candidates = findCandidateGapsFor(board, cardPosition);
            const moves = candidates.map(candidate => ({ from: cardPosition, to: candidate }));
            return [...acc, ...moves];
        }, acc);
    }, []);
    return moveableCards;
}

export const solitaireGapsRules: GameRules = {
    isSolved,
    getScore,
    getPossibleMoves,
}
