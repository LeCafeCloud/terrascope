import { type Graph, type HealthResponse } from '../types/api';

const API_BASE_URL = import.meta.env.API_URL || 'http://localhost:8080';

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function checkHealth(): Promise<HealthResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            throw new ApiError('Health check failed', response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to connect to backend', undefined, error);
    }
}

export async function parseTerraformState(file: File): Promise<Graph> {
    try {
        const fileContent = await file.text();
        try {
            JSON.parse(fileContent);
        } catch {
            throw new Error('Invalid JSON file');
        }

        const response = await fetch(`${API_BASE_URL}/parse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: fileContent,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(
                `Failed to parse state: ${errorText}`,
                response.status,
                errorText
            );
        }

        const graph: Graph = await response.json();
        if (!graph.nodes || !Array.isArray(graph.nodes)) {
            throw new Error('Invalid response: missing nodes array');
        }

        if (!graph.edges || !Array.isArray(graph.edges)) {
            throw new Error('Invalid response: missing edges array');
        }

        return graph;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof Error && (
            error.message === 'Invalid JSON file' ||
            error.message.startsWith('Invalid response:')
        )) {
            throw error;
        }
        throw new ApiError('Failed to parse Terraform state', undefined, error);
    }
}

export async function parseTerraformStatePretty(file: File): Promise<Graph> {
    const fileContent = await file.text();

    const response = await fetch(`${API_BASE_URL}/parse?pretty=true`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: fileContent,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(`Failed to parse state: ${errorText}`, response.status);
    }

    return await response.json();
}
