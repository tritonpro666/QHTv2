import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InspectorEvent({ isActive, onComplete }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        if (isActive) {
            setPhase(1);
            // Phase 1: Alarm and Red flash
            const t1 = setTimeout(() => setPhase(2), 1500);
            // Phase 2: Cut In of Inspector sliding
            const t2 = setTimeout(() => setPhase(3), 3500);
            // Phase 3: Punishment text
            const t3 = setTimeout(() => setPhase(4), 6000);
            // Phase 4: Fade out and Complete
            const t4 = setTimeout(() => {
                setPhase(0);
                if (onComplete) onComplete();
            }, 7500);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
                clearTimeout(t4);
            };
        } else {
            setPhase(0);
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <AnimatePresence>
            {phase > 0 && (
                <motion.div 
                    className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-center items-center overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Dark/Red Flash Background */}
                    <motion.div 
                        className="absolute inset-0 bg-red-950/90 mix-blend-multiply"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />

                    {/* ALARM TEXT */}
                    <AnimatePresence>
                        {(phase === 1 || phase === 2) && (
                            <motion.div 
                                className="absolute inset-0 flex justify-center items-center opacity-20"
                                initial={{ scale: 2 }}
                                animate={{ scale: 1 }}
                            >
                                <h1 className="text-[150px] font-black text-red-600 uppercase tracking-widest text-center leading-none italic rotate-[-10deg]">
                                    INSPECTORIA<br/>GENERAL
                                </h1>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CUT-IN ANIMATION */}
                    <AnimatePresence>
                        {phase >= 2 && phase <= 3 && (
                            <motion.div 
                                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                            >
                                {/* Diagonal Band */}
                                <motion.div 
                                    className="w-[200vw] h-64 bg-red-600 border-y-8 border-yellow-400 shadow-[0_0_50px_rgba(255,0,0,1)] relative flex items-center justify-center"
                                    initial={{ x: '100%', rotate: -5 }}
                                    animate={{ x: '-10%', rotate: -5 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 50 }}
                                >
                                    {/* Action lines background inside band */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-50 mix-blend-overlay"></div>
                                    
                                    {/* Inspector Image */}
                                    <motion.img 
                                        src="/inspector_avatar.png" 
                                        className="h-96 -mt-16 object-contain z-10 filter drop-shadow-[10px_0px_0px_rgba(0,0,0,0.5)]"
                                        initial={{ scale: 1.5, x: 200 }}
                                        animate={{ scale: 1, x: 0 }}
                                        transition={{ type: 'spring', delay: 0.2 }}
                                    />

                                    {/* Voice Text */}
                                    <motion.div 
                                        className="absolute right-[20%] text-white font-black italic text-5xl uppercase drop-shadow-[0_5px_0_rgba(0,0,0,1)]"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        ¡¿QUÉ ESTÁ PASANDO <br/> AQUÍ?!
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* PUNISHMENT PHASE */}
                    <AnimatePresence>
                        {phase === 3 && (
                            <motion.div 
                                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-center p-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <motion.div 
                                    className="text-8xl mb-8"
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                    💢
                                </motion.div>
                                <h2 className="text-6xl font-black text-red-500 uppercase italic mb-4 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
                                    ¡CASTIGO DISCIPLINARIO!
                                </h2>
                                <p className="text-3xl text-white font-bold mb-2">
                                    -50% HP a TODOS los estudiantes
                                </p>
                                <p className="text-yellow-400 text-2xl font-bold italic animate-pulse">
                                    El Rumor se ha silenciado por ahora...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
