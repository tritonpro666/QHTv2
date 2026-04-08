import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const getInitialUserState = () => ({
    points: 0,
    inventory: [],
    equippedItems: {},
    settings: {
        volume: 50,
        music: true,
        language: 'es',
        highContrast: false,
    },
    // Social State
    description: "",
    specialty: "",
    friends: [], // array of emails
    friendRequests: [], // array of emails
    blockedUsers: [] // array of emails
});

export const useGameStore = create(
    persist(
        (set, get) => ({
            // Global State
            // Global State
            users: {}, // Cache of other users { "email": { name, avatar, ... } }
            user: null, // Current session user
            isAuthenticated: false,
            isLoading: false,
            rememberedEmails: [], 
            authError: null,
            chats: {}, 

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
                rumorLevel: 0, // Global tension meter (0-100)
                bonds: {} // Tracks relationships e.g {"0-1": 5}
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
                            level: 1, xp: 0, maturityPoints: 0, unlockedPassives: [], str: shuffledRoles[0].str || 10, int: shuffledRoles[0].int || 10,
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
                            level: 1, xp: 0, maturityPoints: 0, unlockedPassives: [], str: shuffledRoles[1].str || 10, int: shuffledRoles[1].int || 10,
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
                            level: 1, xp: 0, maturityPoints: 0, unlockedPassives: [], str: shuffledRoles[2].str || 10, int: shuffledRoles[2].int || 10,
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
                            level: 1, xp: 0, maturityPoints: 0, unlockedPassives: [], str: shuffledRoles[3].str || 10, int: shuffledRoles[3].int || 10,
                            isDefending: false
                        }
                    ];
                    set({ network: { ...network, players, superCharge: 0, sessionInventory: [], totalRiceScore: 0, totalActions: 0 } });
                }
            },

            // Combat Actions
            updateRumor: (amount) => set((state) => ({
                network: {
                    ...state.network,
                    rumorLevel: Math.max(0, Math.min(100, (state.network.rumorLevel || 0) + amount))
                }
            })),

            addXp: (amount) => set((state) => {
                const newPlayers = state.network.players.map(p => {
                    let newXp = (p.xp || 0) + amount;
                    let newLevel = p.level || 1;
                    let newMaxHp = p.maxHp;
                    let newMaxEnergy = p.maxEnergy;
                    let newStr = p.str || 10;
                    let newInt = p.int || 10;
                    let newMaturityP = p.maturityPoints || 0;
                    let didLevelUp = false;

                    while (newXp >= newLevel * 100) {
                        newXp -= newLevel * 100;
                        newLevel++;
                        newMaxHp += 20;
                        newMaxEnergy += 10;
                        newStr += 2;
                        newInt += 2;
                        newMaturityP += 1; // Gain 1 point per level
                        didLevelUp = true;
                    }
                    return { ...p, xp: newXp, level: newLevel, maxHp: newMaxHp, hp: didLevelUp ? newMaxHp : p.hp, maxEnergy: newMaxEnergy, energy: didLevelUp ? newMaxEnergy : p.energy, str: newStr, int: newInt, maturityPoints: newMaturityP };
                });
                return { network: { ...state.network, players: newPlayers } };
            }),

            increaseBond: (idA, idB, amount) => set((state) => {
                const key = [idA, idB].sort().join('-');
                const currentBond = state.network.bonds[key] || 0;
                return {
                    network: {
                        ...state.network,
                        bonds: { ...state.network.bonds, [key]: currentBond + amount }
                    }
                };
            }),

            unlockPassive: (playerId, passiveId, cost) => set((state) => {
                const newPlayers = state.network.players.map(p => {
                    if (p.id === playerId && p.maturityPoints >= cost && !p.unlockedPassives.includes(passiveId)) {
                        return { ...p, maturityPoints: p.maturityPoints - cost, unlockedPassives: [...p.unlockedPassives, passiveId] };
                    }
                    return p;
                });
                return { network: { ...state.network, players: newPlayers } };
            }),

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

             // Helper to map Supabase snake_case to Frontend camelCase
            mapProfile: (p) => {
                if (!p) return null;
                return {
                    ...p,
                    friends: p.friends || [],
                    friendRequests: p.friend_requests || [],
                    blockedUsers: p.blocked_users || [],
                    equippedItems: p.equipped_items || {},
                    lastReadChats: p.last_read_chats || {},
                    specialty: p.specialty || ""
                };
            },

            // Auth Actions (Supabase)
            register: async (rawEmail, password, name) => {
                set({ isLoading: true, authError: null });
                const email = rawEmail.toLowerCase().trim();
                
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name }
                    }
                });

                if (error) {
                    set({ authError: error.message, isLoading: false });
                    return;
                }

                // El profile se crea automáticamente vía Trigger SQL
                // Pero lo recuperamos para estar seguros
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                set({ 
                    user: get().mapProfile(profile), 
                    isAuthenticated: true, 
                    isLoading: false,
                    rememberedEmails: [...new Set([...get().rememberedEmails, email])]
                });
            },

            login: async (rawEmail, password) => {
                set({ isLoading: true, authError: null });
                const email = rawEmail.toLowerCase().trim();
                
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    set({ authError: "Credenciales inválidas o error de conexión", isLoading: false });
                    return;
                }

                // Cargar perfil
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                set({ 
                    user: get().mapProfile(profile), 
                    isAuthenticated: true, 
                    isLoading: false,
                    rememberedEmails: [...new Set([...get().rememberedEmails, email])]
                });
            },

            loginWithGoogle: async (email) => {
                // Supabase handles Google via auth.signInWithOAuth
                // Para este flujo simple, asumimos que el usuario ya inició sesión con Google 
                // y solo estamos vinculando el perfil.
                set({ isLoading: true });
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', email)
                    .single();
                
                if (profile) {
                    set({ user: profile, isAuthenticated: true, isLoading: false });
                }
            },

            rehydrateProfile: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    
                    if (profile) {
                        set({ user: get().mapProfile(profile), isAuthenticated: true });
                    }
                }
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({ user: null, isAuthenticated: false, authError: null });
            },

            // Sync Helper (Internal use) - Updates both current session and PERSISTENT Supabase storage
            syncUser: async (updatedUserField) => {
                const { user } = get();
                if (!user) return;
                
                const { data, error } = await supabase
                    .from('profiles')
                    .update(updatedUserField)
                    .eq('id', user.id)
                    .select()
                    .single();

                if (!error && data) {
                    set({ user: get().mapProfile(data) });
                }
            },

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
            // Social State Helpers
            getChatIdForDirectMessage: (email1, email2) => {
                return [email1, email2].sort().join('_');
            },

            fetchProfiles: async (emails) => {
                if (!emails || emails.length === 0) return;
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('email', emails);
                
                if (!error && data) {
                    const newUsers = {};
                    data.forEach(p => { 
                        newUsers[p.email] = get().mapProfile(p); 
                    });
                    set((state) => ({
                        users: { ...state.users, ...newUsers }
                    }));
                }
            },
            
            searchUsers: async (query) => {
                const { user } = get();
                if (!query || query.trim() === "" || !user) return [];
                const lowQuery = `%${query.toLowerCase().trim()}%`;
                
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .neq('id', user.id) // No buscarse a si mismo
                    .or(`name.ilike.${lowQuery},email.ilike.${lowQuery}`)
                    .limit(10);

                if (error) return [];
                
                // Filtrar bloqueados y mapear
                return data
                    .filter(u => !(user.blocked_users?.includes(u.email)))
                    .map(p => get().mapProfile(p));
            },

            sendFriendRequest: async (targetEmail) => {
                const { user } = get();
                if (!user || user.email === targetEmail) return;
                
                const { error } = await supabase.rpc('rpc_send_friend_request', {
                    target_email: targetEmail,
                    requester_email: user.email
                });

                if (error) {
                    console.error("Error sending friend request:", error);
                } else {
                    // Forzar actualización local inmediata
                    get().rehydrateProfile();
                }
            },

            acceptFriendRequest: async (requesterEmail) => {
                const { user } = get();
                if (!user) return;

                const { error } = await supabase.rpc('rpc_accept_friend_request', {
                    user_a_email: user.email,
                    user_b_email: requesterEmail
                });

                if (error) {
                    console.error("Error accepting friend request:", error);
                } else {
                    // Forzar actualización local inmediata
                    get().rehydrateProfile();
                }
            },

            declineFriendRequest: async (requesterEmail) => {
                const { user, syncUser } = get();
                if (!user) return;
                const newRequests = (user.friend_requests || []).filter(email => email !== requesterEmail);
                await syncUser({ friend_requests: newRequests });
            },

            removeFriend: async (targetEmail) => {
                const { user } = get();
                if (!user) return;
                
                const { error } = await supabase.rpc('rpc_remove_friend', {
                    user_a_email: user.email,
                    user_b_email: targetEmail
                });

                if (error) {
                    console.error("Error removing friend:", error);
                } else {
                    // Forzar actualización local inmediata
                    get().rehydrateProfile();
                }
            },

            blockUser: async (targetEmail) => {
                const { user, syncUser } = get();
                if (!user) return;
                const newFriends = (user.friends || []).filter(email => email !== targetEmail);
                const newBlocked = [...new Set([...(user.blocked_users || []), targetEmail])];
                await syncUser({ friends: newFriends, blocked_users: newBlocked });
            },

            unblockUser: async (targetEmail) => {
                 const { user, syncUser } = get();
                 if (!user) return;
                 const newBlocked = (user.blocked_users || []).filter(email => email !== targetEmail);
                 await syncUser({ blocked_users: newBlocked });
            },

            // Chat Actions (Supabase Realtime)
            sendMessage: async (chatId, text) => {
                const { user } = get();
                if (!user || !text.trim()) return;

                const { error } = await supabase
                    .from('messages')
                    .insert({
                        chat_id: chatId,
                        sender_email: user.email,
                        text: text.trim()
                    });
                
                if (error) console.error("Error sending message:", error);
            },

            subscribeToProfileUpdates: () => {
                const { user } = get();
                if (!user) return null;

                const channel = supabase
                    .channel(`profile:${user.id}`)
                    .on(
                        'postgres_changes',
                        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                        (payload) => {
                            const updatedProfile = get().mapProfile(payload.new);
                            set({ user: updatedProfile });
                        }
                    )
                    .subscribe();

                return () => supabase.removeChannel(channel);
            },

            subscribeToChat: (chatId) => {
                const { user, chats } = get();
                if (!user) return;

                // Cargar mensajes iniciales si no existen
                if (!chats[chatId]) {
                    supabase
                        .from('messages')
                        .select('*')
                        .eq('chat_id', chatId)
                        .order('timestamp', { ascending: true })
                        .then(({ data, error }) => {
                            if (!error && data) {
                                set((state) => ({
                                    chats: {
                                        ...state.chats,
                                        [chatId]: {
                                            ...state.chats[chatId],
                                            messages: data
                                        }
                                    }
                                }));
                            }
                        });
                }

                // Suscribirse a nuevos mensajes
                const channel = supabase
                    .channel(`chat:${chatId}`)
                    .on('postgres_changes', 
                        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                        (payload) => {
                            set((state) => {
                                const currentMessages = state.chats[chatId]?.messages || [];
                                // Evitar duplicados (por si el insert ya se reflejó localmente)
                                if (currentMessages.some(m => m.id === payload.new.id)) return state;
                                
                                return {
                                    chats: {
                                        ...state.chats,
                                        [chatId]: {
                                            ...state.chats[chatId],
                                            messages: [...currentMessages, payload.new]
                                        }
                                    }
                                };
                            });
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            },
            
            markChatAsRead: async (chatId) => {
                const { user, syncUser } = get();
                if (!user) return;
                
                const lastRead = {
                    ...(user.last_read_chats || {}),
                    [chatId]: Date.now()
                };
                
                await syncUser({ last_read_chats: lastRead });
            },

            createGroupChat: (name, memberEmails) => set((state) => {
                if (!state.user) return state;
                
                const allParticipants = [...new Set([...memberEmails, state.user.email])];
                const chatId = `group_${Date.now()}`;
                
                const welcomeMessage = {
                    senderEmail: state.user.email,
                    text: `Ha creado el grupo "${name}"`,
                    timestamp: Date.now(),
                    isSystemMessage: true
                };

                return {
                    chats: {
                        ...state.chats,
                        [chatId]: {
                            type: "group",
                            name: name,
                            participants: allParticipants,
                            messages: [welcomeMessage]
                        }
                    }
                };
            }),
            
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
                chats: state.chats,
                // Do NOT persist network state
            }),
        }
    )
);
