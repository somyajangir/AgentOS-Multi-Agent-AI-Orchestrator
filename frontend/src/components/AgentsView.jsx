import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, ShoppingBag, CreditCard, StickyNote, Cpu } from 'lucide-react';

const API_URL = 'http://localhost:4000/api';

const AgentsView = () => {
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/agents`).then(res => {
            setAgents(res.data.agents);
        }).catch(err => console.error("Failed to fetch agents", err));
    }, []);

    const getIcon = (id) => {
        switch (id) {
            case 'support': return <StickyNote size={40} className="text-neo-black" strokeWidth={2} />;
            case 'order': return <ShoppingBag size={40} className="text-neo-black" strokeWidth={2} />;
            case 'billing': return <CreditCard size={40} className="text-neo-black" strokeWidth={2} />;
            default: return <Bot size={40} className="text-neo-black" strokeWidth={2} />;
        }
    };

    const getColor = (id) => {
        switch (id) {
            case 'support': return 'bg-neo-blue';
            case 'order': return 'bg-neo-yellow';
            case 'billing': return 'bg-neo-green';
            default: return 'bg-neo-pink';
        }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-white min-h-full">
            <h1 className="text-4xl font-black text-neo-black mb-8 uppercase italic border-b-4 border-neo-black inline-block">Available Agents</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {agents.map(agent => (
                    <div key={agent.id} className="bg-neo-cream border-3 border-neo-black p-6 shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all relative overflow-hidden group">
                        {/* Decorative Strip */}
                        <div className={`absolute top-0 left-0 w-full h-2 ${getColor(agent.id)} border-b-3 border-neo-black`}></div>

                        <div className={`mb-6 ${getColor(agent.id)} w-20 h-20 border-3 border-neo-black flex items-center justify-center shadow-neo-sm group-hover:rotate-12 transition-transform`}>
                            {getIcon(agent.id)}
                        </div>

                        <h3 className="text-2xl font-black text-neo-black mb-2 uppercase">{agent.name}</h3>
                        <p className="text-neo-black font-mono text-sm mb-6 leading-relaxed border-b-2 border-neo-black pb-4">{agent.description}</p>

                        <div className="space-y-3">
                            <p className="text-xs font-bold text-neo-black uppercase tracking-widest bg-neo-white inline-block px-2 border-2 border-neo-black shadow-neo-sm">Capabilities</p>
                            <ul className="text-sm text-neo-black space-y-2 font-medium">
                                {agent.capabilities?.map((cap, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 ${getColor(agent.id)} border border-neo-black shrink-0`}></div>
                                        {cap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentsView;
