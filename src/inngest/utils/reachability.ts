export type ConnectionLike = {
    fromNodeId: string;
    toNodeId: string;
};

export function getReachableNodeIds(
    startNodeIds: string[],
    connections: ConnectionLike[]
): Set<string> {
    const graph = new Map<string, string[]>();

    for (const { fromNodeId, toNodeId } of connections) {
        if (!graph.has(fromNodeId)) graph.set(fromNodeId, []);
        graph.get(fromNodeId)!.push(toNodeId);
    }

    const visited = new Set<string>();
    const stack = [...startNodeIds];

    while (stack.length) {
        const current = stack.pop()!;
        if (visited.has(current)) continue;
        visited.add(current);

        const children = graph.get(current) || [];
        stack.push(...children);
    }

    return visited;
}
