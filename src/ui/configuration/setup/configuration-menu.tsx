import React from "react";
import { Configuration } from "./configuration";
import { LabeledRuler } from "../../common/labeled-ruler";
import { getBoardOfSeed } from "../../../seed";
import { buildIntegerRangeValidator, useValidatedNumberInput, useValidatedTextInput } from "../common/validated-input";

import "./configuration-menu.css";
import { PlainButton } from "../../common/plain-button";


export function ConfigurationMenu({
    onConfigurationSubmission,
}: {
    onConfigurationSubmission(configuration: Configuration): void,
}) {
    const [configElement, config] = useConfiguration();

    function handleSubmission() {
        if (config === null) throw new Error("unreachable (button should not be active)");
        onConfigurationSubmission(config);
    }

    return <div className="configuration-menu">
        {configElement}

        <PlainButton disabled={config === null} onClick={handleSubmission}>Submit</PlainButton>
    </div>
}

export function useConfiguration(): [JSX.Element, Configuration | null] {
    const [rowsElement, rows] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 4 }),
        valueRange: { min: 1, max: 4 },
        hint: "from 1 to 4",
        placeholder: "from 1 to 4"
    });

    const [columnsElement, columns] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 13 }),
        valueRange: { min: 1, max: 13 },
        hint: "from 1 to 13",
        placeholder: "from 1 to 13"
    });

    const [seedElement, seed] = useValidatedNumberInput({
        validator: buildIntegerRangeValidator({ min: 1, max: 100000 }),
        valueRange: { min: 0, max: 100000 },
        hint: "42",
        placeholder: "42"
    });

    const [gameSeedElement, gameSeed] = useValidatedTextInput({
        validator: (input: string) => getBoardOfSeed(input) !== null,
        hint: "3.10 0.0 0.1 ...",
        placeholder: "3.10 0.0 0.1 ...",
    });

    const configuration = React.useMemo<Configuration | null>(() => {
        if (rows !== null && columns !== null) {
            return {
                boardGeneration: {
                    method: "random",
                    dimensions: {
                        columns,
                        rows,
                    },
                    seed: seed ?? 42,
                }
            };
        }

        // if (gameSeed !== null) {
        //     return {
        //         boardGeneration: {
        //             method: "seed",
        //             seed: gameSeed,
        //         }
        //     }
        // }

        return null;
    }, [rows, columns, seed]);

    const menuElement = <div className="option-group flex-column">
        <label>Random board generation</label>

        <div className="option">
            <label>Rows</label>
            {rowsElement}
        </div>

        <div className="option">
            <label>Columns</label>
            {columnsElement}
        </div>

        <div className="option">
            <label>Seed</label>
            {seedElement}
        </div>

        {/* <LabeledRuler label="or" />

        <label>Load board from seed</label>

        <div className="option">
            <label htmlFor="seed">Seed</label>
            {gameSeedElement}
        </div> */}
    </div >;

    return [menuElement, configuration];
}
