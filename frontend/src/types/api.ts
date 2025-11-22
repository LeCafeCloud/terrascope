export interface Graph {
    nodes: Node[];
    edges: Edge[];
    stats?: Stats;
}

export interface Node {
    id: string;
    type: string;
    mode: string;
    provider: string;
    module?: string;
    metadata?: Record<string, unknown>;
}

export interface Edge {
    source: string;
    target: string;
    type: string;
}

export interface Stats {
    total_nodes: number;
    total_edges: number;
    resources_by_type?: Record<string, number>;
    resources_by_mode?: Record<string, number>;
}

export interface HealthResponse {
    status: string;
    timestamp: string;
    service: string;
    uptime?: string;
    details?: Record<string, string>;
}
