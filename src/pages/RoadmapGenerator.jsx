import React, { useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BookOpen, Layers, Terminal, ChevronRight, Settings } from 'lucide-react';
import './RoadmapGenerator.css';

// Custom Node Component to fit the premium aesthetic
const CustomNode = ({ data, isConnectable }) => {
    return (
        <div className={`custom-node ${data.type || 'default'}`}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="custom-handle" />
            <div className="node-icon">
                {data.icon === 'book' ? <BookOpen size={16} /> : data.icon === 'code' ? <Terminal size={16} /> : <Layers size={16} />}
            </div>
            <div className="node-content">
                <div className="node-title">{data.label}</div>
                {data.duration && <div className="node-duration">{data.duration}</div>}
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="custom-handle" />
        </div>
    );
};

// Mock Algorithm to generate a comprehensive 1-year tree
const generateMockRoadmap = (problemTitle, userLevel) => {
    const isUG = userLevel === 'UG';
    const nodes = [];
    const edges = [];

    const yStep = 150;
    const xStep = 300;

    // Root Node
    nodes.push({ id: 'root', type: 'custom', position: { x: 0, y: 0 }, data: { label: `${problemTitle} Foundations`, icon: 'layers', type: 'root', duration: 'Month 1-2' } });

    // Pre-requisites Branch 1 (Math/Physics)
    nodes.push({ id: 'pre1', type: 'custom', position: { x: -xStep, y: yStep }, data: { label: isUG ? 'Linear Algebra & Calculus II' : 'Advanced Tensor Calculus', icon: 'book', duration: 'Month 3' } });
    edges.push({ id: 'e-root-pre1', source: 'root', target: 'pre1', animated: true });

    // Pre-requisites Branch 2 (Core Programming)
    nodes.push({ id: 'pre2', type: 'custom', position: { x: xStep, y: yStep }, data: { label: isUG ? 'Data Structures & Algorithms' : 'Distributed Systems Architecture', icon: 'code', duration: 'Month 3' } });
    edges.push({ id: 'e-root-pre2', source: 'root', target: 'pre2', animated: true });

    // Level 3 (Sub-skills)
    nodes.push({ id: 'sub1', type: 'custom', position: { x: -xStep * 1.5, y: yStep * 2 }, data: { label: 'Numerical Methods', icon: 'book', duration: 'Month 4-5' } });
    nodes.push({ id: 'sub2', type: 'custom', position: { x: -xStep * 0.5, y: yStep * 2 }, data: { label: 'Physics Engine Fundamentals', icon: 'layers', duration: 'Month 4-5' } });
    nodes.push({ id: 'sub3', type: 'custom', position: { x: xStep * 0.5, y: yStep * 2 }, data: { label: 'Concurrency & Multi-threading', icon: 'code', duration: 'Month 4-5' } });
    nodes.push({ id: 'sub4', type: 'custom', position: { x: xStep * 1.5, y: yStep * 2 }, data: { label: 'Cloud Deployment', icon: 'layers', duration: 'Month 4-5' } });

    edges.push({ id: 'e-pre1-sub1', source: 'pre1', target: 'sub1' });
    edges.push({ id: 'e-pre1-sub2', source: 'pre1', target: 'sub2' });
    edges.push({ id: 'e-pre2-sub3', source: 'pre2', target: 'sub3' });
    edges.push({ id: 'e-pre2-sub4', source: 'pre2', target: 'sub4' });

    // Level 4 (Advanced Integration)
    nodes.push({ id: 'adv1', type: 'custom', position: { x: -xStep * 0.5, y: yStep * 3 }, data: { label: 'AI/ML Model Training', icon: 'code', type: 'advanced', duration: 'Month 6-8' } });
    nodes.push({ id: 'adv2', type: 'custom', position: { x: xStep * 0.5, y: yStep * 3 }, data: { label: 'Hardware-Software Interfacing', icon: 'layers', type: 'advanced', duration: 'Month 6-8' } });

    edges.push({ id: 'e-sub2-adv1', source: 'sub2', target: 'adv1' });
    edges.push({ id: 'e-sub3-adv1', source: 'sub3', target: 'adv1', animated: true });
    edges.push({ id: 'e-sub3-adv2', source: 'sub3', target: 'adv2' });

    // Final Project (Year completion)
    nodes.push({ id: 'final', type: 'custom', position: { x: 0, y: yStep * 4.5 }, data: { label: `Final MVP: ${problemTitle}`, icon: 'code', type: 'final', duration: 'Month 9-12' } });

    edges.push({ id: 'e-adv1-final', source: 'adv1', target: 'final', animated: true });
    edges.push({ id: 'e-adv2-final', source: 'adv2', target: 'final', animated: true });

    return { nodes, edges };
};

const RoadmapGenerator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const problem = location.state?.problem || { title: 'Unknown Protocol' };

    const [level, setLevel] = useState('UG'); // UG, PG
    const [experience, setExperience] = useState('Beginner'); // Beginner, Experienced

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => generateMockRoadmap(problem.title, level), [problem.title, level]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    // Recalculate if user changes level
    React.useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = generateMockRoadmap(problem.title, level);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [level, problem.title]);

    const onInit = useCallback((reactFlowInstance) => {
        reactFlowInstance.fitView({ padding: 50 });
    }, []);

    return (
        <div className="roadmap-container">
            <Panel position="top-left" className="config-panel glass-panel animate-fade-in">
                <h3 className="panel-title">Configure Roadmap</h3>
                <p className="panel-subtitle">Target: <span className="text-gradient">{problem.title}</span></p>

                <div className="config-group">
                    <label>Academic Level</label>
                    <div className="toggle-group">
                        <button className={`toggle-btn ${level === 'UG' ? 'active' : ''}`} onClick={() => setLevel('UG')}>UG</button>
                        <button className={`toggle-btn ${level === 'PG' ? 'active' : ''}`} onClick={() => setLevel('PG')}>PG</button>
                    </div>
                </div>

                <div className="config-group">
                    <label>Prior Experience</label>
                    <select value={experience} onChange={(e) => setExperience(e.target.value)} className="modern-select">
                        <option value="Beginner">Beginner (needs more courses)</option>
                        <option value="Experienced">Experienced (fast-track)</option>
                    </select>
                </div>

                <button className="btn-primary w-full mt-4" onClick={() => alert("Roadmap Saved!")}>
                    Save to Profile
                </button>
            </Panel>

            <div className="flow-wrapper">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onInit={onInit}
                    fitView
                    proOptions={{ hideAttribution: true }}
                    className="dark-flow"
                >
                    <Background color="#ffffff" gap={16} variant="dots" size={1} opacity={0.05} />
                    <Controls className="custom-controls" showInteractive={false} />
                    <MiniMap className="custom-minimap" nodeColor="#6366f1" maskColor="rgba(10, 10, 15, 0.8)" />
                </ReactFlow>
            </div>
        </div>
    );
};

export default RoadmapGenerator;
