import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft } from 'lucide-react';
import { peerService } from '../services/peerService';
import { ROLES, BOSSES } from '../data/gameData';
import RoleAssignment from '../components/RoleAssignment';
import ShopModal from '../components/ShopModal';
import RpgCombat from '../components/RpgCombat';
import CoexistenceTable from '../components/CoexistenceTable';
import WhatsAppMinigame from '../components/WhatsAppMinigame';

export default function GameBoard() {
    const navigate = useNavigate();
    const { user, gameMode, network, assignRoles } = useGameStore();

    // GAME PHASES: 'SETUP' -> 'COEXISTENCE' <-> 'RPG_COMBAT'
    const [phase, setPhase] = useState('SETUP');
    const [roundCounter, setRoundCounter] = useState(0);
    const [activeBoss, setActiveBoss] = useState(null);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [showRoles, setShowRoles] = useState(false);

    // ================= GAMPLAY STATE =================
    // Only Host (or Solo) manages the "truth". Clients just render.
    // For now, simplifying to SOLO/HOST logic primarily.

    // 1. SETUP PHASE
    useEffect(() => {
        if (phase === 'SETUP') {
            // Assign roles if not already done or just show them
            if (gameMode === 'SOLO' || (gameMode === 'ONLINE' && network.isHost)) {
                assignRoles(ROLES);
            }
            setShowRoles(true);
        }
    }, [phase, gameMode]);

    const handleRoleStart = () => {
        setShowRoles(false);
        setPhase('COEXISTENCE');
    };

    // 2. FLOW CONTROL
    const handleCoexistenceComplete = () => {
        const nextRound = roundCounter + 1;
        setRoundCounter(nextRound);

        if (nextRound % 2 === 0) {
            // Trigger WhatsApp Climax Minigame
            setPhase('WHATSAPP');
        } else {
            // Stay in Coexistence (New Round)
            // Force re-mount with key change
            setPhase('COEXISTENCE'); 
        }
    };

    const handleWhatsappComplete = () => {
        const boss = BOSSES[Math.floor(Math.random() * BOSSES.length)];
        setActiveBoss(boss);
        setPhase('RPG_COMBAT');
    };

    const handleCombatVictory = () => {
        useGameStore.getState().addPoints(500);
        setPhase('COEXISTENCE');
        setActiveBoss(null);
    };

    const handleCombatDefeat = () => {
        // Simple Go Back for now
        navigate('/menu');
    };

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
            {/* HEADER */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-50 pointer-events-none">
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
                    <span className="font-bold text-sofofa-lightBlue">Ronda {roundCounter + 1}</span>
                    <span className="text-xs opacity-70">
                        | Fase: {phase === 'COEXISTENCE' ? 'Mesa de Diálogo' : phase === 'WHATSAPP' ? 'Ataque por WhatsApp' : 'Combate RPG'}
                    </span>
                </div>

                <button
                    onClick={() => setIsShopOpen(true)}
                    className="pointer-events-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-lg flex items-center gap-2"
                >
                    🛍️ Tienda
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="w-full h-screen">
                {phase === 'COEXISTENCE' && (
                    <CoexistenceTable key={roundCounter} onComplete={handleCoexistenceComplete} />
                )}

                {phase === 'WHATSAPP' && (
                    <WhatsAppMinigame key={`wa-${roundCounter}`} onComplete={handleWhatsappComplete} />
                )}

                {phase === 'RPG_COMBAT' && activeBoss && (
                    <div className="fixed inset-0 z-40 bg-slate-900">
                        <RpgCombat
                            boss={activeBoss}
                            onVictory={handleCombatVictory}
                            onDefeat={handleCombatDefeat}
                            openShop={() => setIsShopOpen(true)}
                        />
                    </div>
                )}
            </div>

            {/* MODALS */}
            <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />

            {showRoles && (
                <RoleAssignment
                    players={useGameStore.getState().network.players}
                    onStart={handleRoleStart}
                />
            )}
        </div>
    );
}
