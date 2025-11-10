import React, { useEffect, useRef, useState } from 'react';
import { Upload, FileJson, Network, Eye, Sparkles, Server, Lock, Zap } from 'lucide-react';

import { parseTerraformState } from '../services/api';

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
        }> = [];

        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
                ctx.fill();

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30"
            style={{ zIndex: 0 }}
        />
    );
};

const Navigation = () => {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        fetch('https://api.github.com/repos/LeCafeCloud/terrascope')
            .then(res => res.json())
            .then(data => setStars(data.stargazers_count))
            .catch(() => setStars(null));
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 items-center">
                <div className="flex items-center space-x-2">
                    <Network className="w-8 h-8 text-violet-500" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                        terrascope
                    </span>
                </div>

                <div className="hidden md:flex justify-center items-center gap-10 text-sm font-medium">
                    <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                        Features
                    </a>
                    <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                        How it works
                    </a>
                    <a href="#docs" className="text-gray-300 hover:text-white transition-colors">
                        Docs
                    </a>
                </div>

                <div className="flex justify-end items-center">
                    <a
                        href="https://github.com/LeCafeCloud/terrascope"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                fillRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483
                0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466
                -.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832
                .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988
                1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75
                1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337
                1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1
                2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339
                4.695-4.566 4.943.359.309.678.92.678
                1.855 0 1.338-.012 2.419-.012 2.747 0
                .268.18.58.688.482A10.019 10.019 0
                0022 12.017C22 6.484 17.522 2 12
                2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="hidden sm:inline">
                            {stars !== null ? `${stars.toLocaleString()} ★` : '★'}
                        </span>
                    </a>
                </div>
            </div>
        </nav>
    );
};

const FileUploadZone = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.tfstate')) {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Please drop a valid .tfstate file');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleVisualize = async () => {
        if (!file) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const graph = await parseTerraformState(file);

            sessionStorage.setItem('terraformGraph', JSON.stringify(graph));
            sessionStorage.setItem('fileName', file.name);

            window.location.href = '/visualize';
        } catch (err: any) {
            setError(err.message || 'Failed to parse Terraform state');
            console.error('Parse error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging
                    ? 'border-violet-500 bg-violet-500/10 scale-105'
                    : file
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-900/30'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".tfstate"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {!file ? (
                    <>
                        <div className="mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-500/10 mb-4">
                                <Upload className="w-10 h-10 text-violet-500" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                                Upload your Terraform state
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Drag and drop your <code className="text-violet-400 bg-gray-800 px-2 py-1 rounded">terraform.tfstate</code> file here
                            </p>
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-violet-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-lg shadow-violet-500/30"
                        >
                            <FileJson className="w-5 h-5" />
                            <span>Browse files</span>
                        </button>

                        <p className="text-sm text-gray-500 mt-6">
                            <Lock className="w-4 h-4 inline mr-1" />
                            Your state file never leaves your browser
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
                                <FileJson className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                                File ready!
                            </h3>
                            <p className="text-gray-400 mb-2">
                                <span className="font-mono text-green-400">{file.name}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-center space-x-4">
                            <button
                                onClick={handleVisualize}
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-violet-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-lg shadow-violet-500/30"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-5 h-5" />
                                        <span>Visualize Infrastructure</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    setFile(null);
                                    setError(null);
                                }}
                                disabled={isLoading}
                                className="text-gray-400 hover:text-white transition-colors px-4 py-2"
                            >
                                Change file
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    Need a sample file?{' '}
                    <a href="#" className="text-violet-400 hover:text-violet-300 underline">
                        Download example terraform.tfstate
                    </a>
                </p>
            </div>
        </div>
    );
};

const Hero = () => {
    return (
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
            <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300">No Account Required</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Turn Your Terraform into an
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Interactive Constellation
                </span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                Visualize your infrastructure as an explorable universe. Resources become planets,
                modules become galaxies, and dependencies form orbital links.{' '}
                <span className="text-white font-semibold">No signup, no servers, no data leaves your browser.</span>
            </p>

            <FileUploadZone />
        </div>
    );
};

