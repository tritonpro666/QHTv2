import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, Package } from 'lucide-react';

export default function InventoryModal({ isOpen, onClose, inventory, onUseItem }) {
    const [selectedItem, setSelectedItem] = useState(null);

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const handleConfirmUse = () => {
        if (selectedItem) {
            onUseItem(selectedItem.sessionId);
            setSelectedItem(null);
        }
    };

    const handleCancel = () => {
        setSelectedItem(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-slate-900 border-2 border-amber-400/30 rounded-3xl shadow-2xl shadow-amber-400/10 max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                            <Package size={24} className="text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Inventario</h2>
                            <p className="text-xs text-slate-800 font-bold">{inventory.length} objetos disponibles</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center transition-colors"
                    >
                        <X size={20} className="text-amber-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {inventory.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={64} className="text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg font-bold">Tu inventario está vacío</p>
                            <p className="text-gray-500 text-sm mt-2">Compra objetos en la tienda para usarlos en combate</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {inventory.map((item) => (
                                <motion.button
                                    key={item.sessionId}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleItemClick(item)}
                                    className="bg-slate-800 border-2 border-slate-700 hover:border-amber-400 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all group"
                                >
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${item.type === 'hp' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                                        }`}>
                                        {item.type === 'hp' ? (
                                            <Heart size={32} className="text-red-400" fill="currentColor" />
                                        ) : (
                                            <Zap size={32} className="text-yellow-400" fill="currentColor" />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Confirmation Dialog */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-slate-800 border-2 border-amber-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                            >
                                <div className="text-center mb-6">
                                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${selectedItem.type === 'hp' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                                        }`}>
                                        {selectedItem.type === 'hp' ? (
                                            <Heart size={40} className="text-red-400" fill="currentColor" />
                                        ) : (
                                            <Zap size={40} className="text-yellow-400" fill="currentColor" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">¿Usar {selectedItem.name}?</h3>
                                    <p className="text-sm text-gray-400">{selectedItem.desc}</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmUse}
                                        className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 py-3 rounded-xl font-black transition-colors"
                                    >
                                        Usar
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
