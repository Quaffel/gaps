// Evaluates to the component type of an array. Use 'as const' in constant array declarations to ensure
// that the array's component type is inferred as a union of literal types.
export type ComponentType<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
    ? ElementType
    : never;

export function assertType<T>(_value: T) {}
