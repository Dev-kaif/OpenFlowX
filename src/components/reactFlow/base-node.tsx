import type { ComponentProps, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { NodeStatus } from "./node-status-indicator";
import { CheckCircleIcon, Loader2Icon, XCircleIcon } from "lucide-react";

interface BaseNodePros extends HTMLAttributes<HTMLDivElement>{
  status?: NodeStatus;
}
export function BaseNode({ className, status, ...props }: BaseNodePros) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground relative rounded-sm border",
        "border-muted-foreground bg-card text-card-foreground hover:bg-accent",
        className,
      )}
      tabIndex={0}
      {...props}
    >
      {props.children}
      {status === "error" && (
        <XCircleIcon className="absolute right-0.5 bottom-0.5 size-2 text-red-700 stroke-3"/>
      )}
      {status === "success" && (
        <CheckCircleIcon className="absolute right-0.5 bottom-0.5 size-2 text-green-700 stroke-3"/>
      )}
      {status === "loading" && (
        <Loader2Icon className="absolute -right-0.5 -bottom-0.5 size-2 text-blue-700 stroke-3 animate-spin"/>
      )}
    </div>
  );
}

/**
 * A container for a consistent header layout intended to be used inside the
 * `<BaseNode />` component.
 */
export function BaseNodeHeader({
  className,
  ...props
}: ComponentProps<"header">) {
  return (
    <header
      {...props}
      className={cn(
        "mx-0 my-0 -mb-1 flex flex-row items-center justify-between gap-2 px-3 py-2",
        // Remove or modify these classes if you modify the padding in the
        // `<BaseNode />` component.
        className,
      )}
    />
  );
}

/**
 * The title text for the node. To maintain a native application feel, the title
 * text is not selectable.
 */
export function BaseNodeHeaderTitle({
  className,
  ...props
}: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="base-node-title"
      className={cn("user-select-none flex-1 font-semibold", className)}
      {...props}
    />
  );
}

export function BaseNodeContent({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="base-node-content"
      className={cn("flex flex-col gap-y-2 p-3", className)}
      {...props}
    />
  );
}

export function BaseNodeFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="base-node-footer"
      className={cn(
        "flex flex-col items-center gap-y-2 border-t px-3 pt-2 pb-3",
        className,
      )}
      {...props}
    />
  );
}
