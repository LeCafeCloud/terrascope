import { Graph, Node, Edge } from '../types/api';

export function getUniqueProviders(graph: Graph): string[] {
    const providers = new Set(graph.nodes.map((node) => node.provider));
    return Array.from(providers).sort();
}

export function getUniqueModules(graph: Graph): string[] {
    const modules = new Set(
        graph.nodes
            .map((node) => node.module)
            .filter((m): m is string => m !== undefined)
    );
    return Array.from(modules).sort();
}

export function getUniqueModes(graph: Graph): string[] {
    const modes = new Set(graph.nodes.map((node) => node.mode));
    return Array.from(modes).sort();
}

export function filterNodes(
    nodes: Node[],
    filters: {
        provider?: string;
        module?: string;
        mode?: string;
        search?: string;
    }
): Node[] {
    return nodes.filter((node) => {
        if (filters.provider && node.provider !== filters.provider) return false;
        if (filters.module && node.module !== filters.module) return false;
        if (filters.mode && node.mode !== filters.mode) return false;
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const searchableText = `${node.id} ${node.type} ${node.provider}`.toLowerCase();
            if (!searchableText.includes(searchLower)) return false;
        }
        return true;
    });
}

export function filterEdges(edges: Edge[], nodeIds: Set<string>): Edge[] {
    return edges.filter(
        (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
}

export function getGraphStats(graph: Graph) {
    const resourcesByProvider: Record<string, number> = {};
    const resourcesByMode: Record<string, number> = {};
    const resourcesByType: Record<string, number> = {};

    graph.nodes.forEach((node) => {
        resourcesByProvider[node.provider] =
            (resourcesByProvider[node.provider] || 0) + 1;

        resourcesByMode[node.mode] = (resourcesByMode[node.mode] || 0) + 1;

        resourcesByType[node.type] = (resourcesByType[node.type] || 0) + 1;
    });

    return {
        totalNodes: graph.nodes.length,
        totalEdges: graph.edges.length,
        resourcesByProvider,
        resourcesByMode,
        resourcesByType,
    };
}

export function getNodeDependencies(
    nodeId: string,
    graph: Graph
): {
    dependsOn: Node[];
    dependedBy: Node[];
} {
    const dependsOnIds = graph.edges
        .filter((e) => e.source === nodeId)
        .map((e) => e.target);

    const dependedByIds = graph.edges
        .filter((e) => e.target === nodeId)
        .map((e) => e.source);

    const dependsOn = graph.nodes.filter((n) => dependsOnIds.includes(n.id));
    const dependedBy = graph.nodes.filter((n) => dependedByIds.includes(n.id));

    return { dependsOn, dependedBy };
}

export function groupNodesByModule(
    nodes: Node[]
): Record<string, Node[]> {
    const grouped: Record<string, Node[]> = {};

    nodes.forEach((node) => {
        const module = node.module || 'root';
        if (!grouped[module]) {
            grouped[module] = [];
        }
        grouped[module].push(node);
    });

    return grouped;
}

export function calculateNodeImportance(
    nodeId: string,
    graph: Graph
): number {
    const incomingEdges = graph.edges.filter((e) => e.target === nodeId).length;
    const outgoingEdges = graph.edges.filter((e) => e.source === nodeId).length;

    return incomingEdges + outgoingEdges;
}
