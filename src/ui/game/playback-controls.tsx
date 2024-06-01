import { Move } from "../../game";
import { ComponentType } from "../../util/types";
import { getResourcePath } from "../resources";
import { MoveIndex, PlaybackState } from "./playback";

import "./playback-controls.css";

const ActionValues = ["play", "pause", "fast-forward", "rewind", "skip-forward", "skip-back"] as const;
type Action = ComponentType<typeof ActionValues>;

export function GamePlaybackControls({
    moves,
    playbackState,
    onPlaybackStateChange,
}: {
    moves: Array<Move>,
    playbackState: PlaybackState,
    onPlaybackStateChange(playbackState: PlaybackState): void,
}): JSX.Element {
    const moveIndex = playbackState.moveIndex;
    if (typeof moveIndex === "number" && (moveIndex < 0 || moveIndex >= moves.length))
        throw new Error("displayed swap index is out of bounds");

    const movesAvailable = moves.length !== 0;

    function setMoveIndex(moveIndex: MoveIndex) {
        if (moveIndex === playbackState.moveIndex) return;

        onPlaybackStateChange({
            moveIndex,
        });
    }

    function showFirst() {
        if (!movesAvailable || moveIndex === "initial") throw new Error("unreachable (button should not be active)");
        setMoveIndex("initial");
    }

    function showLast() {
        if (!movesAvailable || moveIndex === "final") throw new Error("unreachable (button should not be active)");
        setMoveIndex("final");
    }

    function showNext() {
        if (!movesAvailable || moveIndex === "final") throw new Error("unreachable (button should not be active)");

        let nextDisplayState;
        if (moveIndex === "initial")
            nextDisplayState = 0;
        else if (moveIndex === moves.length - 1)
            nextDisplayState = "final" as const;
        else
            nextDisplayState = moveIndex + 1;

        setMoveIndex(nextDisplayState);
    }

    function showPrevious() {
        if (!movesAvailable || moveIndex === "initial") throw new Error("unreachable (button should not be active)");

        let previousDisplayState;
        if (moveIndex === "final")
            previousDisplayState = moves.length - 1;
        else if (moveIndex === 0)
            previousDisplayState = "initial" as const;
        else
            previousDisplayState = moveIndex - 1;

        setMoveIndex(previousDisplayState);
    }

    return <PlaybackControlsBar controls={[
        {
            action: "skip-back",
            enabled: movesAvailable && moveIndex !== "initial",
            onAction: () => showFirst(),
        }, {
            action: "rewind",
            enabled: movesAvailable && moveIndex !== "initial",
            onAction: () => showPrevious(),
        }, {
            action: "play",
            enabled: false,
        }, {
            action: "fast-forward",
            enabled: movesAvailable && moveIndex !== "final",
            onAction: () => showNext(),
        }, {
            action: "skip-forward",
            enabled: movesAvailable && moveIndex !== "final",
            onAction: () => showLast()
        }
    ]} />;
}

interface PlaybackControl {
    action: Action
    enabled: boolean
    onAction?: () => void
}

function PlaybackControlsBar({
    controls
}: {
    controls: Array<PlaybackControl>
}) {
    function getActionIcon(action: Action): string {
        return getResourcePath(`icon-feather/${action}`);
    }

    return <div className="playback-controls-bar">
        {controls.map(it => <button
            disabled={!it.enabled}
            onClick={() => it.onAction?.()}
            key={it.action}>
            <object data={getActionIcon(it.action)} type="image/svg+xml"></object>
        </button>)}
    </div>;
}
