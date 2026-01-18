import React, { useEffect, useRef } from 'react';
import Message from './Message';

const ChatWindow = ({ messages, loading }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="max-w-4xl mx-auto space-y-6 pb-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                        <div className="w-24 h-24 bg-neo-yellow border-3 border-neo-black flex items-center justify-center shadow-neo transform rotate-3">
                            <span className="text-4xl">⚡</span>
                        </div>
                        <div className="bg-neo-white border-3 border-neo-black p-6 shadow-neo text-center max-w-md transform -rotate-1">
                            <p className="text-xl font-black text-neo-black mb-2 uppercase">System Ready</p>
                            <p className="text-sm font-mono text-neo-black">
                                Terminal initialized. Enter command to dispatch agents (Order, Billing, Support).
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <Message
                            key={index}
                            role={msg.role}
                            content={msg.content}
                            routedTo={msg.routedTo}
                            steps={msg.steps}
                        />
                    ))
                )}

                {loading && (
                    <div className="flex justify-start w-full max-w-4xl mx-auto pl-2">
                        <div className="bg-neo-white border-3 border-neo-black px-4 py-2 shadow-neo-sm flex items-center gap-2">
                            <span className="w-3 h-3 bg-neo-black animate-bounce"></span>
                            <span className="w-3 h-3 bg-neo-black animate-bounce delay-75"></span>
                            <span className="w-3 h-3 bg-neo-black animate-bounce delay-150"></span>
                            <span className="font-mono text-xs font-bold uppercase ml-2">Processing</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default ChatWindow;
