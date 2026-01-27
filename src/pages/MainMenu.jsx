import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ShoppingBag, Settings, BookOpen, LogOut, Coins, Bot, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/translations';
import Mascot from '../components/Mascot';
import TutorialModal from '../components/TutorialModal';
import SettingsModal from '../components/SettingsModal';
import StoreModal from '../components/StoreModal';
import ProfileModal from '../components/ProfileModal';
import SofoChatModal from '../components/SofoChatModal';
import DailyRewardModal from '../components/DailyRewardModal';
import GameModeModal from '../components/GameModeModal';
import OnlineLobbyModal from '../components/OnlineLobbyModal';

export default function MainMenu() {
    const navigate = useNavigate();
    const { user, logout, setGameMode } = useGameStore();
    const { t } = useTranslation();

    const [showTutorial, setShowTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showStore, setShowStore] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSofoChat, setShowSofoChat] = useState(false);
    const [showDaily, setShowDaily] = useState(false);

    // New Modals
    const [showGameMode, setShowGameMode] = useState(false);
    const [showOnlineLobby, setShowOnlineLobby] = useState(false);

    // Redirect if not authenticated (simple check)
    React.useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const handleModeSelect = (mode) => {
        setGameMode(mode);
        setShowGameMode(false);
        if (mode === 'SOLO') {
            navigate('/game');
        } else {
            setShowOnlineLobby(true);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">

            {/* Header / Top Bar */}
            <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-8">
                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => setShowProfile(true)}
                    >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-sofofa-blue relative">
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            {/* Show equipped shirt if any */}
                            {user.equippedItems?.shirt && (
                                <img src={user.equippedItems.shirt.icon} className="absolute bottom-0 right-0 w-6 h-6 rounded-full border bg-white" alt="shirt" />
                            )}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-sofofa-dark">{user.name}</h1>
                            <div className="flex items-center gap-1 text-sofofa-accent font-bold text-sm">
                                <Coins size={16} /> <span>{user.points} pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Daily Reward Button (Small) */}
                    <button
                        onClick={() => setShowDaily(true)}
                        className="hidden md:flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                    >
                        <Gift size={20} className="animate-bounce" />
                        <span>{t('daily.title')}</span>
                    </button>
                    {/* Mobile Daily Reward Button */}
                    <button
                        onClick={() => setShowDaily(true)}
                        className="md:hidden flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-10 h-10 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                    >
                        <Gift size={20} />
                    </button>
                </div>

                <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                </button>
            </header>

            {/* Main Grid */}
            <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* PLAY Button (Large) */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-sofofa-blue to-sofofa-lightBlue rounded-3xl p-8 text-white relative overflow-hidden shadow-lg cursor-pointer group"
                    onClick={() => setShowGameMode(true)}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Play size={200} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-end">
                        <h2 className="text-4xl font-extrabold mb-2">{t('menu.play')}</h2>
                        <p className="opacity-90">{t('menu.playDesc')}</p>
                        <button className="mt-6 bg-white text-sofofa-blue w-max px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">
                            {t('menu.start')}
                        </button>
                    </div>
                </motion.div>

                {/* Store */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowStore(true)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-sofofa-accent transition-colors"
                >
                    <div className="bg-orange-100 p-4 rounded-full text-orange-600">
                        <ShoppingBag size={32} />
                    </div>
                    <h3 className="font-bold text-gray-700">{t('menu.store')}</h3>
                </motion.div>

                {/* Tutorial */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowTutorial(true)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-sofofa-blue transition-colors"
                >
                    <div className="bg-blue-100 p-4 rounded-full text-sofofa-blue">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="font-bold text-gray-700">{t('menu.tutorial')}</h3>
                </motion.div>

                {/* Sofo Chat Button */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowSofoChat(true)}
                    className="col-span-1 md:col-span-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl p-6 text-white shadow-md cursor-pointer flex items-center justify-between relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot size={24} />
                            </div>
                            <span className="font-bold uppercase text-xs tracking-wider bg-black/10 px-2 py-1 rounded">IA Ayuda</span>
                        </div>
                        <h3 className="text-2xl font-bold">¡Habla con Sofo!</h3>
                        <p className="text-sm opacity-90 max-w-[80%]">¿Dudas sobre especialidades o necesitas ayuda? Estoy aqui.</p>
                    </div>
                    <Bot size={96} className="absolute -bottom-4 -right-4 opacity-20 rotate-[-10deg]" />
                </motion.div>

                {/* Settings */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowSettings(true)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-gray-400 transition-colors"
                >
                    <div className="bg-gray-100 p-4 rounded-full text-gray-600">
                        <Settings size={32} />
                    </div>
                    <h3 className="font-bold text-gray-700">{t('menu.settings')}</h3>
                </motion.div>

            </main>

            <Mascot />

            {/* Modals */}
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <StoreModal isOpen={showStore} onClose={() => setShowStore(false)} />
            <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
            <SofoChatModal isOpen={showSofoChat} onClose={() => setShowSofoChat(false)} />
            <DailyRewardModal isOpen={showDaily} onClose={() => setShowDaily(false)} />

            <GameModeModal
                isOpen={showGameMode}
                onClose={() => setShowGameMode(false)}
                onSelect={handleModeSelect}
            />
            <OnlineLobbyModal
                isOpen={showOnlineLobby}
                onClose={() => setShowOnlineLobby(false)}
            />

        </div>
    );
}
