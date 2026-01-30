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
    nodeOutputs: Record<string, any>,
    triggerNodeIds: string[]
) {
    const parents = parentsMap.get(nodeId) || [];
    const input: Record<string, any> = {};

    for (const parentId of parents) {
        const parentOutput = nodeOutputs[parentId];
        if (!parentOutput) continue;

        // Trigger nodes: merge output directly
        if (triggerNodeIds.includes(parentId)) {
            Object.assign(input, parentOutput);
            continue;
        }

        // Non-trigger nodes:
        // output is already namespaced by variableName
        Object.assign(input, parentOutput);
    }

    return input;
}




