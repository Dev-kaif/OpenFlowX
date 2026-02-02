import {
    MousePointerIcon,
    GlobeIcon,
    CodeIcon,
    FileText,
    FileIcon,
    EyeIcon,
    SearchIcon,
    PlusIcon,
} from "lucide-react";
import { NodeType } from "@/generated/prisma/enums";
import Image from "next/image";

type NodeIconType =
    | React.ComponentType<{ className?: string }>
    | string;

export const NODE_ICONS: Record<NodeType, NodeIconType> = {

    MANUAL_TRIGGER: MousePointerIcon,
    GOOGLE_FORM_TRIGGER: "/googleform.svg",
    STRIPE_TRIGGER: "/stripe.svg",
    POLAR_TRIGGER: "/polar.svg",
    SCHEDULE: "/utils/schedule.svg",

    HTTP_REQUEST: GlobeIcon,
    OPENROUTER: "/openrouter.svg",
    OPENAI: "/openai.svg",
    GEMINI: "/gemini.svg",
    DEEPSEEK: "/deepseek.svg",
    ANTHROPIC: "/anthropic.svg",
    XAI: "/grok.svg",

    SLACK: "/slack.svg",
    DISCORD: "/discord.svg",
    TELEGRAM: "/telegram.svg",
    TELEGRAM_TRIGGER: "/telegram.svg",

    EMAIL_RESEND: "/resend.svg",
    POSTGRESS: "/postgres.svg",
    GOOGLESHEETS: "/sheets.svg",
    S3: "/aws.svg",
    R2: "/cloudflare.svg",

    IFELSE: "/utils/ifelse.svg",
    DELAY: "/utils/delay.svg",
    CODE: CodeIcon,
    TEMPLATE: FileText,
    JSON_PARSE: "/utils/json.svg",
    FILE: FileIcon,
    SCRAPER: EyeIcon,
    SEARCH: SearchIcon,
    INITIAL: PlusIcon
};


export const NodeIcon = ({ type }: { type: NodeType }) => {
    const icon = NODE_ICONS[type];
    if (!icon) return null;

    return (
        <div className="h-5 w-5 rounded-sm bg-muted flex items-center justify-center">
            {typeof icon === "string" ? (
                <Image
                    src={icon}
                    alt=""
                    width={16}
                    height={16}
                    className="object-contain"
                />
            ) : (
                (() => {
                    const Icon = icon;
                    return <Icon className="h-4 w-4 text-foreground" />;
                })()
            )}
        </div>
    );
};