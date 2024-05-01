import React from "react";
import { Board, getCellCount } from "../../../board";
import { Card } from "../../../cards";
import { GameRules, Move } from "../../../game";
import { findCorrectlyPlacedCards, findGaps, getDeadGaps } from "../../../logic/rules";
import { AStar } from "../../../logic/solver/astar";
import { State } from "../../../logic/solver/state";
import { Configuration } from "../../configuration/astar/configuration";
import { ConfigurationBar } from "../../configuration/astar/configuration-bar";
import { PlaybackState, getBoardAtMove, getHighlightedMove } from "../../game/playback";
import { PlaybackBoard } from "../../game/playback-board";
import { GamePlaybackControls } from "../../game/playback-controls";
import { GamePane } from "./common";
import { GapsBoardState } from "../../../logic/gaps-state";

export interface AStarPaneState {
    initialBoard: Board<Card | null>,
    moves?: Array<Move>,
    playbackState: PlaybackState,
}

export function AStarGamePane({
    rules,
    state,
    onStateChange,
}: {
    rules: GameRules,
    state: AStarPaneState,
    onStateChange: (state: AStarPaneState) => void,
}): JSX.Element {
    const [loading, setLoading] = React.useState(false);

    if (!state.initialBoard) throw new Error("expected board to be defined");

    async function handleConfigurationSubmission(configuration: Configuration) {
        setLoading(true);

        // Leave enough time to React to update the state.
        // This does not guarantee a re-render before the calculation kicks off.
        // This is a hack. Ideally, we'd spawn a web worker for the calculation and use useEffect to
        // handle the communication with it.
        await new Promise(resolve => setTimeout(resolve, 100));

        const heuristicFn = (state: State<Board<Card | null>, Move>) => {
            const board: Board<Card | null> = state.get();
            const functions = [
                getCellCount(board) - findCorrectlyPlacedCards(board).length,
                getDeadGaps(board).length,
                findGaps(board, 2).length,
            ]
            const weights = [3, 5, 1];
            return functions.reduce((acc, val, idx) => acc + val * weights[idx], 0);
        }

        const astar = new AStar.AStarSearch(
            new GapsBoardState(rules, state.initialBoard),
            configuration.maxOpenSetSize,
            heuristicFn);
        const path = astar.findPath();

        console.log("path:", path);

        onStateChange({
            initialBoard: state.initialBoard,
            moves: path?.map(it => it.action),
            playbackState: state.playbackState,
        });
    }

    function handlePlaybackStateChange(playbackState: PlaybackState) {
        onStateChange({
            initialBoard: state.initialBoard,
            moves: state.moves,
            playbackState,
        });
    }

    const playbackBoard = React.useMemo(() => {
        const board = deriveBoard(state);
        const highlightedMove = getHighlightedMove(state.moves ?? [], state.playbackState);

        return { board, highlightedMove };
    }, [state]);

    return <>
        <ConfigurationBar disabled={loading} onConfigurationSubmission={handleConfigurationSubmission} />
        <PlaybackBoard board={playbackBoard.board} highlightedMove={playbackBoard.highlightedMove} />
        <GamePlaybackControls
            moves={state.moves ?? []}
            playbackState={state.playbackState}
            onPlaybackStateChange={handlePlaybackStateChange} />
    </>;
}

function buildDefaultState(initialBoard: Board<Card | null>): AStarPaneState {
    return {
        initialBoard,
        playbackState: { moveIndex: 'initial' },
    }
}

function deriveBoard(state: AStarPaneState): Board<Card | null> {
    return getBoardAtMove(state.initialBoard, state.moves ?? [], state.playbackState);
}

export const astarGamePane: GamePane<AStarPaneState> = {
    deriveBoard,
    buildDefaultState,
    render: AStarGamePane,
}
