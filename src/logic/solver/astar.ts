import { Path, State } from "./state";

export namespace AStar {
    /**
     * Node class for A* search
     */
    class Node<TState, TAction> {
        // Parent node
        parent: Node<TState, TAction> | null;
        // State of the node
        state: State<TState, TAction>;
        // Action that led to this node
        action: TAction | null;
        // Number of steps from the start node
        depth: number;
        // Cost from the start node
        g: number;
        // Heuristic estimate of cost to goal
        h: number;
        // Estimated total cost (f = g + h)
        f: number;

        constructor(state: State<TState, TAction>, parent: Node<TState, TAction> | null, action: TAction | null = null, g: number = 0, h: number = 0, depth: number = 1) {
            this.state = state;
            this.parent = parent;
            this.action = action;
            this.g = g;
            this.h = h;
            this.f = g + h;
            this.depth = depth;
        }
    }

    export class AStarSearch<TState, TAction> {
        // Open set is a priority queue
        private _openSet: Node<TState, TAction>[] = [];
        // Closed set is a set of states
        private _closedSet: Set<string> = new Set();
        // Best node found so far
        private _bestNode: Node<TState, TAction> | null = null;
        // Heuristic function (h value)
        private _heuristic: (state: State<TState, TAction>) => number;
        // Cost function (g value)
        private _cost: (state: State<TState, TAction>) => number;
        // Timeout in seconds
        private _timeout: number;

        constructor(initialState: State<TState, TAction>, timeout: number, heuristic: (state: State<TState, TAction>) => number, cost: (state: State<TState, TAction>) => number = () => 0.0) {
            const rootNode = new Node(initialState, null, null, 0, heuristic(initialState), 0);
            this._openSet.push(rootNode);
            this._timeout = timeout;
            this._cost = cost;
            this._heuristic = heuristic;
        }

        /**
         * Reconstruct the path in a backward way from leaf node to root node
         * @param endNode The leaf node
         * @returns The path as a list of node, from the root to the leaf
         */
        private reconstructPath(endNode: Node<TState, TAction>): Path<TState, TAction> {
            let path: Path<TState, TAction> = [];
            let currentNode = endNode;

            while (currentNode != null) {
                path.unshift({ action: currentNode.action!, state: currentNode.state.get() });
                currentNode = currentNode.parent!;
            }

            return path.slice(1, path.length);
        }

        findPath(): Path<TState, TAction> | null {
            // Set a timeout
            const startTime = Date.now();
            const endTime = startTime + this._timeout * 1_000;

            while (this._openSet.length > 0 && Date.now() < endTime) {
                // Sort openSet by f value and pick the node with the lowest f
                this._openSet.sort((a, b) => a.f - b.f);
                // Expand the node with best F-score
                let currentNode = this._openSet.shift()!;

                // If the goal is reached, reconstruct the path
                if (currentNode.state.isSolved()) {
                    return this.reconstructPath(currentNode);
                }

                // Consider the node as being visited
                this._closedSet.add(currentNode.state.hash());

                // Explore each neighbors (children)
                const possibleActions = currentNode.state.getPossibleActions();
                for (let action of possibleActions) {
                    // Create the neighbor state by applying the corresponding action
                    let newState = currentNode.state.withActionApplied(action);
                    const hash = newState.hash();

                    // This checks if the new state is already in closedSet, it is based on the hash of the state
                    // meaning that it will avoid loops in the path
                    if (this._closedSet.has(hash)) {
                        continue; // Skip expansion if the new state is already in closedSet
                    }

                    // Compute the new F-Score
                    let newG = currentNode.g + this._cost(newState);
                    let newH = this._heuristic(newState);
                    let newNode = new Node(newState, currentNode, action, newG, newH, currentNode.depth + 1);

                    // Check if the new node is the best node found so far
                    if (this._bestNode == null || newNode.f < this._bestNode.f) {
                        this._bestNode = newNode;
                    }

                    if (!this._openSet.some(n => n.state.equals(newState) && n.g <= newG)) {
                        // Update the the node with new F-score if it's higher and with the new parent
                        this._openSet.push(newNode);
                    } else {
                        // Skip expansion if the new state is already in openSet with a lower g value
                        continue;
                    }
                }
            }

            // If this is reached, it means that the openSet is empty and no path was found
            // therfore we return the best node found so far
            if (this._bestNode != null) {
                return this.reconstructPath(this._bestNode); 
            }
            
            // No path found
            return null; 
        }
    }
}
