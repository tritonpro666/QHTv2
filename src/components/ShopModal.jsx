import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Zap, Star } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { SHOP_ITEMS } from '../data/gameData';

export default function ShopModal({ isOpen, onClose }) {
    const { user, addToSessionInventory, syncUser } = useGameStore();

    if (!isOpen) return null;

    const handleBuy = (item) => {
        if (user.points >= item.price) {
            // Deduct points
            syncUser({ points: user.points - item.price });
            // Add to session inventory
            addToSessionInventory(item);
        } else {
            alert("¡No tienes suficientes puntos!");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-900 border-4 border-amber-400 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-amber-400 p-4 flex justify-between items-center text-slate-900">
                        <h2 className="text-2xl font-black uppercase italic flex items-center gap-2">
                            <ShoppingBag size={28} /> Tienda de Sofo
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-900 text-amber-400 px-4 py-1 rounded-full font-bold text-lg border-2 border-slate-800">
                                {user.points.toLocaleString()} PTS
                            </div>
                            <button onClick={onClose} className="bg-slate-900 text-amber-400 p-1 rounded-full hover:bg-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        {SHOP_ITEMS.map((item) => (
                            <div key={item.id} className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 flex flex-col gap-3 group hover:border-amber-400/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="bg-slate-700 p-3 rounded-xl group-hover:bg-amber-400 transition-colors">
                                        {item.type === 'hp' && <Heart className="text-red-400 group-hover:text-slate-900" size={32} />}
                                        {item.type === 'energy' && <Zap className="text-yellow-400 group-hover:text-slate-900" size={32} />}
                                        {item.type === 'both' && <Star className="text-purple-400 group-hover:text-slate-900" size={32} />}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-white">{item.price} <span className="text-xs text-amber-400">PTS</span></span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                                    <p className="text-sm text-slate-400 leading-tight">{item.desc}</p>
                                </div>

                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={user.points < item.price}
                                    className={`mt-2 py-3 rounded-xl font-black uppercase text-sm transition-all shadow-lg active:scale-95 ${user.points >= item.price
                                            ? 'bg-amber-400 text-slate-900 hover:bg-amber-500 hover:shadow-amber-400/20'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    Comprar
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-800 p-4 border-t border-slate-700 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                            Los objetos comprados solo duran durante esta sesión de juego
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
