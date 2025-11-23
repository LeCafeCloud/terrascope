import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkHealth, parseTerraformState, ApiError } from './api';
import { Graph } from '../types/api';

class MockFile {
    constructor(private content: string, public name: string, public type: string) { }

    async text() {
        return this.content;
    }

    get size() {
        return this.content.length;
    }
}

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkHealth', () => {
        it('should return health status on success', async () => {
            const mockResponse = {
                status: 'healthy',
                timestamp: '2024-01-01T00:00:00Z',
                service: 'terrascope-api',
            };

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await checkHealth();
            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith('http://localhost:8080/health');
        });

        it('should throw ApiError on failed request', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
            });

            await expect(checkHealth()).rejects.toThrow(ApiError);
        });

        it('should throw ApiError on network error', async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            await expect(checkHealth()).rejects.toThrow(ApiError);
        });
    });

    describe('parseTerraformState', () => {
        const mockGraph: Graph = {
            nodes: [
                {
                    id: 'aws_s3_bucket.example',
                    type: 'aws_s3_bucket',
                    mode: 'managed',
                    provider: 'aws',
                },
            ],
            edges: [],
        };

        const validTfstate = {
            version: 4,
            terraform_version: '1.5.0',
            resources: [],
        };

        it('should parse valid terraform state', async () => {
            const file = new MockFile(
                JSON.stringify(validTfstate),
                'terraform.tfstate',
                'application/json'
            ) as unknown as File;

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockGraph,
            });

            const result = await parseTerraformState(file);
            expect(result).toEqual(mockGraph);
        });

        it('should throw error for invalid JSON', async () => {
            const file = new MockFile(
                'invalid json',
                'terraform.tfstate',
                'application/json'
            ) as unknown as File;

            await expect(parseTerraformState(file)).rejects.toThrow('Invalid JSON file');
        });

        it('should throw error on API failure', async () => {
            const file = new MockFile(
                JSON.stringify(validTfstate),
                'terraform.tfstate',
                'application/json'
            ) as unknown as File;

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                text: async () => 'Bad request',
            });

            await expect(parseTerraformState(file)).rejects.toThrow(ApiError);
        });

        it('should validate response structure', async () => {
            const file = new MockFile(
                JSON.stringify(validTfstate),
                'terraform.tfstate',
                'application/json'
            ) as unknown as File;

            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ invalid: 'response' }),
            });

            await expect(parseTerraformState(file)).rejects.toThrow(
                'Invalid response: missing nodes array'
            );
        });
    });

    describe('ApiError', () => {
        it('should create error with message and status', () => {
            const error = new ApiError('Test error', 404);
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(404);
            expect(error.name).toBe('ApiError');
        });

        it('should create error with response data', () => {
            const response = { detail: 'Not found' };
            const error = new ApiError('Test error', 404, response);
            expect(error.response).toEqual(response);
        });
    });
});
