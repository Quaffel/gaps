import { Resource, getResourcePath } from '../resources';

import './decorated-button.css';

export function DecoratedButton({
    label,
    icon,
    disabled,
    selected,
    onSelect
}: {
    label: string,
    icon: Resource,
    disabled?: boolean,
    selected?: boolean,
    onSelect?: () => void,
    }): JSX.Element {
    const classes = ['decorated-button'];
    if (selected) classes.push('selected');

    return <button
        className={classes.join(" ")}
        type='button'
        disabled={disabled || selected}
        onClick={() => onSelect?.()}>
        {/* Buttons are replaced elements, meaning that CSS layout rules do not apply.  
            As buttons center their contents by default, we instead use a wrapping 'div' element of
            equal size and do the layouting within the inner 'div' element. */}

        <img width={30} src={getResourcePath(icon)} alt="" />
        <div>{label}</div>
    </button>
}
