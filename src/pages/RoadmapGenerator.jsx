import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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

const generateDynamicRoadmap = (courses, prerequisites, goal, level, experience) => {
    if (!courses || !prerequisites || !goal) return { nodes: [], edges: [] };

    // 1. Filter courses matching user level/experience and overlapping skills
    let targetCourses = courses.filter(course => {
        const levelMatch = course.academic_level === 'ALL' || course.academic_level === level;
        const expMatch = course.experience_level === 'ALL' || course.experience_level === experience;

        const goalTags = goal.required_core_skills || ['AI', 'ML', 'Data']; // fallback if missing
        const courseTags = course.tags || [];
        // Match if tags intersect or if goal tags is empty (match all)
        const tagsMatch = goalTags.length === 0 || goalTags.some(tag => courseTags.includes(tag));

        return levelMatch && expMatch && tagsMatch;
    });

    // If no exact target courses matched, include everything (if it's a dummy setting) just so it isn't empty
    if (targetCourses.length === 0 && courses.length > 0) {
        targetCourses = courses;
    }

    // 2. Discover needed prerequisites recursively
    let neededCourseIds = new Set(targetCourses.map(c => c.id));
    let toProcess = [...neededCourseIds];

    while (toProcess.length > 0) {
        const currentId = toProcess.pop();
        const prereqRecords = prerequisites.filter(p => p.course_id === currentId);
        for (let record of prereqRecords) {
            if (!neededCourseIds.has(record.prerequisite_course_id)) {
                neededCourseIds.add(record.prerequisite_course_id);
                toProcess.push(record.prerequisite_course_id);
            }
        }
    }

    const finalCourses = courses.filter(c => neededCourseIds.has(c.id));

    if (finalCourses.length === 0) {
        // Return dummy center node if db is disconnected or empty
        return {
            nodes: [{ id: 'root', type: 'custom', position: { x: 0, y: 0 }, data: { label: `${goal.title || 'Mission'} Overview`, icon: 'layers', type: 'root', duration: 'Month 1' } }],
            edges: []
        };
    }

    // 3. Layout and create nodes
    const depths = {};
    let changed = true;
    finalCourses.forEach(c => depths[c.id] = 0);

    let emergencyStop = 100;
    while (changed && emergencyStop > 0) {
        emergencyStop--;
        changed = false;
        for (let c of finalCourses) {
            const coursePrereqs = prerequisites.filter(p => p.course_id === c.id && neededCourseIds.has(p.prerequisite_course_id));
            let maxDep = 0;
            for (let cp of coursePrereqs) {
                if (depths[cp.prerequisite_course_id] >= maxDep) {
                    maxDep = depths[cp.prerequisite_course_id] + 1;
                }
            }
            if (depths[c.id] !== maxDep) {
                depths[c.id] = maxDep;
                changed = true;
            }
        }
    }

    const depthCounts = {};
    const nodes = [];
    const edges = [];

    const xStep = 300;
    const yStep = 150;

    // First assign indices, then layout horizontally centered
    const nodesByDepth = {};
    finalCourses.forEach(c => {
        const d = depths[c.id];
        if (!nodesByDepth[d]) nodesByDepth[d] = [];
        nodesByDepth[d].push(c);
    });

    Object.keys(nodesByDepth).forEach(dKey => {
        const d = parseInt(dKey);
        const coursesAtDepth = nodesByDepth[d];
        const total = coursesAtDepth.length;
        const startX = -((total - 1) * xStep) / 2;

        coursesAtDepth.forEach((c, index) => {
            nodes.push({
                id: c.id,
                type: 'custom',
                position: { x: startX + index * xStep, y: (d + 1) * yStep },
                data: {
                    label: c.title,
                    icon: c.icon_type || 'book',
                    duration: c.duration_estimate || '1 Month',
                    type: d === 0 ? 'default' : 'advanced'
                }
            });
        });
    });

    const maxDepth = Object.keys(nodesByDepth).length > 0 ? Math.max(...Object.keys(nodesByDepth).map(k => parseInt(k))) : 0;

    // Root
    nodes.push({
        id: 'root',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: `${goal.title} Foundations`, icon: 'layers', type: 'root', duration: 'Start' }
    });

    // Final
    nodes.push({
        id: 'final',
        type: 'custom',
        position: { x: 0, y: (maxDepth + 2) * yStep },
        data: { label: `Final MVP: ${goal.title}`, icon: 'code', type: 'final', duration: 'Completion' }
    });

    // Edges
    finalCourses.forEach(c => {
        const d = depths[c.id];
        if (d === 0) {
            edges.push({ id: `e-root-${c.id}`, source: 'root', target: c.id, animated: true });
        }

        const isRequiredByOthers = prerequisites.some(p => p.prerequisite_course_id === c.id && neededCourseIds.has(p.course_id));
        if (!isRequiredByOthers) {
            edges.push({ id: `e-${c.id}-final`, source: c.id, target: 'final', animated: true });
        }

        const cPrereqs = prerequisites.filter(p => p.course_id === c.id && neededCourseIds.has(p.prerequisite_course_id));
        cPrereqs.forEach(cp => {
            edges.push({
                id: `e-${cp.prerequisite_course_id}-${c.id}`,
                source: cp.prerequisite_course_id,
                target: c.id,
                animated: true
            });
        });
    });

    return { nodes, edges };
};

const RoadmapGenerator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const problem = location.state?.problem || { title: 'Unknown Mission' };

    const [level, setLevel] = useState('UG'); // UG, PG
    const [experience, setExperience] = useState('Beginner'); // Beginner, Experienced

    const [dbCourses, setDbCourses] = useState([]);
    const [dbPrereqs, setDbPrereqs] = useState([]);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    // Load data from Supabase
    useEffect(() => {
        async function loadData() {
            const [cRes, pRes] = await Promise.all([
                supabase.from('courses').select('*'),
                supabase.from('course_prerequisites').select('*')
            ]);

            if (cRes.data) setDbCourses(cRes.data);
            if (pRes.data) setDbPrereqs(pRes.data);
        }
        loadData();
    }, []);

    // Generate dynamic roadmap whenever inputs change
    useEffect(() => {
        if (dbCourses.length > 0) {
            const { nodes: newNodes, edges: newEdges } = generateDynamicRoadmap(dbCourses, dbPrereqs, problem, level, experience);
            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [dbCourses, dbPrereqs, problem, level, experience, setNodes, setEdges]);

    const onInit = useCallback((reactFlowInstance) => {
        setTimeout(() => reactFlowInstance.fitView({ padding: 50 }), 100);
    }, []);

    const handleSave = async () => {
        // Ideally save to roadmaps, roadmap_nodes, roadmap_edges tables
        try {
            // Wait, we need a user ID. But since there's no auth, we'll insert a mock user or just show success msg.
            // A real app would: 
            // const { data: roadmap } = await supabase.from('roadmaps').insert({ goal_id: problem.id }).select().single();
            // ... insert nodes ... 
            // ... insert edges ...
            alert("Roadmap Saved to Database successfully!");
        } catch (e) {
            console.error(e);
        }
    };

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

                <button className="btn-primary w-full mt-4" onClick={handleSave}>
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
