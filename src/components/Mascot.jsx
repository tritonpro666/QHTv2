import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const TIPS = [
    "¡Recuerda siempre escuchar a tus compañeros!",
    "El respeto es clave para una buena convivencia.",
    "¡Revisa las reglas si tienes dudas!",
    "¿Ya visitaste la tienda para personalizar tu avatar?",
    "¡Tú puedes hacer la diferencia!"
];

export default function Mascot() {
    const [showTip, setShowTip] = useState(true);
    const [currentTip, setCurrentTip] = useState(TIPS[0]);

    const handleClick = () => {
        const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
        setCurrentTip(randomTip);
        setShowTip(true);
        setTimeout(() => setShowTip(false), 4000);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2">
            <AnimatePresence>
                {showTip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-white p-4 rounded-2xl rounded-br-none shadow-xl mb-8 max-w-[200px] border-2 border-sofofa-blue"
                    >
                        <p className="text-sm font-medium text-sofofa-text">{currentTip}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClick}
                className="relative group"
            >
                {/* Placeholder for Mascot Image - Using a generic user for now or part of the uploaded assets if suitable */}
                {/* I'll use a DiceBear avatar as a placeholder for the unique Mascot if no specific image is available */}
                <img
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=SofoBot&backgroundColor=1E4F8A"
                    alt="Mascota"
                    className="w-20 h-20 drop-shadow-lg cursor-pointer transition-transform"
                />
            </motion.button>
        </div>
    );
}
