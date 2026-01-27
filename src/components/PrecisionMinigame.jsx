import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function PrecisionMinigame({ isOpen, onComplete }) {
    const [progress, setProgress] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [result, setResult] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (isOpen && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isOpen && countdown === 0 && !gameActive) {
            startGame();
        }
    }, [isOpen, countdown, gameActive]);

    const startGame = () => {
        setGameActive(true);
        startTimeRef.current = Date.now();

        // Animate pencil entering sharpener over 3 seconds
        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / 3000) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                // Auto-fail if player doesn't click
                handleClick();
            }
        }, 16); // ~60fps
    };

    const handleClick = () => {
        if (!gameActive) return;

        clearInterval(timerRef.current);
        setGameActive(false);

        // Calculate precision based on how close to 100% (perfect timing)
        const precision = progress / 100;
        let resultType = 'miss';
        let multiplier = 1.0;

        if (precision >= 0.90 && precision <= 1.0) {
            // Perfect zone - chance for critical
            const isCritical = Math.random() < 0.15; // 15% crit chance
            if (isCritical) {
                resultType = 'critical';
                multiplier = 3.0;
            } else {
                resultType = 'perfect';
                multiplier = 1.5;
            }
        } else if (precision >= 0.70) {
            resultType = 'good';
            multiplier = 1.2;
        } else if (precision >= 0.50) {
            resultType = 'ok';
            multiplier = 1.0;
        }

        setResult({ type: resultType, precision, multiplier });

        // Close after showing result
        setTimeout(() => {
            onComplete(multiplier, resultType === 'critical');
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-amber-400 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            >
                {/* Countdown */}
                {countdown > 0 && (
                    <div className="text-center">
                        <h2 className="text-6xl font-black text-amber-400 mb-4">¡Prepárate!</h2>
                        <motion.div
                            key={countdown}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-9xl font-black text-white"
                        >
                            {countdown}
                        </motion.div>
                    </div>
                )}

                {/* Game Active */}
                {countdown === 0 && gameActive && (
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-amber-400 mb-6 uppercase italic">
                            ¡Haz clic cuando el lápiz entre!
                        </h2>

                        {/* Pencil Sharpener Visual */}
                        <div className="relative h-48 mb-8 flex items-center justify-center">
                            {/* Sharpener */}
                            <div className="absolute right-20 w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-lg border-4 border-red-900 flex items-center justify-center shadow-2xl">
                                <div className="w-12 h-12 bg-black rounded-full" />
                            </div>

                            {/* Pencil */}
                            <motion.div
                                animate={{ x: ['-300px', '100px'] }}
                                transition={{ duration: 3, ease: 'linear' }}
                                className="absolute left-0 flex items-center"
                            >
                                <div className="w-48 h-8 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-r-full border-2 border-yellow-700 relative">
                                    <div className="absolute right-0 w-12 h-8 bg-gray-800 rounded-r-full" />
                                    <div className="absolute right-0 w-4 h-4 top-1/2 -translate-y-1/2 bg-gray-600 rounded-full" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-6 bg-gray-900 rounded-full overflow-hidden border-2 border-white/20 mb-4">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Click Button */}
                        <button
                            onClick={handleClick}
                            className="w-full py-6 bg-amber-400 hover:bg-amber-500 text-slate-900 text-2xl font-black uppercase rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            ¡AHORA!
                        </button>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-center"
                    >
                        <div className={`text-8xl font-black mb-4 ${result.type === 'critical' ? 'text-red-500 animate-pulse' :
                                result.type === 'perfect' ? 'text-amber-400' :
                                    result.type === 'good' ? 'text-green-400' :
                                        result.type === 'ok' ? 'text-blue-400' :
                                            'text-gray-400'
                            }`}>
                            {result.type === 'critical' ? '¡CRÍTICO!' :
                                result.type === 'perfect' ? '¡PERFECTO!' :
                                    result.type === 'good' ? '¡BIEN!' :
                                        result.type === 'ok' ? 'OK' :
                                            'FALLASTE'}
                        </div>
                        <div className="text-4xl font-bold text-white">
                            Daño x{result.multiplier.toFixed(1)}
                        </div>
                        {result.type === 'critical' && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="mt-4 text-2xl font-black text-red-500"
                            >
                                ⚡ GOLPE CRÍTICO ⚡
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
