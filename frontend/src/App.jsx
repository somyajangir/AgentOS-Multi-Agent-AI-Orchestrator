import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ActiveChat from './components/ActiveChat';
import AgentsView from './components/AgentsView';

const API_URL = 'http://localhost:4000/api/chat';

function App() {
    const [userId, setUserId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [view, setView] = useState('chat'); // 'chat' or 'agents'

    // Chat State
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial ID input
    const handleLogin = (e) => {
        e.preventDefault();
        if (userId.trim()) {
            setIsLoggedIn(true);
            fetchConversations(userId);
        }
    };

    const fetchConversations = async (uid) => {
        try {
            const res = await axios.get(`${API_URL}/conversations?userId=${uid}`);
            setChats(res.data.conversations);
        } catch (err) {
            console.error("Failed to load chats", err);
        }
    };

    const loadChat = async (id) => {
        setLoading(true);
        setActiveChatId(id);
        setView('chat');
        try {
            const res = await axios.get(`${API_URL}/conversations/${id}`);
            // map backend messages to frontend format if needed
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error("Failed to load chat history", err);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setActiveChatId(null);
        setMessages([]);
        setView('chat');
    };

    const deleteChat = async (id) => {
        if (!window.confirm("Delete this conversation?")) return;
        try {
            await axios.delete(`${API_URL}/conversations/${id}`);
            setChats(prev => prev.filter(c => c.id !== id));
            if (activeChatId === id) {
                startNewChat();
            }
        } catch (err) {
            console.error("Failed to delete chat", err);
        }
    };

    const handleSendMessage = async (text) => {
        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const payload = {
                message: text,
                conversationId: activeChatId,
                userId: userId
            };

            const res = await axios.post(`${API_URL}/messages`, payload);

            const { conversationId: newConvId, routedTo, agentResponse } = res.data;
            const reply = agentResponse?.reply || "No response received.";
            const steps = agentResponse?.steps || [];

            if (!activeChatId && newConvId) {
                setActiveChatId(newConvId);
                // Refresh chat list to show new conversation
                fetchConversations(userId);
            }

            const agentMsg = {
                role: 'agent',
                content: reply,
                routedTo: routedTo,
                steps: steps
            };

            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'system', content: "Error: Could not reach the agent." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neo-yellow relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-neo-pink border-3 border-neo-black shadow-neo rounded-full opacity-50"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-neo-blue border-3 border-neo-black shadow-neo transform rotate-12 opacity-50"></div>

                <div className="max-w-md w-full bg-neo-white p-8 border-4 border-neo-black shadow-neo-lg relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 bg-neo-green border-3 border-neo-black flex items-center justify-center shadow-neo transform -rotate-6">
                            <UserCircle size={48} className="text-neo-black" strokeWidth={2} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-center mb-2 uppercase italic">Agent OS</h1>
                    <p className="text-neo-black font-mono text-center mb-8 text-sm border-b-2 border-neo-black pb-4">SECURE TERMINAL ACCESS</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-neo-black mb-2 uppercase">Identity Verification</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full bg-neo-cream border-3 border-neo-black p-4 text-neo-black font-mono font-bold placeholder-gray-400 focus:shadow-neo focus:outline-none transition-all"
                                placeholder="ENTER_USER_ID"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-neo-black text-white font-black text-lg py-4 border-2 border-transparent hover:bg-white hover:text-neo-black hover:border-neo-black hover:shadow-neo transition-all uppercase tracking-wider"
                        >
                            Connect Terminal
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-neo-cream text-neo-black font-sans overflow-hidden">
            <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={loadChat}
                onNewChat={startNewChat}
                onDeleteChat={deleteChat}
                currentView={view}
                onChangeView={setView}
            />

            <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
                {view === 'agents' ? (
                    <AgentsView />
                ) : (
                    <ActiveChat
                        messages={messages}
                        loading={loading}
                        onSendMessage={handleSendMessage}
                    />
                )}
            </main>
        </div>
    );
}

export default App;
