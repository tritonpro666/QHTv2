import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { COEXISTENCE_CASES, ARGUMENT_CARDS } from '../data/coexistenceDecks';
import { Trophy, AlertCircle, Heart, Shield, Plus, Star, Sparkles, Skull } from 'lucide-react';
import { SHOP_ITEMS } from '../data/gameData';
import CutIn from './CutIn';

const TYPE_ICONS = {
    'RESPECT': <Shield size={24} className="text-blue-500" />,
    'INCLUSION': <Plus size={24} className="text-emerald-500" />,
    'COMMITMENT': <Star size={24} className="text-amber-500" />,
    'EMPATHY': <Heart size={24} className="text-pink-500" />
};

const BG_COLORS = {
    'RESPECT': 'bg-blue-50 border-blue-200',
    'INCLUSION': 'bg-emerald-50 border-emerald-200',
    'COMMITMENT': 'bg-amber-50 border-amber-200',
    'EMPATHY': 'bg-pink-50 border-pink-200'
};

export default function CoexistenceTable({ onComplete }) {
    const { updatePlayerCombat, network, addXp, addToSessionInventory, updateRumor, increaseBond } = useGameStore();
    const [currentCase, setCurrentCase] = useState(null);
    const [playerHand, setPlayerHand] = useState([]);
    const [tableCards, setTableCards] = useState([]);
    
    // Phases: 'DEAL' -> 'QHT_REACTION' -> 'PLAY' -> 'EVALUATE' -> 'RESULT'
    const [phase, setPhase] = useState('DEAL');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [coexistenceLog, setCoexistenceLog] = useState([]);
    const [showCutIn, setShowCutIn] = useState(null);

    const addLog = (msg) => setCoexistenceLog(prev => [msg, ...prev].slice(0, 5));

    const players = network.players.length > 0 ? network.players : [
        { id: 0, name: "Tú", avatar: "hero", position: 'bottom', role: "Alumno Motivado" },
        { id: 1, name: "Javiera", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Javi", position: 'left', role: "La Graciosa" },
        { id: 2, name: "Lucas", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas", position: 'top', role: "El Deportista" },
        { id: 3, name: "Matias", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mati", position: 'right', role: "El Gamer" },
    ];

    useEffect(() => {
        const randomCase = COEXISTENCE_CASES[Math.floor(Math.random() * COEXISTENCE_CASES.length)];
        setCurrentCase(randomCase);

        const hand = [];
        for (let i = 0; i < 3; i++) {
            hand.push(ARGUMENT_CARDS[Math.floor(Math.random() * ARGUMENT_CARDS.length)]);
        }
        setPlayerHand(hand);
        setTableCards([]);
        setScore(0);

        setTimeout(() => setPhase('QHT_REACTION'), 1500);
    }, []);

    useEffect(() => {
        if (network.rumorLevel >= 100 && phase === 'PLAY') {
            setPhase('RESULT');
            setFeedback("¡FUNA TOTAL!");
            addLog("🔴 ¡FUNA TOTAL MÁXIMA! Rumor fuera de control.");
            addLog("❌ -50% HP a TODOS y Rumor vuelve a 0.");
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: Math.max(1, p.hp - (p.maxHp*0.5)) }));
            updateRumor(-100);
        }
    }, [network.rumorLevel, phase]);

    const handleInitialReaction = (option) => {
        if (phase !== 'QHT_REACTION') return;
        const impact = option.impact || 0;
        setScore(prev => prev + impact);
        addLog(impact >= 0 ? `✨ Decisión inicial positiva (+${impact} pts)` : `⚠️ Alguien dijo algo polémico (${impact} pts)`);
        
        if (impact < 0) {
            updateRumor(Math.abs(impact));
        }

        setPhase('PLAY');
    };

    const playCard = (card) => {
        if (phase !== 'PLAY') return;

        const newTable = [{ ...card, ownerId: 0, position: 'bottom' }];
        
        // Bots logic
        const bots = players.filter(p => p.id !== 0);
        let currentDelay = 500;
        
        bots.forEach((b, index) => {
            const botCard = ARGUMENT_CARDS[Math.floor(Math.random() * ARGUMENT_CARDS.length)];
            setTimeout(() => {
                setTableCards(prev => [...prev, { ...botCard, ownerId: b.id, position: b.position }]);
                addLog(`${b.name} jugó una carta.`);
            }, currentDelay);
            currentDelay += 800; // sequential play feel
            newTable.push({ ...botCard, ownerId: b.id, position: b.position });
        });

        setTableCards([{ ...card, ownerId: 0, position: 'bottom' }]);
        setPlayerHand(prev => prev.filter(c => c.id !== card.id));
        setPhase('EVALUATE_WAIT'); // wait for bots
        
        setTimeout(() => {
            evaluateHand(newTable, currentCase);
        }, currentDelay + 1000);
    };

    const evaluateHand = (cards, caseData) => {
        setPhase('EVALUATE');
        let totalScore = score;
        let matches = 0;

        cards.forEach(c => {
            if (caseData.required.includes(c.type)) {
                totalScore += c.power * 2;
                matches++;
            } else {
                totalScore += c.power * 0.5;
            }
        });

        setScore(totalScore);

        if (matches >= 3 && totalScore >= 50) {
            setFeedback("¡AMBIENTE BAKÁN!");
            addLog("✨ ¡Ambiente Bakán! Todos recuperan 100% HP y Energía.");
            addLog("🎁 Equipo recibe: Poción de Resurrección");
            addLog("🌟 +150 XP para todos");
            addLog("📉 El Rumor bajó (-20)");
            addLog("🤝 Vínculo de Equipo +5");
            addXp(150);
            updateRumor(-20);
            network.players.slice(1).forEach(p => increaseBond(0, p.id, 5));
            addToSessionInventory(SHOP_ITEMS.find(i => i.id === 'pot_revive'));
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: p.maxHp, energy: p.maxEnergy }));
            setShowCutIn(players[0]);
        } else if (matches >= 2 && totalScore > 30) {
            setFeedback("AMBIENTE PULENTO");
            addLog("👍 Pulento. Recuperan 50% HP y Energía.");
            addLog("🎁 Equipo recibe: Colación Completa");
            addLog("🌟 +80 XP para todos");
            addLog("📉 El Rumor bajó (-10)");
            addLog("🤝 Vínculo de Equipo +2");
            addXp(80);
            updateRumor(-10);
            network.players.slice(1).forEach(p => increaseBond(0, p.id, 2));
            addToSessionInventory(SHOP_ITEMS.find(i => i.id === 'pot_mix_1'));
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: Math.min(p.maxHp, p.hp + (p.maxHp*0.5)), energy: Math.min(p.maxEnergy, p.energy + (p.maxEnergy*0.5)) }));
        } else if (matches >= 1 || totalScore > 15) {
            setFeedback("AMBIENTE PIOLA");
            addLog("👌 Piola. Recuperan 20% HP.");
            addLog("🎁 Equipo recibe: Leche de Recreo");
            addLog("🌟 +30 XP para todos");
            addXp(30);
            updateRumor(5);
            addToSessionInventory(SHOP_ITEMS.find(i => i.id === 'pot_hp_1'));
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: Math.min(p.maxHp, p.hp + (p.maxHp*0.2)), energy: Math.min(p.maxEnergy, p.energy + (p.maxEnergy*0.2)) }));
        } else {
            setFeedback("AMBIENTE PENCA");
            addLog("💀 Ambiente Penca. Todos se estresan.");
            addLog("❌ -20% HP Máximo a todos");
            addLog("📈 Aumenta el Rumor Escolar MASIVAMENTE (+35)");
            updateRumor(35);
            network.players.forEach(p => updatePlayerCombat(p.id, { hp: Math.max(1, p.hp - (p.maxHp*0.2)) }));
        }

        setTimeout(() => setPhase('RESULT'), 2500);
    };

    // Beautiful Poker Layout coordinates
    const getCardTablePos = (position) => {
        switch (position) {
            case 'bottom': return { x: 0, y: 50, rotate: -5, zIndex: 10 };
            case 'left': return { x: -80, y: 0, rotate: 85, zIndex: 8 };
            case 'top': return { x: 0, y: -50, rotate: 175, zIndex: 5 };
            case 'right': return { x: 80, y: 0, rotate: -85, zIndex: 9 };
            default: return { x: 0, y: 0, rotate: 0 };
        }
    };

    return (
        <div className="flex flex-col h-full w-full items-center justify-center bg-stone-900 relative overflow-hidden font-sans select-none">
            {/* BACKGROUND DECOR: Casino Carpet Style */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] bg-repeat" />

            {/* HEADER info */}
            <div className="absolute top-4 w-full px-8 z-10 flex justify-between items-start pointer-events-none">
                <div className="w-64">
                    <div className="text-[10px] font-black uppercase text-red-400 mb-1 tracking-widest bg-black/50 w-fit px-2 rounded backdrop-blur-md">🔥 Nivel de Rumor</div>
                    <div className="w-full h-3 bg-stone-800 border-2 border-stone-700 rounded-full overflow-hidden shadow-2xl relative">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 to-red-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, network.rumorLevel || 0)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* THE POKER TABLE (Beautiful Green Felt with Wood Edge) */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, type: 'spring' }}
                className="relative w-[500px] h-[500px] rounded-full border-[16px] border-[#5c3a21] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center mt-10"
                style={{
                    background: 'radial-gradient(circle, #0f5132 0%, #06402b 100%)',
                    boxShadow: '0 0 0 8px #3e2723, inset 0 0 50px rgba(0,0,0,0.8)'
                }}
            >
                {/* Felt Texture Overlay */}
                <div className="absolute inset-0 rounded-full opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/green-dust-and-scratches.png')]" />

                 {/* Center Pot Details */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 opacity-30">
                    <div className="w-48 h-48 rounded-full border border-white/20 flex items-center justify-center">
                        <span className="text-4xl font-black text-white uppercase tracking-[0.5em] ml-3">QHT</span>
                    </div>
                </div>

                {/* Players around table */}
                {players.map((p) => {
                    const posClasses = {
                        'bottom': 'bottom-[-60px] left-1/2 -translate-x-1/2',
                        'left': 'left-[-60px] top-1/2 -translate-y-1/2',
                        'top': 'top-[-60px] left-1/2 -translate-x-1/2',
                        'right': 'right-[-60px] top-1/2 -translate-y-1/2'
                    };
                    return (
                        <div key={p.id} className={`absolute ${posClasses[p.position]} flex flex-col items-center gap-1 z-20`}>
                           <div className="relative">
                               <img src={p.avatar} className="w-16 h-16 rounded-full border-4 border-[#cda434] bg-stone-800 shadow-xl object-cover" />
                               <div className="absolute -bottom-2 -right-2 bg-stone-900 border border-[#cda434] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                   HP {p.hp}/{p.maxHp}
                               </div>
                           </div>
                           <span className="text-xs font-black text-white bg-black/80 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-md">
                               {p.name}
                           </span>
                        </div>
                    );
                })}

                {/* PLAYED CARDS ANIMATION */}
                <AnimatePresence>
                    {tableCards.map((c, i) => {
                        const layout = getCardTablePos(c.position);
                        return (
                            <motion.div
                                key={`${c.id}-${i}`}
                                initial={{ opacity: 0, x: layout.x * 2, y: layout.y * 2, scale: 0.5, rotateY: 90 }}
                                animate={{ opacity: 1, x: layout.x, y: layout.y, rotate: layout.rotate, scale: 1, rotateY: 0 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className={`absolute w-24 h-36 ${BG_COLORS[c.type]} rounded-xl border border-gray-300 shadow-[2px_4px_10px_rgba(0,0,0,0.5)] flex flex-col p-2 z-[${layout.zIndex}]`}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="flex justify-between items-start w-full">
                                    <span className="text-[10px] font-bold text-gray-700 uppercase">{c.type.substring(0,3)}</span>
                                    {TYPE_ICONS[c.type]}
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-xs font-black text-slate-800 text-center leading-tight">{c.title}</div>
                                </div>
                                <div className="text-center w-full bg-slate-800 text-white font-black text-[10px] py-1 rounded shadow-inner">+{c.power}</div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Score Flash in Evaluate Phase */}
                <AnimatePresence>
                    {(phase === 'EVALUATE' || phase === 'RESULT') && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="absolute bg-emerald-500 text-white px-6 py-2 text-2xl font-black italic rounded-full shadow-[0_0_40px_rgba(16,185,129,0.8)] z-50 border-2 border-emerald-300 transform -translate-y-8"
                        >
                            POT TOTAL: {score}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* QHT REACTION PHASE OVERLAY */}
            <AnimatePresence>
                {phase === 'QHT_REACTION' && currentCase && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                        className="absolute bottom-10 w-full max-w-2xl bg-stone-800/95 p-6 rounded-3xl border-2 border-[#cda434] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 pointer-events-auto"
                    >
                        <div className="text-[#cda434] font-black mb-1 uppercase tracking-widest text-xs flex items-center gap-2">
                            <AlertCircle size={14}/> Dilema de Convivencia
                        </div>
                        <h2 className="text-2xl font-black text-white italic mb-2">{currentCase.title}</h2>
                        <p className="text-gray-300 text-sm mb-6 border-l-4 border-gray-600 pl-4 py-1 italic">"{currentCase.description}"</p>
                        
                        <div className="text-xs text-gray-400 mb-3 uppercase font-bold tracking-wider text-center">Reacciona a la situación:</div>
                        <div className="flex flex-col gap-2">
                            {currentCase.qhtOptions.map((opt, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => handleInitialReaction(opt)}
                                    className="w-full bg-stone-700/50 hover:bg-stone-600 text-white p-3 rounded-xl text-sm font-bold border border-white/10 flex justify-between items-center transition-colors"
                                >
                                    <span>{opt.text}</span>
                                    <span className="text-[10px] text-gray-500 uppercase">{opt.type}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PLAYER HAND FOR POKER PHASE */}
            <AnimatePresence>
                {phase === 'PLAY' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                        className="absolute bottom-6 w-full flex flex-col items-center z-40"
                    >
                        <div className="text-[#cda434] font-black mb-4 uppercase tracking-widest bg-black/60 px-6 py-2 rounded-full border border-[#cda434] shadow-lg flex items-center gap-2">
                            <Sparkles size={16}/> Tu turno: Juega una carta de argumento
                        </div>
                        
                        <div className="flex gap-4">
                            {playerHand.map((card, i) => (
                                <motion.button
                                    key={card.id}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1, type: 'spring' }}
                                    whileHover={{ y: -20, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => playCard(card)}
                                    className={`w-36 h-52 ${BG_COLORS[card.type]} rounded-2xl border-[3px] p-3 flex flex-col items-center gap-2 shadow-2xl relative overflow-hidden group cursor-pointer`}
                                >
                                    {/* Card Header */}
                                    <div className="w-full flex justify-between items-center z-10">
                                        <span className={`text-[10px] font-black p-1 bg-white/50 rounded uppercase text-slate-800`}>{card.type.substring(0,3)}</span>
                                        {TYPE_ICONS[card.type]}
                                    </div>
                                    
                                    {/* Art / Title Area */}
                                    <div className="flex-1 w-full bg-white/60 rounded-lg flex items-center justify-center p-2 text-center border shadow-inner z-10">
                                        <div className="font-black text-slate-800 leading-tight text-sm">{card.title}</div>
                                    </div>

                                    {/* Description */}
                                    <div className="text-[9px] text-slate-600 text-center italic z-10 leading-tight">{card.desc}</div>
                                    
                                    {/* Power */}
                                    <div className="mt-auto w-full bg-slate-800 text-white font-black text-xs py-1.5 rounded-b-lg shadow-inner z-10 uppercase tracking-widest text-center">
                                        Poder {card.power}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COMBAT LOG */}
            <div className="absolute left-6 bottom-32 w-64 pointer-events-none flex flex-col justify-end pb-4 z-20">
                <AnimatePresence>
                    {coexistenceLog.map((log, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-black/80 p-2 my-1 rounded-r-lg text-xs backdrop-blur-md border-l-4 border-emerald-500 shadow-xl text-white font-medium">
                            {log}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* RESULT MODAL OVERLAY */}
            <AnimatePresence>
                {phase === 'RESULT' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`absolute inset-0 ${feedback.includes('FUNA') ? 'bg-red-950/90' : 'bg-black/80'} backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white p-6`}
                    >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>
                            {feedback.includes('FUNA') ? (
                                <Skull size={100} className="text-red-500 mb-6 drop-shadow-[0_0_50px_rgba(255,0,0,1)] animate-pulse" />
                            ) : (
                                <Trophy size={80} className={feedback.includes('PENCA') ? 'text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'text-amber-400 mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]'} />
                            )}
                        </motion.div>
                        <h2 className={`text-5xl font-black italic uppercase mb-4 ${feedback.includes('PENCA') || feedback.includes('FUNA') ? 'text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]' : 'text-amber-400 drop-shadow-xl'} text-center`}>
                            {feedback}
                        </h2>
                        <div className="bg-stone-800 border-2 border-stone-600 px-8 py-4 rounded-2xl mb-8 flex flex-col items-center shadow-xl">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Puntaje Final del Pot</span>
                            <span className="text-4xl font-black text-emerald-400">{score}</span>
                        </div>
                        
                        <button onClick={onComplete} className="bg-emerald-600 px-10 py-4 rounded-full font-black text-lg uppercase tracking-widest hover:bg-emerald-500 hover:scale-110 transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-300">
                            Regresar a la Mesa <span className="ml-2">→</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <CutIn player={showCutIn} onComplete={() => setShowCutIn(null)} />
        </div>
    );
}
