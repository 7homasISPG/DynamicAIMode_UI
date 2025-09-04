import React from 'react';
import { Handle, Position } from 'reactflow';
import { Bot, Wrench, Shield } from 'lucide-react';

const nodeWrapperStyle = "bg-white border-2 rounded-xl shadow-md w-64 overflow-hidden";
const nodeHeaderStyle = "p-3 flex items-center gap-3 text-white font-bold";
const nodeBodyStyle = "p-3 bg-white";

export const SupervisorNode = ({ data }) => (
    <div className={`${nodeWrapperStyle} border-purple-500`}>
        <div className={`${nodeHeaderStyle} bg-purple-500`}>
            <Shield className="h-5 w-5" />
            <span>{data.label}</span>
        </div>
        <div className={nodeBodyStyle}>
            <p className="text-xs text-gray-500 italic">"{data.system_message || 'No persona set.'}"</p>
        </div>
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
    </div>
);

export const AgentNode = ({ data }) => (
    <div className={`${nodeWrapperStyle} border-blue-500`}>
        <div className={`${nodeHeaderStyle} bg-blue-500`}>
            <Bot className="h-5 w-5" />
            <span>{data.name || 'Unnamed Agent'}</span>
        </div>
        <div className={nodeBodyStyle}>
            <p className="text-xs text-gray-500 italic">"{data.system_message || 'No persona set.'}"</p>
        </div>
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
);

export const ToolNode = ({ data }) => (
    <div className={`${nodeWrapperStyle} border-green-500`}>
        <div className={`${nodeHeaderStyle} bg-green-500`}>
            <Wrench className="h-5 w-5" />
            <span>{data.name || 'Unnamed Tool'}</span>
        </div>
        <div className={nodeBodyStyle}>
            <p className="text-xs text-gray-600 font-mono">{data.endpoint || 'No endpoint set.'}</p>
        </div>
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
    </div>
);