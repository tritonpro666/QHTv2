import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';

const pages = [
    {
        title: "Bienvenido a ¿Qué Harías Tú?",
        content: (
            <div className="space-y-4 text-center">
                <p className="text-lg">Un juego diseñado para mejorar la convivencia escolar.</p>
                <p>Aquí aprenderás a resolver conflictos de manera empática y constructiva.</p>
                <div className="flex justify-center mt-4">
                    <BookOpen size={64} className="text-sofofa-blue" />
                </div>
            </div>
        )
    },
    {
        title: "Preparación",
        content: (
            <ul className="list-disc list-inside space-y-2 text-left">
                <li><strong>4 Jugadores:</strong> Elige tu arquetipo (El Gracioso, El Deportista, La Matea, El Gamer).</li>
                <li><strong>Repartir Cartas:</strong> Cada estudiante recibe cartas de acción y puntos de motivación.</li>
                <li><strong>Puntos:</strong> Inicias con 8 puntos de reputación escolar.</li>
            </ul>
        )
    },
    {
        title: "Cómo Jugar",
        content: (
            <div className="space-y-2 text-sm">
                <p><strong>1. Escenario:</strong> Se revela un caso cotidiano (A, B o C).</p>
                <p><strong>2. Acción:</strong> Los jugadores deciden qué hacer usando sus cartas (Sanciones, Medidas Reparatorias, Derivación).</p>
                <p><strong>3. SUPEREDUC:</strong> Revisa si se cumplió el reglamento (RICE). Si no, ¡Multa!</p>
                <p><strong>4. Puntos:</strong> Ganas o pierdes puntos según tus decisiones y apuestas.</p>
            </div>
        )
    },
    {
        title: "Objetivo",
        content: (
            <div className="text-center">
                <p className="mb-4">El objetivo es acumular la mayor cantidad de puntos de victoria tomando las mejores decisiones para la convivencia escolar.</p>
                <p className="font-bold text-sofofa-accent text-xl">¡Diviértete y aprende!</p>
            </div>
        )
    }
];

export default function TutorialModal({ isOpen, onClose }) {
    const [currentPage, setCurrentPage] = useState(0);

    if (!isOpen) return null;

    const nextPage = () => {
        if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, rotateY: 90 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    className="bg-white w-full max-w-lg aspect-[3/4] md:aspect-video md:h-[500px] rounded-r-2xl rounded-l-md shadow-2xl overflow-hidden relative flex flex-col border-l-8 border-sofofa-dark"
                >
                    {/* Book Spine visual effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-300 to-transparent pointer-events-none"></div>

                    {/* Header */}
                    <div className="bg-sofofa-lightBlue p-4 flex justify-between items-center text-white">
                        <h2 className="text-2xl font-bold font-sans">{pages[currentPage].title}</h2>
                        <button
                            onClick={onClose}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-transform hover:scale-110"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 flex flex-col justify-center items-center overflow-y-auto text-sofofa-text bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
                        {pages[currentPage].content}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="p-4 flex justify-between items-center bg-gray-50 border-t">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 0}
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-bold transition-colors ${currentPage === 0 ? 'text-gray-300' : 'text-sofofa-blue hover:bg-blue-50'}`}
                        >
                            <ChevronLeft /> Anterior
                        </button>
                        <span className="text-gray-400 font-mono">{currentPage + 1} / {pages.length}</span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === pages.length - 1} // Change behavior or close on last page? User didn't specify.
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-bold transition-colors ${currentPage === pages.length - 1 ? 'text-gray-300' : 'text-sofofa-blue hover:bg-blue-50'}`}
                        >
                            Siguiente <ChevronRight />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
