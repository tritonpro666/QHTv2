import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, UserCheck, UserMinus, ShieldAlert, Check, Edit2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { containsProfanity } from '../utils/profanityFilter';
import { useTranslation } from '../utils/translations';

export default function UserProfileModal({ isOpen, onClose, targetUser }) {
    const { user, updateProfile, sendFriendRequest, removeFriend, blockUser } = useGameStore();
    const { t } = useTranslation();
    
    // Si no hay targetUser, mostramos el pefil propio, o no renderizamos nada si no hay ninguno.
    const profileToShow = targetUser || user;
    const isOwnProfile = profileToShow?.email === user?.email;
    
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [tempDesc, setTempDesc] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen || !profileToShow) return null;

    // Determine Relationship Status
    const isFriend = user?.friends?.includes(profileToShow.email);
    const requestSent = profileToShow?.friendRequests?.includes(user?.email);

    const handleSaveDesc = () => {
        if (containsProfanity(tempDesc)) {
            setErrorMsg("La descripción contiene palabras no permitidas.");
            return;
        }
        updateProfile({ description: tempDesc.trim() });
        setIsEditingDesc(false);
        setErrorMsg("");
    };

    const handleAction = (action) => {
        if (action === 'ADD') sendFriendRequest(profileToShow.email);
        if (action === 'REMOVE') removeFriend(profileToShow.email);
        if (action === 'BLOCK') {
            if(window.confirm(`¿Seguro que quieres bloquear a ${profileToShow.name}? No podrá buscarte ni enviarte mensajes.`)) {
                blockUser(profileToShow.email);
                onClose(); // Cerrar modal porque ya no lo queremos ver
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
                    >
                        {/* Header Banner */}
                        <div className="h-32 bg-gradient-to-tr from-sofofa-blue to-sofofa-lightBlue relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 bg-black/20 text-white hover:bg-black/40 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Avatar Profile Info */}
                        <div className="px-6 pb-6 relative">
                            {/* Avatar Circle */}
                            <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                                <img src={profileToShow.avatar} alt={profileToShow.name} className="w-full h-full object-cover" />
                                {profileToShow.equippedItems?.shirt && (
                                    <img src={profileToShow.equippedItems.shirt.icon} className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-white" alt="shirt" />
                                )}
                            </div>
                            
                            {/* Action Button (Top Right next to Avatar space) */}
                            {!isOwnProfile && (
                                <div className="flex justify-end pt-4 h-16">
                                    {isFriend ? (
                                        <button onClick={() => handleAction('REMOVE')} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold hover:bg-red-50 hover:text-red-600 transition-colors text-sm border">
                                            <UserCheck size={16} /> Amigos
                                        </button>
                                    ) : requestSent ? (
                                        <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full font-bold text-sm border opacity-70 cursor-not-allowed">
                                            <Check size={16} /> Solicitud Enviada
                                        </button>
                                    ) : (
                                        <button onClick={() => handleAction('ADD')} className="flex items-center gap-2 bg-sofofa-blue text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors text-sm shadow-md">
                                            <UserPlus size={16} /> Añadir Amistad
                                        </button>
                                    )}
                                </div>
                            )}
                            {isOwnProfile && <div className="h-16" />} {/* Spacer */}

                            {/* Info */}
                            <div className="mt-2">
                                <h2 className="text-2xl font-bold text-gray-800">{profileToShow.name}</h2>
                                <p className="text-sm font-medium text-sofofa-accent bg-orange-100 px-3 py-1 rounded-full w-max mt-1 border border-orange-200">
                                    {profileToShow.points} pts
                                </p>
                            </div>

                            {/* Description Section */}
                            <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sobre mí</h3>
                                    {isOwnProfile && !isEditingDesc && (
                                        <button onClick={() => { setTempDesc(profileToShow.description || ''); setIsEditingDesc(true); }} className="text-gray-400 hover:text-sofofa-blue transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>
                                
                                {isEditingDesc ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea 
                                            value={tempDesc}
                                            onChange={(e) => setTempDesc(e.target.value)}
                                            maxLength={150}
                                            className="w-full text-sm p-2 border rounded-lg resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-sofofa-blue"
                                            placeholder="Escribe algo sobre ti..."
                                        />
                                        {errorMsg && <p className="text-xs text-red-500 font-bold">{errorMsg}</p>}
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setIsEditingDesc(false)} className="text-xs font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
                                            <button onClick={handleSaveDesc} className="text-xs font-bold bg-sofofa-blue text-white px-3 py-1 rounded-full hover:bg-blue-700">Guardar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700 italic">
                                        {profileToShow.description ? `"${profileToShow.description}"` : "Sin descripción."}
                                    </p>
                                )}
                            </div>

                            {/* Block User Option */}
                            {!isOwnProfile && (
                                <div className="mt-6 flex justify-center">
                                    <button onClick={() => handleAction('BLOCK')} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-bold transition-colors">
                                        <ShieldAlert size={14} /> Bloquear Usuario
                                    </button>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
