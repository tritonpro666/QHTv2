import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Coins, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const STORE_ITEMS = [
    { id: 'hat_cool', name: 'Gorro Cool', price: 50, icon: '🧢' },
    { id: 'glasses_sun', name: 'Lentes de Sol', price: 100, icon: '🕶️' },
    { id: 'shirt_sofofa', name: 'Polera SOFOFA', price: 200, icon: '👕' },
    { id: 'pet_cat', name: 'Mascota Gato', price: 500, icon: '🐱' },
];

export default function StoreModal({ isOpen, onClose }) {
    const { user, buyItem } = useGameStore();

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
                    initial={{ scale: 0.9, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 50, opacity: 0 }}
                    className="bg-white w-full max-w-2xl h-[600px] rounded-2xl shadow-xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-orange-500 p-6 text-white flex justify-between items-center shadow-md z-10">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <ShoppingBag /> Tienda Escolar
                            </h2>
                            <p className="text-orange-100 text-sm">¡Personaliza tu estilo!</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-black/20 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                <Coins size={20} className="text-yellow-300" />
                                {user.points} pts
                            </div>
                            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {STORE_ITEMS.map((item) => {
                                const isOwned = user.inventory?.some(i => i.id === item.id);
                                const canAfford = user.points >= item.price;

                                return (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1 hover:shadow-md">
                                        <div className="text-6xl mb-2">{item.icon}</div>
                                        <h3 className="font-bold text-gray-800">{item.name}</h3>

                                        {isOwned ? (
                                            <div className="mt-auto px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold flex items-center gap-1">
                                                <Check size={16} /> Comprado
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => buyItem(item)}
                                                disabled={!canAfford}
                                                className={`mt-auto w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors ${canAfford ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                <Coins size={16} /> {item.price}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
