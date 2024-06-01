// Less elegant than using an enum declaration as an enum has the concept of cardinality inherent to it.
// It is relatively hard to get the members of an enum though, as Object#keys and Object#values

import { ComponentType } from "./util/types";

// also report the respective inverse mapping.
export const SUITS = [
    "hearts",
    "diamonds",
    "clubs",
    "spades",
] as const;

export type Suit = ComponentType<typeof SUITS>;

export function getSuitCardinality(suit: Suit): number {
    // Provide lookup method besides trivial implementation to leave room for future optimizations
    // such as lookup tables.
    return SUITS.indexOf(suit);
}

export const RANKS = [
    "ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
 ] as const;

export type Rank = ComponentType<typeof RANKS>;

export function getRankCardinality(rank: Rank): number {
    return RANKS.indexOf(rank);
}

export interface Card {
    suit: Suit,
    rank: Rank,
}

export function cardsEqual(first: Card | null, second: Card | null): boolean {
    if (first === null && second === null) {
        return true;
    }
    if (first === null || second === null) {
        return false;
    }

    return first.suit === second.suit && first.rank === second.rank;
}
