import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, X, Skull } from 'lucide-react';

export default function PlayerSelectionModal({ isOpen, onClose, players, onSelectPlayer, title, description, filterDead = false }) {
    const availablePlayers = filterDead
        ? players.filter(p => p.hp <= 0)  // Show only dead players for revive
        : players.filter(p => p.hp > 0);   // Show only alive players for heal/buff

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-slate-900 border-2 border-amber-400 rounded-3xl shadow-2xl max-w-2xl w-full p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-amber-400 uppercase italic">{title}</h2>
                        <p className="text-sm text-gray-400 mt-1">{description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Player Grid */}
                {availablePlayers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No hay jugadores disponibles</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {availablePlayers.map((player) => (
                            <motion.button
                                key={player.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onSelectPlayer(player.id);
                                    onClose();
                                }}
                                className={`p-4 rounded-2xl border-2 transition-all ${player.hp <= 0
                                        ? 'bg-gray-800 border-gray-600'
                                        : 'bg-slate-800 border-slate-700 hover:border-amber-400'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 rounded-xl bg-slate-700 border-2 border-white/10 overflow-hidden shrink-0 relative">
                                        <img src={player.avatar} className="w-full h-full object-cover" />
                                        {player.hp <= 0 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Skull size={24} className="text-red-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 text-left">
                                        <h3 className="text-lg font-black text-white mb-2">{player.name}</h3>

                                        {player.hp > 0 ? (
                                            <>
                                                {/* HP Bar */}
                                                <div className="mb-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <Heart size={10} /> HP
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{player.hp}/{player.maxHp}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-green-600 to-green-400"
                                                            style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Energy Bar */}
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <Zap size={10} /> Energía
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{player.energy}/{player.maxEnergy}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-yellow-400"
                                                            style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-red-500 font-black text-sm">MUERTO</div>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
