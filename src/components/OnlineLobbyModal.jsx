import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, ArrowRight, Loader, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { peerService } from '../services/peerService';

export default function OnlineLobbyModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { user, updateNetwork } = useGameStore();

    const [mode, setMode] = useState('MENU'); // MENU, HOST, JOIN
    const [myId, setMyId] = useState('');
    const [joinId, setJoinId] = useState('');
    const [status, setStatus] = useState('');
    const [players, setPlayers] = useState([]);

    // Sync players to store whenever they change locally, so GameBoard can access them
    useEffect(() => {
        if (players.length > 0) {
            updateNetwork({ players });
        }
    }, [players, updateNetwork]);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setMode('MENU');
            setMyId('');
            setPlayers([]);
            setStatus('');
        }
    }, [isOpen]);

    // Cleanup on close? Maybe not if we want to keep connection alive while navigating?
    // Actually, we should only initialize peer when choosing HOST or JOIN.

    const handleHost = () => {
        setMode('HOST');
        setStatus('Generando código de sala...');

        // Init Peer as Host
        // We can use a random ID or let PeerJS assign one. Let's let PeerJS assign one for short uniqueness if possible, 
        // or generate a random 4-char string.
        // PeerJS IDs must be unique globally on their server.
        const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const fullId = `QHT-${randomId}`; // Prefix to avoid collisions

        peerService.initialize(fullId);

        peerService.on('onOpen', (id) => {
            setMyId(id);
            setStatus('Esperando jugadores...');
            updateNetwork({ isHost: true, roomId: id, connectionStatus: 'CONNECTING' });
            setPlayers([user]); // Host is first player
        });

        peerService.on('onClientConnect', (clientId) => {
            console.log("Client joined:", clientId);
            // In a real app we'd ask for their name. For now assume generic.
            // We can send a handshake later.
            setPlayers(prev => [...prev, { name: "Jugador 2", id: clientId }]);
            setStatus('Jugador conectado. ¡Listo para iniciar!');
            updateNetwork({ connectionStatus: 'CONNECTED' });
        });

        peerService.on('onData', (data) => {
            if (data.type === 'HANDSHAKE') {
                setPlayers(prev => {
                    const newP = [...prev];
                    // Update the second player's name
                    if (newP[1]) newP[1].name = data.user.name;
                    return newP;
                });
            }
        });
    };

    const handleJoin = () => {
        setMode('JOIN');
        setStatus('');
    };

    const submitJoin = () => {
        if (!joinId) return;
        setStatus('Conectando a la sala...');

        // Init Peer as Client (random ID okay)
        peerService.initialize();

        peerService.on('onOpen', () => {
            // Once we have our own ID, connect to host
            peerService.connect(joinId);
        });

        peerService.on('onConnect', () => {
            setStatus('¡Conectado! Esperando al anfitrión...');
            updateNetwork({ isHost: false, roomId: joinId, connectionStatus: 'CONNECTED' });
            // Send Handshake with our info
            peerService.send({ type: 'HANDSHAKE', user: { name: user.name, avatar: user.avatar } });
        });

        peerService.on('onData', (data) => {
            if (data.type === 'START_GAME') {
                navigate('/game');
            }
        });

        peerService.on('onError', (err) => {
            setStatus('Error: No se pudo conectar.');
        });
    };

    const startGame = () => {
        // Broadcast Start
        peerService.send({ type: 'START_GAME' });
        navigate('/game');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(myId);
        // Show tooltip?
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-3xl p-8 max-w-lg w-full relative overflow-hidden shadow-2xl"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <X size={24} />
                    </button>

                    <h2 className="text-2xl font-black text-center text-gray-800 mb-6 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Users className="text-sofofa-blue" />
                        Sala Online
                    </h2>

                    {mode === 'MENU' && (
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={handleHost}
                                className="bg-sofofa-blue text-white p-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-between group"
                            >
                                <span>Crear Sala</span>
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button
                                onClick={handleJoin}
                                className="bg-white border-2 border-gray-200 text-gray-700 p-6 rounded-xl font-bold text-lg hover:border-sofofa-blue hover:text-sofofa-blue transition-colors flex items-center justify-between group"
                            >
                                <span>Unirse a Sala</span>
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    )}

                    {mode === 'HOST' && (
                        <div className="text-center space-y-6">
                            <div>
                                <p className="text-gray-500 text-sm mb-2">Tu Código de Sala</p>
                                <div className="flex items-center justify-center gap-2">
                                    {myId ? (
                                        <div className="text-3xl font-mono font-bold tracking-widest bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 select-all">
                                            {myId}
                                        </div>
                                    ) : (
                                        <Loader className="animate-spin text-sofofa-blue mx-auto" />
                                    )}
                                    {myId && (
                                        <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                            <Copy size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl">
                                <h3 className="font-bold text-blue-700 mb-2">Jugadores ({players.length}/4)</h3>
                                <div className="space-y-2">
                                    {players.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} alt="avatar" />
                                            </div>
                                            <span className="font-bold text-sm text-gray-700">{p.name || "Jugador"}</span>
                                            {i === 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded ml-auto">Host</span>}
                                        </div>
                                    ))}
                                    {players.length === 1 && (
                                        <div className="text-sm text-gray-400 italic animate-pulse">Esperando conexión...</div>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-gray-500">{status}</p>

                            <button
                                onClick={startGame}
                                disabled={players.length < 2}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${players.length >= 2 ? 'bg-green-500 text-white shadow-lg shadow-green-200 hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                Iniciar Partida
                            </button>
                        </div>
                    )}

                    {mode === 'JOIN' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Ingresa el Código</label>
                                <input
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                                    placeholder="Ej: QHT-X92A"
                                    className="w-full text-center text-2xl font-mono p-4 border-2 border-gray-200 rounded-xl focus:border-sofofa-blue outline-none transition-colors uppercase"
                                />
                            </div>

                            <p className="text-center text-sm text-gray-500 h-6">{status}</p>

                            <button
                                onClick={submitJoin}
                                disabled={!joinId || status.includes('Conectando')}
                                className="w-full bg-sofofa-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                            >
                                {status.includes('Conectando') ? 'Conectando...' : 'Unirse'}
                            </button>
                        </div>
                    )}

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
