import { PseudoRandom } from "../pseudo-random";
import { State, Path } from "./state";

export namespace MCTS {
    /**
     * A Node in MCTS
     */
    class Node<TState, TAction> {
        state: State<TState, TAction>;
        parent: Node<TState, TAction> | null;
        action: TAction | null;
        visits: number;
        value: number;
        children: Node<TState, TAction>[];
        depth: number;
        score: number;

        constructor(state: State<TState, TAction>, parent: Node<TState, TAction> | null = null, action: TAction | null = null, visits: number = 0, value: number = 0, depth: number = 0) {
            this.state = state;
            this.parent = parent;
            this.action = action;
            this.visits = visits;
            this.value = value;
            this.children = [];
            this.depth = depth;
            this.score = state.getScore(true);
        }

        /**
         * A node is fully expanded of the state is solved or if we explored all its possible actions already
         * @returns True if it is fully expanded, false otherwise
         */
        isFullyExpanded(): boolean {
            return this.state.isSolved() || this.children.length === this.state.getPossibleActions().length;
        }

        /**
         * Modified UCB Formula to account for the heuristic value
         * @param cParam The parameters to balance exploration and explotation
         * @param hParam The weight of the heuristic, how much should it matter
         * @returns The best child of the node
         */
        bestChild(cParam: number = Math.sqrt(2), hParam: number = 0.2): Node<TState, TAction> | null {
            if (this.children.length === 0) return null;
            return this.children.reduce((bestChild, child) => {
                let ucb1 = (child.value / (child.visits + 1)) + cParam * Math.sqrt(2 * Math.log(this.visits + 1) / (child.visits + 1)) + hParam * child.score;
                return ucb1 > ((bestChild.value / (bestChild.visits + 1)) + cParam * Math.sqrt(2 * Math.log(this.visits + 1) / (bestChild.visits + 1))) ? child : bestChild;
            });
        }
    }

    export class MCTSSearch<TState, TAction> {
        private _root: Node<TState, TAction>;
        private _iterations: number;
        private _maxDepth: number;
        private _maxActions: number;
        private _timeout: number;

        constructor(initialState: State<TState, TAction>, iterations: number, maxDepth: number, maxActions: number = 4, timeout: number = 1000) {
            this._root = new Node(initialState);
            this._iterations = iterations;
            this._maxDepth = maxDepth;
            this._maxActions = maxActions;
            this._timeout = timeout;
        }

        /**
         * Select the best action index using a pseudo-random number generator
         * with a linearly decreasing probability for each action
         * @param seed The seed for the pseudo-random number generator
         * @param maxActions The maximum number of actions to select from
         * @returns The selected action index
         */
        private selectBestActionIndex(seed: number, maxActions: number): number {
            const pseudoRandom = new PseudoRandom(seed);
            const decraseWeights = pseudoRandom.getLinearlyDecreasingWeights(maxActions);
            const selectedIndex = pseudoRandom.nextWeighted(decraseWeights);
            return selectedIndex;
        }

        /**
         * Select the best child node from the given node using UCB1
         * @param node The node to select the best child from
         * @returns The selected child node
         */
        private select(node: Node<TState, TAction>): Node<TState, TAction> {
            // While the node is fully expanded and not a terminal node
            while (node.isFullyExpanded() && node.children.length > 0) {
                node = node.bestChild(0.3, 0.2)!;
            }
            return node;
        }

        /**
         * Expand the node by adding all possible actions
         * @param node The node to expand
         * @param seed The seed for the pseudo-random number generator
         * @returns The selected child node
         */
        private expand(node: Node<TState, TAction>, seed: number): Node<TState, TAction> {
            // Create a child node for each possible action
            const possibleActions = node.state.getPossibleActions();
            possibleActions.forEach(action => {
                const newState = node.state.withActionApplied(action);
                node.children.push(new Node(newState, node, action, 0, 0, node.depth + 1));
            });

            // If the node is a terminal node, return it
            if (node.children.length === 0) return node;

            // If the child node is a solution, return it
            const solutionNode = node.children.find(child => child.score === Infinity);
            if (solutionNode) return solutionNode;

            // Otherwise, sort the children by score
            node.children.sort((a, b) => {
                return b.score - a.score;
            });
            // Randomly sample one of the best children with a decreasing probability
            const index = this.selectBestActionIndex(seed, Math.min(this._maxActions, node.children.length));
            const selectedChild = node.children[index];
            return selectedChild;
        }

        /**
         * Simulate the game from the given node
         * @param node To node to launch the simulation from
         * @param seed The seed for the pseudo-random number generator
         * @returns The score of the simulation
         */
        private simulate(node: Node<TState, TAction>, seed: number): number {
            let currentState = node.state;
            let possibleActions = currentState.getPossibleActions();
            let depth = 0;

            // Repeat until we reach a leaf node or the max depth is reached
            // or no actions are available -> leaf node
            while (possibleActions.length > 0 && depth < this._maxDepth) {
                // Get the score of for every child node
                const scores = possibleActions.map(action => {
                    const newState = currentState.withActionApplied(action);
                    return newState.getScore(true);
                });

                // If we found the solution within the children, select this children and break the simulation loop
                const solutionAction = possibleActions.find((_, index) => scores[index] === Infinity);
                if (solutionAction) {
                    currentState = currentState.withActionApplied(solutionAction);
                    break;
                }

                // Otherwise, Randomly sample one of the best children with a decreasing probability
                const actionsSortedByScore = possibleActions.map((action, index) => ({ action, score: scores[index] })).sort((a, b) => b.score - a.score);
                const selectedIndex = this.selectBestActionIndex(seed+depth, Math.min(this._maxActions, actionsSortedByScore.length));
                const selectedAction = actionsSortedByScore[selectedIndex].action;
                currentState = currentState.withActionApplied(selectedAction);

                possibleActions = currentState.getPossibleActions();
                depth++;
            }

            return currentState.getScore(true);
        }

        /**
         * Backpropagate the informations
         * @param node The node to backpropagate from
         * @param reward The reward we obtained
         */
        private backpropagate(node: Node<TState, TAction>, reward: number): void {
            while (node !== null) {
                node.visits++;
                node.value += reward;
                node = node.parent!;
            }
        }

        /**
         * Find an optimal path the a potential solution
         * @param seed The seed of the experiment
         * @returns The path from the root node to the potential solution
         */
        public findPath(seed: number): Path<TState, TAction> | null {
            // Set a timeout
            const startTime = Date.now();
            const endTime = startTime + this._timeout * 1_000;

            // Iterate N times to discover the most of the state space
            let i = 0;
            while (i < this._iterations && Date.now() < endTime) {
                let node = this.select(this._root);
                node = this.expand(node, seed+i);
                const reward = this.simulate(node, seed+i);
                this.backpropagate(node, reward);
                i++;
            }

            // If no children are available, return nothing
            if (this._root.children.length === 0) return null;

            // Recursively select the best children based on its value (backpropagated reward),
            // construct the path from this best child to the best leaf
            let bestChild = this._root;
            const path: Path<TState, TAction> = [];
            while (bestChild.children.length > 0) {
                bestChild = bestChild.children.reduce((bestChild, child) => {
                    return child.value > bestChild.value ? child : bestChild;
                });
                path.push({
                    state: bestChild.state.get(),
                    action: bestChild.action!
                });
            }

            // Return the path
            return path;
        }
    }
}
