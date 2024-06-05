import { Board } from "./board";
import { Card } from "./cards";
import { Move } from "./game";
import { GapsBoardState } from "./logic/gaps-state";
import { generateShuffledBoard } from "./logic/generation";
import { isSolved, solitaireGapsRules } from "./logic/rules";
import { AStar } from "./logic/solver/astar";
import { MCTS } from "./logic/solver/mcts";
import { Path } from "./logic/solver/state";
import { getEstimatedDistanceToSolution } from "./logic/rules";
import * as fs from "fs";

interface GameConfig {
    rows: number;
    columns: number;
    complexity: number;
    seed: number;
    board: Board<Card | null>;
}

interface Stats {
    method: string;
    solved: boolean;
    pathLength: number;
    timeout: number;
    timeElapsed: number;
    rows: number;
    columns: number;
    complexity: number;
    seed: number;
}

class CSVWriter {
    private filename: string;
    private delimiter: string;

    constructor(filename: string, delimiter: string = ",") {
        this.filename = filename;
        this.delimiter = delimiter;
    }

    writeRow(row: string[]) {
        fs.appendFileSync(this.filename, row.join(this.delimiter) + "\n");
    }
}

const games: GameConfig[] = [];
const generationSeed: number = 1;
const MCTSSeed: number = 42;
const MCSTSMaxIterations: number = 3000;
const MCTSMaxDepth: number = 100;
const dimensions: number[][] = Array.from({ length: 9 }, (_, i) => [4, i + 5]);
const complexities = Array.from({ length: 4 }, (_, i) => i * 5 + 20);
const N = 5;

const writer = new CSVWriter(`${__dirname}/results.csv`);
const header = ["method", "solved", "pathLength", "timeout", "timeElapsed", "rows", "columns", "complexity", "seed"];
writer.writeRow(header);

for (let [rows, columns] of dimensions) {
    for (let i = 0; i < complexities.length; i++) {
        const complexity = complexities[i];
        for (let j = 0; j < N; j++) {
            const seed = generationSeed + i + j;
            const shuffledBoard = generateShuffledBoard({ rows, columns }, complexity, seed);
            console.log(`Generated game of dimensions ${rows}x${columns} with complexity ${complexity} and seed ${seed}`);
            games.push({
                rows,
                columns,
                complexity,
                seed: seed,
                board: shuffledBoard,
            });
        }
    }
}

function getTimeout(columns: number, complexity: number) {
    return 8 * (columns - 4) + 0.7*(complexity - 20);
}

function runAStar(game: Board<Card | null>,  timeout: number): Path<Board<Card | null>, Move> {
    const astar = new AStar.AStarSearch(
        new GapsBoardState(solitaireGapsRules, game),
        timeout,
        (state) => {
            const estimatedDistance = getEstimatedDistanceToSolution(state.get(), 0);
            return estimatedDistance;
        },
        () => 1,
    );

    const path = astar.findPath()!;

    return path;
}

function runGreedy(game: Board<Card | null>,  timeout: number): Path<Board<Card | null>, Move> {
    const astar = new AStar.AStarSearch(
        new GapsBoardState(solitaireGapsRules, game),
        timeout,
        (state) => {
            const estimatedDistance = getEstimatedDistanceToSolution(state.get(), 2);
            return estimatedDistance;
        },
        () => 0,
    );

    const path = astar.findPath()!;

    return path;
}

function runMCTS(game: Board<Card | null>, timeout: number): Path<Board<Card | null>, Move> {
    const mcts = new MCTS.MCTSSearch(
        new GapsBoardState(solitaireGapsRules, game),
        MCSTSMaxIterations,
        MCTSMaxDepth,
        4,
        timeout
    );

    const path = mcts.findPath(MCTSSeed)!;

    return path;
}

const methods: { [key: string]: (game: Board<Card | null>, timeout: number) => Path<Board<Card | null>, Move> } = {
    "A*": runAStar,
    Greedy: runGreedy,
    MCTS: runMCTS,
}

let stats = [];

for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const timeout = getTimeout(game.columns, game.complexity);
    for (const method in methods) {
        const startTime = Date.now();
        console.log(`Solving game ${i} with ${method} method (timeout: ${timeout}s, complexity: ${game.complexity}, seed: ${game.seed}, dimensions: ${game.rows}x${game.columns})`);
        const path = methods[method](game.board, timeout);
        const currentStats: Stats = {
            method,
            solved: path.length > 0 && isSolved(path[path.length - 1].state),
            pathLength: path.length,
            timeout: timeout,
            timeElapsed: (Date.now() - startTime) / 1_000,
            rows: game.rows,
            columns: game.columns,
            complexity: game.complexity,
            seed: game.seed,
        };
        stats.push(currentStats);
        console.log(currentStats);
        writer.writeRow(Object.values(currentStats).map(String));
    }
}
