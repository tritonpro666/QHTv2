import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CutIn({ player, onComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 1800); // Fast cut-in
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!player) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0, transition: { duration: 0.2 } }} 
                className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden pointer-events-none"
            >
                {/* Dark Overlay */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

                {/* Diagonal Strip */}
                <motion.div 
                    initial={{ x: '-150vw', skewX: -20 }} 
                    animate={{ x: 0, skewX: -20 }} 
                    exit={{ x: '150vw', transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="absolute bg-gradient-to-r from-red-700 via-red-600 to-amber-500 w-[150vw] h-72 border-y-8 border-white shadow-[0_0_100px_rgba(220,38,38,0.8)] overflow-hidden flex items-center justify-center drop-shadow-2xl"
                >
                    {/* Abstract BG lines */}
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuNSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] mix-blend-overlay" />

                    {/* Content */}
                    <div className="flex items-center gap-12 skew-x-20 px-32 w-full justify-center">
                        <div className="relative w-64 h-64 shrink-0 -ml-32">
                            <img src={player.avatar} className="w-full h-full object-cover rounded-full border-8 border-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-slate-200" style={{ filter: 'contrast(1.2) saturate(1.5)' }} />
                            {/* Focus Lines behind avatar */}
                            <div className="absolute inset-[-50%] bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/4e/Manga_speedlines.svg')] opacity-40 mix-blend-overlay animate-spin-slow -z-10" />
                        </div>
                        <h1 className="text-white text-5xl md:text-7xl font-black italic uppercase tracking-tighter drop-shadow-[0_10px_0_rgba(0,0,0,0.8)] max-w-3xl leading-[1.1] z-10 w-[800px]">
                            "{player.cutinQuote || '¡TOMA ESTO!'}"
                        </h1>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
