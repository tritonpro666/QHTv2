import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export default function RoleAssignment({ players, onStart }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white"
        >
            <motion.h2
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="text-4xl font-black mb-2 text-sofofa-lightBlue uppercase tracking-tighter italic"
            >
                Asignación de Roles
            </motion.h2>
            <p className="text-gray-400 mb-12 text-center max-w-md">
                Cada jugador tiene un rol único con cartas especiales para resolver los casos del liceo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-12">
                {players.map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className={`relative p-6 rounded-2xl border-2 ${p.position === 'bottom' ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5'} flex flex-col items-center text-center`}
                    >
                        {p.position === 'bottom' && (
                            <span className="absolute -top-3 bg-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                TU ROL
                            </span>
                        )}

                        <div className="w-24 h-24 rounded-full border-4 border-white/20 mb-4 overflow-hidden bg-gray-700 shadow-xl">
                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        </div>

                        <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                        <div className="text-sofofa-lightBlue font-black text-sm uppercase tracking-widest mb-3">
                            {p.role}
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-3">
                            {p.description || "Un estudiante listo para enfrentar los desafíos del liceo."}
                        </p>
                    </motion.div>
                ))}
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="px-12 py-4 bg-sofofa-lightBlue text-white rounded-full font-black text-xl shadow-lg shadow-blue-500/20 hover:bg-sofofa-dark transition-all"
            >
                ¡ENTENDIDO! EMPEZAR
            </motion.button>
        </motion.div>
    );
}
