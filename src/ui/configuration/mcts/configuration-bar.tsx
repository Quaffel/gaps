import { PlainButton } from "../../common/plain-button";
import { VerticalBar } from "../../common/vertical-bar";
import { buildIntegerRangeValidator, useValidatedNumberInput } from "../common/validated-input";
import { Configuration } from "./configuration";

export function ConfigurationBar({
    disabled,
    onConfigurationSubmission,
}: {
    disabled?: boolean,
    onConfigurationSubmission(submission: Configuration): void,
}): JSX.Element {
    const [configElement, config] = useMctsConfiguration();

    function handleSubmission() {
        if (config === null) throw new Error("unreachable (button should not be active)");
        onConfigurationSubmission(config);
    }

    return <VerticalBar>
        <label>Monte-Carlo Tree Search</label>
        {configElement}
        <PlainButton disabled={disabled || config === null} onClick={handleSubmission}>Apply</PlainButton>
    </VerticalBar>;
}

function useMctsConfiguration(): [JSX.Element, Configuration | null] {
    const [iterationsElement, maxIterations] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 1_000_000 }),
        hint: "max iterations",
        defaultValue: 10_000,
        valueRange: {
            min: 1,
            max: 1_000_000,
        }
    });

    const [depthElement, maxDepth] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 1_000_000 }),
        hint: "max depth",
        defaultValue: 10_000,
        valueRange: {
            min: 1,
            max: 1_000_000,
        }
    });

    const configElement = <div className="option flex-row">
        <label>Iterations</label>
        {iterationsElement}
        <label>Depth</label>
        {depthElement}
    </div>;

    const config: Configuration | null = maxIterations !== null && maxDepth !== null
        ? { maxIterations, maxDepth }
        : null;

    return [configElement, config];
}
