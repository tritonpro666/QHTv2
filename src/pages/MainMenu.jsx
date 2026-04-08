import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ShoppingBag, Settings, BookOpen, LogOut, Coins, Bot, Gift, Search, Bell, MessageCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/translations';
import Mascot from '../components/Mascot';
import TutorialModal from '../components/TutorialModal';
import SettingsModal from '../components/SettingsModal';
import StoreModal from '../components/StoreModal';
import ProfileModal from '../components/ProfileModal';
import UserProfileModal from '../components/UserProfileModal';
import UserNotificationsModal from '../components/UserNotificationsModal';
import SocialChatModal from '../components/SocialChatModal';
import FriendsListModal from '../components/FriendsListModal';
import SofoChatModal from '../components/SofoChatModal';
import DailyRewardModal from '../components/DailyRewardModal';
import GameModeModal from '../components/GameModeModal';
import OnlineLobbyModal from '../components/OnlineLobbyModal';

export default function MainMenu() {
    const navigate = useNavigate();
    const { 
        user, logout, setGameMode, searchUsers, chats, 
        getChatIdForDirectMessage, subscribeToProfileUpdates, fetchProfiles 
    } = useGameStore();
    const { t } = useTranslation();

    const [showTutorial, setShowTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showStore, setShowStore] = useState(false);
    const [showOwnProfile, setShowOwnProfile] = useState(false);
    const [showSofoChat, setShowSofoChat] = useState(false);
    const [showDaily, setShowDaily] = useState(false);

    // Social State
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const searchRef = useRef(null);
    
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef(null);

    const [showSocialChat, setShowSocialChat] = useState(false);
    const [initialChatId, setInitialChatId] = useState(null);
    const [showFriendsList, setShowFriendsList] = useState(false);
    
    // User Profile Action
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);

    // New Modals
    const [showGameMode, setShowGameMode] = useState(false);
    const [showOnlineLobby, setShowOnlineLobby] = useState(false);

    // Redirect if not authenticated (simple check)
    React.useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const handleModeSelect = (mode) => {
        setGameMode(mode);
        setShowGameMode(false);
        if (mode === 'SOLO') {
            navigate('/game');
        } else {
            setShowOnlineLobby(true);
        }
    };

    // Real-time Profile Subscription
    useEffect(() => {
        const unsubscribe = subscribeToProfileUpdates();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribeToProfileUpdates]);

    // Fetch friend and requester profiles
    useEffect(() => {
        const emailsToFetch = [
            ...(user?.friends || []),
            ...(user?.friendRequests || [])
        ];
        if (emailsToFetch.length > 0) {
            fetchProfiles(emailsToFetch);
        }
    }, [user?.friends, user?.friendRequests, fetchProfiles]);

    // Search Effects
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.trim().length > 0) {
                const results = await searchUsers(searchQuery);
                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        };
        performSearch();
    }, [searchQuery, searchUsers]);

    // Click outside handler for search and notifications
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchExpanded(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUserClick = (targetUser) => {
        setSelectedUser(targetUser);
        setShowUserProfile(true);
        setIsSearchExpanded(false);
        setSearchQuery("");
    };

    const handleOpenChat = (friendEmail) => {
        const chatId = getChatIdForDirectMessage(user?.email, friendEmail);
        setInitialChatId(chatId);
        setShowSocialChat(true);
    };

    const handleOpenProfile = (friend) => {
        setSelectedUser(friend);
        setShowUserProfile(true);
    };

    // Calculate total unread messages
    const totalUnreadMessages = Object.values(chats || {}).reduce((count, chat) => {
        if (!chat || !chat.messages || !Array.isArray(chat.messages) || chat.messages.length === 0) return count;
        
        // Find the chat ID (could be group or DM)
        const chatId = Object.keys(chats).find(id => chats[id] === chat);
        if (!chatId) return count;

        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg && lastMsg.sender_email !== user?.email) {
            const lastReadTimestamp = (user?.lastReadChats || {})[chatId] || 0;
            if (new Date(lastMsg.timestamp).getTime() > lastReadTimestamp) {
                return count + 1;
            }
        }
        return count;
    }, 0);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">

            {/* Header / Top Bar */}
            <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-8 relative z-30">
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* User Profile Hook */}
                    <div
                        className="flex items-center gap-2 sm:gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => setShowOwnProfile(true)}
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-sofofa-blue relative shrink-0">
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            {/* Show equipped shirt if any */}
                            {user.equippedItems?.shirt && (
                                <img src={user.equippedItems.shirt.icon} className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 rounded-full border bg-white" alt="shirt" />
                            )}
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-lg text-sofofa-dark">{user.name}</h1>
                            <div className="flex items-center gap-1 text-sofofa-accent font-bold text-sm">
                                <Coins size={16} /> <span>{user.points} pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Expandable Search */}
                    <div className="relative" ref={searchRef}>
                        <motion.div
                            animate={{ width: isSearchExpanded ? (window.innerWidth < 640 ? 150 : 250) : 40 }}
                            className={`flex items-center bg-gray-100 rounded-full h-10 overflow-hidden ${isSearchExpanded ? 'px-2 border border-blue-200 shadow-sm' : 'justify-center cursor-pointer hover:bg-gray-200'}`}
                            onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
                        >
                            <Search size={18} className={`shrink-0 ${isSearchExpanded ? 'text-gray-400 mr-2' : 'text-gray-600'}`} />
                            {isSearchExpanded && (
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Buscar amigo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm w-full"
                                />
                            )}
                        </motion.div>
                        
                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {isSearchExpanded && searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-12 left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                >
                                    <ul>
                                        {searchResults.map((resUser) => (
                                            <li key={resUser.email}>
                                                <button 
                                                    onClick={() => handleUserClick(resUser)}
                                                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50/50 text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                        <img src={resUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-gray-800 truncate">{resUser.name}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Daily Reward Button (Small) */}
                    <button
                        onClick={() => setShowDaily(true)}
                        className="hidden md:flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                    >
                        <Gift size={20} className="animate-bounce" />
                        <span>{t('daily.title')}</span>
                    </button>
                    {/* Mobile Daily Reward Button */}
                    <button
                        onClick={() => setShowDaily(true)}
                        className="md:hidden flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-10 h-10 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                    >
                        <Gift size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Friends List Button */}
                    <button
                        onClick={() => setShowFriendsList(true)}
                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                        title="Ver Amigos"
                    >
                        <Users size={22} />
                    </button>

                    {/* Social Chat Button */}
                    <button
                        onClick={() => { setInitialChatId(null); setShowSocialChat(true); }}
                        className="relative p-2 hover:bg-blue-50 text-gray-400 hover:text-sofofa-blue rounded-full transition-colors"
                        title="Chat"
                    >
                        <MessageCircle size={22} />
                        {totalUnreadMessages > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {/* Notifications Button */}
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                        >
                            <Bell size={22} />
                            {(user?.friendRequests?.length > 0) && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        <UserNotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors ml-2"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Grid */}
            <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* PLAY Button (Large) */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-sofofa-blue to-sofofa-lightBlue rounded-3xl p-8 text-white relative overflow-hidden shadow-lg cursor-pointer group"
                    onClick={() => setShowGameMode(true)}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Play size={200} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-end">
                        <h2 className="text-4xl font-extrabold mb-2">{t('menu.play')}</h2>
                        <p className="opacity-90">{t('menu.playDesc')}</p>
                        <button className="mt-6 bg-white text-sofofa-blue w-max px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">
                            {t('menu.start')}
                        </button>
                    </div>
                </motion.div>

                {/* Store */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowStore(true)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-sofofa-accent transition-colors"
                >
                    <div className="bg-orange-100 p-4 rounded-full text-orange-600">
                        <ShoppingBag size={32} />
                    </div>
                    <h3 className="font-bold text-gray-700">{t('menu.store')}</h3>
                </motion.div>

                {/* Tutorial */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowTutorial(true)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-sofofa-blue transition-colors"
                >
                    <div className="bg-blue-100 p-4 rounded-full text-sofofa-blue">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="font-bold text-gray-700">{t('menu.tutorial')}</h3>
                </motion.div>

                {/* Sofo Chat Button */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowSofoChat(true)}
                    className="col-span-1 md:col-span-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl p-6 text-white shadow-md cursor-pointer flex items-center justify-between relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot size={24} />
                            </div>
                            <span className="font-bold uppercase text-xs tracking-wider bg-black/10 px-2 py-1 rounded">IA Ayuda</span>
                        </div>
                        <h3 className="text-2xl font-bold">¡Habla con Sofo!</h3>
                        <p className="text-sm opacity-90 max-w-[80%]">¿Dudas sobre especialidades o necesitas ayuda? Estoy aqui.</p>
                    </div>
                    <Bot size={96} className="absolute -bottom-4 -right-4 opacity-20 rotate-[-10deg]" />
                </motion.div>

                {/* Settings */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowSettings(true)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-gray-400 transition-colors"
                >
                    <div className="bg-gray-100 p-4 rounded-full text-gray-600">
                        <Settings size={32} />
                    </div>
                    <h3 className="font-bold text-gray-700">{t('menu.settings')}</h3>
                </motion.div>

            </main>

            <Mascot />

            {/* Modals */}
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <StoreModal isOpen={showStore} onClose={() => setShowStore(false)} />
            <ProfileModal isOpen={showOwnProfile} onClose={() => setShowOwnProfile(false)} />
            <UserProfileModal isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} targetUser={selectedUser} />
            <FriendsListModal 
                isOpen={showFriendsList} 
                onClose={() => setShowFriendsList(false)} 
                onOpenChat={handleOpenChat}
                onOpenProfile={handleOpenProfile}
            />
            <SocialChatModal isOpen={showSocialChat} onClose={() => setShowSocialChat(false)} initialChatId={initialChatId} />
            <SofoChatModal isOpen={showSofoChat} onClose={() => setShowSofoChat(false)} />
            <DailyRewardModal isOpen={showDaily} onClose={() => setShowDaily(false)} />

            <GameModeModal
                isOpen={showGameMode}
                onClose={() => setShowGameMode(false)}
                onSelect={handleModeSelect}
            />
            <OnlineLobbyModal
                isOpen={showOnlineLobby}
                onClose={() => setShowOnlineLobby(false)}
            />

        </div>
    );
}
