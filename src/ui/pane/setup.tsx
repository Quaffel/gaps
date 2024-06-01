import { Configuration } from "../configuration/setup/configuration";
import { ConfigurationMenu } from "../configuration/setup/configuration-menu";

import "./setup.css";

export function SetupPane({
    onSetupCompletion,
}: {
    onSetupCompletion(configuration: Configuration): void,
}): JSX.Element {
    function handleConfigurationSubmission(configuration: Configuration) {
        onSetupCompletion(configuration);
    }

    return <div className="configuration-pane">
        <ConfigurationMenu onConfigurationSubmission={handleConfigurationSubmission} />
    </div>;
}
