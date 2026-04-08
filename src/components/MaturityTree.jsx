import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { X, Star, Shield, Zap, Heart } from 'lucide-react';

const PASSIVES = [
    {
        id: 'group_heal',
        name: 'Curación Radical',
        desc: 'Tus habilidades de Curación restauran un 30% adicional al resto del curso.',
        cost: 1,
        icon: <Heart size={24} className="text-pink-400" />
    },
    {
        id: 'evasion',
        name: 'Tolerancia',
        desc: 'Desarrollas cuero de chancho. Tienes un 15% de probabilidad de ignorar el daño enemigo.',
        cost: 1,
        icon: <Shield size={24} className="text-blue-400" />
    },
    {
        id: 'bonus_damage',
        name: 'Argumento Destructor',
        desc: 'Tus verdades duelen. Todo tu daño aumenta un 20% permanentemente.',
        cost: 2,
        icon: <Zap size={24} className="text-yellow-400" />
    }
];

export default function MaturityTree({ isOpen, onClose }) {
    const { network, user, unlockPassive } = useGameStore();

    if (!isOpen) return null;

    // Get the current local player
    const mainPlayer = network.players.find(p => p.id === 0);
    if (!mainPlayer) return null;

    const handleUnlock = (passiveId, cost) => {
        if (mainPlayer.maturityPoints >= cost && !mainPlayer.unlockedPassives?.includes(passiveId)) {
            unlockPassive(mainPlayer.id, passiveId, cost);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden bg-black">
                                <img src={user?.avatar || mainPlayer.avatar} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                                    Desarrollo Personal <Star className="text-amber-400 fill-amber-400" size={20} />
                                </h2>
                                <p className="text-amber-400 font-bold text-sm">
                                    Puntos de Madurez: <span className="text-white bg-black/50 px-2 py-0.5 rounded ml-1">{mainPlayer.maturityPoints || 0}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white relative z-10 bg-slate-800/80 p-2 rounded-full">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body: Skill Tree */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PASSIVES.map(passive => {
                            const isUnlocked = mainPlayer.unlockedPassives?.includes(passive.id);
                            const canAfford = (mainPlayer.maturityPoints || 0) >= passive.cost;

                            return (
                                <div 
                                    key={passive.id} 
                                    className={`relative p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all ${
                                        isUnlocked 
                                            ? 'bg-amber-900/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                            : canAfford 
                                                ? 'bg-slate-800 border-slate-600 hover:border-amber-400/50' 
                                                : 'bg-slate-800/50 border-slate-700 opacity-60'
                                    }`}
                                >
                                    {isUnlocked && (
                                        <div className="absolute -top-3 -right-3 bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg transform rotate-12">
                                            Adquirida
                                        </div>
                                    )}

                                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center mb-3 border border-white/10 shadow-inner">
                                        {passive.icon}
                                    </div>
                                    <h3 className="text-white font-black uppercase text-sm mb-2">{passive.name}</h3>
                                    <p className="text-slate-400 text-[10px] mb-4 flex-grow leading-relaxed">{passive.desc}</p>
                                    
                                    <button
                                        onClick={() => handleUnlock(passive.id, passive.cost)}
                                        disabled={isUnlocked || !canAfford}
                                        className={`w-full py-2 rounded font-bold text-xs uppercase transition-all ${
                                            isUnlocked 
                                                ? 'bg-amber-500/20 text-amber-500 cursor-default' 
                                                : canAfford 
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {isUnlocked ? 'Activa' : `Aprender (${passive.cost} PT)`}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="bg-slate-900/80 p-3 text-center text-xs text-slate-500 border-t border-slate-800">
                        Los Puntos de Madurez se obtienen al subir de nivel participando en la Mesa de Diálogo.
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
