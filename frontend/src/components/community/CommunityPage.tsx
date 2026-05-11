import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi, BASE_URL } from '../../services/api';
import { Heart, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Users, Star, UserPlus, Search } from 'lucide-react';

interface Author { id: number; username: string; level: number; avatar_icon: string; avatar_url: string | null; username_color: string; is_followed: boolean; }
interface CommunityRoutine {
    id: number; name: string; description: string; created_at: string;
    exercise_count: number; likes: number; user_liked: boolean; user_saved: boolean;
    is_own: boolean; avg_rating: number; review_count: number; user_rating: number; author: Author;
}
interface Exercise { exercise_name: string; muscle_group: string; sets: number; reps_target: string; }

const MUSCLE_COLORS: Record<string, string> = {
    Pecho: '#f97316', Espalda: '#3b82f6', Hombros: '#a855f7', Bíceps: '#06b6d4',
    Tríceps: '#ec4899', Piernas: '#22c55e', Glúteos: '#f59e0b', Abdominales: '#ef4444', Cardio: '#e11d48',
};

// ── StarRating ──────────────────────────────────────────────────────────────
const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; size?: number }> = ({ value, onChange, size = 16 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => onChange?.(n)}
                className={onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                disabled={!onChange}>
                <Star size={size} className={n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'} />
            </button>
        ))}
    </div>
);

