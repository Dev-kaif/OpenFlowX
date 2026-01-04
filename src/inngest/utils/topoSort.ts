import { Connection, Node } from "@/generated/prisma/client";
import toposort from "toposort";

export const topologicalSort = (
    nodes: Node[],
    connections: Connection[]
): Node[] => {

    if (connections.length === 0) {
        return nodes;
    }

    const edges: [string, string][] = connections.map((connection) => [
        connection.fromNodeId,
        connection.toNodeId
    ]);

    const connectedNodeIds = new Set<string>();

    for (const connection of connections) {
        connectedNodeIds.add(connection.fromNodeId)
        connectedNodeIds.add(connection.toNodeId)
    };

    // Add nodes with no connections as self-edges to ensure they are included
    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            edges.push([node.id, node.id])
        }
    }


    let sortedNodeIds: string[];

    try {

        sortedNodeIds = toposort(edges)

        sortedNodeIds = [...new Set(sortedNodeIds)];

    } catch (error) {
        if (error instanceof Error && error.message.includes("Cyclic")) {
            throw new Error("Workflow contains a cycle")
        }
        throw error
    }

    const nodeMap = new Map(nodes.map((node) => [node.id, node]))

    return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean)
}