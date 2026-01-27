import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_USER_STATE = {
    points: 0,
    inventory: [],
    equippedItems: {},
    settings: {
        volume: 50,
        music: true,
        language: 'es',
        highContrast: false,
    }
};

export const useGameStore = create(
    persist(
        (set, get) => ({
            // Global State
            users: {}, // { "email": { password, name, avatar, points, ... } }
            user: null, // Current session user
            isAuthenticated: false,
            rememberedEmails: [], // List of emails that have successfully logged in
            authError: null,

            // Game Mode & Network
            gameMode: 'SOLO', // 'SOLO' | 'ONLINE'
            network: {
                isHost: false,
                roomId: null,
                peers: [], // Connected player IDs
                connectionStatus: 'DISCONNECTED', // 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'
                players: [], // List of { id, name, avatar, role, roleId, hp, maxHp, energy, maxEnergy, isDefending }
                boss: null, // Current boss stats { name, hp, maxHp }
                superCharge: 0, // 0 to 100
                sessionInventory: [], // Potions bought during session
                totalRiceScore: 0,
                totalActions: 0,
            },

            // New Game Session Actions
            assignRoles: (rolesData) => {
                const { gameMode, network, user } = get();

                // Shuffle roles
                const shuffledRoles = [...rolesData].sort(() => Math.random() - 0.5);

                if (gameMode === 'SOLO') {
                    const botNames = ["Javiera", "Lucas", "Matias"];
                    const players = [
                        {
                            id: 0,
                            name: user?.name || "Tú",
                            avatar: user?.avatar,
                            roleId: shuffledRoles[0].id,
                            role: shuffledRoles[0].name,
                            position: 'bottom',
                            hp: shuffledRoles[0].maxHp,
                            maxHp: shuffledRoles[0].maxHp,
                            energy: shuffledRoles[0].maxEnergy,
                            maxEnergy: shuffledRoles[0].maxEnergy,
                            isDefending: false
                        },
                        {
                            id: 1,
                            name: botNames[0],
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botNames[0]}`,
                            roleId: shuffledRoles[1].id,
                            role: shuffledRoles[1].name,
                            position: 'left',
                            hp: shuffledRoles[1].maxHp,
                            maxHp: shuffledRoles[1].maxHp,
                            energy: shuffledRoles[1].maxEnergy,
                            maxEnergy: shuffledRoles[1].maxEnergy,
                            isDefending: false
                        },
                        {
                            id: 2,
                            name: botNames[1],
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botNames[1]}`,
                            roleId: shuffledRoles[2].id,
                            role: shuffledRoles[2].name,
                            position: 'top',
                            hp: shuffledRoles[2].maxHp,
                            maxHp: shuffledRoles[2].maxHp,
                            energy: shuffledRoles[2].maxEnergy,
                            maxEnergy: shuffledRoles[2].maxEnergy,
                            isDefending: false
                        },
                        {
                            id: 3,
                            name: botNames[2],
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botNames[2]}`,
                            roleId: shuffledRoles[3].id,
                            role: shuffledRoles[3].name,
                            position: 'right',
                            hp: shuffledRoles[3].maxHp,
                            maxHp: shuffledRoles[3].maxHp,
                            energy: shuffledRoles[3].maxEnergy,
                            maxEnergy: shuffledRoles[3].maxEnergy,
                            isDefending: false
                        }
                    ];
                    set({ network: { ...network, players, superCharge: 0, sessionInventory: [], totalRiceScore: 0, totalActions: 0 } });
                }
            },

            // Combat Actions
            updatePlayerCombat: (playerId, updates) => set((state) => ({
                network: {
                    ...state.network,
                    players: state.network.players.map(p =>
                        p.id === playerId ? { ...p, ...updates } : p
                    )
                }
            })),

            updateBossCombat: (updates) => set((state) => ({
                network: {
                    ...state.network,
                    boss: state.network.boss ? { ...state.network.boss, ...updates } : updates
                }
            })),

            addToSessionInventory: (item) => set((state) => ({
                network: {
                    ...state.network,
                    sessionInventory: [...state.network.sessionInventory, { ...item, sessionId: Date.now() }]
                }
            })),

            useSessionItem: (sessionId, playerId) => {
                const { network, updatePlayerCombat } = get();
                const item = network.sessionInventory.find(i => i.sessionId === sessionId);
                if (!item) return;

                const player = network.players.find(p => p.id === playerId);
                if (!player) return;

                let updates = {};
                if (item.type === 'hp') updates.hp = Math.min(player.maxHp, player.hp + (player.maxHp * (item.value / 100)));
                if (item.type === 'energy') updates.energy = Math.min(player.maxEnergy, player.energy + (player.maxEnergy * (item.value / 100)));
                if (item.type === 'both') {
                    updates.hp = Math.min(player.maxHp, player.hp + (player.maxHp * (item.value / 100)));
                    updates.energy = Math.min(player.maxEnergy, player.energy + (player.maxEnergy * (item.value / 100)));
                }

                updatePlayerCombat(playerId, updates);
                set((state) => ({
                    network: {
                        ...state.network,
                        sessionInventory: state.network.sessionInventory.filter(i => i.sessionId !== sessionId)
                    }
                }));
            },

            chargeSuper: (amount) => set((state) => ({
                network: {
                    ...state.network,
                    superCharge: Math.min(100, state.network.superCharge + amount)
                }
            })),

            resetSuper: () => set((state) => ({
                network: { ...state.network, superCharge: 0 }
            })),

            registerActionScore: (score) => set((state) => ({
                network: {
                    ...state.network,
                    totalRiceScore: state.network.totalRiceScore + score,
                    totalActions: state.network.totalActions + 1
                }
            })),

            // Auth Actions
            register: (email, password, name) => set((state) => {
                if (state.users[email]) {
                    return { authError: 'El correo ya está registrado' };
                }
                const newUser = {
                    email,
                    password,
                    name,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                    ...INITIAL_USER_STATE
                };
                // Add to remembered emails if not present
                const newRemembered = state.rememberedEmails.includes(email)
                    ? state.rememberedEmails
                    : [...state.rememberedEmails, email];

                return {
                    users: { ...state.users, [email]: newUser },
                    user: newUser,
                    isAuthenticated: true,
                    rememberedEmails: newRemembered,
                    authError: null
                };
            }),

            login: (email, password) => set((state) => {
                const targetUser = state.users[email];
                if (targetUser && targetUser.password === password) {
                    const newRemembered = state.rememberedEmails.includes(email)
                        ? state.rememberedEmails
                        : [...state.rememberedEmails, email];

                    return {
                        user: targetUser,
                        isAuthenticated: true,
                        rememberedEmails: newRemembered,
                        authError: null
                    };
                }
                return { authError: 'Credenciales inválidas' };
            }),

            loginWithGoogle: (email, password) => set((state) => {
                let targetUser = state.users[email];

                if (targetUser) {
                    // Start: Login/Migration Logic
                    if (targetUser.password === password) {
                        const newRemembered = state.rememberedEmails.includes(email)
                            ? state.rememberedEmails
                            : [...state.rememberedEmails, email];

                        return {
                            user: targetUser,
                            isAuthenticated: true,
                            rememberedEmails: newRemembered,
                            authError: null
                        };
                    }
                    else if (targetUser.password === "GOOGLE_AUTH_USER") {
                        console.log("Migrando cuenta de Google legacy...");
                        const updatedUser = { ...targetUser, password: password };
                        return {
                            users: { ...state.users, [email]: updatedUser },
                            user: updatedUser,
                            isAuthenticated: true,
                            rememberedEmails: state.rememberedEmails.includes(email) ? state.rememberedEmails : [...state.rememberedEmails, email],
                            authError: null
                        };
                    }
                    else {
                        return { authError: 'Contraseña incorrecta para esta cuenta de Google' };
                    }
                } else {
                    // Start: Register Logic (Google Flow)
                    const newUser = {
                        email,
                        password,
                        name: email.split('@')[0],
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                        ...INITIAL_USER_STATE
                    };

                    const newRemembered = state.rememberedEmails.includes(email)
                        ? state.rememberedEmails
                        : [...state.rememberedEmails, email];

                    return {
                        users: { ...state.users, [email]: newUser },
                        user: newUser,
                        isAuthenticated: true,
                        rememberedEmails: newRemembered,
                        authError: null
                    };
                }
            }),

            removeRememberedAccount: (email) => set((state) => ({
                rememberedEmails: state.rememberedEmails.filter(e => e !== email)
            })),

            logout: () => set({ user: null, isAuthenticated: false, authError: null }),

            // Sync Helper (Internal use) - Updates both current session and persistent storage
            syncUser: (updatedUserField) => set((state) => {
                if (!state.user) return state;
                const updatedUser = { ...state.user, ...updatedUserField };
                return {
                    user: updatedUser,
                    users: { ...state.users, [state.user.email]: updatedUser }
                };
            }),

            // User Actions (Wrapped to Sync)
            updateProfile: (updates) => get().syncUser(updates),

            addPoints: (amount) => {
                const { user } = get();
                if (user) get().syncUser({ points: (user.points || 0) + amount });
            },

            // Store Actions
            buyItem: (item) => {
                const { user, syncUser } = get();
                if (!user) return;

                if (user.points >= item.price) {
                    // Check ownership
                    if (user.inventory?.some(i => i.id === item.id)) return;

                    syncUser({
                        points: user.points - item.price,
                        inventory: [...(user.inventory || []), item]
                    });
                }
            },

            equipItem: (item) => {
                const { user, syncUser } = get();
                if (!user) return;
                syncUser({
                    equippedItems: { ...(user.equippedItems || {}), [item.type]: item }
                });
            },

            redeemCode: (code) => {
                const { user, syncUser } = get();
                if (!user) return;

                const cleanCode = code.trim().toUpperCase();

                // Code 1: Liceo Shirt
                if (cleanCode === "LICEO BICENTENARIO INDUSTRIAL RAMON BARROS LUCO") {
                    const liceoShirt = {
                        id: 'shirt_liceo_rbl',
                        name: 'Polera Liceo RBL',
                        price: 0,
                        type: 'shirt',
                        icon: '/assets/liceo_badge.png',
                        image: '/assets/liceo_badge.png',
                        description: 'Uniforme oficial con honores.'
                    };
                    if (user.inventory?.some(i => i.id === liceoShirt.id)) return;

                    syncUser({
                        inventory: [...(user.inventory || []), liceoShirt]
                    });
                }

                // Code 2: Money
                if (cleanCode === "3778910") {
                    syncUser({ points: (user.points || 0) + 500000000 });
                }
            },

            // Settings (Global or User specific? Let's keep them User specific for "real" playing)
            updateSettings: (newSettings) => {
                const { user, syncUser } = get();
                // If logged in, save to user. If not (e.g. login screen), maybe just local state?
                // For simplicity, let's assume we update the user's settings if logged in.
                if (user) {
                    const mergedSettings = { ...user.settings, ...newSettings };
                    syncUser({ settings: mergedSettings });
                }
            },
            // Game Mode Actions
            setGameMode: (mode) => set({ gameMode: mode }),

            updateNetwork: (updates) => set((state) => ({
                network: { ...state.network, ...updates }
            })),

            resetNetwork: () => set({
                network: {
                    isHost: false,
                    roomId: null,
                    peers: [],
                    connectionStatus: 'DISCONNECTED'
                }
            }),
        }),
        {
            name: 'qht-storage-v2', // New storage key to avoid conflicts
            partialize: (state) => ({
                users: state.users,
                user: state.user, // Persist current user session to avoid login on refresh? Maybe not secure but convenient
                isAuthenticated: state.isAuthenticated,
                rememberedEmails: state.rememberedEmails,
                // Do NOT persist network state
            }),
        }
    )
);
