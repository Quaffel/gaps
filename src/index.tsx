import React from 'react';
import ReactDOM from 'react-dom/client';

import { Configuration, deriveBoardFromConfiguration } from './ui/configuration/setup/configuration';
import { solitaireGapsRules } from './logic/rules';
import { SelectionBar } from './ui/menu/selection-bar';
import { ConfigurationPane } from './ui/pane/setup';
import { Pane, PaneName, PaneState, gamePanes } from './ui/pane/game/common';
import { InteractiveGamePane } from './ui/pane/game/interactive-game';
import { AStarGamePane } from './ui/pane/game/astar-game';
import { MctsGamePane } from './ui/pane/game/mcts-game';
import { getResourcePath } from './ui/resources';

import './index.css';

const repositoryUrl = process.env.REACT_APP_REPOSITORY_URL;
console.log("source code is hosted @ ", repositoryUrl)

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode >
);

type Paane = {
    name: 'configuration',
} | {
    name: 'game',
    configuration: Configuration,
}

// TODO: Configuration pane was previously child of session, which ensured that configuration menu was centered

function App(): JSX.Element {
    const [pane, setPane] = React.useState<Paane>({ name: 'configuration' });
    const [display, setDisplay] = React.useState<PaneName>('interactive');

    function handleConfigurationCompletion(configuration: Configuration) {
        setPane({
            name: 'game',
            configuration,
        });
    }

    function handleDisplaySelection(display: PaneName) {
        setDisplay(display);
    }

    const paneElement = (() => {
        switch (pane.name) {
            case 'configuration':
                return <ConfigurationPane onConfigurationCompletion={handleConfigurationCompletion} />;
            case 'game':
                return <GameSession display={display} configuration={pane.configuration} />
        }
    })();

    // GameSession, AStarGame

    return <>
        <header>
            <span>Gaps</span>
            <SelectionBar options={[
                {
                    id: 'interactive',
                    label: "Play",
                    icon: 'icon-feather/play',
                }, {
                    id: 'astar',
                    label: "Solve with A*",
                    icon: 'icon-feather/star',
                }, {
                    id: 'mcts',
                    label: "Solve with MCTS",
                    icon: 'icon-feather/git-merge',
                }]}
                selectedOption={display}
                onSelect={handleDisplaySelection}
                disabled={pane.name !== 'game'} />

            <a href={repositoryUrl}>
                <img src={getResourcePath('icon-feather/github')} alt='go to GitHub repository' />
            </a>
        </header>
        <main>
            {paneElement}
        </main>
    </>
}

interface Session<TPane extends PaneName = PaneName> {
    display: TPane,
    state: PaneState<TPane>,
}

function GameSession({
    configuration,
    display,
}: {
    configuration: Configuration,
    display: PaneName,
}): JSX.Element {
    const [session, setSession] = React.useState<Session>(() => {
        const initialBoard = deriveBoardFromConfiguration(configuration);

        const interactiveSession: Session<'interactive'> = {
            display: 'interactive',
            state: {
                currentBoard: initialBoard,
            },
        }
        return interactiveSession;
    });

    const state = React.useMemo(() => {
        const displayPane: Pane<any> = gamePanes[display];
        const sessionPane: Pane<any> = gamePanes[session.display];

        if (display === session.display)
            return session.state;

        const board = sessionPane.deriveBoard(session.state);
        return displayPane.buildDefaultState(board);
    }, [session, display]);

    return (() => {
        switch (display) {
            case 'interactive':
                return <InteractiveGamePane
                    rules={solitaireGapsRules}
                    state={state as PaneState<'interactive'>}
                    onStateChange={state => {
                        const interactiveSession: Session<'interactive'> = { display, state };
                        setSession(interactiveSession);
                    }} />
            case 'astar':
                return <AStarGamePane
                    rules={solitaireGapsRules}
                    state={state}
                    onStateChange={state => {
                        const interactiveSession: Session<'astar'> = { display, state };
                        setSession(interactiveSession);
                    }} />
            case 'mcts':
                return <MctsGamePane
                    rules={solitaireGapsRules}
                    state={state}
                    onStateChange={state => {
                        const interactiveSession: Session<'mcts'> = { display, state };
                        setSession(interactiveSession);
                    }} />
        }
    })();
}
