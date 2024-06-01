import React from "react";

import "./vertical-bar.css";

export function VerticalBar({
    children,
}: React.PropsWithChildren): JSX.Element {
     return <div className="vertical-bar">
        {children}
    </div>;
}
