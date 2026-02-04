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
import { useTheme } from "next-themes";
import { ThemedIcon } from "@/components/reactFlow/nodeSelector";
import { cn } from "./utils";

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
    DOCUMENT_READER: "/utils/document.svg",
    FILE: FileIcon,
    SCRAPER: EyeIcon,
    SEARCH: SearchIcon,
    INITIAL: PlusIcon
};


export const NodeIcon = ({ type }: { type: NodeType }) => {
    const icon = NODE_ICONS[type];
    if (!icon) return null;

    const { theme } = useTheme();
    const currentTheme = theme === "dark" ? "dark" : "light"


    return (
        <div className="h-5 w-5 rounded-sm bg-muted flex items-center justify-center">
            {typeof icon === "string" ? (
                <img
                    src={getThemedIcon(icon, currentTheme)}
                    alt={icon}
                    className="h-4 w-4 object-contain"
                    onError={(e) => {
                        e.currentTarget.src = icon;
                    }}
                />
            ) : (
                (() => {
                    const Icon = icon;
                    return <Icon className="h-4 w-4 text-black dark:text-white" />;
                })()
            )}
        </div>
    );
};


export const NodeIconRenderer = ({
    icon,
    className = "h-5 w-5",
}: {
    icon: ThemedIcon
    className?: string
}) => {
    if (typeof icon === "string") {
        return (
            <Image
                src={icon}
                alt=""
                width={20}
                height={20}
                className={className}
            />
        )
    }

    if (typeof icon === "object" && "src" in icon) {
        return (
            <>
                {/* light */}
                <Image
                    src={icon.src}
                    alt=""
                    width={20}
                    height={20}
                    className={cn(className, "dark:hidden")}
                />
                {/* dark */}
                {icon.darkSrc && (
                    <Image
                        src={icon.darkSrc}
                        alt=""
                        width={20}
                        height={20}
                        className={cn(className, "hidden dark:block")}
                    />
                )}
            </>
        )
    }

    const Icon = icon as React.ElementType
    return <Icon className={cn(className, "text-foreground")} />
}

export function getThemedIcon(icon: string, theme: "light" | "dark") {
    if (theme !== "dark") return icon;

    // if it's not an svg or already has -dark, return as-is
    if (!icon.endsWith(".svg") || icon.includes("-dark.svg")) {
        return icon;
    }

    // insert -dark before .svg
    return icon.replace(/\.svg$/, "-dark.svg");
}