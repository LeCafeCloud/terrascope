import { X, Server, Package, Tag } from 'lucide-react';
import { Node } from '../types/api';

interface ResourcePanelProps {
    node: Node;
    onClose: () => void;
}

export default function ResourcePanel({ node, onClose }: ResourcePanelProps) {
    return (
        <div className="w-96 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800 p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold mb-1 break-all">{node.id}</h2>
                    <p className="text-sm text-gray-400">{node.type}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
                        <Server className="w-4 h-4" />
                        <span>Resource Details</span>
                    </h3>
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-sm text-gray-400">Provider</span>
                            <span className="text-sm font-mono text-white">{node.provider}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-sm text-gray-400">Mode</span>
                            <span className="text-sm">
                                <span
                                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${node.mode === 'managed'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                        }`}
                                >
                                    {node.mode}
                                </span>
                            </span>
                        </div>
                        {node.module && (
                            <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-400">Module</span>
                                <span className="text-sm font-mono text-white break-all text-right">
                                    {node.module}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {node.metadata && Object.keys(node.metadata).length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
                            <Package className="w-4 h-4" />
                            <span>Metadata</span>
                        </h3>
                        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                            {Object.entries(node.metadata).map(([key, value]) => {
                                if (key === 'tags' && typeof value === 'object') {
                                    return (
                                        <div key={key}>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Tag className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-400">Tags</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 ml-5">
                                                {Object.entries(value as Record<string, any>).map(
                                                    ([tagKey, tagValue]) => (
                                                        <span
                                                            key={tagKey}
                                                            className="inline-block px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs font-mono"
                                                        >
                                                            {tagKey}: {String(tagValue)}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                if (typeof value === 'object') return null;

                                return (
                                    <div key={key} className="flex justify-between items-start">
                                        <span className="text-sm text-gray-400">{key}</span>
                                        <span className="text-sm font-mono text-white break-all text-right max-w-[200px]">
                                            {String(value)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-800">
                    <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        View in Terraform
                    </button>
                </div>
            </div>
        </div>
    );
}
