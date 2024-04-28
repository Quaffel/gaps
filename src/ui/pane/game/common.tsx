import { Board } from "../../../board";
import { Card } from "../../../cards";
import { astarGamePane } from "./astar-game";
import { interactiveGamePane } from "./interactive-game";

export interface Pane<TState> {
    deriveBoard(state: TState): Board<Card | null>,

    buildDefaultState(initialBoard: Board<Card | null>): TState,

    render(options: {
        state: TState,
        onStateChange: (state: TState) => void,
    }): JSX.Element,
};

export const gamePanes = {
    'interactive': interactiveGamePane,
    'astar': astarGamePane,
} as const;


export type PaneState<TName extends keyof typeof gamePanes> = typeof gamePanes[TName] extends Pane<infer TConfig>
    ? TConfig
    : never;

export type PaneName = keyof typeof gamePanes;