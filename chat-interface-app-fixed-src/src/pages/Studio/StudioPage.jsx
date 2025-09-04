import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, { Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Save } from 'lucide-react';
import axios from 'axios';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import PaletteSidebar from './PaletteSidebar';
import PropertiesPanel from './PropertiesPanel';
import { AgentNode, ToolNode, SupervisorNode } from './CustomNodes';

const nodeTypes = { agent: AgentNode, tool: ToolNode, supervisor: SupervisorNode };

let id = 0;
const getId = () => `dndnode_${id++}`;

const StudioPage = () => {
    const { token } = useAuth();
    const reactFlowWrapper = useRef(null);
    const { toast } = useToast();

    const [nodes, setNodes] = useState([
        { id: 'supervisor', type: 'supervisor', position: { x: 400, y: 50 }, data: { label: 'Supervisor', system_message: 'You are a helpful supervisor.' } }
    ]);
    const [edges, setEdges] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const onNodesChange = useCallback((changes) => {
        setNodes((currentNodes) => {
            const newNodes = applyNodeChanges(changes, currentNodes);
            const selectionChange = changes.find(c => c.type === 'select');
            if (selectionChange) {
                const node = newNodes.find(n => n.id === selectionChange.id);
                setSelectedNode(selectionChange.selected ? node : null);
            }
            return newNodes;
        });
    }, []);

    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type || !reactFlowWrapper.current) return;
        const position = reactFlowWrapper.current.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode = {
            id: getId(),
            type,
            position,
            data: type === 'agent' ? { name: 'New Agent', system_message: '' } : { name: 'New Tool', description: '', endpoint: '', params_schema: {} }
        };
        setNodes((nds) => nds.concat(newNode));
    }, []);

    const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

    const onNodeDataChange = (nodeId, newData) => {
        setNodes((nds) => nds.map(node => node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node));
        if (selectedNode?.id === nodeId) {
            setSelectedNode(prev => ({ ...prev, data: { ...prev.data, ...newData } }));
        }
    };

    const handleSaveFlow = async () => {
        const supervisorNode = nodes.find(n => n.type === 'supervisor');
        if (!supervisorNode) {
            toast({ title: "Error", description: "A Supervisor node is required to save the flow.", variant: "destructive" });
            return;
        }

        const supervisorProfile = {
            name: "Supervisor", model: "gpt-4o-2024-05-13", persona: "Supervisor",
            supervisor_system_message: supervisorNode.data.system_message
        };

        const agentNodes = nodes.filter(n => n.type === 'agent');
        const assistants = agentNodes.map(agentNode => {
            const connectedEdges = edges.filter(e => e.source === agentNode.id);
            const toolIds = connectedEdges.map(e => e.target);
            const tools = nodes
                .filter(n => toolIds.includes(n.id) && n.type === 'tool')
                .map(toolNode => ({
                    name: toolNode.data.name,
                    description: toolNode.data.description,
                    endpoint: toolNode.data.endpoint,
                    params_schema: typeof toolNode.data.params_schema === 'string' ? JSON.parse(toolNode.data.params_schema) : toolNode.data.params_schema
                }));
            
            return {
                name: agentNode.data.name,
                system_message: agentNode.data.system_message,
                tasks: tools
            };
        });

        const assistantsConfig = { assistants };

        try {
            await axios.post('http://localhost:8000/api/save-supervisor-profile', supervisorProfile, { headers: { Authorization: `Bearer ${token}` } });
            await axios.post('http://localhost:8000/api/save-assistants-config', assistantsConfig, { headers: { Authorization: `Bearer ${token}` } });
            toast({ title: "Success", description: "Flow saved and deployed successfully!" });
        } catch (error) {
            toast({ title: "Save Failed", description: "Could not save the flow. Check console for details.", variant: "destructive" });
            console.error("Save failed:", error);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-4rem)]" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-100"
            >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
            
            <PaletteSidebar />
            <PropertiesPanel selectedNode={selectedNode} onNodeDataChange={onNodeDataChange} />
            
            <div className="absolute top-4 right-4 z-10">
                <button onClick={handleSaveFlow} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
                    <Save className="h-4 w-4" />
                    Save & Deploy
                </button>
            </div>
        </div>
    );
};

export default StudioPage;