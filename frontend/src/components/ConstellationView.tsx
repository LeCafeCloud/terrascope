import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Graph, Node } from '../types/api';

interface ConstellationViewProps {
    graph: Graph;
    filters: {
        provider: string;
        module: string;
        mode: string;
    };
    selectedNodeId: string | null;
    onNodeClick: (nodeId: string) => void;
}

const PROVIDER_COLORS: Record<string, number> = {
    aws: 0xff9900,
    azurerm: 0x0078d4,
    google: 0x4285f4,
    kubernetes: 0x326ce5,
    helm: 0x0f1689,
    default: 0x8b5cf6,
};

export default function ConstellationView({
    graph,
    filters,
    selectedNodeId,
    onNodeClick,
}: ConstellationViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const nodeObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());


    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            10000
        );
        camera.position.set(0, 0, 500);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
        );
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(100, 100, 100);
        scene.add(pointLight);

        addStarField(scene);

        const handleResize = () => {
            if (!containerRef.current || !camera || !renderer) return;
            camera.aspect =
                containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight
            );
        };
        window.addEventListener('resize', handleResize);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    useEffect(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;
        const nodeObjects = nodeObjectsRef.current;

        nodeObjects.forEach((obj) => scene.remove(obj));
        nodeObjects.clear();

        const filteredNodes = graph.nodes.filter((node) => {
            if (filters.provider && node.provider !== filters.provider) return false;
            if (filters.module && node.module !== filters.module) return false;
            if (filters.mode && node.mode !== filters.mode) return false;
            return true;
        });

        filteredNodes.forEach((node, index) => {
            const nodeObj = createNodeObject(node, index, filteredNodes.length);
            scene.add(nodeObj);
            nodeObjects.set(node.id, nodeObj);
        });

        const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
        graph.edges.forEach((edge) => {
            if (
                filteredNodeIds.has(edge.source) &&
                filteredNodeIds.has(edge.target)
            ) {
                const sourceObj = nodeObjects.get(edge.source);
                const targetObj = nodeObjects.get(edge.target);
                if (sourceObj && targetObj) {
                    const line = createEdgeObject(sourceObj, targetObj, edge.type);
                    scene.add(line);
                }
            }
        });
    }, [graph, filters]);

    useEffect(() => {
        const nodeObjects = nodeObjectsRef.current;

        nodeObjects.forEach((obj, nodeId) => {
            const material = obj.material as THREE.MeshStandardMaterial;
            if (nodeId === selectedNodeId) {
                material.emissive.setHex(0xffffff);
                material.emissiveIntensity = 0.5;
            } else {
                material.emissive.setHex(0x000000);
                material.emissiveIntensity = 0;
            }
        });
    }, [selectedNodeId]);

    useEffect(() => {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        if (!renderer || !camera) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleClick = (event: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const objects = Array.from(nodeObjectsRef.current.values());
            const intersects = raycaster.intersectObjects(objects);

            if (intersects.length > 0) {
                const clicked = intersects[0].object as THREE.Mesh;
                const nodeId = Array.from(nodeObjectsRef.current.entries()).find(
                    ([_, obj]) => obj === clicked
                )?.[0];

                if (nodeId) {
                    onNodeClick(nodeId);
                }
            }
        };

        renderer.domElement.addEventListener('click', handleClick);
        return () => renderer.domElement.removeEventListener('click', handleClick);
    }, [onNodeClick]);

    return (
        <div ref={containerRef} className="w-full h-full">
        </div>
    );
}

function createNodeObject(
    node: Node,
    index: number,
    total: number
): THREE.Mesh {
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const radius = 300;

    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    const size = node.mode === 'managed' ? 8 : 5;

    const color =
        PROVIDER_COLORS[node.provider.toLowerCase()] || PROVIDER_COLORS.default;

    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.2,
        metalness: 0.5,
        roughness: 0.5,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    return mesh;
}

function createEdgeObject(
    source: THREE.Mesh,
    target: THREE.Mesh,
    edgeType: string
): THREE.Line {
    const points = [source.position, target.position];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const color = edgeType === 'depends_on' ? 0x8b5cf6 : 0x4b5563;
    const material = new THREE.LineBasicMaterial({
        color,
        opacity: 0.3,
        transparent: true,
    });

    return new THREE.Line(geometry, material);
}

function addStarField(scene: THREE.Scene) {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2000;
        positions[i + 1] = (Math.random() - 0.5) * 2000;
        positions[i + 2] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.8,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}
