import { Board, flatMapBoard, getColumnCount, getRowCount } from "./board";
import { Card, RANKS, SUITS } from "./cards";
import { generateSolvedBoard } from "./logic/generation";

export function getSeedOfBoard(board: Board<Card | null>): string {
    let seed = `${getRowCount(board)}.${getColumnCount(board)} `;
    seed += flatMapBoard(board, card => {
        const rankIdx = card ? RANKS.indexOf(card.rank) : "x";
        const suitIdx = card ? SUITS.indexOf(card.suit) : "x";
        return `${suitIdx}.${rankIdx}`;
    }).join(" ");

    return seed;
}

export function getBoardOfSeed(seed: string): Board<Card | null> | null {
    const parts = seed.trim().split(" ");
    const [rows, columns] = parts[0].split(".").map(it => parseInt(it, 10));

    if (isNaN(rows) || isNaN(columns)) return null;
    const board = generateSolvedBoard({ rows, columns });

    const cardParts = parts.slice(1);
    for (const [idx, part] of cardParts.entries()) {
        function parseRankOrSuitIndex(rawIndex: string): number | null | undefined {
            if (rawIndex === "x")
                return null;

            const numericIndex = parseInt(rawIndex);
            if (isNaN(numericIndex) || numericIndex.toString(10).length !== rawIndex.length)
                return undefined;

            return numericIndex;
        }

        const [suitIdx, rankIdx] = part.split(".").map(parseRankOrSuitIndex);
        if (suitIdx === undefined || rankIdx === undefined)
            return null;

        let card: Card | null;
        if (suitIdx === null || rankIdx === null) {
            if (suitIdx !== rankIdx) return null;
            card = null;
        } else {
            card = {
                suit: SUITS[suitIdx],
                rank: RANKS[rankIdx],
            };
        }

        board[Math.floor(idx / columns)][idx % columns] = card;
    }

    return board;
}
