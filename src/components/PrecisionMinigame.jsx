import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Zap } from 'lucide-react';

export default function PrecisionMinigame({ isOpen, onComplete }) {
    const [progress, setProgress] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [result, setResult] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const requestIdRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setResult(null);
            setProgress(0);
            setCountdown(3);
            setGameActive(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 700);
            return () => clearTimeout(timer);
        } else if (isOpen && countdown === 0 && !gameActive && !result) {
            startGame();
        }
    }, [isOpen, countdown, gameActive, result]);

    const startGame = () => {
        setGameActive(true);
        startTimeRef.current = performance.now();
        animate();
    };

    const animate = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const duration = 2000; // 2 seconds to reach end
        // Progress goes back and forth? Or just once? 
        // Let's make it go simply 0 to 100 fast for reaction.
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
            handleFinish(0); // Miss if timed out (technically 100 is miss/late)
            return;
        }

        requestIdRef.current = requestAnimationFrame(animate);
    };

    const handleClick = () => {
        if (!gameActive) return;
        cancelAnimationFrame(requestIdRef.current);
        handleFinish(progress);
    };

    const handleFinish = (finalProgress) => {
        setGameActive(false);

        // Target is 85-95 for Perfect.
        // 70-85 or 95-100 is Good.
        // < 70 is Miss/Weak.

        let type = 'miss';
        let multiplier = 0.5;

        // Custom Difficulty Zones
        if (finalProgress >= 85 && finalProgress <= 95) {
            // Perfect
            const isCrit = Math.random() < 0.2;
            type = isCrit ? 'critical' : 'perfect';
            multiplier = isCrit ? 2.5 : 1.5;
        } else if (finalProgress >= 70) {
            // Good
            type = 'good';
            multiplier = 1.2;
        } else if (finalProgress > 10) {
            // Ok
            type = 'ok';
            multiplier = 0.8;
        } else {
            // Miss
            type = 'miss';
            multiplier = 0.5;
        }

        setResult({ type, multiplier, percent: finalProgress });

        setTimeout(() => {
            onComplete(multiplier, type === 'critical');
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-crosshair" onClick={handleClick}>
            <div className="w-full max-w-3xl flex flex-col items-center justify-center p-8 relative">

                {/* Title */}
                <h2 className="text-4xl font-black text-white italic uppercase tracking-widest mb-12 drop-shadow-lg">
                    {countdown > 0 ? "¡Prepárate!" : "¡Dispara!"}
                </h2>

                {/* Countdown */}
                <AnimatePresence>
                    {countdown > 0 && (
                        <motion.div
                            key={countdown}
                            initial={{ scale: 3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <span className="text-[150px] font-black text-amber-400 stroke-2">{countdown}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Game Bar */}
                {countdown === 0 && (
                    <div className="w-full relative">
                        {/* Bar Container */}
                        <div className="h-16 w-full bg-slate-900 rounded-full border-4 border-slate-700 overflow-hidden relative shadow-2xl">

                            {/* Zones */}
                            <div className="absolute top-0 bottom-0 right-[25%] left-[25%] bg-blue-900/30" /> {/* OK Zone */}
                            <div className="absolute top-0 bottom-0 right-[15%] left-[30%] bg-yellow-600/50" /> {/* Good Zone */}
                            <div className="absolute top-0 bottom-0 right-[5%] left-[85%] bg-green-500 shadow-[0_0_20px_#22c55e]" /> {/* Perfect Zone */}

                            {/* Cursor */}
                            <motion.div
                                className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_15px_white] z-10"
                                style={{ left: `${progress}%` }}
                            />
                        </div>

                        {/* Markers text */}
                        <div className="flex justify-between text-xs font-bold text-gray-500 mt-2 uppercase px-4">
                            <span>Inicio</span>
                            <span className="text-green-400">Perfecto</span>
                            <span>Fin</span>
                        </div>
                    </div>
                )}

                {/* Result Animation */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50`}
                        >
                            <div className={`text-8xl font-black uppercase italic drop-shadow-2xl text-center
                                ${result.type === 'critical' ? 'text-red-500' :
                                    result.type === 'perfect' ? 'text-green-400' :
                                        result.type === 'good' ? 'text-yellow-400' : 'text-gray-400'
                                }
                             `}>
                                {result.type === 'critical' ? '¡Crítico!' :
                                    result.type === 'perfect' ? '¡Perfecto!' :
                                        result.type === 'good' ? '¡Bien!' : 'Fallaste'}
                            </div>
                            <div className="text-3xl font-bold text-white mt-4 bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20">
                                POTENCIA: {Math.round(result.multiplier * 100)}%
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 text-gray-500 text-sm font-mono animate-pulse">
                    {gameActive ? "TAP / CLICK PARA DISPARAR" : "..."}
                </div>
            </div>
        </div>
    );
}
