import { Rank, Suit } from "../cards";
import { ComponentType } from "../util/types";

// populated by vite
const baseUrl = import.meta.env.BASE_URL;

type CardResource = `cards/${Rank}_of_${Suit}` | 'cards/back' | 'cards-custom/gap';

namespace FeatherIcons {
    export const VariantValues = [
        'play', 'pause',
        'fast-forward', 'rewind',
        'skip-forward', 'skip-back',
        'disc',
        'star', 'github',
        'refresh',
        'share',
        'settings',
        'git-merge',
    ] as const;

    export type Variants = ComponentType<typeof VariantValues>;
}

type FeatherIconResource = `icon-feather/${FeatherIcons.Variants}`;

export type Resource = CardResource | FeatherIconResource;

export function getResourcePath(resource: Resource) {
    return `${baseUrl}/res/${resource}.svg`;
}
