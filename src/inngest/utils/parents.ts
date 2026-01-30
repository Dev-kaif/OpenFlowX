export function buildParentsMap(connections: {
    fromNodeId: string;
    toNodeId: string;
}[]) {
    const map = new Map<string, string[]>();

    for (const c of connections) {
        if (!map.has(c.toNodeId)) {
            map.set(c.toNodeId, []);
        }
        map.get(c.toNodeId)!.push(c.fromNodeId);
    }

    return map;
}


export function buildNodeInput(
    nodeId: string,
    parentsMap: Map<string, string[]>,
    nodeOutputs: Record<string, any>
) {
    const parents = parentsMap.get(nodeId) || [];
    const input: Record<string, any> = {};

    for (const parentId of parents) {
        input[parentId] = nodeOutputs[parentId];
    }

    return input;
}

