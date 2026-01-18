import React from 'react';
import ChatWindow from './ChatWindow';
import InputArea from './InputArea';

const ActiveChat = ({ messages, loading, onSendMessage }) => {
    return (
        <div className="flex flex-col h-full w-full bg-white font-sans text-neo-black relative">
            {/* Subtle Pattern Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <ChatWindow messages={messages} loading={loading} />
            <InputArea onSendMessage={onSendMessage} disabled={loading} loading={loading} />
        </div>
    );
};

export default ActiveChat;
