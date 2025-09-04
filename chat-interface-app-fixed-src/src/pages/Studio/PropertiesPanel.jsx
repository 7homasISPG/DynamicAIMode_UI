import React from 'react';

const PanelInput = ({ label, value, onChange, placeholder }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

const PanelTextarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

const PropertiesPanel = ({ selectedNode, onNodeDataChange }) => {
    if (!selectedNode) {
        return (
            <aside className="absolute top-20 right-4 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-96">
                <h3 className="font-bold text-lg">Properties</h3>
                <p className="text-sm text-gray-500 mt-2">Select a node to view its properties.</p>
            </aside>
        );
    }

    const { type, data, id } = selectedNode;

    const handleChange = (field, value) => {
        onNodeDataChange(id, { ...data, [field]: value });
    };

    return (
        <aside className="absolute top-20 right-4 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-96 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 capitalize">{type} Properties</h3>
            
            {type === 'supervisor' && (
                <PanelTextarea label="System Message" value={data.system_message || ''} onChange={(e) => handleChange('system_message', e.target.value)} placeholder="You are a supervisor..." rows={5} />
            )}

            {type === 'agent' && (
                <>
                    <PanelInput label="Name" value={data.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., Support Agent" />
                    <PanelTextarea label="System Message" value={data.system_message || ''} onChange={(e) => handleChange('system_message', e.target.value)} placeholder="You are a helpful assistant..." rows={5} />
                </>
            )}

            {type === 'tool' && (
                <>
                    <PanelInput label="Name" value={data.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., getWeather" />
                    <PanelTextarea label="Description" value={data.description || ''} onChange={(e) => handleChange('description', e.target.value)} placeholder="Gets the weather for a city." />
                    <PanelInput label="Endpoint" value={data.endpoint || ''} onChange={(e) => handleChange('endpoint', e.target.value)} placeholder="/api/weather" />
                    <PanelTextarea label="Parameters Schema (JSON)" value={data.params_schema ? JSON.stringify(data.params_schema, null, 2) : ''} 
                        onChange={(e) => {
                            try { handleChange('params_schema', JSON.parse(e.target.value)); } 
                            catch (err) { /* Ignore invalid JSON for now */ }
                        }} 
                        placeholder={'{\n  "type": "object",\n  "properties": { ... }\n}'} 
                        rows={8} 
                    />
                </>
            )}
        </aside>
    );
};

export default PropertiesPanel;