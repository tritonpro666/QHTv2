import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, X, Wifi } from 'lucide-react';

export default function GameModeModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <div className="bg-white rounded-3xl p-8 max-w-2xl w-full relative overflow-hidden">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <X size={24} />
                    </button>

                    <h2 className="text-3xl font-black text-center text-gray-800 mb-8 uppercase tracking-widest">
                        Selecciona Modo de Juego
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SOLO MODE */}
                        <motion.button
                            whileHover={{ scale: 1.05, borderColor: '#3B82F6' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect('SOLO')}
                            className="bg-gradient-to-br from-blue-50 to-white border-2 border-transparent p-8 rounded-2xl shadow-lg flex flex-col items-center gap-4 group"
                        >
                            <div className="bg-blue-100 p-6 rounded-full text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <User size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-700">Solitario</h3>
                            <p className="text-sm text-gray-500 text-center">Juega contra la IA. Bots inteligentes y decisiones rápidas.</p>
                        </motion.button>

                        {/* ONLINE MODE */}
                        <motion.button
                            whileHover={{ scale: 1.05, borderColor: '#10B981' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect('ONLINE')}
                            className="bg-gradient-to-br from-green-50 to-white border-2 border-transparent p-8 rounded-2xl shadow-lg flex flex-col items-center gap-4 group"
                        >
                            <div className="bg-green-100 p-6 rounded-full text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                <Users size={48} />
                                <div className="absolute top-6 right-8 animate-pulse text-green-400 opacity-0 group-hover:opacity-100">
                                    <Wifi size={24} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-700">Multijugador</h3>
                            <p className="text-sm text-gray-500 text-center">Crea una sala e invita amigos. ¡Juego real entre dispositivos!</p>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
