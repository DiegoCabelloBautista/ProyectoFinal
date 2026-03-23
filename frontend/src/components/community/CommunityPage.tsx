import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../../services/api';
import { Heart, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Users } from 'lucide-react';

interface Author {
    id: number;
    username: string;
    level: number;
    avatar_icon: string;
    username_color: string;
    is_followed: boolean;
}

interface CommunityRoutine {
    id: number;
    name: string;
    description: string;
    created_at: string;
    exercise_count: number;
    likes: number;
    user_liked: boolean;
    user_saved: boolean;
    is_own: boolean;
    author: Author;
}

interface Exercise {
    exercise_name: string;
    muscle_group: string;
    sets: number;
    reps_target: string;
}

const MUSCLE_COLORS: Record<string, string> = {
    Pecho: '#f97316', Espalda: '#3b82f6', Hombros: '#a855f7',
    Bíceps: '#06b6d4', Tríceps: '#ec4899', Piernas: '#22c55e',
    Glúteos: '#f59e0b', Abdominales: '#ef4444', Gemelos: '#14b8a6',
    Cardio: '#e11d48',
};

const RoutineCard: React.FC<{
    routine: CommunityRoutine;
    onUpdate: (id: number, patch: Partial<CommunityRoutine>) => void;
    onUpdateAuthor: (authorId: number, isFollowed: boolean) => void;
}> = ({ routine, onUpdate, onUpdateAuthor }) => {
    const [expanded, setExpanded] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loadingEx, setLoadingEx] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadExercises = async () => {
        if (exercises.length > 0) { setExpanded(e => !e); return; }
        setLoadingEx(true);
        try {
            const res = await communityApi.getRoutineExercises(routine.id);
            setExercises(res.data);
            setExpanded(true);
        } catch { /* silencioso */ }
        finally { setLoadingEx(false); }
    };

    const handleLike = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            const res = await communityApi.toggleLike(routine.id);
            onUpdate(routine.id, { likes: res.data.likes, user_liked: res.data.liked });
        } catch { /* silencioso */ }
        finally { setActionLoading(false); }
    };

    const handleSave = async () => {
        if (actionLoading || routine.is_own) return;
        setActionLoading(true);
        try {
            const res = await communityApi.saveRoutine(routine.id);
            onUpdate(routine.id, { user_saved: res.data.saved });
        } catch { /* silencioso */ }
        finally { setActionLoading(false); }
    };

    const navigate = useNavigate();
    
    // ...resto del RoutineCard
    const handleFollow = async () => {
        if (actionLoading || routine.is_own) return;
        setActionLoading(true);
        try {
            const res = await communityApi.toggleFollow(routine.author.id);
            onUpdateAuthor(routine.author.id, res.data.following);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
            {/* Header */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-100 truncate">{routine.name}</h3>
                        {routine.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{routine.description}</p>
                        )}
                    </div>
                    {/* Acciones */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${routine.user_liked
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-red-500/30 hover:text-red-400'
                                }`}
                        >
                            <Heart className={`w-3.5 h-3.5 ${routine.user_liked ? 'fill-red-400' : ''}`} />
                            {routine.likes}
                        </button>
                        {!routine.is_own && (
                            <button
                                onClick={handleSave}
                                title={routine.user_saved ? 'Rutina guardada — click para quitar' : 'Guardar en mis rutinas'}
                                className={`p-2 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${routine.user_saved
                                        ? 'bg-primary/20 text-primary border-primary/30'
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-primary/30 hover:text-primary'
                                    }`}
                            >
                                {routine.user_saved
                                    ? <BookmarkCheck className="w-4 h-4" />
                                    : <Bookmark className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 flex-1">
                        <div 
                            onClick={() => navigate(`/user/${routine.author?.id}`)} 
                            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 -ml-1 rounded-xl transition-all"
                        >
                            <span
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                                style={{ background: 'rgba(139,92,246,0.15)' }}
                            >
                                <span className="material-icons-round text-primary" style={{ fontSize: 14 }}>
                                    {routine.author?.avatar_icon ?? 'person'}
                                </span>
                            </span>
                            <div className="flex flex-col">
                                <span
                                    className="text-xs font-semibold leading-tight hover:underline"
                                    style={{ color: routine.author?.username_color ?? '#00C9FF' }}
                                >
                                    {routine.author?.username}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">Nv.{routine.author?.level}</span>
                            </div>
                        </div>
                        
                        {!routine.is_own && (
                            <button
                                onClick={handleFollow}
                                className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all active:scale-95 ${
                                    routine.author?.is_followed 
                                        ? 'bg-white/10 text-white' 
                                        : 'bg-primary text-background-dark'
                                }`}
                            >
                                {routine.author?.is_followed ? 'Siguiendo' : 'Seguir'}
                            </button>
                        )}
                    </div>
                    <span className="text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">{routine.exercise_count} ejercicios</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">
                        {new Date(routine.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>

            {/* Toggle ejercicios */}
            <button
                onClick={loadingEx ? undefined : loadExercises}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:text-slate-300 border-t border-white/5 transition-colors"
            >
                {loadingEx ? (
                    <div className="w-3 h-3 border border-t-transparent border-slate-400 rounded-full animate-spin" />
                ) : expanded ? (
                    <><ChevronUp className="w-3.5 h-3.5" />Ocultar ejercicios</>
                ) : (
                    <><ChevronDown className="w-3.5 h-3.5" />Ver ejercicios</>
                )}
            </button>

            {/* Lista ejercicios */}
            {expanded && exercises.length > 0 && (
                <div className="border-t border-white/5 divide-y divide-white/5">
                    {exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-2.5">
                            <div>
                                <span className="text-xs text-slate-200 font-medium">{ex.exercise_name}</span>
                                <span
                                    className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                                    style={{
                                        background: `${MUSCLE_COLORS[ex.muscle_group] ?? '#6b7280'}22`,
                                        color: MUSCLE_COLORS[ex.muscle_group] ?? '#6b7280',
                                    }}
                                >
                                    {ex.muscle_group}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">{ex.sets}×{ex.reps_target}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const CommunityPage: React.FC = () => {
    const [routines, setRoutines] = useState<CommunityRoutine[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');

    useEffect(() => {
        if (activeTab === 'feed') {
            loadFeed();
        } else {
            loadLeaderboard();
        }
    }, [activeTab]);

    const loadFeed = async () => {
        setLoading(true);
        try {
            const res = await communityApi.getFeed();
            setRoutines(res.data);
        } catch { /* silencioso */ }
        finally { setLoading(false); }
    };

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await communityApi.getLeaderboard();
            setLeaderboard(res.data);
        } catch { /* silencioso */ }
        finally { setLoading(false); }
    };

    const handleUpdate = (id: number, patch: Partial<CommunityRoutine>) => {
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    };

    const handleUpdateAuthor = (authorId: number, isFollowed: boolean) => {
        setRoutines(prev => prev.map(r => r.author.id === authorId ? { ...r, author: { ...r.author, is_followed: isFollowed } } : r));
    };

    const filtered = routines.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.author?.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-28 text-slate-100">
            {/* Header */}
            <div className="px-6 pt-12 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Users className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Comunidad</h1>
                </div>
                <p className="text-sm text-slate-400 pl-9">
                    {activeTab === 'feed' ? 'Descubre y guarda rutinas de otros atletas' : 'Clasificación global de GymTrack Pro'}
                </p>
            </div>

            {/* Tabs */}
            <div className="px-6 mb-6">
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${activeTab === 'feed' ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        Descubrir
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'leaderboard' ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        Top Atletas <span className="material-icons-round text-sm">emoji_events</span>
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="px-6 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'feed' ? (
                    <>
                        {/* Buscador de rutinas */}
                        <div className="relative mb-4">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por nombre o usuario..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">
                                    {search ? 'Sin resultados para esa búsqueda' : 'Aún no hay rutinas publicadas'}
                                </p>
                                <p className="text-slate-500 text-sm mt-1">
                                    {!search && '¡Sé el primero en publicar la tuya desde Mis Rutinas!'}
                                </p>
                            </div>
                        ) : (
                            filtered.map(routine => (
                                <RoutineCard key={routine.id} routine={routine} onUpdate={handleUpdate} onUpdateAuthor={handleUpdateAuthor} />
                            ))
                        )}
                    </>
                ) : (
                    /* Ranking Leaderboard */
                    <div className="space-y-3">
                        {leaderboard.map((user) => (
                            <div 
                                key={user.id} 
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${user.is_current_user ? 'bg-primary/20 border-2 border-primary/50' : 'bg-white/5 border border-white/10'}`}
                            >
                                <div className="flex-shrink-0 w-8 text-center font-black">
                                    {user.rank === 1 ? <span className="text-2xl">🥇</span> : 
                                     user.rank === 2 ? <span className="text-2xl">🥈</span> : 
                                     user.rank === 3 ? <span className="text-2xl">🥉</span> : 
                                     <span className="text-slate-500 text-lg">#{user.rank}</span>}
                                </div>
                                
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                                     style={{ background: `linear-gradient(135deg, ${user.username_color || '#8B5CF6'}40, #00000000)`, border: `1px solid ${user.username_color || '#8B5CF6'}40` }}>
                                    <span className="material-icons-round text-white text-2xl" style={{ color: user.username_color || '#8B5CF6' }}>
                                        {user.avatar_icon}
                                    </span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-base truncate flex items-center gap-1" style={{ color: user.username_color || '#ffffff' }}>
                                            {user.username}
                                            {user.user_id === 1 && <span className="material-icons-round text-blue-400 text-sm">verified</span>}
                                        </h3>
                                        {user.is_current_user && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-background-dark uppercase">Tú</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium truncate">
                                        Nv.{user.level} {user.title && `— ${user.title}`}
                                    </p>
                                </div>
                                
                                <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-black text-white">{user.xp.toLocaleString()}</p>
                                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
