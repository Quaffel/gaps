import { PlainButton } from "../../common/plain-button";
import { VerticalBar } from "../../common/vertical-bar";
import { buildIntegerRangeValidator, useValidatedNumberInput } from "../common/validated-input";
import { Configuration } from "./configuration";

export function ConfigurationBar({
    disabled,
    score,
    onConfigurationSubmission,
}: {
    score: number,
    disabled?: boolean,
    onConfigurationSubmission(submission: Configuration): void,
}): JSX.Element {
    const [configElement, config] = useMctsConfiguration();

    function handleSubmission() {
        if (config === null) throw new Error("unreachable (button should not be active)");
        onConfigurationSubmission(config);
    }

    return <VerticalBar>
        <div>
            <label>Monte-Carlo Tree Search</label>
            {configElement}
            <PlainButton disabled={disabled || config === null} onClick={handleSubmission}>Apply</PlainButton>
        </div>
        <div>
            <strong>Score</strong> {score.toFixed(2)}
        </div>
    </VerticalBar>;
}

function useMctsConfiguration(): [JSX.Element, Configuration | null] {
    const [seedElement, seed] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 0, max: 100000 }),
        hint: "Seed",
        defaultValue: 0,
        valueRange: {
            min: 0,
            max: 100000,
        }
    });

    const [timeoutElement, timeout] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 600 }),
        hint: "Timeout in seconds",
        defaultValue: 60,
        valueRange: {
            min: 1,
            max: 600,
        }
    });

    const [maxIterationsElement, maxIterations] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 100000 }),
        hint: "Max iterations",
        defaultValue: 100,
        valueRange: {
            min: 1,
            max: 100000,
        }
    });


    const [maxDepthElement, maxDepth] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 100000 }),
        hint: "Max iterations",
        defaultValue: 100,
        valueRange: {
            min: 1,
            max: 100000,
        }
    });

    const configElement = <div className="option flex-row">
        <label>Timeout in seconds</label>
        {timeoutElement}
        <label>Max iterations</label>
        {maxIterationsElement}
        <label>Max depth</label>
        {maxDepthElement}
        <label>Seed</label>
        {seedElement}
    </div>;

    const config: Configuration | null = timeout !== null && seed !== null && maxIterations !== null && maxDepth !== null
        ? { timeout: timeout, seed: seed, maxIterations: maxIterations, maxDepth: maxDepth }
        : null;

    return [configElement, config];
}
