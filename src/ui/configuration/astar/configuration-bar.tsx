import { PlainButton } from "../../common/plain-button";
import { VerticalBar } from "../../common/vertical-bar";
import { buildIntegerRangeValidator, useValidatedNumberInput } from "../common/validated-input";
import { Configuration } from "./configuration";

export function ConfigurationBar({
    disabled,
    seed,
    score,
    onConfigurationSubmission,
}: {
    seed: string,
    score: number,
    disabled?: boolean,
    onConfigurationSubmission(submission: Configuration): void,
}): JSX.Element {
    const [configElement, config] = useAStarConfiguration();

    function handleSubmission() {
        if (config === null) throw new Error("unreachable (button should not be active)");
        onConfigurationSubmission(config);
    }

    return <VerticalBar>
        <div>
            <label>A* (A-Star)</label>
            {configElement}
            <PlainButton disabled={disabled || config === null} onClick={handleSubmission}>Apply</PlainButton>
        </div>
        <div>
            <strong>Score:</strong> {score.toFixed(2)}
            {/* <strong>Seed:</strong> {seed} */}
        </div>
    </VerticalBar>;
}

function useAStarConfiguration(): [JSX.Element, Configuration | null] {
    const [timeoutElement, timeout] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 600 }),
        hint: "Timeout in seconds",
        defaultValue: 60,
        valueRange: {
            min: 1,
            max: 600,
        }
    });

    const configElement = <div className="option flex-row">
        <label>Timeout in seconds</label>
        {timeoutElement}
    </div>;

    const config: Configuration | null = timeout !== null
        ? { timeout: timeout }
        : null;

    return [configElement, config];
}
