import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Instagram, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TutorialModal from '../components/TutorialModal';

const XIcon = ({ size = 24, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

export default function LandingPage() {
    const [showTutorial, setShowTutorial] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden font-sans text-sofofa-text">

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sofofa-lightBlue/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-sofofa-accent/10 rounded-full blur-3xl" />

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    {/* SOFOFA Logo */}
                    <img src="/assets/sofofa_full.png" alt="SOFOFA" className="h-12 w-auto object-contain" />
                </div>
                <div>
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-md border border-white/50 shadow-sm rounded-full text-sofofa-blue font-bold hover:bg-white hover:scale-105 transition-all"
                    >
                        <BookOpen size={20} />
                        Tutorial
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">

                {/* Hero Image / Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <img src="/assets/uploaded_image_2_1769003774192.png" alt="¿Qué Harías Tú?" className="h-40 md:h-64 w-auto drop-shadow-lg mx-auto" />
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-2xl mx-auto space-y-6"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold text-sofofa-dark tracking-tight">
                        Mejorando la <span className="text-transparent bg-clip-text bg-gradient-to-r from-sofofa-blue to-sofofa-lightBlue">Convivencia Escolar</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600">
                        Ponte en el lugar de tus compañeros, toma decisiones difíciles y aprende a construir una mejor comunidad.
                    </p>

                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')} // Redirects to Login/App
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-sofofa-blue text-white text-xl font-bold rounded-2xl shadow-xl shadow-sofofa-blue/30 overflow-hidden transition-all hover:shadow-2xl hover:shadow-sofofa-blue/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-sofofa-lightBlue to-sofofa-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center gap-2">
                            Jugar Ahora <Play fill="currentColor" />
                        </span>
                    </motion.button>
                </motion.div>

                {/* Illustration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="mt-12 max-w-4xl mx-auto"
                >
                    <img src="/assets/uploaded_image_3_1769003774192.png" alt="Estudiantes jugando" className="w-full h-auto drop-shadow-2xl rounded-xl" />
                </motion.div>

            </main>

            {/* Social Media Footer */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-4">
                <a href="https://www.instagram.com/redeliceosofofa" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-lg hover:scale-110 hover:shadow-pink-500/30 transition-all text-pink-600">
                    <Instagram size={24} />
                </a>
                <a href="https://liceosofofa.cl/v.24/" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-lg hover:scale-110 hover:shadow-blue-500/30 transition-all text-blue-600">
                    <Globe size={24} />
                </a>
                <a href="https://x.com/sofofaliceos" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-lg hover:scale-110 hover:shadow-black/30 transition-all text-black">
                    <XIcon size={20} />
                </a>
            </div>

            {/* Tutorial Modal */}
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

        </div>
    );
}
