import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sword, Sparkles, ShoppingBag, Package, Phone, Shield, Lock, Heart } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ROLES, PHONE_CONTACTS } from '../data/gameData';
import InventoryModal from './InventoryModal';
import PrecisionMinigame from './PrecisionMinigame';
import DiceMinigame from './DiceMinigame';
import CutIn from './CutIn';
import MaturityTree from './MaturityTree';

export default function RpgCombat({ boss, onVictory, onDefeat, openShop }) {
    const { network, updatePlayerCombat, updateBossCombat, useSessionItem, chargeSuper, resetSuper } = useGameStore();
    const [combatPhase, setCombatPhase] = useState('PLAYERS_TURN'); // PLAYERS_TURN, BOSS_TURN, ANIMATING
    const [combatLog, setCombatLog] = useState([`¡Un ${boss.bossName} salvaje ha aparecido!`]);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [showMinigame, setShowMinigame] = useState(false);
    const [showDiceGame, setShowDiceGame] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [villainSpeech, setVillainSpeech] = useState(null);
    const [isPhoneOpen, setIsPhoneOpen] = useState(false);
    const [calledContacts, setCalledContacts] = useState([]);
    const [showCutIn, setShowCutIn] = useState(null);
    const [isMaturityOpen, setIsMaturityOpen] = useState(false);

    // Sync Players & Boss
    const players = network.players.map(p => {
        const roleData = ROLES.find(r => r.id === p.roleId);
        return {
            ...p,
            roleCards: roleData?.battleCards || []
        };
    });
    const mainPlayer = players[0];
    const currentBoss = network.boss || { ...boss, hp: boss.maxHp };
    const superCharge = network.superCharge;

    useEffect(() => {
        if (!network.boss) {
            updateBossCombat({ ...boss, hp: boss.maxHp });
        }
    }, [boss]);

    // Villain Speak Helper
    const villainSay = (text, duration = 3000) => {
        setVillainSpeech(text);
        setTimeout(() => setVillainSpeech(null), duration);
    };

    const addLog = (msg) => {
        setCombatLog(prev => [msg, ...prev].slice(0, 5));
    };

    // --- PLAYER ACTIONS ---

    const handlePlayerAction = async (playerId, action) => {
        if (combatPhase !== 'PLAYERS_TURN') return;

        const player = players.find(p => p.id === playerId);

        if (player.energy < (action.cost || 0)) {
            addLog(`${player.name} no tiene suficiente energía.`);
            return;
        }

        if (action.type === 'attack') {
            setPendingAction({ playerId, action });
            setShowMinigame(true);
        } else {
            await executeAction(playerId, action, 1.0, false);
        }
    };

    const handleDefend = async () => {
        if (combatPhase !== 'PLAYERS_TURN') return;

        updatePlayerCombat(0, {
            isDefending: true,
            energy: Math.min(mainPlayer.maxEnergy, mainPlayer.energy + 15)
        });
        addLog(`🛡️ Te cubres y recuperas energía.`);
        await advanceTurn(0);
    };

    const executeAction = async (playerId, action, multiplier = 1.0, isCritical = false) => {
        const player = players.find(p => p.id === playerId);
        const { registerActionScore } = useGameStore.getState();
        const riceFactor = action.riceFactor || 1.0;

        registerActionScore(riceFactor);

        let logMsg = `${player.name} usó ${action.title}!`;

        if (action.type === 'attack') {
            const isMagic = ['water', 'ice', 'electric', 'fire'].includes(action.element);
            const statValue = isMagic ? (player.int || 10) : (player.str || 10);
            let statMultiplier = 1 + ((statValue - 10) * 0.05); // 5% bonus per point above 10
            
            const isCriticalLocal = Math.random() < 0.15;
            if (isCriticalLocal) {
                statMultiplier *= 1.5;
                setShowCutIn(player);
            }

            if (player.unlockedPassives?.includes('bonus_damage')) {
                statMultiplier *= 1.2;
            }

            let baseDamage = action.damage || 0;
            let damage = Math.floor(baseDamage * riceFactor * multiplier * statMultiplier);

            if (currentBoss.weakness === action.element) {
                damage = Math.floor(damage * 1.5);
                logMsg += " ¡ES SUPER EFECTIVO! 🔥";
            } else if (currentBoss.resistance === action.element) {
                damage = Math.floor(damage * 0.5);
                logMsg += " ¡Es poco efectivo! ❄️";
            }

            if (isCriticalLocal) logMsg += " ⚡ ¡GOLPE CRÍTICO! ⚡";

            const newBossHp = Math.max(0, currentBoss.hp - damage);
            updateBossCombat({ hp: newBossHp });

            const chargeAmount = Math.max(5, Math.floor(damage / 3));
            chargeSuper(chargeAmount);

            if (newBossHp <= 0) {
                addLog(`¡${boss.bossName} ha sido derrotado!`);
                setTimeout(onVictory, 2000);
                return;
            }
        } else if (action.type === 'heal') {
            const statMultiplier = 1 + (((player.int || 10) - 10) * 0.08); // 8% bonus per INT point for healing
            handleHeal(playerId, action, statMultiplier);
        } else if (action.type === 'revive') {
            handleRevive(playerId, action);
        } else if (action.type === 'energy') {
            handleEnergyRestore(playerId, action);
        }

        addLog(logMsg);
        updatePlayerCombat(playerId, { energy: player.energy - action.cost, isDefending: false });

        if (pendingAction) setPendingAction(null);
        await advanceTurn(playerId);
    };

    const handleHeal = (playerId, action, statMultiplier = 1) => {
        const healAmount = (action.healAmount || 0.3) * statMultiplier;
        const player = players.find(p => p.id === playerId);
        const hasGroupHeal = player?.unlockedPassives?.includes('group_heal');
        
        players.forEach(p => {
            if (p.hp > 0) {
                let actualHeal = 0;
                if (action.target === 'all' || p.id === playerId) {
                    actualHeal = Math.floor(p.maxHp * healAmount);
                } else if (hasGroupHeal) {
                    actualHeal = Math.floor(p.maxHp * healAmount * 0.3); // 30% splash heal
                }
                
                if (actualHeal > 0) {
                    updatePlayerCombat(p.id, { hp: Math.min(p.maxHp, p.hp + actualHeal) });
                }
            }
        });
        
        const logMsg = `${players.find(p => p.id === playerId)?.name} usó ${action.title} y curó puntos de vida. 💚`;
        addLog(logMsg);
    };

    const handleRevive = (playerId, action) => {
        const dead = players.find(p => p.hp <= 0);
        if (dead) {
            updatePlayerCombat(dead.id, { hp: Math.floor(dead.maxHp * 0.5) });
            addLog(`¡${dead.name} ha revivido!`);
        }
    };

    const handleEnergyRestore = (playerId, action) => {
        const amount = action.energyAmount || 0.3;
        players.forEach(p => {
            if ((action.target === 'all' || p.id === playerId) && p.hp > 0) {
                const val = Math.floor(p.maxEnergy * amount);
                updatePlayerCombat(p.id, { energy: Math.min(p.maxEnergy, p.energy + val) });
            }
        });
    };

    const handlePhoneCall = (contactId) => {
        const contact = PHONE_CONTACTS.find(c => c.id === contactId);

        if (contact.req && !calledContacts.includes(contact.req)) {
            addLog(`❌ Debes llamar a ${PHONE_CONTACTS.find(c => c.id === contact.req).name} primero.`);
            return;
        }

        if (mainPlayer.energy < contact.cost) {
            addLog("No tienes suficiente energía.");
            return;
        }

        addLog(`📞 ${contact.name} responde al llamado...`);
        setIsPhoneOpen(false);
        setCalledContacts(prev => [...prev, contactId]);

        if (contact.effect.type === 'damage') {
            const damage = contact.effect.amount;
            addLog(`¡${contact.name} INTERVIENE! -${damage} HP`);
            const newBossHp = Math.max(0, currentBoss.hp - damage);
            updateBossCombat({ hp: newBossHp });

            if (newBossHp <= 0) {
                setTimeout(onVictory, 2000);
                return;
            }
        } else if (contact.effect.type === 'energy') {
            players.forEach(p => { if (p.hp > 0) updatePlayerCombat(p.id, { energy: Math.min(p.maxEnergy, p.energy + (p.maxEnergy * contact.effect.amount)) }) });
            addLog(`${contact.name} motivó al equipo!`);
        }

        updatePlayerCombat(mainPlayer.id, { energy: mainPlayer.energy - contact.cost });
        advanceTurn(0);
    };

    // --- TURN MANAGER ---

    const advanceTurn = async (playerId) => {
        if (playerId === 0) {
            setCombatPhase('ANIMATING');
            await new Promise(r => setTimeout(r, 600));
            await handleBotsTurns();

            setCombatPhase('BOSS_TURN');
            if (boss.dialogues) {
                villainSay(boss.dialogues[Math.floor(Math.random() * boss.dialogues.length)]);
            }
            setTimeout(handleBossTurn, 2500);
        }
    };

    const allyForCombo = players.slice(1).find(bot => {
        const key1 = `0-${bot.id}`;
        const key2 = `${bot.id}-0`;
        const bondsObj = network.bonds || {};
        const bond = (bondsObj[key1] || 0) + (bondsObj[key2] || 0);
        return bond >= 5 && mainPlayer.energy >= 50 && bot.energy >= 50 && bot.hp > 0;
    });

    const handleCombinedAttack = () => {
        if (!allyForCombo) return;
        
        updatePlayerCombat(0, { energy: mainPlayer.energy - 50 });
        updatePlayerCombat(allyForCombo.id, { energy: allyForCombo.energy - 50 });
        
        setShowCutIn(mainPlayer);
        setTimeout(() => setShowCutIn(allyForCombo), 2000);
        setTimeout(() => {
            const damage = 250 + ((mainPlayer.str || 10) * 5) + ((allyForCombo.str || 10) * 5);
            addLog(`🌟 ¡ATAQUE COMBINADO! ${mainPlayer.name} y ${allyForCombo.name} destrozan a ${boss.bossName} por ${damage} de daño!`);
            const newBossHp = Math.max(0, currentBoss.hp - damage);
            updateBossCombat({ hp: newBossHp });
            
            if (newBossHp <= 0) setTimeout(onVictory, 1500);
            else setTimeout(() => setCombatPhase('BOSS_TURN'), 1500);
        }, 4000);
    };

    const handleBotsTurns = async () => {
        for (let i = 1; i < 4; i++) {
            const bot = players[i];
            if (bot.hp <= 0) continue;

            const action = bot.roleCards.find(c => c.cost <= bot.energy && c.type === 'attack');
            if (action) {
                const dmg = Math.floor(action.damage * (action.riceFactor || 1));
                updateBossCombat({ hp: Math.max(0, currentBoss.hp - dmg) });
                updatePlayerCombat(bot.id, { energy: bot.energy - action.cost });
                addLog(`${bot.name} ataca.`);
                chargeSuper(Math.floor(dmg / 3)); // Bots contribute to Super!
                await new Promise(r => setTimeout(r, 400));
            } else {
                updatePlayerCombat(bot.id, { energy: Math.min(bot.maxEnergy, bot.energy + 15) });
            }
        }
    };

    const handleBossTurn = () => {
        setShowDiceGame(true);
    };

    const handleDiceResult = (mitigation) => {
        setShowDiceGame(false);

        const skill = boss.skills[Math.floor(Math.random() * boss.skills.length)];
        let log = `${boss.bossName} usa ${skill.name}`;

        players.forEach(p => {
            if (p.hp <= 0) return;

            let rawDmg = skill.damage || 10;
            if (network.rumorLevel >= 80) rawDmg = Math.floor(rawDmg * 1.5); // 50% extra damage if rumor is high!

            let finalMit = p.id === 0 ? mitigation : (Math.random() * 0.4);

            if (p.isDefending) finalMit += 0.3;
            if (finalMit > 0.8) finalMit = 0.8;

            if (p.unlockedPassives?.includes('evasion') && Math.random() < 0.15) {
                finalMit = 1.0; // 100% mitigation = evasion
            }

            const taken = Math.floor(rawDmg * (1 - finalMit));

            if (taken === 0 && finalMit === 1.0 && p.unlockedPassives?.includes('evasion')) {
                addLog(`¡${p.name} EVADIÓ el ataque gracias a su Tolerancia! 🛡️`);
            } else {
                updatePlayerCombat(p.id, { hp: Math.max(0, p.hp - taken), isDefending: false });
            }
        });

        addLog(`${log}. daño reducido en ${(mitigation * 100).toFixed(0)}%`);

        if (players.every(p => p.hp <= 0)) {
            onDefeat();
        } else {
            setCombatPhase('PLAYERS_TURN');
        }
    };

    const handleSuperPower = () => {
        if (superCharge < 100) return;
        addLog("¡¡PODER DE LA AMISTAD!!");
        updateBossCombat({ hp: Math.max(0, currentBoss.hp - 350) });
        resetSuper();
        if (currentBoss.hp - 350 <= 0) setTimeout(onVictory, 2000);
    };

    const getElementIcon = (el) => {
        if (el === 'fire') return '🔥';
        if (el === 'water') return '💧';
        if (el === 'earth') return '🌿';
        if (el === 'wind') return '💨';
        if (el === 'electric') return '⚡';
        if (el === 'ice') return '❄️';
        return '⚔️';
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden font-sans relative select-none">
            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10" />

            {/* HEADER */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
                {/* BOSS BAR (Center) */}
                <div className="flex-1 flex flex-col items-center">
                    {/* Boss Name + Weakness Icon */}
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-black uppercase text-red-500 drop-shadow-md tracking-wider">{currentBoss.bossName}</h2>
                        {boss.weakness && (
                            <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center border border-red-500/50 shadow-lg animate-pulse" title={`Débil a ${boss.weakness}`}>
                                <span className="text-xl">{getElementIcon(boss.weakness)}</span>
                            </div>
                        )}
                    </div>

                    {/* HP Bar */}
                    <div className="w-96 max-w-full h-8 bg-gray-900 rounded-full border-2 border-slate-700 relative overflow-hidden shadow-2xl">
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: `${(currentBoss.hp / boss.maxHp) * 100}%` }}
                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-500"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white shadow-black drop-shadow-md tracking-widest">
                            {currentBoss.hp} / {boss.maxHp} HP
                        </span>
                    </div>

                    {/* WEAKNESS/RESISTANCE LABELS */}
                    <div className="flex gap-4 mt-2 bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5 shadow-xl">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                            <span className="text-gray-400 uppercase text-[10px]">Débil:</span>
                            <span className="text-green-400 uppercase flex items-center gap-1 bg-green-900/30 px-1.5 py-0.5 rounded">{getElementIcon(boss.weakness)} {boss.weakness}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10"></div>
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                            <span className="text-gray-400 uppercase text-[10px]">Resiste:</span>
                            <span className="text-red-400 uppercase flex items-center gap-1 bg-red-900/30 px-1.5 py-0.5 rounded">{getElementIcon(boss.resistance)} {boss.resistance}</span>
                        </div>
                    </div>
                    {/* RUMOR METER CAUTION */}
                    {network.rumorLevel >= 80 && (
                        <div className="mt-2 bg-red-900/80 animate-pulse border border-red-500 rounded px-3 py-1 text-xs font-black uppercase shadow-lg">
                            ⚠️ Escuela en caos: ¡Jefe Potenciado!
                        </div>
                    )}
                </div>

                {/* TEAMMATES (Top Right) */}
                <div className="flex flex-col gap-2 bg-black/40 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-right">Equipo</div>
                    {players.slice(1).map(bot => (
                        <div key={bot.id} className="flex items-center gap-2 justify-end">
                            <div className="flex flex-col items-end w-24">
                                <span className="text-xs font-bold truncate">{bot.name}</span>
                                {/* Mini HP Bar */}
                                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-0.5">
                                    <div className="h-full bg-green-500" style={{ width: `${(bot.hp / bot.maxHp) * 100}%` }} />
                                </div>
                                {/* Mini Energy Bar */}
                                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400" style={{ width: `${(bot.energy / bot.maxEnergy) * 100}%` }} />
                                </div>
                            </div>
                            <img src={bot.avatar} className="w-8 h-8 rounded-full border border-white/30 bg-slate-800" />
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN STAGE */}
            <div className="flex-1 flex items-center justify-center relative z-0">
                {/* COMBAT LOG */}
                <div className="absolute left-6 top-20 bottom-32 w-64 pointer-events-none flex flex-col justify-end pb-4 z-20">
                    <AnimatePresence>
                        {combatLog.map((log, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-black/60 p-2 my-1 rounded-r-lg text-xs backdrop-blur-md border-l-4 border-blue-500 shadow-lg">
                                {log}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* VILLAIN */}
                <div className="relative w-80 h-80 flex items-center justify-center">
                    <AnimatePresence>
                        {villainSpeech && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute -top-20 right-0 bg-white text-black p-4 rounded-3xl rounded-bl-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 font-black text-sm max-w-[200px] border-4 border-slate-900">
                                "{villainSpeech}"
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.img
                        src={boss.image}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + boss.id }}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_50px_rgba(220,38,38,0.4)]"
                        animate={{
                            scale: combatPhase === 'BOSS_TURN' ? 1.05 : 1,
                            y: [0, -10, 0]
                        }}
                        transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                    />
                </div>
            </div>

            {/* BOTTOM HUD */}
            <div className="h-auto min-h-[220px] bg-slate-900/95 border-t border-white/10 p-4 grid grid-cols-[200px_1fr_100px] gap-4 items-end relative z-20 backdrop-blur-lg">

                {/* 1. PLAYER STATS (Left) */}
                <div className="flex flex-col gap-2 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-1">
                        <img src={mainPlayer.avatar} className="w-14 h-14 rounded-full border-2 border-blue-400 bg-slate-900 shadow-lg" />
                        <div>
                            <div className="font-black text-sm text-blue-200 flex gap-2 items-center">
                                {mainPlayer.name} <span className="bg-amber-500 text-black px-1.5 rounded text-[10px]">Nv.{mainPlayer.level || 1}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mb-1">{mainPlayer.role}</div>
                            <div className="flex gap-2 text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded w-fit text-white/80">
                                <span>⚔️STR: <span className="text-red-400">{mainPlayer.str || 10}</span></span>
                                <span>🔮INT: <span className="text-blue-400">{mainPlayer.int || 10}</span></span>
                            </div>
                        </div>
                    </div>
                    {/* HP */}
                    <div className="relative w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                        <div className="absolute top-0 bottom-0 left-0 bg-green-500" style={{ width: `${(mainPlayer.hp / mainPlayer.maxHp) * 100}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold z-10">{mainPlayer.hp}/{mainPlayer.maxHp}</div>
                    </div>
                    {/* Energy */}
                    <div className="relative w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                        <div className="absolute top-0 bottom-0 left-0 bg-yellow-400" style={{ width: `${(mainPlayer.energy / mainPlayer.maxEnergy) * 100}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold z-10 text-black">{mainPlayer.energy}/{mainPlayer.maxEnergy}</div>
                    </div>
                </div>

                {/* 2. CARDS & BUTTONS (Center) */}
                <div className="flex items-end justify-center gap-4 w-full overflow-x-auto pb-2">
                    {/* Cards */}
                    {mainPlayer.roleCards.map((card, i) => (
                        <motion.button
                            key={i}
                            onClick={() => handlePlayerAction(0, card)}
                            disabled={mainPlayer.energy < card.cost}
                            whileHover={{ y: -20, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-36 h-52 shrink-0 bg-slate-800 rounded-xl border-2 p-2 flex flex-col gap-1 shadow-xl transition-all
                                ${mainPlayer.energy < card.cost ? 'opacity-50 grayscale border-slate-700' : 'border-blue-500 hover:border-white hover:shadow-blue-500/30'}
                            `}
                        >
                            <div className="h-24 bg-slate-900 rounded-lg mb-1 relative overflow-hidden flex items-center justify-center">
                                <span className="text-4xl opacity-50">{getElementIcon(card.element)}</span>
                                <span className="absolute top-1 right-1 text-[9px] font-black uppercase bg-black/50 px-1 rounded">{card.type}</span>
                            </div>
                            <div className="font-bold text-xs text-center leading-tight">{card.title}</div>
                            <div className="flex-1 text-[9px] text-gray-400 text-center leading-tight line-clamp-2 px-1">{card.desc}</div>
                            <div className="flex justify-between items-center bg-black/20 rounded p-1">
                                <span className="text-yellow-400 text-xs font-bold flex items-center gap-0.5"><Zap size={10} />{card.cost}</span>
                                {card.damage && <span className="text-red-400 text-xs font-bold flex items-center gap-0.5"><Sword size={10} />{Math.floor(card.damage * (card.riceFactor || 1))}</span>}
                            </div>
                        </motion.button>
                    ))}

                    {/* Action Buttons Column */}
                    <div className="flex flex-col gap-2">
                        {/* Shield */}
                        <button onClick={handleDefend} className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center hover:scale-105 transition shadow-lg border-b-4 border-blue-800 text-white relative group" title="Defender">
                            <Shield size={24} />
                            <span className="absolute -top-8 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Defender (+15 EN)</span>
                        </button>
                        {/* Phone */}
                        <button onClick={() => setIsPhoneOpen(!isPhoneOpen)} className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center hover:scale-105 transition shadow-lg border-b-4 border-emerald-700 text-white relative group">
                            <Phone size={24} />
                            {isPhoneOpen && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />}
                        </button>
                        {/* Combo Attack */}
                        {allyForCombo && (
                            <button onClick={handleCombinedAttack} className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center hover:scale-105 transition shadow-[0_0_15px_#fbbf24] border-b-4 border-orange-600 text-black relative group animate-pulse" title={`Ataque Combinado con ${allyForCombo.name}`}>
                                <Sparkles size={24} />
                                <span className="absolute -top-8 right-0 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap text-amber-400 font-bold border border-amber-500">Combo (-50 EN los 2)</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. ITEMS, SHOP & SUPER (Right) - Stacked Vertical */}
                <div className="flex flex-col items-center gap-3 self-end mb-2">
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setIsInventoryOpen(true)} className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center hover:scale-105 transition shadow-lg border-b-4 border-purple-800 text-white active:border-b-0 active:translate-y-1" title="Inventario">
                            <Package size={24} />
                        </button>
                        <button onClick={() => setIsMaturityOpen(true)} className="w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center hover:scale-105 transition shadow-lg border-b-4 border-amber-800 text-white active:border-b-0 active:translate-y-1 relative" title="Desarrollo Personal">
                            <Sparkles size={24} />
                            {mainPlayer.maturityPoints > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white font-bold">{mainPlayer.maturityPoints}</span>}
                        </button>
                        <button onClick={openShop} className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center hover:scale-105 transition shadow-lg border-b-4 border-amber-700 text-slate-900 active:border-b-0 active:translate-y-1" title="Tienda">
                            <ShoppingBag size={24} />
                        </button>
                    </div>

                    {/* Super Power */}
                    <div className="relative group w-full flex justify-center mt-2">
                        <button
                            onClick={handleSuperPower}
                            disabled={superCharge < 100}
                            className={`w-24 h-24 rounded-full border-[6px] flex items-center justify-center transition-all relative overflow-hidden shadow-2xl
                                ${superCharge >= 100 ? 'border-amber-400 shadow-[0_0_50px_#fbbf24] animate-pulse cursor-pointer bg-slate-900' : 'border-slate-800 opacity-80 cursor-not-allowed bg-slate-900'}
                            `}
                        >
                            {/* Liquid Fill Effect */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 transition-all duration-700 ease-out" style={{ height: `${superCharge}%` }} />

                            <div className="relative z-10 p-2 bg-black/20 rounded-full backdrop-blur-[2px]">
                                <Sparkles size={32} className={`drop-shadow-lg ${superCharge >= 100 ? 'text-white animate-spin-slow' : 'text-gray-600'}`} />
                            </div>
                        </button>
                        <div className="absolute -bottom-4 left-0 right-0 text-center">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-lg ${superCharge >= 100 ? 'bg-amber-500 text-black border-white animate-bounce' : 'bg-slate-900 text-gray-500 border-gray-700'}`}>
                                {Math.floor(superCharge)}% PODER
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} inventory={network.sessionInventory} onUseItem={(id) => { useSessionItem(id, 0); setIsInventoryOpen(false); }} />
            <PrecisionMinigame isOpen={showMinigame} onComplete={(m, c) => { setShowMinigame(false); if (pendingAction) executeAction(pendingAction.playerId, pendingAction.action, m, c); }} />
            <CutIn player={showCutIn} onComplete={() => setShowCutIn(null)} />
            <MaturityTree isOpen={isMaturityOpen} onClose={() => setIsMaturityOpen(false)} />

            {/* FORCE REMOUNT DICE GAME FOR RESET */}
            {showDiceGame && (
                <DiceMinigame
                    key={`dice-game-${Date.now()}`}
                    isOpen={true}
                    onComplete={handleDiceResult}
                />
            )}

            {/* PHONE MENU POPUP */}
            <AnimatePresence>
                {isPhoneOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsPhoneOpen(false)} />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-24 right-32 bg-slate-900 border border-slate-600 text-white p-4 rounded-2xl shadow-2xl z-50 w-72">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-400"><Phone size={20} /> Contactos</h3>
                                <button onClick={() => setIsPhoneOpen(false)} className="text-gray-500 hover:text-white">✕</button>
                            </div>
                            <div className="space-y-2">
                                {PHONE_CONTACTS.map(c => {
                                    const isLocked = c.req && !calledContacts.includes(c.req);
                                    const canAfford = mainPlayer.energy >= c.cost;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => handlePhoneCall(c.id)}
                                            disabled={isLocked || !canAfford}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition text-left border
                                        ${isLocked ? 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed' :
                                                    !canAfford ? 'bg-slate-800 border-red-900/30 opacity-70 cursor-not-allowed' :
                                                        'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-emerald-500 cursor-pointer'}
                                    `}
                                        >
                                            <div className="text-xl w-8 text-center">{c.icon === 'grad' ? '🎓' : c.icon === 'school' ? '🏫' : '❤️'}</div>
                                            <div className="flex-1">
                                                <div className="font-bold text-xs flex justify-between">
                                                    {c.name}
                                                    <span className={canAfford ? 'text-emerald-400' : 'text-red-400'}>{c.cost} EN</span>
                                                </div>
                                                <div className="text-[9px] text-gray-400 leading-tight">{c.desc}</div>
                                            </div>
                                            {isLocked && <Lock size={12} className="text-gray-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
