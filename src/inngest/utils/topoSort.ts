import { Connection, Node } from "@/generated/prisma/client";
import toposort from "toposort";

type NodeLike = Pick<Node, "id">;
type ConnectionLike = Pick<Connection, "fromNodeId" | "toNodeId">;

export function topologicalSort<T extends NodeLike>(
    nodes: T[],
    connections: ConnectionLike[]
): T[] {
    const edges: [string, string][] = connections.map((c) => [
        c.fromNodeId,
        c.toNodeId,
    ]);

    let sortedIds: string[];

    try {
        sortedIds = toposort(edges);
        sortedIds = [...new Set(sortedIds)];
    } catch (err: any) {
        if (err.message?.includes("Cyclic")) {
            throw new Error("Workflow contains a cycle");
        }
        throw err;
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return sortedIds.map((id) => nodeMap.get(id)!).filter(Boolean);
}
