import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { sofoAI } from '../services/sofoAIService';
import { safetyProtocol } from '../utils/safetyProtocol';

const INITIAL_MESSAGE = {
    id: 0,
    sender: 'sofo',
    text: "¡Hola! Soy Sofo, tu asistente virtual. Estoy aquí para ayudarte con dudas sobre el liceo, especialidades o si necesitas orientación. ¿En qué puedo ayudarte hoy?"
};



export default function SofoChatModal({ isOpen, onClose }) {
    const { user } = useGameStore();
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Map messages for the AI (excluding the latest one since it's already sent as 'message')
            const history = messages
                .slice(-10) // Take last 10
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    text: m.text
                }));

            // Call AI Service
            const result = await sofoAI.sendMessage(userMsg.text, user, history);

            // Check Critical Alert
            if (result.isCritical) {
                console.warn("⚠️ Critical Threat Detected in Chat");
                safetyProtocol.triggerAdminAlert(user, result);
                // Optionally add a system message to UI?
            }

            const botMsg = {
                id: Date.now() + 1,
                sender: 'sofo',
                text: result.response
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                sender: 'sofo',
                text: "Lo siento, tuve un error de conexión. ¿Podrías intentar de nuevo?"
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-md h-[600px] rounded-2xl shadow-xl overflow-hidden flex flex-col border-4 border-sofofa-lightBlue"
                >
                    {/* Header */}
                    <div className="bg-sofofa-lightBlue p-4 flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full">
                                <Bot className="text-sofofa-blue" size={24} />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Chat con Sofo</h2>
                                <p className="text-xs opacity-90 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> En línea
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-sofofa-blue text-white rounded-br-none' : 'bg-white border text-gray-700 rounded-bl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border text-gray-400 p-3 rounded-2xl rounded-bl-none shadow-sm text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu mensaje aquí..."
                            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-sofofa-blue outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="bg-sofofa-blue text-white p-2 rounded-full hover:bg-sofofa-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} className={isTyping ? "animate-pulse" : ""} />
                        </button>
                    </form>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
