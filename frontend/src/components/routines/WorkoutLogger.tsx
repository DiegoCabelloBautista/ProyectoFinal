import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutsApi, routinesApi } from '../../services/api';
import { Check, Clock, ChevronRight, Activity } from 'lucide-react';

const WorkoutLogger: React.FC = () => {
    const { routineId } = useParams();
    const [routine, setRoutine] = useState<any>(null);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [sets, setSets] = useState<any[]>([]);
    const [timer, setTimer] = useState(0);
    const [loadingSession, setLoadingSession] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        startWorkout();
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const startWorkout = async () => {
        try {
            setLoadingSession(true);
            setLoadError(null);

            console.log('[WorkoutLogger] routineId desde URL:', routineId);

            // getById devuelve la rutina CON sus ejercicios completos
            const routineRes = await routinesApi.getById(Number(routineId));
            const routineData = routineRes.data;

            console.log('[WorkoutLogger] Respuesta getById:', JSON.stringify(routineData));
            console.log('[WorkoutLogger] exercises recibidos:', routineData.exercises);

            // Normalizar: el endpoint devuelve 'exercise_name', el template espera 'name'
            const normalized = {
                ...routineData,
                exercises: (routineData.exercises ?? []).map((ex: any) => ({
                    ...ex,
                    name: ex.exercise_name ?? ex.name ?? 'Ejercicio',
                })),
            };

            console.log('[WorkoutLogger] exercises normalizados:', normalized.exercises);
            setRoutine(normalized);

            const res = await workoutsApi.startSession(Number(routineId));
            setSessionId(res.data.id);
            console.log('[WorkoutLogger] sessionId:', res.data.id);
        } catch (err: any) {
            console.error('[WorkoutLogger] ERROR:', err?.response?.status, err?.response?.data || err);
            setLoadError(`Error ${err?.response?.status ?? ''}: No se pudo cargar la rutina. Revisa la consola del navegador.`);
        } finally {
            setLoadingSession(false);
        }
    };

    const logSet = async (weight: number, reps: number) => {
        if (!sessionId || !routine) return;

        const exercise = routine.exercises?.[currentExerciseIndex];
        if (!exercise) return;

        try {
            await workoutsApi.logSet({
                session_id: sessionId,
                exercise_id: exercise.exercise_id ?? exercise.id,
                set_number: sets.length + 1,
                weight,
                reps
            });
            setSets([...sets, { weight, reps }]);
        } catch (err) {
            console.error('Error al registrar la serie:', err);
        }
    };

    const finishWorkout = async () => {
        if (!sessionId) return;
        try {
            await workoutsApi.finishSession(sessionId);
            navigate('/');
        } catch (err) {
            console.error('Error al finalizar el entrenamiento:', err);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loadError) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6" style={{ background: '#0A0D14' }}>
            <span className="material-icons-round text-red-400 text-5xl">error_outline</span>
            <p className="text-slate-300 font-medium">{loadError}</p>
            <button onClick={() => navigate('/routines')} className="px-6 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
                Volver a Rutinas
            </button>
        </div>
    );

    if (loadingSession || !routine) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#0A0D14' }}>
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8B5CF6' }} />
            <p className="text-slate-500 text-sm font-medium">Preparando tu entrenamiento...</p>
        </div>
    );

    const currentExercise = routine.exercises?.[currentExerciseIndex];

    return (
        <div className="min-h-screen pb-32 bg-background-dark text-slate-100 px-6 pt-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{routine.name}</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(timer)}</span>
                    </div>
                </div>
                <button
                    onClick={finishWorkout}
                    className="bg-primary/20 text-primary px-4 py-2 rounded-xl font-bold text-sm"
                >
                    Finalizar
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/10 px-2 py-1 rounded-full">Ejercicio Actual</span>
                        <h2 className="text-2xl font-bold mt-2">{currentExercise?.name || 'Cargando...'}</h2>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-2xl">
                        <Activity className="text-primary w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Peso (kg)</label>
                            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xl font-bold text-slate-100" defaultValue="0" id="weight" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reps</label>
                            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xl font-bold text-slate-100" defaultValue="0" id="reps" />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const w = Number((document.getElementById('weight') as HTMLInputElement).value);
                            const r = Number((document.getElementById('reps') as HTMLInputElement).value);
                            logSet(w, r);
                        }}
                        disabled={!sessionId}
                        className="w-full font-bold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                    >
                        {!sessionId ? 'Iniciando sesión...' : 'Registrar Serie'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Series Registradas</h3>
                {sets.length === 0 ? (
                    <p className="text-slate-500 italic text-sm">No hay series registradas para este ejercicio.</p>
                ) : (
                    <div className="space-y-2">
                        {sets.map((set, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{i + 1}</div>
                                    <span className="font-bold">{set.weight} kg × {set.reps}</span>
                                </div>
                                <Check className="text-primary w-5 h-5" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 glass-nav flex gap-4 z-50">
                <button
                    className="flex-1 bg-white/5 border border-white/10 text-slate-100 font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    onClick={() => {
                        setCurrentExerciseIndex(idx => Math.max(0, idx - 1));
                        setSets([]);
                    }}
                >
                    Anterior
                </button>
                <button
                    className="flex-1 bg-primary text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    onClick={() => {
                        setCurrentExerciseIndex(idx => idx + 1);
                        setSets([]);
                    }}
                >
                    Siguiente <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default WorkoutLogger;
