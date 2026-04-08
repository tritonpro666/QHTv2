import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Check, Edit2, Upload, Briefcase, FileText } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { containsProfanity } from '../utils/profanityFilter';
import { useTranslation } from '../utils/translations';

const SPECIALTIES = [
    { id: 'elec', label: 'specs.elec', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { id: 'tron', label: 'specs.tron', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'tele', label: 'specs.tele', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { id: 'prog', label: 'specs.prog', color: 'bg-purple-100 text-purple-700 border-purple-300' },
];

export default function ProfileModal({ isOpen, onClose }) {
    const { user, equipItem, updateProfile } = useGameStore();
    const { t } = useTranslation();

    const [isEditingName, setIsEditingName] = useState(false);
    const [showSpecSelector, setShowSpecSelector] = useState(false);
    const [newName, setNewName] = useState(user?.name || "");
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [tempDesc, setTempDesc] = useState(user?.description || "");
    const [descError, setDescError] = useState("");
    
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleSaveName = () => {
        if (newName.trim()) {
            updateProfile({ name: newName });
            setIsEditingName(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectSpecialty = (specId) => {
        updateProfile({ specialty: specId });
        setShowSpecSelector(false);
    };

    const handleSaveDesc = () => {
        if (containsProfanity(tempDesc)) {
            setDescError("La descripción contiene palabras no permitidas.");
            return;
        }
        updateProfile({ description: tempDesc.trim() });
        setIsEditingDesc(false);
        setDescError("");
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
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="bg-sofofa-blue p-4 text-white flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2"><User /> {t('profile.title')}</h2>
                        <button onClick={onClose}><X /></button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <div className="flex flex-col items-center mb-6">
                            {/* Avatar Section */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-sofofa-accent overflow-hidden mb-2 relative bg-gray-200">
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    {user.equippedItems?.shirt && (
                                        <img
                                            src={user.equippedItems.shirt.icon}
                                            className="absolute bottom-0 right-0 w-12 h-12 bg-white rounded-full p-1 shadow-md border"
                                            alt="Shirt"
                                        />
                                    )}
                                </div>
                                {/* Hover Upload Button */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Upload className="text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Name Section */}
                            <div className="flex flex-col items-center mt-2">
                                <div className="flex items-center gap-2">
                                    {isEditingName ? (
                                        <div className="flex gap-2">
                                            <input
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sofofa-blue"
                                                autoFocus
                                            />
                                            <button onClick={handleSaveName} className="bg-green-500 text-white p-1 rounded hover:bg-green-600"><Check size={16} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-lg font-bold">{user.name}</h3>
                                            <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-sofofa-blue"><Edit2 size={16} /></button>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 font-mono">{user.email}</p>
                            </div>

                            {/* Specialty Section */}
                            <div className="relative mt-2">
                                {user.specialty ? (
                                    <div
                                        onClick={() => setShowSpecSelector(!showSpecSelector)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer flex items-center gap-1 ${SPECIALTIES.find(s => s.id === user.specialty)?.color || 'bg-gray-100 text-gray-600'}`}
                                    >
                                        <Briefcase size={12} />
                                        {t(`profile.${SPECIALTIES.find(s => s.id === user.specialty)?.label}`)}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowSpecSelector(!showSpecSelector)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
                                    >
                                        <Briefcase size={12} /> {t('profile.specialty')}
                                    </button>
                                )}

                                {/* Specialty Selector Dropdown */}
                                <AnimatePresence>
                                    {showSpecSelector && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border p-2 z-10"
                                        >
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-2 px-2">{t('profile.selectSpecialty')}</h5>
                                            <div className="space-y-1">
                                                {SPECIALTIES.map((spec) => (
                                                    <button
                                                        key={spec.id}
                                                        onClick={() => handleSelectSpecialty(spec.id)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:opacity-80 ${spec.color}`}
                                                    >
                                                        {t(`profile.${spec.label}`)}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <FileText size={14} /> Sobre mí
                                </h3>
                                {!isEditingDesc && (
                                    <button onClick={() => { setTempDesc(user?.description || ''); setIsEditingDesc(true); }} className="text-gray-400 hover:text-sofofa-blue transition-colors">
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
                                        className="w-full text-sm p-2 border rounded-lg resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-sofofa-blue bg-white"
                                        placeholder="Escribe algo sobre ti para que los demás te conozcan..."
                                    />
                                    {descError && <p className="text-xs text-red-500 font-bold">{descError}</p>}
                                    <div className="flex justify-end gap-2 mt-1">
                                        <button onClick={() => {setIsEditingDesc(false); setDescError("");}} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1">Cancelar</button>
                                        <button onClick={handleSaveDesc} className="text-xs font-bold bg-sofofa-blue text-white px-3 py-1 rounded-full hover:bg-blue-700 transition">Guardar</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-700 italic">
                                    {user?.description ? `"${user.description}"` : "Aún no has añadido una descripción. ¡Añade una para que los demás te conozcan!"}
                                </p>
                            )}
                        </div>

                        <h4 className="font-bold text-gray-500 mb-2 border-b pb-1 mt-6">{t('profile.closet')}</h4>

                        {user.inventory && user.inventory.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {user.inventory.map((item) => {
                                    const isEquipped = user.equippedItems?.[item.type]?.id === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => equipItem(item)}
                                            className={`p-2 border rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-colors ${isEquipped ? 'bg-blue-50 border-sofofa-blue ring-2 ring-sofofa-blue/20' : 'hover:bg-gray-50'}`}
                                        >
                                            <img src={item.icon || item.image} alt={item.name} className="w-12 h-12 object-contain" />
                                            <span className="text-xs text-center font-semibold line-clamp-2">{item.name}</span>
                                            {isEquipped && <span className="text-[10px] bg-sofofa-blue text-white px-2 rounded-full">{t('profile.equipped')}</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">Tu armario está vacío.</p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
