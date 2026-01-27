import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft } from 'lucide-react';
import { peerService } from '../services/peerService';
import { botLogic } from '../utils/botLogic';
import { ROLES, SCENARIOS, BOSSES } from '../data/gameData';
import RoleAssignment from '../components/RoleAssignment';
import ShopModal from '../components/ShopModal';
import RpgCombat from '../components/RpgCombat';

// Initial Players Setup
const PLAYERS_TEMPLATE = [
    { id: 0, name: "Tú", avatar: "hero", role: "Alumno Motivado", color: "bg-blue-500", position: "bottom" },
    { id: 1, name: "Javiera", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Javi", role: "La Graciosa", color: "bg-red-500", position: "left" },
    { id: 2, name: "Lucas", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas", role: "El Deportista", color: "bg-green-500", position: "top" },
    { id: 3, name: "Matias", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mati", role: "El Gamer", color: "bg-yellow-500", position: "right" },
];

export default function GameBoard() {
    const navigate = useNavigate();
    const { user, gameMode, network } = useGameStore();

    // ================= GAMPLAY STATE =================
    // Only Host (or Solo) manages the "truth". Clients just render.
    const [gameState, setGameState] = useState({
        turn: 0,
        phase: 'SETUP', // SETUP, SCENARIO, ACTION, REVIEW
        activeCard: null,
        playedCards: [],
        messages: [],
        caseCounter: 0, // Track normal cases to trigger Grave cases
        players: gameMode === 'ONLINE' && network.players.length > 0
            ? network.players
            : []
    });

    const [showRoles, setShowRoles] = useState(false);

    // For local visual updates (e.g. optimistic UI)
    const [myHand, setMyHand] = useState([1, 2, 3, 4, 5]);
    const [isShopOpen, setIsShopOpen] = useState(false);

    // ================= HELPERS  =================
    const addMessage = (msg) => {
        setGameState(prev => ({
            ...prev,
            messages: [msg, ...prev.messages].slice(0, 5)
        }));
    };

    const broadcastState = (newState) => {
        if (gameMode === 'ONLINE' && network.isHost) {
            peerService.send({ type: 'STATE_UPDATE', state: newState });
        }
    };

    const updateState = (updates) => {
        setGameState(prev => {
            const newState = { ...prev, ...updates };
            // If we are the authority (Solo or Host), we expect to broadcast this change soon
            // But we do it in useEffect to avoid loops, or directly here?
            // Let's do it directly here for simplicity
            if (gameMode === 'SOLO' || (gameMode === 'ONLINE' && network.isHost)) {
                // We are authority
                setTimeout(() => broadcastState(newState), 0);
            }
            return newState;
        });
    };

    // ================= EFFECTS =================

    // 1. ONLINE SYNC
    useEffect(() => {
        if (gameMode === 'ONLINE') {
            // Setup Listeners
            peerService.on('onData', (data) => {
                // If Client: Receive State
                if (!network.isHost && data.type === 'STATE_UPDATE') {
                    setGameState(data.state);
                }

                // If Host: Receive Actions from Client
                if (network.isHost && data.type === 'CLIENT_ACTION') {
                    handleAction(data.action, data.playerId);
                }
            });

            // Initial Sync if Host
            if (network.isHost) {
                // Update player names based on connected peers?
                // For now, let's just sync initial state
                broadcastState(gameState);
            }
        }
    }, [gameMode, network.isHost]);

    // 2. SETUP PHASE (Only in Authority)
    useEffect(() => {
        if ((gameMode === 'SOLO' || (gameMode === 'ONLINE' && network.isHost)) && gameState.phase === 'SETUP') {
            const { assignRoles } = useGameStore.getState();
            assignRoles(ROLES);
            const players = useGameStore.getState().network.players;

            // Add role descriptions and combat cards from ROLES data
            const playersWithData = players.map(p => {
                const role = ROLES.find(r => r.id === p.roleId);
                return {
                    ...p,
                    description: role?.description,
                    roleCards: role?.cards || []
                };
            });

            updateState({
                players: playersWithData,
                phase: 'SETUP_SHOW'
            });
            setShowRoles(true);
        }
    }, [gameState.phase, gameMode]);

    // 3. BOT LOGIC (Only in SOLO)
    useEffect(() => {
        if (gameMode === 'SOLO' && gameState.turn !== 0 && (gameState.phase === 'ACTION' || gameState.phase === 'SCENARIO')) {
            // It's a bot's turn
            botLogic.decideAction(gameState, gameState.turn).then(action => {
                if (action) handleAction(action, gameState.turn);
            });
        }
    }, [gameState.turn, gameState.phase, gameMode]);

    // ================= HANDLERS =================

    const evaluationTriggeredRef = useRef(false);

    const handleAction = (action, playerId) => {
        // Core Game Logic (The Brain)
        // Only run this if Authority (Solo or Host)
        if (gameMode === 'ONLINE' && !network.isHost) {
            // Use network to send action to host
            peerService.send({ type: 'CLIENT_ACTION', action, playerId: 0 }); // Todo: Real Player ID logic
            return;
        }

        setGameState(prev => {
            let nextState = { ...prev };
            const playerName = prev.players.find(p => p.id === playerId)?.name || "Jugador";

            switch (action.type) {
                case 'DRAW_SCENARIO':
                    nextState.activeCard = action.payload;
                    nextState.phase = 'ACTION';
                    nextState.messages = [`${playerName} ha revelado un caso.`, ...nextState.messages];
                    evaluationTriggeredRef.current = false; // Reset for new round
                    break;

                case 'PLAY_CARD':
                    const newPlayedCards = [...nextState.playedCards, { ...action.payload, playerId }];
                    nextState.playedCards = newPlayedCards;
                    nextState.messages = [`${playerName} jugó una carta.`, ...nextState.messages];

                    // Turn Logic
                    if (newPlayedCards.length >= 4 && nextState.phase !== 'EVALUATING' && !evaluationTriggeredRef.current) {
                        nextState.phase = 'EVALUATING';
                        nextState.messages = [`Sofo está evaluando las soluciones...`, ...nextState.messages];
                        evaluationTriggeredRef.current = true;

                        // Trigger AI Evaluation async
                        import('../services/sofoEvaluationService').then(({ sofoEval }) => {
                            const plays = newPlayedCards.map(c => ({
                                playerId: c.playerId,
                                name: nextState.players.find(p => p.id === c.playerId).name,
                                role: c.role,
                                cardTitle: c.title,
                                cardDesc: c.desc
                            }));

                            sofoEval.evaluate(nextState.activeCard, plays).then(result => {
                                updateState({
                                    phase: 'REVIEW',
                                    evaluationResult: result
                                });

                                // Add points to winner
                                const { addPoints } = useGameStore.getState();
                                if (result.winnerId === 0) {
                                    addPoints(100);
                                }

                                // Auto-reset after a shorter delay to read results
                                setTimeout(() => {
                                    updateState({
                                        phase: 'SCENARIO',
                                        turn: (nextState.turn + 1) % 4,
                                        activeCard: null,
                                        playedCards: [],
                                        evaluationResult: null,
                                        caseCounter: nextState.caseCounter + 1 // Increment after Normal Case
                                    });
                                    evaluationTriggeredRef.current = false;
                                }, 5000); // Changed from 10000 to 5000
                            });
                        });
                    } else {
                        nextState.turn = (nextState.turn + 1) % 4;
                    }
                    break;
                default:
                    break;
            }

            // Sync with other players
            if (gameMode === 'SOLO' || (gameMode === 'ONLINE' && network.isHost)) {
                setTimeout(() => broadcastState(nextState), 0);
            }

            return nextState;
        });
    };

    // UI Triggers
    const onDrawScenario = () => {
        if (gameState.turn === 0 && gameState.phase === 'SCENARIO') {
            // Force Grave Case every 3 normal rounds (when counter reaches 2)
            const isGrave = gameState.caseCounter >= 2;
            const scenarioPool = isGrave ? BOSSES : SCENARIOS;
            const scenario = scenarioPool[Math.floor(Math.random() * scenarioPool.length)];

            if (isGrave) {
                updateState({
                    phase: 'RPG_START',
                    activeCard: scenario,
                    caseCounter: 0 // Reset after Boss
                });
            } else {
                handleAction({
                    type: 'DRAW_SCENARIO',
                    payload: scenario
                }, 0);
            }
        }
    };

    const onPlayCard = (cardIndex) => {
        if (gameState.turn === 0 && gameState.phase === 'ACTION') {
            const myRole = ROLES.find(r => r.id === gameState.players[0].roleId);
            const selectedCard = myRole.cards[cardIndex];

            handleAction({
                type: 'PLAY_CARD',
                payload: {
                    id: `card_${Date.now()}`,
                    owner: 0,
                    type: 'action',
                    title: selectedCard.title,
                    desc: selectedCard.desc,
                    role: myRole.name
                }
            }, 0);

            // Hand is generated from roles, so we don't need to manually remove from a static hand
        }
    };

    const getPlayerHand = (playerId) => {
        const p = gameState.players.find(pl => pl.id === playerId);
        if (!p) return [];
        const role = ROLES.find(r => r.id === p.roleId);
        return role ? role.cards : [];
    };

    // ================= RENDER =================

    // Helper to get formatted players relative to "Me"
    // In Online, we might need to rotate based on assigned ID.
    // For now assuming ID 0 is always "Me" locally for SOLO.
    // For ONLINE, we need mapping.

    // Hack for Online View: Host is 0. Client is 1.
    // If I am Client (1), I want 1 to be at bottom.
    // Implementation: Rotate array so my ID is at index 0 (bottom).

    // Current Simplication: 
    // Solo: I am 0.
    // Online Host: I am 0.
    // Online Client: I am 0? No, Host sees me as connected peer.
    // Let's stick to: "Bottom" is always Current User View.

    return (
        <div className="min-h-screen bg-slate-800 relative overflow-hidden flex items-center justify-center font-sans">

            {/* UI Overlay: Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-20 pointer-events-none">
                <button
                    onClick={() => {
                        if (gameMode === 'ONLINE') peerService.peer?.destroy();
                        navigate('/menu');
                    }}
                    className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                >
                    <ArrowLeft size={20} /> Salir
                </button>

                <div className="bg-black/30 px-6 py-2 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-4">
                    <span>Turno: <span className="font-bold text-sofofa-lightBlue">{gameState.players.find(p => p.id === gameState.turn)?.name}</span></span>
                    <span className="text-xs opacity-70">| Fase: {gameState.phase}</span>
                    <span className="text-xs px-2 bg-blue-500 rounded text-white">{gameMode}</span>
                </div>

                <div className="w-8"></div> {/* Spacer */}
            </div>

            {/* Messages / Log */}
            <div className="absolute top-20 right-4 w-64 space-y-2 pointer-events-none">
                <AnimatePresence>
                    {gameState.messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-black/50 text-white text-xs p-2 rounded-lg backdrop-blur-sm"
                        >
                            {msg}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* The Table */}
            <div className="relative w-[90%] max-w-[800px] aspect-video bg-[#e3d5c6] rounded-[100px] shadow-2xl flex items-center justify-center border-8 border-[#8b5a2b]">

                {/* Center Decks & Active Area */}
                <div className="flex gap-4 items-center">

                    {/* Deck: Scenarios */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        onClick={onDrawScenario}
                        className={`w-24 h-36 bg-red-800 rounded-lg border-2 border-white/20 shadow-md flex items-center justify-center cursor-pointer transition-opacity ${gameState.phase !== 'SCENARIO' ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <div className="text-center">
                            <span className="text-white font-bold text-xs block">CASOS</span>
                            {gameState.turn === 0 && gameState.phase === 'SCENARIO' && <span className="text-[10px] text-yellow-300 animate-pulse">(Toca para robar)</span>}
                        </div>
                    </motion.div>

                    {/* Active Card / Table Center */}
                    <div className="relative w-48 h-64 border-4 border-dashed border-gray-400/30 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                        {gameState.activeCard ? (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white w-full h-full rounded-md shadow-lg p-4 text-xs flex flex-col items-center justify-center"
                            >
                                <h4 className="font-bold text-red-600 mb-2">{gameState.activeCard.title}</h4>
                                <p>{gameState.activeCard.desc}</p>
                            </motion.div>
                        ) : (
                            <span className="text-sm font-bold text-gray-500 opacity-50">Mesa Central</span>
                        )}

                        {/* Played Cards Overlay */}
                        {gameState.playedCards.map((card, i) => (
                            <motion.div
                                key={card.id}
                                initial={{ scale: 2, y: 100, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1, rotate: (i - 1) * 10 }}
                                className="absolute w-20 h-28 bg-blue-100 border border-blue-300 rounded shadow-md z-10"
                                style={{ top: '20%', left: `calc(50% - 40px + ${i * 10}px)` }}
                            />
                        ))}
                    </div>

                    {/* Deck: Actions */}
                    <div className="w-24 h-36 bg-blue-800 rounded-lg border-2 border-white/20 shadow-md flex items-center justify-center opacity-80">
                        <span className="text-white font-bold text-xs text-center">ACCIONES</span>
                    </div>
                </div>

            </div>

            {/* Players Positioning */}
            {gameState.players.map((p) => {
                const isMe = p.position === 'bottom';
                let posStyles = "";
                if (p.position === 'bottom') posStyles = "bottom-4 left-1/2 -translate-x-1/2";
                if (p.position === 'top') posStyles = "top-4 left-1/2 -translate-x-1/2 flex-col-reverse";
                if (p.position === 'left') posStyles = "left-8 top-1/2 -translate-y-1/2 flex-row-reverse";
                if (p.position === 'right') posStyles = "right-8 top-1/2 -translate-y-1/2";

                const isCurrentTurn = gameState.turn === p.id;

                return (
                    <motion.div
                        key={p.id}
                        animate={{ scale: isCurrentTurn ? 1.1 : 1, opacity: isCurrentTurn ? 1 : 0.7 }}
                        className={`absolute ${posStyles} flex flex-col items-center gap-2 z-10 transition-all duration-500`}
                    >
                        {/* Avatar Circle */}
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${isMe ? 'border-amber-400' : 'border-gray-600'} ${isCurrentTurn ? 'ring-4 ring-white/50' : ''} bg-gray-200 overflow-hidden relative transition-all`}>
                            <img src={isMe ? (user?.avatar || p.avatar) : p.avatar} alt={p.name} className="w-full h-full object-cover" />
                            {isMe && user.equippedItems?.shirt && (
                                <img src={user.equippedItems.shirt.icon} className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-white border" />
                            )}
                        </div>

                        {/* Name Badge */}
                        <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold border border-white/10 flex flex-col items-center">
                            <span>{isMe ? user?.name : p.name}</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-70">{p.role === 'Alumno Motivado' && user.equippedItems ? 'Uniformado' : p.role}</span>
                        </div>

                        {/* Hand (Only for me) */}
                        {isMe && (
                            <div className="absolute bottom-24 flex gap-[-10px]">
                                {getPlayerHand(p.id).map((card, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -30, scale: 1.1, zIndex: 50 }}
                                        onClick={() => onPlayCard(i)}
                                        className={`w-24 h-36 bg-white rounded-lg border-2 border-gray-300 shadow-xl -ml-6 first:ml-0 transform transition-all cursor-pointer p-3 flex flex-col ${gameState.turn === 0 && gameState.phase === 'ACTION' ? 'hover:ring-2 ring-green-400' : 'opacity-50 grayscale'}`}
                                        style={{ rotate: `${(i - 1.5) * 5}deg` }}
                                    >
                                        <div className="text-[10px] font-black text-sofofa-blue uppercase mb-1 leading-tight">{card.title}</div>
                                        <div className="text-[8px] text-gray-600 leading-tight flex-1">{card.desc}</div>
                                        <div className="mt-auto text-center text-[7px] text-gray-400 font-bold uppercase tracking-tighter">Usar Acción</div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                );
            })}

            {gameState.phase === 'REVIEW' && gameState.evaluationResult && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <div className="bg-slate-800 border-2 border-sofofa-lightBlue rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-sofofa-lightBlue rounded-full flex items-center justify-center text-white text-3xl font-black">S</div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic">Evaluación de Sofo</h3>
                                <p className="text-sofofa-lightBlue text-sm font-bold">Criterio RICE y Convivencia Escolar</p>
                            </div>
                        </div>

                        <p className="text-gray-300 italic mb-8 border-l-4 border-sofofa-lightBlue pl-4">
                            "{gameState.evaluationResult.sofoComment}"
                        </p>

                        <div className="space-y-4 mb-8">
                            {gameState.evaluationResult.ranking.map((rank, i) => {
                                const player = gameState.players.find(p => p.id === rank.playerId);
                                return (
                                    <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-white">{player?.name}</span>
                                                <span className="text-xs font-black bg-white/10 px-2 py-1 rounded text-sofofa-lightBlue">
                                                    Puntos: {rank.score}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{rank.feedback}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-center text-xs text-gray-500 animate-pulse">
                            Siguiente ronda en unos segundos...
                        </div>
                    </div>
                </motion.div>
            )}

            {gameState.phase === 'RPG_START' && gameState.activeCard && (
                <div className="fixed inset-0 z-[100] bg-slate-900">
                    <RpgCombat
                        boss={gameState.activeCard}
                        onVictory={() => {
                            useGameStore.getState().addPoints(500);
                            updateState({ phase: 'SCENARIO', activeCard: null, turn: (gameState.turn + 1) % 4 });
                        }}
                        onDefeat={() => {
                            alert("¡Han sido derrotados! El liceo ha caído en el caos.");
                            navigate('/menu');
                        }}
                        openShop={() => setIsShopOpen(true)}
                    />
                </div>
            )}

            <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />

            {showRoles && (
                <RoleAssignment
                    players={gameState.players}
                    onStart={() => {
                        setShowRoles(false);
                        updateState({ phase: 'SCENARIO' });
                    }}
                />
            )}

        </div>
    );
}
