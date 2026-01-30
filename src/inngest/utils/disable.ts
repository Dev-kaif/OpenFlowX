import { Connection } from "@/generated/prisma/client";
type ConnectionLike = Pick<Connection, "fromNodeId" | "toNodeId">;

export function disableSubtree(
    startNodeId: string,
    connections: ConnectionLike[],
    disabled: Set<string>
) {
    const stack = [startNodeId];

    while (stack.length) {
        const id = stack.pop()!;
        if (disabled.has(id)) continue;

        disabled.add(id);

        for (const c of connections) {
            if (c.fromNodeId === id) {
                stack.push(c.toNodeId);
            }
        }
    }
}