const DemoPreview = () => {
    return (
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20" id="how-it-works">
            <h2 className="text-4xl font-bold text-center mb-4">
                See Your Infrastructure Like Never Before
            </h2>
            <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                Upload your state file and instantly get an interactive visualization of your entire infrastructure
            </p>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Network className="w-6 h-6 text-violet-500" />
                        <span className="text-lg font-semibold text-white">terrascope</span>
                        <span className="text-sm text-gray-500">• Constellation View</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                <Network className="w-5 h-5 text-violet-500" />
                                <span>Resources Overview</span>
                            </h3>
                            <div className="flex items-center justify-center h-48">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-white">247</div>
                                            <div className="text-sm text-violet-200">Resources</div>
                                        </div>
                                    </div>
                                    <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-green-400">105 OK</span>
                                    </div>
                                    <div className="absolute -left-4 top-8 w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-yellow-400">6 Drift</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Modules & Dependencies
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'module.vpc', count: 12 },
                                    { name: 'module.eks_cluster', count: 45 },
                                    { name: 'module.rds', count: 8 },
                                    { name: 'module.s3_buckets', count: 15 }
                                ].map((mod) => (
                                    <div
                                        key={mod.name}
                                        className="flex items-center space-x-3 bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors cursor-pointer"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                                        <span className="text-gray-300 font-mono text-sm flex-1">{mod.name}</span>
                                        <span className="text-xs text-gray-500">{mod.count} resources</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Dependency Graph</h3>
                        <div className="h-32 flex items-center justify-center text-gray-500">
                            <div className="flex items-center space-x-8">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mb-2">
                                        <Server className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <span className="text-xs text-gray-400">VPC</span>
                                </div>
                                <div className="text-violet-500">→</div>
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-2">
                                        <Server className="w-6 h-6 text-green-400" />
                                    </div>
                                    <span className="text-xs text-gray-400">EKS</span>
                                </div>
                                <div className="text-violet-500">→</div>
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center mb-2">
                                        <Server className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <span className="text-xs text-gray-400">RDS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Features = () => {
    const features = [
        {
            icon: <Lock className="w-8 h-8" />,
            title: 'Privacy First',
            description:
                'Everything runs in your browser. Your Terraform state never touches our servers. No accounts, no tracking.',
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Instant Analysis',
            description:
                'Parse and visualize your infrastructure in seconds. No waiting, no processing queues, just instant results.',
        },
        {
            icon: <Network className="w-8 h-8" />,
            title: 'Interactive Graph',
            description:
                'Explore dependencies, filter by provider, zoom into modules, and understand your infrastructure at any level.',
        },
        {
            icon: <Eye className="w-8 h-8" />,
            title: 'Multiple Views',
            description:
                'Switch between constellation, orbit, and timeline views to see your infrastructure from different angles.',
        },
        {
            icon: <Sparkles className="w-8 h-8" />,
            title: 'Smart Filtering',
            description:
                'Search, filter by tags, providers, or modules. Find exactly what you need in complex infrastructures.',
        },
        {
            icon: <FileJson className="w-8 h-8" />,
            title: 'Export & Share',
            description:
                'Generate snapshots, export diagrams, or create shareable links to specific views of your infrastructure.',
        },
    ];

    return (
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20" id="features">
            <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                Built for DevOps Engineers
            </h2>
            <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                Everything you need to understand, document, and audit your Terraform infrastructure
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, i) => (
                    <div
                        key={i}
                        className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-8 hover:border-violet-500/50 transition-all hover:transform hover:scale-105"
                    >
                        <div className="text-violet-500 mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Footer = () => {
    return (
        <footer className="relative z-10 border-t border-gray-800 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <Network className="w-6 h-6 text-violet-500" />
                        <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                            terrascope
                        </span>
                    </div>

                    <div className="flex items-center space-x-8 text-sm text-gray-400">
                        <a href="https://github.com/LeCafeCloud/terrascope" className="hover:text-white transition-colors flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <span>GitHub</span>
                        </a>
                        <a href="#docs" className="hover:text-white transition-colors">
                            Documentation
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            Privacy
                        </a>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Made with ❤️
                </div>
            </div>
        </footer>
    );
};

export default function Landing() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            <ParticleBackground />
            <Navigation />
            <Hero />
            <DemoPreview />
            <Features />
            <Footer />
        </div>
    );
}
