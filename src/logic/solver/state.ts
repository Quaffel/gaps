export interface ActionPathElement<TState, TAction> {
    state: TState,
    action: TAction,
}

export type Path<TState, TAction> = Array<ActionPathElement<TState, TAction>>;

export interface State<TState, TAction> {
    get(): TState;

    withActionApplied(action: TAction): State<TState, TAction>;
    getPossibleActions(): TAction[];
    isSolved(): boolean;
    getScore(normalize: boolean): number;
    equals(other: State<TState, TAction>): boolean;
    hash(): string;
}
