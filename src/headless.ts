import { Board } from "./board";
import { Card } from "./cards";
import { Move } from "./game";
import { GapsBoardState } from "./logic/gaps-state";
import { generateShuffledBoard } from "./logic/generation";
import { isSolved, solitaireGapsRules } from "./logic/rules";
import { AStar } from "./logic/solver/astar";
import { MCTS } from "./logic/solver/mcts";
import { Path } from "./logic/solver/state";
import * as fs from "fs";

(async () => {
    const gamesForDimensions: Board<Card | null>[][] = [[]];
    const N: number = 10;
    const generationSeed: number = 42;
    const MCTSSeed: number = 42;
    const MCSTSMaxIterations: number = 1000;
    const dimensions: number[][] = [
        [4, 5],
        [4, 6],
        [4, 7],
        [4, 8],
        [4, 9],
        [4, 10],
        [4, 11],
        [4, 12],
        [4, 13],
    ];
    
    for (let i = 0; i < N; i++) {
        let currentGames: Board<Card | null>[] = [];
        for (const [rows, columns] of dimensions) {
            const shuffledBoard = generateShuffledBoard({ rows, columns }, generationSeed + i);
            currentGames.push(shuffledBoard);
        }
        gamesForDimensions.push(currentGames);
    }

    function getTimeout(columns: number) {
        return 10 * (columns - 4) * 0.25;
    }
    
    function runAStar(game: Board<Card | null>,  timeout: number): Path<Board<Card | null>, Move> {
        const astar = new AStar.AStarSearch(
            new GapsBoardState(solitaireGapsRules, game),
            timeout,
            (state) => 1.0 - state.getScore(),
        );

        const path = astar.findPath()!;

        return path;
    }

    function runMCTS(game: Board<Card | null>, timeout: number): Path<Board<Card | null>, Move> {
        const mcts = new MCTS.MCTSSearch<Board<Card | null>, Move>(
            state => state.getScore(),
            1.41,
            MCTSSeed,
        );

        const path: Path<Board<Card | null>, Move> = [];

        const startTime = Date.now();
        const endTime = startTime + timeout * 1000;

        let board = game;
        while (Date.now() < endTime) {
            const { done, element } = mcts.findNextMove(
                new GapsBoardState(solitaireGapsRules, game),
                MCSTSMaxIterations,
            );

            board = element.state;
            path.push(element);

            if (done) {
                break;
            }
        }

        return path;
    }

    const methods: { [key: string]: (game: Board<Card | null>, timeout: number) => Path<Board<Card | null>, Move> } = {
        astar: runAStar,
        mcts: runMCTS,
    }

    let stats = [];
    
    for (let i = 0; i < dimensions.length; i++) {
        const [rows, columns] = dimensions[i];
        const games = gamesForDimensions[i];
        for (let j = 0; j < games.length; j++) {
            const startTime = Date.now();
            console.log(`Solving game with seed ${generationSeed} and board size ${rows}x${columns}`);
            for (const method in methods) {
                const path = methods[method](games[j], getTimeout(columns));
                const currentStats = {
                    method,
                    rows,
                    columns,
                    seed: generationSeed + j,
                    solved: isSolved(path[path.length - 1].state),
                    pathLength: path.length,
                    time: Date.now() - startTime,
                };
                stats.push(currentStats);
                console.log(currentStats);
            }

            // Save stats to file
            fs.writeFileSync("stats.json", JSON.stringify(stats, null, 4));
        }
    }    
})();
