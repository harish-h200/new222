import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

    const [viewMode, setViewMode] = useState('generator'); // 'generator' or 'saved'
    const [savedRoadmaps, setSavedRoadmaps] = useState([]);
    const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
    const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'success' | 'error'

    // Declare ALL flow state first so callbacks below can safely reference setNodes/setEdges
    const [dbCourses, setDbCourses] = useState([]);
    const [dbPrereqs, setDbPrereqs] = useState([]);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const loadSavedRoadmapIntoCanvas = useCallback((rm) => {
        const mappedNodes = rm.nodes.map(n => ({
            id: n.id,
            type: 'custom',
            data: {
                label: n.customLabel || (n.course ? n.course.title : 'Node'),
                type: n.nodeType,
                icon: n.course ? (n.course.tags?.includes('AI') || n.course.tags?.includes('ML') ? 'code' : 'book') : 'layers',
                duration: n.course ? n.course.durationEstimate : null
            },
            position: { x: n.positionX, y: n.positionY }
        }));

        const mappedEdges = rm.edges.map(e => ({
            id: e.id,
            source: e.sourceNodeId,
            target: e.targetNodeId,
            animated: e.isAnimated,
            style: { stroke: '#6366f1', strokeWidth: 2 }
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);
    }, [setNodes, setEdges]);

    const loadSavedRoadmaps = useCallback(async () => {
        const email = localStorage.getItem('userEmail') || 'student@example.com';
        try {
            const res = await fetch(`/api/users/${email}/roadmaps`);
            if (res.ok) {
                const data = await res.json();
                setSavedRoadmaps(data);
                if (data.length > 0) {
                    setSelectedRoadmapId(data[0].id);
                    loadSavedRoadmapIntoCanvas(data[0]);
                } else {
                    setNodes([]);
                    setEdges([]);
                }
            }
        } catch (err) {
            console.error("Failed to load saved roadmaps:", err);
        }
    }, [loadSavedRoadmapIntoCanvas, setNodes, setEdges]);

    const handleSelectSavedRoadmap = (id) => {
        setSelectedRoadmapId(id);
        const rm = savedRoadmaps.find(r => r.id === id);
        if (rm) {
            loadSavedRoadmapIntoCanvas(rm);
        }
    };

    // Load data from local API
    useEffect(() => {
        async function loadData() {
            try {
                const [cRes, pRes] = await Promise.all([
                    fetch('/api/courses'),
                    fetch('/api/prerequisites')
                ]);

                if (cRes.ok && pRes.ok) {
                    const courses = await cRes.json();
                    const prereqs = await pRes.json();
                    setDbCourses(courses);
                    setDbPrereqs(prereqs);
                } else {
                    console.error("Failed to fetch courses/prerequisites from local API");
                }
            } catch (err) {
                console.error("Failed to connect to local API:", err);
            }
        }
        loadData();
    }, []);

    // Generate dynamic roadmap whenever inputs change
    useEffect(() => {
        if (viewMode === 'generator' && dbCourses.length > 0) {
            const { nodes: newNodes, edges: newEdges } = generateDynamicRoadmap(dbCourses, dbPrereqs, problem, level, experience);
            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [viewMode, dbCourses, dbPrereqs, problem, level, experience, setNodes, setEdges]);

    const onInit = useCallback((reactFlowInstance) => {
        setTimeout(() => reactFlowInstance.fitView({ padding: 50 }), 100);
    }, []);

    const handleSave = async () => {
        if (!problem?.id) {
            setSaveStatus('error_no_goal');
            setTimeout(() => setSaveStatus(null), 4000);
            return;
        }
        if (nodes.length === 0) {
            setSaveStatus('error_empty');
            setTimeout(() => setSaveStatus(null), 4000);
            return;
        }

        setSaveStatus('saving');

        try {
            const email = localStorage.getItem('userEmail') || 'student@example.com';
            let userId = null;

            try {
                const userRes = await fetch(`/api/users/${email}`);
                if (userRes.ok) {
                    const user = await userRes.json();
                    userId = user.id;
                }
            } catch (e) {
                console.error("Failed to fetch user by email:", e);
            }

            const payloadNodes = nodes.map(n => ({
                id: n.id,
                courseId: (n.id === 'root' || n.id === 'final') ? null : n.id,
                customLabel: n.data?.label || null,
                nodeType: n.data?.type || 'default',
                positionX: n.position.x,
                positionY: n.position.y,
                status: 'unlocked'
            }));

            const payloadEdges = edges.map(e => ({
                id: e.id,
                sourceNodeId: e.source,
                targetNodeId: e.target,
                isAnimated: e.animated !== undefined ? e.animated : true
            }));

            const response = await fetch('/api/roadmaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goalId: problem.id,
                    userId,
                    email,
                    nodes: payloadNodes,
                    edges: payloadEdges
                })
            });

            if (response.ok) {
                setSaveStatus('success');
            } else {
                const errBody = await response.json().catch(() => ({}));
                console.error('Save failed:', errBody);
                setSaveStatus('error');
            }
        } catch (e) {
            console.error(e);
            setSaveStatus('error');
        }

        setTimeout(() => setSaveStatus(null), 4000);
    };

    return (
        <div className="roadmap-container">
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
                    <Panel position="top-left" className="config-panel glass-panel animate-fade-in">
                        <div className="tab-buttons-container" style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                            <button 
                                className={`tab-btn ${viewMode === 'generator' ? 'active-tab' : ''}`} 
                                onClick={() => {
                                    setViewMode('generator');
                                    if (dbCourses.length > 0) {
                                        const { nodes: newNodes, edges: newEdges } = generateDynamicRoadmap(dbCourses, dbPrereqs, problem, level, experience);
                                        setNodes(newNodes);
                                        setEdges(newEdges);
                                    }
                                }}
                                style={{
                                    background: viewMode === 'generator' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                    border: 'none',
                                    color: viewMode === 'generator' ? '#a5b4fc' : '#94a3b8',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Generator
                            </button>
                            <button 
                                className={`tab-btn ${viewMode === 'saved' ? 'active-tab' : ''}`} 
                                onClick={() => {
                                    setViewMode('saved');
                                    loadSavedRoadmaps();
                                }}
                                style={{
                                    background: viewMode === 'saved' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                    border: 'none',
                                    color: viewMode === 'saved' ? '#a5b4fc' : '#94a3b8',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Saved Roadmaps
                            </button>
                        </div>

                        {viewMode === 'generator' ? (
                            <>
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

                                <button
                                    className="btn-primary w-full mt-4"
                                    onClick={handleSave}
                                    disabled={saveStatus === 'saving'}
                                    style={{ opacity: saveStatus === 'saving' ? 0.7 : 1 }}
                                >
                                    {saveStatus === 'saving' ? 'Saving...' : 'Save to Profile'}
                                </button>

                                {saveStatus === 'success' && (
                                    <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', color: '#86efac', fontSize: '0.85rem' }}>
                                        ✓ Roadmap saved successfully!
                                    </div>
                                )}
                                {saveStatus === 'error' && (
                                    <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem' }}>
                                        ✗ Failed to save. Check backend is running.
                                    </div>
                                )}
                                {saveStatus === 'error_no_goal' && (
                                    <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '8px', color: '#fde047', fontSize: '0.85rem' }}>
                                        ⚠ Please select a problem first from Problem Selection.
                                    </div>
                                )}
                                {saveStatus === 'error_empty' && (
                                    <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '8px', color: '#fde047', fontSize: '0.85rem' }}>
                                        ⚠ Roadmap is empty. Wait for it to generate first.
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className="panel-title">Saved Roadmaps</h3>
                                <p className="panel-subtitle">Select a saved roadmap from your profile.</p>

                                <div className="config-group">
                                    <label>Your Roadmaps</label>
                                    {savedRoadmaps.length === 0 ? (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>No saved roadmaps found.</p>
                                    ) : (
                                        <select 
                                            value={selectedRoadmapId} 
                                            onChange={(e) => handleSelectSavedRoadmap(e.target.value)} 
                                            className="modern-select"
                                            style={{ width: '100%', marginTop: '8px' }}
                                        >
                                            {savedRoadmaps.map(rm => (
                                                <option key={rm.id} value={rm.id}>
                                                    {rm.goal?.title || 'Unnamed Roadmap'} ({new Date(rm.createdAt).toLocaleDateString()})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </>
                        )}
                    </Panel>
                    <Background color="#ffffff" gap={16} variant="dots" size={1} opacity={0.05} />
                    <Controls className="custom-controls" showInteractive={false} />
                    <MiniMap className="custom-minimap" nodeColor="#6366f1" maskColor="rgba(10, 10, 15, 0.8)" />
                </ReactFlow>
            </div>
        </div>
    );
};

export default RoadmapGenerator;
