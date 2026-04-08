import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Users, MessageCircle, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function SocialChatModal({ isOpen, onClose, initialChatId = null }) {
    const { user, users, chats, sendMessage, getChatIdForDirectMessage, markChatAsRead, subscribeToChat, fetchProfiles } = useGameStore();
    
    // UI State
    const [activeChatId, setActiveChatId] = useState(initialChatId);
    const [isMaximized, setIsMaximized] = useState(false);
    const messagesEndRef = useRef(null);

    // Sync state with prop and setup subscription
    useEffect(() => {
        if (initialChatId) {
            setActiveChatId(initialChatId);
        }
    }, [initialChatId]);

    // Setup Realtime Subscription for active chat
    useEffect(() => {
        if (!activeChatId) return;
        
        const unsubscribe = subscribeToChat(activeChatId);
        markChatAsRead(activeChatId);

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [activeChatId, subscribeToChat, markChatAsRead]);

    // Fetch friend profiles if needed
    useEffect(() => {
        if (user?.friends?.length > 0) {
            fetchProfiles(user.friends);
        }
    }, [user?.friends, fetchProfiles]);
    
    // Derived Data
    const friendsList = (user?.friends || []).map(email => users[email]).filter(Boolean);
    
    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats, activeChatId]);

    // Helper: Get chat logic
    const handleSelectFriend = (friendEmail) => {
        const directChatId = getChatIdForDirectMessage(user?.email, friendEmail);
        setActiveChatId(directChatId);
        markChatAsRead(directChatId);
    };

    const activeChat = activeChatId ? (chats || {})[activeChatId] : null;

    // Optimized effect: Mark as read only when opening, switching chats, or when a NEW message arrives
    const messagesCount = activeChat?.messages?.length || 0;

    useEffect(() => {
        if (isOpen && activeChatId) {
            markChatAsRead(activeChatId);
        }
    }, [isOpen, activeChatId, messagesCount, markChatAsRead]);

    const [messageInput, setMessageInput] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChatId) return;
        
        sendMessage(activeChatId, messageInput);
        setMessageInput('');
    };

    // Close and reset state
    const handleClose = () => {
        setIsMaximized(false);
        onClose();
    };

    const isChatUnread = (chatId, lastMessage) => {
        if (!lastMessage || lastMessage.sender_email === user?.email) return false;
        const lastReadTimestamp = (user?.lastReadChats || {})[chatId] || 0;
        return new Date(lastMessage.timestamp).getTime() > lastReadTimestamp;
    };
