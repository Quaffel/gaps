import { DecoratedButton } from "../common/decorated-button";
import { Resource } from "../resources";

import './selection-bar.css';

interface Option<TName extends string> {
    id: TName,
    label: string,
    icon: Resource,
}

export function SelectionBar<TOptions extends string>({
    disabled,
    options,
    selectedOption,
    onSelect,
}: {
    disabled?: boolean,
    options: Array<Option<TOptions>>,
    selectedOption: NoInfer<TOptions>,
    onSelect(id: NoInfer<TOptions>): void,
}) {
    function selectOption(optionId: TOptions): void {
        if (optionId === selectedOption)
            throw new Error("unreachable (button should not be active)");

        console.log(`selected option '${optionId}'`)
        onSelect(optionId);
    }

    return <nav>
        {options.map((option) => <DecoratedButton
            key={option.id}
            label={option.label}
            icon={option.icon}
            disabled={disabled}
            selected={option.id === selectedOption}
            onSelect={() => selectOption(option.id)} />)}
    </nav>;
}
