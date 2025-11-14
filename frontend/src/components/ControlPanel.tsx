import { Filter } from 'lucide-react';
import { Graph } from '../types/api';
import { useMemo } from 'react';

interface ControlPanelProps {
    graph: Graph;
    filters: {
        provider: string;
        module: string;
        mode: string;
    };
    onFiltersChange: (filters: any) => void;
}

export default function ControlPanel({
    graph,
    filters,
    onFiltersChange,
}: ControlPanelProps) {
    const providers = useMemo(() => {
        const unique = new Set(graph.nodes.map((n) => n.provider));
        return Array.from(unique).sort();
    }, [graph]);

    const modules = useMemo(() => {
        const unique = new Set(
            graph.nodes.map((n) => n.module).filter((m) => m)
        );
        return Array.from(unique).sort();
    }, [graph]);

    const modes = useMemo(() => {
        const unique = new Set(graph.nodes.map((n) => n.mode));
        return Array.from(unique).sort();
    }, [graph]);

    return (
        <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 p-6 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-semibold">Filters</h2>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="provider" aria-label="Provider" className="block text-sm font-medium text-gray-300 mb-2">
                        Provider
                    </label>
                    <select
                        id="provider"
                        value={filters.provider}
                        onChange={(e) =>
                            onFiltersChange({ ...filters, provider: e.target.value })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="">All Providers</option>
                        {providers.map((provider) => (
                            <option key={provider} value={provider}>
                                {provider}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="module" aria-label="Module" className="block text-sm font-medium text-gray-300 mb-2">
                        Module
                    </label>
                    <select
                        id="module"
                        value={filters.module}
                        onChange={(e) =>
                            onFiltersChange({ ...filters, module: e.target.value })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="">All Modules</option>
                        {modules.map((module) => (
                            <option key={module} value={module}>
                                {module}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="mode" aria-label="Mode" className="block text-sm font-medium text-gray-300 mb-2">
                        Mode
                    </label>
                    <select
                        id="mode"
                        value={filters.mode}
                        onChange={(e) =>
                            onFiltersChange({ ...filters, mode: e.target.value })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="">All Modes</option>
                        {modes.map((mode) => (
                            <option key={mode} value={mode}>
                                {mode}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() =>
                        onFiltersChange({ provider: '', module: '', mode: '' })
                    }
                    className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
                >
                    Reset Filters
                </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Statistics</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total Resources</span>
                        <span className="text-sm font-semibold text-white">
                            {graph.nodes.length}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Dependencies</span>
                        <span className="text-sm font-semibold text-white">
                            {graph.edges.length}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Providers</span>
                        <span className="text-sm font-semibold text-white">
                            {providers.length}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Legend</h3>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff9900]" />
                        <span className="text-xs text-gray-400">AWS</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#0078d4]" />
                        <span className="text-xs text-gray-400">Azure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#4285f4]" />
                        <span className="text-xs text-gray-400">Google Cloud</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                        <span className="text-xs text-gray-400">Other</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
