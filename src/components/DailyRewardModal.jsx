import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Coins } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/translations';
import confetti from 'canvas-confetti';

const PRIZES = [
    { label: '5', value: 5, color: '#ef4444' },
    { label: '50', value: 50, color: '#3b82f6' },
    { label: '10', value: 10, color: '#eab308' },
    { label: '100', value: 100, color: '#22c55e' },
    { label: '20', value: 20, color: '#a855f7' },
    { label: '500', value: 500, color: '#f97316' },
];

export default function DailyRewardModal({ isOpen, onClose }) {
    const { addPoints } = useGameStore();
    const { t } = useTranslation();

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [prize, setPrize] = useState(null);

    if (!isOpen) return null;

    const spinWheel = () => {
        if (isSpinning || prize) return;

        setIsSpinning(true);

        // Calculate random prize
        const randomIndex = Math.floor(Math.random() * PRIZES.length);
        const selectedPrize = PRIZES[randomIndex];

        // Calculate rotation: 
        // Each slice is 360 / 6 = 60 degrees.
        // We want to land on the index. 
        // Add extra rotations (5 * 360) for effect.
        // The "arrow" is usually at the top (0 deg). 
        // To land index i at top, we rotate -(i * 60).
        // Let's simplify: Random large number + generic clamp.

        const sliceAngle = 360 / PRIZES.length;
        // We want the wheel to stop such that the selected PRIZE is at the top pointer.
        // If the wheel starts at 0, index 0 is at top?
        // Let's assume standard layout. We just add 360*5 + random deviation within the slice.

        // Simpler visual approach:
        // Just rotate to a specific angle that represents the prize.
        const extraSpins = 5 * 360;
        const targetRotation = extraSpins + (randomIndex * sliceAngle) + (sliceAngle / 2);
        // Actually, let's just use random + math to determine winner visually if we want physics.
        // BUT, easier: Decide winner -> set rotation to that winner's slot.
        // To land Index at Top (270deg or -90deg usually in CSS circles, but let's say Top is 0).
        // If 0 is top, Index 0 is Top. Index 1 is Right-Top. 
        // We need to rotate NEGATIVE to bring index 1 to Top.

        const stopAngle = 360 * 5 - (randomIndex * sliceAngle);

        setRotation(stopAngle);

        setTimeout(() => {
            setIsSpinning(false);
            setPrize(selectedPrize);
            addPoints(selectedPrize.value);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }, 4000); // Match CSS transition duration
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative border-[6px] border-sofofa-dark"
                >
                    {/* Close Button */}
                    <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-gray-200 hover:bg-red-500 hover:text-white p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>

                    <div className="p-6 flex flex-col items-center gap-6">
                        <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 mb-[-20px] z-10 border-4 border-white shadow-sm">
                            <Gift size={32} />
                        </div>

                        <h2 className="text-2xl font-black text-gray-800 mt-2 text-center uppercase tracking-tight">{t('daily.title')}</h2>

                        {/* Wheel Container */}
                        <div className="relative w-64 h-64">
                            {/* Pointer */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-t-[25px] border-t-sofofa-dark border-r-[15px] border-r-transparent filter drop-shadow-md" />

                            {/* The Wheel */}
                            <div
                                className="w-full h-full rounded-full border-8 border-gray-200 relative overflow-hidden shadow-inner transition-transform cubic-bezier(0.1, 0.7, 0.1, 1)"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transitionDuration: '4s'
                                }}
                            >
                                {PRIZES.map((p, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-full h-full left-0 top-0 flex justify-center pt-4 font-bold text-white shadow-sm"
                                        style={{
                                            backgroundColor: p.color,
                                            transform: `rotate(${i * (360 / PRIZES.length)}deg)`,
                                            clipPath: 'polygon(50% 50%, 0 0, 100% 0)' // Simple triangle slice clip?? No, this CSS trick is tricky for generic circles.
                                            // Better approach: Conic gradient is easier for background, but text rotation needs divs.
                                            // Let's simplify visual: we'll use a conic gradient background and rotated independent labels.
                                        }}
                                    >
                                        {/* This text is just visual, real slices are handled by background below */}
                                    </div>
                                ))}

                                {/* Better Visual Layer: Conic Gradient Background */}
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `conic-gradient(
                                ${PRIZES.map((p, i) => `${p.color} ${i * (100 / PRIZES.length)}% ${(i + 1) * (100 / PRIZES.length)}%`).join(', ')}
                            )`
                                    }}
                                />

                                {/* Labels Overlay */}
                                {PRIZES.map((p, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ transform: `rotate(${i * (360 / PRIZES.length) + (360 / PRIZES.length) / 2}deg)` }} // Rotate to center of slice
                                    >
                                        <div className="flex flex-col items-center pt-2 h-1/2 text-white font-bold drop-shadow-md">
                                            <span className="text-lg">{p.label}</span>
                                            <Coins size={12} className="opacity-75" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Center Hub */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg border-4 border-gray-100 z-10 flex items-center justify-center">
                                <div className="w-8 h-8 bg-sofofa-blue rounded-full opacity-20 animate-pulse" />
                            </div>
                        </div>

                        {/* Action Button / Result */}
                        <div className="h-16 flex items-center justify-center">
                            {prize ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-center"
                                >
                                    <h3 className="text-xl font-bold text-green-600">{t('daily.won')}</h3>
                                    <p className="text-gray-500 font-bold flex items-center gap-1">
                                        +{prize.value} <Coins size={16} />
                                    </p>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={spinWheel}
                                    disabled={isSpinning}
                                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xl px-12 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSpinning ? "..." : t('daily.spin')}
                                </button>
                            )}
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
