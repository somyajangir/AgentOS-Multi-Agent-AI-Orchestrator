import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, StickyNote, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';

const Message = ({ role, content, routedTo, steps = [] }) => {
    const isUser = role === 'user';
    const [displayedSteps, setDisplayedSteps] = useState([]);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!isUser && steps && steps.length > 0) {
            let currentStep = 0;
            const interval = setInterval(() => {
                if (currentStep < steps.length) {
                    setDisplayedSteps(prev => [...prev, steps[currentStep]]);
                    currentStep++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => setShowContent(true), 800);
                }
            }, 1000); // 1 step per second
            return () => clearInterval(interval);
        } else {
            setShowContent(true);
        }
    }, [steps, isUser]);

    // Icon based on role/agent
    const getIcon = () => {
        if (isUser) return <User size={20} className="text-white" strokeWidth={2.5} />;

        // For agent responses, check the RoutedTo/Role
        const agent = routedTo || role;
        switch (agent) {
            case 'support': return <StickyNote size={20} className="text-neo-black" strokeWidth={2.5} />;
            case 'order': return <ShoppingBag size={20} className="text-neo-black" strokeWidth={2.5} />;
            case 'billing': return <CreditCard size={20} className="text-neo-black" strokeWidth={2.5} />;
            default: return <Bot size={20} className="text-neo-black" strokeWidth={2.5} />;
        }
    };

    const getAgentName = () => {
        if (isUser) return "YOU";
        const agent = routedTo || role;
        return (agent.charAt(0).toUpperCase() + agent.slice(1) + " BOT").toUpperCase();
    };

    const getBgColor = () => {
        if (isUser) return 'bg-neo-blue';
        const agent = routedTo || role;
        switch (agent) {
            case 'support': return 'bg-neo-pink';
            case 'order': return 'bg-neo-yellow';
            case 'billing': return 'bg-neo-green';
            default: return 'bg-neo-white';
        }
    }

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 border-3 border-neo-black flex items-center justify-center shadow-neo-sm ${isUser ? 'bg-neo-black' : getBgColor()}`}>
                    {getIcon()}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs font-bold text-neo-black mb-1 px-1 uppercase tracking-wider">{getAgentName()}</span>

                    {/* Steps Display */}
                    {!isUser && displayedSteps.length > 0 && (
                        <div className="mb-2 bg-neo-white border-2 border-neo-black p-3 shadow-neo-sm w-full font-mono text-xs">
                            {displayedSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2 mb-1 last:mb-0 text-neo-black">
                                    <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                                    <span>{step}</span>
                                </div>
                            ))}
                            {displayedSteps.length < steps.length && (
                                <div className="flex items-center gap-2 mt-2 pl-5 text-gray-500 animate-pulse">
                                    <span>...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Content */}
                    {(showContent || isUser) && (
                        <div className={`p-5 text-sm font-medium leading-relaxed border-3 border-neo-black shadow-neo ${isUser
                            ? 'bg-neo-black text-white rounded-none' // User black bubble
                            : 'bg-white text-neo-black rounded-none' // Agent white bubble
                            } animate-in fade-in duration-500`}>
                            {isUser ? content : <ReactMarkdown>{content}</ReactMarkdown>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Message;
