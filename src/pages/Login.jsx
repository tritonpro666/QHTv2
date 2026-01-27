import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Chrome, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function Login() {
    const navigate = useNavigate();
    const { login, register, loginWithGoogle, users, rememberedEmails, removeRememberedAccount, authError } = useGameStore();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [googleEmail, setGoogleEmail] = useState('');

    // Mirror store error to local error state
    React.useEffect(() => {
        if (authError) setError(authError);
    }, [authError]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (isRegistering) {
            if (!name) {
                setError('Por favor ingresa tu nombre');
                return;
            }
            // Register Logic
            const result = register(email, password, name);
            // We need to check if registration failed (duplicate email). 
            // Zustand actions return state, but our store logic returns "new state" or ignores.
            // A better way is to check if it succeeded.
            // For this sync implementation, let's just attempt login immediately after.
            // ACTUALLY our store logic returns state. If users[email] existed, it returned state unchanged.
            // We can check store state here. But simpler: try to login. If it fails, registration failed.

            // Wait, our register action sets `isAuthenticated: true` if successful.
            // Let's rely on that. check `useGameStore.getState().isAuthenticated`.
        } else {
            // Login Logic
            login(email, password);
        }
    };

    // Check auth status effect
    React.useEffect(() => {
        const unsub = useGameStore.subscribe((state) => {
            if (state.isAuthenticated) {
                navigate('/menu');
            }
        });
        return unsub;
    }, [navigate]);

    const handleGoogleLogin = () => {
        if (googleEmail) {
            loginWithGoogle(googleEmail);
            setShowGoogleModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-3xl animate-pulse" />

            <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl p-8 border border-white/50 relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <img src="/assets/sofofa_full.png" alt="SOFOFA" className="h-10 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-gray-800">
                        {isRegistering ? 'Crea tu Cuenta' : 'Bienvenido de nuevo'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isRegistering ? 'Únete a la comunidad y empieza a aprender.' : 'Ingresa para continuar tu progreso.'}
                    </p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                        >
                            <AlertCircle size={16} /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {isRegistering && (
                        <div className="group">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sofofa-blue transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-sofofa-blue/50 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div className="group">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sofofa-blue transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-sofofa-blue/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sofofa-blue transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-sofofa-blue/50 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-sofofa-blue hover:bg-sofofa-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isRegistering ? 'Registrarse' : 'Iniciar Sesión'} <ArrowRight size={20} />
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-50 text-gray-500 bg-opacity-0 bg-white">O continúa con</span>
                    </div>
                </div>

                <button
                    onClick={() => setShowGoogleModal(true)}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-4"
                >
                    <Chrome size={20} className="text-blue-500" /> Google
                </button>

                {/* Remembered Accounts */}
                {rememberedEmails?.length > 0 && !isRegistering && (
                    <div className="mt-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cuentas Guardadas</h3>
                        <div className="space-y-2">
                            {rememberedEmails.map((savedEmail) => {
                                const savedUser = users && users[savedEmail];

                                return (
                                    <div key={savedEmail} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                        onClick={() => {
                                            // Pre-fill and focus password
                                            setEmail(savedEmail);
                                            setPassword('');
                                            // Focus the password input in the main form
                                            const passInput = document.querySelector('form input[type="password"]');
                                            if (passInput) passInput.focus();
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                <img src={savedUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${savedEmail}`} alt="avatar" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-gray-700">{savedUser?.name || savedEmail.split('@')[0]}</div>
                                                <div className="text-xs text-gray-400">{savedEmail}</div>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 group-hover:text-sofofa-blue">
                                            <Lock size={16} />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeRememberedAccount(savedEmail);
                                            }}
                                            className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="text-center mt-6">
                    <button
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                        className="text-sofofa-blue font-bold text-sm hover:underline"
                    >
                        {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>

            </div>

            {/* Home Button */}
            <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 font-bold">
                ← Volver
            </button>

            {/* Mock Google Modal - 2 Steps now */}
            <AnimatePresence>
                {showGoogleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-lg p-6 w-full max-w-sm"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <Chrome size={48} className="text-blue-500" />
                                <h3 className="text-lg font-bold">Sign in with Google</h3>
                                <p className="text-sm text-center text-gray-500">
                                    Simulación segura: Ingresa tu correo y define una contraseña local.
                                </p>

                                <input
                                    type="email"
                                    placeholder="name@gmail.com"
                                    value={googleEmail}
                                    onChange={(e) => setGoogleEmail(e.target.value)}
                                    className="w-full border rounded p-2"
                                    autoFocus
                                />

                                <input
                                    type="password"
                                    placeholder="Confirmar Contraseña Local"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border rounded p-2"
                                />

                                <div className="flex gap-2 w-full">
                                    <button onClick={() => { setShowGoogleModal(false); setGoogleEmail(''); setPassword(''); }} className="flex-1 text-sm text-gray-400 hover:text-gray-600 bg-gray-100 py-2 rounded">
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (googleEmail && password) {
                                                loginWithGoogle(googleEmail, password);
                                                setShowGoogleModal(false);
                                                setGoogleEmail('');
                                                setPassword('');
                                            } else {
                                                alert("Por favor ingresa correo y contraseña.");
                                            }
                                        }}
                                        className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