// ── ReviewsPanel ────────────────────────────────────────────────────────────
const ReviewsPanel: React.FC<{ 
    routineId: number; 
    isOwn: boolean; 
    rating: number; 
    setRating: (v: number) => void;
    onRated: (rating: number, stats: { avg_rating: number, review_count: number }) => void;
}> = ({ routineId, isOwn, rating, setRating, onRated }) => {
        const [reviews, setReviews] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);
        const [comment, setComment] = useState('');
        const [submitting, setSubmitting] = useState(false);

        useEffect(() => {
            setLoading(true);
            communityApi.getReviews(routineId).then(r => setReviews(r.data)).catch(() => {}).finally(() => setLoading(false));
        }, [routineId]);

        const handleSubmit = async () => {
            if (!rating) return;
            setSubmitting(true);
            try {
                const res = await communityApi.submitReview(routineId, { rating, comment });
                onRated(rating, { avg_rating: res.data.avg_rating, review_count: res.data.review_count });
                const r = await communityApi.getReviews(routineId);
                setReviews(r.data);
                setComment('');
            } catch { /* silencioso */ }
            finally { setSubmitting(false); }
        };

        return (
            <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                {!isOwn && (
                    <div id={`rate-section-${routineId}`} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tu valoración</p>
                        <StarRating value={rating} onChange={setRating} size={24} />
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="¿Qué te ha parecido la rutina? (opcional)..."
                            rows={2}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary/50 resize-none"
                        />
                        <button onClick={handleSubmit} disabled={!rating || submitting}
                            className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-xl disabled:opacity-50 transition-all active:scale-[0.98] shadow-sm">
                            {submitting ? 'Guardando...' : 'Publicar valoración'}
                        </button>
                    </div>
                )}
                {loading ? <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                    : reviews.length === 0 ? <p className="text-slate-500 text-xs text-center py-2">Sin valoraciones todavía.</p>
                    : reviews.map(r => (
                        <div key={r.id} className="flex gap-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm overflow-hidden"
                                style={{ background: r.user.avatar_url ? 'none' : 'rgba(16,185,129,0.15)' }}>
                                {r.user.avatar_url ? (
                                    <img src={`${BASE_URL}${r.user.avatar_url}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-icons-round text-primary" style={{ fontSize: 14 }}>{r.user.avatar_icon}</span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold" style={{ color: r.user.username_color }}>{r.user.username}</span>
                                    <StarRating value={r.rating} size={12} />
                                </div>
                                {r.comment && <p className="text-xs text-slate-600 mt-0.5">{r.comment}</p>}
                                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(r.created_at).toLocaleDateString('es-ES')}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        );
    };

// ── RoutineCard ─────────────────────────────────────────────────────────────
const RoutineCard: React.FC<{
    routine: CommunityRoutine;
    onUpdate: (id: number, patch: Partial<CommunityRoutine>) => void;
    onUpdateAuthor: (authorId: number, isFollowed: boolean) => void;
}> = ({ routine, onUpdate, onUpdateAuthor }) => {
    const [expanded, setExpanded] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [userRating, setUserRating] = useState(routine.user_rating);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loadingEx, setLoadingEx] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    const loadExercises = async () => {
        if (exercises.length > 0) { setExpanded(e => !e); return; }
        setLoadingEx(true);
        try { const res = await communityApi.getRoutineExercises(routine.id); setExercises(res.data); setExpanded(true); }
        catch { /* silencioso */ } finally { setLoadingEx(false); }
    };

    const handleLike = async () => {
        if (actionLoading) return; setActionLoading(true);
        try { const res = await communityApi.toggleLike(routine.id); onUpdate(routine.id, { likes: res.data.likes, user_liked: res.data.liked }); }
        catch { /* silencioso */ } finally { setActionLoading(false); }
    };

    const handleSave = async () => {
        if (actionLoading || routine.is_own) return; setActionLoading(true);
        try { const res = await communityApi.saveRoutine(routine.id); onUpdate(routine.id, { user_saved: res.data.saved }); }
        catch { /* silencioso */ } finally { setActionLoading(false); }
    };

    const handleFollow = async () => {
        if (actionLoading || routine.is_own) return; setActionLoading(true);
        try { const res = await communityApi.toggleFollow(routine.author.id); onUpdateAuthor(routine.author.id, res.data.following); }
        catch { /* silencioso */ } finally { setActionLoading(false); }
    };

    // Al hacer clic en las estrellas del resumen, abrimos el panel y pre-seleccionamos
    const handleQuickRate = (val: number) => {
        if (routine.is_own) return;
        setUserRating(val);
        setShowReviews(true);
        // Pequeño scroll suave hacia abajo para mostrar el panel
        setTimeout(() => {
            const el = document.getElementById(`rate-section-${routine.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
    };

    return (
        <div id={`routine-card-${routine.id}`} className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{routine.name}</h3>
                        {routine.description && <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 font-medium leading-relaxed">{routine.description}</p>}
                        {/* Rating display */}
                        <div className={`flex items-center gap-2 mt-2 w-fit ${!routine.is_own ? 'cursor-pointer group' : ''}`}>
                            <StarRating 
                                value={Math.round(routine.avg_rating)} 
                                size={12} 
                                onChange={!routine.is_own ? (v) => handleQuickRate(v) : undefined} 
                            />
                            <span 
                                onClick={() => !routine.is_own && setShowReviews(true)}
                                className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!routine.is_own ? 'group-hover:text-primary transition-colors' : ''}`}>
                                {routine.avg_rating > 0 ? `${routine.avg_rating} (${routine.review_count})` : 'Sin valoración'}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={handleLike}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${routine.user_liked ? 'bg-red-50 text-red-500 border-red-100 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-red-100 hover:text-red-500 shadow-inner'}`}>
                            <Heart className={`w-3.5 h-3.5 ${routine.user_liked ? 'fill-red-500' : ''}`} />
                            {routine.likes}
                        </button>
                        {!routine.is_own && (
                            <button onClick={handleSave}
                                className={`flex items-center justify-center p-2 rounded-xl border transition-all active:scale-95 ${routine.user_saved ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100 shadow-inner'}`}>
                                {routine.user_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 flex-1 cursor-pointer group"
                        onClick={() => navigate(`/user/${routine.author?.id}`)}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow transition-all" 
                              style={{ background: routine.author?.avatar_url ? 'none' : `${routine.author?.username_color ?? '#10B981'}15`, border: `1px solid ${routine.author?.username_color ?? '#10B981'}30` }}>
                            {routine.author?.avatar_url ? (
                                <img src={`${BASE_URL}${routine.author.avatar_url}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-icons-round" style={{ fontSize: 18, color: routine.author?.username_color }}>{routine.author?.avatar_icon ?? 'person'}</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black leading-none group-hover:underline truncate" style={{ color: routine.author?.username_color }}>{routine.author?.username}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Nivel {routine.author?.level}</span>
                        </div>
                    </div>
                    {!routine.is_own && (
                        <button onClick={handleFollow}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${routine.author?.is_followed ? 'bg-slate-100 text-slate-500' : 'bg-primary text-white shadow-emerald-500/20'}`}>
                            {routine.author?.is_followed ? 'Siguiendo' : 'Seguir'}
                        </button>
                    )}
                </div>
            </div>

            {/* Actions row */}
            <div className="flex bg-slate-50/50 border-t border-slate-100">
                <button onClick={loadingEx ? undefined : loadExercises}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">
                    {loadingEx ? <div className="w-3 h-3 border-2 border-t-transparent border-slate-400 rounded-full animate-spin" />
                        : expanded ? <><ChevronUp className="w-4 h-4" /> Menos</>
                        : <><ChevronDown className="w-4 h-4" /> Ejercicios</>}
                </button>
                <div className="w-px bg-slate-100" />
                <button onClick={() => setShowReviews(s => !s)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${showReviews ? 'text-yellow-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Star className={`w-4 h-4 ${showReviews ? 'fill-yellow-500' : ''}`} />
                    Valoraciones
                </button>
            </div>

            {expanded && exercises.length > 0 && (
                <div className="border-t border-slate-50 divide-y divide-slate-50">
                    {exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-2.5">
                            <div>
                                <span className="text-xs text-slate-700 font-semibold">{ex.exercise_name}</span>
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                                    style={{ background: `${MUSCLE_COLORS[ex.muscle_group] ?? '#6b7280'}15`, color: MUSCLE_COLORS[ex.muscle_group] ?? '#6b7280' }}>
                                    {ex.muscle_group}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold tracking-wider">{ex.sets}×{ex.reps_target}</span>
                        </div>
                    ))}
                </div>
            )}

            {showReviews && (
                <ReviewsPanel 
                    routineId={routine.id} 
                    isOwn={routine.is_own} 
                    rating={userRating} 
                    setRating={setUserRating}
                    onRated={(rating, stats) => onUpdate(routine.id, { user_rating: rating, ...stats })} 
                />
            )}
        </div>
    );
};

// ── FriendsTab ───────────────────────────────────────────────────────────────
const FriendsTab: React.FC = () => {
    const [friends, setFriends] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        communityApi.getFriends().then(r => setFriends(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (searchQuery.length < 2) { setSearchResults([]); return; }
        const t = setTimeout(() => {
            communityApi.searchUsers(searchQuery).then(r => setSearchResults(r.data)).catch(() => {});
        }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const handleFollow = async (userId: number, isFollowing: boolean) => {
        await communityApi.toggleFollow(userId);
        setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, is_following: !isFollowing } : u));
        if (!isFollowing) {
            // refrescar amigos por si es mutuo
            communityApi.getFriends().then(r => setFriends(r.data)).catch(() => {});
        }
    };

    return (
        <div className="space-y-6">
            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar usuarios por nombre..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary/50 transition-colors shadow-sm" />
            </div>

            {searchResults.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resultados</p>
                    {searchResults.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                                style={{ background: u.avatar_url ? 'none' : `${u.username_color}15`, border: `1px solid ${u.username_color}30` }}>
                                {u.avatar_url ? (
                                    <img src={`${BASE_URL}${u.avatar_url}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-icons-round" style={{ color: u.username_color, fontSize: 20 }}>{u.avatar_icon}</span>
                                )}
                            </div>
                            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/user/${u.id}`)}>
                                <p className="font-bold text-sm" style={{ color: u.username_color }}>{u.username}</p>
                                <p className="text-xs text-slate-400 font-medium tracking-wide">Nv.{u.level}{u.title ? ` · ${u.title}` : ''}</p>
                            </div>
                            <button onClick={() => handleFollow(u.id, u.is_following)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${u.is_following ? 'bg-slate-100 text-slate-600' : 'bg-primary text-white'}`}>
                                <UserPlus className="w-3 h-3" />
                                {u.is_following ? 'Siguiendo' : 'Seguir'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Amigos mutuos */}
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Amigos mutuos ({friends.length})</p>
                {loading ? (
                    <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : friends.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Aún no hay amigos</p>
                        <p className="text-slate-400 text-xs mt-1">¡Sigue a atletas para conectar!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {friends.map(u => (
                            <div key={u.id} className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-primary/30 transition-all shadow-sm"
                                onClick={() => navigate(`/user/${u.id}`)}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                                    style={{ background: u.avatar_url ? 'none' : `${u.username_color}15`, border: `1px solid ${u.username_color}30` }}>
                                    {u.avatar_url ? (
                                        <img src={`${BASE_URL}${u.avatar_url}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-icons-round" style={{ color: u.username_color, fontSize: 24 }}>{u.avatar_icon}</span>
                                    )}
                                </div>
                                <p className="font-bold text-xs text-center truncate w-full" style={{ color: u.username_color }}>{u.username}</p>
                                <span className="text-[10px] text-slate-500">Nv.{u.level}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── CommunityPage ────────────────────────────────────────────────────────────
const CommunityPage: React.FC = () => {
    const [routines, setRoutines] = useState<CommunityRoutine[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'friends'>('feed');
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'feed') { setLoading(true); communityApi.getFeed().then(r => setRoutines(r.data)).catch(() => {}).finally(() => setLoading(false)); }
        else if (activeTab === 'leaderboard') { setLoading(true); communityApi.getLeaderboard().then(r => setLeaderboard(r.data)).catch(() => {}).finally(() => setLoading(false)); }
        else setLoading(false);
    }, [activeTab]);

    const handleUpdate = (id: number, patch: Partial<CommunityRoutine>) =>
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

    const handleUpdateAuthor = (authorId: number, isFollowed: boolean) =>
        setRoutines(prev => prev.map(r => r.author.id === authorId ? { ...r, author: { ...r.author, is_followed: isFollowed } } : r));

    const filtered = routines.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.author?.username.toLowerCase().includes(search.toLowerCase())
    );

    const tabs = [
        { id: 'feed', label: 'Descubrir', icon: 'explore' },
        { id: 'friends', label: 'Amigos', icon: 'group' },
        { id: 'leaderboard', label: 'Top', icon: 'emoji_events' },
    ] as const;

    return (
        <div className="min-h-screen pb-28 text-slate-900 bg-white relative overflow-hidden">
            {/* Orbs de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="orb w-96 h-96" style={{ background: '#10B981', top: '-10%', right: '-10%', opacity: 0.1 }} />
                <div className="orb w-80 h-80" style={{ background: '#3B82F6', bottom: '20%', left: '-5%', opacity: 0.08 }} />
            </div>

            <div className="relative z-10 px-6 pt-12 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <Users className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Comunidad</h1>
                </div>
                <p className="text-xs font-bold text-slate-400 pl-9 uppercase tracking-widest">GymTrack Discovery</p>
            </div>

            {/* Tabs */}
            <div className="px-6 mb-6 relative z-10">
                <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-1 gap-1 shadow-sm">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}>
                            <span className="material-icons-round text-sm">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 space-y-4">
                {activeTab === 'friends' ? <FriendsTab /> : loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'feed' ? (
                    <>
                        <div className="relative mb-4">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por nombre o usuario..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary/50 transition-colors shadow-sm" />
                        </div>
                        {filtered.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{search ? 'Sin resultados' : 'Aún no hay rutinas'}</p>
                                {!search && <p className="text-slate-400 text-xs mt-1">¡Sé el primero en publicar la tuya!</p>}
                            </div>
                        ) : filtered.map(r => <RoutineCard key={r.id} routine={r} onUpdate={handleUpdate} onUpdateAuthor={handleUpdateAuthor} />)}
                    </>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map(user => (
                            <div key={user.id} className={`flex items-center gap-4 p-4 rounded-[2rem] transition-all shadow-sm ${user.is_current_user ? 'bg-emerald-50 border-2 border-primary/20' : 'bg-white border border-slate-100'}`}>
                                <div className="flex-shrink-0 w-10 text-center">
                                    {user.rank === 1 ? <div className="text-3xl filter drop-shadow-sm">🥇</div> : user.rank === 2 ? <div className="text-3xl filter drop-shadow-sm">🥈</div> : user.rank === 3 ? <div className="text-3xl filter drop-shadow-sm">🥉</div> : <span className="text-slate-300 font-black text-lg">#{user.rank}</span>}
                                </div>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden relative group"
                                    style={{ background: user.avatar_url ? 'none' : `${user.username_color || '#10B981'}15`, border: `1px solid ${user.username_color || '#10B981'}30` }}>
                                    {user.avatar_url ? (
                                        <img src={`${BASE_URL}${user.avatar_url}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-icons-round text-3xl" style={{ color: user.username_color || '#10B981' }}>{user.avatar_icon}</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0" onClick={() => navigate(`/user/${user.id}`)}>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-base truncate" style={{ color: user.username_color || '#1e293b' }}>{user.username}</h3>
                                        {user.is_current_user && <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-slate-900 text-white uppercase tracking-widest shadow-lg shadow-slate-900/20">Tú</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate mt-1">Nv.{user.level} {user.title && `· ${user.title}`}</p>
                                </div>
                                <div className="text-right flex-shrink-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shadow-inner min-w-[70px]">
                                    <p className="text-base font-black text-slate-900 leading-none">{user.xp.toLocaleString()}</p>
                                    <p className="text-[8px] uppercase text-slate-400 font-black tracking-widest mt-1">XP</p>
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
