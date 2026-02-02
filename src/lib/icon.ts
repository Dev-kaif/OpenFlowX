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
