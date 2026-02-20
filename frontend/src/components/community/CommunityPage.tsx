import React, { useEffect, useState } from 'react';
import { communityApi } from '../../services/api';
import { Heart, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Users } from 'lucide-react';

interface Author {
    id: number;
    username: string;
    level: number;
    avatar_icon: string;
    username_color: string;
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

const RoutineCard: React.FC<{ routine: CommunityRoutine; onUpdate: (id: number, patch: Partial<CommunityRoutine>) => void }> = ({ routine, onUpdate }) => {
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
                    <div className="flex items-center gap-1.5">
                        <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                            style={{ background: 'rgba(139,92,246,0.15)' }}
                        >
                            <span className="material-icons-round text-primary" style={{ fontSize: 14 }}>
                                {routine.author?.avatar_icon ?? 'person'}
                            </span>
                        </span>
                        <span
                            className="text-xs font-semibold"
                            style={{ color: routine.author?.username_color ?? '#00C9FF' }}
                        >
                            {routine.author?.username}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Nv.{routine.author?.level}</span>
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
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        setLoading(true);
        try {
            const res = await communityApi.getFeed();
            setRoutines(res.data);
        } catch { /* silencioso */ }
        finally { setLoading(false); }
    };

    const handleUpdate = (id: number, patch: Partial<CommunityRoutine>) => {
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
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
                <p className="text-sm text-slate-400 pl-9">Descubre y guarda rutinas de otros atletas</p>
            </div>

            {/* Buscador */}
            <div className="px-6 mb-6">
                <div className="relative">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o usuario..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Contenido */}
            <div className="px-6 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
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
                        <RoutineCard key={routine.id} routine={routine} onUpdate={handleUpdate} />
                    ))
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
