import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Share2, Palette, Code, Settings, RefreshCw } from 'lucide-react';

// --- Import the chat UI building blocks ---
// IMPORTANT: Adjust these paths to match your project structure.
import ChatView from '../../components/ChatView';
import ChatInput from '../../components/ChatInput';

// --- Configuration ---
const API_ASK_URL = 'http://localhost:8000/api/rag';
const WS_BASE_URL = 'ws://localhost:8000/ws';

// --- Right-Side Panel Component (No changes needed) ---
const NextStepsPanel = ({ agent }) => {
    const steps = [
        { icon: Share2, title: 'Share', text: 'Send a link to your bot' },
        { icon: Palette, title: 'Style', text: 'Customize your bot\'s appearance' },
        { icon: Code, title: 'Embed', text: 'Add your bot to your website or app' },
        { icon: Settings, title: 'Advanced', text: 'Build custom workflows and analytics' },
    ];
    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-2">Talk to your personalized AI agent.</h2>
            <p className="text-gray-600 mb-8">This is a preview of your agent, <strong>{agent ? `"${agent.name}"` : ''}</strong>. Start a conversation to test its responses.</p>
            <h3 className="text-lg font-semibold mb-4">What to do next</h3>
            <div className="space-y-4">
                {steps.map(step => (
                    <div key={step.title} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <step.icon className="h-6 w-6 text-gray-500 mr-4"/>
                        <div>
                            <p className="font-semibold">{step.title}</p>
                            <p className="text-sm text-gray-500">{step.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AgentDetailPage = ({ agentId }) => {
    // --- State for Agent Details ---
    const { token } = useAuth();
    const [agent, setAgent] = useState(null);
    const [isLoadingAgent, setIsLoadingAgent] = useState(true);
    const [error, setError] = useState('');

    // --- State for Chat Logic (Merged from ChatInterface) ---
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const ws = useRef(null);
    const [isInteractiveSession, setIsInteractiveSession] = useState(false);
    const messagesEndRef = useRef(null);

    // --- Fetch Agent Details on Mount ---
    useEffect(() => {
        const fetchAgentDetails = async () => {
            if (!agentId || !token) return;
            try {
                const response = await axios.get(`http://localhost:8000/api/agents/${agentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAgent(response.data);
            } catch (err) {
                setError('Failed to load agent details.');
            } finally {
                setIsLoadingAgent(false);
            }
        };
        fetchAgentDetails();
    }, [agentId, token]);

    // --- Chat Logic Hooks (Merged from ChatInterface) ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, []);
    
    // --- WebSocket Connection Logic (Merged from ChatInterface) ---
    const connectWebSocket = useCallback((newSessionId) => {
        // ... (This function is exactly the same as in the previous ChatInterface version)
    }, [token]);

    // --- Message Handling Logic (Merged from ChatInterface) ---
    const handleSendMessage = async (query) => {
        if (!query.trim()) return;
        const userMessage = { role: 'user', content: { text: query }, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        if (isInteractiveSession && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(query);
            return;
        }

        setIsLoading(true);
        try {
            // This page ALWAYS uses the /ask endpoint because it's for a specific agent.
            const endpointUrl = API_ASK_URL;
            const payload = { query, lang: "en", agent_id: agentId };
            const response = await axios.post(endpointUrl, payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const responseData = response.data;
            
            if (responseData.type === 'interactive_session_start') {
                const sid = responseData.session_id;
                setSessionId(sid);
                connectWebSocket(sid);
            } else {
                const assistantMessage = { role: 'assistant', content: responseData, timestamp: new Date().toISOString() };
                setMessages(prev => [...prev, assistantMessage]);
                setIsLoading(false);
            }
        } catch (err) {
            const errorMessage = { role: 'assistant', content: { type: 'answer', text: "Sorry, an error occurred." }, timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const resetConversation = () => {
        setMessages([]);
        if (ws.current) ws.current.close();
        setIsInteractiveSession(false);
        setSessionId(null);
    }

    // --- Render Logic ---
    if (isLoadingAgent) return <div className="p-8 text-center">Loading Agent...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Side: Embedded Chat Widget */}
            <div className="bg-white rounded-xl shadow-lg border flex flex-col h-full">
                <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl mr-3">
                            {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-xs text-gray-500">{agent.system_message}</p>
                        </div>
                    </div>
                    <button onClick={resetConversation} title="Reset Conversation" className="text-gray-500 hover:text-gray-800">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <ChatView messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t">
                    <ChatInput 
                        input={input} 
                        setInput={setInput} 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading} 
                    />
                </div>
            </div>

            {/* Right Side: Next Steps Panel */}
            <div className="hidden lg:block">
                <NextStepsPanel agent={agent} />
            </div>
        </div>
    );
};

export default AgentDetailPage;