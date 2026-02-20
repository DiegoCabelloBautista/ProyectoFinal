import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [shopItems, setShopItems] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'shop' | 'achievements'>('profile');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setError(null);
            const [profileRes, shopRes, achievementsRes] = await Promise.all([
                profileApi.getProfile(),
                profileApi.getShopItems(),
                profileApi.getAchievements(),
            ]);

            setProfile(profileRes.data);
            setShopItems(shopRes.data);
            setAchievements(achievementsRes.data);
        } catch (error) {
            console.error('Error loading profile:', error);
            setError('Error al cargar el perfil. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (itemId: number) => {
        try {
            const response = await profileApi.purchaseItem(itemId);
            alert(response.data.msg);
            loadProfileData(); // Recargar datos
        } catch (error: any) {
            alert(error.response?.data?.msg || 'Error al comprar');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 text-center">
                <div>
                    <span className="material-icons-round text-red-500 text-6xl mb-4">error_outline</span>
                    <h2 className="text-xl font-bold text-white mb-2">Algo salió mal</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={loadProfileData}
                        className="bg-primary text-background-dark px-6 py-3 rounded-xl font-bold"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const xpPercentage = profile.xp_progress;
    const unlockedAchievements = achievements.filter(a => a.unlocked);

    return (
        <div className="min-h-screen bg-background-dark text-slate-100 pb-24">
            {/* Header with Profile Card */}
            <div className="bg-gradient-to-br from-primary/20 via-blue-500/20 to-purple-500/20 pt-8 pb-20 px-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-xl bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-colors"
                    >
                        <span className="material-icons-round text-white">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-white">Perfil</h1>
                    <div className="w-10"></div>
                </div>

                {/* Profile Avatar & Info */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center"
                >
                    <div className="relative inline-block mb-3">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                            style={{
                                background: `linear-gradient(135deg, ${profile.username_color}, #FFD700)`,
                                boxShadow: `0 8px 32px ${profile.username_color}40`
                            }}
                        >
                            <span className="material-icons-round text-white">{profile.avatar_icon}</span>
                        </div>
                        {profile.is_verified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                <span className="material-icons-round text-white text-sm">verified</span>
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold mb-1" style={{ color: profile.username_color }}>
                        {profile.username}
                        {profile.is_verified && (
                            <span className="material-icons-round text-blue-400 text-lg ml-1 align-middle">verified</span>
                        )}
                    </h2>

                    {profile.title && (
                        <p className="text-sm text-slate-300 mb-3 italic">"{profile.title}"</p>
                    )}

                    {/* Level & XP */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="bg-white/10 rounded-xl px-4 py-2">
                            <p className="text-xs text-slate-400">Nivel</p>
                            <p className="text-2xl font-bold text-primary">{profile.level}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl px-4 py-2">
                            <p className="text-xs text-slate-400">Monedas</p>
                            <p className="text-2xl font-bold text-yellow-400">{profile.coins}</p>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="bg-white/10 rounded-full h-3 overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-green-400"
                        />
                    </div>
                    <p className="text-xs text-slate-400">
                        {profile.xp} / {profile.xp_for_next_level} XP ({Math.round(xpPercentage)}%)
                    </p>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="px-6 -mt-8 mb-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex gap-2">
                    <TabButton
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                        icon="person"
                        label="Perfil"
                    />
                    <TabButton
                        active={activeTab === 'shop'}
                        onClick={() => setActiveTab('shop')}
                        icon="shopping_bag"
                        label="Tienda"
                    />
                    <TabButton
                        active={activeTab === 'achievements'}
                        onClick={() => setActiveTab('achievements')}
                        icon="emoji_events"
                        label="Logros"
                    />
                </div>
            </div>

            <div className="px-6">
                {activeTab === 'profile' && (
                    <ProfileTab profile={profile} achievements={unlockedAchievements} />
                )}
                {activeTab === 'shop' && (
                    <ShopTab shopItems={shopItems} profile={profile} onPurchase={handlePurchase} />
                )}
                {activeTab === 'achievements' && (
                    <AchievementsTab achievements={achievements} />
                )}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${active
            ? 'bg-primary text-background-dark'
            : 'text-slate-400 hover:text-slate-200'
            }`}
    >
        <span className="material-icons-round text-xl">{icon}</span>
        <span className="text-sm">{label}</span>
    </button>
);

const ProfileTab = ({ profile, achievements }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
    >
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-icons-round text-primary">info</span>
                Información
            </h3>
            <div className="space-y-3">
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Miembro desde" value={new Date(profile.created_at).toLocaleDateString()} />
                <InfoRow label="Logros desbloqueados" value={`${achievements.length}`} />
            </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-icons-round text-yellow-400">auto_awesome</span>
                Personalización Activa
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-sm text-slate-400">Avatar</span>
                    <span className="material-icons-round text-primary text-2xl">{profile.avatar_icon}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-sm text-slate-400">Color de nombre</span>
                    <div
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: profile.username_color }}
                    ></div>
                </div>
                {profile.title && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-sm text-slate-400">Título</span>
                        <span className="text-sm font-medium italic">"{profile.title}"</span>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

const ShopTab = ({ shopItems, profile, onPurchase }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
    >
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 mb-4">
            <p className="text-sm text-center">
                💰 Tienes <span className="font-bold text-yellow-400">{profile.coins}</span> monedas
            </p>
        </div>

        {shopItems.map((item: any, index: number) => (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white/5 border border-white/10 rounded-2xl p-4 ${item.locked ? 'opacity-50' : ''
                    }`}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h4 className="font-bold flex items-center gap-2">
                            {item.name}
                            {item.locked && (
                                <span className="material-icons-round text-sm text-red-400">lock</span>
                            )}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                        {item.locked && (
                            <p className="text-xs text-red-400 mt-1">
                                Requiere nivel {item.required_level}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-yellow-400">{item.price}</p>
                        <p className="text-xs text-slate-500">monedas</p>
                    </div>
                </div>

                <button
                    onClick={() => onPurchase(item.id)}
                    disabled={!item.can_buy}
                    className={`w-full mt-3 py-2 rounded-xl font-medium transition-all ${item.can_buy
                        ? 'bg-primary text-background-dark hover:opacity-90'
                        : 'bg-white/10 text-slate-600 cursor-not-allowed'
                        }`}
                >
                    {item.can_buy ? 'Comprar' : (item.locked ? 'Bloqueado' : 'Insuficientes monedas')}
                </button>
            </motion.div>
        ))}
    </motion.div>
);

const AchievementsTab = ({ achievements }: any) => {
    const unlocked = achievements.filter((a: any) => a.unlocked);
    const locked = achievements.filter((a: any) => !a.unlocked);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-primary">{unlocked.length}/{achievements.length}</p>
                <p className="text-sm text-slate-400">Logros desbloqueados</p>
            </div>

            {unlocked.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-400 mb-3">🏆 DESBLOQUEADOS</h3>
                    <div className="space-y-2">
                        {unlocked.map((achievement: any) => (
                            <AchievementCard key={achievement.id} achievement={achievement} unlocked={true} />
                        ))}
                    </div>
                </div>
            )}

            {locked.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-400 mb-3">🔒 BLOQUEADOS</h3>
                    <div className="space-y-2">
                        {locked.map((achievement: any) => (
                            <AchievementCard key={achievement.id} achievement={achievement} unlocked={false} />
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const AchievementCard = ({ achievement, unlocked }: any) => (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 ${unlocked ? '' : 'opacity-40'
        }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${unlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-white/10'
            }`}>
            <span className={`material-icons-round ${unlocked ? 'text-white' : 'text-slate-600'}`}>
                {achievement.icon}
            </span>
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-sm">{achievement.name}</h4>
            <p className="text-xs text-slate-400">{achievement.description}</p>
            <div className="flex gap-3 mt-1">
                <span className="text-xs text-primary">+{achievement.xp_reward} XP</span>
                <span className="text-xs text-yellow-400">+{achievement.coins_reward} monedas</span>
            </div>
        </div>
    </div>
);

const InfoRow = ({ label, value }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-medium">{value}</span>
    </div>
);

export default ProfilePage;
