import React from 'react';
import { Bot, Wrench, Shield } from 'lucide-react';

const paletteItems = [
    { type: 'agent', label: 'Agent', icon: Bot, description: 'A worker AI with a specific persona and tools.' },
    { type: 'tool', label: 'Tool', icon: Wrench, description: 'A function or API the agent can use.' },
];

const PaletteSidebar = () => {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="absolute top-20 left-24 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
            <h3 className="font-bold text-lg mb-4">Nodes</h3>
            <div className="space-y-3">
                {paletteItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.type}
                            className="p-3 border rounded-md cursor-grab bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                            onDragStart={(event) => onDragStart(event, item.type)}
                            draggable
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="h-6 w-6 text-gray-600" />
                                <div>
                                    <p className="font-semibold text-gray-800">{item.label}</p>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default PaletteSidebar;