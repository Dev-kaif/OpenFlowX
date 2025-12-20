"use client";

import type { ReactNode } from "react";
import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import { BaseNode } from "@/components/reactFlow/base-node";

export type PlaceholderNodeProps = Partial<NodeProps> & {
  children?: ReactNode;
  onClick?: () => void;
};

export function PlaceholderNode({ children, onClick }: PlaceholderNodeProps) {
  
  return (
    <BaseNode
      className="bg-card w-auto h-auto border-dashed border-gray-400 p-4 text-center text-gray-400 shadow-none cursor-pointer hover:bg-gray-50 hover:border-gray-500"
      onClick={onClick}
    >
      {children}
      <Handle
        type="target"
        style={{ visibility: "hidden" }}
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        type="source"
        style={{ visibility: "hidden" }}
        position={Position.Bottom}
        isConnectable={false}
      />
    </BaseNode>
  );
};
