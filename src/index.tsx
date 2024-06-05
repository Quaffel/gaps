import React from "react";
import ReactDOM from "react-dom/client";

import { solitaireGapsRules } from "./logic/rules";
import { Configuration, deriveBoardFromConfiguration } from "./ui/configuration/setup/configuration";
import { SelectionBar } from "./ui/menu/selection-bar";
import { AStarGamePane } from "./ui/pane/game/astar-game";
import { GamePane, GamePaneState, GamePaneType, gamePanes } from "./ui/pane/game/common";
import { InteractiveGamePane } from "./ui/pane/game/interactive-game";
import { MctsGamePane } from "./ui/pane/game/mcts-game";
import { SetupPane } from "./ui/pane/setup";
import { getResourcePath } from "./ui/resources";

import "./index.css";
import { GreedyGamePane } from "./ui/pane/game/greedy-game";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode >
);

type Pane = {
    name: "setup",
} | {
    name: "game",
    type: GamePaneType
    configuration: Configuration,
}

function App(): JSX.Element {
    const [pane, setPane] = React.useState<Pane>({ name: "setup" });

    function handleSetupCompletion(configuration: Configuration) {
        setPane({
            name: "game",
            type: "interactive",
            configuration,
        });
    }

    function handleDisplaySelection(display: GamePaneType) {
        if (pane.name !== "game") throw new Error("unreachable (component should not be active)");

        setPane({
            name: pane.name,
            type: display,
            configuration: pane.configuration
        });
    }

    const paneElement = (() => {
        switch (pane.name) {
            case "setup":
                return <SetupPane onSetupCompletion={handleSetupCompletion} />;
            case "game":
                return <GameSession display={pane.type} configuration={pane.configuration} />
        }
    })();

    return <>
        <header>
            <span>Gaps</span>
            <SelectionBar options={[
                {
                    id: "interactive",
                    label: "Play yourself",
                    icon: "icon-feather/play",
                }, {
                    id: "astar",
                    label: "Solve with A*",
                    icon: "icon-feather/star",
                },
                {
                    id: "greedy",
                    label: "Solve with Greedy BFS",
                    icon: "icon-feather/star",
                },
                {
                    id: "mcts",
                    label: "Solve with MCTS",
                    icon: "icon-feather/git-merge",
                }]}
                selectedOption={pane.name === "game" ? pane.type : "interactive"}
                onSelect={handleDisplaySelection}
                disabled={pane.name !== "game"} />

            <a href={__REPOSITORY_URL__}>
                <img src={getResourcePath("icon-feather/github")} alt="go to GitHub repository" />
            </a>
        </header>
        <main>
            {paneElement}
        </main>
    </>
}

interface Session<TPane extends GamePaneType = GamePaneType> {
    display: TPane,
    state: GamePaneState<TPane>,
}

function GameSession({
    configuration,
    display,
}: {
    configuration: Configuration,
    display: GamePaneType,
}): JSX.Element {
    const [session, setSession] = React.useState<Session>(() => {
        const initialBoard = deriveBoardFromConfiguration(configuration);

        const interactiveSession: Session<"interactive"> = {
            display: "interactive",
            state: {
                currentBoard: initialBoard,
            },
        }
        return interactiveSession;
    });

    const state = React.useMemo(() => {
        const displayPane: GamePane<any> = gamePanes[display];
        const sessionPane: GamePane<any> = gamePanes[session.display];

        if (display === session.display)
            return session.state;

        const board = sessionPane.deriveBoard(session.state);
        return displayPane.buildDefaultState(board);
    }, [session, display]);

    return (() => {
        switch (display) {
            case "interactive":
                return <InteractiveGamePane
                    rules={solitaireGapsRules}
                    state={state as GamePaneState<"interactive">}
                    onStateChange={state => {
                        const interactiveSession: Session<"interactive"> = { display, state };
                        setSession(interactiveSession);
                    }} />
            case "astar":
                return <AStarGamePane
                    rules={solitaireGapsRules}
                    state={state}
                    onStateChange={state => {
                        const interactiveSession: Session<"astar"> = { display, state };
                        setSession(interactiveSession);
                    }} />
            case "greedy":
                return <GreedyGamePane
                    rules={solitaireGapsRules}
                    state={state}
                    onStateChange={state => {
                        const interactiveSession: Session<"greedy"> = { display, state };
                        setSession(interactiveSession);
                    }} />
            case "mcts":
                return <MctsGamePane
                    rules={solitaireGapsRules}
                    state={state}
                    onStateChange={state => {
                        const interactiveSession: Session<"mcts"> = { display, state };
                        setSession(interactiveSession);
                    }} />
        }
    })();
}
