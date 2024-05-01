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
    const [configElement, config] = useAStarConfiguration();

    function handleSubmission() {
        if (config === null) throw new Error("unreachable (button should not be active)");
        onConfigurationSubmission(config);
    }

    return <VerticalBar>
        <label>A* (A-Star)</label>
        {configElement}
        <PlainButton disabled={disabled || config === null} onClick={handleSubmission}>Apply</PlainButton>
    </VerticalBar>;
}

function useAStarConfiguration(): [JSX.Element, Configuration | null] {
    const [setSizeElement, maxOpenSetSize] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 1_000_000 }),
        hint: "maximum open set size",
        defaultValue: 10_000,
        valueRange: {
            min: 1,
            max: 1_000_000,
        }
    });

    const configElement = <div className="option flex-row">
        <label>Maximum open set size</label>
        {setSizeElement}
    </div>;

    const config: Configuration | null = maxOpenSetSize !== null
        ? { maxOpenSetSize }
        : null;

    return [configElement, config];
}
