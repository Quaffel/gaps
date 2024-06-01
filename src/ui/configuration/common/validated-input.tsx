import React from "react";

import "./validated-input.css";

type Validator<T> = (input: T) => boolean;

export function buildIntegerRangeValidator(valueRange: { min: number, max: number }): Validator<number> {
    return input => {
        return input >= valueRange.min && input <= valueRange.max;
    }
}

export function useValidatedTextInput({
    validator,
    hint,
    placeholder,
}: {
    validator: Validator<string>,
    hint?: string,
    placeholder?: string,
}): [JSX.Element, string | null] {
    const [content, setContent] = React.useState<{
        text: string,
        validValueOrNull: string | null,
    }>({ text: "", validValueOrNull: null });

    const element = React.useRef<HTMLInputElement | null>(null)

    function handleContentChange(updatedContent: string) {
        // TODO: Debounce calls to validator
        const valid = validator(updatedContent);

        setContent({
            text: updatedContent,
            validValueOrNull: valid ? updatedContent : null,
        });

        element.current?.setCustomValidity(valid ? "" : (hint ?? "invalid"));
    }

    const inputElement = <input
        placeholder={placeholder}
        type="text"
        ref={element}
        onInput={e => handleContentChange(e.currentTarget.value!)}
    />

    return [inputElement, content.validValueOrNull];
}


export function useValidatedNumberInput({
    validator,
    defaultValue,
    valueRange,
    hint,
    placeholder,
}: {
    validator: Validator<number>,
    defaultValue?: number,
    valueRange: { min: number, max: number }
    hint?: string,
    placeholder?: string,
}): [JSX.Element, number | null] {
    const [content, setContent] = React.useState<{
        text: string,
        validValueOrNull: number | null,
    }>(defaultValue === undefined ? {
        text: "",
        validValueOrNull: null,
    } : {
        text: defaultValue.toString(10),
        validValueOrNull: defaultValue,
    });

    const element = React.useRef<HTMLInputElement | null>(null)

    function handleContentChange(updatedContent: string) {
        const numericValue = parseInt(updatedContent, 10);
        const valid = !isNaN(numericValue)
            && numericValue.toString(10).length === updatedContent.length
            && validator(numericValue);

        setContent({
            text: updatedContent,
            validValueOrNull: valid ? numericValue : null,
        });

        element.current?.setCustomValidity(valid ? "" : (hint ?? "invalid"));
    }

    const inputElement = <input
        value={content.text}
        placeholder={placeholder}
        type="number"
        ref={element}
        min={valueRange.min}
        max={valueRange.max}
        onInput={e => handleContentChange(e.currentTarget.value!)}
    />

    return [inputElement, content.validValueOrNull];
}
