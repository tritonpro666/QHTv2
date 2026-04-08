import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Dices } from 'lucide-react';

export default function DiceMinigame({ isOpen, onComplete }) {
    const [diceValue, setDiceValue] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const rollingInterval = useRef(null);

    useEffect(() => {
        if (isOpen && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isOpen && countdown === 0 && !isRolling && !result) {
            startRolling();
        }
    }, [isOpen, countdown, isRolling, result]);

    const startRolling = () => {
        setIsRolling(true);
        rollingInterval.current = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
        }, 100);
    };

    const stopRolling = () => {
        if (!isRolling) return;
        clearInterval(rollingInterval.current);
        setIsRolling(false);

        // Calculate mitigation based on dice roll
        // Higher roll = Better defense
        // 6 = 90% reduction (Critical Defense)
        // 4-5 = 50% reduction
        // 1-3 = 20% reduction

        let mitigation = 0.2;
        let type = 'weak';

        if (diceValue === 6) {
            mitigation = 0.9;
            type = 'perfect';
        } else if (diceValue >= 4) {
            mitigation = 0.5;
            type = 'good';
        } else {
            mitigation = 0.2;
            type = 'weak';
        }

        setResult({ value: diceValue, mitigation, type });

        setTimeout(() => {
            onComplete(mitigation);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border-4 border-blue-500 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-6"
            >
                {/* Header */}
                <div className="text-center">
                    <Shield size={48} className="text-blue-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-black text-white uppercase italic">
                        ¡Defensa con Dados!
                    </h2>
                    <p className="text-blue-300 text-sm">
                        Detén el dado en un número alto para reducir el daño.
                    </p>
                </div>

                {/* Countdown or Game */}
                {countdown > 0 ? (
                    <div className="text-8xl font-black text-white animate-pulse">
                        {countdown}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 w-full">
                        {/* Dice Visual */}
                        <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] border-4 border-blue-200">
                            <motion.div
                                key={diceValue}
                                initial={{ scale: 0.8, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="text-8xl font-black text-slate-900"
                            >
                                {diceValue}
                            </motion.div>
                        </div>

                        {/* Button */}
                        {!result ? (
                            <button
                                onClick={stopRolling}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl uppercase rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
                            >
                                ¡DETENER!
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                <div className={`text-3xl font-black mb-1 ${result.type === 'perfect' ? 'text-yellow-400' :
                                        result.type === 'good' ? 'text-green-400' :
                                            'text-red-400'
                                    }`}>
                                    {result.type === 'perfect' ? '¡DEFENSA PERFECTA!' :
                                        result.type === 'good' ? '¡BUENA DEFENSA!' :
                                            'DAÑO RECIBIDO'}
                                </div>
                                <div className="text-white text-lg font-bold">
                                    Daño reducido en {(result.mitigation * 100).toFixed(0)}%
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
