import React, { useEffect, useState } from 'react';
import { routinesApi } from '../../services/api';
import { Play, Trash2, Calendar, ClipboardList, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MusicPlayer from './MusicPlayer';

const RoutineList: React.FC = () => {
    const [routines, setRoutines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadRoutines();
    }, []);

    const loadRoutines = async () => {
        try {
            const res = await routinesApi.getAll();
            setRoutines(res.data);
        } catch (err) {
            console.error('Error al cargar rutinas:', err);
        } finally {
            setLoading(false);
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setRoutineToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (routineToDelete === null) return;
        try {
            await routinesApi.delete(routineToDelete);
            setRoutines(routines.filter(r => r.id !== routineToDelete));
            setShowDeleteModal(false);
            setRoutineToDelete(null);
        } catch (err) {
            console.error('Error al eliminar la rutina:', err);
        }
    };

    const handleTogglePublish = async (id: number) => {
        try {
            const res = await routinesApi.togglePublish(id);
            setRoutines(prev =>
                prev.map(r => r.id === id ? { ...r, is_public: res.data.is_public } : r)
            );
        } catch (err) {
            console.error('Error al publicar la rutina:', err);
        }
    };

    const handleMusicUpdate = (id: number, url: string) => {
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, music_url: url } : r));
    };

    const [showAiModal, setShowAiModal] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [numExercises, setNumExercises] = useState(6);
    const [generating, setGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    if (loading) return <div className="text-center py-10">Cargando rutinas...</div>;

    const handleAIGenerate = async () => {
        if (!prompt.trim()) return;
        setGenerating(true);
        try {
            await routinesApi.generate(prompt, numExercises);
            await loadRoutines();
            setShowAiModal(false);
            setPrompt('');
            setAiError(null);
        } catch (err) {
            console.error('Error generando rutina con IA', err);
            setAiError('¡Ups! La IA no pudo generar la rutina. Revisa tu conexión.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6 relative pb-10">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-6 pt-2">
                <div className="min-w-0">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase truncate">Mis Rutinas</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestiona tus planes</p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                    <button
                        onClick={() => setShowAiModal(true)}
                        className="bg-emerald-50 text-primary px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                    >
                        <span className="material-icons-round text-sm">auto_awesome</span> IA
                    </button>
                    <button
                        onClick={() => navigate('/routines/new')}
                        className="bg-slate-900 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
                    >
                        <span className="material-icons-round text-sm">add</span> Nuevo
                    </button>
                </div>
            </div>

            {routines.length === 0 ? (
                <div className="px-6 py-16 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 mx-4 sm:mx-6 shadow-inner">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <ClipboardList className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No hay rutinas creadas</p>
                    <button onClick={() => navigate('/routines/new')} className="mt-4 text-primary font-black text-xs uppercase tracking-widest">Crear mi primera rutina</button>
                </div>
            ) : (
                <div className="px-4 sm:px-6 space-y-4">
                    {routines.map((routine) => (
                        <div key={routine.id} className="bg-white border border-slate-100 rounded-[2rem] p-5 group shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{routine.name}</h3>
                                        {routine.is_public && (
                                            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                <Globe className="w-2.5 h-2.5" /> Pública
                                            </span>
                                        )}
                                        {routine.is_assigned && (
                                            <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                                <span className="material-icons-round text-[10px]">workspace_premium</span> Asignada por Coach
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{routine.description || 'Sin descripción'}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-[9px] text-slate-500 font-black uppercase tracking-widest border border-slate-100">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            {new Date(routine.created_at).toLocaleDateString()}
                                        </div>
                                        {routine.author && (typeof routine.author === 'string' ? routine.author !== "Mí" : routine.author.username) && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg text-[9px] text-emerald-600 font-black uppercase tracking-widest border border-emerald-100">
                                                <span className="material-icons-round text-[11px]">sports</span>
                                                Coach: {typeof routine.author === 'string' ? routine.author : routine.author.username}
                                                {routine.is_verified && (
                                                    <span className="material-icons-round text-blue-500" style={{ fontSize: '10px' }}>verified</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => navigate(`/workout/${routine.id}`)}
                                        className="p-3.5 rounded-2xl bg-primary text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all" title="Empezar">
                                        <Play className="w-5 h-5 fill-current" />
                                    </button>
                                    <div className="hidden sm:flex gap-2">
                                        <button onClick={() => handleTogglePublish(routine.id)}
                                            title={routine.is_public ? 'Despublicar' : 'Publicar'}
                                            className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${
                                                routine.is_public
                                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-emerald-500'
                                            }`}>
                                            {routine.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                        </button>
                                        <button onClick={() => handleDelete(routine.id)}
                                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-95" title="Eliminar">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Acciones móviles */}
                            <div className="flex sm:hidden gap-2 mt-4 pt-4 border-t border-slate-50">
                                <button onClick={() => handleTogglePublish(routine.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        routine.is_public ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-500'
                                    }`}>
                                    {routine.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    {routine.is_public ? 'Pública' : 'Privada'}
                                </button>
                                <button onClick={() => handleDelete(routine.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100">
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                            </div>
                            {/* Music Player */}
                            <MusicPlayer
                                routineId={routine.id}
                                musicUrl={routine.music_url ?? null}
                                onUpdate={(url) => handleMusicUpdate(routine.id, url)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* MODALS RENDERED AT THE BOTTOM FOR BETTER POSITIONING */}
            {showAiModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAiModal(false)} />
                    <div className="relative bg-white border border-slate-100 p-6 sm:p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                <span className="material-icons-round text-2xl">auto_awesome</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Generador IA</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inteligencia Artificial</p>
                            </div>
                        </div>
                        
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 leading-relaxed">
                            Describe tu rutina ideal:
                        </p>
                        
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder='Ej: "Rutina intensa de pierna" o "3 pecho 2 triceps"'
                            className={`w-full bg-slate-50 border ${aiError ? 'border-red-500' : 'border-slate-200'} rounded-[1.5rem] p-4 text-sm font-medium focus:outline-none focus:border-primary/50 text-slate-900 min-h-[100px] mb-4 shadow-inner transition-all placeholder:text-slate-300`}
                        />

                        <div className="mb-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Nº Ejercicios</p>
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-1 shadow-inner">
                                {[4, 6, 8, 10].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setNumExercises(n)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                                            numExercises === n
                                                ? 'bg-primary text-white shadow-md shadow-emerald-500/20'
                                                : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {aiError && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                                <span className="material-icons-round text-sm">error_outline</span>
                                {aiError}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 transition-all active:scale-95"
                                disabled={generating}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAIGenerate}
                                disabled={generating || !prompt.trim()}
                                className="flex-1 bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                {generating ? (
                                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Generando</>
                                ) : (
                                    <>Generar</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-white border border-slate-100 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">¿Borrar rutina?</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">
                            Esta acción no se puede deshacer
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/20"
                            >
                                Confirmar eliminación
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border border-slate-100"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutineList;
