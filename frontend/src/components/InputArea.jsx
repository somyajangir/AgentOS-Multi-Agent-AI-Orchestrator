import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const InputArea = ({ onSendMessage, disabled, loading }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled && !loading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-6 border-t-3 border-neo-black bg-neo-white sticky bottom-0 z-20"
        >
            <div className="max-w-4xl mx-auto relative flex items-center gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={disabled || loading}
                    placeholder={loading ? "WAITING FOR RESPONSE..." : "ENTER COMMAND..."}
                    className="w-full bg-neo-cream text-neo-black font-mono font-medium placeholder-gray-400 border-3 border-neo-black py-4 pl-4 pr-4 focus:outline-none focus:shadow-neo transition-all shadow-none"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || disabled || loading}
                    className="h-full px-6 py-4 bg-neo-green border-3 border-neo-black text-neo-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center"
                >
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} strokeWidth={2.5} />}
                </button>
            </div>
        </form>
    );
};

export default InputArea;
