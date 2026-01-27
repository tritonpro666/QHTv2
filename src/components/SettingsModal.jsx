import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Globe, Eye, Key, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/translations';

export default function SettingsModal({ isOpen, onClose }) {
    const { user, updateSettings, redeemCode } = useGameStore();
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const [codeStatus, setCodeStatus] = useState(null); // 'success' | 'error'

    const settings = user?.settings || { volume: 50, language: 'es', highContrast: false };
    const [currentChatKey, setCurrentChatKey] = useState("");
    const [currentGameKey, setCurrentGameKey] = useState("");

    React.useEffect(() => {
        if (isOpen) {
            fetch('/api/settings/config')
                .then(res => res.json())
                .then(data => {
                    setCurrentChatKey(data.chatKey || "");
                    setCurrentGameKey(data.gameKey || "");
                })
                .catch(e => console.error("Error al cargar API Keys:", e));
        }
    }, [isOpen]);

    const handleRedeem = () => {
        const prevPoints = useGameStore.getState().user.points;
        const prevInv = useGameStore.getState().user.inventory?.length || 0;

        redeemCode(code);

        const newPoints = useGameStore.getState().user.points;
        const newInv = useGameStore.getState().user.inventory?.length || 0;

        if (newPoints !== prevPoints || newInv !== prevInv) {
            setCodeStatus('success');
            setCode("");
        } else {
            setCodeStatus('error');
        }
        setTimeout(() => setCodeStatus(null), 3000);
    };

    const saveKeys = async () => {
        try {
            const res = await fetch('/api/settings/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatKey: currentChatKey, gameKey: currentGameKey })
            });
            const data = await res.json();
            if (data.success) {
                alert("¡Configuración de IA actualizada!");
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            alert("Error de conexión con el servidor");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="bg-gray-300 p-1 rounded-md"><Volume2 size={18} /></span> {t('settings.title')}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

                        {/* Volume Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="font-semibold text-gray-700 flex items-center gap-2">
                                    {t('settings.volume')}
                                </label>
                                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{settings.volume}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.volume}
                                onChange={(e) => updateSettings({ volume: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sofofa-blue"
                            />
                        </div>

                        <hr />

                        {/* Language Control */}
                        <div className="space-y-2">
                            <label className="font-semibold text-gray-700 flex items-center gap-2">
                                <Globe size={18} /> {t('settings.language')}
                            </label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => updateSettings({ language: 'es' })}
                                    className={`py-2 rounded-md text-sm font-bold transition-colors ${settings.language === 'es' ? 'bg-white shadow text-sofofa-blue' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Español
                                </button>
                                <button
                                    onClick={() => updateSettings({ language: 'en' })}
                                    className={`py-2 rounded-md text-sm font-bold transition-colors ${settings.language === 'en' ? 'bg-white shadow text-sofofa-blue' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    English
                                </button>
                            </div>
                        </div>

                        <hr />

                        {/* Accessibility Control */}
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-gray-700 flex items-center gap-2">
                                <Eye size={18} /> {t('settings.highContrast')}
                            </label>
                            <button
                                onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.highContrast ? 'bg-sofofa-blue' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.highContrast ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>

                        <hr />

                        {/* Secret Code */}
                        <div className="space-y-2">
                            <label className="font-semibold text-gray-700 flex items-center gap-2">
                                <Key size={18} /> {t('settings.secretCode')}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={t('settings.enterCode')}
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sofofa-blue outline-none uppercase"
                                />
                                <button
                                    onClick={handleRedeem}
                                    className="bg-sofofa-dark text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-900 transition-colors"
                                >
                                    {t('settings.redeem')}
                                </button>
                            </div>
                            {codeStatus === 'success' && <p className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={12} /> {t('settings.success')}</p>}
                            {codeStatus === 'error' && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {t('settings.error')}</p>}
                        </div>

                        <hr />

                        {/* API Key Configuration - Dual Keys */}
                        <div className="space-y-4">
                            <label className="font-semibold text-red-600 flex items-center gap-2">
                                <Bot size={20} /> Configuración de IA (Dividida)
                            </label>

                            {/* Chat Key */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">API Key para el Chat</p>
                                <input
                                    type="text"
                                    value={currentChatKey}
                                    onChange={(e) => setCurrentChatKey(e.target.value)}
                                    placeholder="AIzaSy... (Chat)"
                                    className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>

                            {/* Game Key */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">API Key para el Juego (RICE)</p>
                                <input
                                    type="text"
                                    value={currentGameKey}
                                    onChange={(e) => setCurrentGameKey(e.target.value)}
                                    placeholder="AIzaSy... (Juego)"
                                    className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>

                            <button
                                onClick={saveKeys}
                                className="w-full bg-red-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors"
                            >
                                Guardar Ambas Llaves
                            </button>
                            <p className="text-[9px] text-gray-400 text-center">Usar cuentas personales (@gmail) para evitar bloqueos.</p>
                        </div>

                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
