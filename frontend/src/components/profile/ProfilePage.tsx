import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, BASE_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Modal de estado
    const [statusModal, setStatusModal] = useState<{
        show: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        loadProfileData();
    }, []);

    const showStatus = (type: 'success' | 'error' | 'info', title: string, message: string) => {
        setStatusModal({ show: true, type, title, message });
    };

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
            const isUpdate = response.data.is_update;
            
            showStatus('success', isUpdate ? '¡Cambio Aplicado!' : '¡Compra Realizada!', response.data.msg);
            loadProfileData(); // Recargar datos
        } catch (error: any) {
            showStatus('error', 'Error', error.response?.data?.msg || 'No se pudo completar la acción.');
        }
    };

    const [showSelector, setShowSelector] = useState<{ type: 'avatar' | 'color', open: boolean }>({ type: 'avatar', open: false });

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <div>
                    <span className="material-icons-round text-red-500 text-6xl mb-4">error_outline</span>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Algo salió mal</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button
                        onClick={loadProfileData}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }
    const xpPercentage = profile.xp_progress;
    const unlockedAchievements = achievements.filter(a => a.unlocked);

    const itemsForSelector = shopItems
        .filter(item => item.type === showSelector.type)
        .sort((a, b) => {
            // Primero los no bloqueados
            if (!a.locked && b.locked) return -1;
            if (a.locked && !b.locked) return 1;
            // Luego por nivel requerido
            return a.required_level - b.required_level;
        });

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-24 relative overflow-hidden">
            {/* Orbs de fondo */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="orb w-96 h-96" style={{ background: '#10B981', top: '-10%', right: '-10%', opacity: 0.1 }} />
                <div className="orb w-80 h-80" style={{ background: '#3B82F6', bottom: '10%', left: '-5%', opacity: 0.08 }} />
            </div>

            {/* Header with Profile Card */}
            <div className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-emerald-500/10 pt-8 pb-20 px-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
                    >
                        <span className="material-icons-round text-slate-900">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Perfil</h1>
                    <div className="w-10"></div>
                </div>

                {/* Profile Avatar & Info */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-3xl p-6 text-center relative shadow-xl"
                >
                    <div className="relative inline-block mb-3 group">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-transform group-hover:scale-105 overflow-hidden"
                            style={{
                                background: profile.avatar_url ? 'none' : `linear-gradient(135deg, ${profile.username_color}, #FFD700)`,
                                boxShadow: `0 8px 32px ${profile.username_color}40`
                            }}
                        >
                            {profile.avatar_url ? (
                                <img 
                                    src={`${BASE_URL}${profile.avatar_url}?t=${new Date().getTime()}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <span className="material-icons-round text-white">{profile.avatar_icon}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex items-center">
                            <label 
                                className="w-10 h-10 rounded-full bg-primary border-4 border-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                                title="Subir foto"
                            >
                                <span className="material-icons-round text-white text-xl">photo_camera</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        
                                        try {
                                            await profileApi.uploadAvatar(formData);
                                            showStatus('success', '¡Foto Actualizada!', 'Tu foto de perfil se ha subido correctamente.');
                                            loadProfileData();
                                        } catch (err) {
                                            showStatus('error', 'Error', 'No se pudo subir la imagen.');
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-1" style={{ color: profile.username_color }}>
                        {profile.username}
                        {profile.is_verified && (
                            <span className="material-icons-round text-blue-400 text-lg ml-1 align-middle">verified</span>
                        )}
                    </h2>

                    {profile.title && (
                        <p className="text-sm text-slate-500 mb-3 italic font-medium">"{profile.title}"</p>
                    )}

                    {/* Level & XP */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6">
                        <div className="bg-slate-50/50 rounded-2xl px-5 py-3 border border-slate-100 flex-1 max-w-[120px]">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Nivel</p>
                            <p className="text-2xl font-black text-primary">{profile.level}</p>
                        </div>
                        <div className="bg-slate-50/50 rounded-2xl px-5 py-3 border border-slate-100 flex-1 max-w-[120px]">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Monedas</p>
                            <p className="text-2xl font-black text-yellow-600">💰{profile.coins}</p>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="bg-slate-100 rounded-full h-3 overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        />
                    </div>
                    <p className="text-xs text-slate-400 font-bold">
                        {profile.xp} / {profile.xp_for_next_level} XP ({Math.round(xpPercentage)}%)
                    </p>
                </motion.div>
            </div>

            {/* Selector Modal */}
            {showSelector.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowSelector({ ...showSelector, open: false })}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {showSelector.type === 'avatar' ? 'Avatar' : 'Color de Nombre'}
                            </h3>
                            <button onClick={() => setShowSelector({ ...showSelector, open: false })}>
                                <span className="material-icons-round text-slate-400 hover:text-slate-600 transition-colors">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {itemsForSelector.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.locked) return;
                                        handlePurchase(item.id);
                                        setShowSelector({ ...showSelector, open: false });
                                    }}
                                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                                        item.locked 
                                        ? 'bg-slate-100 border border-slate-200 opacity-60 cursor-not-allowed' 
                                        : 'hover:scale-105 active:scale-95 bg-slate-50 border border-slate-200 shadow-sm'
                                    } ${
                                        (showSelector.type === 'avatar' && profile.avatar_icon === item.value) ||
                                        (showSelector.type === 'color' && profile.username_color === item.value)
                                        ? 'border-2 border-primary bg-primary/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                        : ''
                                    }`}
                                >
                                    {showSelector.type === 'avatar' ? (
                                        <span className="material-icons-round text-xl text-slate-700">{item.value}</span>
                                    ) : (
                                        <div 
                                            className="w-6 h-6 rounded-full shadow-inner"
                                            style={{ backgroundColor: item.value }}
                                        />
                                    )}
                                    
                                    {item.locked && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 rounded-xl">
                                            <span className="material-icons-round text-xs text-white/70 mb-0.5">lock</span>
                                            <span className="text-[8px] font-black text-white/90 uppercase">lvl{item.required_level}</span>
                                        </div>
                                    )}

                                    {!item.locked && !((showSelector.type === 'avatar' && profile.avatar_icon === item.value) || (showSelector.type === 'color' && profile.username_color === item.value)) && item.price > 0 && !item.can_buy && (
                                         <div className="absolute top-1 right-1 bg-yellow-400/20 border border-yellow-400/40 rounded-full w-4 h-4 flex items-center justify-center">
                                            <span className="material-icons-round text-[8px] text-yellow-600">payments</span>
                                         </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <p className="text-[10px] text-slate-500 mt-6 text-center uppercase font-black tracking-widest">
                            {showSelector.type === 'avatar' ? 'Personaliza tu identidad' : 'Destaca con estilo'}
                        </p>
                    </motion.div>
                </div>
            )}

            <div className="px-6 -mt-8 mb-8 relative z-10">
                <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 rounded-[2rem] p-1.5 flex gap-1.5 shadow-xl">
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

            {authUser?.role === 'admin' && (
                <div className="px-6 mb-6">
                    <button 
                        onClick={() => navigate('/admin')}
                        className="w-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:from-red-100 hover:to-orange-100 transition-all shadow-sm"
                    >
                        <span className="material-icons-round text-red-500">admin_panel_settings</span>
                        Panel de Administración
                    </button>
                </div>
            )}

            <div className="px-6">
                {activeTab === 'profile' && (
                    <ProfileTab profile={profile} achievements={unlockedAchievements} onEditAvatar={() => setShowSelector({ type: 'avatar', open: true })} onEditColor={() => setShowSelector({ type: 'color', open: true })} />
                )}
                {activeTab === 'shop' && (
                    <ShopTab shopItems={shopItems} profile={profile} onPurchase={handlePurchase} />
                )}
                {activeTab === 'achievements' && (
                    <AchievementsTab achievements={achievements} />
                )}
            </div>

            {/* Status Modal (Reemplaza los alerts de localhost) */}
            <AnimatePresence>
                {statusModal.show && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl text-center"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                                statusModal.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                                statusModal.type === 'error' ? 'bg-red-500/10 text-red-600' :
                                'bg-blue-500/10 text-blue-600'
                            }`}>
                                <span className="material-icons-round text-3xl">
                                    {statusModal.type === 'success' ? 'check_circle' :
                                     statusModal.type === 'error' ? 'error' : 'info'}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{statusModal.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                {statusModal.message}
                            </p>
                            
                            <button 
                                onClick={() => setStatusModal({ ...statusModal, show: false })}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
                                    statusModal.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                                    statusModal.type === 'error' ? 'bg-red-500 text-white shadow-red-500/20' :
                                    'bg-blue-500 text-white shadow-blue-500/20'
                                }`}
                            >
                                Continuar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 rounded-xl font-medium transition-all ${active
            ? 'bg-primary text-white shadow-lg shadow-emerald-500/20'
            : 'text-slate-400 hover:text-slate-600'
            }`}
    >
        <span className="material-icons-round text-lg sm:text-xl">{icon}</span>
        <span className="text-[9px] sm:text-xs font-black uppercase tracking-tight">{label}</span>
    </button>
);

const ProfileTab = ({ profile, achievements, onEditAvatar, onEditColor }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
    >
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
                <span className="material-icons-round text-primary">info</span>
                Información
            </h3>
            <div className="space-y-3">
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Miembro desde" value={new Date(profile.created_at).toLocaleDateString()} />
                <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Escudos de racha</span>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-blue-600">{profile.streak_shields}</span>
                        <span className="material-icons-round text-blue-600 text-sm">shield</span>
                    </div>
                </div>
                <InfoRow label="Logros desbloqueados" value={`${achievements.length}`} />
            </div>
        </div>

        {profile.xp_booster_sessions > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                    <span className="material-icons-round text-4xl text-emerald-400">bolt</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2 uppercase tracking-tight">
                    Potenciador de XP Activo
                </h3>
                <p className="text-sm text-slate-600">
                    Multiplicador <span className="text-emerald-600 font-black">x{profile.xp_booster_multiplier}</span> activo por <span className="font-black text-slate-900">{profile.xp_booster_sessions}</span> sesiones.
                </p>
            </div>
        )}

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
                <span className="material-icons-round text-yellow-500">auto_awesome</span>
                Personalización
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-icons-round text-primary text-xl bg-emerald-100/50 p-2 rounded-xl shrink-0">{profile.avatar_icon}</span>
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">Avatar</span>
                    </div>
                    <button 
                        onClick={onEditAvatar}
                        className="text-[9px] font-black text-primary uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 shrink-0 ml-2"
                    >
                        Cambiar
                    </button>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div
                            className="w-9 h-9 rounded-xl border-2 border-white shadow-sm shrink-0"
                            style={{ backgroundColor: profile.username_color }}
                        ></div>
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">Color</span>
                    </div>
                    <button 
                        onClick={onEditColor}
                        className="text-[9px] font-black text-primary uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 shrink-0 ml-2"
                    >
                        Cambiar
                    </button>
                </div>
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
                className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm ${item.locked ? 'opacity-50' : ''
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
                    className={`w-full mt-3 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95 ${item.can_buy
                        ? 'bg-primary text-white shadow-emerald-500/20'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        }`}
                >
                    {item.can_buy ? 'Comprar ahora' : (item.locked ? 'Nivel insuficiente' : 'Faltan monedas')}
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
    <motion.div 
        whileHover={unlocked ? { scale: 1.02, x: 5 } : {}}
        className={`relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-5 transition-all shadow-sm ${
            unlocked ? 'border-primary/20 bg-emerald-50/10' : 'opacity-40 grayscale'
        }`}
    >
        {unlocked && (
            <div className="absolute top-0 right-0 p-2">
                <span className="material-icons-round text-primary text-xs opacity-50">verified</span>
            </div>
        )}
        
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center relative z-10 shrink-0 ${
            unlocked 
            ? 'bg-emerald-50 text-primary border border-emerald-100 shadow-inner' 
            : 'bg-slate-100 text-slate-400 border border-slate-200'
        }`}>
            <span className="material-icons-round text-3xl">
                {achievement.icon}
            </span>
            {unlocked && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="material-icons-round text-white text-[10px]">check</span>
                </div>
            )}
        </div>

        <div className="flex-1 min-w-0">
            <h4 className={`font-black text-sm sm:text-base uppercase tracking-tight truncate ${unlocked ? 'text-slate-900' : 'text-slate-400'}`}>
                {achievement.name}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{achievement.description}</p>
            
            <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10">
                    <span className="material-icons-round text-[10px] text-primary">bolt</span>
                    <span className="text-[10px] font-black text-primary">+{achievement.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/10">
                    <span className="material-icons-round text-[10px] text-yellow-400">payments</span>
                    <span className="text-[10px] font-black text-yellow-400">+{achievement.coins_reward}</span>
                </div>
            </div>
        </div>
    </motion.div>
);

const InfoRow = ({ label, value }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
);

export default ProfilePage;
