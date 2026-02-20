import React, { useEffect, useState } from 'react';
import { routinesApi } from '../../services/api';
import { Play, Trash2, Calendar, ClipboardList, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
            try {
                await routinesApi.delete(id);
                setRoutines(routines.filter(r => r.id !== id));
            } catch (err) {
                console.error('Error al eliminar la rutina:', err);
            }
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

    if (loading) return <div className="text-center py-10">Cargando rutinas...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6 px-6">
                <h2 className="text-xl font-bold">Mis Rutinas</h2>
                <button
                    onClick={() => navigate('/routines/new')}
                    className="text-primary text-sm font-bold flex items-center gap-1"
                >
                    <span className="material-icons-round">add</span> Nueva Rutina
                </button>
            </div>

            {routines.length === 0 ? (
                <div className="px-6 py-12 text-center bg-white/5 rounded-3xl border border-white/10 mx-6">
                    <ClipboardList className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No se han encontrado rutinas. ¡Crea la primera!</p>
                </div>
            ) : (
                <div className="px-6 space-y-4">
                    {routines.map((routine) => (
                        <div key={routine.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg">{routine.name}</h3>
                                    {routine.is_public && (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                                            <Globe className="w-2.5 h-2.5" />Pública
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{routine.description || 'Sin descripción'}</p>
                                <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(routine.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/workout/${routine.id}`)}
                                    className="p-3 rounded-xl bg-primary text-background-dark hover:scale-105 active:scale-95 transition-all"
                                    title="Empezar entrenamiento"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                </button>
                                <button
                                    onClick={() => handleTogglePublish(routine.id)}
                                    title={routine.is_public ? 'Despublicar' : 'Publicar en comunidad'}
                                    className={`p-3 rounded-xl border transition-all active:scale-95 ${routine.is_public
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-400/30'
                                        }`}
                                >
                                    {routine.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(routine.id)}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-500 hover:border-red-500/50 transition-all"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoutineList;
