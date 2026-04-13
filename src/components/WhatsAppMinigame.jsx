import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { COEXISTENCE_CASES } from '../data/coexistenceDecks';
import { Trophy, AlertCircle, Heart, Shield, Plus, Star, MessageSquareX, PhoneOff, Users, Clock, Skull } from 'lucide-react';
import { SHOP_ITEMS } from '../data/gameData';
import CutIn from './CutIn';
import InspectorEvent from './InspectorEvent';

const MSG_TEXTS = [
    "¡Eres lo peor!", "Nadie te soporta", "Jaja qué perdedor", 
    "No sirves para esto", "Te voy a funar", "Qué vergüenza das",
    "Ándate del liceo", "Mírate al espejo", "Nadie te quiere aquí"
];

const BUTTONS = [
    { id: 'EMPATHY', key: 'A', label: 'Empatía', icon: <Heart size={20} />, color: 'bg-pink-500', hoverColor: 'hover:bg-pink-500', border: 'border-pink-700' },
    { id: 'RESPECT', key: 'S', label: 'Respeto', icon: <Shield size={20} />, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-500', border: 'border-blue-700' },
    { id: 'INCLUSION', key: 'K', label: 'Inclusión', icon: <Plus size={20} />, color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-500', border: 'border-emerald-700' },
    { id: 'COMMITMENT', key: 'L', label: 'Compromiso', icon: <Star size={20} />, color: 'bg-amber-500', hoverColor: 'hover:bg-amber-500', border: 'border-amber-700' }
];

export default function WhatsAppMinigame({ onComplete }) {
    const { updatePlayerCombat, network, user, addXp, addToSessionInventory, updateRumor, increaseBond } = useGameStore();
    const [currentCase, setCurrentCase] = useState(null);
    const [phase, setPhase] = useState('INTRO'); // INTRO -> COUNTDOWN -> PLAYING -> RESULT -> STOLEN
    const [countdown, setCountdown] = useState(3);
    const [score, setScore] = useState(0);
    const [misses, setMisses] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [coexistenceLog, setCoexistenceLog] = useState([]);
    const [showCutIn, setShowCutIn] = useState(null);
    const [showInspectorCutIn, setShowInspectorCutIn] = useState(false);
    const [isInspectorWatching, setIsInspectorWatching] = useState(false);
    const [showInspector, setShowInspector] = useState(false);
    const [inspectorPunishment, setInspectorPunishment] = useState(null);
    const [timeLeft, setTimeLeft] = useState(20);

    // Rhythm game refs
    const bubblesRef = useRef([]);
    const [renderTick, setRenderTick] = useState(false);
    const totalBubblesSpawned = useRef(0);

    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [hitTexts, setHitTexts] = useState([]);
    const [isShaking, setIsShaking] = useState(false);

    const addHitText = (x, y, text, color) => {
        const id = Date.now() + Math.random();
        setHitTexts(prev => [...prev, { id, x, y, text, color }]);
        setTimeout(() => {
            setHitTexts(prev => prev.filter(t => t.id !== id));
        }, 800);
    };

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
    };

    const resetCombo = () => {
        setCombo(0);
        triggerShake();
    };

    const increaseCombo = () => {
        setCombo(c => {
            const next = c + 1;
            setMaxCombo(m => Math.max(m, next));
            return next;
        });
    };

    const addLog = (msg) => {
        setCoexistenceLog(prev => [msg, ...prev].slice(0, 5));
    };

    const players = network.players.length > 0 ? network.players : [
        { id: 0, name: "Tú", avatar: "hero", position: 'bottom', role: "Alumno Motivado" }
    ];

    useEffect(() => {
        const randomCase = COEXISTENCE_CASES[Math.floor(Math.random() * COEXISTENCE_CASES.length)];
        setCurrentCase(randomCase);
        setIsInspectorWatching(Math.random() < 0.4); // 40% chance of being watched
        setPhase('INTRO');
    }, []);

    // Phase Manager
    useEffect(() => {
        if (network.rumorLevel >= 100 && phase === 'PLAYING' && !showInspectorCutIn) {
            updateRumor(-100); // Disminuir inmediatamente para evitar loops
            setShowInspectorCutIn(true);
            return;
        }

        if (phase === 'INTRO') {
            setTimeout(() => setPhase('COUNTDOWN'), 3000);
        } else if (phase === 'COUNTDOWN') {
            if (countdown > 0) {
                setTimeout(() => setCountdown(c => c - 1), 1000);
            } else {
                setPhase('PLAYING');
            }
        } else if (phase === 'PLAYING' && !showInspectorCutIn) {
            // Global Play Timer
            const timer = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timer);
                        setPhase('EVALUATE');
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        } else if (phase === 'EVALUATE') {
            evaluateHand();
        }
    }, [phase, countdown, network.rumorLevel, showInspectorCutIn, updateRumor]);

    // Game Loop
    useEffect(() => {
        if (phase !== 'PLAYING' || showInspectorCutIn) return;

        // Spawner
        const spawnInterval = setInterval(() => {
            if (totalBubblesSpawned.current < 25) { // increased max bubbles
                const isTroll = Math.random() < 0.15; // 15% chance to be troll
                let type = 'TROLL';

                if (!isTroll) {
                    const requiredTypes = currentCase.required.length > 0 ? currentCase.required : ['EMPATHY', 'RESPECT'];
                    type = Math.random() < 0.7 
                        ? requiredTypes[Math.floor(Math.random() * requiredTypes.length)]
                        : BUTTONS[Math.floor(Math.random() * BUTTONS.length)].id;
                }
                
                bubblesRef.current.push({
                    id: Date.now() + Math.random(),
                    type,
                    text: isTroll ? "¡PASA PACK! 👿" : MSG_TEXTS[Math.floor(Math.random() * MSG_TEXTS.length)],
                    y: -10,
                    x: 10 + Math.random() * 60, // random horizontal offset 10% to 70%
                    speed: 0.8 + Math.random() * 1.5,
                    hit: false,
                    isTroll
                });
                if (!isTroll) totalBubblesSpawned.current += 1; // don't count troll towards max quota
            }
        }, 800);

        // Physics Loop
        const physicsInterval = setInterval(() => {
            let missedAny = false;
            let activeBubbles = [];

            bubblesRef.current.forEach(b => {
                if (b.hit) return;
                b.y += b.speed;
                if (b.y > 105) {
                    if (b.isTroll) {
                        setScore(s => s + 1);
                    } else {
                        missedAny = true;
                        setMisses(m => m + 1);
                        const mult = isInspectorWatching ? 2 : 1;
                        updateRumor(5 * mult); // Instantly increase rumor
                    }
                } else {
                    activeBubbles.push(b);
                }
            });

            if (missedAny) {
                addLog("💥 ¡Mensaje tóxico evadido! El Rumor sube.");
                resetCombo();
            }

            bubblesRef.current = activeBubbles;
            setRenderTick(prev => !prev);
            
            // Bot auto-play logic locally
            if(Math.random() < 0.05 && activeBubbles.length > 0 && players.length > 1) {
                const target = activeBubbles.find(b => b.y > 60 && b.y < 95);
                if (target) {
                    target.hit = true;
                    const bot = players[Math.floor(Math.random() * (players.length - 1)) + 1];
                    addLog(`🤖 ${bot.name} filtró un mensaje con ${target.type}.`);
                    setScore(s => s + 1);
                }
            }

        }, 50);

        return () => { clearInterval(spawnInterval); clearInterval(physicsInterval); };
    }, [phase, currentCase, showInspectorCutIn, isInspectorWatching, updateRumor]);

    const handleReactionClick = (type) => {
        if (phase !== 'PLAYING') return;

        // Find lowest bubble in Hit Zone (y between 70 and 100)
        const hitZoneBubbles = bubblesRef.current.filter(b => b.y > 70 && b.y < 100 && !b.hit);
        
        if (hitZoneBubbles.length === 0) return; // Nothing to hit

        // Get the lowest one
        hitZoneBubbles.sort((a,b) => b.y - a.y);
        const target = hitZoneBubbles[0];
        target.hit = true;

        if (target.isTroll) {
            setMisses(m => m + 1);
            const mult = isInspectorWatching ? 2 : 1;
            updateRumor(20 * mult);
            addLog(`💀 ¡Caíste en el Bait! El rumor sube (+${20 * mult}).`);
            addHitText(target.x, target.y, "¡BAIT!", "text-red-500");
            resetCombo();
        } else if (target.type === type) {
            // HIT!
            let pts = 1;
            let fbText = "¡Good!";
            let fbColor = "text-blue-400";
            
            // Perfect precision
            if (target.y >= 80 && target.y <= 90) {
                pts = 2;
                fbText = "¡PERFECT!";
                fbColor = "text-yellow-400";
            }
            
            setScore(s => s + pts);
            increaseCombo();
            addHitText(target.x, target.y, fbText, fbColor);
        } else {
            // MISS PENALTY (Wrong reaction)
            setMisses(m => m + 1);
            const mult = isInspectorWatching ? 2 : 1;
            updateRumor(10 * mult);
            addLog(`❌ Reacción equivocada. El rumor sube (+${10 * mult}).`);
            addHitText(target.x, target.y, "¡Miss!", "text-red-500");
            resetCombo();
        }
    };

    const latestHandleReactionRef = useRef(handleReactionClick);
    useEffect(() => {
        latestHandleReactionRef.current = handleReactionClick;
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.repeat) return;
            const key = e.key.toUpperCase();
            const btnOptions = {
                'A': 'EMPATHY',
                'S': 'RESPECT',
                'K': 'INCLUSION',
                'L': 'COMMITMENT'
            };
            if (btnOptions[key]) {
                latestHandleReactionRef.current(btnOptions[key]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const evaluateHand = () => {
        const total = score;
        const mult = isInspectorWatching ? 2 : 1;
        
        if (total >= 14) {
            setFeedback("¡AMBIENTE BAKÁN!");
            addLog("✨ ¡Chat dominado! Todos recuperan 100% HP y Energía.");
            addLog("🎁 Equipo recibe: Poción de Resurrección");
            addLog("🌟 +150 XP para todos");
            addLog("📉 El Rumor bajó (-10)");
            addLog("🤝 Vínculo de Equipo +5");
            addXp(150);
            updateRumor(-10);
            network.players.slice(1).forEach(p => increaseBond(0, p.id, 5));
            addToSessionInventory(SHOP_ITEMS.find(i => i.id === 'pot_revive'));
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: p.maxHp, energy: p.maxEnergy }));
            setShowCutIn(players[0]);
        } else if (total >= 8) {
            setFeedback("AMBIENTE PULENTO");
            addLog("👍 Pulento. Filtraron casi todo. Recuperan 50% HP.");
            addLog("🎁 Equipo recibe: Colación Completa");
            addLog("🌟 +80 XP para todos");
            addLog("📉 El Rumor bajó (-5)");
            addLog("🤝 Vínculo de Equipo +2");
            addXp(80);
            updateRumor(-5);
            network.players.slice(1).forEach(p => increaseBond(0, p.id, 2));
            addToSessionInventory(SHOP_ITEMS.find(i => i.id === 'pot_mix_1'));
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: Math.min(p.maxHp, p.hp + (p.maxHp*0.5)), energy: Math.min(p.maxEnergy, p.energy + (p.maxEnergy*0.5)) }));
        } else if (total >= 4) {
            setFeedback("AMBIENTE PIOLA");
            addLog("👌 Piola. Lograron controlar algo. Recuperan 20% HP.");
            addLog("🎁 Equipo recibe: Leche de Recreo");
            addLog("🌟 +30 XP para todos");
            addXp(30);
            addToSessionInventory(SHOP_ITEMS.find(i => i.id === 'pot_hp_1'));
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: Math.min(p.maxHp, p.hp + (p.maxHp*0.2)), energy: Math.min(p.maxEnergy, p.energy + (p.maxEnergy*0.2)) }));
        } else {
            setFeedback("AMBIENTE PENCA");
            addLog("💀 ¡Funa Total! El estrés daña al equipo.");
            addLog("❌ -20% HP Máximo a todos");
            addLog(`📈 Aumenta el Rumor Escolar MASIVAMENTE (+${40 * mult})`);
            updateRumor(40 * mult);
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: Math.max(1, p.hp - (p.maxHp*0.2)) }));
            setTimeout(() => applyInspectorRoulette(), 1500);
        }

        setPhase('RESULT');
    };

    const handleInspectorComplete = () => {
        setShowInspectorCutIn(false);
        addLog("🔴 ¡INSPECTORÍA! Castigo disciplinario por uso de celular en clase.");
        addLog("❌ -50% HP a TODOS y Rumor vuelve a 0.");
        network.players.forEach(p => updatePlayerCombat(p.id, { hp: Math.max(1, p.hp - (p.maxHp*0.5)) }));
    };

    const handleStolenPhone = () => {
        setPhase('STOLEN');
        setTimeout(() => onComplete(), 3000);
    };

    const applyInspectorRoulette = () => {
        setShowInspector(true);
        setTimeout(() => {
            const roll = Math.random();
            if (roll < 0.33) {
                setInspectorPunishment({ text: "¡Anotación Negativa!", desc: "-5 STR a todos", icon: "📝" });
                network.players.forEach(p => updatePlayerCombat(p.id, { str: Math.max(1, (p.str || 10) - 5) }));
            } else if (roll < 0.66) {
                setInspectorPunishment({ text: "¡Celulares Retenidos!", desc: "Pierden Toda la Energía", icon: "📱" });
                network.players.forEach(p => updatePlayerCombat(p.id, { energy: 0 }));
            } else {
                setInspectorPunishment({ text: "¡Citación al Apoderado!", desc: "Se pierden 100 XP", icon: "😠" });
                addXp(-100);
            }
        }, 3000);
    };

    return (
        <div className="flex flex-col h-full w-full items-center justify-center bg-slate-900 relative overflow-hidden font-sans select-none">
            {/* BACKGROUND DECOR */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/chat.png')] bg-repeat" />

            {/* HEADER info */}
            <div className="absolute top-4 w-full px-8 z-10 flex justify-between items-start pointer-events-none">
                <div className="w-64">
                    <div className="text-[10px] font-black uppercase text-red-500 mb-1 tracking-widest bg-black/50 w-fit px-2 rounded flex items-center gap-1">
                        <AlertCircle size={12}/> Funa Meter (Rumor)
                    </div>
                    <div className="w-full h-3 bg-red-950 border-2 border-red-900 rounded-full overflow-hidden shadow-2xl relative">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 to-red-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, network.rumorLevel || 0)}%` }}
                        />
                    </div>
                </div>
                
                <div className="bg-black/60 px-4 py-2 rounded-xl border border-white/10 text-right backdrop-blur-md">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Puntaje</div>
                    <div className="text-xl font-black text-white">{score} <span className="text-gray-500 text-sm">/ {totalBubblesSpawned.current * 2}</span></div>
                    {combo > 2 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-sm font-black text-yellow-400 mt-1 uppercase italic">
                            {combo} Combo!
                        </motion.div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isInspectorWatching && (
                    <motion.div 
                        initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
                        className="absolute right-8 top-24 z-20 bg-red-950/80 border-2 border-red-500 px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,0,0.5)] backdrop-blur-md"
                    >
                        <img src="/inspector_avatar.png" className="w-8 h-8 rounded-full border border-red-300 object-cover" />
                        <div className="text-right">
                            <p className="text-white font-black text-xs uppercase">Vigilancia</p>
                            <p className="text-red-300 text-[9px] uppercase tracking-wider">Castigos de Rumor x2</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN PHONE UI CONATINER */}
            <motion.div 
                animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm h-[80vh] bg-[#0b141a] rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col mt-8"
            >
                
                {/* Phone Header */}
                <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 border-b border-white/5 z-20 shadow-md">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                        <Users className="text-white opacity-50" size={20} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-white font-bold text-sm leading-tight">Grupo de Curso 2°B</h2>
                        <p className="text-[#8696a0] text-xs truncate">Tú, Javiera, Lucas, Matias...</p>
                    </div>
                    <div className="text-[#00a884] font-bold text-sm flex items-center gap-1">
                        <Clock size={14}/> {timeLeft}s
                    </div>
                </div>

                {/* Chat Area (Rhythm Zone) */}
                <div className="flex-1 relative overflow-hidden bg-[#0b141a] bg-[url('https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6096d274ad3e07.png')] bg-cover bg-center">
                    
                    {/* Hit Zone Line */}
                    <div className="absolute bottom-4 left-0 right-0 h-16 border-y-2 border-white/20 bg-white/5 z-10 flex items-center justify-center pointer-events-none">
                        <span className="text-white/20 font-black uppercase tracking-[0.5em] text-2xl">ZONA DE REACCIÓN</span>
                    </div>

                    {/* Intro Phase Overlay */}
                    <AnimatePresence>
                        {phase === 'INTRO' && currentCase && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
                                className="absolute inset-x-4 top-20 bg-[#202c33] text-white p-4 rounded-xl shadow-2xl z-30 border border-white/10"
                            >
                                <h3 className="text-emerald-400 font-bold mb-2 uppercase text-xs flex items-center gap-2"><AlertCircle size={14}/> Nuevo Conflicto Detectado</h3>
                                <p className="font-bold mb-2 text-sm">{currentCase.title}</p>
                                <p className="text-xs text-[#8696a0] italic mb-4">"{currentCase.description}"</p>
                                <div className="text-[10px] bg-black/30 p-2 rounded text-amber-400 font-bold uppercase text-center">
                                    Reacciones Clave: {currentCase.required.join(" o ")}
                                </div>
                            </motion.div>
                        )}

                        {phase === 'COUNTDOWN' && (
                            <motion.div 
                                key={countdown}
                                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1.5 }} exit={{ opacity: 0, scale: 2 }}
                                className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
                            >
                                <span className="text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]">{countdown > 0 ? countdown : '¡FUNA!'}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bubbles Render */}
                    {phase === 'PLAYING' && bubblesRef.current.map(b => !b.hit && (
                        <div 
                            key={b.id} 
                            className={`absolute text-white p-2 rounded-xl rounded-tl-sm shadow-md text-xs border-l-4 pr-6 max-w-[80%] ${
                                b.isTroll ? 'bg-red-950/80 animate-[pulse_0.5s_ease-in-out_infinite] border-red-500' : 'bg-[#202c33]'
                            }`}
                            style={{ top: `${b.y}%`, left: `${b.x}%`, borderLeftColor: b.isTroll ? 'red' : (BUTTONS.find(btn => btn.id === b.type)?.color.replace('bg-', '') || 'white') }}
                        >
                            <span className={`font-bold block mb-0.5 opacity-60 text-[9px] uppercase ${b.isTroll ? 'text-red-300' : 'text-[#e9edef]'}`}>{b.type}</span>
                            {b.text}
                        </div>
                    ))}

                    {/* Floating Hit Texts */}
                    <AnimatePresence>
                        {hitTexts.map(ht => (
                            <motion.div
                                key={ht.id}
                                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                animate={{ opacity: 0, y: -40, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className={`absolute font-black text-xl z-50 pointer-events-none drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] ${ht.color}`}
                                style={{ top: `${ht.y}%`, left: `${ht.x}%` }}
                            >
                                {ht.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Phone Bottom Actions (Buttons) */}
                <div className="bg-[#202c33] p-3 flex gap-2 justify-center border-t border-white/5 z-20 shrink-0">
                    {BUTTONS.map(btn => (
                        <motion.button
                            key={btn.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReactionClick(btn.id)}
                            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-lg border-b-4 bg-slate-800 ${btn.border} ${btn.hoverColor}`}
                        >
                            {btn.icon}
                            <span className="text-[10px] font-bold mt-0.5 pointer-events-none opacity-80">{btn.key}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Result Overlay inside Phone */}
                <AnimatePresence>
                    {phase === 'RESULT' && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className={`absolute inset-0 ${feedback.includes('FUNA') ? 'bg-red-950/90' : 'bg-black/80'} backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-6 text-center`}
                        >
                            {feedback.includes('FUNA') && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mb-4">
                                    <Skull size={60} className="text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,1)] animate-pulse" />
                                </motion.div>
                            )}
                            <h2 className={`text-3xl font-black italic uppercase mb-2 ${feedback.includes('PENCA') || feedback.includes('FUNA') ? 'text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]' : 'text-amber-400'}`}>
                                {feedback}
                            </h2>
                            <p className="text-sm text-gray-300 mb-6">Filtros correctos: {score} / {totalBubblesSpawned.current}</p>
                            
                            {!showInspector ? (
                                <button onClick={handleStolenPhone} className="bg-blue-600 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-blue-500 hover:scale-105 transition shadow-xl border-2 border-blue-400">
                                    Terminar Sesión <span className="ml-2">→</span>
                                </button>
                            ) : (
                                <div className="bg-red-900/40 border-2 border-red-500 p-6 rounded-2xl animate-pulse">
                                    <h3 className="text-red-400 font-black mb-4 uppercase">¡Llega Inspectoría General!</h3>
                                    {!inspectorPunishment ? (
                                        <div className="text-4xl animate-spin">🎲</div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-5xl">{inspectorPunishment.icon}</span>
                                            <span className="font-bold text-white uppercase mt-2">{inspectorPunishment.text}</span>
                                            <span className="text-xs text-red-300">{inspectorPunishment.desc}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {showInspector && inspectorPunishment && (
                                <button onClick={handleStolenPhone} className="mt-6 bg-red-600 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-red-500 hover:scale-105 transition shadow-xl border-2 border-red-400">
                                    Aceptar Castigo
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Stolen Animation Overlay */}
            <AnimatePresence>
                {phase === 'STOLEN' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-red-900/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white"
                    >
                        <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
                            <PhoneOff size={100} className="text-black drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]" />
                        </motion.div>
                        <h1 className="text-4xl font-black italic mt-6 uppercase drop-shadow-xl text-center">¡CELULAR<br/>DECOMISADO!</h1>
                        <p className="text-red-300 mt-2 font-bold uppercase tracking-widest">¡PREPÁRATE PARA PELEAR!</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COMBAT LOG (Left Side) */}
            <div className="absolute left-6 bottom-20 w-64 pointer-events-none flex flex-col justify-end pb-4 z-20">
                <AnimatePresence>
                    {coexistenceLog.map((log, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-black/60 p-2 my-1 rounded-r-lg text-xs backdrop-blur-md border-l-4 border-blue-500 shadow-lg text-white">
                            {log}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <CutIn player={showCutIn} onComplete={() => setShowCutIn(null)} />
            <InspectorEvent isActive={showInspectorCutIn} onComplete={handleInspectorComplete} />
        </div>
    );
}
