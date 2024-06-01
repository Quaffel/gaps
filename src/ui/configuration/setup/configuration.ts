import { Board, BoardDimensions } from "../../../board"
import { Card } from "../../../cards";
import { generateShuffledBoard } from "../../../logic/generation";
import { getBoardOfSeed } from "../../../seed";

export interface Configuration {
    boardGeneration: {
        method: "random",
        dimensions: BoardDimensions,
        seed: number,
    } | {
        method: "seed",
        seed: string,
    }
}

export function deriveBoardFromConfiguration(configuration: Configuration): Board<Card | null> {
    switch (configuration.boardGeneration.method) {
        case "random":
            return generateShuffledBoard(configuration.boardGeneration.dimensions, configuration.boardGeneration.seed);
        case "seed":
            const board = getBoardOfSeed(configuration.boardGeneration.seed);
            if (board === null)
                throw new Error("specified seed is invalid");

            return board;
    }
}
