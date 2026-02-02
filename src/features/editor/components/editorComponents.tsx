"use client"

import { ErrorView, LoadingView } from "@/components/entity/entityComponents";
import { nodeComponents } from "@/components/reactFlow/nodeComponents";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/useWorkflows"
import {
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    type Node,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type Connection,
    Background,
    Controls,
    MiniMap,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useMemo, useState } from "react";
import { AddNodeButton } from "./addNodeComponent";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/Atoms";
import { ExecuteWorkflowButton } from "./executeButton";
import { NodeType } from "@/generated/prisma/enums";
import { useTheme } from "next-themes";





export const EditorLoading = () => {
    return (
        <LoadingView
            message="Loding the workflow editor..."
        />
    )
}

export const EditorError = () => {
    return (
        <ErrorView
            message="Error while loading the workflow editor"
        />
    )
}


export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const setEditorState = useSetAtom(editorAtom);

    const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
    const [edges, setEdges] = useState<Edge[]>(workflow.connections);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        return setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot))
    }, [])

    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)), []);

    const onConnect = useCallback((params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)), []);

    const hasManualTrigger = useMemo(() => {
        return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER)
    }, [nodes])

    return (
        <div className="size-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeComponents}
                proOptions={{
                    hideAttribution: true
                }}
                onInit={setEditorState}
                colorMode={isDark ? "dark" : "light"}
            // snapGrid={[10, 10]}
            // snapToGrid
            // panOnScroll
            // panOnDrag={false}
            // selectionOnDrag
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-right">
                    <AddNodeButton />
                </Panel>
                {hasManualTrigger &&
                    <Panel position="bottom-center">
                        <ExecuteWorkflowButton workflowId={workflowId} />
                    </Panel>
                }
            </ReactFlow>
        </div>
    );
};
