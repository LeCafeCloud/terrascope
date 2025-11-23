import { describe, it, expect } from 'vitest';
import {
    getUniqueProviders,
    getUniqueModules,
    getUniqueModes,
    filterNodes,
    filterEdges,
    getGraphStats,
    getNodeDependencies,
    groupNodesByModule,
    calculateNodeImportance,
} from './graphProcessor';
import { Graph } from '../types/api';

describe('graphProcessor', () => {
    const mockGraph: Graph = {
        nodes: [
            {
                id: 'aws_s3_bucket.example',
                type: 'aws_s3_bucket',
                mode: 'managed',
                provider: 'aws',
                module: 'module.storage',
            },
            {
                id: 'aws_vpc.main',
                type: 'aws_vpc',
                mode: 'managed',
                provider: 'aws',
            },
            {
                id: 'data.aws_ami.ubuntu',
                type: 'aws_ami',
                mode: 'data',
                provider: 'aws',
                module: 'module.compute',
            },
            {
                id: 'azurerm_resource_group.example',
                type: 'azurerm_resource_group',
                mode: 'managed',
                provider: 'azurerm',
            },
        ],
        edges: [
            { source: 'aws_s3_bucket.example', target: 'aws_vpc.main', type: 'depends_on' },
            { source: 'data.aws_ami.ubuntu', target: 'aws_vpc.main', type: 'implicit' },
        ],
    };

    describe('getUniqueProviders', () => {
        it('should return unique providers sorted', () => {
            const providers = getUniqueProviders(mockGraph);
            expect(providers).toEqual(['aws', 'azurerm']);
        });

        it('should return empty array for empty graph', () => {
            const providers = getUniqueProviders({ nodes: [], edges: [] });
            expect(providers).toEqual([]);
        });
    });

    describe('getUniqueModules', () => {
        it('should return unique modules sorted, excluding undefined', () => {
            const modules = getUniqueModules(mockGraph);
            expect(modules).toEqual(['module.compute', 'module.storage']);
        });
    });

    describe('getUniqueModes', () => {
        it('should return unique modes sorted', () => {
            const modes = getUniqueModes(mockGraph);
            expect(modes).toEqual(['data', 'managed']);
        });
    });

    describe('filterNodes', () => {
        it('should filter nodes by provider', () => {
            const filtered = filterNodes(mockGraph.nodes, { provider: 'aws' });
            expect(filtered).toHaveLength(3);
            expect(filtered.every((n) => n.provider === 'aws')).toBe(true);
        });

        it('should filter nodes by mode', () => {
            const filtered = filterNodes(mockGraph.nodes, { mode: 'data' });
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe('data.aws_ami.ubuntu');
        });

        it('should filter nodes by module', () => {
            const filtered = filterNodes(mockGraph.nodes, { module: 'module.storage' });
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe('aws_s3_bucket.example');
        });

        it('should filter nodes by search text', () => {
            const filtered = filterNodes(mockGraph.nodes, { search: 's3' });
            expect(filtered).toHaveLength(1);
            expect(filtered[0].type).toBe('aws_s3_bucket');
        });

        it('should apply multiple filters', () => {
            const filtered = filterNodes(mockGraph.nodes, {
                provider: 'aws',
                mode: 'managed',
            });
            expect(filtered).toHaveLength(2);
        });
    });

    describe('filterEdges', () => {
        it('should filter edges based on node set', () => {
            const nodeIds = new Set(['aws_s3_bucket.example', 'aws_vpc.main']);
            const filtered = filterEdges(mockGraph.edges, nodeIds);
            expect(filtered).toHaveLength(1);
            expect(filtered[0].source).toBe('aws_s3_bucket.example');
        });

        it('should return empty array if no nodes match', () => {
            const nodeIds = new Set(['nonexistent']);
            const filtered = filterEdges(mockGraph.edges, nodeIds);
            expect(filtered).toHaveLength(0);
        });
    });

    describe('getGraphStats', () => {
        it('should calculate correct statistics', () => {
            const stats = getGraphStats(mockGraph);
            expect(stats.totalNodes).toBe(4);
            expect(stats.totalEdges).toBe(2);
            expect(stats.resourcesByProvider).toEqual({
                aws: 3,
                azurerm: 1,
            });
            expect(stats.resourcesByMode).toEqual({
                managed: 3,
                data: 1,
            });
        });
    });

    describe('getNodeDependencies', () => {
        it('should find nodes that depend on target', () => {
            const deps = getNodeDependencies('aws_vpc.main', mockGraph);
            expect(deps.dependedBy).toHaveLength(2);
            expect(deps.dependsOn).toHaveLength(0);
        });

        it('should find nodes that target depends on', () => {
            const deps = getNodeDependencies('aws_s3_bucket.example', mockGraph);
            expect(deps.dependsOn).toHaveLength(1);
            expect(deps.dependsOn[0].id).toBe('aws_vpc.main');
        });
    });

    describe('groupNodesByModule', () => {
        it('should group nodes by module', () => {
            const grouped = groupNodesByModule(mockGraph.nodes);
            expect(grouped['module.storage']).toHaveLength(1);
            expect(grouped['module.compute']).toHaveLength(1);
            expect(grouped['root']).toHaveLength(2);
        });
    });

    describe('calculateNodeImportance', () => {
        it('should calculate importance based on connections', () => {
            const importance = calculateNodeImportance('aws_vpc.main', mockGraph);
            expect(importance).toBe(2); // 2 incoming edges
        });

        it('should return 0 for isolated nodes', () => {
            const importance = calculateNodeImportance('azurerm_resource_group.example', mockGraph);
            expect(importance).toBe(0);
        });
    });
});
