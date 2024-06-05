import { Board } from "../../../board";
import { Card } from "../../../cards";
import { interactiveGamePane } from "./interactive-game";
import { astarGamePane } from "./astar-game";
import { mctsGamePane } from "./mcts-game";
import { greedyGamePane } from "./greedy-game";

export interface GamePane<TState> {
    deriveBoard(state: TState): Board<Card | null>,

    buildDefaultState(initialBoard: Board<Card | null>): TState,

    render(options: {
        state: TState,
        onStateChange: (state: TState) => void,
    }): JSX.Element,
};

export const gamePanes = {
    "interactive": interactiveGamePane,
    "astar": astarGamePane,
    "greedy": greedyGamePane,
    "mcts": mctsGamePane,
} as const;


export type GamePaneState<TName extends keyof typeof gamePanes> = typeof gamePanes[TName] extends GamePane<infer TState>
    ? TState
    : never;

export type GamePaneType = keyof typeof gamePanes;
