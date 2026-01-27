import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Shield, Sword, Sparkles, ShoppingBag, Package } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ROLES } from '../data/gameData';
import InventoryModal from './InventoryModal';
import PrecisionMinigame from './PrecisionMinigame';

export default function RpgCombat({ boss, onVictory, onDefeat, openShop }) {
    const { network, updatePlayerCombat, updateBossCombat, useSessionItem, chargeSuper, resetSuper } = useGameStore();
    const [combatPhase, setCombatPhase] = useState('PLAYERS_TURN'); // PLAYERS_TURN, BOSS_TURN, ANIMATING
    const [combatLog, setCombatLog] = useState([`¡Un ${boss.bossName} salvaje ha aparecido!`]);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [showMinigame, setShowMinigame] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const players = network.players.map(p => {
        const roleData = ROLES.find(r => r.id === p.roleId);
        return {
            ...p,
            roleCards: roleData?.battleCards || []  // Use battleCards for combat
        };
    });
    const currentBoss = network.boss || { ...boss, hp: boss.maxHp };
    const superCharge = network.superCharge;

    useEffect(() => {
        if (!network.boss) {
            updateBossCombat({ ...boss, hp: boss.maxHp });
        }
    }, []);

    const addLog = (msg) => {
        setCombatLog(prev => [msg, ...prev].slice(0, 5));
    };

    const handlePlayerAction = async (playerId, action) => {
        if (combatPhase !== 'PLAYERS_TURN') return;

        const player = players.find(p => p.id === playerId);
        const energyCost = action.cost || 0;

        if (player.energy < energyCost) {
            addLog(`${player.name} no tiene suficiente energía.`);
            return;
        }

        // Handle different card types
        if (action.type === 'attack') {
            // Show precision minigame for attacks
            setPendingAction({ playerId, action });
            setShowMinigame(true);
        } else if (action.type === 'heal') {
            handleHeal(playerId, action);
        } else if (action.type === 'buff') {
            handleBuff(playerId, action);
        } else if (action.type === 'revive') {
            handleRevive(playerId, action);
        } else if (action.type === 'energy') {
            handleEnergyRestore(playerId, action);
        }
    };

    const handleMinigameComplete = async (multiplier, isCritical) => {
        setShowMinigame(false);
        if (!pendingAction) return;

        const { playerId, action } = pendingAction;
        const player = players.find(p => p.id === playerId);

        const { registerActionScore } = useGameStore.getState();
        const riceFactor = action.riceFactor || 1.0;
        registerActionScore(riceFactor);

        let baseDamage = action.damage || 0;
        let damage = Math.floor(baseDamage * riceFactor * multiplier);

        addLog(`${player.name} usó ${action.title}!`);
        if (isCritical) {
            addLog("⚡ ¡GOLPE CRÍTICO! ⚡");
        } else if (multiplier >= 1.5) {
            addLog("✨ ¡Ataque perfecto!");
        }
        if (riceFactor >= 0.9) addLog("✨ ¡Excelente aplicación del RICE!");

        // Update Boss HP
        const newBossHp = Math.max(0, currentBoss.hp - damage);
        updateBossCombat({ hp: newBossHp });

        // Update Player Energy
        updatePlayerCombat(playerId, { energy: player.energy - action.cost, isDefending: false });

        // Charge Super Power
        chargeSuper(Math.floor(damage / 5));

        setPendingAction(null);

        if (newBossHp <= 0) {
            addLog(`¡El ${boss.bossName} ha sido derrotado!`);
            setTimeout(onVictory, 2000);
            return;
        }

        // Advance turn
        if (playerId === 0) {
            setCombatPhase('ANIMATING');
            await new Promise(r => setTimeout(r, 800));
            await handleBotsTurns();
            setCombatPhase('BOSS_TURN');
            setTimeout(handleBossTurn, 2000);
        }
    };

    const handleHeal = async (playerId, action) => {
        const player = players.find(p => p.id === playerId);
        const healAmount = action.healAmount || 0.3;

        if (action.target === 'all') {
            players.forEach(p => {
                if (p.hp > 0) {
                    const healValue = Math.floor(p.maxHp * healAmount);
                    updatePlayerCombat(p.id, { hp: Math.min(p.maxHp, p.hp + healValue) });
                }
            });
            addLog(`${player.name} curó a todo el equipo!`);
        } else {
            // For single target, heal the player with lowest HP
            const target = players.filter(p => p.hp > 0).sort((a, b) => a.hp - b.hp)[0];
            if (target) {
                const healValue = Math.floor(target.maxHp * healAmount);
                updatePlayerCombat(target.id, { hp: Math.min(target.maxHp, target.hp + healValue) });
                addLog(`${player.name} curó a ${target.name}!`);
            }
        }

        updatePlayerCombat(playerId, { energy: player.energy - action.cost });
        await advanceTurn(playerId);
    };

    const handleBuff = async (playerId, action) => {
        const player = players.find(p => p.id === playerId);
        // Note: Buff system would require store updates to track buffs
        // For now, just log it
        addLog(`${player.name} aumentó ${action.stat === 'attack' ? 'el ataque' : 'la defensa'} del equipo!`);
        updatePlayerCombat(playerId, { energy: player.energy - action.cost });
        await advanceTurn(playerId);
    };

    const handleRevive = async (playerId, action) => {
        const player = players.find(p => p.id === playerId);
        const deadPlayer = players.find(p => p.hp <= 0);

        if (deadPlayer) {
            const reviveHp = Math.floor(deadPlayer.maxHp * 0.5);
            const reviveEnergy = Math.floor(deadPlayer.maxEnergy * 0.5);
            updatePlayerCombat(deadPlayer.id, { hp: reviveHp, energy: reviveEnergy });
            addLog(`${player.name} revivió a ${deadPlayer.name}!`);
        } else {
            addLog(`No hay nadie que revivir.`);
        }

        updatePlayerCombat(playerId, { energy: player.energy - action.cost });
        await advanceTurn(playerId);
    };

    const handleEnergyRestore = async (playerId, action) => {
        const player = players.find(p => p.id === playerId);
        const energyAmount = action.energyAmount || 0.3;

        if (action.target === 'all') {
            players.forEach(p => {
                if (p.hp > 0) {
                    const energyValue = Math.floor(p.maxEnergy * energyAmount);
                    updatePlayerCombat(p.id, { energy: Math.min(p.maxEnergy, p.energy + energyValue) });
                }
            });
            addLog(`${player.name} restauró energía a todo el equipo!`);
        } else {
            const target = players.filter(p => p.hp > 0).sort((a, b) => a.energy - b.energy)[0];
            if (target) {
                const energyValue = Math.floor(target.maxEnergy * energyAmount);
                updatePlayerCombat(target.id, { energy: Math.min(target.maxEnergy, target.energy + energyValue) });
                addLog(`${player.name} restauró energía a ${target.name}!`);
            }
        }

        updatePlayerCombat(playerId, { energy: player.energy - action.cost });
        await advanceTurn(playerId);
    };

    const advanceTurn = async (playerId) => {
        if (playerId === 0) {
            setCombatPhase('ANIMATING');
            await new Promise(r => setTimeout(r, 800));
            await handleBotsTurns();
            setCombatPhase('BOSS_TURN');
            setTimeout(handleBossTurn, 2000);
        }
    };

    const handleDefend = async () => {
        if (combatPhase !== 'PLAYERS_TURN' || players[0].hp <= 0) return;

        const player = players[0];
        updatePlayerCombat(0, {
            isDefending: true,
            energy: Math.min(player.maxEnergy, player.energy + 20)
        });
        addLog(`${player.name} se defiende y recupera energía!`);

        // Advance turn like a card action
        setCombatPhase('ANIMATING');
        await new Promise(r => setTimeout(r, 800));
        await handleBotsTurns();
        setCombatPhase('BOSS_TURN');
        setTimeout(handleBossTurn, 2000);
    };

    const handleBotsTurns = async () => {
        const { registerActionScore } = useGameStore.getState();
        for (let i = 1; i < 4; i++) {
            const bot = players[i];
            if (bot.hp <= 0) continue;

            const cards = bot.roleCards || [];
            const playableCards = cards.filter(c => c.cost <= bot.energy);

            if (playableCards.length > 0) {
                const action = playableCards[Math.floor(Math.random() * playableCards.length)];
                const riceFactor = action.riceFactor || 1.0;
                const damage = Math.floor(action.damage * riceFactor);

                const newBossHp = Math.max(0, currentBoss.hp - damage);
                updateBossCombat({ hp: newBossHp });
                updatePlayerCombat(bot.id, { energy: bot.energy - action.cost, isDefending: false });
                registerActionScore(riceFactor);
                addLog(`${bot.name} usó ${action.title}!`);
            } else {
                updatePlayerCombat(bot.id, { isDefending: true, energy: Math.min(bot.maxEnergy, bot.energy + 20) });
                addLog(`${bot.name} se está defendiendo.`);
            }
            await new Promise(r => setTimeout(r, 600));
        }
    };

    const handleBossTurn = () => {
        const skill = boss.skills[Math.floor(Math.random() * boss.skills.length)];
        addLog(`¡${boss.bossName} usa ${skill.name}!`);

        players.forEach(p => {
            if (p.hp <= 0) return;
            const finalDamage = p.isDefending ? Math.floor(skill.damage * (Math.random() * 0.4)) : skill.damage;
            updatePlayerCombat(p.id, { hp: Math.max(0, p.hp - finalDamage), isDefending: false });
        });

        if (players.every(p => p.hp <= 0)) {
            onDefeat();
        } else {
            setCombatPhase('PLAYERS_TURN');
        }
    };

    const handleSuperPower = () => {
        if (superCharge < 100) return;

        const avgRice = network.totalActions > 0
            ? (network.totalRiceScore / network.totalActions)
            : 1.0;

        addLog("¡TODOS JUNTOS: SUPER PODER DE LA AMISTAD!");

        // Damage depends on average RICE compliance
        const baseSuperDamage = 250;
        const totalDamage = Math.floor(baseSuperDamage * avgRice);

        addLog(`✨ Eficacia de Convivencia: ${Math.floor(avgRice * 100)}%`);
        addLog(`💥 El villano recibe ${totalDamage} de daño!`);

        updateBossCombat({ hp: Math.max(0, currentBoss.hp - totalDamage) });
        resetSuper();

        if (currentBoss.hp - totalDamage <= 0) {
            setTimeout(onVictory, 2000);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden font-sans relative">
            {/* BACKGROUND ANIMATION */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-black -z-10" />

            {/* TOP BAR: BOSS INFO (CLEANER) */}
            <div className="p-6 flex justify-center items-center relative gap-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />

                <div className="text-center">
                    <h2 className="text-3xl font-black uppercase italic tracking-[0.2em] text-red-100 drop-shadow-lg">{boss.bossName}</h2>
                    <div className="mt-2 flex items-center justify-center gap-4">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Amenaza Nivel Grave</span>
                        <div className="w-96 h-3 bg-gray-900/80 rounded-full overflow-hidden border border-white/10 shadow-inner">
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: `${(currentBoss.hp / boss.maxHp) * 100}%` }}
                                className="h-full bg-gradient-to-r from-red-700 via-red-500 to-orange-400 relative"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                            </motion.div>
                        </div>
                        <span className="text-xs font-mono font-bold text-red-100">{currentBoss.hp} <span className="text-[10px] text-red-500/50">HP</span></span>
                    </div>
                </div>
            </div>

            {/* MAIN COMBAT AREA */}
            <div className="flex-1 flex min-h-0 relative px-4">

                {/* FLOATING COMBAT LOG */}
                <div className="w-64 flex flex-col pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[60%]">
                        <div className="p-2 bg-white/5 border-b border-white/5 flex items-center gap-2">
                            <Sparkles size={12} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Canal RICE</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 flex flex-col-reverse gap-2 pointer-events-auto">
                            <AnimatePresence>
                                {combatLog.map((log, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={`log-${i}`}
                                        className={`p-2 rounded-lg text-[10px] leading-relaxed ${log.includes('usó') ? 'bg-blue-500/10 text-blue-100 border-l-2 border-blue-500' :
                                            log.includes('daño') ? 'bg-red-500/10 text-red-100 border-l-2 border-red-500' :
                                                log.includes('RICE') ? 'bg-amber-500/10 text-amber-100 border-l-2 border-amber-500 font-bold' :
                                                    'text-gray-400'
                                            }`}
                                    >
                                        {log}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* CENTERED VILLAIN */}
                <div className="flex-1 flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={boss.id}
                            className="relative max-w-sm w-full aspect-square flex items-center justify-center translate-y-[-20px]"
                        >
                            <div className="absolute inset-0 bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
                            <motion.img
                                src={boss.image}
                                alt={boss.bossName}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://api.dicebear.com/7.x/icons/svg?seed=enemy";
                                }}
                                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_50px_rgba(255,0,0,0.3)]"
                                animate={{
                                    y: [0, -10, 0],
                                    scale: combatPhase === 'BOSS_TURN' ? 1.05 : 1,
                                    filter: combatPhase === 'BOSS_TURN' ? 'drop-shadow(0 0 60px rgba(255,0,0,0.6))' : 'drop-shadow(0 0 40px rgba(255,0,0,0.3))'
                                }}
                                transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
                            />

                            {/* TURN INDICATOR */}
                            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2">
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="px-6 py-1 bg-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                                >
                                    <span className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest whitespace-nowrap">
                                        {combatPhase === 'PLAYERS_TURN' ? "Tu Turno de Acción" : "El Enemigo Ataca"}
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* EMPY RIGHT SPACE FOR BALANCE */}
                <div className="w-64" />
            </div>

            {/* THE NEW DASHBOARD: FULL WIDTH AT BOTTOM */}
            <div className="bg-black/80 border-t border-white/10 backdrop-blur-2xl p-6 flex gap-6 items-center min-h-[16rem] relative z-50">

                {/* 1. TEAM STATUS (LEFT) */}
                <div className="w-72 flex flex-col gap-3 pr-6 border-r border-white/10">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            Estado del Equipo
                        </span>
                    </div>
                    {players.map((p) => {
                        const isMe = p.id === 0;
                        return (
                            <div key={p.id} className={`flex items-center gap-3 p-2 rounded-2xl border ${isMe ? 'bg-white/10 border-amber-400/30' : 'bg-white/5 border-white/5 opacity-80'}`}>
                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 relative">
                                    <img src={p.avatar} className="w-full h-full object-cover" />
                                    {p.isDefending && <div className="absolute inset-0 bg-blue-500/40 flex items-center justify-center"><Shield size={16} className="text-white" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[11px] font-bold truncate ${isMe ? 'text-amber-400' : 'text-white'}`}>{p.name}</span>
                                        <span className="text-[9px] font-mono opacity-50">{p.hp} HP</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                            <motion.div animate={{ width: `${(p.hp / p.maxHp) * 100}%` }} className="h-full bg-gradient-to-r from-green-600 to-green-400" />
                                        </div>
                                        <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                                            <motion.div animate={{ width: `${(p.energy / p.maxEnergy) * 100}%` }} className="h-full bg-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. UTILITY BUTTONS (SHIELD & SHOP) */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleDefend}
                        disabled={combatPhase !== 'PLAYERS_TURN' || players[0].hp <= 0}
                        className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-xl group ${combatPhase === 'PLAYERS_TURN'
                            ? 'bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-blue-600/20'
                            : 'bg-gray-800 opacity-40 grayscale'
                            }`}
                        title="Defender: Reduce daño y recupera energía"
                    >
                        <Shield className="text-white group-hover:animate-bounce" size={24} />
                        <span className="text-[8px] font-black uppercase">Protección</span>
                    </button>

                    <button
                        onClick={() => setIsInventoryOpen(true)}
                        className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex flex-col items-center justify-center gap-1 transition-all shadow-xl shadow-purple-600/20 hover:bg-purple-500 hover:scale-105 active:scale-95 group relative"
                        title="Inventario: Usa tus pociones"
                    >
                        <Package className="group-hover:rotate-12 transition-transform" size={24} />
                        <span className="text-[8px] font-black uppercase">Inventario</span>
                        {network.sessionInventory.length > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-950">
                                {network.sessionInventory.length}
                            </div>
                        )}
                    </button>

                    <button
                        onClick={openShop}
                        className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-900 flex flex-col items-center justify-center gap-1 transition-all shadow-xl shadow-amber-400/20 hover:bg-amber-500 hover:scale-105 active:scale-95 group"
                    >
                        <ShoppingBag className="group-hover:rotate-12 transition-transform" size={24} />
                        <span className="text-[8px] font-black uppercase">Tienda</span>
                    </button>
                </div>

                {/* 3. CARD HAND (CENTER) */}
                <div className="flex-1 flex gap-4 items-center justify-center overflow-x-auto py-4 px-2 no-scrollbar">
                    {players[0].roleCards?.map((card, idx) => (
                        <motion.div
                            key={`rpg-card-${idx}`}
                            whileHover={{ y: -30, scale: 1.05, zIndex: 100 }}
                            onClick={() => handlePlayerAction(0, card)}
                            className={`w-36 h-52 bg-white rounded-2xl border-2 shadow-2xl p-4 flex flex-col cursor-pointer transition-all shrink-0 relative overflow-hidden group ${combatPhase === 'PLAYERS_TURN' && players[0].energy >= card.cost
                                ? 'border-amber-400 ring-4 ring-amber-400/10'
                                : 'opacity-40 grayscale pointer-events-none border-gray-200'
                                }`}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
                            <div className="text-[11px] font-black text-slate-900 uppercase leading-tight mb-2 border-b pb-2">
                                {card.title}
                            </div>
                            <div className="flex-1 text-[9px] text-gray-500 leading-relaxed italic overflow-hidden">
                                {card.desc}
                            </div>

                            {/* RICE INDICATOR STICKER */}
                            {card.riceFactor >= 0.8 && (
                                <div className="absolute top-2 right-2 flex gap-0.5">
                                    {[...Array(Math.floor(card.riceFactor * 3))].map((_, i) => (
                                        <Sparkles key={i} size={8} className="text-amber-500" />
                                    ))}
                                </div>
                            )}

                            <div className="mt-auto pt-2 border-t flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-gray-400 uppercase">Energía</span>
                                    <span className="text-sm font-black text-yellow-600 flex items-center gap-1">
                                        <Zap size={12} fill="currentColor" /> {card.cost}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-black text-gray-400 uppercase">Impacto</span>
                                    <span className="text-sm font-black text-red-600 flex items-center gap-1">
                                        <Sword size={12} /> {Math.floor(card.damage * (card.riceFactor || 1))}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 4. SUPER POWER CIRCLE (RIGHT) */}
                <div className="pl-6 border-l border-white/10 flex flex-col items-center gap-3">
                    <div className="relative w-28 h-28">
                        {/* THE CIRCULAR SVG LOADER */}
                        <svg className="w-full h-full rotate-[-90deg]">
                            <circle
                                cx="56"
                                cy="56"
                                r="50"
                                className="fill-none stroke-gray-900"
                                strokeWidth="8"
                            />
                            <motion.circle
                                cx="56"
                                cy="56"
                                r="50"
                                className="fill-none stroke-amber-400"
                                strokeWidth="8"
                                strokeDasharray="314.159"
                                initial={{ strokeDashoffset: 314.159 }}
                                animate={{ strokeDashoffset: 314.159 - (314.159 * (superCharge / 100)) }}
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* INNER BUTTON */}
                        <button
                            onClick={handleSuperPower}
                            disabled={superCharge < 100 || combatPhase !== 'PLAYERS_TURN'}
                            className={`absolute inset-4 rounded-full flex flex-col items-center justify-center border-4 transition-all overflow-hidden group ${superCharge >= 100
                                ? 'bg-amber-400 border-white text-slate-950 hover:scale-110 active:scale-90 animate-pulse'
                                : 'bg-slate-900 border-white/5 text-slate-700'
                                }`}
                        >
                            <Sparkles size={24} className={superCharge >= 100 ? "animate-spin" : ""} />
                            <span className="text-[10px] font-black uppercase italic">¡Super!</span>

                            {/* GLOW EFFECT WHEN READY */}
                            {superCharge >= 100 && (
                                <motion.div
                                    animate={{ opacity: [0, 0.5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="absolute inset-0 bg-white"
                                />
                            )}
                        </button>
                    </div>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Amistad {superCharge}%</span>
                </div>
            </div>

            {/* CSS ANIMATIONS */}
            <style>{`
                @keyframes slide {
                    from { background-position: 0 0; }
                    to { background-position: 40px 0; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* INVENTORY MODAL */}
            <InventoryModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
                inventory={network.sessionInventory}
                onUseItem={(sessionId) => {
                    useSessionItem(sessionId, 0);
                    setIsInventoryOpen(false);
                }}
            />

            {/* PRECISION MINIGAME */}
            <PrecisionMinigame
                isOpen={showMinigame}
                onComplete={handleMinigameComplete}
            />
        </div>
    );
}
