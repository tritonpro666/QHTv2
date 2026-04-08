import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageSquare, UserCircle, UserMinus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function FriendsListModal({ isOpen, onClose, onOpenChat, onOpenProfile }) {
    const { user, users, removeFriend } = useGameStore();
    
    // Derived Data
    const friends = (user?.friends || []).map(email => users[email]).filter(Boolean);

    if (!isOpen) return null;

    const handleRemoveFriend = (email, name) => {
        if (window.confirm(`¿Seguro que quieres eliminar a ${name} de tus amigos?`)) {
            removeFriend(email);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sofofa-blue/10 rounded-xl flex items-center justify-center">
                                    <Users className="text-sofofa-blue" size={24} />
                                </div>
                                <h2 className="text-xl font-black text-gray-800 tracking-tight">Mis Amigos</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {friends.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Users size={40} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700">Aún no tienes amigos</h3>
                                    <p className="text-sm text-gray-400 max-w-[250px] mt-2">
                                        Usa el buscador en el menú principal para encontrar y agregar compañeros.
                                    </p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {friends.map(friend => (
                                        <motion.li 
                                            key={friend.email}
                                            layout
                                            className="bg-gray-50 rounded-2xl p-3 flex items-center gap-4 border border-gray-100/50 hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                                    <img src={friend.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-800 truncate">{friend.name}</h3>
                                                <p className="text-xs text-sofofa-accent font-bold">{friend.points} pts</p>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => { onOpenChat(friend.email); onClose(); }}
                                                    className="p-2 text-sofofa-blue hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Chatear"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => { onOpenProfile(friend); onClose(); }}
                                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title="Ver Perfil"
                                                >
                                                    <UserCircle size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRemoveFriend(friend.email, friend.name)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar amigo"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Summary Footer */}
                        <div className="p-4 bg-slate-50 border-t border-gray-100 text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {friends.length} {friends.length === 1 ? 'Amigo conectado' : 'Amigos conectados'}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
