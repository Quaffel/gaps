import { ActionPathElement, State } from "./state";
import { PseudoRandom } from "../pseudo-random";

export namespace MCTS {
    class Node<TState, TAction> {
        state: State<TState, TAction>;
        parent: Node<TState, TAction> | null;
        children: Node<TState, TAction>[];
        action: TAction | null;
        wins: number = 0;
        visits: number = 0;
        actions: Array<TAction>;
        untriedActions: TAction[];

        constructor(state: State<TState, TAction>, parent: Node<TState, TAction> | null, action: TAction | null = null) {
            this.state = state;
            this.parent = parent;
            this.action = action;
            this.children = [];
            this.actions = state.getPossibleActions();
            this.untriedActions = structuredClone(this.actions);
        }

        isFullyExpanded(): boolean {
            return this.untriedActions.length === 0 && this.children.length > 0;
        }

        bestChild(cParam: number = 1.41): Node<TState, TAction> {
            return this.children.reduce((prev, current) => {
                const prevScore = prev.wins / prev.visits + cParam * Math.sqrt(Math.log(this.visits) / prev.visits);
                const currentScore = current.wins / current.visits + cParam * Math.sqrt(Math.log(this.visits) / current.visits);
                return prevScore > currentScore ? prev : current;
            });
        }

        expand(): Node<TState, TAction> {
            const action = this.untriedActions.pop()!;
            const newState = this.state.withActionApplied(action);
            const childNode = new Node(newState, this, action);
            this.children.push(childNode);
            return childNode;
        }
    }

    export class MCTSSearch<TState, TAction> {
        private _cParam: number;
        private _scoreFn: (state: State<TState, TAction>) => number;
        private _pseudoRandom: PseudoRandom;

        constructor(
            scoreFn: (state: State<TState, TAction>) => number,
            c: number = 1.41,
            seed: number = 0
        ) {
            this._cParam = c;
            this._scoreFn = scoreFn;
            this._pseudoRandom = new PseudoRandom(seed);
        }

        selectPromisingNode(node: Node<TState, TAction>): Node<TState, TAction> {
            while (node.isFullyExpanded()) {
                node = node.bestChild(this._cParam);
            }
            return node;
        }

        simulateRandomPlayout(node: Node<TState, TAction>): number {
            let state = node.state;
            let possibleActions: TAction[] = node.actions;

            while (possibleActions.length > 0) {
                const randomAction = this._pseudoRandom.nextInt(possibleActions.length);
                const action = possibleActions[randomAction];
                state = state.withActionApplied(action);
                possibleActions = state.getPossibleActions();
            }

            return this._scoreFn(state);
        }

        backPropagate(node: Node<TState, TAction>, reward: number): void {
            while (node != null) {
                node.visits++;
                node.wins += reward;
                node = node.parent!;
            }
        }

        findNextMove(
            rootState: State<TState, TAction>,
            iterationCount: number
        ): {
            done: boolean,
            element: ActionPathElement<TState, TAction>
        } {
            const root = new Node(rootState, null);

            for (let i = 0; i < iterationCount; i++) {
                let promisingNode = this.selectPromisingNode(root);
                if (promisingNode.actions.length > 0) {
                    promisingNode = promisingNode.expand();
                }

                const playoutResult = this.simulateRandomPlayout(promisingNode);
                this.backPropagate(promisingNode, playoutResult);
            }

            const bestActionNode = root.bestChild(0);
            return {
                done: bestActionNode.actions.length === 0,
                element: {
                    state: bestActionNode.state.get(),
                    action: bestActionNode.action!,
                }
            };
        }
    }
}
