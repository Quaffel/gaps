import { State } from "./state";

type Path<TState, TAction> = Array<{
    action: TAction,
    state: TState,
}>

export namespace AStar {
    class Node<TState, TAction> {
        state: State<TState, TAction>;
        parent: Node<TState, TAction> | null;
        action: TAction | null;
        g: number; // Cost from the start node
        h: number; // Heuristic estimate of cost to goal
        f: number; // Estimated total cost (f = g + h)
        depth: number;

        constructor(state: State<TState, TAction>, parent: Node<TState, TAction> | null, action: TAction | null = null, g: number = 0, h: number = 0, depth: number = 0) {
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
        private _openSet: Node<TState, TAction>[] = [];
        private _closedSet: Set<string> = new Set();
        private _maxDepth: number;
        private _bestNode: Node<TState, TAction> | null = null;
        private _heuristicFn: (state: State<TState, TAction>) => number;

        constructor(initialState: State<TState, TAction>, maxDepth: number, heuristicFn: (state: State<TState, TAction>) => number) {
            this._maxDepth = maxDepth;
            const rootNode = new Node(initialState, null, null, 0, initialState.getScore(), 0);
            this._openSet.push(rootNode);
            this._heuristicFn = heuristicFn;
        }

        // Helper function to find a node in a set based on its state
        findNodeInSet(nodeSet: Node<TState, TAction>[], state: State<TState, TAction>): Node<TState, TAction> | undefined {
            return nodeSet.find(n => {
                return n.state.equals(state)
            });
        }

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
            while (this._openSet.length > 0 && this._openSet.length < this._maxDepth) {
                // Sort openSet by f value and pick the node with the lowest f
                this._openSet.sort((a, b) => a.f - b.f);
                let currentNode = this._openSet.shift()!;

                // If the goal is reached, reconstruct the path
                if (currentNode.state.isSolved()) {
                    return this.reconstructPath(currentNode);
                }

                this._closedSet.add(currentNode.state.hash());

                currentNode.state.getPossibleActions().forEach(action => {
                    let newState = currentNode.state.withActionApplied(action);
                    const hash = newState.hash();

                    if (this._closedSet.has(hash)) {
                        return; // Skip expansion if the new state is already in closedSet
                    }
                    
                    let newG = currentNode.g + 1;
                    let newH = this._heuristicFn(newState);
                    let newNode = new Node(newState, currentNode, action, newG, newH, currentNode.depth + 1);

                    // Check if the new node is the best node found so far
                    if (this._bestNode == null || newNode.f < this._bestNode.f) {
                        this._bestNode = newNode;
                    }

                    if (!this._openSet.some(n => n.state.equals(newState) && n.g <= newG)) {
                        this._openSet.push(newNode);
                    } else {
                        return; // Skip expansion if the new state is already in openSet with a lower g value
                    }
                });
            }

            if (this._bestNode != null) {
                return this.reconstructPath(this._bestNode); // Skip the root node
            }

            return null; // No path found
        }
    }
}