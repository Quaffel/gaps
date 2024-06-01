import React from "react";
import { Board } from "../../../board";
import { Card } from "../../../cards";
import { GameRules, Move } from "../../../game";
import { GapsBoardState } from "../../../logic/gaps-state";
import { MCTS } from "../../../logic/solver/mcts";
import { Path } from "../../../logic/solver/state";
import { Configuration } from "../../configuration/mcts/configuration";
import { ConfigurationBar } from "../../configuration/mcts/configuration-bar";
import { PlaybackState, getBoardAtMove, getHighlightedMove } from "../../game/playback";
import { PlaybackBoard } from "../../game/playback-board";
import { GamePlaybackControls } from "../../game/playback-controls";
import { GamePane } from "./common";

export interface MctsPaneState {
    initialBoard: Board<Card | null>,
    moves?: Array<Move>,
    playbackState: PlaybackState,
}

export function MctsGamePane({
    rules,
    state,
    onStateChange,
}: {
    rules: GameRules,
    state: MctsPaneState,
    onStateChange: (state: MctsPaneState) => void,
}): JSX.Element {
    const [loading, setLoading] = React.useState(false);

    if (!state.initialBoard) throw new Error("expected board to be defined");

    async function handleConfigurationSubmission(configuration: Configuration) {
        setLoading(true);

        // Leave enough time to React to update the state.
        // This does not guarantee a re-render before the calculation kicks off.
        // This is a hack. Ideally, we"d spawn a web worker for the calculation and use useEffect to
        // handle the communication with it.
        await new Promise(resolve => setTimeout(resolve, 100));

        const mcts = new MCTS.MCTSSearch<Board<Card | null>, Move>(
            state => state.getScore(),
            1.41,
            configuration.seed
        );

        const path: Path<Board<Card | null>, Move> = [];
        let board = state.initialBoard;

        const startTime = Date.now();
        const endTime = startTime + configuration.timeout * 1000;

        while (Date.now() < endTime) {
            const { done, element } = mcts.findNextMove(
                new GapsBoardState(rules, board),
                configuration.maxIterations
            );

            board = element.state;
            path.push(element);

            if (done) {
                break;
            }
        }

        console.log("path", path);

        onStateChange({
            initialBoard: state.initialBoard,
            playbackState: state.playbackState,
            moves: path?.map(it => it.action)
        });
    }

    function handlePlaybackStateChange(playbackState: PlaybackState) {
        onStateChange({
            initialBoard: state.initialBoard,
            playbackState,
            moves: state.moves,
        });
    }

    const playbackBoard = React.useMemo(() => {
        const board = deriveBoard(state);
        const highlightedMove = getHighlightedMove(state.moves ?? [], state.playbackState);

        return { board, highlightedMove };
    }, [state]);

    // const seed = React.useMemo(() => {
    //     return getSeedOfBoard(playbackBoard.board);
    // }, [playbackBoard.board]);

    const score = React.useMemo(() => {
        return rules.getScore(playbackBoard.board);
    }, [rules, playbackBoard.board]);

    return <>
        <ConfigurationBar score={score} disabled={loading} onConfigurationSubmission={handleConfigurationSubmission} />
        <PlaybackBoard board={playbackBoard.board} highlightedMove={playbackBoard.highlightedMove} />
        <GamePlaybackControls
            moves={state.moves ?? []}
            playbackState={state.playbackState}
            onPlaybackStateChange={handlePlaybackStateChange} />
    </>;
}

function buildDefaultState(initialBoard: Board<Card | null>): MctsPaneState {
    return {
        initialBoard,
        playbackState: { moveIndex: "initial" },
    }
}

function deriveBoard(state: MctsPaneState): Board<Card | null> {
    return getBoardAtMove(state.initialBoard, state.moves ?? [], state.playbackState);
}

export const mctsGamePane: GamePane<MctsPaneState> = {
    deriveBoard,
    buildDefaultState,
    render: MctsGamePane,
}
