import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Graph } from '../types/api';
import ConstellationView from '../components/ConstellationView';
import ControlPanel from '../components/ControlPanel';
import ResourcePanel from '../components/ResourcePanel';

export default function Visualization() {
    const navigate = useNavigate();
    const [graph, setGraph] = useState<Graph | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        provider: '',
        module: '',
        mode: '',
    });

    useEffect(() => {
        const storedGraph = sessionStorage.getItem('terraformGraph');
        const storedFileName = sessionStorage.getItem('fileName');

        if (!storedGraph) {
            navigate('/');
            return;
        }

        try {
            const parsedGraph: Graph = JSON.parse(storedGraph);
            setGraph(parsedGraph);
            setFileName(storedFileName || 'terraform.tfstate');
        } catch (error) {
            console.error('Failed to parse graph:', error);
            navigate('/');
        }
    }, [navigate]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleNodeClick = (nodeId: string) => {
        setSelectedNodeId(nodeId);
    };

    if (!graph) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading visualization...</div>
            </div>
        );
    }

    const selectedNode = selectedNodeId
        ? graph.nodes.find((n) => n.id === selectedNodeId)
        : null;

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-full px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToHome}
                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                        <div className="h-6 w-px bg-gray-700" />
                        <div className="flex items-center space-x-2">
                            <Home className="w-5 h-5 text-violet-500" />
                            <span className="font-semibold">{fileName}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-gray-400">
                                {graph.nodes.length} Resources
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-gray-400">
                                {graph.edges.length} Dependencies
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="pt-20 h-screen flex">
                <ControlPanel
                    graph={graph}
                    filters={filters}
                    onFiltersChange={setFilters}
                />

                <div className="flex-1 relative">
                    <ConstellationView
                        graph={graph}
                        filters={filters}
                        selectedNodeId={selectedNodeId}
                        onNodeClick={handleNodeClick}
                    />
                </div>

                {selectedNode && (
                    <ResourcePanel
                        node={selectedNode}
                        onClose={() => setSelectedNodeId(null)}
                    />
                )}
            </div>
        </div>
    );
}
