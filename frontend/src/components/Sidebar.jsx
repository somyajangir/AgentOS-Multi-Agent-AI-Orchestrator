import React from 'react';
import { MessageSquare, Users, Plus, Trash2 } from 'lucide-react';

const Sidebar = ({
    chats,
    activeChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    currentView,
    onChangeView
}) => {
    return (
        <div className="w-80 bg-neo-cream border-r-3 border-neo-black flex flex-col h-full font-sans">
            {/* Header */}
            <div className="p-6 border-b-3 border-neo-black flex items-center justify-between bg-neo-white">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">AI Support</h2>
                <button
                    onClick={onNewChat}
                    className="p-2 bg-neo-blue border-3 border-neo-black text-white shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all active:bg-blue-600"
                    title="New Chat"
                >
                    <Plus size={24} strokeWidth={3} />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex p-4 gap-4 border-b-3 border-neo-black bg-neo-cream">
                <button
                    onClick={() => onChangeView('chat')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-3 border-neo-black transition-all ${currentView === 'chat' ? 'bg-neo-yellow shadow-neo text-neo-black' : 'bg-white hover:bg-gray-100 text-gray-600 shadow-none'
                        }`}
                >
                    <MessageSquare size={18} strokeWidth={2.5} /> CHATS
                </button>
                <button
                    onClick={() => onChangeView('agents')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-3 border-neo-black transition-all ${currentView === 'agents' ? 'bg-neo-purple shadow-neo text-neo-black' : 'bg-white hover:bg-gray-100 text-gray-600 shadow-none'
                        } ${currentView === 'agents' ? 'bg-neo-pink' : ''}`} // Override for agents active color
                >
                    <Users size={18} strokeWidth={2.5} /> ABILITIES
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neo-cream">
                {chats.length === 0 ? (
                    <div className="text-center text-neo-black font-mono text-xs mt-10 p-4 border-2 border-dashed border-neo-black opacity-50">NO HISTORY FOUND</div>
                ) : (
                    chats.map(chat => (
                        <div
                            key={chat.id}
                            className={`group flex items-center justify-between p-4 border-3 border-neo-black cursor-pointer transition-all ${activeChatId === chat.id ? 'bg-neo-black text-white shadow-neo-sm' : 'bg-white hover:bg-neo-blue hover:text-white hover:shadow-neo-sm'
                                }`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <div className="flex-1 min-w-0 pr-3">
                                <p className="text-base font-bold truncate">{chat.lastMessage}</p>
                                <p className={`text-[10px] font-mono mt-1 ${activeChatId === chat.id ? 'text-gray-400' : 'text-gray-500 group-hover:text-white'}`}>{new Date(chat.updatedAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                                className={`p-2 border-2 border-transparent hover:border-neo-white hover:bg-red-500 hover:text-white rounded-none transition-all ${activeChatId === chat.id ? 'text-gray-400' : 'text-gray-400 group-hover:text-white'}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* User Info */}
            <div className="p-4 border-t-3 border-neo-black bg-neo-yellow">
                <div className="text-xs font-bold uppercase tracking-widest text-neo-black mb-1">Authenticated As</div>
                <div className="text-lg font-black font-mono truncate flex items-center gap-2">
                    <div className="w-3 h-3 bg-neo-green border-2 border-neo-black rounded-full animate-pulse"></div>
                    User
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
