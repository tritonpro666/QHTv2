import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function UserNotificationsModal({ isOpen, onClose }) {
    const { user, users, acceptFriendRequest, declineFriendRequest } = useGameStore();

    const [processing, setProcessing] = React.useState(null);
    if (!isOpen) return null;
    const friendRequests = user?.friendRequests || [];

    const handleAccept = async (email) => {
        setProcessing(email);
        await acceptFriendRequest(email);
        setProcessing(null);
    };

    const handleDecline = async (email) => {
        setProcessing(email);
        await declineFriendRequest(email);
        setProcessing(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute top-16 right-4 md:right-32 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-40 transform origin-top-right">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-gray-800">
                                <Bell size={18} className="text-sofofa-blue" />
                                Notificaciones
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                            {friendRequests.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No tienes notificaciones nuevas.
                                </div>
                            ) : (
                                <ul>
                                    {friendRequests.map(requesterEmail => {
                                        const requester = users[requesterEmail];
                                        if (!requester) return null;
                                        
                                        const isWaiting = processing === requesterEmail;

                                        return (
                                            <li key={requesterEmail} className="p-4 border-b hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                        <img src={requester.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 truncate">{requester.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">quiere ser tu amigo</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button 
                                                        disabled={!!processing}
                                                        onClick={() => handleAccept(requesterEmail)}
                                                        className="flex-1 bg-sofofa-blue text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                                    >
                                                        {isWaiting ? "Procesando..." : <><Check size={14} /> Aceptar</>}
                                                    </button>
                                                    <button 
                                                        disabled={!!processing}
                                                        onClick={() => handleDecline(requesterEmail)}
                                                        className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                                    >
                                                        <X size={14} /> Rechazar
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
