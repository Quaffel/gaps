import './plain-button.css';

export function PlainButton(
    options: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
): JSX.Element {
    return <button {...options}
        className={["plain-button", options.className].join(" ")}>
        {options.children}
    </button>;
}