return (
        <AnimatePresence>
            {isOpen && (
                <div className={`fixed z-[100] flex items-end justify-end pointer-events-none p-0 transition-all duration-300 ${
                    isMaximized ? 'inset-0' : 'bottom-0 right-0 sm:bottom-20 sm:right-6 inset-auto'
                }`}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                        }}
                        className={`bg-white pointer-events-auto shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 ${
                            isMaximized 
                                ? 'w-full h-full sm:w-[85vw] sm:h-[85vh] sm:rounded-3xl sm:m-auto' 
                                : 'rounded-t-2xl sm:rounded-2xl w-full h-[80vh] sm:h-[600px] sm:max-h-[min(600px,calc(100vh-120px))] w-full sm:w-[400px]'
                        }`}
                    >
                        {!activeChatId ? (
                            // --- FRIEND LIST VIEW ---
                            <div className="flex flex-col h-full w-full bg-slate-50">
                                {/* Improved Header */}
                                <div className="h-16 px-4 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-20 sticky top-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <MessageCircle className="text-sofofa-blue" size={24} />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-800 tracking-tight">
                                            Mensajes
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setIsMaximized(!isMaximized)} 
                                            className="p-2.5 text-gray-500 hover:text-sofofa-blue hover:bg-blue-50 rounded-xl transition-all hidden sm:flex"
                                            title={isMaximized ? "Restaurar" : "Maximizar"}
                                        >
                                            {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                        </button>
                                        <button onClick={handleClose} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                            <X size={22} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {friendsList.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center min-h-full p-8 text-center bg-white/50 backdrop-blur-sm">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                                <Users size={40} className="text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-700 mb-2">¡Comienza tu red social!</h3>
                                            <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
                                                Busca a otros estudiantes en el buscador de arriba para agregarlos y chatear.
                                            </p>
                                        </div>
                                    ) : (
                                        <ul className="bg-white divide-y divide-gray-50">
                                            {friendsList.map(friend => {
                                                const dmId = getChatIdForDirectMessage(user?.email, friend?.email);
                                                const chatData = (chats || {})[dmId];
                                                const lastMessage = chatData?.messages && Array.isArray(chatData.messages) && chatData.messages.length > 0 
                                                                    ? chatData.messages[chatData.messages.length - 1] 
                                                                    : null;
                                                const isUnread = isChatUnread(dmId, lastMessage);

                                                return (
                                                    <li key={friend.email}>
                                                        <button 
                                                            onClick={() => handleSelectFriend(friend.email)}
                                                            className="w-full p-4 flex items-center gap-4 hover:bg-sofofa-blue/5 transition-all text-left relative group"
                                                        >
                                                            <div className="relative">
                                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-200 shrink-0 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                                                                    <img src={friend.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-baseline mb-0.5">
                                                                    <h3 className={`font-black truncate ${isUnread ? 'text-black' : 'text-gray-700'}`}>{friend.name}</h3>
                                                                    {lastMessage && (
                                                                        <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                                            {new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className={`text-sm truncate leading-tight ${isUnread ? 'text-sofofa-blue font-bold opacity-100' : 'text-gray-400 opacity-80'}`}>
                                                                    {lastMessage ? lastMessage.text : "Toca para saludar 👋"}
                                                                </p>
                                                            </div>
                                                            {isUnread && (
                                                                <div className="w-3 h-3 bg-sofofa-blue rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                                            )}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // --- CHAT VIEW ---
                            <div className="flex flex-col h-full w-full bg-white relative">
                                {/* Improved Chat Header */}
                                <div className="h-16 px-3 sm:px-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-20 shrink-0 sticky top-0">
                                    <button 
                                        onClick={() => setActiveChatId(null)} 
                                        className="p-2 text-gray-500 hover:text-sofofa-blue hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <ArrowLeft size={22} />
                                    </button>
                                    
                                    {(() => {
                                        const receiverEmail = activeChatId.split('_').find(e => e !== user?.email);
                                        const receiver = (users || {})[receiverEmail];
                                        return receiver ? (
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-100">
                                                    <img src={receiver.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-extrabold text-gray-800 truncate leading-none mb-1">{receiver.name}</h3>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Activo ahora</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <h3 className="font-bold text-gray-800">Chat</h3>
                                        );
                                    })()}
                                    
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => setIsMaximized(!isMaximized)} 
                                            className="p-2 text-gray-400 hover:text-sofofa-blue hover:bg-blue-50 rounded-xl transition-all hidden sm:flex"
                                            title={isMaximized ? "Restaurar" : "Maximizar"}
                                        >
                                            {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                        </button>
                                        <button onClick={handleClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <X size={22} />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative space-y-4 custom-scrollbar">
                                    {(!activeChat || !activeChat.messages || !Array.isArray(activeChat.messages) || activeChat.messages.length === 0) ? (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col opacity-60">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                                <MessageCircle size={32} className="text-sofofa-blue" />
                                            </div>
                                            <p className="font-bold">Escribe algo...</p>
                                            <p className="text-xs">¡Que no te de vergüenza saludar!</p>
                                        </div>
                                    ) : (
                                        <>
                                            {activeChat.messages.map((msg, idx) => {
                                                const isMe = msg.sender_email === user?.email;
                                                return (
                                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                                            isMe ? 'bg-sofofa-blue text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                        }`}>
                                                            <p className="text-[15px] whitespace-pre-wrap break-words leading-relaxed font-medium">{msg.text}</p>
                                                            <div className={`flex items-center gap-1 justify-end mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                                <p className="text-[10px] font-bold">
                                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} className="h-2" />
                                        </>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-3 sm:p-5 bg-white border-t border-gray-100 shrink-0">
                                    <form onSubmit={handleSendMessage} className={`flex gap-3 relative ${isMaximized ? 'max-w-4xl mx-auto' : ''}`}>
                                        <div className="flex-1 relative">
                                            <input 
                                                type="text" 
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                placeholder="Escribe un mensaje..."
                                                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-sofofa-blue focus:bg-white rounded-2xl pl-5 pr-14 py-4 text-sm transition-all outline-none font-medium text-gray-700"
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={!messageInput.trim()}
                                                className="absolute right-2 top-2 bottom-2 bg-sofofa-blue text-white rounded-xl px-4 flex items-center justify-center disabled:grayscale disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
